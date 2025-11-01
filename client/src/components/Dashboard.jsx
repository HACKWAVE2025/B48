import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Star, BookOpen, Target, Crown, Zap, Brain, Beaker, Flame, FileText, Sparkles, Users, TrendingUp, Award, Calendar, Plus, ChevronRight } from 'lucide-react';
import AutoText from './AutoText';
import XPDisplay from './XPDisplay';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [streakData, setStreakData] = useState({
    currentStreak: user?.currentStreak || user?.streak || 0,
    longestStreak: user?.longestStreak || 0
  });

  // Refresh user data when component mounts and periodically
  useEffect(() => {
    const refreshData = async () => {
      await refreshUserData();
    };

    // Refresh immediately
    refreshData();

    // Set up interval to refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);

    // Listen for auth state changes
    const handleAuthChange = () => {
      refreshData();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [refreshUserData]);

  // Update streak data when user data changes
  useEffect(() => {
    if (user) {
      setStreakData({
        currentStreak: user.currentStreak || user.streak || 0,
        longestStreak: user.longestStreak || 0
      });
    }
  }, [user]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#E8FFD7] to-white px-5 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white border border-[#93DA97]/30 rounded-2xl p-8 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-3">
                <div className="bg-[#5E936C] p-3 rounded-xl shadow-sm">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-[#3E5F44]">
                    <AutoText>Welcome back</AutoText>, <span className="text-[#5E936C]">{user?.name}</span>
                  </h1>
                  <p className="text-gray-600 text-base mt-1">
                    <AutoText>Ready to collaborate and learn together?</AutoText>
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center bg-[#E8FFD7] p-4 rounded-xl border border-[#93DA97]/40">
                <div className="flex items-center justify-center w-11 h-11 bg-[#5E936C] rounded-lg mb-2 mx-auto">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-[#3E5F44]">
                  <AutoText>Level</AutoText> {user?.level || 1}
                </p>
              </div>
              <div className="text-center bg-[#E8FFD7] p-4 rounded-xl border border-[#93DA97]/40">
                <div className="flex items-center justify-center w-11 h-11 bg-[#5E936C] rounded-lg mb-2 mx-auto">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-[#3E5F44]">
                  {user?.points || 0} <AutoText tag="span">XP</AutoText>
                </p>
              </div>
              <div className="text-center bg-[#E8FFD7] p-4 rounded-xl border border-[#93DA97]/40">
                <div className="flex items-center justify-center w-11 h-11 bg-[#5E936C] rounded-lg mb-2 mx-auto">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-[#3E5F44]">
                  {streakData.currentStreak} <AutoText tag="span">days</AutoText>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-[#93DA97]/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center">
              <div className="p-2.5 bg-[#93DA97] rounded-lg group-hover:bg-[#5E936C] transition-colors duration-200">
                <Star className="h-5 w-5 text-[#3E5F44]" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">
                  <AutoText>Total XP</AutoText>
                </p>
                <p className="text-xl font-semibold text-[#3E5F44]">{user?.points || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#93DA97]/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center">
              <div className="p-2.5 bg-[#93DA97] rounded-lg group-hover:bg-[#5E936C] transition-colors duration-200">
                <Trophy className="h-5 w-5 text-[#3E5F44]" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">
                  <AutoText>Achievements</AutoText>
                </p>
                <p className="text-xl font-semibold text-[#3E5F44]">{user?.achievements || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#93DA97]/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center">
              <div className="p-2.5 bg-[#93DA97] rounded-lg group-hover:bg-[#5E936C] transition-colors duration-200">
                <BookOpen className="h-5 w-5 text-[#3E5F44]" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">
                  <AutoText>Courses</AutoText>
                </p>
                <p className="text-xl font-semibold text-[#3E5F44]">{user?.completedCourses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#93DA97]/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center">
              <div className="p-2.5 bg-[#93DA97] rounded-lg group-hover:bg-[#5E936C] transition-colors duration-200">
                <Target className="h-5 w-5 text-[#3E5F44]" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">
                  <AutoText>Streak</AutoText>
                </p>
                <p className="text-xl font-semibold text-[#3E5F44]">
                  {streakData.currentStreak} <AutoText tag="span">days</AutoText>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 NEW: MY STUDY GROUPS - TOP PRIORITY */}
        <div className="bg-white border border-[#93DA97]/30 rounded-2xl p-7 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-[#5E936C] p-3 rounded-xl shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#3E5F44]">
                  <AutoText>My Study Groups</AutoText>
                </h2>
                <p className="text-gray-600 text-sm mt-0.5">
                  <AutoText>Collaborate with peers in structured learning sessions</AutoText>
                </p>
              </div>
            </div>
            <Link 
              to="/community" 
              className="bg-[#5E936C] hover:bg-[#3E5F44] text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <AutoText>Create Study Group</AutoText>
            </Link>
          </div>

          {/* Active Sessions Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#E8FFD7]/50 hover:bg-[#E8FFD7] border border-[#93DA97]/50 hover:border-[#5E936C]/40 rounded-xl p-5 cursor-pointer transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[#3E5F44] text-base mb-1">
                    <AutoText>Operating Systems Study Group</AutoText>
                  </h3>
                  <p className="text-[#5E936C] text-sm">
                    <AutoText>Next: Today at 6:00 PM</AutoText>
                  </p>
                </div>
                <div className="bg-[#93DA97] text-[#3E5F44] px-3 py-1 rounded-full text-xs font-semibold">
                  <AutoText>ACTIVE</AutoText>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>4/6 members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>5 sessions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>78% avg</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/community"
                  className="flex-1 bg-[#5E936C] hover:bg-[#3E5F44] text-white px-4 py-2 rounded-lg transition-all duration-200 text-center text-sm font-medium"
                >
                  <AutoText>Join Session</AutoText>
                </Link>
                <button className="px-4 py-2 bg-white hover:bg-gray-50 text-[#3E5F44] border border-[#93DA97]/50 rounded-lg transition-all duration-200 text-sm font-medium">
                  <AutoText>Analytics</AutoText>
                </button>
              </div>
            </div>

            <div className="bg-[#E8FFD7]/50 hover:bg-[#E8FFD7] border border-[#93DA97]/50 hover:border-[#5E936C]/40 rounded-xl p-5 cursor-pointer transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[#3E5F44] text-base mb-1">
                    <AutoText>PhD Comprehensive Exam Prep</AutoText>
                  </h3>
                  <p className="text-[#5E936C] text-sm">
                    <AutoText>Next: Tomorrow at 3:00 PM</AutoText>
                  </p>
                </div>
                <div className="bg-[#93DA97]/60 text-[#3E5F44] px-3 py-1 rounded-full text-xs font-semibold">
                  <AutoText>SCHEDULED</AutoText>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>3/5 members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>12 sessions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>85% avg</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/community"
                  className="flex-1 bg-[#5E936C] hover:bg-[#3E5F44] text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium text-center text-sm"
                >
                  <AutoText>View Details</AutoText>
                </Link>
                <button className="px-4 py-2 bg-white hover:bg-gray-50 text-[#3E5F44] border border-[#93DA97]/50 rounded-lg transition-all duration-200 text-sm font-medium">
                  <AutoText>Invite</AutoText>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link 
              to="/community" 
              className="text-[#5E936C] hover:text-[#3E5F44] text-sm font-medium inline-flex items-center gap-1 transition-colors"
            >
              <AutoText>View all groups and sessions</AutoText>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Continue Learning */}
          <div className="lg:col-span-2 bg-white border border-[#93DA97]/30 rounded-2xl p-7 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-[#5E936C] p-3 rounded-xl shadow-sm">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-[#3E5F44]">
                <AutoText>Solo Learning Tools</AutoText>
              </h2>
            </div>
            <div className="space-y-3">


              {/* Resources */}
<div className="group p-5 bg-[#E8FFD7]/50 hover:bg-[#93DA97]/30 border border-[#93DA97]/50 hover:border-[#5E936C] rounded-xl cursor-pointer transition-all duration-200">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="bg-[#5E936C] group-hover:bg-[#3E5F44] p-2.5 rounded-lg transition-colors duration-200">
        <BookOpen className="h-5 w-5 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-[#3E5F44] group-hover:text-[#3E5F44] transition-colors duration-200 flex items-center space-x-2">
          <AutoText>Resources</AutoText>
          <Sparkles className="w-4 h-4 text-[#5E936C]" />
        </h3>
        <p className="text-sm text-gray-600">
          <AutoText>Access study guides, references & materials</AutoText>
        </p>
      </div>
    </div>
    <Link 
      to="/resources" 
      className="bg-[#5E936C] hover:bg-[#3E5F44] text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm text-sm font-medium"
    >
      <AutoText>Browse</AutoText>
    </Link>
  </div>
</div>

              <div className="group p-5 bg-[#E8FFD7]/50 hover:bg-[#93DA97]/30 border border-[#93DA97]/50 hover:border-[#5E936C] rounded-xl cursor-pointer transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#5E936C] group-hover:bg-[#3E5F44] p-2.5 rounded-lg transition-colors duration-200">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E5F44] transition-colors duration-200">
                        <AutoText>Learning Community</AutoText>
                      </h3>
                      <p className="text-sm text-gray-600">
                        <AutoText>Connect, chat, and grow with peers</AutoText>
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/community"
                    className="bg-[#5E936C] hover:bg-[#3E5F44] text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm text-sm font-medium"
                  >
                    <AutoText>Join</AutoText>
                  </Link>
                </div>
              </div>
              
              {/* AI Quiz Generator */}
              <div className="group p-5 bg-[#E8FFD7]/50 hover:bg-[#93DA97]/30 border border-[#93DA97]/50 hover:border-[#5E936C] rounded-xl cursor-pointer transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#5E936C] group-hover:bg-[#3E5F44] p-2.5 rounded-lg transition-colors duration-200">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E5F44] transition-colors duration-200">
                        <AutoText>AI Quiz Challenge</AutoText>
                      </h3>
                      <p className="text-sm text-gray-600">
                        <AutoText>Personalized quizzes powered by AI</AutoText>
                      </p>
                    </div>
                  </div>
                  <Link 
                    to="/quiz" 
                    className="bg-[#5E936C] hover:bg-[#3E5F44] text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm text-sm font-medium"
                  >
                    <AutoText>Start Quiz</AutoText>
                  </Link>
                </div>
              </div>

              {/* Interactive Simulations */}
              <div className="group p-5 bg-[#E8FFD7]/50 hover:bg-[#93DA97]/30 border border-[#93DA97]/50 hover:border-[#5E936C] rounded-xl cursor-pointer transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#5E936C] group-hover:bg-[#3E5F44] p-2.5 rounded-lg transition-colors duration-200">
                      <Beaker className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E5F44] transition-colors duration-200">
                        <AutoText>Interactive Simulations</AutoText>
                      </h3>
                      <p className="text-sm text-gray-600">
                        <AutoText>Explore science through virtual experiments</AutoText>
                      </p>
                    </div>
                  </div>
                  <Link 
                    to="/simulations" 
                    className="bg-[#5E936C] hover:bg-[#3E5F44] text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm text-sm font-medium"
                  >
                    <AutoText>Explore</AutoText>
                  </Link>
                </div>
              </div>

              {/* AI Learning Assistant */}
              <div className="group p-5 bg-[#E8FFD7]/50 hover:bg-[#93DA97]/30 border border-[#93DA97]/50 hover:border-[#5E936C] rounded-xl cursor-pointer transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#5E936C] group-hover:bg-[#3E5F44] p-2.5 rounded-lg transition-colors duration-200">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E5F44] transition-colors duration-200">
                        <AutoText>AI Learning Assistant</AutoText>
                      </h3>
                      <p className="text-sm text-gray-600">
                        <AutoText>Get instant help with animations and explanations</AutoText>
                      </p>
                    </div>
                  </div>
                  <Link 
                    to="/learn-animations" 
                    className="bg-[#5E936C] hover:bg-[#3E5F44] text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm text-sm font-medium"
                  >
                    <AutoText>Learn</AutoText>
                  </Link>
                </div>
              </div>
              {/* Interactive Learning Tools */}
              <div className="group p-5 bg-[#E8FFD7]/50 hover:bg-[#93DA97]/30 border border-[#93DA97]/50 hover:border-[#5E936C] rounded-xl cursor-pointer transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#5E936C] group-hover:bg-[#3E5F44] p-2.5 rounded-lg transition-colors duration-200">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E5F44] transition-colors duration-200">
                        <AutoText>Interactive Learning Tools</AutoText>
                      </h3>
                      <p className="text-sm text-gray-600">
                        <AutoText>Flashcards, Pomodoro timer, and mind maps</AutoText>
                      </p>
                    </div>
                  </div>
                  <Link 
                    to="/interactive-learning" 
                    className="bg-[#5E936C] hover:bg-[#3E5F44] text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm text-sm font-medium"
                  >
                    <AutoText>Study</AutoText>
                  </Link>
                </div>
              </div>

              {/* Badges & Achievements */}
              <div className="group p-5 bg-[#E8FFD7]/50 hover:bg-[#93DA97]/30 border border-[#93DA97]/50 hover:border-[#5E936C] rounded-xl cursor-pointer transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#5E936C] group-hover:bg-[#3E5F44] p-2.5 rounded-lg transition-colors duration-200">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E5F44] transition-colors duration-200">
                        <AutoText>Badges & Achievements</AutoText>
                      </h3>
                      <p className="text-sm text-gray-600">
                        <AutoText>Track your progress and unlock new badges</AutoText>
                      </p>
                    </div>
                  </div>
                  <Link 
                    to="/badges" 
                    className="bg-[#5E936C] hover:bg-[#3E5F44] text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm text-sm font-medium"
                  >
                    <AutoText>View Badges</AutoText>
                  </Link>
                </div>
              </div>

              {/* My Notes */}
              <div className="group p-5 bg-[#E8FFD7]/50 hover:bg-[#93DA97]/30 border border-[#93DA97]/50 hover:border-[#5E936C] rounded-xl cursor-pointer transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#5E936C] group-hover:bg-[#3E5F44] p-2.5 rounded-lg transition-colors duration-200">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3E5F44] transition-colors duration-200 flex items-center space-x-2">
                        <AutoText>My Notes</AutoText>
                        <Sparkles className="w-4 h-4 text-[#5E936C]" />
                      </h3>
                      <p className="text-sm text-gray-600">
                        <AutoText>Create and organize your study notes</AutoText>
                      </p>
                    </div>
                  </div>
                  <Link 
                    to="/notes" 
                    className="bg-[#5E936C] hover:bg-[#3E5F44] text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm text-sm font-medium"
                  >
                    <AutoText>Open Notes</AutoText>
                  </Link>
                </div>
              </div>
              

            </div>
          </div>

          {/* XP Display & Quick Actions */}
          <div className="space-y-4">
            {/* XP Display */}
            <XPDisplay userId={user?.id} showDetails={true} />

            {/* Daily Challenge */}
            <div className="bg-white border border-[#93DA97]/30 rounded-2xl p-6 shadow-sm group hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#5E936C] p-2 rounded-lg shadow-sm">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#3E5F44]">
                    <AutoText>Daily Challenge</AutoText>
                  </h3>
                </div>
                <div className="flex items-center space-x-2 bg-[#E8FFD7] border border-[#93DA97]/40 px-3 py-1 rounded-full">
                  <Flame className="w-4 h-4 text-[#5E936C]" />
                  <span className="font-semibold text-[#3E5F44]">{streakData.currentStreak}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                <AutoText>Complete today's question to maintain your streak!</AutoText>
              </p>
              <button 
                onClick={() => navigate('/daily-question')}
                className="w-full bg-[#5E936C] hover:bg-[#3E5F44] text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow"
              >
                <AutoText>Take Today's Challenge</AutoText>
              </button>
            </div>

            {/* Quick Navigation */}
            <div className="bg-white border border-[#93DA97]/30 rounded-2xl p-6 shadow-sm group hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#5E936C] p-2 rounded-lg shadow-sm">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#3E5F44]">
                    <AutoText>Weekly Competition</AutoText>
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                <AutoText>See how you rank against other learners this week!</AutoText>
              </p>
              <button 
                onClick={() => navigate('/leaderboard')}
                className="w-full bg-[#5E936C] hover:bg-[#3E5F44] text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow"
              >
                <AutoText>View Leaderboard</AutoText>
              </button>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;