import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Sparkles, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getQuote } from '../services/quoteService';
import { getJournalStats } from '../services/journalService';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    currentStreak: 0,
    totalEntries: 0,
    averageMood: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quote
        const dailyQuote = await getQuote();
        setQuote(dailyQuote);
        
        // Fetch user stats
        const userStats = await getJournalStats('week');
        setStats(userStats);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setQuote({
          text: "The journey of a thousand miles begins with a single step.",
          author: "Lao Tzu"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartJournal = () => {
    navigate('/journal');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quote
        const dailyQuote = await getQuote();
        setQuote(dailyQuote);
        
        // Fetch user stats
        const userStats = await getJournalStats('week');
        setStats(userStats);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setQuote({
          text: "The journey of a thousand miles begins with a single step.",
          author: "Lao Tzu"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div 
      className="max-w-4xl mx-auto py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Welcome Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-4xl font-display font-bold text-gray-800 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Friend'} 👋
          </h1>
          <p className="text-gray-600">
            Ready to continue your mindfulness journey?
          </p>
        </motion.div>      {/* Daily Quote Card */}
      <motion.div 
        className="glass-card p-8 mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="flex items-center mb-4">
          <Sparkles className="text-yellow-500 mr-2" size={24} />
          <h2 className="text-xl font-display font-semibold text-gray-800">
            Daily Inspiration
          </h2>
        </div>
        
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <p className="text-lg italic text-gray-700 mb-2">
              "{quote?.text}"
            </p>
            <p className="text-right text-gray-500 font-medium">
              — {quote?.author}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-primary-600 streak-animation">
                {stats.currentStreak || 0} days
              </p>
            </div>
            <Calendar className="text-primary-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalEntries || 0} entries</p>
            </div>
            <PenTool className="text-green-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Mood</p>
              <p className="text-3xl font-bold text-purple-600">{stats.averageMood || 0}/10</p>
            </div>
            <TrendingUp className="text-purple-500" size={32} />
          </div>
        </motion.div>
      </div>

      {/* Main CTA */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <motion.button
          onClick={handleStartJournal}
          className="primary-btn text-xl px-12 py-4 mb-4"
          whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          <PenTool className="inline mr-3" size={24} />
          Start Today's Journal
        </motion.button>
        
        <motion.p 
          className="text-gray-600 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
