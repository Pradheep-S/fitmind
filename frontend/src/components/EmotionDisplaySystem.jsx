import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Activity, Brain, Zap, Heart, 
  Star, Sparkles, Target, BarChart3
} from 'lucide-react';

const EmotionDisplaySystem = ({ 
  emotionData, 
  isAnalyzing, 
  showRealTime = false,
  size = 'large' // 'small', 'medium', 'large', 'xl'
}) => {
  const [animatedConfidence, setAnimatedConfidence] = useState({});
  const [dominantEmotion, setDominantEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);

  useEffect(() => {
    if (emotionData) {
      // Animate confidence bars
      const newConfidence = {};
      Object.entries(emotionData.expressions || {}).forEach(([emotion, value]) => {
        setTimeout(() => {
          setAnimatedConfidence(prev => ({
            ...prev,
            [emotion]: value
          }));
        }, Math.random() * 500);
      });

      // Update dominant emotion
      if (emotionData.mood) {
        setDominantEmotion({
          emotion: emotionData.mood,
          confidence: emotionData.confidence || 0
        });
      }

      // Add to history for real-time tracking
      if (showRealTime && emotionData.mood) {
        setEmotionHistory(prev => [...prev.slice(-19), {
          emotion: emotionData.mood,
          confidence: emotionData.confidence || 0,
          timestamp: Date.now()
        }]);
      }
    }
  }, [emotionData, showRealTime]);

  const getEmotionEmoji = (emotion) => {
    const emojiMap = {
      'happy': '😊',
      'joy': '😄',
      'excited': '🤩',
      'content': '😌',
      'grateful': '🙏',
      'love': '😍',
      'peaceful': '😇',
      
      'sad': '😢',
      'melancholy': '😔',
      'disappointed': '😞',
      'grief': '😭',
      'lonely': '🥺',
      
      'angry': '😠',
      'frustrated': '😤',
      'irritated': '😒',
      'rage': '🤬',
      'annoyed': '🙄',
      
      'fearful': '😨',
      'anxious': '😰',
      'worried': '😟',
      'nervous': '😬',
      'scared': '😱',
      'stressed': '😵‍💫',
      
      'surprised': '😲',
      'amazed': '🤯',
      'shocked': '😳',
      'astonished': '😮',
      
      'disgusted': '🤢',
      'disgusting': '🤮',
      'repulsed': '😣',
      
      'neutral': '😐',
      'calm': '🧘',
      'thoughtful': '🤔',
      'confused': '🤷',
      'uncertain': '😕',
      'contemplative': '🤨'
    };
    
    return emojiMap[emotion?.toLowerCase()] || '🌟';
  };

  const getEmotionColor = (emotion, type = 'bg') => {
    const colorMap = {
      'happy': type === 'bg' ? 'from-yellow-400 to-orange-500' : 'text-yellow-600',
      'joy': type === 'bg' ? 'from-yellow-300 to-amber-400' : 'text-yellow-500',
      'excited': type === 'bg' ? 'from-purple-400 to-pink-500' : 'text-purple-600',
      'content': type === 'bg' ? 'from-green-300 to-blue-400' : 'text-green-600',
      'grateful': type === 'bg' ? 'from-emerald-400 to-teal-500' : 'text-emerald-600',
      'love': type === 'bg' ? 'from-pink-400 to-red-500' : 'text-pink-600',
      'peaceful': type === 'bg' ? 'from-blue-300 to-cyan-400' : 'text-blue-500',
      
      'sad': type === 'bg' ? 'from-blue-400 to-blue-600' : 'text-blue-600',
      'melancholy': type === 'bg' ? 'from-indigo-400 to-purple-500' : 'text-indigo-600',
      'disappointed': type === 'bg' ? 'from-gray-400 to-blue-500' : 'text-gray-600',
      'grief': type === 'bg' ? 'from-slate-500 to-blue-700' : 'text-slate-700',
      'lonely': type === 'bg' ? 'from-blue-300 to-indigo-400' : 'text-blue-500',
      
      'angry': type === 'bg' ? 'from-red-500 to-orange-600' : 'text-red-600',
      'frustrated': type === 'bg' ? 'from-red-400 to-pink-500' : 'text-red-500',
      'irritated': type === 'bg' ? 'from-orange-400 to-red-500' : 'text-orange-600',
      'rage': type === 'bg' ? 'from-red-600 to-red-800' : 'text-red-700',
      'annoyed': type === 'bg' ? 'from-yellow-500 to-orange-500' : 'text-yellow-700',
      
      'fearful': type === 'bg' ? 'from-purple-500 to-indigo-600' : 'text-purple-600',
      'anxious': type === 'bg' ? 'from-red-400 to-pink-500' : 'text-red-500',
      'worried': type === 'bg' ? 'from-yellow-500 to-orange-500' : 'text-yellow-600',
      'nervous': type === 'bg' ? 'from-green-400 to-yellow-500' : 'text-green-600',
      'scared': type === 'bg' ? 'from-purple-600 to-red-600' : 'text-purple-700',
      'stressed': type === 'bg' ? 'from-red-500 to-orange-500' : 'text-red-600',
      
      'surprised': type === 'bg' ? 'from-cyan-400 to-blue-500' : 'text-cyan-600',
      'amazed': type === 'bg' ? 'from-purple-400 to-blue-500' : 'text-purple-600',
      'shocked': type === 'bg' ? 'from-yellow-400 to-red-500' : 'text-yellow-600',
      'astonished': type === 'bg' ? 'from-pink-400 to-purple-500' : 'text-pink-600',
      
      'disgusted': type === 'bg' ? 'from-green-500 to-yellow-500' : 'text-green-600',
      'disgusting': type === 'bg' ? 'from-green-600 to-brown-500' : 'text-green-700',
      'repulsed': type === 'bg' ? 'from-yellow-600 to-orange-600' : 'text-yellow-700',
      
      'neutral': type === 'bg' ? 'from-gray-400 to-gray-600' : 'text-gray-600',
      'calm': type === 'bg' ? 'from-blue-300 to-green-400' : 'text-blue-500',
      'thoughtful': type === 'bg' ? 'from-indigo-400 to-purple-500' : 'text-indigo-600',
      'confused': type === 'bg' ? 'from-gray-400 to-indigo-400' : 'text-gray-600',
      'uncertain': type === 'bg' ? 'from-gray-300 to-blue-400' : 'text-gray-500',
      'contemplative': type === 'bg' ? 'from-purple-300 to-indigo-400' : 'text-purple-600'
    };
    
    return colorMap[emotion?.toLowerCase()] || (type === 'bg' ? 'from-gray-400 to-gray-600' : 'text-gray-600');
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.9) return { level: 'Extremely High', color: 'text-emerald-600', bg: 'bg-emerald-500' };
    if (confidence >= 0.8) return { level: 'Very High', color: 'text-green-600', bg: 'bg-green-500' };
    if (confidence >= 0.7) return { level: 'High', color: 'text-lime-600', bg: 'bg-lime-500' };
    if (confidence >= 0.6) return { level: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-500' };
    if (confidence >= 0.5) return { level: 'Medium', color: 'text-orange-600', bg: 'bg-orange-500' };
    if (confidence >= 0.4) return { level: 'Low', color: 'text-red-600', bg: 'bg-red-500' };
    return { level: 'Very Low', color: 'text-gray-600', bg: 'bg-gray-500' };
  };

  const getSizeClasses = () => {
    const sizeMap = {
      small: {
        emoji: 'text-4xl',
        container: 'p-4',
        title: 'text-lg',
        confidence: 'text-sm',
        chart: 'h-2'
      },
      medium: {
        emoji: 'text-6xl',
        container: 'p-6',
        title: 'text-xl',
        confidence: 'text-base',
        chart: 'h-3'
      },
      large: {
        emoji: 'text-8xl',
        container: 'p-8',
        title: 'text-2xl',
        confidence: 'text-lg',
        chart: 'h-4'
      },
      xl: {
        emoji: 'text-9xl',
        container: 'p-10',
        title: 'text-3xl',
        confidence: 'text-xl',
        chart: 'h-5'
      }
    };
    
    return sizeMap[size] || sizeMap.large;
  };

  const classes = getSizeClasses();

  if (isAnalyzing) {
    return (
      <motion.div 
        className={`glass-card ${classes.container} text-center`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "linear"
          }}
          className={`${classes.emoji} mb-4`}
        >
          🧠
        </motion.div>
        <motion.h3 
          className={`${classes.title} font-bold text-gray-800 mb-2`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Analyzing Emotions...
        </motion.h3>
        <p className="text-gray-600">Reading facial expressions and micro-emotions</p>
        
        {/* Analysis Progress */}
        <div className="mt-6">
          <div className="flex justify-center space-x-2 mb-4">
            {['😊', '😢', '😠', '😨', '😲', '🤢'].map((emoji, index) => (
              <motion.div
                key={index}
                className="text-2xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  repeat: Infinity 
                }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!emotionData || !dominantEmotion) {
    return (
      <motion.div 
        className={`glass-card ${classes.container} text-center`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={`${classes.emoji} mb-4 opacity-50`}>🎭</div>
        <h3 className={`${classes.title} font-bold text-gray-600 mb-2`}>
          Ready for Emotion Detection
        </h3>
        <p className="text-gray-500">
          Capture or upload a photo to see beautiful emotion visualization
        </p>
      </motion.div>
    );
  }

  const topEmotions = Object.entries(emotionData.expressions || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  const confidenceInfo = getConfidenceLevel(dominantEmotion.confidence);

  return (
    <div className="space-y-6">
      {/* Primary Emotion Display */}
      <motion.div
        className={`glass-card ${classes.container} bg-gradient-to-br ${getEmotionColor(dominantEmotion.emotion)} bg-opacity-10 border-2 border-opacity-20`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <div className="text-center">
          {/* Large Animated Emoji */}
          <motion.div 
            className={`${classes.emoji} mb-6`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 0.8, 
              type: "spring",
              bounce: 0.4
            }}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -5, 5, 0],
              transition: { duration: 0.5 }
            }}
          >
            {getEmotionEmoji(dominantEmotion.emotion)}
          </motion.div>
          
          {/* Emotion Name */}
          <motion.h3 
            className={`${classes.title} font-bold text-gray-800 capitalize mb-4`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {dominantEmotion.emotion}
          </motion.h3>
          
          {/* Confidence Visualization */}
          <motion.div 
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center mb-3">
              <div className={`w-4 h-4 rounded-full mr-3 ${confidenceInfo.bg}`}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-full h-full rounded-full bg-white/30"
                />
              </div>
              <p className={`font-bold ${confidenceInfo.color} ${classes.confidence}`}>
                {confidenceInfo.level} Confidence
              </p>
              <Sparkles className={`ml-2 ${confidenceInfo.color}`} size={20} />
            </div>
            
            {/* Animated Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
              <motion.div 
                className={`h-4 rounded-full bg-gradient-to-r ${getEmotionColor(dominantEmotion.emotion)} relative`}
                initial={{ width: 0 }}
                animate={{ width: `${dominantEmotion.confidence * 100}%` }}
                transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">0%</span>
              <motion.span 
                className={`font-bold ${getEmotionColor(dominantEmotion.emotion, 'text')} ${classes.confidence}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {Math.round(dominantEmotion.confidence * 100)}%
              </motion.span>
              <span className="text-gray-600 text-sm">100%</span>
            </div>
          </motion.div>
          
          {/* Insights */}
          {emotionData.moodInsights && (
            <motion.p 
              className="text-gray-700 leading-relaxed bg-white/50 rounded-lg p-4 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {emotionData.moodInsights}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Detailed Expression Breakdown */}
      {topEmotions.length > 0 && (
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h4 className="font-bold text-gray-800 mb-6 flex items-center text-xl">
            <Brain className="mr-3" size={24} />
            Expression Analysis
            <div className="ml-auto flex items-center text-sm text-gray-500">
              <Activity className="mr-1" size={16} />
              {topEmotions.length} emotions detected
            </div>
          </h4>
          
          <div className="grid gap-4">
            {topEmotions.map(([emotion, confidence], index) => (
              <motion.div 
                key={emotion} 
                className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <motion.span 
                      className="text-3xl mr-4"
                      whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {getEmotionEmoji(emotion)}
                    </motion.span>
                    <div>
                      <span className="text-gray-800 capitalize font-semibold text-lg">
                        {emotion}
                      </span>
                      {index === 0 && (
                        <div className="flex items-center mt-1">
                          <Star className="text-yellow-500 mr-1" size={14} />
                          <span className="text-xs text-yellow-600 font-medium">Primary</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-bold ${getEmotionColor(emotion, 'text')}`}>
                      {Math.round(confidence * 100)}%
                    </span>
                    <div className="text-xs text-gray-500">
                      {getConfidenceLevel(confidence).level}
                    </div>
                  </div>
                </div>
                
                {/* Animated Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    className={`h-3 rounded-full bg-gradient-to-r ${getEmotionColor(emotion)} relative`}
                    initial={{ width: 0 }}
                    animate={{ 
                      width: animatedConfidence[emotion] ? `${animatedConfidence[emotion] * 100}%` : 0
                    }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 1, ease: "easeOut" }}
                  >
                    {index < 3 && (
                      <motion.div
                        className="absolute inset-0 bg-white/40"
                        animate={{ 
                          opacity: [0.4, 0.8, 0.4],
                          scale: [1, 1.05, 1] 
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          delay: index * 0.3 
                        }}
                      />
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Real-time Emotion Tracking */}
      {showRealTime && emotionHistory.length > 0 && (
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h4 className="font-bold text-gray-800 mb-4 flex items-center text-xl">
            <TrendingUp className="mr-3" size={24} />
            Real-time Emotion Tracking
            <div className="ml-auto">
              <motion.div
                className="w-3 h-3 bg-green-500 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </h4>
          
          <div className="flex items-end space-x-1 h-20 mb-4">
            {emotionHistory.slice(-20).map((entry, index) => (
              <motion.div
                key={entry.timestamp}
                className={`bg-gradient-to-t ${getEmotionColor(entry.emotion)} rounded-t-lg flex-1 min-w-0`}
                style={{ height: `${entry.confidence * 100}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${entry.confidence * 100}%` }}
                transition={{ duration: 0.5 }}
                title={`${entry.emotion}: ${Math.round(entry.confidence * 100)}%`}
              />
            ))}
          </div>
          
          <div className="flex justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              High Confidence
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              Medium
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              Low
            </div>
          </div>
        </motion.div>
      )}

      {/* Emotion Statistics */}
      {emotionData.expressions && (
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h4 className="font-bold text-gray-800 mb-4 flex items-center text-xl">
            <BarChart3 className="mr-3" size={24} />
            Emotion Statistics
            <Zap className="ml-auto text-yellow-500" size={20} />
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(emotionData.expressions).length}
              </div>
              <div className="text-sm text-gray-600">Emotions Detected</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(Math.max(...Object.values(emotionData.expressions)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Peak Confidence</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  Object.values(emotionData.expressions).reduce((a, b) => a + b, 0) / 
                  Object.values(emotionData.expressions).length * 100
                )}%
              </div>
              <div className="text-sm text-gray-600">Avg Confidence</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {emotionData.faceCount || 1}
              </div>
              <div className="text-sm text-gray-600">Faces Analyzed</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EmotionDisplaySystem;