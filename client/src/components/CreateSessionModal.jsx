import React, { useState } from 'react';
import { X, BookOpen, Calendar, Clock, Users, Plus, Target } from 'lucide-react';

const CreateSessionModal = ({ isOpen, onClose, onSessionCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    subject: 'General',
    description: '',
    date: '',
    startTime: '',
    duration: 60,
    isPrivate: false,
    maxUsers: 20,
    tags: '',
    objectives: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'English', 'History', 'Geography', 'General'
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      // Process tags and objectives
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      const objectives = formData.objectives.split('\n').map(o => o.trim()).filter(o => o);

      const response = await fetch(`${backendUrl}/api/sessions/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          tags,
          objectives
        })
      });

      const data = await response.json();

      if (data.success) {
        onSessionCreated(data.session);
        onClose();
        // Reset form
        setFormData({
          title: '',
          topic: '',
          subject: 'General',
          description: '',
          date: '',
          startTime: '',
          duration: 60,
          isPrivate: false,
          maxUsers: 20,
          tags: '',
          objectives: ''
        });
      } else {
        setError(data.message || 'Failed to create session');
      }
    } catch (error) {
      console.error('Create session error:', error);
      setError('Failed to create session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/20 flex items-center justify-between sticky top-0 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Create Study Session</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Title & Topic Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-white font-medium mb-2">
                Session Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Calculus Study Group"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                required
                maxLength={100}
              />
            </div>

            {/* Topic */}
            <div>
              <label className="block text-white font-medium mb-2">
                Topic *
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="e.g., Derivatives & Integrals"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                required
                maxLength={100}
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-white font-medium mb-2">
              Subject *
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none"
                required
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject} className="bg-gray-800">
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date */}
            <div>
              <label className="block text-white font-medium mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={getMinDate()}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-white font-medium mb-2">
                <Clock className="inline w-4 h-4 mr-2" />
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-white font-medium mb-2">
                Duration (min) *
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none"
                required
              >
                <option value={15} className="bg-gray-800">15 min</option>
                <option value={30} className="bg-gray-800">30 min</option>
                <option value={45} className="bg-gray-800">45 min</option>
                <option value={60} className="bg-gray-800">1 hour</option>
                <option value={90} className="bg-gray-800">1.5 hours</option>
                <option value={120} className="bg-gray-800">2 hours</option>
                <option value={180} className="bg-gray-800">3 hours</option>
                <option value={240} className="bg-gray-800">4 hours</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What will you study in this session?"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 resize-none"
              rows={3}
              maxLength={300}
            />
            <p className="text-white/60 text-xs mt-1">
              {formData.description.length}/300 characters
            </p>
          </div>

          {/* Objectives */}
          <div>
            <label className="block text-white font-medium mb-2">
              <Target className="inline w-4 h-4 mr-2" />
              Learning Objectives
            </label>
            <textarea
              name="objectives"
              value={formData.objectives}
              onChange={handleInputChange}
              placeholder="Enter learning goals (one per line)&#10;e.g., Understand derivatives&#10;Solve integration problems"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 resize-none"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-white font-medium mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., advanced, exam prep, group study"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Session Settings</h3>
            
            {/* Max Users */}
            <div>
              <label className="block text-white font-medium mb-2">
                <Users className="inline w-4 h-4 mr-2" />
                Maximum Participants: {formData.maxUsers}
              </label>
              <input
                type="range"
                name="maxUsers"
                value={formData.maxUsers}
                onChange={handleInputChange}
                min="5"
                max="50"
                step="5"
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-white/60 text-xs mt-1">
                <span>5</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${subjectColors[formData.subject]} flex items-center justify-center flex-shrink-0`}>
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">
                {formData.title || 'Session Title'}
              </h3>
              <p className="text-white/70 text-sm truncate">
                {formData.topic || 'Topic'} • {formData.subject}
              </p>
              <div className="flex items-center space-x-3 mt-2 text-white/60 text-xs">
                {formData.date && (
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(formData.date).toLocaleDateString()}
                  </span>
                )}
                {formData.startTime && (
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formData.startTime}
                  </span>
                )}
                <span className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {formData.maxUsers} max
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.topic.trim() || !formData.date || !formData.startTime}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Session'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSessionModal;
