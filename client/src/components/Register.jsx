import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, EyeOff, Mail, Lock, User, MapPin, BookOpen, 
  Gamepad2, Sparkles, Trophy, Star, Shield, Zap 
} from 'lucide-react';
import AutoText from './AutoText';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    role: 'student',
    interests: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await register(formData);
    if (result.success) {
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative">
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <Star className="w-2 h-2 text-pink-400 opacity-60" />
          </div>
        ))}
      </div>

      {/* Glass morphism container */}
      <div className="backdrop-blur-xl bg-black/40 border border-purple-500/30 rounded-3xl m-10 p-7 shadow-2xl relative overflow-hidden w-full max-w-2xl">
        {/* Top gaming badge */}
        <div className="relative z-10 flex justify-center mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title Section */}
        <div className="relative z-10 text-center mb-6">
          <AutoText 
            tag="h2"
            className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3"
          >
            Create Your Character!
          </AutoText>
          {/* Achievement badges */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-full p-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="bg-blue-500/20 border border-blue-500/40 rounded-full p-2">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div className="bg-green-500/20 border border-green-500/40 rounded-full p-2">
              <Zap className="w-4 h-4 text-green-400" />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="relative z-10 mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500 p-1 rounded-full">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <AutoText className="text-red-200 font-medium">{error}</AutoText>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          {/* First Row - Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="space-y-3">
              <label 
                htmlFor="name" 
                className="flex items-center space-x-3 text-white/90 font-medium text-base"
              >
                <div className="p-2.5 rounded-lg bg-gray-800/60 border border-gray-600/40">
                  <User className="w-5 h-5" />
                </div>
                <AutoText>Character Name</AutoText>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-900/70 border border-gray-600/60 rounded-xl px-4 py-4 text-white text-base placeholder-gray-300 focus:outline-none focus:border-purple-400/80 focus:bg-gray-800/80 transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <label 
                htmlFor="email" 
                className="flex items-center space-x-3 text-white/90 font-medium text-base"
              >
                <div className="p-2.5 rounded-lg bg-gray-800/60 border border-gray-600/40">
                  <Mail className="w-5 h-5" />
                </div>
                <AutoText>Email Address</AutoText>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-900/70 border border-gray-600/60 rounded-xl px-4 py-4 text-white text-base placeholder-gray-300 focus:outline-none focus:border-purple-400/80 focus:bg-gray-800/80 transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Second Row - Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password Field */}
            <div className="space-y-3">
              <label 
                htmlFor="password" 
                className="flex items-center space-x-3 text-white/90 font-medium text-base"
              >
                <div className="p-2.5 rounded-lg bg-gray-800/60 border border-gray-600/40">
                  <Lock className="w-5 h-5" />
                </div>
                <AutoText>Secret Code</AutoText>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-900/70 border border-gray-600/60 rounded-xl px-4 py-4 pr-12 text-white text-base placeholder-gray-300 focus:outline-none focus:border-purple-400/80 focus:bg-gray-800/80 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-3">
              <label 
                htmlFor="confirmPassword" 
                className="flex items-center space-x-3 text-white/90 font-medium text-base"
              >
                <div className="p-2.5 rounded-lg bg-gray-800/60 border border-gray-600/40">
                  <Shield className="w-5 h-5" />
                </div>
                <AutoText>Confirm Code</AutoText>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-gray-900/70 border border-gray-600/60 rounded-xl px-4 py-4 pr-12 text-white text-base placeholder-gray-300 focus:outline-none focus:border-purple-400/80 focus:bg-gray-800/80 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Location Field */}
          <div className="space-y-3">
            <label 
              htmlFor="location" 
              className="flex items-center space-x-3 text-white/90 font-medium text-base"
            >
              <div className="p-2.5 rounded-lg bg-gray-800/60 border border-gray-600/40">
                <MapPin className="w-5 h-5" />
              </div>
              <AutoText>Home Base</AutoText>
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-gray-900/70 border border-gray-600/60 rounded-xl px-4 py-4 text-white text-base placeholder-gray-300 focus:outline-none focus:border-purple-400/80 focus:bg-gray-800/80 transition-all duration-300 backdrop-blur-sm"
              placeholder="Your village/city"
              required
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <AutoText 
              tag="label"
              className="text-white/90 font-medium text-base text-center block"
            >
              Select Your Role
            </AutoText>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Role */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  formData.role === 'student'
                    ? 'bg-gradient-to-br from-purple-600/40 to-pink-600/40 border-purple-400 shadow-lg shadow-purple-500/30'
                    : 'bg-gray-800/50 border-gray-600/50 hover:border-purple-500/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-4 rounded-full ${
                    formData.role === 'student' 
                      ? 'bg-purple-500/30 border-2 border-purple-400' 
                      : 'bg-gray-700/50 border-2 border-gray-600'
                  }`}>
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <AutoText tag="h3" className="text-xl font-bold text-white mb-2">
                      Student
                    </AutoText>
                    <AutoText className="text-sm text-gray-300">
                      Learn, practice, and complete quizzes
                    </AutoText>
                  </div>
                  {formData.role === 'student' && (
                    <div className="flex items-center gap-2 text-purple-300">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-semibold">Selected</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Researcher Role */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'researcher' })}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  formData.role === 'researcher'
                    ? 'bg-gradient-to-br from-blue-600/40 to-cyan-600/40 border-blue-400 shadow-lg shadow-blue-500/30'
                    : 'bg-gray-800/50 border-gray-600/50 hover:border-blue-500/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-4 rounded-full ${
                    formData.role === 'researcher' 
                      ? 'bg-blue-500/30 border-2 border-blue-400' 
                      : 'bg-gray-700/50 border-2 border-gray-600'
                  }`}>
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <AutoText tag="h3" className="text-xl font-bold text-white mb-2">
                      Researcher
                    </AutoText>
                    <AutoText className="text-sm text-gray-300">
                      Create content and explore advanced topics
                    </AutoText>
                  </div>
                  {formData.role === 'researcher' && (
                    <div className="flex items-center gap-2 text-blue-300">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-semibold">Selected</span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/10 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 relative"
              style={{ 
                width: `${
                  formData.name && formData.email && formData.password && formData.confirmPassword && formData.location
                    ? '100' 
                    : Object.values(formData).filter(v => Array.isArray(v) ? v.length > 0 : v).length * 18
                }%` 
              }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="relative flex items-center justify-center space-x-3">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <AutoText>Creating Character...</AutoText>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <AutoText>Join the Adventure!</AutoText>
                  <Trophy className="w-6 h-6" />
                </>
              )}
            </div>
          </button>
        </form>

        {/* Login Link */}
        <div className="relative z-10 mt-8 text-center">
          <p className="text-white/80 text-lg">
            <AutoText>Already have an account? </AutoText>
            <Link 
              to="/login" 
              className="text-purple-300 hover:text-purple-200 font-semibold transition-colors duration-200 hover:underline"
            >
              <AutoText>Continue Your Adventure</AutoText>
            </Link>
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-6 right-6 opacity-30">
          <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
        </div>
        <div className="absolute bottom-6 left-6 opacity-30">
          <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default Register;