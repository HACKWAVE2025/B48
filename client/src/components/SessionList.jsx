import React, { useState } from 'react';
import { Calendar, Clock, Users, BookOpen, Play, Eye, CheckCircle, XCircle, Tag, UserPlus, Sparkles } from 'lucide-react';
import InviteUsersModal from './InviteUsersModal';
import SessionSummaryModal from './SessionSummaryModal';

const SessionList = ({ sessions, onSessionSelect, onRefresh, userTimeZone = 'local' }) => {
  const [filter, setFilter] = useState('all'); // all, upcoming, active, past
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedSessionForInvite, setSelectedSessionForInvite] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedSessionForSummary, setSelectedSessionForSummary] = useState(null);

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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getStatusBadge = (session) => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const [hours, minutes] = session.startTime.split(':').map(Number);
    sessionDate.setHours(hours, minutes, 0, 0);

    if (session.status === 'completed' || session.hasEnded) {
      return {
        icon: <CheckCircle className="w-3 h-3" />,
        text: 'Completed',
        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      };
    } else if (session.status === 'cancelled') {
      return {
        icon: <XCircle className="w-3 h-3" />,
        text: 'Cancelled',
        color: 'bg-red-500/20 text-red-300 border-red-500/30'
      };
    } else if (session.status === 'active' && session.isJoinable) {
      return {
        icon: <Play className="w-3 h-3" />,
        text: 'Active',
        color: 'bg-green-500/20 text-green-300 border-green-500/30'
      };
    } else if (now < sessionDate) {
      return {
        icon: <Clock className="w-3 h-3" />,
        text: 'Upcoming',
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      };
    } else {
      return {
        icon: <Eye className="w-3 h-3" />,
        text: 'View Only',
        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      };
    }
  };

  const filteredSessions = sessions.filter(session => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const [hours, minutes] = session.startTime.split(':').map(Number);
    sessionDate.setHours(hours, minutes, 0, 0);

    switch (filter) {
      case 'upcoming':
        return session.status === 'scheduled' && now < sessionDate;
      case 'active':
        return session.status === 'active' && session.isJoinable;
      case 'past':
        return session.status === 'completed' || session.hasEnded;
      default:
        return true;
    }
  });

  const canJoinSession = (session) => {
    return session.isJoinable && session.status === 'active';
  };

  const handleInviteClick = (e, session) => {
    e.stopPropagation();
    setSelectedSessionForInvite(session);
    setShowInviteModal(true);
  };

  const handleSummaryClick = (e, session) => {
    e.stopPropagation();
    setSelectedSessionForSummary(session);
    setShowSummaryModal(true);
  };

  return (
    <div className="lg:col-span-4">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        {/* Header with Filters */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Study Sessions</h2>
            <button
              onClick={onRefresh}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
            >
              Refresh
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All Sessions' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'active', label: 'Active' },
              { key: 'past', label: 'Past' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSessions.map(session => {
            const status = getStatusBadge(session);
            const joinable = canJoinSession(session);

            return (
              <div
                key={session.sessionId}
                onClick={() => onSessionSelect(session)}
                className={`bg-white/5 border border-white/20 rounded-xl p-4 transition-all duration-200 group ${
                  joinable
                    ? 'hover:bg-white/10 cursor-pointer hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20'
                    : session.hasEnded
                    ? 'cursor-pointer hover:bg-white/10'
                    : 'opacity-75'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`bg-gradient-to-r ${subjectColors[session.subject] || subjectColors.General} p-2 rounded-lg`}>
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${status.color}`}>
                      {status.icon}
                      <span>{status.text}</span>
                    </div>
                    {!session.hasEnded ? (
                      <button
                        onClick={(e) => handleInviteClick(e, session)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all"
                        title="Invite users"
                      >
                        <UserPlus className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleSummaryClick(e, session)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all"
                        title="View AI Summary"
                      >
                        <Sparkles className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Topic */}
                <h3 className="text-white font-semibold mb-1 line-clamp-1">
                  {session.title}
                </h3>
                <p className="text-purple-300 text-sm mb-2 line-clamp-1">
                  {session.topic}
                </p>

                {/* Description */}
                {session.description && (
                  <p className="text-white/60 text-xs mb-3 line-clamp-2">
                    {session.description}
                  </p>
                )}

                {/* Date & Time */}
                <div className="flex items-center space-x-3 text-xs text-white/70 mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(session.date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{session.startTime}</span>
                  </div>
                </div>

                {/* Tags */}
                {session.tags && session.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {session.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white/10 rounded text-xs text-white/70 flex items-center"
                      >
                        <Tag className="w-2 h-2 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {session.tags.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">
                        +{session.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-white/60">
                      <Users className="w-4 h-4" />
                      <span>{session.activeUsersCount || 0}/{session.maxUsers}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-white/60">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration}m</span>
                    </div>
                  </div>
                  <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/70">
                    {session.subject}
                  </span>
                </div>

                {/* Join/View Button */}
                {joinable && (
                  <button className="w-full mt-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Join Now</span>
                  </button>
                )}
                {session.hasEnded && (
                  <button className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white/70 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>View Session</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">
              {filter === 'all' && 'No study sessions available'}
              {filter === 'upcoming' && 'No upcoming sessions'}
              {filter === 'active' && 'No active sessions'}
              {filter === 'past' && 'No past sessions'}
            </p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <InviteUsersModal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setSelectedSessionForInvite(null);
        }}
        session={selectedSessionForInvite}
      />

      {/* AI Summary Modal */}
      <SessionSummaryModal
        session={selectedSessionForSummary}
        isOpen={showSummaryModal}
        onClose={() => {
          setShowSummaryModal(false);
          setSelectedSessionForSummary(null);
        }}
      />
    </div>
  );
};

export default SessionList;
