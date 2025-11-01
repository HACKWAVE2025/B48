import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Award, Star, Medal, TrendingUp, Users, Zap, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AutoText from './AutoText';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/xp/leaderboard?limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-5 h-5 text-[#5E936C]" />;
    }
  };

  const getPositionGradient = (position) => {
    switch (position) {
      case 1:
        return 'from-yellow-400 to-orange-400';
      case 2:
        return 'from-gray-300 to-gray-400';
      case 3:
        return 'from-amber-400 to-orange-500';
      default:
        return 'from-[#E8FFD7] to-[#93DA97]/30';
    }
  };

  const getLevelBadgeColor = (level) => {
    return 'bg-blue-500'; // Consistent blue for all levels
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#E8FFD7] to-white">
        <div className="bg-white border border-[#93DA97]/30 rounded-3xl p-8 shadow-sm w-full max-w-4xl">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-[#E8FFD7]/30 rounded-xl animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#E8FFD7] to-white">
        <div className="bg-white border border-red-300 rounded-3xl p-8 shadow-sm text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-red-500 opacity-50" />
          <p className="text-red-700 text-lg mb-4">Error loading leaderboard: {error}</p>
          <button 
            onClick={fetchLeaderboard}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#E8FFD7] to-white">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="bg-white border border-[#93DA97]/30 rounded-3xl p-8 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] p-4 rounded-full shadow-sm">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#3E5F44]">
                  <AutoText>Weekly Leaderboard</AutoText>
                </h1>
                <p className="text-[#557063] text-lg">
                  <AutoText>Top learners competing this week</AutoText>
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#3E5F44] hover:to-[#5E936C] text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-sm"
            >
              <AutoText>Back to Dashboard</AutoText>
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white border border-[#93DA97]/30 rounded-3xl shadow-sm overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <h3 className="text-2xl font-bold text-[#3E5F44] mb-2">
                <AutoText>No Competition Data</AutoText>
              </h3>
              <p className="text-[#557063]">
                <AutoText>Complete some challenges to see the leaderboard!</AutoText>
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.user.id}
                  className={`p-6 transition-all duration-200 ${
                    entry.position <= 3 
                      ? `bg-gradient-to-r ${getPositionGradient(entry.position)}` 
                      : 'hover:bg-[#E8FFD7]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Position */}
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          entry.position <= 3 
                            ? 'bg-white/30 backdrop-blur-sm' 
                            : 'bg-[#E8FFD7] border border-[#93DA97]/30'
                        }`}>
                          <span className={`font-bold text-lg ${
                            entry.position <= 3 ? 'text-white' : 'text-[#3E5F44]'
                          }`}>
                            #{entry.position}
                          </span>
                        </div>
                        {getPositionIcon(entry.position)}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                          {entry.user.avatar ? (
                            <img
                              src={entry.user.avatar}
                              alt={entry.user.name}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-lg">
                              {entry.user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <h3 className={`font-bold text-xl ${
                            entry.position <= 3 ? 'text-white' : 'text-[#3E5F44]'
                          }`}>
                            {entry.user.name}
                          </h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getLevelBadgeColor(entry.level)} text-white shadow-sm`}>
                              Level {entry.level}
                            </span>
                            {entry.streak > 0 && (
                              <span className={`flex items-center space-x-1 ${
                                entry.position <= 3 ? 'text-white' : 'text-orange-500'
                              }`}>
                                <span className="text-sm font-medium">🔥 {entry.streak} day streak</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-2 mb-1">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <p className={`font-bold text-2xl ${
                          entry.position <= 3 ? 'text-white' : 'text-[#3E5F44]'
                        }`}>
                          {entry.xp.toLocaleString()}
                        </p>
                      </div>
                      <p className={`text-sm ${
                        entry.position <= 3 ? 'text-white/90' : 'text-[#557063]'
                      }`}>
                        Total XP
                      </p>
                      {entry.badgeCount > 0 && (
                        <div className="flex items-center justify-end space-x-1 mt-2">
                          <Award className="w-4 h-4 text-purple-400" />
                          <p className={`text-sm font-medium ${
                            entry.position <= 3 ? 'text-white/90' : 'text-purple-500'
                          }`}>
                            {entry.badgeCount} badges
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="bg-[#E8FFD7]/30 px-6 py-4 text-center border-t border-[#93DA97]/30">
            <p className="text-[#557063] text-sm">
              <AutoText>Leaderboard updates weekly. Keep learning to climb the ranks!</AutoText> 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;