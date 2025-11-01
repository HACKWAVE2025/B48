import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Send, Video, Users, Clock, BookOpen, 
  Target, Calendar, CheckCircle, User, Crown, UserPlus,
  Paperclip, File, Image, FileText, FileVideo, FileAudio, Download, X
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import VideoCall from './VideoCall';
import InviteUsersModal from './InviteUsersModal';

const StudySessionRoom = ({ session, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [sessionStatus, setSessionStatus] = useState(session?.status || 'scheduled');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  const getBackendUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  };

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      if (!session) return;

      const now = new Date();
      const sessionDate = new Date(session.date);
      const [hours, minutes] = session.startTime.split(':').map(Number);
      sessionDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(sessionDate.getTime() + session.duration * 60000);

      if (now < sessionDate) {
        const diff = sessionDate - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`Starts in ${hours}h ${mins}m`);
      } else if (now >= sessionDate && now < endDate) {
        const diff = endDate - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${mins}m remaining`);
      } else {
        setTimeRemaining('Session ended');
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [session]);

  // Join session on mount
  useEffect(() => {
    if (socket && connected && session) {
      console.log('Joining session:', session.sessionId);
      socket.emit('join_session', { sessionId: session.sessionId });

      // Fetch existing messages
      fetchMessages();
    }

    return () => {
      if (socket && session) {
        console.log('Leaving session:', session.sessionId);
        socket.emit('leave_session', { sessionId: session.sessionId });
      }
    };
  }, [socket, connected, session]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleSessionJoined = (data) => {
      console.log('Session joined:', data);
      setActiveUsers(data.activeUsers || []);
      setSessionStatus(data.status);
    };

    const handleUserJoinedSession = (data) => {
      console.log('User joined session:', data);
      setActiveUsers(prev => [...prev, data.user]);
      
      // Add system message
      const systemMessage = {
        _id: Date.now(),
        userId: { name: 'System', avatar: '' },
        message: `${data.user.name} joined the session`,
        createdAt: new Date(),
        isSystem: true
      };
      setMessages(prev => [...prev, systemMessage]);
    };

    const handleUserLeftSession = (data) => {
      console.log('User left session:', data);
      setActiveUsers(prev => prev.filter(u => u._id !== data.userId));
      
      // Add system message
      const systemMessage = {
        _id: Date.now(),
        userId: { name: 'System', avatar: '' },
        message: `${data.userName} left the session`,
        createdAt: new Date(),
        isSystem: true
      };
      setMessages(prev => [...prev, systemMessage]);
    };

    const handleNewMessage = (data) => {
      console.log('New message received:', data);
      setMessages(prev => [...prev, data]);
      scrollToBottom();
    };

    const handleFileUploaded = (data) => {
      console.log('File uploaded by another user:', data);
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
    };

    const handleTypingStart = (data) => {
      if (data.userId !== user?.userId) {
        setTypingUsers(prev => new Set(prev).add(data.userName));
      }
    };

    const handleTypingStop = (data) => {
      if (data.userId !== user?.userId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userName);
          return newSet;
        });
      }
    };

    socket.on('session_joined', handleSessionJoined);
    socket.on('user_joined_session', handleUserJoinedSession);
    socket.on('user_left_session', handleUserLeftSession);
    socket.on('new_message', handleNewMessage);
    socket.on('file_uploaded', handleFileUploaded);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    return () => {
      socket.off('session_joined', handleSessionJoined);
      socket.off('user_joined_session', handleUserJoinedSession);
      socket.off('user_left_session', handleUserLeftSession);
      socket.off('new_message', handleNewMessage);
      socket.off('file_uploaded', handleFileUploaded);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
    };
  }, [socket, user]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();
      
      const response = await fetch(
        `${backendUrl}/api/sessions/sessions/${session.sessionId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket || !connected) return;

    socket.emit('send_message', {
      roomId: session.sessionId,
      content: newMessage.trim()
    });

    setNewMessage('');
    handleTypingStop();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (newMessage.trim()) {
        formData.append('caption', newMessage.trim());
      }

      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();

      const response = await fetch(
        `${backendUrl}/api/sessions/sessions/${session.sessionId}/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const result = await response.json();

      if (result.success) {
        // Add message to local state
        setMessages(prev => [...prev, result.data]);
        
        // Broadcast file message via socket
        if (socket && connected) {
          socket.emit('file_uploaded', {
            roomId: session.sessionId,
            message: result.data
          });
        }

        // Clear inputs
        setSelectedFile(null);
        setNewMessage('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        scrollToBottom();
      } else {
        alert(result.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="w-5 h-5" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="w-5 h-5" />;
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderFileMessage = (msg) => {
    const backendUrl = getBackendUrl();
    const fileUrl = `${backendUrl}${msg.fileUrl}`;

    if (msg.messageType === 'image') {
      return (
        <div className="max-w-sm">
          {msg.content && (
            <p className="text-white mb-2">{msg.content}</p>
          )}
          <img 
            src={fileUrl} 
            alt={msg.fileName}
            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition"
            onClick={() => window.open(fileUrl, '_blank')}
          />
          <p className="text-white/60 text-xs mt-1">{msg.fileName}</p>
        </div>
      );
    }

    if (msg.messageType === 'video') {
      return (
        <div className="max-w-md">
          {msg.content && (
            <p className="text-white mb-2">{msg.content}</p>
          )}
          <video 
            controls 
            className="rounded-lg max-w-full h-auto"
            src={fileUrl}
          >
            Your browser does not support the video tag.
          </video>
          <p className="text-white/60 text-xs mt-1">{msg.fileName}</p>
        </div>
      );
    }

    if (msg.messageType === 'audio') {
      return (
        <div className="max-w-sm">
          {msg.content && (
            <p className="text-white mb-2">{msg.content}</p>
          )}
          <audio controls className="w-full" src={fileUrl}>
            Your browser does not support the audio tag.
          </audio>
          <p className="text-white/60 text-xs mt-1">{msg.fileName}</p>
        </div>
      );
    }

    // Generic file
    return (
      <div className="bg-white/5 rounded-lg p-3 max-w-sm">
        {msg.content && (
          <p className="text-white mb-2">{msg.content}</p>
        )}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded">
            {getFileIcon(msg.mimeType)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm truncate">{msg.fileName}</p>
            <p className="text-white/60 text-xs">{formatFileSize(msg.fileSize)}</p>
          </div>
          <a
            href={fileUrl}
            download={msg.fileName}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            <Download className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>
    );
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && socket && connected) {
      setIsTyping(true);
      socket.emit('typing_start', { roomId: session.sessionId });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 1000);
  };

  const handleTypingStop = () => {
    if (isTyping && socket && connected) {
      setIsTyping(false);
      socket.emit('typing_stop', { roomId: session.sessionId });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const canInteract = session && !session.hasEnded;
  const isCreator = session?.createdBy?._id === user?.userId || session?.createdBy === user?.userId;

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
      {/* Header */}
      <div className="p-4 border-b border-white/20 bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="text-white/60 hover:text-white transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
              <Clock className="w-4 h-4" />
              <span>{timeRemaining}</span>
            </div>
            
            {canInteract && (
              <>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Invite users"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setShowVideoCall(!showVideoCall)}
                  className={`p-2 rounded-lg transition-colors ${
                    showVideoCall
                      ? 'bg-green-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Video className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{session?.title}</h2>
            <p className="text-purple-300 mb-2">{session?.topic}</p>
            {session?.description && (
              <p className="text-white/70 text-sm">{session.description}</p>
            )}
          </div>
          
          {isCreator && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 rounded-full text-yellow-300 text-xs">
              <Crown className="w-3 h-3" />
              <span>Creator</span>
            </div>
          )}
        </div>

        {/* Session Info */}
        <div className="flex flex-wrap gap-2 mt-3">
          {session?.objectives && session.objectives.length > 0 && (
            <div className="flex items-center space-x-1 px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs">
              <Target className="w-3 h-3" />
              <span>{session.objectives.length} objective{session.objectives.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="flex items-center space-x-1 px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs">
            <Calendar className="w-3 h-3" />
            <span>{new Date(session?.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs">
            <Clock className="w-3 h-3" />
            <span>{session?.startTime} ({session?.duration}m)</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className={`flex flex-col ${showVideoCall ? 'w-2/3' : 'w-full'}`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg._id || index}
                className={`flex items-start space-x-3 ${
                  msg.isSystem ? 'justify-center' : ''
                }`}
              >
                {msg.isSystem ? (
                  <div className="text-white/50 text-sm italic">{msg.message}</div>
                ) : (
                  <>
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(msg.userId?.name || 'U')} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                      {msg.userId?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium text-sm">
                          {msg.userId?.name || 'Unknown'}
                        </span>
                        <span className="text-white/40 text-xs">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      {msg.messageType && msg.messageType !== 'text' && msg.messageType !== 'system' ? (
                        renderFileMessage(msg)
                      ) : (
                        <div className="bg-white/10 rounded-lg px-3 py-2 text-white">
                          {msg.content || msg.message}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {typingUsers.size > 0 && (
              <div className="text-white/50 text-sm italic">
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {canInteract ? (
            <div className="p-4 border-t border-white/20">
              {/* File Preview */}
              {selectedFile && (
                <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-600/30 rounded">
                        {getFileIcon(selectedFile.type)}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-white/60 text-xs">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleCancelFile}
                      className="p-1 hover:bg-white/10 rounded transition"
                    >
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>
              )}
              
              <form onSubmit={selectedFile ? (e) => { e.preventDefault(); handleFileUpload(); } : handleSendMessage} className="flex space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all"
                  disabled={!connected || uploading}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder={selectedFile ? "Add a caption (optional)..." : "Type your message..."}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  disabled={!connected || uploading}
                />
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedFile) || !connected || uploading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-3 rounded-lg transition-all disabled:cursor-not-allowed min-w-[52px] flex items-center justify-center"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="p-4 border-t border-white/20 text-center">
              <p className="text-white/60 text-sm">This session has ended. You can view the chat history.</p>
            </div>
          )}
        </div>

        {/* Video Call */}
        {showVideoCall && canInteract && (
          <div className="w-1/3 border-l border-white/20">
            <VideoCall roomId={session?.sessionId} />
          </div>
        )}

        {/* Participants Sidebar - Show when not in video call */}
        {!showVideoCall && (
          <div className="w-64 border-l border-white/20 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Participants</span>
              </h3>
              <span className="text-white/60 text-sm">{activeUsers.length}/{session?.maxUsers}</span>
            </div>
            
            {/* Learning Objectives */}
            {session?.objectives && session.objectives.length > 0 && (
              <div className="mb-4 pb-4 border-b border-white/10">
                <h4 className="text-white/80 text-sm font-medium mb-2 flex items-center space-x-1">
                  <Target className="w-3 h-3" />
                  <span>Objectives</span>
                </h4>
                <ul className="space-y-1">
                  {session.objectives.map((obj, index) => (
                    <li key={index} className="text-white/60 text-xs flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Active Users */}
            <div className="space-y-2">
              {activeUsers.map((participant) => (
                <div
                  key={participant._id}
                  className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg"
                >
                  <div className={`w-8 h-8 rounded-full ${getAvatarColor(participant.name)} flex items-center justify-center text-white font-semibold text-sm`}>
                    {participant.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{participant.name}</p>
                    <p className="text-white/60 text-xs">Level {participant.level || 1}</p>
                  </div>
                  {participant._id === session?.createdBy?._id && (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <InviteUsersModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        session={session}
      />
    </div>
  );
};

export default StudySessionRoom;
