import React, { useState, useEffect } from 'react';
import { X, Share2, Users, Check } from 'lucide-react';

const MicroQuizShareModal = ({ quiz, onClose }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchUsers();
    generateShareLink();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/community/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Filter out already shared users and current user
        const filteredUsers = data.users.filter(u => 
          !quiz.sharedWith.includes(u._id) && u._id !== quiz.createdBy
        );
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const generateShareLink = () => {
    const link = `${window.location.origin}/micro-quiz?id=${quiz._id}`;
    setShareLink(link);
  };

  const toggleUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to share with');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/micro-quiz/${quiz._id}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userIds: selectedUsers })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Quiz shared successfully!');
        onClose(true); // Pass true to indicate successful share
      } else {
        alert(data.message || 'Failed to share quiz');
      }
    } catch (error) {
      console.error('Error sharing quiz:', error);
      alert('Failed to share quiz');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Share2 className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Share Quiz</h2>
              <p className="text-gray-400 text-sm">{quiz.title}</p>
            </div>
          </div>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Share Link */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Share Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-purple-500/30"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Anyone with this link can view and take this quiz
            </p>
          </div>

          {/* User Selection */}
          <div>
            <label className="block text-white font-semibold mb-3 flex items-center gap-2">
              <Users size={20} />
              Share with specific users
            </label>
            
            {users.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No users available to share with</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {users.map(user => (
                  <button
                    key={user._id}
                    onClick={() => toggleUser(user._id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      selectedUsers.includes(user._id)
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-slate-600 bg-slate-700/50 hover:border-purple-400'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedUsers.includes(user._id)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-slate-500'
                    }`}>
                      {selectedUsers.includes(user._id) && <Check size={16} className="text-white" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-semibold">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.grade} • {user.location}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={() => onClose(false)}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={loading || selectedUsers.length === 0}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Share2 size={16} />
            {loading ? 'Sharing...' : `Share with ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MicroQuizShareModal;
