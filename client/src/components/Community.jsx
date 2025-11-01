import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle, Users, Trophy, Plus, Video, Calendar } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import RoomList from './RoomList';
import ChatRoom from './ChatRoom';
import CreateRoomModal from './CreateRoomModal';
import SessionList from './SessionList';
import StudySessionRoom from './StudySessionRoom';
import CreateSessionModal from './CreateSessionModal';
import Leaderboard from './Leaderboard';

const Community = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userGrade, setUserGrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createRoomModalOpen, setCreateRoomModalOpen] = useState(false);
  const [createSessionModalOpen, setCreateSessionModalOpen] = useState(false);
  
  const { connected, connectionError } = useSocket();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Get backend URL with fallback
  const getBackendUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  };

  // Check for room join parameter
  useEffect(() => {
    const joinRoomId = searchParams.get('join');
    if (joinRoomId && rooms.length > 0) {
      const roomToJoin = rooms.find(room => room.roomId === joinRoomId);
      if (roomToJoin) {
        handleRoomSelect(roomToJoin);
      }
    }
  }, [searchParams, rooms]);

  useEffect(() => {
    fetchRooms();
    fetchSessions();
    fetchLeaderboard();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const backendUrl = getBackendUrl();
      console.log('Fetching rooms from:', `${backendUrl}/api/community/rooms`);
      
      const response = await fetch(`${backendUrl}/api/community/rooms`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Rooms response:', data);
      
      if (data.success) {
        setRooms(data.rooms || []);
      } else {
        setError(data.message || 'Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError(`Failed to fetch rooms: ${error.message}`);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const backendUrl = getBackendUrl();
      console.log('Fetching leaderboard from:', `${backendUrl}/api/community/leaderboard`);
      
      const response = await fetch(`${backendUrl}/api/community/leaderboard`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Leaderboard response:', data);
      
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
        setUserGrade(data.userGrade);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    }
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const backendUrl = getBackendUrl();
      console.log('Fetching sessions from:', `${backendUrl}/api/sessions/sessions`);
      
      const response = await fetch(`${backendUrl}/api/sessions/sessions`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sessions response:', data);
      
      if (data.success) {
        setSessions(data.sessions || []);
      } else {
        setError(data.message || 'Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError(`Failed to fetch sessions: ${error.message}`);
      setSessions([]);
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setActiveTab('chat');
  };

  const handleRoomCreated = (newRoom) => {
    // Add the new room to the list
    setRooms(prev => [newRoom, ...prev]);
    // Automatically select and join the new room
    handleRoomSelect(newRoom);
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setActiveTab('session');
  };

  const handleSessionCreated = (newSession) => {
    // Add the new session to the list
    setSessions(prev => [newSession, ...prev]);
    // Automatically select and join the new session
    handleSessionSelect(newSession);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8FFD7] to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#5E936C] p-4 rounded-xl shadow-sm">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-semibold text-[#3E5F44] mb-2">
            Learning Community
          </h1>
          <p className="text-gray-600 text-lg">
            Connect, learn, and grow with fellow students
          </p>
          
          {/* Connection Status */}
          <div className="mt-4 flex justify-center">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              connected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {connected ? 'Connected' : connectionError || 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 flex justify-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Study Sessions</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">Real-time Chat</span>
            </div>
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4" />
              <span className="text-sm">Video Calls</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Study Groups</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white border border-[#93DA97]/30 rounded-xl p-1 flex space-x-1 overflow-x-auto shadow-sm">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'sessions'
                  ? 'bg-[#5E936C] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#3E5F44] hover:bg-[#E8FFD7]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Study Sessions</span>
            </button>
            
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'rooms'
                  ? 'bg-[#5E936C] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#3E5F44] hover:bg-[#E8FFD7]'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat Rooms</span>
            </button>
            
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'leaderboard'
                  ? 'bg-[#5E936C] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#3E5F44] hover:bg-[#E8FFD7]'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {activeTab === 'sessions' && (
            <>
              <SessionList 
                sessions={sessions} 
                onSessionSelect={handleSessionSelect}
                onRefresh={fetchSessions}
              />
              
              {/* Create Session Button */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-[#93DA97]/30 rounded-xl p-6 shadow-sm">
                  <h3 className="text-[#3E5F44] font-semibold mb-4">Quick Actions</h3>
                  <button
                    onClick={() => setCreateSessionModalOpen(true)}
                    className="w-full bg-[#5E936C] hover:bg-[#3E5F44] text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mb-3 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Session</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className="w-full bg-[#E8FFD7] hover:bg-[#93DA97]/30 text-[#3E5F44] px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-[#93DA97]/40"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat Rooms</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'session' && selectedSession && (
            <div className="lg:col-span-5">
              <StudySessionRoom 
                session={selectedSession} 
                onBack={() => setActiveTab('sessions')}
              />
            </div>
          )}
          
          {activeTab === 'rooms' && (
            <>
              <RoomList 
                rooms={rooms} 
                onRoomSelect={handleRoomSelect}
                onRefresh={fetchRooms}
              />
              
              {/* Create Room Button */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-[#93DA97]/30 rounded-xl p-6 shadow-sm">
                  <h3 className="text-[#3E5F44] font-semibold mb-4">Quick Actions</h3>
                  <button
                    onClick={() => setCreateRoomModalOpen(true)}
                    className="w-full bg-[#5E936C] hover:bg-[#3E5F44] text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mb-3 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Room</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('sessions')}
                    className="w-full bg-[#E8FFD7] hover:bg-[#93DA97]/30 text-[#3E5F44] px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-[#93DA97]/40"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Study Sessions</span>
                  </button>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'chat' && selectedRoom && (
            <div className="lg:col-span-5">
              <ChatRoom 
                room={selectedRoom} 
                onBack={() => setActiveTab('rooms')}
              />
            </div>
          )}
          
          {activeTab === 'leaderboard' && (
            <div className="lg:col-span-5">
              <Leaderboard 
                leaderboard={leaderboard}
                userGrade={userGrade}
                currentUser={user}
              />
            </div>
          )}
        </div>

        {/* Create Session Modal */}
        <CreateSessionModal
          isOpen={createSessionModalOpen}
          onClose={() => setCreateSessionModalOpen(false)}
          onSessionCreated={handleSessionCreated}
        />

        {/* Create Room Modal */}
        <CreateRoomModal
          isOpen={createRoomModalOpen}
          onClose={() => setCreateRoomModalOpen(false)}
          onRoomCreated={handleRoomCreated}
        />

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white border border-[#93DA97]/30 rounded-xl p-8 text-center shadow-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E936C] mx-auto mb-4"></div>
              <p className="text-[#3E5F44] font-medium">Loading community...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-50 border border-red-300 rounded-lg p-4 text-red-700 max-w-md shadow-lg">
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;