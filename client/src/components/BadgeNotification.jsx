import React, { useState, useEffect } from 'react';
import { X, Trophy, Star } from 'lucide-react';

const BadgeNotification = ({ badges, onClose }) => {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (badges.length === 0) return;

    const timer = setTimeout(() => {
      if (currentBadgeIndex < badges.length - 1) {
        setCurrentBadgeIndex(prev => prev + 1);
      } else {
        handleClose();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentBadgeIndex, badges.length]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (badges.length === 0 || !isVisible) return null;

  const currentBadge = badges[currentBadgeIndex];

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
      <div className="bg-white border border-[#93DA97] rounded-2xl p-6 shadow-2xl max-w-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-[#5E936C]" />
            <span className="text-[#3E5F44] font-bold">Badge Earned!</span>
          </div>
          <button
            onClick={handleClose}
            className="text-[#557063] hover:text-[#3E5F44] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <div className="text-6xl mb-3 animate-bounce">
            {currentBadge.icon}
          </div>
          <h3 className="text-xl font-bold text-[#3E5F44] mb-2">
            {currentBadge.name}
          </h3>
          <p className="text-[#557063] text-sm mb-4">
            {currentBadge.description}
          </p>

          {badges.length > 1 && (
            <div className="flex justify-center space-x-1">
              {badges.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentBadgeIndex ? 'bg-[#5E936C]' : 'bg-[#93DA97]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#E8FFD7]/20 to-[#93DA97]/20 rounded-2xl animate-pulse pointer-events-none"></div>
      </div>
    </div>
  );
};

export default BadgeNotification;