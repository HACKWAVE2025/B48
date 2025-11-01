const express = require('express');
const StudySession = require('../models/StudySession');
const SessionInvite = require('../models/SessionInvite');
const Message = require('../models/Message');
const User = require('../models/User');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const path = require('path');
const aiSummaryService = require('../services/aiSummaryService');

const router = express.Router();

// Get all study sessions (scheduled, active, and past)
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const now = new Date();
    
    let query = { isPrivate: false };
    
    if (status) {
      query.status = status;
    }
    
    // If upcoming is requested, filter sessions that haven't ended yet
    if (upcoming === 'true') {
      const sessions = await StudySession.find(query)
        .populate('activeUsers', 'name level avatar')
        .populate('createdBy', 'name level avatar')
        .sort({ date: 1, startTime: 1 });
      
      // Filter out sessions that have ended
      const filteredSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        const [hours, minutes] = session.startTime.split(':').map(Number);
        sessionDate.setHours(hours, minutes, 0, 0);
        const endDate = new Date(sessionDate.getTime() + session.duration * 60000);
        return endDate > now;
      });
      
      return res.json({
        success: true,
        sessions: filteredSessions.map(formatSession)
      });
    }
    
    const sessions = await StudySession.find(query)
      .populate('activeUsers', 'name level avatar')
      .populate('createdBy', 'name level avatar')
      .sort({ date: -1, startTime: -1 });

    res.json({
      success: true,
      sessions: sessions.map(formatSession)
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get a single session by ID
router.get('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await StudySession.findOne({ sessionId })
      .populate('activeUsers', 'name level avatar')
      .populate('createdBy', 'name level avatar');
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    res.json({
      success: true,
      session: formatSession(session)
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get session messages with pagination
router.get('/sessions/:sessionId/messages', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ roomId: sessionId })
      .populate('userId', 'name level avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      messages: messages.reverse(),
      currentPage: parseInt(page),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new study session
router.post('/sessions', authenticateToken, async (req, res) => {
  try {
    const { 
      title, 
      topic, 
      subject, 
      description, 
      date, 
      startTime, 
      duration,
      isPrivate = false, 
      maxUsers = 50,
      tags = [],
      objectives = []
    } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!title || !topic || !subject || !date || !startTime || !duration) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, topic, subject, date, start time, and duration are required' 
      });
    }

    // Validate date is in the future
    const sessionDate = new Date(date);
    const [hours, minutes] = startTime.split(':').map(Number);
    sessionDate.setHours(hours, minutes, 0, 0);
    
    if (sessionDate < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session date and time must be in the future' 
      });
    }

    // Validate duration
    if (duration < 15 || duration > 480) {
      return res.status(400).json({ 
        success: false, 
        message: 'Duration must be between 15 minutes and 8 hours' 
      });
    }

    // Generate unique session ID
    const sessionId = `session_${subject.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

    const session = new StudySession({
      sessionId,
      title: title.trim(),
      topic: topic.trim(),
      subject,
      description: description ? description.trim() : '',
      date: sessionDate,
      startTime,
      duration: parseInt(duration),
      isPrivate: Boolean(isPrivate),
      maxUsers: Math.min(Math.max(parseInt(maxUsers) || 50, 5), 100),
      createdBy: userId,
      activeUsers: [],
      tags: tags.filter(tag => tag && tag.trim()),
      objectives: objectives.filter(obj => obj && obj.trim()),
      status: 'scheduled'
    });

    await session.save();
    await session.populate('createdBy', 'name level avatar');

    res.json({
      success: true,
      message: 'Study session created successfully',
      session: formatSession(session)
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update session status (manually activate or complete)
router.patch('/sessions/:sessionId/status', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const session = await StudySession.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // Only creator can update status
    if (session.createdBy.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the session creator can update status' 
      });
    }

    if (!['scheduled', 'active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    session.status = status;
    if (status === 'completed') {
      session.completedAt = new Date();
    }

    await session.save();
    await session.populate('createdBy', 'name level avatar');
    await session.populate('activeUsers', 'name level avatar');

    res.json({
      success: true,
      message: 'Session status updated',
      session: formatSession(session)
    });
  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a session (only creator can delete)
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await StudySession.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // Check if user is the creator
    if (session.createdBy.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the session creator can delete this session' 
      });
    }

    // Don't allow deletion of active sessions
    if (session.status === 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete an active session. Please complete or cancel it first.' 
      });
    }

    // Delete all messages in the session
    await Message.deleteMany({ roomId: sessionId });

    // Delete the session
    await StudySession.deleteOne({ sessionId });

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's created sessions
router.get('/my-sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const sessions = await StudySession.find({ createdBy: userId })
      .populate('activeUsers', 'name level avatar')
      .sort({ date: -1, startTime: -1 });

    res.json({
      success: true,
      sessions: sessions.map(formatSession)
    });
  } catch (error) {
    console.error('Get my sessions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's joined sessions (active participant)
router.get('/joined-sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const sessions = await StudySession.find({ 
      activeUsers: userId,
      status: { $in: ['scheduled', 'active'] }
    })
      .populate('activeUsers', 'name level avatar')
      .populate('createdBy', 'name level avatar')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      sessions: sessions.map(formatSession)
    });
  } catch (error) {
    console.error('Get joined sessions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Invite users to a session
router.post('/sessions/:sessionId/invite', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userIds, message } = req.body;
    const inviterId = req.user.userId;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User IDs array is required' 
      });
    }

    const session = await StudySession.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // Check if user is the creator or already in the session
    const canInvite = session.createdBy.toString() === inviterId || 
                      session.activeUsers.some(u => u.toString() === inviterId);

    if (!canInvite) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only session creator or participants can invite others' 
      });
    }

    // Check if session has ended
    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot invite to a completed or cancelled session' 
      });
    }

    const inviter = await User.findById(inviterId).select('name');
    const invitedUsers = await User.find({ _id: { $in: userIds } }).select('name email');

    const invites = [];
    const errors = [];

    for (const user of invitedUsers) {
      try {
        // Check if already invited
        const existingInvite = await SessionInvite.findOne({
          sessionIdString: sessionId,
          invitedUser: user._id
        });

        if (existingInvite) {
          errors.push({ userId: user._id, name: user.name, error: 'Already invited' });
          continue;
        }

        // Check if already in session
        if (session.activeUsers.some(u => u.toString() === user._id.toString())) {
          errors.push({ userId: user._id, name: user.name, error: 'Already in session' });
          continue;
        }

        // Create invite
        const invite = new SessionInvite({
          sessionId: session._id,
          sessionIdString: sessionId,
          invitedBy: inviterId,
          invitedUser: user._id,
          message: message || `${inviter.name} invited you to join "${session.title}"`,
          status: 'pending'
        });

        await invite.save();
        invites.push({
          userId: user._id,
          name: user.name,
          inviteId: invite._id
        });
      } catch (error) {
        console.error(`Error inviting user ${user._id}:`, error);
        errors.push({ userId: user._id, name: user.name, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Invited ${invites.length} user(s)`,
      invites,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Invite users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's pending invitations
router.get('/invitations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const invites = await SessionInvite.find({
      invitedUser: userId,
      status: 'pending'
    })
      .populate('invitedBy', 'name avatar level')
      .populate('sessionId')
      .sort({ createdAt: -1 });

    // Filter out invites for completed/cancelled sessions
    const validInvites = invites.filter(invite => 
      invite.sessionId && 
      invite.sessionId.status !== 'completed' && 
      invite.sessionId.status !== 'cancelled'
    );

    // Format the invites
    const formattedInvites = validInvites.map(invite => {
      const session = invite.sessionId;
      return {
        inviteId: invite._id,
        sessionId: invite.sessionIdString,
        session: {
          title: session.title,
          topic: session.topic,
          subject: session.subject,
          description: session.description,
          date: session.date,
          startTime: session.startTime,
          duration: session.duration,
          status: session.status
        },
        invitedBy: invite.invitedBy,
        message: invite.message,
        createdAt: invite.createdAt
      };
    });

    res.json({
      success: true,
      invitations: formattedInvites
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Respond to an invitation
router.post('/invitations/:inviteId/respond', authenticateToken, async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { accept } = req.body;
    const userId = req.user.userId;

    const invite = await SessionInvite.findById(inviteId)
      .populate('sessionId');

    if (!invite) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invitation not found' 
      });
    }

    if (invite.invitedUser.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'This invitation is not for you' 
      });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invitation already responded to' 
      });
    }

    const session = invite.sessionId;

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Session has ended or been cancelled' 
      });
    }

    invite.status = accept ? 'accepted' : 'declined';
    invite.respondedAt = new Date();
    await invite.save();

    res.json({
      success: true,
      message: accept ? 'Invitation accepted' : 'Invitation declined',
      sessionId: invite.sessionIdString,
      accepted: accept
    });
  } catch (error) {
    console.error('Respond to invitation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get session invites (for creator to see who they invited)
router.get('/sessions/:sessionId/invites', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await StudySession.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // Only creator can view invites
    if (session.createdBy.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only session creator can view invitations' 
      });
    }

    const invites = await SessionInvite.find({ sessionIdString: sessionId })
      .populate('invitedUser', 'name avatar level')
      .populate('invitedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      invites: invites.map(inv => ({
        inviteId: inv._id,
        invitedUser: inv.invitedUser,
        invitedBy: inv.invitedBy,
        status: inv.status,
        message: inv.message,
        createdAt: inv.createdAt,
        respondedAt: inv.respondedAt
      }))
    });
  } catch (error) {
    console.error('Get session invites error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Search users to invite
router.get('/users/search', authenticateToken, async (req, res) => {
  try {
    const { query, sessionId } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query must be at least 2 characters' 
      });
    }

    // Find users matching the query
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user.userId } // Exclude current user
    })
      .select('name email avatar level grade')
      .limit(20);

    // If sessionId provided, filter out already invited/joined users
    if (sessionId) {
      const session = await StudySession.findOne({ sessionId });
      const invites = await SessionInvite.find({ 
        sessionIdString: sessionId 
      }).select('invitedUser');

      const invitedUserIds = invites.map(inv => inv.invitedUser.toString());
      const activeUserIds = session ? session.activeUsers.map(u => u.toString()) : [];
      const excludedIds = [...invitedUserIds, ...activeUserIds];

      const filteredUsers = users.filter(user => 
        !excludedIds.includes(user._id.toString())
      );

      return res.json({
        success: true,
        users: filteredUsers
      });
    }

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper function to format session data
function formatSession(session) {
  const sessionObj = session.toObject();
  
  return {
    sessionId: sessionObj.sessionId,
    title: sessionObj.title,
    topic: sessionObj.topic,
    subject: sessionObj.subject,
    description: sessionObj.description,
    date: sessionObj.date,
    startTime: sessionObj.startTime,
    endTime: sessionObj.endTime,
    duration: sessionObj.duration,
    status: sessionObj.status,
    activeUsersCount: sessionObj.activeUsers?.length || 0,
    activeUsers: sessionObj.activeUsers,
    totalMessages: sessionObj.totalMessages,
    maxUsers: sessionObj.maxUsers,
    isPrivate: sessionObj.isPrivate,
    tags: sessionObj.tags,
    objectives: sessionObj.objectives,
    materials: sessionObj.materials,
    isJoinable: sessionObj.isJoinable,
    hasEnded: sessionObj.hasEnded,
    createdAt: sessionObj.createdAt,
    createdBy: sessionObj.createdBy,
    completedAt: sessionObj.completedAt
  };
}

// Upload file to session chat
router.post('/sessions/:sessionId/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { caption } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Determine message type based on MIME type
    let messageType = 'file';
    if (req.file.mimetype.startsWith('image/')) {
      messageType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      messageType = 'video';
    } else if (req.file.mimetype.startsWith('audio/')) {
      messageType = 'audio';
    }

    // Create file URL
    const fileUrl = `/uploads/chat-files/${req.file.filename}`;

    // Create message with file
    const message = new Message({
      content: caption || '',
      userId: req.user.userId,
      roomId: sessionId,
      messageType: messageType,
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      createdAt: new Date()
    });

    await message.save();
    await message.populate('userId', 'name level avatar');

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        _id: message._id,
        content: message.content,
        userId: message.userId,
        roomId: message.roomId,
        messageType: message.messageType,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        fileSize: message.fileSize,
        mimeType: message.mimeType,
        createdAt: message.createdAt
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload file'
    });
  }
});

// Generate AI summary for a session
router.post('/sessions/:sessionId/generate-summary', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await StudySession.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is the creator or was a participant
    const isCreator = session.createdBy.toString() === req.user.userId;
    
    // Check if user was ever a participant (even if session ended and activeUsers was cleared)
    const hasMessages = await Message.exists({ 
      roomId: sessionId, 
      userId: req.user.userId 
    });

    if (!isCreator && !hasMessages) {
      return res.status(403).json({
        success: false,
        message: 'You must be a participant to generate summary'
      });
    }

    // Generate summary
    const summary = await aiSummaryService.generateSessionSummary(sessionId);

    res.json({
      success: true,
      message: 'Summary generated successfully',
      summary: summary
    });

  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate summary'
    });
  }
});

// Get AI summary for a session
router.get('/sessions/:sessionId/summary', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await StudySession.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is the creator or was a participant
    const isCreator = session.createdBy.toString() === req.user.userId;
    
    // Check if user was ever a participant (even if session ended and activeUsers was cleared)
    const hasMessages = await Message.exists({ 
      roomId: sessionId, 
      userId: req.user.userId 
    });

    if (!isCreator && !hasMessages) {
      return res.status(403).json({
        success: false,
        message: 'You must be a participant to view summary'
      });
    }

    // Get summary (will generate if not exists and session is completed)
    const summary = await aiSummaryService.getSessionSummary(sessionId);

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not available yet. Session must be completed first.'
      });
    }

    res.json({
      success: true,
      summary: summary
    });

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get summary'
    });
  }
});

// Get session notes for current user
router.get('/sessions/:sessionId/notes', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await StudySession.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is creator or participant (including completed sessions)
    const isCreator = session.createdBy.toString() === userId;
    const isParticipant = session.activeUsers.some(u => u.toString() === userId);
    
    // Check if user participated in this session (via messages)
    const hasMessages = await Message.exists({ roomId: sessionId, userId });

    // Allow access if user is creator, current participant, or participated in the session
    if (!isCreator && !isParticipant && !hasMessages) {
      return res.status(403).json({
        success: false,
        message: 'You must be a participant to view notes'
      });
    }

    // Find notes for this user and session
    const notes = session.participantNotes?.find(n => n.userId.toString() === userId);

    res.json({
      success: true,
      notes: notes || { content: '', userId, updatedAt: new Date() }
    });

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notes'
    });
  }
});

// Save session notes for current user
router.post('/sessions/:sessionId/notes', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Notes content is required'
      });
    }

    const session = await StudySession.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is creator or participant (including completed sessions)
    const isCreator = session.createdBy.toString() === userId;
    const isParticipant = session.activeUsers.some(u => u.toString() === userId);
    const hasMessages = await Message.exists({ roomId: sessionId, userId });

    // Allow saving if user is creator, current participant, or participated in the session
    if (!isCreator && !isParticipant && !hasMessages) {
      return res.status(403).json({
        success: false,
        message: 'You must be a participant to save notes'
      });
    }

    // Initialize participantNotes array if it doesn't exist
    if (!session.participantNotes) {
      session.participantNotes = [];
    }

    // Find existing notes for this user
    const existingNotesIndex = session.participantNotes.findIndex(
      n => n.userId.toString() === userId
    );

    if (existingNotesIndex !== -1) {
      // Update existing notes
      session.participantNotes[existingNotesIndex].content = content.trim();
      session.participantNotes[existingNotesIndex].updatedAt = new Date();
    } else {
      // Add new notes
      session.participantNotes.push({
        userId,
        content: content.trim(),
        updatedAt: new Date()
      });
    }

    await session.save();

    res.json({
      success: true,
      message: 'Notes saved successfully',
      notes: {
        content: content.trim(),
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Save notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save notes'
    });
  }
});

module.exports = router;


