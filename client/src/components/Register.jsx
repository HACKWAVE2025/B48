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
    <div className="w-full min-h-screen bg-gradient-to-br from-[#E8FFD7] to-white flex items-center justify-center p-4">
      {/* Clean container */}
      <div className="bg-white border border-[#93DA97]/30 rounded-2xl p-8 shadow-lg w-full max-w-2xl">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#5E936C] p-4 rounded-xl shadow-sm">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-6">
          <AutoText 
            tag="h2"
            className="text-3xl font-semibold text-[#3E5F44] mb-2"
          >
            Create Your Account
          </AutoText>
          <p className="text-[#556b5b]">Join the learning community today</p>
          {/* Achievement badges */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className="bg-[#E8FFD7] border border-[#93DA97]/40 rounded-full p-2">
              <Trophy className="w-4 h-4 text-[#5E936C]" />
            </div>
            <div className="bg-[#E8FFD7] border border-[#93DA97]/40 rounded-full p-2">
              <Shield className="w-4 h-4 text-[#5E936C]" />
            </div>
            <div className="bg-[#E8FFD7] border border-[#93DA97]/40 rounded-full p-2">
              <Zap className="w-4 h-4 text-[#5E936C]" />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500 p-1 rounded-full">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <AutoText className="text-red-700 font-medium">{error}</AutoText>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Row - Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name Field */}
            <div className="space-y-3">
              <label 
                htmlFor="name" 
                className="flex items-center space-x-3 text-[#3E5F44] font-medium text-base"
              >
                <div className="p-2.5 rounded-lg bg-[#E8FFD7] border border-[#93DA97]/40">
                  <User className="w-5 h-5 text-[#5E936C]" />
                </div>
                <AutoText>Full name</AutoText>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white border border-[#93DA97]/30 rounded-xl px-4 py-3 text-[#0f172a] text-base placeholder-gray-400 focus:outline-none focus:border-[#5E936C] focus:ring-[#5E936C]/20 transition-all duration-200"
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <label 
                htmlFor="email" 
                className="flex items-center space-x-3 text-[#3E5F44] font-medium text-base"
              >
                <div className="p-2.5 rounded-lg bg-[#E8FFD7] border border-[#93DA97]/40">
                  <Mail className="w-5 h-5 text-[#5E936C]" />
                </div>
                <AutoText>Email Address</AutoText>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white border border-[#93DA97]/30 rounded-xl px-4 py-3 text-[#0f172a] text-base placeholder-gray-400 focus:outline-none focus:border-[#5E936C] focus:ring-[#5E936C]/20 transition-all duration-200"
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
                className="flex items-center space-x-3 text-[#3E5F44] font-medium text-base"
              >
                <div className="p-2.5 rounded-lg bg-[#E8FFD7] border border-[#93DA97]/40">
                  <Lock className="w-5 h-5 text-[#5E936C]" />
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
                  className="w-full bg-white border border-[#93DA97]/30 rounded-xl px-4 py-3 pr-12 text-[#0f172a] text-base placeholder-gray-400 focus:outline-none focus:border-[#5E936C] focus:ring-[#5E936C]/20 transition-all duration-200"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#5E936C] hover:text-[#3E5F44] transition-colors duration-150"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-3">
              <label 
                htmlFor="confirmPassword" 
                className="flex items-center space-x-3 text-[#3E5F44] font-medium text-base"
              >
                <div className="p-2.5 rounded-lg bg-[#E8FFD7] border border-[#93DA97]/40">
                  <Shield className="w-5 h-5 text-[#5E936C]" />
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
                  className="w-full bg-white border border-[#93DA97]/30 rounded-xl px-4 py-3 pr-12 text-[#0f172a] text-base placeholder-gray-400 focus:outline-none focus:border-[#5E936C] focus:ring-[#5E936C]/20 transition-all duration-200"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#5E936C] hover:text-[#3E5F44] transition-colors duration-150"
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
              className="flex items-center space-x-3 text-[#3E5F44] font-medium text-base"
            >
              <div className="p-2.5 rounded-lg bg-[#E8FFD7] border border-[#93DA97]/40">
                <MapPin className="w-5 h-5 text-[#5E936C]" />
              </div>
              <AutoText>Location</AutoText>
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-white border border-[#93DA97]/30 rounded-xl px-4 py-3 text-[#0f172a] text-base placeholder-gray-400 focus:outline-none focus:border-[#5E936C] focus:ring-[#5E936C]/20 transition-all duration-200"
              placeholder="City / Town"
              required
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <AutoText 
                tag="label"
                className="text-[#3E5F44] font-medium text-base text-center block"
              >
                Select Your Role
              </AutoText>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Role */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  formData.role === 'student'
                    ? 'bg-gradient-to-br from-[#5E936C]/20 to-[#93DA97]/20 border-[#5E936C] shadow-sm'
                    : 'bg-[#E8FFD7] border-[#93DA97]/30 hover:border-[#5E936C]'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-4 rounded-full ${
                    formData.role === 'student' 
                      ? 'bg-[#5E936C]/20 border-2 border-[#5E936C]' 
                      : 'bg-[#E8FFD7] border-2 border-[#93DA97]'
                  }`}>
                    <BookOpen className="w-8 h-8 text-[#3E5F44]" />
                  </div>
                  <div className="text-center">
                    <AutoText tag="h3" className="text-xl font-bold text-[#3E5F44] mb-2">
                      Student
                    </AutoText>
                    <AutoText className="text-sm text-[#557063]">
                      Learn, practice, and complete quizzes
                    </AutoText>
                  </div>
                  {formData.role === 'student' && (
                    <div className="flex items-center gap-2 text-[#5E936C]">
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
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  formData.role === 'researcher'
                    ? 'bg-gradient-to-br from-[#5E936C]/20 to-[#93DA97]/20 border-[#5E936C] shadow-sm'
                    : 'bg-[#E8FFD7] border-[#93DA97]/30 hover:border-[#5E936C]'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-4 rounded-full ${
                    formData.role === 'researcher' 
                      ? 'bg-[#5E936C]/20 border-2 border-[#5E936C]' 
                      : 'bg-[#E8FFD7] border-2 border-[#93DA97]'
                  }`}>
                    <Zap className="w-8 h-8 text-[#3E5F44]" />
                  </div>
                  <div className="text-center">
                    <AutoText tag="h3" className="text-xl font-bold text-[#3E5F44] mb-2">
                      Researcher
                    </AutoText>
                    <AutoText className="text-sm text-[#557063]">
                      Create content and explore advanced topics
                    </AutoText>
                  </div>
                  {formData.role === 'researcher' && (
                    <div className="flex items-center gap-2 text-[#5E936C]">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-semibold">Selected</span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-[#f1fbef] rounded-full h-3 overflow-hidden border border-[#e6f6e6]">
            <div 
              className="h-full bg-gradient-to-r from-[#5E936C] to-[#93DA97] rounded-full transition-all duration-500 relative"
              style={{ 
                width: `${
                  formData.name && formData.email && formData.password && formData.confirmPassword && formData.location
                    ? '100' 
                    : Math.min(100, Object.values(formData).filter(v => Array.isArray(v) ? v.length > 0 : v).length * 18)
                }%` 
              }}
            >
              <div className="absolute inset-0 bg-white/10"></div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5E936C] hover:bg-[#3E5F44] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-sm relative overflow-hidden"
          >
            <div className="relative flex items-center justify-center space-x-3">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <AutoText>Creating account...</AutoText>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-white" />
                  <AutoText>Get Started</AutoText>
                  <Trophy className="w-5 h-5 text-white" />
                </>
              )}
            </div>
          </button>
        </form>

        {/* Login Link */}
        <div className="relative z-10 mt-8 text-center">
          <p className="text-[#3E5F44] text-lg">
            <AutoText>Already have an account? </AutoText>
            <Link 
              to="/login" 
              className="text-[#5E936C] hover:text-[#3E5F44] font-semibold transition-colors duration-200 hover:underline"
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