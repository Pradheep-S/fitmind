import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, Heart, Lightbulb, Loader2, Plus } from 'lucide-react';
import { submitJournal } from '../services/journalService';
import { useAuth } from '../contexts/AuthContext';

const JournalPage = ({ onJournalSubmitted }) => {
  const [journalText, setJournalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [showWritingArea, setShowWritingArea] = useState(true);
  const { checkToken, isAuthenticated, user } = useAuth();

  const handleTextChange = (e) => {
    const text = e.target.value;
    setJournalText(text);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  const handleSubmit = async () => {
    if (!journalText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const result = await submitJournal(journalText);
      setAnalysis(result);
      if (onJournalSubmitted) {
        onJournalSubmitted(result);
      }
      // Hide the writing area after successful submission
      setShowWritingArea(false);
      // Clear the text after successful submission
      setJournalText('');
      setWordCount(0);
    } catch (error) {
      console.error('Failed to submit journal:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        // You might want to redirect to login or refresh the token
        localStorage.removeItem('fitmind-token');
        window.location.reload();
      } else if (error.response?.status === 400) {
        alert('There was an issue with your journal entry. Please check that it\'s at least 10 characters long.');
      } else {
        alert('Failed to submit journal entry. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodEmoji = (mood) => {
    const moodMap = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      grateful: '🙏',
      excited: '🎉',
      calm: '😌',
      stressed: '😤',
      thoughtful: '🤔',
      content: '😊',
      overwhelmed: '😵‍💫'
    };
    return moodMap[mood?.toLowerCase()] || '🌟';
  };

  const handleNewEntry = () => {
    setShowWritingArea(true);
    setAnalysis(null);
    setJournalText('');
    setWordCount(0);
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={`grid gap-8 transition-all duration-700 ${
        analysis ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'
      }`}>
        {/* Writing Area - Show only when showWritingArea is true */}
        {showWritingArea && (
          <div className={`transition-all duration-700 ${
            analysis ? 'lg:col-span-1' : 'lg:col-span-2'
          }`}>
          <motion.div 
            className="glass-card p-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-800">
                Today's Journal
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={journalText}
                onChange={handleTextChange}
                placeholder="How are you feeling today? What's on your mind? Write freely about your thoughts, experiences, and emotions..."
                className={`w-full p-4 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-500 ${
                  analysis ? 'h-32' : 'h-80'
                }`}
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              />
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">
                  {wordCount} words
                </span>
                
                <motion.button
                  onClick={handleSubmit}
                  disabled={!journalText.trim() || isSubmitting}
                  className={`flex items-center justify-center space-x-2 primary-btn ${(!journalText.trim() || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={journalText.trim() && !isSubmitting ? { scale: 1.05 } : {}}
                  whileTap={journalText.trim() && !isSubmitting ? { scale: 0.95 } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Submit Journal</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
        )}

        {/* Add New Entry Button - Show only when writing area is hidden and analysis exists */}
        {!showWritingArea && analysis && (
          <div className="flex justify-center">
            <motion.button
              onClick={handleNewEntry}
              className="primary-btn flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Plus size={20} />
              <span>Add Another Entry for Today</span>
            </motion.button>
          </div>
        )}

        {/* Analysis Sidebar */}
        <div className={`transition-all duration-700 ${
          analysis && !showWritingArea ? 'lg:col-span-1' : (analysis ? 'lg:col-span-3' : 'lg:col-span-1')
        }`}>
          <AnimatePresence>
            {analysis ? (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                {/* Analysis Header */}
                <motion.div 
                  className="glass-card p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-2 border-primary-200/30"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full">
                        <Brain className="text-white" size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">AI Analysis Complete</h2>
                        <p className="text-sm text-gray-600">Here's what we discovered about your entry</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleNewEntry}
                      className="secondary-btn text-sm py-2 px-4"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      New Entry
                    </motion.button>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Mood Detection */}
                  <motion.div 
                    className="glass-card p-6 mood-glow analysis-card bg-gradient-to-br from-red-50/50 to-pink-50/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center mb-4">
                      <Heart className="text-red-500 mr-2" size={20} />
                      <h3 className="font-semibold text-gray-800">Detected Mood</h3>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl mb-2">{getMoodEmoji(analysis.mood)}</div>
                      <p className="text-lg font-medium text-gray-700 capitalize">
                        {analysis.mood}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Confidence: {Math.round(analysis.confidence * 100)}%
                      </p>
                    </div>
                  </motion.div>

                  {/* AI Suggestions */}
                  <motion.div 
                    className="glass-card p-6 analysis-card bg-gradient-to-br from-yellow-50/50 to-orange-50/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center mb-4">
                      <Lightbulb className="text-yellow-500 mr-2" size={20} />
                      <h3 className="font-semibold text-gray-800">Suggestions</h3>
                    </div>
                    <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
                      {analysis.suggestions?.map((suggestion, index) => (
                        <motion.div 
                          key={index}
                          className="p-3 bg-white/40 rounded-lg border border-white/20"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <p className="text-sm text-gray-700">{suggestion}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Summary */}
                  <motion.div 
                    className="glass-card p-6 analysis-card bg-gradient-to-br from-purple-50/50 to-indigo-50/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center mb-4">
                      <Brain className="text-purple-500 mr-2" size={20} />
                      <h3 className="font-semibold text-gray-800">Summary</h3>
                    </div>
                    <div className="max-h-40 overflow-y-auto custom-scrollbar">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {analysis.summary}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Additional Analysis Details - Full Width */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {/* Key Themes */}
                  {analysis.themes && analysis.themes.length > 0 && (
                    <div className="glass-card p-6 analysis-card bg-gradient-to-br from-indigo-50/50 to-blue-50/50">
                      <div className="flex items-center mb-4">
                        <Brain className="text-indigo-500 mr-2" size={20} />
                        <h3 className="font-semibold text-gray-800">Key Themes</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.themes.map((theme, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-white/40 rounded-full text-sm text-gray-700 border border-white/20"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Items */}
                  {analysis.actionItems && analysis.actionItems.length > 0 && (
                    <div className="glass-card p-6 analysis-card bg-gradient-to-br from-green-50/50 to-emerald-50/50">
                      <div className="flex items-center mb-4">
                        <Lightbulb className="text-green-500 mr-2" size={20} />
                        <h3 className="font-semibold text-gray-800">Action Items</h3>
                      </div>
                      <ul className="space-y-2">
                        {analysis.actionItems.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <p className="text-sm text-gray-700">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                className="glass-card p-8 text-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Brain className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="font-semibold text-gray-600 mb-2">AI Analysis Awaiting</h3>
                <p className="text-sm text-gray-500">
                  Write your journal entry and submit to get personalized insights, mood analysis, and suggestions for your well-being.
                </p>
                <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/20">
                  <p className="text-xs text-blue-700">
                    💡 Tip: The more detailed your entry, the better insights you'll receive!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Writing Tips */}
      <motion.div 
        className="glass-card p-6 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h3 className="font-semibold text-gray-800 mb-3">✨ Writing Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>• Write about your feelings and thoughts</div>
          <div>• Describe what happened today</div>
          <div>• Include what you're grateful for</div>
          <div>• Note any challenges you faced</div>
          <div>• Mention your goals and aspirations</div>
          <div>• Reflect on lessons learned</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JournalPage;
