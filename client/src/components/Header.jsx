import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, User, LogOut, ChevronDown, Brain, Beaker, MessageCircle, Trophy, Award } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import AutoText from './AutoText';

const Header = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  return (
    <nav className="relative z-20 flex items-center justify-between px-6 py-4 bg-white border-b border-[#93DA97]/30 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="bg-[#5E936C] p-2 rounded-lg shadow-sm">
          <Gamepad2 className="w-6 h-6 text-white" />
        </div>
        <Link to="/dashboard" className="text-xl font-semibold text-[#3E5F44] hover:text-[#5E936C] transition-colors duration-200">
          <AutoText>Rural Quest</AutoText>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Navigation Links - only show when logged in */}
        {user && (
          <div className="hidden md:flex items-center space-x-3">
            <Link 
              to="/quiz" 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#E8FFD7] hover:bg-[#93DA97]/30 border border-[#93DA97]/30 hover:border-[#5E936C] text-[#3E5F44] transition-all duration-200"
            >
              <Brain className="w-4 h-4" />
              <AutoText>Quiz</AutoText>
            </Link>
            <Link 
              to="/simulations" 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#E8FFD7] hover:bg-[#93DA97]/30 border border-[#93DA97]/30 hover:border-[#5E936C] text-[#3E5F44] transition-all duration-200"
            >
              <Beaker className="w-4 h-4" />
              <AutoText>Simulations</AutoText>
            </Link>
            <Link 
              to="/leaderboard" 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#E8FFD7] hover:bg-[#93DA97]/30 border border-[#93DA97]/30 hover:border-[#5E936C] text-[#3E5F44] transition-all duration-200"
            >
              <Trophy className="w-4 h-4" />
              <AutoText>Leaderboard</AutoText>
            </Link>
            <Link 
              to="/badges" 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#E8FFD7] hover:bg-[#93DA97]/30 border border-[#93DA97]/30 hover:border-[#5E936C] text-[#3E5F44] transition-all duration-200"
            >
              <Award className="w-4 h-4" />
              <AutoText>Badges</AutoText>
            </Link>
            <Link 
              to="/learn-animations" 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#E8FFD7] hover:bg-[#93DA97]/30 border border-[#93DA97]/30 hover:border-[#5E936C] text-[#3E5F44] transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4" />
              <AutoText>AI Learning</AutoText>
            </Link>
          </div>
        )}

        {/* Language Switcher */}
        <LanguageSwitcher />
        
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 px-4 py-2 bg-[#E8FFD7] border border-[#93DA97]/50 rounded-lg transition-all duration-200 hover:border-[#5E936C] focus:outline-none focus:ring-2 focus:ring-[#5E936C]/20"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#5E936C] flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[#3E5F44] font-medium truncate">{user.name}</span>
                <span className="text-gray-500 text-xs">Level {user?.level || 1}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#93DA97]/50 rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={handleProfileClick}
                  className="w-full px-4 py-3 text-left text-[#3E5F44] hover:bg-[#E8FFD7] transition-colors duration-200 flex items-center space-x-3"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link 
              to="/register"
              className="px-4 py-2 bg-[#E8FFD7] hover:bg-[#93DA97]/30 border border-[#93DA97]/50 rounded-lg text-[#3E5F44] font-medium transition-all duration-200"
            >
              <AutoText>Join Quest</AutoText>
            </Link>
            <Link 
              to="/login"
              className="px-6 py-2 bg-[#5E936C] hover:bg-[#3E5F44] rounded-lg text-white font-medium transition-all duration-200 shadow-sm"
            >
              <AutoText>Start Quest</AutoText>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;
