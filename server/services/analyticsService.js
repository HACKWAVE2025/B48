const User = require('../models/User');
const badgeService = require('./badgeService');

class AnalyticsService {
  /**
   * Get comprehensive badge analytics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Analytics data
   */
  async getBadgeAnalytics(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const badges = await badgeService.getBadgesWithProgress(userId);
      
      // Calculate analytics
      const analytics = {
        overview: this.calculateOverview(badges, user),
        categoryBreakdown: this.calculateCategoryBreakdown(badges),
        progressTracking: this.calculateProgressTracking(badges),
        achievements: this.calculateAchievements(user, badges),
        streakAnalytics: this.calculateStreakAnalytics(user),
        quizPerformance: this.calculateQuizPerformance(user),
        timeline: this.calculateTimeline(user.badges || []),
        recommendations: this.generateRecommendations(badges, user)
      };

      return analytics;
    } catch (error) {
      console.error('Error calculating badge analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate overview statistics
   */
  calculateOverview(badges, user) {
    const earnedBadges = badges.filter(b => b.isEarned);
    const totalBadges = badges.length;
    const completionRate = totalBadges > 0 ? (earnedBadges.length / totalBadges) * 100 : 0;
    
    const inProgressBadges = badges.filter(b => !b.isEarned && b.progress > 0 && b.progress < 100);
    const lockedBadges = badges.filter(b => !b.isEarned && b.progress === 0);
    const nearCompletionBadges = badges.filter(b => !b.isEarned && b.progress >= 75);

    return {
      totalBadges,
      earnedBadges: earnedBadges.length,
      inProgressBadges: inProgressBadges.length,
      lockedBadges: lockedBadges.length,
      nearCompletionBadges: nearCompletionBadges.length,
      completionRate: Math.round(completionRate),
      currentLevel: user.level || 1,
      totalPoints: user.points || 0,
      totalXP: user.totalXP || 0
    };
  }

  /**
   * Calculate category-wise breakdown
   */
  calculateCategoryBreakdown(badges) {
    const categories = {};
    
    badges.forEach(badge => {
      if (!categories[badge.category]) {
        categories[badge.category] = {
          total: 0,
          earned: 0,
          inProgress: 0,
          avgProgress: 0,
          badges: []
        };
      }
      
      categories[badge.category].total++;
      if (badge.isEarned) {
        categories[badge.category].earned++;
      } else if (badge.progress > 0) {
        categories[badge.category].inProgress++;
      }
      categories[badge.category].badges.push(badge);
    });

    // Calculate average progress for each category
    Object.keys(categories).forEach(category => {
      const categoryBadges = categories[category].badges;
      const totalProgress = categoryBadges.reduce((sum, b) => sum + b.progress, 0);
      categories[category].avgProgress = Math.round(totalProgress / categoryBadges.length);
      categories[category].completionRate = Math.round((categories[category].earned / categories[category].total) * 100);
    });

    return categories;
  }

  /**
   * Calculate progress tracking for badges close to completion
   */
  calculateProgressTracking(badges) {
    const inProgress = badges
      .filter(b => !b.isEarned && b.progress > 0)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 10)
      .map(badge => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        category: badge.category,
        progress: Math.round(badge.progress),
        current: badge.current,
        requirement: badge.requirement,
        remaining: badge.requirement - badge.current
      }));

    return inProgress;
  }

  /**
   * Calculate achievement statistics
   */
  calculateAchievements(user, badges) {
    const recentBadges = (user.badges || [])
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
      .slice(0, 5);

    const rareBadges = badges.filter(b => 
      b.isEarned && (b.category === 'streak' || b.requirement >= 50)
    );

    return {
      recentlyEarned: recentBadges,
      rareBadges: rareBadges.length,
      firstBadgeDate: user.badges && user.badges.length > 0 
        ? user.badges.sort((a, b) => new Date(a.earnedAt) - new Date(b.earnedAt))[0].earnedAt
        : null,
      totalEarned: (user.badges || []).length
    };
  }

  /**
   * Calculate streak analytics
   */
  calculateStreakAnalytics(user) {
    return {
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      quizStreak: user.quizStreak || 0,
      lastActivity: user.lastDailySubmission || user.updatedAt,
      streakBadgesEarned: (user.badges || []).filter(b => b.category === 'streak').length
    };
  }

  /**
   * Calculate quiz performance analytics
   */
  calculateQuizPerformance(user) {
    const quizHistory = user.quizHistory || [];
    
    let avgScore = user.averageScore || 0;
    let avgTime = 0;
    let subjectDistribution = {};
    let recentScores = [];
    let scoresByMonth = {};

    if (quizHistory.length > 0) {
      // Calculate average time
      const timeTakenArray = quizHistory.filter(q => q.timeTaken).map(q => q.timeTaken);
      if (timeTakenArray.length > 0) {
        avgTime = Math.round(timeTakenArray.reduce((sum, t) => sum + t, 0) / timeTakenArray.length);
      }

      // Subject distribution
      quizHistory.forEach(quiz => {
        if (quiz.subject) {
          subjectDistribution[quiz.subject] = (subjectDistribution[quiz.subject] || 0) + 1;
        }
      });

      // Recent scores (last 10)
      recentScores = quizHistory
        .slice(-10)
        .map(q => ({
          score: q.score,
          date: q.completedAt,
          subject: q.subject
        }));

      // Monthly performance trend
      quizHistory.forEach(quiz => {
        if (quiz.completedAt) {
          const date = new Date(quiz.completedAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!scoresByMonth[monthKey]) {
            scoresByMonth[monthKey] = { total: 0, count: 0 };
          }
          scoresByMonth[monthKey].total += quiz.score;
          scoresByMonth[monthKey].count += 1;
        }
      });
    }

    // Calculate monthly averages
    const monthlyTrend = Object.entries(scoresByMonth).map(([month, data]) => ({
      month,
      averageScore: Math.round(data.total / data.count),
      quizCount: data.count
    })).sort((a, b) => a.month.localeCompare(b.month)).slice(-6); // Last 6 months

    return {
      totalQuizzes: user.completedQuizzes || 0,
      averageScore: Math.round(avgScore),
      highestScore: user.highestScore || 0,
      averageTime: avgTime,
      fastestTime: user.fastestTime || null,
      subjectDistribution,
      recentScores,
      perfectScores: quizHistory.filter(q => q.score === 100).length,
      monthlyTrend,
      improvementRate: this.calculateImprovementRate(quizHistory)
    };
  }

  /**
   * Calculate improvement rate based on recent performance
   */
  calculateImprovementRate(quizHistory) {
    if (quizHistory.length < 5) return 0;

    const recent = quizHistory.slice(-5).map(q => q.score);
    const older = quizHistory.slice(-10, -5).map(q => q.score);

    if (older.length === 0) return 0;

    const recentAvg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s, 0) / older.length;

    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
  }

  /**
   * Calculate timeline of badge achievements
   */
  calculateTimeline(userBadges) {
    const timeline = userBadges
      .filter(b => b.earnedAt)
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
      .map(badge => ({
        id: badge.id,
        name: badge.name,
        icon: badge.icon,
        color: badge.color,
        earnedAt: badge.earnedAt,
        category: badge.category
      }));

    // Group by month
    const monthlyGroups = {};
    timeline.forEach(badge => {
      const date = new Date(badge.earnedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = [];
      }
      monthlyGroups[monthKey].push(badge);
    });

    return {
      timeline,
      monthlyGroups
    };
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(badges, user) {
    const recommendations = [];

    // Find badges close to completion
    const nearCompletion = badges
      .filter(b => !b.isEarned && b.progress >= 50 && b.progress < 100)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);

    nearCompletion.forEach(badge => {
      recommendations.push({
        type: 'near_completion',
        badge: badge,
        message: `You're ${Math.round(badge.progress)}% done with ${badge.name}! Just ${badge.requirement - badge.current} more to go.`,
        priority: badge.progress >= 75 ? 'high' : 'medium'
      });
    });

    // Recommend starting new categories
    const categoryProgress = this.calculateCategoryBreakdown(badges);
    Object.entries(categoryProgress).forEach(([category, data]) => {
      if (data.earned === 0 && data.inProgress === 0) {
        const firstBadge = data.badges.find(b => !b.isEarned);
        if (firstBadge) {
          recommendations.push({
            type: 'new_category',
            badge: firstBadge,
            message: `Try earning your first ${this.getCategoryName(category)} badge!`,
            priority: 'low'
          });
        }
      }
    });

    // Streak recommendations
    if (user.quizStreak > 0 && user.quizStreak < 7) {
      recommendations.push({
        type: 'streak',
        message: `You're on a ${user.quizStreak}-quiz streak! Keep it going to earn the Weekly Warrior badge.`,
        priority: 'high'
      });
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Get user-friendly category name
   */
  getCategoryName(category) {
    const names = {
      quiz: 'Quiz',
      streak: 'Streak',
      score: 'Score',
      speed: 'Speed',
      daily: 'Daily Challenge',
      level: 'Level',
      points: 'Points',
      simulation: 'Simulation',
      subjects: 'Subject'
    };
    return names[category] || category;
  }

  /**
   * Get leaderboard analytics
   */
  async getLeaderboardAnalytics(limit = 10) {
    try {
      const users = await User.find()
        .sort({ points: -1 })
        .limit(limit)
        .select('name email level points badges totalXP completedQuizzes averageScore');

      const leaderboard = users.map((user, index) => ({
        rank: index + 1,
        userId: user._id,
        name: user.name,
        level: user.level,
        points: user.points,
        totalXP: user.totalXP,
        badgesEarned: (user.badges || []).length,
        completedQuizzes: user.completedQuizzes,
        averageScore: user.averageScore
      }));

      return leaderboard;
    } catch (error) {
      console.error('Error getting leaderboard analytics:', error);
      throw error;
    }
  }

  /**
   * Get global badge statistics
   */
  async getGlobalBadgeStats() {
    try {
      const users = await User.find().select('badges');
      const badgeDefinitions = badgeService.getBadgeDefinitions();
      
      const stats = {};
      
      Object.keys(badgeDefinitions).forEach(badgeId => {
        stats[badgeId] = {
          ...badgeDefinitions[badgeId],
          earnedBy: 0,
          rarity: 0
        };
      });

      users.forEach(user => {
        (user.badges || []).forEach(badge => {
          if (stats[badge.id]) {
            stats[badge.id].earnedBy++;
          }
        });
      });

      const totalUsers = users.length || 1;
      Object.keys(stats).forEach(badgeId => {
        stats[badgeId].rarity = Math.round((stats[badgeId].earnedBy / totalUsers) * 100);
      });

      return {
        totalUsers,
        badgeStats: Object.values(stats).sort((a, b) => a.rarity - b.rarity)
      };
    } catch (error) {
      console.error('Error getting global badge stats:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
