import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Brain, Camera, TrendingUp, AlertCircle, 
  CheckCircle, RefreshCw, ArrowRight, Lightbulb,
  Heart, Calendar, BarChart3
} from 'lucide-react';
import MoodCamera from '../components/MoodCamera';
import moodService from '../services/moodService';
import { useAuth } from '../contexts/AuthContext';

const MoodDetectionPage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodResult, setMoodResult] = useState(null);
  const [error, setError] = useState(null);
  const [supportedMoods, setSupportedMoods] = useState(null);
  const [serviceStatus, setServiceStatus] = useState('checking');
  const { user } = useAuth();

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      // Load supported moods
      const moodsData = await moodService.getSupportedMoods();
      setSupportedMoods(moodsData.data);

      // Test service availability
      try {
        await moodService.testService();
        setServiceStatus('ready');
      } catch (testError) {
        setServiceStatus('limited');
        console.warn('Service test failed, using fallback mode:', testError.message);
      }
    } catch (error) {
      console.error('Failed to initialize mood detection page:', error);
      setServiceStatus('error');
    }
  };

  const handleMoodDetection = async (imageFile) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Validate the image file
      moodService.validateImageFile(imageFile);
      
      console.log('Starting mood analysis for file:', imageFile.name);
      
      // Analyze the mood
      const result = await moodService.analyzeMoodFromImage(imageFile);
      
      if (result.success) {
        setMoodResult(result.data);
        console.log('Mood analysis successful:', result.data);
      } else {
        throw new Error(result.message || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('Mood detection error:', error);
      setError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setMoodResult(null);
    setError(null);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header Section */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <Eye className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Facial Mood Detection</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover your current emotional state through advanced facial expression analysis. 
          Our AI technology can detect subtle mood changes to help you better understand your feelings.
        </p>
        
        {/* Service Status Indicator */}
        <div className="mt-6 flex items-center justify-center">
          <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            serviceStatus === 'ready' ? 'bg-green-100 text-green-800' :
            serviceStatus === 'limited' ? 'bg-yellow-100 text-yellow-800' :
            serviceStatus === 'checking' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {serviceStatus === 'ready' && <CheckCircle size={16} className="mr-2" />}
            {serviceStatus === 'limited' && <AlertCircle size={16} className="mr-2" />}
            {serviceStatus === 'checking' && <RefreshCw size={16} className="mr-2 animate-spin" />}
            {serviceStatus === 'error' && <AlertCircle size={16} className="mr-2" />}
            
            {serviceStatus === 'ready' && 'Facial Analysis Ready'}
            {serviceStatus === 'limited' && 'Limited Mode - Using Fallback Analysis'}
            {serviceStatus === 'checking' && 'Checking Service Status...'}
            {serviceStatus === 'error' && 'Service Unavailable'}
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className={`grid gap-8 transition-all duration-700 ${
        moodResult ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
      }`}>
        {/* Camera Component */}
        <div className={moodResult ? 'lg:col-span-1' : 'lg:col-span-2'}>
          <MoodCamera 
            onMoodDetected={handleMoodDetection}
            isAnalyzing={isAnalyzing}
            disabled={serviceStatus === 'error'}
          />
          
          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div 
                className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-start">
                  <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-red-800 font-medium mb-1">Analysis Error</h4>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Panel */}
        <div className={moodResult ? 'lg:col-span-1' : 'lg:col-span-1'}>
          <AnimatePresence mode="wait">
            {moodResult ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Primary Mood Result */}
                <div className={`glass-card p-6 bg-gradient-to-br ${moodService.getMoodColor(moodResult.mood)} bg-opacity-10 border-2 border-opacity-20`}>
                  <div className="text-center">
                    <motion.div 
                      className="text-8xl mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                    >
                      {moodService.getMoodEmoji(moodResult.mood)}
                    </motion.div>
                    <motion.h3 
                      className="text-3xl font-bold text-gray-800 capitalize mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {moodResult.mood}
                    </motion.h3>
                    <motion.div 
                      className="bg-white/60 rounded-lg p-4 mb-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <div className={`w-4 h-4 rounded-full mr-2 ${
                          moodResult.confidence >= 0.8 ? 'bg-green-500' :
                          moodResult.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`}></div>
                        <p className={`font-semibold ${getConfidenceColor(moodResult.confidence)}`}>
                          {getConfidenceLabel(moodResult.confidence)}
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <motion.div 
                          className={`h-3 rounded-full ${
                            moodResult.confidence >= 0.8 ? 'bg-green-500' :
                            moodResult.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${moodResult.confidence * 100}%` }}
                          transition={{ delay: 0.5, duration: 1 }}
                        />
                      </div>
                      <p className="text-gray-600 text-sm">
                        {Math.round(moodResult.confidence * 100)}% confidence
                      </p>
                    </motion.div>
                    {moodResult.moodInsights && (
                      <motion.p 
                        className="text-gray-700 text-sm leading-relaxed bg-white/40 rounded-lg p-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        {moodResult.moodInsights}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Detailed Analysis */}
                {moodResult.expressions && (
                  <motion.div 
                    className="glass-card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Brain className="mr-2" size={20} />
                      Facial Expression Analysis
                    </h4>
                    <div className="space-y-4">
                      {Object.entries(moodResult.expressions)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 6)
                        .map(([emotion, confidence], index) => (
                          <motion.div 
                            key={emotion} 
                            className="bg-white/50 rounded-lg p-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">
                                  {emotion === 'happy' ? '😊' :
                                   emotion === 'sad' ? '😢' :
                                   emotion === 'angry' ? '😠' :
                                   emotion === 'fearful' ? '😨' :
                                   emotion === 'disgusted' ? '🤢' :
                                   emotion === 'surprised' ? '😲' :
                                   '😐'}
                                </span>
                                <span className="text-gray-800 capitalize font-medium text-lg">
                                  {emotion}
                                </span>
                              </div>
                              <span className="text-lg font-bold text-gray-700">
                                {Math.round(confidence * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div 
                                className={`h-2 rounded-full ${
                                  index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                  index === 1 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                  'bg-gradient-to-r from-gray-400 to-gray-600'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${confidence * 100}%` }}
                                transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                              />
                            </div>
                          </motion.div>
                        ))}
                    </div>
                    
                    {/* Analysis Metadata */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600">Faces Detected</p>
                          <p className="font-bold text-gray-800 text-lg">
                            {moodResult.faceCount || 1}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Analysis Method</p>
                          <p className="font-bold text-gray-800 text-lg">
                            {moodResult.method === 'face-analysis' ? '🎯 AI Vision' : '📝 Fallback'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Suggestions */}
                {moodResult.suggestions && moodResult.suggestions.length > 0 && (
                  <div className="glass-card p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Lightbulb className="mr-2" size={20} />
                      Personalized Suggestions
                    </h4>
                    <div className="space-y-3">
                      {moodResult.suggestions.map((suggestion, index) => (
                        <motion.div 
                          key={index}
                          className="bg-white/60 rounded-lg p-3 border border-white/40"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <p className="text-gray-700 text-sm">{suggestion}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis Metadata */}
                <div className="glass-card p-4 bg-gray-50/60">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Analysis Method</p>
                      <p className="font-medium text-gray-800">
                        {moodResult.method || 'Face Analysis'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Faces Detected</p>
                      <p className="font-medium text-gray-800">
                        {moodResult.faceCount || 1}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600">Analyzed</p>
                      <p className="font-medium text-gray-800">
                        {new Date(moodResult.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button
                    onClick={resetAnalysis}
                    className="w-full secondary-btn flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RefreshCw size={20} />
                    <span>Analyze Another Photo</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => window.location.href = '/journal'}
                    className="w-full primary-btn flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowRight size={20} />
                    <span>Continue to Journal</span>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-8 text-center"
              >
                <Eye className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="font-semibold text-gray-600 mb-2">Ready for Analysis</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Capture or upload a photo to analyze your current mood through facial expressions.
                </p>
                
                {/* Features List */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={16} />
                    <span>Real-time facial expression analysis</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={16} />
                    <span>Personalized mood insights</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={16} />
                    <span>Actionable wellbeing suggestions</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={16} />
                    <span>Privacy-focused analysis</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Supported Moods Information */}
      {supportedMoods && (
        <motion.div 
          className="mt-12 glass-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Detectable Moods & Emotions</h3>
            <p className="text-gray-600">Our AI can recognize these emotional states from your facial expressions</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {supportedMoods.moods?.map((mood, index) => (
              <motion.div
                key={mood}
                className="text-center p-3 bg-white/50 rounded-lg border border-white/30 hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl mb-2">{moodService.getMoodEmoji(mood)}</div>
                <p className="text-sm font-medium text-gray-700 capitalize">{mood}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MoodDetectionPage;