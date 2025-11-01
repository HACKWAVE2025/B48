import React, { useState, useEffect } from 'react';
import { Zap, Star, Trophy, Crown, Award, X } from 'lucide-react';

const XPNotification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setShouldAnimate(true);
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setShouldAnimate(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!notification || !isVisible) return null;

  const getActionIcon = (action) => {
    switch (action) {
      case 'daily_challenge_correct':
        return <Star className="w-5 h-5" />;
      case 'quiz_set_completed':
        return <Award className="w-5 h-5" />;
      case 'simulation_completed':
        return <Zap className="w-5 h-5" />;
      case 'note_written':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'daily_challenge_correct':
        return 'from-yellow-500 to-orange-600';
      case 'quiz_set_completed':
        return 'from-blue-500 to-purple-600';
      case 'simulation_completed':
        return 'from-green-500 to-teal-600';
      case 'note_written':
        return 'from-purple-500 to-pink-600';
      case 'message':
        return 'from-indigo-600 to-purple-700';
      case 'join_room':
        return 'from-cyan-600 to-blue-700';
      case 'video_call':
        return 'from-emerald-600 to-green-700';
      default:
        return 'from-blue-600 to-purple-700';
    }
  };

  const getActionMessage = (action, xpAwarded) => {
    switch (action) {
      case 'daily_challenge_correct':
        return `Daily challenge completed! +${xpAwarded} XP`;
      case 'daily_challenge_wrong':
        return `Keep trying! +${xpAwarded} XP for effort`;
      case 'quiz_set_completed':
        return `Quiz completed! +${xpAwarded} XP`;
      case 'quiz_bonus_80_percent':
        return `High score bonus! +${xpAwarded} XP`;
      case 'simulation_completed':
        return `Simulation mastered! +${xpAwarded} XP`;
      case 'note_written':
        return `Great reflection! +${xpAwarded} XP`;
      case 'chat_message':
        return `Community participation! +${xpAwarded} XP`;
      case 'message':
        return `Message sent! +${xpAwarded} XP`;
      case 'join_room':
        return `Joined session! +${xpAwarded} XP`;
      case 'video_call':
        return `Video call started! +${xpAwarded} XP`;
      case 'maintaining_streak_7':
        return `7-day streak bonus! +${xpAwarded} XP`;
      case 'maintaining_streak_30':
        return `30-day streak milestone! +${xpAwarded} XP`;
      case 'maintaining_streak_100':
        return `100-day streak legend! +${xpAwarded} XP`;
      default:
        return `+${xpAwarded} XP earned!`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={`transform transition-all duration-300 ${
          shouldAnimate 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
        }`}
      >
        <div className={`bg-gradient-to-r ${getActionColor(notification.action)} rounded-lg shadow-lg p-4 text-white min-w-[320px] max-w-md relative overflow-hidden`}>
          {/* Background decoration */}
          <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-30 rounded-full shadow-lg">
                  {getActionIcon(notification.action)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base drop-shadow-lg">
                    {getActionMessage(notification.action, notification.xpAwarded)}
                  </p>
                  <p className="text-sm font-medium opacity-95 mt-1 drop-shadow">
                    Total XP: {notification.totalXP?.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white hover:bg-opacity-30 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Level up notification */}
            {notification.leveledUp && (
              <div className="mt-3 pt-3 border-t border-white border-opacity-20">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-yellow-300" />
                  <div>
                    <p className="font-bold text-sm">Level Up!</p>
                    <p className="text-xs opacity-90">
                      You reached Level {notification.level}!
                    </p>
                  </div>
                </div>
                
                {/* New unlocks */}
                {notification.unlocks && notification.unlocks.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium">🎉 New unlock:</p>
                    <p className="text-xs opacity-90">{notification.unlocks[0]}</p>
                  </div>
                )}
              </div>
            )}

            {/* New badges */}
            {notification.newBadges && notification.newBadges.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white border-opacity-20">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <p className="text-xs font-medium">
                    New badge{notification.newBadges.length > 1 ? 's' : ''} earned!
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {notification.newBadges.slice(0, 3).map((badge, index) => (
                    <span key={index} className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                      {badge.icon} {badge.name}
                    </span>
                  ))}
                  {notification.newBadges.length > 3 && (
                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                      +{notification.newBadges.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Progress bar animation */}
          <div className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 w-full">
            <div 
              className="h-full bg-white bg-opacity-60 transition-all duration-5000 ease-linear"
              style={{
                width: shouldAnimate ? '0%' : '100%'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XPNotification;