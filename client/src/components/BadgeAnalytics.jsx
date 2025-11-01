import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  Trophy,
  Flame,
  Clock,
  BookOpen,
  Zap,
  Star,
  AlertCircle,
  ChevronRight,
  PieChart,
  Activity,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart
} from 'recharts';

const BadgeAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(null);
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${API_URL}/api/xp/analytics/badges`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  // Listen for storage events (when user completes activities in other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'activityCompleted') {
        fetchAnalytics(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchAnalytics]);

  const handleManualRefresh = () => {
    fetchAnalytics(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-white/70">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p>Failed to load analytics</p>
      </div>
    );
  }

  const { overview, categoryBreakdown, progressTracking, achievements, streakAnalytics, quizPerformance, recommendations } = analytics;

  // Prepare chart data
  const categoryChartData = Object.entries(categoryBreakdown).map(([category, data]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    earned: data.earned,
    total: data.total,
    completionRate: data.completionRate,
    inProgress: data.inProgress
  }));

  const progressChartData = progressTracking.slice(0, 8).map(badge => ({
    name: badge.name.length > 15 ? badge.name.substring(0, 15) + '...' : badge.name,
    progress: badge.progress,
    current: badge.current,
    requirement: badge.requirement
  }));

  const radarChartData = Object.entries(categoryBreakdown).map(([category, data]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    value: data.completionRate
  }));

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4', '#f97316'];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 border border-purple-500/50 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name.includes('Rate') || entry.name.includes('Score') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-full shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent mb-2">
          Your Learning Analytics
        </h2>
        <p className="text-white/70 mb-3">
          Track your progress and achievements
        </p>
        
        {/* Refresh Button and Last Updated */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              refreshing 
                ? 'bg-gray-600/40 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600/40 border border-purple-400/80 text-white hover:bg-purple-600/60'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          {lastUpdated && (
            <span className="text-xs text-white/50">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'overview', label: 'Overview', icon: TrendingUp },
          { key: 'progress', label: 'Progress', icon: Target },
          { key: 'recommendations', label: 'Tips', icon: Star }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-purple-600/40 border border-purple-400/80 text-white'
                : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-purple-500/20'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Key Insights Banner */}
      <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-purple-500/20 p-3 rounded-lg">
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Your Learning Journey</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-white/70">Progress: </span>
                <span className="text-white font-semibold">{overview.completionRate}% Complete</span>
              </div>
              <div>
                <span className="text-white/70">Performance: </span>
                <span className="text-white font-semibold">{quizPerformance.averageScore}% Average Score</span>
              </div>
              <div>
                <span className="text-white/70">Streak: </span>
                <span className="text-white font-semibold">{streakAnalytics.currentStreak} Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={Award}
              label="Badges Earned"
              value={overview.earnedBadges}
              total={overview.totalBadges}
              color="green"
            />
            <MetricCard
              icon={Target}
              label="In Progress"
              value={overview.inProgressBadges}
              color="yellow"
            />
            <MetricCard
              icon={Trophy}
              label="Completion"
              value={`${overview.completionRate}%`}
              color="purple"
            />
            <MetricCard
              icon={Zap}
              label="Total XP"
              value={overview.totalXP}
              color="cyan"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution Pie Chart */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-6 h-6 text-purple-400" />
                Category Distribution
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsPieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={{
                      stroke: '#ffffff40',
                      strokeWidth: 1
                    }}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      outerRadius,
                      percent,
                      name
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 30;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                      // Only show label if percentage is > 3% to avoid clutter
                      if (percent < 0.03) return null;

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontSize={12}
                          fontWeight={500}
                        >
                          {`${name} ${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="earned"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ fontSize: '12px', color: '#ffffff' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Progress Radar Chart */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-cyan-400" />
                Category Mastery
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                  <PolarGrid stroke="#ffffff20" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#ffffff', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#ffffff80' }} />
                  <Radar name="Completion %" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown Bar Chart */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Category Progress Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" tick={{ fill: '#ffffff' }} />
                <YAxis tick={{ fill: '#ffffff' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#ffffff' }} />
                <Bar dataKey="earned" fill="#10b981" name="Earned" />
                <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" />
                <Bar dataKey="total" fill="#6b7280" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Achievements */}
          {achievements.recentlyEarned.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-yellow-400" />
                Recently Earned
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {achievements.recentlyEarned.map(badge => (
                  <div key={badge.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{badge.name}</div>
                      <div className="text-xs text-white/70">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          {/* Progress Bar Chart */}
          {progressTracking.length > 0 && (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-green-400" />
                Badges Near Completion
              </h3>
              <ResponsiveContainer width="100%" height={Math.max(300, progressChartData.length * 55)}>
                <BarChart 
                  data={progressChartData} 
                  layout="vertical"
                  margin={{ top: 5, right: 60, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]} 
                    tick={{ fill: '#ffffff' }}
                    label={{ value: 'Progress %', position: 'insideBottom', offset: -5, fill: '#ffffff80' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: '#ffffff', fontSize: 12 }} 
                    width={150}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="progress" 
                    name="Progress %"
                    radius={[0, 8, 8, 0]}
                    label={{ 
                      position: 'right', 
                      fill: '#ffffff',
                      formatter: (value) => `${Math.round(value)}%`,
                      fontSize: 12
                    }}
                  >
                    {progressChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.progress >= 75 ? '#10b981' : entry.progress >= 50 ? '#f59e0b' : '#3b82f6'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#10b981]"></div>
                  <span className="text-white/70">75%+ (Almost there!)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#f59e0b]"></div>
                  <span className="text-white/70">50-74% (Good progress)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#3b82f6]"></div>
                  <span className="text-white/70">&lt;50% (Getting started)</span>
                </div>
              </div>
            </div>
          )}

          {/* Progress Details */}
          {progressTracking.length > 0 && (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                Detailed Progress
              </h3>
              <div className="space-y-4">
                {progressTracking.map(badge => (
                  <ProgressItem key={badge.id} badge={badge} />
                ))}
              </div>
            </div>
          )}

          {progressTracking.length === 0 && (
            <div className="text-center py-12 text-white/70">
              <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Complete more activities to see your progress</p>
            </div>
          )}

          {/* Streak Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-400" />
                Streak Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <StatBox label="Current Streak" value={streakAnalytics.currentStreak} unit="days" />
                <StatBox label="Longest Streak" value={streakAnalytics.longestStreak} unit="days" />
                <StatBox label="Quiz Streak" value={streakAnalytics.quizStreak} unit="quizzes" />
                <StatBox label="Streak Badges" value={streakAnalytics.streakBadgesEarned} unit="badges" />
              </div>
            </div>

            {/* Streak Visualization */}
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-orange-400" />
                Streak Comparison
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: 'Current', value: streakAnalytics.currentStreak },
                  { name: 'Longest', value: streakAnalytics.longestStreak },
                  { name: 'Quiz', value: streakAnalytics.quizStreak }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" tick={{ fill: '#ffffff' }} />
                  <YAxis tick={{ fill: '#ffffff' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#f97316" name="Streak Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              Personalized Tips
            </h3>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <RecommendationCard key={index} recommendation={rec} />
                ))}
              </div>
            ) : (
              <p className="text-white/70 text-center py-8">
                Keep learning to get personalized recommendations!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const MetricCard = ({ icon: Icon, label, value, total, color }) => {
  const colors = {
    green: 'from-green-500 to-emerald-600 border-green-400/50',
    yellow: 'from-yellow-500 to-orange-600 border-yellow-400/50',
    purple: 'from-purple-500 to-purple-600 border-purple-400/50',
    cyan: 'from-cyan-500 to-blue-600 border-cyan-400/50'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-sm border rounded-xl p-4`}>
      <Icon className="w-6 h-6 text-white mb-2" />
      <div className="text-2xl font-bold text-white">
        {value}{total && <span className="text-lg text-white/80">/{total}</span>}
      </div>
      <div className="text-xs text-white/80">{label}</div>
    </div>
  );
};

const CategoryProgress = ({ category, data }) => {
  const getCategoryIcon = (cat) => {
    const icons = {
      quiz: BookOpen,
      streak: Flame,
      score: Target,
      level: Trophy,
      daily: Calendar,
      points: Star,
      speed: Zap,
      simulation: BarChart3
    };
    return icons[cat] || Award;
  };

  const Icon = getCategoryIcon(category);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-purple-400" />
          <span className="text-white font-medium capitalize">{category}</span>
        </div>
        <div className="text-sm text-white/70">
          {data.earned}/{data.total}
        </div>
      </div>
      <div className="relative bg-white/10 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
          style={{ width: `${data.completionRate}%` }}
        />
      </div>
      <div className="text-xs text-white/60">
        {data.completionRate}% complete • {data.inProgress} in progress
      </div>
    </div>
  );
};

const ProgressItem = ({ badge }) => {
  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl">{badge.icon}</div>
        <div className="flex-1">
          <div className="font-semibold text-white">{badge.name}</div>
          <div className="text-sm text-white/70">{badge.description}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-purple-400">{badge.progress}%</div>
        </div>
      </div>
      <div className="relative bg-white/10 rounded-full h-2 overflow-hidden mb-2">
        <div 
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
          style={{ width: `${badge.progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-white/60">
        <span>{badge.current} / {badge.requirement}</span>
        <span>{badge.remaining} remaining</span>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, unit }) => {
  return (
    <div className="bg-white/5 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-white">
        {value}{unit && <span className="text-sm ml-1">{unit}</span>}
      </div>
      <div className="text-xs text-white/70 mt-1">{label}</div>
    </div>
  );
};

const RecommendationCard = ({ recommendation }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'border-red-500/50 bg-red-500/10',
      medium: 'border-yellow-500/50 bg-yellow-500/10',
      low: 'border-blue-500/50 bg-blue-500/10'
    };
    return colors[priority] || colors.low;
  };

  return (
    <div className={`border rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}>
      <div className="flex items-start gap-3">
        {recommendation.badge && (
          <div className="text-2xl">{recommendation.badge.icon}</div>
        )}
        <div className="flex-1">
          <p className="text-white">{recommendation.message}</p>
          {recommendation.badge && (
            <div className="text-xs text-white/60 mt-1">{recommendation.badge.category}</div>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-white/50" />
      </div>
    </div>
  );
};

export default BadgeAnalytics;
