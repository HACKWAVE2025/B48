import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Send, Video, Users, Clock, BookOpen, 
  Target, Calendar, CheckCircle, User, Crown, UserPlus,
  Paperclip, File, Image, FileVideo, FileAudio, Download, X, Sparkles, Pencil,
  Beaker, MessageSquare, Play, Library, GraduationCap, ExternalLink, Maximize, Minimize,
  Brain, Bot, Loader, Gamepad2, Type, Star, StickyNote, Save,
  GitBranch, FileText
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import VideoCall from './VideoCall';
import InviteUsersModal from './InviteUsersModal';
import SessionSummaryModal from './SessionSummaryModal';
import Whiteboard from './Whiteboard';
import FlowchartGenerator from './FlowchartGenerator';
import resourcesData from '../data/resourcesData';
import { toast } from 'react-hot-toast';
import { api, animationApi } from '../utils/api';

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
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'notes', 'ai-learning'
  const [simulations, setSimulations] = useState([]);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [simulationsLoading, setSimulationsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isSimulationFullscreen, setIsSimulationFullscreen] = useState(false);
  
  // Notes states
  const [sessionNotes, setSessionNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesLastSaved, setNotesLastSaved] = useState(null);
  
  // AI Learning states
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInputMessage, setAiInputMessage] = useState('');
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiResponseType, setAiResponseType] = useState('both'); // 'text', 'animation', 'both'
  const [currentAiSessionId, setCurrentAiSessionId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const aiMessagesEndRef = useRef(null);
  const aiTextareaRef = useRef(null);
  
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  const getBackendUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  };

  // Fetch simulations when switching to simulations tab
  useEffect(() => {
    if (activeTab === 'simulations' && simulations.length === 0) {
      fetchSimulations();
    }
  }, [activeTab]);

  const fetchSimulations = async () => {
    setSimulationsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/simulations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch simulations');
      }

      const data = await response.json();
      setSimulations(data);
    } catch (err) {
      console.error('Error fetching simulations:', err);
    } finally {
      setSimulationsLoading(false);
    }
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

  // Fetch session notes
  const fetchSessionNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();
      
      const response = await fetch(
        `${backendUrl}/api/sessions/sessions/${session.sessionId}/notes`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      if (data.success && data.notes) {
        setSessionNotes(data.notes.content || '');
        setNotesLastSaved(data.notes.updatedAt);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  // Save session notes
  const handleSaveNotes = async () => {
    if (!sessionNotes.trim()) {
      toast.error('Notes cannot be empty');
      return;
    }

    setSavingNotes(true);
    try {
      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();
      
      const response = await fetch(
        `${backendUrl}/api/sessions/sessions/${session.sessionId}/notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: sessionNotes })
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Notes saved successfully!');
        setNotesLastSaved(new Date());
      } else {
        toast.error(data.message || 'Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  // Initialize AI session ID
  useEffect(() => {
    setCurrentAiSessionId(`ai_session_${session?.sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }, [session]);

  // Fetch notes when joining session
  useEffect(() => {
    if (session && connected) {
      fetchSessionNotes();
    }
  }, [session, connected]);

  // AI Learning Functions
  const scrollToBottomAi = () => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiInputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: aiInputMessage.trim(),
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiInputMessage('');
    setAiIsLoading(true);

    try {
      const baseId = Date.now();
      const textMessageId = `${baseId}_text`;
      const animationMessageId = `${baseId}_animation`;
      
      // Get text response
      if (aiResponseType === 'text' || aiResponseType === 'both') {
        try {
          const requestData = {
            message: aiInputMessage.trim()
          };
          
          if (user && user._id && currentAiSessionId) {
            requestData.userId = user._id;
            requestData.sessionId = currentAiSessionId;
          }
          
          const textResponse = await api.post('/api/gemini/chat', requestData);

          if (textResponse.data && textResponse.data.success) {
            const textMessage = {
              id: textMessageId,
              type: 'bot-text',
              content: textResponse.data.response,
              relatedSimulations: textResponse.data.relatedSimulations || [],
              timestamp: new Date()
            };
            setAiMessages(prev => [...prev, textMessage]);
            scrollToBottomAi();
          }
        } catch (error) {
          console.error('Error fetching text response:', error);
          let errorMessage = 'Sorry, I couldn\'t generate a text response right now. Please try again.';
          
          if (error.code === 'ECONNABORTED') {
            errorMessage = 'The request took too long. Please try a simpler question.';
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }
          
          setAiMessages(prev => [...prev, {
            id: textMessageId,
            type: 'bot-text',
            content: errorMessage,
            timestamp: new Date(),
            error: true
          }]);
        }
      }

      // Get animation response
      if (aiResponseType === 'animation' || aiResponseType === 'both') {
        const loadingMessage = {
          id: animationMessageId,
          type: 'bot-animation',
          content: null,
          loading: true,
          prompt: aiInputMessage.trim(),
          timestamp: new Date()
        };
        setAiMessages(prev => [...prev, loadingMessage]);
        scrollToBottomAi();

        animationApi.post('/api/gemini/generate-animation', {
          prompt: aiInputMessage.trim()
        }).then(animationResponse => {
          if (animationResponse.data && animationResponse.data.success) {
            const animationMessage = {
              id: animationMessageId,
              type: 'bot-animation',
              content: animationResponse.data.video_url,
              prompt: aiInputMessage.trim(),
              timestamp: new Date(),
              message: animationResponse.data.message
            };
            
            setAiMessages(prev => prev.map(msg => 
              msg.id === animationMessageId ? animationMessage : msg
            ));
            scrollToBottomAi();
          }
        }).catch(error => {
          console.error('Error fetching animation response:', error);
          
          let errorMessage = 'Failed to generate animation. Please try again.';
          
          if (error.code === 'ECONNABORTED') {
            errorMessage = 'Animation generation timed out. Please try a simpler prompt.';
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }
          
          setAiMessages(prev => prev.map(msg => 
            msg.id === animationMessageId ? {
              id: animationMessageId,
              type: 'bot-animation',
              content: null,
              error: errorMessage,
              timestamp: new Date()
            } : msg
          ));
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setAiMessages(prev => [...prev, {
        id: Date.now() + 3,
        type: 'bot-text',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setAiIsLoading(false);
    }
  };

  const handleAiKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAiSubmit(e);
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
            <p className="text-[#3E5F44] mb-2">{msg.content}</p>
          )}
          <img 
            src={fileUrl} 
            alt={msg.fileName}
            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition border border-[#93DA97]/30"
            onClick={() => window.open(fileUrl, '_blank')}
          />
          <p className="text-[#557063] text-xs mt-1">{msg.fileName}</p>
        </div>
      );
    }

    if (msg.messageType === 'video') {
      return (
        <div className="max-w-md">
          {msg.content && (
            <p className="text-[#3E5F44] mb-2">{msg.content}</p>
          )}
          <video 
            controls 
            className="rounded-lg max-w-full h-auto border border-[#93DA97]/30"
            src={fileUrl}
          >
            Your browser does not support the video tag.
          </video>
          <p className="text-[#557063] text-xs mt-1">{msg.fileName}</p>
        </div>
      );
    }

    if (msg.messageType === 'audio') {
      return (
        <div className="max-w-sm">
          {msg.content && (
            <p className="text-[#3E5F44] mb-2">{msg.content}</p>
          )}
          <audio controls className="w-full" src={fileUrl}>
            Your browser does not support the audio tag.
          </audio>
          <p className="text-[#557063] text-xs mt-1">{msg.fileName}</p>
        </div>
      );
    }

    // Generic file
    return (
      <div className="bg-[#E8FFD7] border border-[#93DA97]/30 rounded-lg p-3 max-w-sm">
        {msg.content && (
          <p className="text-[#3E5F44] mb-2">{msg.content}</p>
        )}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded border border-[#93DA97]/30">
            {getFileIcon(msg.mimeType)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#3E5F44] text-sm truncate">{msg.fileName}</p>
            <p className="text-[#557063] text-xs">{formatFileSize(msg.fileSize)}</p>
          </div>
          <a
            href={fileUrl}
            download={msg.fileName}
            className="p-2 bg-[#5E936C] hover:bg-[#3E5F44] rounded-lg transition"
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
  
  // Allow notes access for active sessions and completed sessions
  const canAccessNotes = session && (session.status === 'active' || session.status === 'completed' || !session.hasEnded);

  // Helper functions for Resources
  const getSubjectIcon = (subjectName) => {
    const iconMap = {
      'Mathematics': BookOpen,
      'Science': Beaker,
      'Physics': Beaker,
      'Chemistry': Beaker,
      'Biology': Beaker,
      'English': BookOpen,
      'History': BookOpen,
      'Geography': BookOpen,
      'Computer Science': BookOpen,
      'Social Science': BookOpen
    };
    return iconMap[subjectName] || BookOpen;
  };

  const getSubjectColor = (subjectName) => {
    const colorMap = {
      'Mathematics': 'from-blue-500 to-cyan-500',
      'Science': 'from-green-500 to-emerald-500',
      'Physics': 'from-purple-500 to-pink-500',
      'Chemistry': 'from-orange-500 to-red-500',
      'Biology': 'from-green-600 to-teal-600',
      'English': 'from-indigo-500 to-purple-500',
      'History': 'from-amber-500 to-orange-500',
      'Geography': 'from-cyan-500 to-blue-500',
      'Computer Science': 'from-gray-700 to-gray-900',
      'Social Science': 'from-pink-500 to-rose-500'
    };
    return colorMap[subjectName] || 'from-[#5E936C] to-[#93DA97]';
  };

  return (
    <div className="bg-white border border-[#93DA97]/30 rounded-xl overflow-hidden flex flex-col shadow-sm" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div className="p-2 border-b border-[#93DA97]/30 bg-gradient-to-r from-[#5E936C] to-[#93DA97]">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={onBack}
            className="text-white/80 hover:text-white transition-colors flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">Back</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-white/20 rounded-full text-white text-xs">
              <Clock className="w-3 h-3" />
              <span>{timeRemaining}</span>
            </div>
            
            {canInteract && (
              <>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title="Invite users"
                >
                  <UserPlus className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowWhiteboard(true)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title="Open Whiteboard"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setShowVideoCall(!showVideoCall)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showVideoCall
                      ? 'bg-green-700 text-white'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  <Video className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Whiteboard button for view-only (completed sessions) */}
            {!canInteract && (
              <button
                onClick={() => setShowWhiteboard(true)}
                className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all flex items-center space-x-1.5"
                title="View Whiteboard"
              >
                <Pencil className="w-3 h-3" />
                <span className="text-xs font-medium">View Whiteboard</span>
              </button>
            )}

            {/* AI Summary Button - Show for completed sessions */}
            {session?.status === 'completed' && (
              <button
                onClick={() => setShowSummaryModal(true)}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all flex items-center space-x-1.5 shadow-sm"
                title="View AI Summary"
              >
                <Sparkles className="w-3 h-3" />
                <span className="text-xs font-medium">AI Summary</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white mb-0.5 truncate">{session?.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[#E8FFD7] text-xs">{session?.topic}</p>
              {session?.objectives && session.objectives.length > 0 && (
                <span className="px-1.5 py-0.5 bg-white/20 rounded text-white text-xs">
                  {session.objectives.length} objective{session.objectives.length !== 1 ? 's' : ''}
                </span>
              )}
              <span className="px-1.5 py-0.5 bg-white/20 rounded text-white text-xs">
                {new Date(session?.date).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {isCreator && (
            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-yellow-500/20 rounded-full text-yellow-300 text-xs ml-2">
              <Crown className="w-3 h-3" />
              <span>Creator</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area with Tabs */}
        <div className={`flex flex-col ${showVideoCall ? 'w-2/3' : 'w-full'}`}>
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-[#93DA97]/30 bg-white overflow-x-auto flex-shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-4 py-2.5 font-medium transition-all duration-200 border-b-2 whitespace-nowrap text-sm ${
                activeTab === 'chat'
                  ? 'border-[#5E936C] text-[#5E936C] bg-[#E8FFD7]/30'
                  : 'border-transparent text-[#557063] hover:bg-[#E8FFD7]/20'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('ai-learning')}
              className={`flex items-center space-x-2 px-4 py-2.5 font-medium transition-all duration-200 border-b-2 whitespace-nowrap text-sm ${
                activeTab === 'ai-learning'
                  ? 'border-[#5E936C] text-[#5E936C] bg-[#E8FFD7]/30'
                  : 'border-transparent text-[#557063] hover:bg-[#E8FFD7]/20'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>AI Learning</span>
              <Sparkles className="w-3 h-3" />
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center space-x-2 px-4 py-2.5 font-medium transition-all duration-200 border-b-2 whitespace-nowrap text-sm ${
                activeTab === 'notes'
                  ? 'border-[#5E936C] text-[#5E936C] bg-[#E8FFD7]/30'
                  : 'border-transparent text-[#557063] hover:bg-[#E8FFD7]/20'
              }`}
            >
              <StickyNote className="w-4 h-4" />
              <span>Notes</span>
            </button>
            <button
              onClick={() => setActiveTab('simulations')}
              className={`flex items-center space-x-2 px-4 py-2.5 font-medium transition-all duration-200 border-b-2 whitespace-nowrap text-sm ${
                activeTab === 'simulations'
                  ? 'border-[#5E936C] text-[#5E936C] bg-[#E8FFD7]/30'
                  : 'border-transparent text-[#557063] hover:bg-[#E8FFD7]/20'
              }`}
            >
              <Beaker className="w-4 h-4" />
              <span>Simulations</span>
              <span className="bg-[#5E936C] text-white text-xs px-1.5 py-0.5 rounded-full">
                {simulations.length || 'New'}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('flowchart')}
              className={`flex items-center space-x-2 px-4 py-2.5 font-medium transition-all duration-200 border-b-2 text-sm ${
                activeTab === 'flowchart'
                  ? 'border-[#5E936C] text-[#5E936C] bg-[#E8FFD7]/30'
                  : 'border-transparent text-[#557063] hover:bg-[#E8FFD7]/20'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Flowchart</span>
              <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                AI
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab('resources');
                setSelectedClass(null);
                setSelectedSubject(null);
                setSelectedLesson(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 font-medium transition-all duration-200 border-b-2 whitespace-nowrap text-sm ${
                activeTab === 'resources'
                  ? 'border-[#5E936C] text-[#5E936C] bg-[#E8FFD7]/30'
                  : 'border-transparent text-[#557063] hover:bg-[#E8FFD7]/20'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Resources</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'chat' && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-[#E8FFD7]/30 to-white">
            {messages.map((msg, index) => (
              <div
                key={msg._id || index}
                className={`flex items-start space-x-3 ${
                  msg.isSystem ? 'justify-center' : ''
                }`}
              >
                {msg.isSystem ? (
                  <div className="text-[#557063] text-sm italic">{msg.message}</div>
                ) : (
                  <>
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(msg.userId?.name || 'U')} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                      {msg.userId?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[#3E5F44] font-medium text-sm">
                          {msg.userId?.name || 'Unknown'}
                        </span>
                        <span className="text-[#557063]/60 text-xs">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      {msg.messageType && msg.messageType !== 'text' && msg.messageType !== 'system' ? (
                        renderFileMessage(msg)
                      ) : (
                        <div className="bg-white border border-[#93DA97]/30 rounded-lg px-3 py-2 text-[#3E5F44] shadow-sm">
                          {msg.content || msg.message}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {typingUsers.size > 0 && (
              <div className="text-[#557063] text-sm italic">
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {canInteract ? (
            <div className="p-2 border-t border-[#93DA97]/30 bg-white">
              {/* File Preview */}
              {selectedFile && (
                <div className="mb-2 p-2 bg-[#E8FFD7] rounded-lg border border-[#93DA97]/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-[#5E936C]/30 rounded">
                        {getFileIcon(selectedFile.type)}
                      </div>
                      <div>
                        <p className="text-[#3E5F44] text-xs font-medium">{selectedFile.name}</p>
                        <p className="text-[#557063] text-xs">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleCancelFile}
                      className="p-1 hover:bg-white rounded transition"
                    >
                      <X className="w-3 h-3 text-[#557063]" />
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
                  className="bg-[#E8FFD7] hover:bg-[#93DA97]/30 text-[#3E5F44] p-2 rounded-lg transition-all border border-[#93DA97]/30"
                  disabled={!connected || uploading}
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder={selectedFile ? "Add a caption (optional)..." : "Type your message..."}
                  className="flex-1 bg-white border border-[#93DA97]/30 rounded-lg px-3 py-2 text-[#3E5F44] text-sm placeholder-[#557063]/50 focus:outline-none focus:border-[#5E936C]"
                  disabled={!connected || uploading}
                />
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedFile) || !connected || uploading}
                  className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#3E5F44] hover:to-[#5E936C] disabled:from-gray-400 disabled:to-gray-500 text-white p-2 rounded-lg transition-all disabled:cursor-not-allowed min-w-[44px] flex items-center justify-center shadow-sm"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="p-2 border-t border-[#93DA97]/30 bg-white">
              <div className="text-center mb-2">
                <p className="text-[#557063] text-xs mb-2">This session has ended. You can view the chat history.</p>
                <button
                  onClick={() => setShowSummaryModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white text-sm font-medium transition-all flex items-center space-x-2 mx-auto shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View AI Summary</span>
                </button>
              </div>
            </div>
          )}
          </>
          )}

          {activeTab === 'simulations' && (
            // Simulations Tab Content
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#E8FFD7]/30 to-white">
              {selectedSimulation ? (
                // Simulation Viewer
                <div className={`${isSimulationFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'} flex flex-col`}>
                  <div className="p-4 border-b border-[#93DA97]/30 bg-[#E8FFD7] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedSimulation(null);
                          setIsSimulationFullscreen(false);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 transition-all duration-200"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back</span>
                      </button>
                      <div>
                        <h3 className="text-lg font-bold text-[#3E5F44]">{selectedSimulation.title}</h3>
                        <p className="text-[#557063] text-sm">{selectedSimulation.subject} • {selectedSimulation.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsSimulationFullscreen(!isSimulationFullscreen)}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#5E936C] hover:bg-[#3E5F44] rounded-lg text-white transition-all duration-200 shadow-sm"
                      title={isSimulationFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                      {isSimulationFullscreen ? (
                        <>
                          <Minimize className="w-4 h-4" />
                          <span className="text-sm">Exit Fullscreen</span>
                        </>
                      ) : (
                        <>
                          <Maximize className="w-4 h-4" />
                          <span className="text-sm">Fullscreen</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <iframe
                      src={selectedSimulation.iframeUrl}
                      title={selectedSimulation.title}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                // Simulations Grid
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[#3E5F44] mb-2 flex items-center space-x-2">
                      <Beaker className="w-6 h-6" />
                      <span>Interactive Simulations</span>
                    </h3>
                    <p className="text-[#557063]">
                      Collaborate and learn together with interactive simulations
                    </p>
                  </div>

                  {simulationsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-[#5E936C]/30 border-t-[#5E936C] rounded-full animate-spin" />
                    </div>
                  ) : simulations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {simulations.slice(0, 12).map((simulation) => (
                        <div
                          key={simulation._id}
                          className="group p-5 bg-white hover:bg-[#E8FFD7] border border-[#93DA97]/30 hover:border-[#5E936C] rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer"
                          onClick={() => setSelectedSimulation(simulation)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                              <Play className="w-5 h-5 text-white" />
                            </div>
                            <span className="px-2 py-1 bg-[#E8FFD7] border border-[#93DA97]/50 text-[#557063] text-xs font-medium rounded-full">
                              {simulation.subject}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-[#3E5F44] mb-2 group-hover:text-[#5E936C] transition-colors duration-200">
                            {simulation.title}
                          </h4>
                          <p className="text-[#557063] text-sm mb-3 line-clamp-2">
                            {simulation.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{simulation.category}</span>
                            <button className="flex items-center space-x-1 text-[#5E936C] hover:text-[#3E5F44] font-medium">
                              <Play className="w-3 h-3" />
                              <span>Launch</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Beaker className="w-16 h-16 text-gray-300 mb-4" />
                      <h4 className="text-lg font-semibold text-[#557063] mb-2">
                        No simulations available
                      </h4>
                      <p className="text-gray-500">
                        Check back later for interactive learning experiences
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'flowchart' && (
            <FlowchartGenerator sessionId={session?.sessionId} />
          )}

          {activeTab === 'resources' && (
            // Resources Tab Content
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#E8FFD7]/30 to-white">
              {selectedLesson ? (
                // Lesson Resources View
                <div className="p-6">
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 transition-all duration-200 mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Lessons</span>
                  </button>
                  
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[#3E5F44] mb-2">{selectedLesson.title}</h3>
                    <p className="text-[#557063]">Class {selectedClass} - {selectedSubject.name}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Textbook */}
                    <div className="bg-white border border-[#93DA97]/30 hover:border-blue-500 rounded-xl p-6 transition-all duration-200 hover:shadow-md">
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-full shadow-sm mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                          <FileText className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-[#3E5F44] mb-3">Textbook</h4>
                        <p className="text-[#557063] text-sm mb-4">Official curriculum textbook</p>
                        <a
                          href={selectedLesson.resources.textbook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open</span>
                        </a>
                      </div>
                    </div>

                    {/* Video */}
                    <div className="bg-white border border-[#93DA97]/30 hover:border-red-500 rounded-xl p-6 transition-all duration-200 hover:shadow-md">
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 rounded-full shadow-sm mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                          <Video className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-[#3E5F44] mb-3">Video Lesson</h4>
                        <p className="text-[#557063] text-sm mb-4">Interactive video explanation</p>
                        <a
                          href={selectedLesson.resources.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium"
                        >
                          <Play className="w-4 h-4" />
                          <span>Watch</span>
                        </a>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white border border-[#93DA97]/30 hover:border-[#5E936C] rounded-xl p-6 transition-all duration-200 hover:shadow-md">
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] p-4 rounded-full shadow-sm mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                          <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-[#3E5F44] mb-3">Study Notes</h4>
                        <p className="text-[#557063] text-sm mb-4">Comprehensive notes</p>
                        <button
                          className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#5E936C] to-[#93DA97] text-white px-4 py-2 rounded-lg hover:from-[#3E5F44] hover:to-[#5E936C] transition-all duration-200 text-sm font-medium opacity-50 cursor-not-allowed"
                        >
                          <Download className="w-4 h-4" />
                          <span>Coming Soon</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedSubject ? (
                // Lessons View
                <div className="p-6">
                  <button
                    onClick={() => setSelectedSubject(null)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 transition-all duration-200 mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Subjects</span>
                  </button>
                  
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[#3E5F44] mb-2 flex items-center space-x-2">
                      <Library className="w-6 h-6" />
                      <span>Class {selectedClass} - {selectedSubject.name}</span>
                    </h3>
                    <p className="text-[#557063]">Choose a lesson to access resources</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedSubject.lessons.map((lesson, index) => {
                      const colorClass = getSubjectColor(selectedSubject.name);
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedLesson(lesson)}
                          className="bg-white border border-[#93DA97]/30 hover:border-[#5E936C] rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`bg-gradient-to-r ${colorClass} p-2.5 rounded-lg shadow-sm shrink-0`}>
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-base font-bold text-[#3E5F44] mb-2 leading-tight">
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-[#557063]">
                                <div className="flex items-center space-x-1">
                                  <FileText className="w-3 h-3" />
                                  <span>PDF</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Video className="w-3 h-3" />
                                  <span>Video</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Download className="w-3 h-3" />
                                  <span>Notes</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : selectedClass ? (
                // Subjects View
                <div className="p-6">
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 transition-all duration-200 mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Classes</span>
                  </button>
                  
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[#3E5F44] mb-2 flex items-center space-x-2">
                      <Library className="w-6 h-6" />
                      <span>Class {selectedClass} - Subjects</span>
                    </h3>
                    <p className="text-[#557063]">Select a subject to explore lessons</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {resourcesData && resourcesData[selectedClass] && resourcesData[selectedClass].subjects.map((subject) => {
                      const IconComponent = getSubjectIcon(subject.name);
                      const colorClass = getSubjectColor(subject.name);
                      return (
                        <div
                          key={subject.name}
                          onClick={() => setSelectedSubject(subject)}
                          className="bg-white border border-[#93DA97]/30 hover:border-[#5E936C] rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md text-center"
                        >
                          <div className={`bg-gradient-to-r ${colorClass} p-4 rounded-full shadow-sm mx-auto mb-3 w-16 h-16 flex items-center justify-center`}>
                            <IconComponent className="w-7 h-7 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-[#3E5F44] mb-2">{subject.name}</h4>
                          <p className="text-[#557063] text-sm">{subject.lessons.length} lessons</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Classes View
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[#3E5F44] mb-2 flex items-center space-x-2">
                      <Library className="w-6 h-6" />
                      <span>Learning Resources</span>
                    </h3>
                    <p className="text-[#557063]">Access textbooks, videos, and study materials together</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {resourcesData && Object.keys(resourcesData).map((classNum) => (
                      <div
                        key={classNum}
                        onClick={() => setSelectedClass(classNum)}
                        className="bg-white border border-[#93DA97]/30 hover:border-[#5E936C] rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md text-center"
                      >
                        <div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] p-5 rounded-full shadow-sm mx-auto mb-3 w-16 h-16 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{classNum}</span>
                        </div>
                        <h4 className="text-lg font-bold text-[#3E5F44] mb-2">Class {classNum}</h4>
                        <p className="text-[#557063] text-sm">
                          {resourcesData[classNum].subjects.length} subjects
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Learning Tab */}
          {activeTab === 'ai-learning' && (
            <div className="flex flex-col flex-1 overflow-hidden h-full">
              {/* AI Response Type Selector */}
              <div className="p-2.5 border-b border-[#93DA97]/30 bg-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-[#5E936C]" />
                  <span className="text-sm font-medium text-[#3E5F44]">AI Learning Assistant</span>
                </div>
                <div className="flex items-center space-x-1 bg-[#E8FFD7]/50 rounded-lg p-1">
                  <button
                    onClick={() => setAiResponseType('text')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      aiResponseType === 'text'
                        ? 'bg-[#5E936C] text-white shadow-sm'
                        : 'text-[#557063] hover:text-[#3E5F44] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <Type className="w-3 h-3" />
                      <span>Text</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setAiResponseType('animation')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      aiResponseType === 'animation'
                        ? 'bg-[#5E936C] text-white shadow-sm'
                        : 'text-[#557063] hover:text-[#3E5F44] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <Video className="w-3 h-3" />
                      <span>Animation</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setAiResponseType('both')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      aiResponseType === 'both'
                        ? 'bg-gradient-to-r from-[#5E936C] to-[#93DA97] text-white shadow-sm'
                        : 'text-[#557063] hover:text-[#3E5F44] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Magic</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* AI Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-[#E8FFD7]/30 to-white">
                {aiMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4 max-w-2xl px-6">
                      <div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] p-6 rounded-full shadow-lg mx-auto w-20 h-20 flex items-center justify-center">
                        <Brain className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#3E5F44]">AI Learning Assistant</h3>
                      <p className="text-[#557063] leading-relaxed">
                        Ask questions about {session?.subject || 'any topic'} and get instant answers with optional video animations!
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                        <div className="bg-white border border-[#93DA97]/30 rounded-lg p-3 text-center">
                          <Type className="w-6 h-6 text-[#5E936C] mx-auto mb-2" />
                          <p className="text-xs text-[#557063]">Text Explanations</p>
                        </div>
                        <div className="bg-white border border-[#93DA97]/30 rounded-lg p-3 text-center">
                          <Video className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                          <p className="text-xs text-[#557063]">Video Animations</p>
                        </div>
                        <div className="bg-white border border-[#93DA97]/30 rounded-lg p-3 text-center">
                          <Gamepad2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                          <p className="text-xs text-[#557063]">Related Simulations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  aiMessages.map((message) => {
                    const isUser = message.type === 'user';
                    
                    return (
                      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start space-x-3 max-w-4xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {/* Avatar */}
                          <div className={`p-2.5 rounded-full shadow-sm flex-shrink-0 ${
                            isUser 
                              ? 'bg-gradient-to-r from-[#5E936C] to-[#93DA97]' 
                              : message.type === 'bot-animation'
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                              : 'bg-gradient-to-r from-[#5E936C] to-emerald-500'
                          }`}>
                            {isUser ? (
                              <User className="w-4 h-4 text-white" />
                            ) : message.type === 'bot-animation' ? (
                              <Video className="w-4 h-4 text-white" />
                            ) : (
                              <Brain className="w-4 h-4 text-white" />
                            )}
                          </div>

                          {/* Message Content */}
                          <div className={`border rounded-2xl p-5 shadow-sm ${
                            isUser
                              ? 'bg-[#E8FFD7] border-[#93DA97] text-[#3E5F44]'
                              : message.error
                              ? 'bg-red-50 border-red-300 text-red-700'
                              : 'bg-white border-[#93DA97]/30 text-[#3E5F44]'
                          }`}>
                            {message.type === 'bot-animation' && message.loading ? (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2 text-blue-600 mb-3">
                                  <Video className="w-4 h-4" />
                                  <span className="text-sm font-medium">Generating Animation...</span>
                                </div>
                                <div className="flex items-center justify-center p-8 border border-blue-300 rounded-2xl bg-blue-50">
                                  <div className="text-center space-y-3">
                                    <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                                    <p className="text-blue-600 text-sm">Creating your animated visualization...</p>
                                    <p className="text-blue-500 text-xs">This may take 1-2 minutes</p>
                                  </div>
                                </div>
                              </div>
                            ) : message.type === 'bot-animation' && message.content ? (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2 text-blue-600 mb-3">
                                  <Video className="w-4 h-4" />
                                  <span className="text-sm font-medium">Animation Response</span>
                                </div>
                                {message.message && (
                                  <p className="text-blue-700 text-sm mb-3 italic">"{message.message}"</p>
                                )}
                                <video 
                                  controls 
                                  className="w-full rounded-2xl border border-blue-300"
                                  style={{ maxHeight: '500px' }}
                                >
                                  <source src={message.content} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                                <div className="flex space-x-2">
                                  <a 
                                    href={message.content} 
                                    download
                                    className="flex items-center space-x-2 bg-[#E8FFD7] hover:bg-[#93DA97]/30 border border-[#93DA97] rounded-xl px-3 py-2 text-[#3E5F44] transition-all duration-200 text-sm"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                  </a>
                                </div>
                              </div>
                            ) : message.type === 'bot-animation' && message.error ? (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-red-600 mb-2">
                                  <Video className="w-4 h-4" />
                                  <span className="text-sm font-medium">Animation Error</span>
                                </div>
                                <p className="text-red-600 text-sm">{message.error}</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {!isUser && (
                                  <div className="flex items-center space-x-2 text-[#5E936C] mb-2">
                                    <Type className="w-4 h-4" />
                                    <span className="text-sm font-medium">Text Response</span>
                                  </div>
                                )}
                                <p className="whitespace-pre-wrap leading-relaxed text-sm">
                                  {message.content}
                                </p>
                                
                                {/* Related Simulations */}
                                {!isUser && message.relatedSimulations && message.relatedSimulations.length > 0 && (
                                  <div className="mt-4 space-y-3">
                                    <div className="flex items-center space-x-2 text-[#5E936C]">
                                      <Gamepad2 className="w-4 h-4" />
                                      <span className="text-sm font-medium">Related Simulations</span>
                                    </div>
                                    <div className="space-y-2">
                                      {message.relatedSimulations.map((simulation, index) => (
                                        <div key={index} className="bg-[#E8FFD7]/50 border border-[#93DA97] rounded-xl p-3 hover:bg-[#E8FFD7] transition-all duration-200">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <h4 className="font-medium text-[#3E5F44] text-sm">{simulation.title}</h4>
                                              <p className="text-xs text-[#557063] mt-1">{simulation.subject} • {simulation.category}</p>
                                            </div>
                                            <a
                                              href={simulation.iframeUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="ml-3 bg-[#5E936C] hover:bg-[#3E5F44] rounded-lg px-3 py-1 text-xs text-white transition-all duration-200 flex items-center space-x-1"
                                            >
                                              <Play className="w-3 h-3" />
                                              <span>Try</span>
                                            </a>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Timestamp */}
                            <div className="mt-3 text-xs opacity-60">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={aiMessagesEndRef} />
              </div>

              {/* AI Input */}
              <div className="p-3 border-t border-[#93DA97]/30 bg-white flex-shrink-0">
                <form onSubmit={handleAiSubmit} className="flex space-x-2">
                  <textarea
                    ref={aiTextareaRef}
                    value={aiInputMessage}
                    onChange={(e) => setAiInputMessage(e.target.value)}
                    onKeyPress={handleAiKeyPress}
                    placeholder="Ask me anything about the topic..."
                    className="flex-1 bg-white border border-[#93DA97]/30 rounded-lg px-4 py-2.5 text-[#3E5F44] placeholder-[#557063]/50 focus:outline-none focus:border-[#5E936C] resize-none"
                    rows="2"
                    disabled={aiIsLoading || !canInteract}
                  />
                  <button
                    type="submit"
                    disabled={!aiInputMessage.trim() || aiIsLoading || !canInteract}
                    className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#3E5F44] hover:to-[#5E936C] disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                  >
                    {aiIsLoading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-[#E8FFD7]/30 to-white">
                <div className="max-w-6xl mx-auto h-full">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#3E5F44] mb-1">
                        {session?.status === 'completed' ? 'Session Notes (Completed)' : 'Session Notes'}
                      </h3>
                      <p className="text-sm text-[#557063]">
                        {session?.status === 'completed' 
                          ? 'Your notes from this completed session. You can still view and edit them.'
                          : 'Take notes during the session. Your notes are automatically linked to this session.'
                        }
                      </p>
                      {notesLastSaved && (
                        <p className="text-xs text-[#557063]/70 mt-1">
                          Last saved: {new Date(notesLastSaved).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes || !sessionNotes.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#3E5F44] hover:to-[#5E936C] disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all shadow-sm disabled:cursor-not-allowed"
                      title={session?.status === 'completed' ? 'Save notes (session completed)' : 'Save notes'}
                    >
                      {savingNotes ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Notes</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Start taking notes here...&#10;&#10;You can use this space to:&#10;• Write down key points from the discussion&#10;• Save important links or resources&#10;• Track action items&#10;• Summarize what you learned"
                    className="w-full p-4 bg-white border-2 border-[#93DA97]/30 rounded-lg text-[#3E5F44] placeholder-[#557063]/50 focus:outline-none focus:border-[#5E936C] resize-none font-mono text-sm"
                    style={{ height: 'calc(100vh - 400px)', minHeight: '400px' }}
                    disabled={session?.status === 'scheduled'}
                  />
                  
                  {session?.status === 'scheduled' && (
                    <p className="text-sm text-[#557063] mt-2 text-center italic">
                      Session has not started yet. Notes will be editable once the session starts.
                    </p>
                  )}
                  
                  {session?.status === 'completed' && (
                   
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-blue-700">
                        <CheckCircle className="w-4 h-4" />
                        <p className="text-sm">
                          This session has been completed. Your notes have been preserved and you can still edit them.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Call */}
        {showVideoCall && canInteract && (
          <div className="w-1/3 border-l border-[#93DA97]/30">
            <VideoCall roomId={session?.sessionId} />
          </div>
        )}

        {/* Participants Sidebar - Show when not in video call */}
        {!showVideoCall && (
          <div className="w-64 border-l border-[#93DA97]/30 p-4 overflow-y-auto bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#3E5F44] font-semibold flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Participants</span>
              </h3>
              <span className="text-[#557063] text-sm">{activeUsers.length}/{session?.maxUsers}</span>
            </div>
            
            {/* Learning Objectives */}
            {session?.objectives && session.objectives.length > 0 && (
              <div className="mb-4 pb-4 border-b border-[#93DA97]/30">
                <h4 className="text-[#3E5F44] text-sm font-medium mb-2 flex items-center space-x-1">
                  <Target className="w-3 h-3" />
                  <span>Objectives</span>
                </h4>
                <ul className="space-y-1">
                  {session.objectives.map((obj, index) => (
                    <li key={index} className="text-[#557063] text-xs flex items-start space-x-2">
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
                  className="flex items-center space-x-2 p-2 bg-[#E8FFD7]/50 hover:bg-[#E8FFD7] border border-[#93DA97]/30 rounded-lg transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full ${getAvatarColor(participant.name)} flex items-center justify-center text-white font-semibold text-sm`}>
                    {participant.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#3E5F44] text-sm truncate">{participant.name}</p>
                    <p className="text-[#557063] text-xs">Level {participant.level || 1}</p>
                  </div>
                  {participant._id === session?.createdBy?._id && (
                    <Crown className="w-4 h-4 text-yellow-500" />
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

      {/* AI Summary Modal */}
      <SessionSummaryModal
        session={session}
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
      />

      {/* Whiteboard Modal */}
      {showWhiteboard && (
        <Whiteboard
          sessionId={session?.sessionId}
          onClose={() => setShowWhiteboard(false)}
          isViewOnly={!canInteract}
        />
      )}
    </div>
  );
};

export default StudySessionRoom;
