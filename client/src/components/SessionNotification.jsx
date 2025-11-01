import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, X, Check, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SessionNotification = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getBackendUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  };

  useEffect(() => {
    fetchInvitations();
    // Poll for new invitations every 30 seconds
    const interval = setInterval(fetchInvitations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/sessions/invitations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (inviteId, accept) => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();

      const response = await fetch(
        `${backendUrl}/api/sessions/invitations/${inviteId}/respond`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ accept })
        }
      );

      const data = await response.json();

      if (data.success) {
        // Remove from list
        setInvitations(prev => prev.filter(inv => inv.inviteId !== inviteId));

        // If accepted, navigate to community with the session
        if (accept && data.sessionId) {
          navigate(`/community?join=${data.sessionId}`);
        }
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const subjectColors = {
    'Mathematics': 'from-blue-500 to-blue-600',
    'Physics': 'from-green-500 to-green-600',
    'Chemistry': 'from-purple-500 to-purple-600',
    'Biology': 'from-emerald-500 to-emerald-600',
    'English': 'from-pink-500 to-pink-600',
    'History': 'from-orange-500 to-orange-600',
    'Geography': 'from-teal-500 to-teal-600',
    'General': 'from-gray-500 to-gray-600'
  };

  if (loading || invitations.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md space-y-3">
      {invitations.slice(0, 3).map((invitation) => (
        <div
          key={invitation.inviteId}
          className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 border border-white/20 rounded-xl p-4 shadow-2xl animate-slide-in"
        >
          <div className="flex items-start space-x-3">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${subjectColors[invitation.session.subject]} flex items-center justify-center flex-shrink-0`}>
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-semibold text-sm mb-1">
                    Session Invitation
                  </p>
                  <p className="text-white/80 text-xs">
                    {invitation.invitedBy.name} invited you
                  </p>
                </div>
                <UserPlus className="w-4 h-4 text-purple-400" />
              </div>

              <div className="mb-3">
                <h4 className="text-white font-medium truncate">
                  {invitation.session.title}
                </h4>
                <p className="text-purple-300 text-sm truncate">
                  {invitation.session.topic}
                </p>
              </div>

              {invitation.message && (
                <p className="text-white/60 text-xs mb-3 line-clamp-2">
                  "{invitation.message}"
                </p>
              )}

              <div className="flex items-center space-x-3 text-white/70 text-xs mb-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(invitation.session.date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{invitation.session.startTime}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleRespond(invitation.inviteId, true)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => handleRespond(invitation.inviteId, false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-1"
                >
                  <X className="w-3 h-3" />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {invitations.length > 3 && (
        <div className="text-center">
          <button
            onClick={() => navigate('/community')}
            className="bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-4 rounded-lg transition-all"
          >
            +{invitations.length - 3} more invitation{invitations.length - 3 !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionNotification;
