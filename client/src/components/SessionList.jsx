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
    'Mathematics': 'bg-blue-500',
    'Physics': 'bg-green-500',
    'Chemistry': 'bg-purple-500',
    'Biology': 'bg-emerald-500',
    'English': 'bg-pink-500',
    'History': 'bg-orange-500',
    'Geography': 'bg-teal-500',
    'General': 'bg-gray-500'
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
        color: 'bg-gray-100 text-gray-600 border-gray-300'
      };
    } else if (session.status === 'cancelled') {
      return {
        icon: <XCircle className="w-3 h-3" />,
        text: 'Cancelled',
        color: 'bg-red-50 text-red-600 border-red-300'
      };
    } else if (session.status === 'active' && session.isJoinable) {
      return {
        icon: <Play className="w-3 h-3" />,
        text: 'Active',
        color: 'bg-[#93DA97]/30 text-[#3E5F44] border-[#5E936C]'
      };
    } else if (now < sessionDate) {
      return {
        icon: <Clock className="w-3 h-3" />,
        text: 'Upcoming',
        color: 'bg-blue-50 text-blue-600 border-blue-300'
      };
    } else {
      return {
        icon: <Eye className="w-3 h-3" />,
        text: 'View Only',
        color: 'bg-gray-100 text-gray-600 border-gray-300'
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
      <div className="bg-white border border-[#93DA97]/30 rounded-xl p-6 shadow-sm">
        {/* Header with Filters */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#3E5F44]">Study Sessions</h2>
            <button
              onClick={onRefresh}
              className="bg-[#5E936C] hover:bg-[#3E5F44] text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm shadow-sm"
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
                    ? 'bg-[#5E936C] text-white shadow-sm'
                    : 'bg-[#E8FFD7] text-[#557063] hover:bg-[#93DA97]/30 hover:text-[#3E5F44]'
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
                className={`bg-[#E8FFD7] border border-[#93DA97]/30 rounded-xl p-4 transition-all duration-200 group ${
                  joinable
                    ? 'hover:bg-[#93DA97]/30 cursor-pointer hover:border-[#5E936C] hover:shadow-md'
                    : session.hasEnded
                    ? 'cursor-pointer hover:bg-[#93DA97]/20'
                    : 'opacity-75'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`${subjectColors[session.subject] || subjectColors.General} p-2 rounded-lg`}>
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
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-[#5E936C] hover:bg-[#3E5F44] text-white transition-all"
                        title="Invite users"
                      >
                        <UserPlus className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleSummaryClick(e, session)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#3E5F44] hover:to-[#5E936C] text-white transition-all"
                        title="View AI Summary"
                      >
                        <Sparkles className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Topic */}
                <h3 className="text-[#3E5F44] font-semibold mb-1 line-clamp-1">
                  {session.title}
                </h3>
                <p className="text-[#5E936C] text-sm mb-2 line-clamp-1">
                  {session.topic}
                </p>

                {/* Description */}
                {session.description && (
                  <p className="text-[#557063] text-xs mb-3 line-clamp-2">
                    {session.description}
                  </p>
                )}

                {/* Date & Time */}
                <div className="flex items-center space-x-3 text-xs text-[#557063] mb-3">
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
                        className="px-2 py-1 bg-white border border-[#93DA97]/40 rounded text-xs text-[#557063] flex items-center"
                      >
                        <Tag className="w-2 h-2 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {session.tags.length > 3 && (
                      <span className="px-2 py-1 bg-white border border-[#93DA97]/40 rounded text-xs text-[#557063]">
                        +{session.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#93DA97]/30">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-[#557063]">
                      <Users className="w-4 h-4" />
                      <span>{session.activeUsersCount || 0}/{session.maxUsers}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[#557063]">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration}m</span>
                    </div>
                  </div>
                  <span className="bg-white border border-[#93DA97]/50 px-2 py-1 rounded text-xs text-[#557063]">
                    {session.subject}
                  </span>
                </div>

                {/* Join/View Button */}
                {joinable && (
                  <button className="w-full mt-3 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#3E5F44] hover:to-[#5E936C] text-white py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2 shadow-sm">
                    <Play className="w-4 h-4" />
                    <span>Join Now</span>
                  </button>
                )}
                {session.hasEnded && (
                  <button className="w-full mt-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2">
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
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-[#557063]">
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
