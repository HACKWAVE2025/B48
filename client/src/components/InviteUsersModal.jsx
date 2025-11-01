import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check, Loader } from 'lucide-react';

const InviteUsersModal = ({ isOpen, onClose, session }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const getBackendUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  };

  useEffect(() => {
    if (searchQuery.length >= 2) {
      // Debounce search
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const timeout = setTimeout(() => {
        searchUsers();
      }, 500);

      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      setIsSearching(true);
      setError('');
      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();

      const response = await fetch(
        `${backendUrl}/api/sessions/users/search?query=${encodeURIComponent(searchQuery)}&sessionId=${session.sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.users || []);
      } else {
        setError(data.message || 'Failed to search users');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u._id === user._id);
      if (isSelected) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user to invite');
      return;
    }

    try {
      setIsInviting(true);
      setError('');
      setSuccess('');
      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();

      const response = await fetch(
        `${backendUrl}/api/sessions/sessions/${session.sessionId}/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            userIds: selectedUsers.map(u => u._id),
            message: inviteMessage || undefined
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(`Successfully invited ${data.invites.length} user(s)!`);
        setSelectedUsers([]);
        setSearchQuery('');
        setSearchResults([]);
        setInviteMessage('');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to send invitations');
      }
    } catch (error) {
      console.error('Invite error:', error);
      setError('Failed to send invitations');
    } finally {
      setIsInviting(false);
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#93DA97]/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-[#93DA97]/30 flex items-center justify-between sticky top-0 bg-gradient-to-r from-[#5E936C] to-[#93DA97] z-10 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Invite to Session</h2>
              <p className="text-[#E8FFD7] text-sm">{session?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-gradient-to-br from-[#E8FFD7]/30 to-white">
          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-700 text-sm flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Search */}
          <div>
            <label className="block text-[#3E5F44] font-medium mb-2">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#557063]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-white border border-[#93DA97]/50 rounded-lg pl-10 pr-4 py-3 text-[#3E5F44] placeholder-[#557063]/50 focus:outline-none focus:border-[#5E936C]"
              />
              {isSearching && (
                <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5E936C] animate-spin" />
              )}
            </div>
            <p className="text-[#557063] text-xs mt-1">
              Type at least 2 characters to search
            </p>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-[#3E5F44] font-medium mb-2">
                Selected Users ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center space-x-2 bg-[#E8FFD7] border border-[#93DA97] rounded-full px-3 py-1"
                  >
                    <div className={`w-6 h-6 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white text-xs font-semibold`}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="text-[#3E5F44] text-sm">{user.name}</span>
                    <button
                      onClick={() => toggleUserSelection(user)}
                      className="text-[#557063] hover:text-[#3E5F44]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <label className="block text-[#3E5F44] font-medium mb-2">
                Search Results
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map(user => {
                  const isSelected = selectedUsers.find(u => u._id === user._id);
                  
                  return (
                    <div
                      key={user._id}
                      onClick={() => toggleUserSelection(user)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#E8FFD7] border-2 border-[#5E936C]'
                          : 'bg-white border border-[#93DA97]/30 hover:bg-[#E8FFD7]/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-semibold`}>
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[#3E5F44] font-medium">{user.name}</p>
                          <p className="text-[#557063] text-sm">
                            Level {user.level} • Grade {user.grade}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="text-center py-8 text-[#557063]">
              No users found matching "{searchQuery}"
            </div>
          )}

          {/* Custom Message */}
          <div>
            <label className="block text-[#3E5F44] font-medium mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Add a personal message to your invitation..."
              className="w-full bg-white border border-[#93DA97]/50 rounded-lg px-4 py-3 text-[#3E5F44] placeholder-[#557063]/50 focus:outline-none focus:border-[#5E936C] resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-[#557063] text-xs mt-1">
              {inviteMessage.length}/200 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-white border border-[#93DA97]/50 hover:bg-[#E8FFD7] text-[#3E5F44] font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={isInviting || selectedUsers.length === 0}
              className="flex-1 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#4a7554] hover:to-[#7fc281] disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isInviting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Inviting...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Invite {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteUsersModal;
