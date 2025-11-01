import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import { 
  User, 
  Mail, 
  MapPin, 
  Trophy, 
  Star, 
  Crown, 
  Zap, 
  Shield, 
  Edit, 
  Save, 
  X, 
  Camera,
  Badge,
  Calendar,
  Target
} from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    role: 'student',
    interests: [],
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customInterest, setCustomInterest] = useState('');

  // Available subjects for interests
  const subjects = ['Math', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Art', 'Music'];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        role: user.role || 'student',
        interests: user.interests || [],
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleInterestToggle = (interest) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];

    setFormData({
      ...formData,
      interests: newInterests
    });
  };

  const handleAddCustomInterest = () => {
    const trimmedInterest = customInterest.trim();
    if (trimmedInterest && !formData.interests.includes(trimmedInterest)) {
      setFormData({
        ...formData,
        interests: [...formData.interests, trimmedInterest]
      });
      setCustomInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  const handleCustomInterestKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomInterest();
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        role: user.role || 'student',
        interests: user.interests || [],
        bio: user.bio || ''
      });
    }
    setIsEditing(false);
    setError('');
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_URL}/api/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Update the user context with new avatar
        await updateProfile({ avatar: data.avatarUrl });
      } else {
        setError(data.message || 'Failed to upload avatar');
      }
    } catch (err) {
      setError('An error occurred while uploading avatar');
    }

    setIsLoading(false);
  };

  const handleAvatarRemove = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmAvatarRemove = async () => {
    setShowDeleteConfirm(false);
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/profile/avatar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Update the user context to remove avatar
        await updateProfile({ avatar: '' });
      } else {
        setError(data.message || 'Failed to remove avatar');
      }
    } catch (err) {
      setError('An error occurred while removing avatar');
    }

    setIsLoading(false);
  };

  // Calculate user stats
  const userLevel = user?.level || 1;
  const userXP = user?.points || 0;
  const userAchievements = user?.achievements || 0;
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
  const completedQuizzes = user?.completedQuizzes || 0;
  const averageScore = user?.averageScore || 0;

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative bg-gradient-to-br from-[#E8FFD7] to-white">
      {/* Profile Container */}
      <div className="bg-white border border-[#93DA97]/30 rounded-3xl p-8 shadow-lg relative overflow-hidden w-full max-w-4xl">
        
        {/* Header Section */}
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-[#5E936C] to-[#93DA97] rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute -bottom-2 -right-2 bg-[#5E936C] hover:bg-[#3E5F44] rounded-full p-2 shadow-sm transition-colors duration-200 cursor-pointer ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Camera className="w-4 h-4 text-white" />
              </label>
              {user?.avatar && (
                <button
                  onClick={handleAvatarRemove}
                  disabled={isLoading}
                  className={`absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 shadow-sm transition-colors duration-200 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Remove avatar"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-3xl font-bold text-[#3E5F44] mb-2">
                {user?.name || 'Explorer'}
              </h1>
              <p className="text-[#557063] text-lg flex items-center">
                <Crown className="w-5 h-5 text-[#5E936C] mr-2" />
                Level {userLevel} Learner
              </p>
            </div>
          </div>

          {/* Edit Button */}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#E8FFD7] hover:bg-[#93DA97]/20 border border-[#93DA97] rounded-lg text-[#3E5F44] hover:text-[#3E5F44] font-medium transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-[#5E936C] hover:bg-[#3E5F44] border border-[#5E936C] rounded-lg text-white font-medium transition-all duration-200"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium transition-all duration-200"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="relative z-10 mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500 p-1 rounded-full">
                <X className="w-4 h-4 text-white" />
              </div>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#E8FFD7] to-white border border-[#93DA97]/30 rounded-xl p-4 text-center">
            <Trophy className="w-8 h-8 text-[#5E936C] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3E5F44]">{userAchievements}</div>
            <div className="text-[#557063] text-sm">Achievements</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#E8FFD7] to-white border border-[#93DA97]/30 rounded-xl p-4 text-center">
            <Star className="w-8 h-8 text-[#5E936C] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3E5F44]">{userXP}</div>
            <div className="text-[#557063] text-sm">Experience Points</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#E8FFD7] to-white border border-[#93DA97]/30 rounded-xl p-4 text-center">
            <Target className="w-8 h-8 text-[#5E936C] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3E5F44]">{completedQuizzes}</div>
            <div className="text-[#557063] text-sm">Quizzes Completed</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#E8FFD7] to-white border border-[#93DA97]/30 rounded-xl p-4 text-center">
            <Zap className="w-8 h-8 text-[#5E936C] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3E5F44]">{averageScore}%</div>
            <div className="text-[#557063] text-sm">Average Score</div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="flex items-center space-x-3 text-[#3E5F44] font-medium text-sm">
                <div className="p-2 rounded-lg bg-[#E8FFD7] border border-[#93DA97]/40">
                  <User className="w-4 h-4 text-[#5E936C]" />
                </div>
                <span>Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-3 bg-white border border-[#93DA97]/30 rounded-xl text-[#0f172a] placeholder-gray-400 focus:border-[#5E936C] focus:ring-[#5E936C]/20 focus:outline-none transition-colors duration-200 disabled:opacity-60 disabled:bg-gray-50"
                placeholder="Enter your name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center space-x-3 text-[#3E5F44] font-medium text-sm">
                <div className="p-2 rounded-lg bg-[#E8FFD7] border border-[#93DA97]/40">
                  <Mail className="w-4 h-4 text-[#5E936C]" />
                </div>
                <span>Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-3 bg-white border border-[#93DA97]/30 rounded-xl text-[#0f172a] placeholder-gray-400 focus:border-[#5E936C] focus:ring-[#5E936C]/20 focus:outline-none transition-colors duration-200 disabled:opacity-60 disabled:bg-gray-50"
                placeholder="Enter your email"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="flex items-center space-x-3 text-[#3E5F44] font-medium text-sm">
                <div className="p-2 rounded-lg bg-[#E8FFD7] border border-[#93DA97]/40">
                  <MapPin className="w-4 h-4 text-[#5E936C]" />
                </div>
                <span>Location</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-3 bg-white border border-[#93DA97]/30 rounded-xl text-[#0f172a] placeholder-gray-400 focus:border-[#5E936C] focus:ring-[#5E936C]/20 focus:outline-none transition-colors duration-200 disabled:opacity-60 disabled:bg-gray-50"
                placeholder="Your city"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="flex items-center space-x-3 text-[#3E5F44] font-medium text-sm">
                <div className="p-2 rounded-lg bg-[#E8FFD7] border border-[#93DA97]/40">
                  <Shield className="w-4 h-4 text-[#5E936C]" />
                </div>
                <span>Role</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-3 bg-white border border-[#93DA97]/30 rounded-xl text-[#0f172a] focus:border-[#5E936C] focus:ring-[#5E936C]/20 focus:outline-none transition-colors duration-200 disabled:opacity-60 disabled:bg-gray-50"
              >
                <option value="student" className="bg-white">🎓 Student - Learn and practice</option>
                <option value="researcher" className="bg-white">🔬 Researcher - Create and explore</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Bio */}
            <div className="space-y-2">
              <label className="flex items-center space-x-3 text-[#3E5F44] font-medium text-sm">
                <div className="p-2 rounded-lg bg-[#E8FFD7] border border-[#93DA97]/40">
                  <Badge className="w-4 h-4 text-[#5E936C]" />
                </div>
                <span>About Me</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows="4"
                className="w-full p-3 bg-white border border-[#93DA97]/30 rounded-xl text-[#0f172a] placeholder-gray-400 focus:border-[#5E936C] focus:ring-[#5E936C]/20 focus:outline-none transition-colors duration-200 resize-none disabled:opacity-60 disabled:bg-gray-50"
                placeholder="Tell us about your learning journey..."
              />
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <label className="flex items-center justify-between text-[#3E5F44] font-medium text-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-[#E8FFD7] border border-[#93DA97]/40">
                    <Star className="w-4 h-4 text-[#5E936C]" />
                  </div>
                  <span>Learning Interests</span>
                  <span className="text-xs text-gray-500">
                    ({formData.interests.length} selected)
                  </span>
                </div>
                {isEditing && (
                  <span className="text-xs text-[#5E936C]">Click to toggle</span>
                )}
              </label>

              {/* Predefined Subjects */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Popular Subjects:</p>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => isEditing && handleInterestToggle(subject)}
                      disabled={!isEditing}
                      className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                        formData.interests.includes(subject)
                          ? 'bg-[#5E936C]/20 border-[#5E936C] text-[#3E5F44] shadow-sm'
                          : 'bg-[#E8FFD7] border-[#93DA97]/30 text-[#557063]'
                      } ${
                        isEditing 
                          ? 'hover:scale-105 hover:border-[#5E936C] cursor-pointer' 
                          : 'cursor-default opacity-70'
                      }`}
                    >
                      {formData.interests.includes(subject) && (
                        <span className="mr-1">✓</span>
                      )}
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Interests */}
              {formData.interests.filter(int => !subjects.includes(int)).length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Your Custom Interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests
                      .filter(interest => !subjects.includes(interest))
                      .map((interest) => (
                        <div
                          key={interest}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 bg-[#93DA97]/20 border-[#93DA97] text-[#3E5F44] shadow-sm text-sm font-medium"
                        >
                          <span>✓ {interest}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveInterest(interest)}
                              className="ml-1 text-red-500 hover:text-red-700 transition-colors"
                              title="Remove"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Add Custom Interest */}
              {isEditing && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Add Custom Interest:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      onKeyPress={handleCustomInterestKeyPress}
                      placeholder="e.g., Robotics, Photography..."
                      className="flex-1 px-4 py-2 bg-white border border-[#93DA97]/30 rounded-lg text-[#0f172a] placeholder-gray-400 focus:border-[#5E936C] focus:ring-[#5E936C]/20 focus:outline-none transition-colors duration-200 text-sm"
                      maxLength={30}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomInterest}
                      disabled={!customInterest.trim()}
                      className="px-4 py-2 bg-[#5E936C] hover:bg-[#3E5F44] border-2 border-[#5E936C] text-white rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add +
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    💡 Tip: Add your unique interests or click on popular subjects above
                  </p>
                </div>
              )}
            </div>

            {/* Join Date */}
            <div className="space-y-2">
              <label className="flex items-center space-x-3 text-[#3E5F44] font-medium text-sm">
                <div className="p-2 rounded-lg bg-[#E8FFD7] border border-[#93DA97]/40">
                  <Calendar className="w-4 h-4 text-[#5E936C]" />
                </div>
                <span>Member Since</span>
              </label>
              <div className="w-full p-3 bg-gray-50 border border-[#93DA97]/30 rounded-xl text-[#557063]">
                {joinDate}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements - removed for clean look */}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmAvatarRemove}
        title="Remove Profile Picture"
        message="Are you sure you want to remove your profile picture? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Profile;
