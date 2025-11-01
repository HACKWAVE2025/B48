import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Gamepad2, Sparkles, Shield, Zap, Trophy, Star } from 'lucide-react';
import AutoText from './AutoText';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState('');

  const { login, error, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData);
    if (result.success) {
      navigate(from, { replace: true });
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#E8FFD7] to-white flex items-center justify-center p-4">
      {/* Clean container */}
      <div className="bg-white border border-[#93DA97]/30 rounded-2xl p-8 shadow-lg w-full max-w-md">
          
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#5E936C] p-4 rounded-xl shadow-sm">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <AutoText 
              tag="h1"
              className="text-3xl font-semibold text-[#3E5F44] mb-2"
            >
              Welcome Back
            </AutoText>
            <AutoText 
              tag="p"
              className="text-gray-600 text-base"
            >
              Continue your learning journey
            </AutoText>
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
                <AutoText className="text-red-200 font-medium">{error}</AutoText>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="flex items-center space-x-3 text-white/90 font-medium text-sm"
              >
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  activeField === 'email' 
                    ? 'bg-[#5E936C] border border-[#5E936C]' 
                    : 'bg-[#E8FFD7] border border-[#93DA97]/40'
                }`}>
                  <Mail className="w-4 h-4 text-[#3E5F44]" />
                </div>
                <AutoText>Email Address</AutoText>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField('')}
                  className="w-full bg-white border border-[#93DA97]/50 rounded-lg px-4 py-3 text-[#3E5F44] placeholder-gray-400 focus:outline-none focus:border-[#5E936C] focus:ring-2 focus:ring-[#5E936C]/20 transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="flex items-center space-x-3 text-[#3E5F44] font-medium text-sm"
              >
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  activeField === 'password' 
                    ? 'bg-[#5E936C] border border-[#5E936C]' 
                    : 'bg-[#E8FFD7] border border-[#93DA97]/40'
                }`}>
                  <Lock className="w-4 h-4 text-[#3E5F44]" />
                </div>
                <AutoText>Password</AutoText>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField('')}
                  className="w-full bg-white border border-[#93DA97]/50 rounded-lg px-4 py-3 pr-12 text-[#3E5F44] placeholder-gray-400 focus:outline-none focus:border-[#5E936C] focus:ring-2 focus:ring-[#5E936C]/20 transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#5E936C] transition-colors duration-200"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-[#E8FFD7] rounded-full h-2 overflow-hidden border border-[#93DA97]/30">
              <div 
                className="h-full bg-[#5E936C] rounded-full transition-all duration-500"
                style={{ width: `${formData.email && formData.password ? '100' : formData.email || formData.password ? '50' : '10'}%` }}
              >
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5E936C] hover:bg-[#3E5F44] disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <AutoText>Signing in...</AutoText>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <AutoText>Sign In</AutoText>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              <AutoText>Don't have an account? </AutoText>
              <Link 
                to="/register" 
                className="text-[#5E936C] hover:text-[#3E5F44] font-semibold transition-colors duration-200"
              >
                <AutoText>Sign Up</AutoText>
              </Link>
            </p>
          </div>
        </div>
    </div>
  );
};

export default Login;