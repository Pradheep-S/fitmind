import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, Heart, Lightbulb, Loader2, Plus, Eye, Camera } from 'lucide-react';
import { submitJournal } from '../services/journalService';
import { useAuth } from '../contexts/AuthContext';
import JournalMoodIntegration from '../components/JournalMoodIntegration';
import VoiceInput from '../components/VoiceInput';

const JournalPage = ({ onJournalSubmitted }) => {
  const [journalText, setJournalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [showWritingArea, setShowWritingArea] = useState(true);
  const [showMoodDetection, setShowMoodDetection] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState(null);
  const [isMoodAnalyzing, setIsMoodAnalyzing] = useState(false);
  const { checkToken, isAuthenticated, user } = useAuth();

  const handleTextChange = (e) => {
    const text = e.target.value;
    setJournalText(text);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  const handleVoiceTranscript = (transcript) => {
    // Append voice transcript to existing text with proper spacing
    const currentText = journalText.trim();
    const newText = currentText 
      ? `${currentText} ${transcript}` 
      : transcript;
    setJournalText(newText);
    setWordCount(newText.trim() ? newText.trim().split(/\s+/).length : 0);
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

  const toggleMoodDetection = () => {
    setShowMoodDetection(!showMoodDetection);
    if (showMoodDetection) {
      setMoodAnalysis(null);
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
      className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={`grid gap-6 lg:gap-8 transition-all duration-700 ${
        analysis ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'
      }`}>
        {/* Writing Area - Show only when showWritingArea is true */}
        {showWritingArea && (
          <div className={`transition-all duration-700 ${
            analysis ? 'lg:col-span-1' : 'lg:col-span-2'
          }`}>
          <motion.div 
            className="glass-card p-6 lg:p-8"
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
              
              {/* Voice Input Component */}
              <div className="mt-4 p-4 bg-white/30 backdrop-blur-sm border border-white/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">🎤 Voice Input:</span>
                    <VoiceInput 
                      onTranscriptUpdate={handleVoiceTranscript}
                      className="flex-1"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Speak naturally, pauses will be detected
                  </div>
                </div>
              </div>
              
              {/* Enhanced Mood Detection Integration */}
              <div className="mt-4">
                <JournalMoodIntegration
                  journalText={journalText}
                  onMoodAnalysis={(moodData) => {
                    setMoodAnalysis(moodData);
                    // Auto-save mood data for journal submission
                  }}
                  onJournalTextUpdate={(newText) => {
                    setJournalText(newText);
                    setWordCount(newText.trim() ? newText.trim().split(/\s+/).length : 0);
                  }}
                  isVisible={showMoodDetection}
                  onToggle={toggleMoodDetection}
                />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {wordCount} words
                  </span>
                  
                  <motion.button
                    onClick={toggleMoodDetection}
                    className={`flex items-center space-x-2 text-sm px-3 py-1 rounded-lg transition-all duration-200 ${
                      showMoodDetection 
                        ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                        : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye size={16} />
                    <span>{showMoodDetection ? 'Hide' : 'Add'} Mood Detection</span>
                  </motion.button>
                </div>
                
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
                  className="glass-card p-6 lg:p-8 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-2 border-primary-200/30 mb-6 lg:mb-8"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl shadow-lg">
                        <Brain className="text-white" size={28} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">AI Analysis Complete</h2>
                        <p className="text-gray-600 text-lg">Here's what we discovered about your journal entry</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleNewEntry}
                      className="secondary-btn text-sm py-3 px-6 flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus size={16} className="mr-2" />
                      New Entry
                    </motion.button>
                  </div>
                </motion.div>

                {/* Main Analysis Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-10">
                  {/* Mood Detection */}
                  <motion.div 
                    className="glass-card p-6 lg:p-8 mood-glow analysis-card bg-gradient-to-br from-red-50/60 to-pink-50/60 border-2 border-red-200/30 md:col-span-2 lg:col-span-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center mb-6">
                      <div className="p-2 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg mr-3">
                        <Heart className="text-white" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Detected Mood</h3>
                    </div>
                    <div className="text-center">
                      <div className="text-6xl mb-4">{getMoodEmoji(analysis.mood)}</div>
                      <p className="text-2xl font-bold text-gray-800 capitalize mb-3">
                        {analysis.mood}
                      </p>
                      <div className="bg-white/50 rounded-lg p-3 border border-white/30">
                        <p className="text-sm text-gray-600 font-medium">
                          Confidence: <span className="text-gray-800 font-bold">{Math.round(analysis.confidence * 100)}%</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* AI Suggestions */}
                  <motion.div 
                    className="glass-card p-6 lg:p-8 analysis-card bg-gradient-to-br from-yellow-50/60 to-orange-50/60 border-2 border-yellow-200/30 md:col-span-2 lg:col-span-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center mb-6">
                      <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg mr-3">
                        <Lightbulb className="text-white" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">AI Suggestions</h3>
                    </div>
                    <div className="space-y-4 max-h-56 overflow-y-auto custom-scrollbar">
                      {analysis.suggestions?.map((suggestion, index) => (
                        <motion.div 
                          key={index}
                          className="bg-white/60 rounded-xl p-4 border border-white/40 shadow-sm hover:shadow-md transition-all duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <div className="flex items-start">
                            <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed font-medium">{suggestion}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Summary */}
                  <motion.div 
                    className="glass-card p-6 lg:p-8 analysis-card bg-gradient-to-br from-purple-50/60 to-indigo-50/60 border-2 border-purple-200/30 md:col-span-2 lg:col-span-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center mb-6">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg mr-3">
                        <Brain className="text-white" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">AI Summary</h3>
                    </div>
                    <div className="bg-white/60 rounded-xl p-5 border border-white/40 max-h-56 overflow-y-auto custom-scrollbar">
                      <p className="text-gray-700 leading-relaxed text-base font-medium">
                        {analysis.summary}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Additional Analysis Details */}
                <motion.div 
                  className="space-y-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {/* Section Header */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Detailed Insights</h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary-400 to-purple-500 rounded-full mx-auto"></div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                    {/* Key Themes */}
                    {analysis.themes && analysis.themes.length > 0 && (
                      <motion.div 
                        className="glass-card p-6 lg:p-8 analysis-card bg-gradient-to-br from-indigo-50/60 to-blue-50/60 border-2 border-indigo-200/30"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="flex items-center mb-6">
                          <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg mr-3">
                            <Brain className="text-white" size={24} />
                          </div>
                          <h4 className="text-xl font-bold text-gray-800">Key Themes</h4>
                        </div>
                        <div className="bg-white/60 rounded-xl p-5 border border-white/40">
                          <div className="flex flex-wrap gap-3">
                            {analysis.themes.map((theme, index) => (
                              <motion.span 
                                key={index}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 rounded-full text-sm font-medium border border-indigo-200 shadow-sm"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                              >
                                #{theme}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Action Items */}
                    {analysis.actionItems && analysis.actionItems.length > 0 && (
                      <motion.div 
                        className="glass-card p-6 lg:p-8 analysis-card bg-gradient-to-br from-green-50/60 to-emerald-50/60 border-2 border-green-200/30"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="flex items-center mb-6">
                          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mr-3">
                            <Lightbulb className="text-white" size={24} />
                          </div>
                          <h4 className="text-xl font-bold text-gray-800">Action Items</h4>
                        </div>
                        <div className="bg-white/60 rounded-xl p-5 border border-white/40 space-y-4">
                          {analysis.actionItems.map((item, index) => (
                            <motion.div 
                              key={index} 
                              className="flex items-start group hover:bg-green-50/50 rounded-lg p-3 transition-colors duration-200"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.7 + index * 0.1 }}
                            >
                              <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                              <p className="text-gray-700 leading-relaxed font-medium">{item}</p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
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
        className="glass-card p-6 lg:p-8 mt-8 lg:mt-12 bg-gradient-to-r from-slate-50/60 to-gray-50/60 border-2 border-gray-200/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">✨ Writing Tips for Better Analysis</h3>
          <p className="text-gray-600 text-lg">Get more insightful AI responses by including these elements in your journal</p>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-slate-500 rounded-full mx-auto mt-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "🎤", tip: "Use voice input for natural expression", desc: "Click the microphone to speak your journal" },
            { icon: "💭", tip: "Write about your feelings and emotions", desc: "Help AI understand your emotional state" },
            { icon: "📝", tip: "Describe what happened today", desc: "Context improves analysis accuracy" },
            { icon: "🙏", tip: "Include what you're grateful for", desc: "Helps identify positive patterns" },
            { icon: "⚡", tip: "Note any challenges you faced", desc: "Get targeted coping strategies" },
            { icon: "🎯", tip: "Mention your goals and aspirations", desc: "Receive personalized motivation" },
            { icon: "💡", tip: "Reflect on lessons learned", desc: "AI can build on your insights" }
          ].map((item, index) => (
            <motion.div 
              key={index}
              className="bg-white/60 rounded-xl p-5 border border-white/40 hover:shadow-lg transition-all duration-200 group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">{item.tip}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JournalPage;
