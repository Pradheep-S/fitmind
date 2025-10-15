import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Brain, Heart, Award, Target, CheckCircle, Clock, BarChart3, Users, BookOpen, Lightbulb } from 'lucide-react';
import { getJournalStats } from '../services/journalService';

// Define unique colors for mood categories
const MOOD_COLORS = {
  happy: '#10B981',        // Green
  grateful: '#8B5CF6',     // Purple
  excited: '#F59E0B',      // Amber
  calm: '#3B82F6',         // Blue
  content: '#06D6A0',      // Teal
  thoughtful: '#6B7280',   // Gray
  stressed: '#EF4444',     // Red
  anxious: '#F97316',      // Orange
  sad: '#8B5A7D',          // Purple-pink
  overwhelmed: '#DC2626',  // Dark red
  frustrated: '#B45309',   // Brown
  hopeful: '#059669',      // Emerald
  lonely: '#7C3AED',       // Violet
  confident: '#0891B2',    // Cyan
  uncertain: '#9CA3AF',    // Cool gray
  motivated: '#16A34A',    // Green
  tired: '#6B7280',        // Neutral gray
  peaceful: '#0EA5E9',     // Sky blue
  joyful: '#FBBF24',       // Yellow
  reflective: '#8B5CF6',   // Indigo
  burnout: '#991B1B',      // Dark red
  other: '#94A3B8'         // Slate gray
};

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const journalStats = await getJournalStats(timeRange);
        setStats(journalStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Mock data for development
        setStats({
          totalEntries: 15,
          currentStreak: 5,
          longestStreak: 12,
          averageMood: 7.2,
          totalWords: 3247,
          averageWordsPerEntry: 216,
          moodTrend: [
            { date: '2024-01-01', mood: 6, entries: 1 },
            { date: '2024-01-02', mood: 7, entries: 2 },
            { date: '2024-01-03', mood: 5, entries: 1 },
            { date: '2024-01-04', mood: 8, entries: 1 },
            { date: '2024-01-05', mood: 7, entries: 1 },
            { date: '2024-01-06', mood: 9, entries: 2 },
            { date: '2024-01-07', mood: 8, entries: 1 },
          ],
          moodDistribution: [
            { name: 'Happy', value: 35, percentage: 35, color: MOOD_COLORS.happy },
            { name: 'Calm', value: 25, percentage: 25, color: MOOD_COLORS.calm },
            { name: 'Grateful', value: 20, percentage: 20, color: MOOD_COLORS.grateful },
            { name: 'Stressed', value: 15, percentage: 15, color: MOOD_COLORS.stressed },
            { name: 'Sad', value: 5, percentage: 5, color: MOOD_COLORS.sad },
          ],
          weeklyReflection: "This week showed great emotional balance with a positive trend. You've been consistently grateful and maintaining good mental wellness habits.",
          insights: {
            mostProductiveDay: 'Wednesday',
            averageWordsPerDay: 216,
            emotionalTrend: 'positive',
            consistencyScore: 85,
            topEmotions: ['happy', 'grateful', 'calm'],
            journalingFrequency: 'High',
            wellnessIndicators: {
              positiveThoughts: 78,
              stressLevels: 22,
              gratitudePractice: 90,
              selfCare: 65
            }
          },
          reminders: {
            currentGoals: [
              'Practice daily gratitude',
              'Maintain 7-day journaling streak',
              'Focus on work-life balance'
            ],
            todos: [
              'Schedule therapy appointment',
              'Try meditation this week',
              'Reach out to friends',
              'Plan weekend self-care activities'
            ],
            achievements: [
              '5 days in a row!',
              'Most positive week this month',
              'Over 1000 words written'
            ]
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-6xl mx-auto py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="text-4xl font-display font-bold text-gray-800 mb-2">
          Your Journey Stats 📊
        </h1>
        <p className="text-gray-600">
          Insights into your emotional well-being and journaling habits
        </p>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div 
        className="glass-card p-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="flex justify-center space-x-2">
          {['week', 'month', 'year'].map((range) => (
            <motion.button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                timeRange === range 
                  ? 'bg-primary-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-white/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Entries</p>
              <p className="text-3xl font-bold text-primary-600">
                {stats.totalEntries}
              </p>
            </div>
            <Calendar className="text-primary-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-green-600 streak-animation">
                {stats.currentStreak} days
              </p>
            </div>
            <Award className="text-green-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Longest Streak</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.longestStreak} days
              </p>
            </div>
            <TrendingUp className="text-purple-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Mood</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.averageMood}/10
              </p>
            </div>
            <Heart className="text-yellow-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Words</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalWords?.toLocaleString() || 0}
              </p>
            </div>
            <BookOpen className="text-blue-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Words/Entry</p>
              <p className="text-3xl font-bold text-indigo-600">
                {stats.averageWordsPerEntry || 0}
              </p>
            </div>
            <BarChart3 className="text-indigo-500" size={32} />
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Mood Trend Chart */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Mood Trend Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.moodTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                domain={[0, 10]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Mood Distribution Pie Chart */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Mood Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.moodDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {stats.moodDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Comprehensive Insights Section */}
      {stats.insights && (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          {/* Wellness Indicators */}
          <div className="glass-card p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="text-blue-500 mr-3" size={24} />
              <h3 className="text-xl font-semibold text-gray-800">
                Wellness Indicators
              </h3>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.insights.wellnessIndicators).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Insights */}
          <div className="glass-card p-6">
            <div className="flex items-center mb-4">
              <Lightbulb className="text-yellow-500 mr-3" size={24} />
              <h3 className="text-xl font-semibold text-gray-800">
                Quick Insights
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{stats.insights.mostProductiveDay}</p>
                <p className="text-sm text-gray-600">Most Productive Day</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">{stats.insights.consistencyScore}%</p>
                <p className="text-sm text-gray-600">Consistency Score</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                <p className="text-2xl font-bold text-violet-600 capitalize">{stats.insights.emotionalTrend}</p>
                <p className="text-sm text-gray-600">Emotional Trend</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{stats.insights.journalingFrequency}</p>
                <p className="text-sm text-gray-600">Activity Level</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Top Emotions:</strong> {stats.insights.topEmotions.join(', ')}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Weekly Reflection */}
      <motion.div 
        className="glass-card p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <div className="flex items-center mb-4">
          <Brain className="text-purple-500 mr-3" size={24} />
          <h3 className="text-xl font-semibold text-gray-800">
            AI Weekly Reflection
          </h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {stats.weeklyReflection}
        </p>
      </motion.div>

      {/* User Reminders and Goals Section */}
      {stats.reminders && (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          {/* Current Goals */}
          <div className="glass-card p-6">
            <div className="flex items-center mb-4">
              <Target className="text-green-500 mr-3" size={24} />
              <h3 className="text-xl font-semibold text-gray-800">
                Current Goals
              </h3>
            </div>
            <div className="space-y-3">
              {stats.reminders.currentGoals.map((goal, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <Target className="text-green-500 mt-0.5" size={16} />
                  <span className="text-gray-700 text-sm">{goal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* To-Do Reminders */}
          <div className="glass-card p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="text-blue-500 mr-3" size={24} />
              <h3 className="text-xl font-semibold text-gray-800">
                Reminders
              </h3>
            </div>
            <div className="space-y-3">
              {stats.reminders.todos.map((todo, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Clock className="text-blue-500 mt-0.5" size={16} />
                  <span className="text-gray-700 text-sm">{todo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="glass-card p-6">
            <div className="flex items-center mb-4">
              <Award className="text-purple-500 mr-3" size={24} />
              <h3 className="text-xl font-semibold text-gray-800">
                Achievements
              </h3>
            </div>
            <div className="space-y-3">
              {stats.reminders.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Award className="text-purple-500 mt-0.5" size={16} />
                  <span className="text-gray-700 text-sm">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Achievements */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        <div className="glass-card p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h4 className="font-semibold text-gray-800">Consistency Champion</h4>
          <p className="text-sm text-gray-600 mt-1">5 days in a row!</p>
        </div>

        <div className="glass-card p-6 text-center">
          <div className="text-4xl mb-2">🌟</div>
          <h4 className="font-semibold text-gray-800">Positive Mindset</h4>
          <p className="text-sm text-gray-600 mt-1">Most entries this week were positive</p>
        </div>

        <div className="glass-card p-6 text-center">
          <div className="text-4xl mb-2">📝</div>
          <h4 className="font-semibold text-gray-800">Prolific Writer</h4>
          <p className="text-sm text-gray-600 mt-1">Over 1000 words this week</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StatsPage;
