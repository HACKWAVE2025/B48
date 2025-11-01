import React, { useState } from 'react';
import { X, Users, Hash, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CreateQuizRoomModal = ({ isOpen, onClose, onRoomCreated }) => {
  const [formData, setFormData] = useState({
    roomName: '',
    hostName: '',
    subject: '',
    difficulty: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomCreated, setRoomCreated] = useState(null);
  const [copied, setCopied] = useState(false);
  const [studentType, setStudentType] = useState('school');
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const { user } = useAuth();

  if (!isOpen) return null;

  // Role-based subject arrays
  const schoolSubjects = [
    { value: 'math', label: 'Mathematics', icon: '🔢' },
    { value: 'science', label: 'Science', icon: '🔬' },
    { value: 'english', label: 'English', icon: '📚' },
    { value: 'hindi', label: 'Hindi', icon: '🇮🇳' },
    { value: 'social_studies', label: 'Social Studies', icon: '🌍' },
    { value: 'art', label: 'Art', icon: '🎨' }
  ];

  const collegeSubjects = [
    { value: 'engineering', label: 'Engineering', icon: '⚙️' },
    { value: 'commerce', label: 'Commerce', icon: '💼' },
    { value: 'humanities', label: 'Humanities', icon: '📖' },
    { value: 'life_sciences', label: 'Life Sciences', icon: '🧬' },
    { value: 'business', label: 'Business', icon: '📊' },
    { value: 'it', label: 'IT', icon: '💻' }
  ];

  const researcherSubjects = [
    { value: 'ai', label: 'AI', icon: '🤖' },
    { value: 'data_science', label: 'Data Science', icon: '📊' },
    { value: 'ml', label: 'Machine Learning', icon: '🧠' },
    { value: 'biotechnology', label: 'Biotechnology', icon: '🧬' },
    { value: 'environmental_science', label: 'Environmental Science', icon: '🌱' },
    { value: 'medical_research', label: 'Medical Research', icon: '⚕️' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'hard', label: 'Hard', color: 'red' }
  ];

  // Get subjects based on user role
  const getSubjects = () => {
    if (user?.role === 'researcher') {
      return researcherSubjects;
    } else if (user?.role === 'student') {
      return studentType === 'school' ? schoolSubjects : collegeSubjects;
    }
    return schoolSubjects;
  };

  const subjects = getSubjects();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomName.trim() || !formData.hostName.trim() || !formData.subject || !formData.difficulty) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      const response = await fetch(`${backendUrl}/api/quiz-room/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomName: formData.roomName.trim(),
          hostName: formData.hostName.trim(),
          subject: formData.subject,
          difficulty: formData.difficulty
        })
      });

      const data = await response.json();

      if (data.success) {
        setRoomCreated(data.room);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(roomCreated.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClose = () => {
    setFormData({ roomName: '', hostName: '', subject: '', difficulty: '' });
    setRoomCreated(null);
    setError('');
    setCopied(false);
    setCustomSubject('');
    setShowCustomInput(false);
    onClose();
  };

  const handleJoinRoom = () => {
    onRoomCreated(roomCreated);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#93DA97]/30 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#93DA97]/30 flex-shrink-0 bg-gradient-to-r from-[#5E936C] to-[#93DA97] rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">
            {roomCreated ? 'Room Created!' : 'Create Quiz Room'}
          </h2>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!roomCreated ? (
          /* Room Creation Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 bg-gradient-to-br from-[#E8FFD7]/30 to-white">
            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-[#3E5F44] font-medium mb-2">
                Room Name
              </label>
              <input
                type="text"
                name="roomName"
                value={formData.roomName}
                onChange={handleInputChange}
                placeholder="Enter room name"
                className="w-full bg-white border border-[#93DA97]/50 rounded-lg px-4 py-3 text-[#3E5F44] placeholder-[#557063]/50 focus:outline-none focus:border-[#5E936C] transition-colors"
                required
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-[#3E5F44] font-medium mb-2">
                Your Name (Host)
              </label>
              <input
                type="text"
                name="hostName"
                value={formData.hostName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="w-full bg-white border border-[#93DA97]/50 rounded-lg px-4 py-3 text-[#3E5F44] placeholder-[#557063]/50 focus:outline-none focus:border-[#5E936C] transition-colors"
                required
                maxLength={30}
              />
            </div>

            {/* Student Type Selection - Only for students */}
            {user?.role === 'student' && (
              <div>
                <label className="block text-[#3E5F44] font-medium mb-2">Student Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStudentType('school')}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-300 ${
                      studentType === 'school'
                        ? 'bg-[#E8FFD7] border-[#5E936C] text-[#3E5F44]'
                        : 'bg-white border-[#93DA97]/50 text-[#557063] hover:border-[#5E936C]/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">🎒</div>
                      <div className="text-sm font-medium">School</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentType('college')}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-300 ${
                      studentType === 'college'
                        ? 'bg-[#E8FFD7] border-[#5E936C] text-[#3E5F44]'
                        : 'bg-white border-[#93DA97]/50 text-[#557063] hover:border-[#5E936C]/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">🎓</div>
                      <div className="text-sm font-medium">College</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Subject Selection */}
            <div>
              <label className="block text-[#3E5F44] font-medium mb-2">Quiz Subject</label>
              <div className="grid grid-cols-3 gap-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, subject: subject.value });
                      setShowCustomInput(false);
                    }}
                    className={`p-2 rounded-lg border-2 transition-all duration-300 ${
                      formData.subject === subject.value && !showCustomInput
                        ? 'bg-[#E8FFD7] border-[#5E936C] text-[#3E5F44]'
                        : 'bg-white border-[#93DA97]/50 text-[#557063] hover:border-[#5E936C]/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-1">{subject.icon}</div>
                      <div className="text-xs font-medium">{subject.label}</div>
                    </div>
                  </button>
                ))}
                {/* Custom Subject Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(true);
                    setFormData({ ...formData, subject: '' });
                  }}
                  className={`p-2 rounded-lg border-2 transition-all duration-300 ${
                    showCustomInput
                      ? 'bg-orange-100 border-orange-400 text-orange-700'
                      : 'bg-white border-[#93DA97]/50 text-[#557063] hover:border-orange-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xl mb-1">➕</div>
                    <div className="text-xs font-medium">Custom</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Subject Input */}
            {showCustomInput && (
              <div>
                <label className="block text-[#3E5F44] font-medium mb-2">Custom Subject</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customSubject.trim()) {
                          setFormData({ ...formData, subject: customSubject.trim() });
                          setShowCustomInput(false);
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-white border border-[#93DA97]/50 rounded-lg text-[#3E5F44] placeholder-[#557063]/50 focus:outline-none focus:border-[#5E936C]"
                    placeholder="Enter custom subject"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customSubject.trim()) {
                        setFormData({ ...formData, subject: customSubject.trim() });
                        setShowCustomInput(false);
                      }
                    }}
                    disabled={!customSubject.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-[#5E936C] to-[#93DA97] text-white rounded-lg hover:from-[#4a7554] hover:to-[#7fc281] transition-all disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Difficulty Selection */}
            <div>
              <label className="block text-[#3E5F44] font-medium mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: difficulty.value })}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                      formData.difficulty === difficulty.value
                        ? `bg-${difficulty.color}-100 border-${difficulty.color}-400 text-${difficulty.color}-700`
                        : 'bg-white border-[#93DA97]/50 text-[#557063] hover:border-[#5E936C]/50'
                    }`}
                  >
                    <div className="text-sm font-medium">{difficulty.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom with padding */}
            <div className="flex space-x-4 pt-2 pb-2">
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
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Create Room</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Room Created Success */
          <div className="p-6 space-y-6 bg-gradient-to-br from-[#E8FFD7]/30 to-white">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#3E5F44] mb-2">
                Room "{roomCreated.roomName}" Created!
              </h3>
              <p className="text-[#557063] text-sm">
                Share the room ID or invite link with participants
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-[#93DA97]/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#557063] text-sm">Room ID</span>
                  <Hash className="w-4 h-4 text-[#5E936C]" />
                </div>
                <p className="text-[#3E5F44] font-mono text-lg font-bold">
                  {roomCreated.roomId}
                </p>
              </div>

              <div className="bg-white border border-[#93DA97]/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#557063] text-sm">Invite Link</span>
                  <button
                    onClick={handleCopyInvite}
                    className="text-[#5E936C] hover:text-[#4a7554] transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[#3E5F44] text-sm break-all">
                  {roomCreated.inviteLink}
                </p>
              </div>
            </div>

            <button
              onClick={handleJoinRoom}
              className="w-full bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#4a7554] hover:to-[#7fc281] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              Join Room Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateQuizRoomModal;