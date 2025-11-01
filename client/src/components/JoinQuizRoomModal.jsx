import React, { useState } from 'react';
import { X, Hash, Users } from 'lucide-react';

const JoinQuizRoomModal = ({ isOpen, onClose, onRoomJoined, initialRoomId = '' }) => {
  const [formData, setFormData] = useState({
    roomId: initialRoomId,
    participantName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.toUpperCase()
    });
  };

  const handleNameChange = (e) => {
    setFormData({
      ...formData,
      participantName: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      const response = await fetch(`${backendUrl}/api/quiz-room/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onRoomJoined(data.room);
        handleClose();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      setError('Failed to join room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ roomId: '', participantName: '' });
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#93DA97]/30 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#93DA97]/30 bg-gradient-to-r from-[#5E936C] to-[#93DA97] rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">Join Quiz Room</h2>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-gradient-to-br from-[#E8FFD7]/30 to-white">
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-[#3E5F44] font-medium mb-2">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-[#5E936C]" />
                <span>Room ID</span>
              </div>
            </label>
            <input
              type="text"
              name="roomId"
              value={formData.roomId}
              onChange={handleInputChange}
              placeholder="Enter room ID (e.g., ABC12345)"
              className="w-full bg-white border border-[#93DA97]/50 rounded-lg px-4 py-3 text-[#3E5F44] placeholder-[#557063]/50 focus:outline-none focus:border-[#5E936C] transition-colors font-mono"
              required
              maxLength={8}
            />
          </div>

          <div>
            <label className="block text-[#3E5F44] font-medium mb-2">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#5E936C]" />
                <span>Your Name</span>
              </div>
            </label>
            <input
              type="text"
              name="participantName"
              value={formData.participantName}
              onChange={handleNameChange}
              placeholder="Enter your name"
              className="w-full bg-white border border-[#93DA97]/50 rounded-lg px-4 py-3 text-[#3E5F44] placeholder-[#557063]/50 focus:outline-none focus:border-[#5E936C] transition-colors"
              required
              maxLength={30}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-white border border-[#93DA97]/50 hover:bg-[#E8FFD7] text-[#3E5F44] font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#4a7554] hover:to-[#7fc281] disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Join Room</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinQuizRoomModal;