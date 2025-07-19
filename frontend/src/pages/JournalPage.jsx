import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, Heart, Lightbulb, Loader2 } from 'lucide-react';
import { submitJournal } from '../services/journalService';

const JournalPage = ({ onJournalSubmitted }) => {
  const [journalText, setJournalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [wordCount, setWordCount] = useState(0);

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
    } catch (error) {
      console.error('Failed to submit journal:', error);
      // Show error feedback
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

  return (
    <motion.div 
      className="max-w-4xl mx-auto py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Writing Area */}
        <div className="lg:col-span-2">
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
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            <div className="relative">
              <textarea
                value={journalText}
                onChange={handleTextChange}
                placeholder="How are you feeling today? What's on your mind? Write freely about your thoughts, experiences, and emotions..."
                className="w-full h-80 p-4 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
              />
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">
                  {wordCount} words
                </span>
                
                <motion.button
                  onClick={handleSubmit}
                  disabled={!journalText.trim() || isSubmitting}
                  className={`primary-btn ${(!journalText.trim() || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={journalText.trim() && !isSubmitting ? { scale: 1.05 } : {}}
                  whileTap={journalText.trim() && !isSubmitting ? { scale: 0.95 } : {}}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  ) : (
                    <Send className="mr-2" size={20} />
                  )}
                  {isSubmitting ? 'Analyzing...' : 'Submit Journal'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Analysis Sidebar */}
        <div className="lg:col-span-1">
          <AnimatePresence>
            {analysis ? (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                {/* Mood Detection */}
                <div className="glass-card p-6 mood-glow">
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
                </div>

                {/* AI Suggestions */}
                <div className="glass-card p-6">
                  <div className="flex items-center mb-4">
                    <Lightbulb className="text-yellow-500 mr-2" size={20} />
                    <h3 className="font-semibold text-gray-800">Suggestions</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.suggestions?.map((suggestion, index) => (
                      <motion.div 
                        key={index}
                        className="p-3 bg-white/30 rounded-lg border border-white/20"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <p className="text-sm text-gray-700">{suggestion}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="glass-card p-6">
                  <div className="flex items-center mb-4">
                    <Brain className="text-purple-500 mr-2" size={20} />
                    <h3 className="font-semibold text-gray-800">Summary</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="glass-card p-6 text-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Brain className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="font-semibold text-gray-600 mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-500">
                  Write your journal entry and submit to get personalized insights and suggestions for your well-being.
                </p>
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
