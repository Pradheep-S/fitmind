import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Eye, Sparkles, Brain, Zap, 
  CheckCircle, AlertCircle, X, Maximize2,
  Minimize2, Settings
} from 'lucide-react';
import EnhancedMoodCamera from './EnhancedMoodCamera';
import EmotionDisplaySystem from './EmotionDisplaySystem';
import faceDetectionService from '../services/faceDetectionService';
import moodService from '../services/moodService';

const JournalMoodIntegration = ({ 
  journalText, 
  onMoodAnalysis, 
  onJournalTextUpdate,
  isVisible,
  onToggle 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodResult, setMoodResult] = useState(null);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [realTimeData, setRealTimeData] = useState(null);
  const [serviceReady, setServiceReady] = useState(false);
  const [settings, setSettings] = useState({
    autoEnhanceText: true,
    realTimePreview: true,
    combineAnalysis: true
  });

  const initServiceRef = useRef(false);

  // Initialize face detection service on first use
  const initializeService = async () => {
    if (initServiceRef.current) return;
    
    try {
      const ready = await faceDetectionService.initialize();
      setServiceReady(ready);
      initServiceRef.current = true;
    } catch (error) {
      console.error('Failed to initialize face detection:', error);
      setServiceReady(false);
    }
  };

  const handleMoodDetection = async (imageFile) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      let result = null;

      // Try client-side detection first
      if (serviceReady) {
        try {
          const img = new Image();
          img.src = URL.createObjectURL(imageFile);
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          
          const faceResult = await faceDetectionService.detectFromImage(img);
          if (faceResult && faceResult.faceCount > 0) {
            result = faceDetectionService.convertToMoodServiceFormat(faceResult);
          }
          URL.revokeObjectURL(img.src);
        } catch (clientError) {
          console.warn('Client-side detection failed, falling back to server:', clientError);
        }
      }

      // Fallback to server analysis
      if (!result) {
        result = await moodService.analyzeMoodFromImage(
          imageFile, 
          settings.combineAnalysis ? journalText : ''
        );
      }

      if (result && result.success) {
        setMoodResult(result.data);
        
        // Auto-enhance journal text if enabled
        if (settings.autoEnhanceText && result.data.moodInsights) {
          enhanceJournalText(result.data);
        }
        
        // Notify parent component
        if (onMoodAnalysis) {
          onMoodAnalysis(result.data);
        }
      } else {
        throw new Error(result?.message || 'Mood analysis failed');
      }

    } catch (error) {
      console.error('Mood detection error:', error);
      setError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const enhanceJournalText = (moodData) => {
    if (!onJournalTextUpdate) return;

    let enhancement = '';
    
    // Add mood context if journal is empty or short
    if (journalText.trim().length < 50) {
      enhancement = `Today I'm feeling ${moodData.mood}. `;
      
      if (moodData.moodInsights) {
        enhancement += `${moodData.moodInsights}\n\n`;
      }
      
      // Add reflection prompts based on emotion
      const prompts = getReflectionPrompts(moodData.mood);
      if (prompts.length > 0) {
        enhancement += prompts[0] + ' ';
      }
    } else {
      // Add mood analysis as a new paragraph
      enhancement = `\n\n[Mood Update: Feeling ${moodData.mood} with ${Math.round(moodData.confidence * 100)}% confidence]`;
    }

    onJournalTextUpdate(journalText + enhancement);
  };

  const getReflectionPrompts = (mood) => {
    const prompts = {
      happy: [
        "What specific moments brought me joy today?",
        "How can I share this positive energy with others?",
        "What am I most grateful for right now?"
      ],
      sad: [
        "What's weighing on my heart today?",
        "How can I be gentle with myself during this difficult time?",
        "What small step could help me feel a little better?"
      ],
      anxious: [
        "What thoughts are creating worry for me?",
        "What can I control in this situation?",
        "What grounding techniques might help me right now?"
      ],
      angry: [
        "What's triggering my frustration?",
        "How can I channel this energy constructively?",
        "What boundaries might I need to set?"
      ],
      neutral: [
        "How am I feeling in this moment of calm?",
        "What am I noticing about my day so far?",
        "What intentions do I want to set going forward?"
      ]
    };
    
    return prompts[mood] || [
      "How am I feeling right now?",
      "What's on my mind today?",
      "What would I like to explore in my writing?"
    ];
  };

  const handleRealTimeEmotion = (emotionData) => {
    if (settings.realTimePreview) {
      setRealTimeData(emotionData);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 border-t border-gray-200 pt-6"
    >
      <div className="glass-card p-6 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 border-2 border-purple-200/50">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg mr-3">
              <Eye className="text-white" size={20} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800">
                Enhanced Mood Analysis
              </h4>
              <p className="text-sm text-gray-600">
                Add facial emotion detection to your journal entry
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Service Status */}
            {serviceReady ? (
              <div className="flex items-center text-green-600 text-xs">
                <CheckCircle size={14} className="mr-1" />
                AI Ready
              </div>
            ) : (
              <button
                onClick={initializeService}
                className="flex items-center text-blue-600 text-xs hover:text-blue-700"
              >
                <Zap size={14} className="mr-1" />
                Initialize AI
              </button>
            )}
            
            {/* Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-white/50"
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            
            {/* Close */}
            <button
              onClick={onToggle}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-white/50"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Quick Settings */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSettings(prev => ({ ...prev, autoEnhanceText: !prev.autoEnhanceText }))}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              settings.autoEnhanceText 
                ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            Auto-enhance text
          </button>
          
          <button
            onClick={() => setSettings(prev => ({ ...prev, realTimePreview: !prev.realTimePreview }))}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              settings.realTimePreview 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            Real-time preview
          </button>
          
          <button
            onClick={() => setSettings(prev => ({ ...prev, combineAnalysis: !prev.combineAnalysis }))}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              settings.combineAnalysis 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            Combine with text
          </button>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-start">
                <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`grid gap-6 ${isExpanded ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          
          {/* Camera Section */}
          <div className={isExpanded ? 'lg:col-span-1' : 'col-span-1'}>
            <EnhancedMoodCamera
              onMoodDetected={handleMoodDetection}
              onEmotionData={handleRealTimeEmotion}
              isAnalyzing={isAnalyzing}
              disabled={false}
              size="medium"
            />
          </div>

          {/* Results Section */}
          {(isExpanded || moodResult || realTimeData) && (
            <div className="lg:col-span-1">
              <EmotionDisplaySystem
                emotionData={moodResult || realTimeData}
                isAnalyzing={isAnalyzing}
                showRealTime={settings.realTimePreview}
                size="medium"
              />
              
              {/* Integration Actions */}
              {moodResult && (
                <motion.div
                  className="mt-4 space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-white/70 rounded-lg p-3 border border-white/50">
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                      <Sparkles className="mr-2" size={16} />
                      Journal Enhancement
                    </h5>
                    
                    {settings.autoEnhanceText ? (
                      <p className="text-sm text-green-700">
                        ✓ Your journal has been enhanced with mood insights
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Add mood context to your journal entry?
                        </p>
                        <button
                          onClick={() => enhanceJournalText(moodResult)}
                          className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                        >
                          Enhance Journal Text
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Suggested Prompts */}
                  <div className="bg-white/70 rounded-lg p-3 border border-white/50">
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                      <Brain className="mr-2" size={16} />
                      Reflection Prompts
                    </h5>
                    <div className="space-y-1">
                      {getReflectionPrompts(moodResult.mood).slice(0, 2).map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => onJournalTextUpdate && onJournalTextUpdate(journalText + '\n\n' + prompt + ' ')}
                          className="block w-full text-left text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded p-2 transition-colors"
                        >
                          → {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Collapsed Preview */}
        {!isExpanded && (moodResult || realTimeData) && (
          <motion.div
            className="mt-4 p-3 bg-white/70 rounded-lg border border-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">
                  {moodService.getMoodEmoji((moodResult || realTimeData).mood)}
                </span>
                <div>
                  <p className="font-medium text-gray-800 capitalize">
                    {(moodResult || realTimeData).mood}
                  </p>
                  <p className="text-xs text-gray-600">
                    {Math.round(((moodResult || realTimeData).confidence || 0) * 100)}% confidence
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
              >
                View Details
              </button>
            </div>
          </motion.div>
        )}

        {/* Tips */}
        <div className="mt-4 p-3 bg-blue-50/70 rounded-lg border border-blue-200/50">
          <div className="flex items-start">
            <Eye className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-blue-800 font-medium text-sm">Integration Tips</p>
              <ul className="text-blue-700 text-xs mt-1 space-y-1">
                <li>• Take a photo while writing to capture your authentic emotions</li>
                <li>• Enable "Combine with text" for comprehensive mood analysis</li>
                <li>• Use reflection prompts to deepen your journal entries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JournalMoodIntegration;