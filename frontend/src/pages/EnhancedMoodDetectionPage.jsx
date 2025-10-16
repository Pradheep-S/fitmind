import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Brain, Camera, TrendingUp, AlertCircle, 
  CheckCircle, RefreshCw, ArrowRight, Lightbulb,
  Heart, Calendar, BarChart3, Settings, Play,
  Pause, Download, Share, BookOpen, Zap,
  Activity, Target, Sparkles, Monitor
} from 'lucide-react';

import EnhancedMoodCamera from '../components/EnhancedMoodCamera';
import EmotionDisplaySystem from '../components/EmotionDisplaySystem';
import faceDetectionService from '../services/faceDetectionService';
import moodService from '../services/moodService';
import { useAuth } from '../contexts/AuthContext';

const EnhancedMoodDetectionPage = () => {
  // Core state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodResult, setMoodResult] = useState(null);
  const [error, setError] = useState(null);
  const [serviceStatus, setServiceStatus] = useState('initializing');
  const { user } = useAuth();

  // Real-time tracking state
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [realTimeData, setRealTimeData] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    startTime: null,
    totalDetections: 0,
    avgConfidence: 0,
    dominantEmotion: null
  });

  // Settings and preferences
  const [settings, setSettings] = useState({
    enableRealTime: true,
    detectionInterval: 200,
    confidenceThreshold: 0.4,
    enableSmoothing: true,
    autoSaveToJournal: false,
    showAdvancedMetrics: true
  });

  const stopRealTimeRef = useRef(null);

  useEffect(() => {
    initializePage();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializePage = async () => {
    try {
      setServiceStatus('initializing');
      
      // Initialize face detection service
      const faceServiceReady = await faceDetectionService.initialize();
      
      if (faceServiceReady) {
        console.log('Face detection service ready');
      }

      // Test backend service
      try {
        await moodService.testService();
        setServiceStatus('ready');
      } catch (testError) {
        setServiceStatus('limited');
        console.warn('Backend service limited, using client-side only:', testError.message);
      }
      
    } catch (error) {
      console.error('Failed to initialize enhanced mood detection:', error);
      setServiceStatus('error');
      setError('Failed to initialize emotion detection services. Some features may be limited.');
    }
  };

  const cleanup = () => {
    if (stopRealTimeRef.current) {
      stopRealTimeRef.current();
      stopRealTimeRef.current = null;
    }
  };

  const handleMoodDetection = async (imageFile) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      moodService.validateImageFile(imageFile);
      
      let result;
      
      // Try client-side face detection first for faster response
      if (faceDetectionService.isReady()) {
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
            URL.revokeObjectURL(img.src);
          }
        } catch (clientError) {
          console.warn('Client-side detection failed, falling back to server:', clientError);
        }
      }
      
      // Fallback to server analysis if client-side failed or unavailable
      if (!result && serviceStatus !== 'error') {
        result = await moodService.analyzeMoodFromImage(imageFile);
      }
      
      if (result && result.success) {
        setMoodResult(result.data);
        
        // Update session stats
        setSessionStats(prev => ({
          ...prev,
          totalDetections: prev.totalDetections + 1,
          dominantEmotion: result.data.mood
        }));
        
        // Auto-save to journal if enabled
        if (settings.autoSaveToJournal) {
          // Implementation for auto-save would go here
          console.log('Auto-saving to journal:', result.data);
        }
        
      } else {
        throw new Error(result?.message || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('Enhanced mood detection error:', error);
      setError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRealTimeMode = useCallback((videoElement) => {
    if (!faceDetectionService.isReady() || !videoElement) return;

    setIsRealTimeMode(true);
    setSessionStats(prev => ({
      ...prev,
      startTime: Date.now()
    }));

    stopRealTimeRef.current = faceDetectionService.startRealTimeDetection(
      videoElement,
      (result) => {
        setRealTimeData(result);
        
        // Add to emotion history
        setEmotionHistory(prev => [...prev.slice(-49), {
          emotion: result.dominantEmotion.emotion,
          confidence: result.dominantEmotion.confidence,
          timestamp: Date.now()
        }]);
        
        // Update session stats
        setSessionStats(prev => ({
          ...prev,
          totalDetections: prev.totalDetections + 1,
          avgConfidence: ((prev.avgConfidence * (prev.totalDetections - 1)) + result.dominantEmotion.confidence) / prev.totalDetections,
          dominantEmotion: result.dominantEmotion.emotion
        }));
      },
      {
        interval: settings.detectionInterval,
        minConfidence: settings.confidenceThreshold,
        enableSmoothing: settings.enableSmoothing
      }
    );
  }, [settings]);

  const stopRealTimeMode = () => {
    if (stopRealTimeRef.current) {
      stopRealTimeRef.current();
      stopRealTimeRef.current = null;
    }
    setIsRealTimeMode(false);
    setRealTimeData(null);
  };

  const resetAnalysis = () => {
    setMoodResult(null);
    setError(null);
    setRealTimeData(null);
    setEmotionHistory([]);
    setSessionStats({
      startTime: null,
      totalDetections: 0,
      avgConfidence: 0,
      dominantEmotion: null
    });
    stopRealTimeMode();
  };

  const exportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      moodResult,
      realTimeData,
      emotionHistory,
      sessionStats,
      settings
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `fitmind-emotion-analysis-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getStatusIndicator = () => {
    const statusConfig = {
      initializing: { color: 'text-blue-600', bg: 'bg-blue-100', icon: RefreshCw, text: 'Initializing...' },
      ready: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, text: 'Ready for Analysis' },
      limited: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertCircle, text: 'Limited Mode' },
      error: { color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle, text: 'Service Error' }
    };
    
    const config = statusConfig[serviceStatus];
    const Icon = config.icon;
    
    return (
      <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
        <Icon size={16} className={`mr-2 ${serviceStatus === 'initializing' ? 'animate-spin' : ''}`} />
        {config.text}
        {faceDetectionService.isReady() && (
          <div className="ml-2 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="ml-1 text-xs">AI Ready</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Enhanced Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl shadow-lg">
            <Eye className="text-white" size={40} />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Enhanced Emotion Detection
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-6">
          Experience professional-grade facial emotion analysis with real-time tracking, 
          beautiful visualizations, and actionable insights for your mental wellness journey.
        </p>
        
        {/* Status and Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          {getStatusIndicator()}
          
          {faceDetectionService.isReady() && (
            <button
              onClick={isRealTimeMode ? stopRealTimeMode : () => {}}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isRealTimeMode 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {isRealTimeMode ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
              {isRealTimeMode ? 'Real-time Active' : 'Real-time Ready'}
            </button>
          )}
          
          {emotionHistory.length > 0 && (
            <button
              onClick={exportData}
              className="flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
            >
              <Download size={16} className="mr-2" />
              Export Data
            </button>
          )}
        </div>

        {/* Session Statistics */}
        {sessionStats.totalDetections > 0 && (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-card p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{sessionStats.totalDetections}</div>
              <div className="text-xs text-gray-600">Detections</div>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(sessionStats.avgConfidence * 100)}%
              </div>
              <div className="text-xs text-gray-600">Avg Confidence</div>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {sessionStats.startTime ? Math.round((Date.now() - sessionStats.startTime) / 1000) : 0}s
              </div>
              <div className="text-xs text-gray-600">Session Time</div>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="text-2xl">
                {sessionStats.dominantEmotion === 'happy' ? '😊' :
                 sessionStats.dominantEmotion === 'sad' ? '😢' :
                 sessionStats.dominantEmotion === 'angry' ? '😠' :
                 sessionStats.dominantEmotion === 'fearful' ? '😨' :
                 sessionStats.dominantEmotion === 'surprised' ? '😲' :
                 sessionStats.dominantEmotion === 'disgusted' ? '🤢' :
                 '😐'}
              </div>
              <div className="text-xs text-gray-600">Dominant</div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="mb-6 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl"
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

      {/* Main Content Layout */}
      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        
        {/* Camera Section */}
        <div className="lg:col-span-1">
          <EnhancedMoodCamera 
            onMoodDetected={handleMoodDetection}
            onEmotionData={setRealTimeData}
            isAnalyzing={isAnalyzing}
            disabled={serviceStatus === 'error'}
            onCameraReady={(videoElement) => {
              if (settings.enableRealTime && faceDetectionService.isReady()) {
                startRealTimeMode(videoElement);
              }
            }}
          />
        </div>

        {/* Results and Real-time Display */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Primary Results */}
            <EmotionDisplaySystem
              emotionData={moodResult || realTimeData}
              isAnalyzing={isAnalyzing}
              showRealTime={isRealTimeMode}
              size="large"
            />
            
            {/* Real-time Chart */}
            {isRealTimeMode && emotionHistory.length > 0 && (
              <motion.div 
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Activity className="mr-2" size={20} />
                  Live Emotion Stream
                  <div className="ml-auto flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    LIVE
                  </div>
                </h4>
                
                <div className="flex items-end space-x-1 h-24 mb-4 bg-gray-50 rounded-lg p-2">
                  {emotionHistory.slice(-30).map((entry, index) => {
                    const emotions = ['happy', 'sad', 'angry', 'fearful', 'surprised', 'disgusted', 'neutral'];
                    const emotionIndex = emotions.indexOf(entry.emotion);
                    const colors = [
                      'bg-yellow-500', 'bg-blue-500', 'bg-red-500', 
                      'bg-purple-500', 'bg-cyan-500', 'bg-green-500', 'bg-gray-500'
                    ];
                    
                    return (
                      <motion.div
                        key={entry.timestamp}
                        className={`${colors[emotionIndex] || 'bg-gray-400'} rounded-t-sm flex-1 min-w-0`}
                        style={{ height: `${entry.confidence * 100}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${entry.confidence * 100}%` }}
                        transition={{ duration: 0.3 }}
                        title={`${entry.emotion}: ${Math.round(entry.confidence * 100)}%`}
                      />
                    );
                  })}
                </div>
                
                <div className="text-xs text-gray-600 text-center">
                  Last 30 seconds • Updates every {settings.detectionInterval}ms
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Additional Features */}
        <div className="lg:col-span-2 xl:col-span-1">
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                <Zap className="mr-2" size={20} />
                Quick Actions
              </h4>
              
              <div className="space-y-3">
                <motion.button
                  onClick={resetAnalysis}
                  className="w-full secondary-btn flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw size={18} />
                  <span>New Analysis</span>
                </motion.button>
                
                <motion.button
                  onClick={() => window.location.href = '/journal'}
                  className="w-full primary-btn flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BookOpen size={18} />
                  <span>Continue to Journal</span>
                </motion.button>
                
                {(moodResult || realTimeData) && (
                  <motion.button
                    onClick={() => {/* Share functionality */}}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share size={18} />
                    <span>Share Results</span>
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Settings Panel */}
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                <Settings className="mr-2" size={20} />
                Detection Settings
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Real-time Detection</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, enableRealTime: !prev.enableRealTime }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.enableRealTime ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      settings.enableRealTime ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">
                    Detection Interval: {settings.detectionInterval}ms
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={settings.detectionInterval}
                    onChange={(e) => setSettings(prev => ({ ...prev, detectionInterval: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">
                    Confidence Threshold: {Math.round(settings.confidenceThreshold * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.1"
                    value={settings.confidenceThreshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Smoothing Filter</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, enableSmoothing: !prev.enableSmoothing }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.enableSmoothing ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      settings.enableSmoothing ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Advanced Metrics */}
            {settings.showAdvancedMetrics && (moodResult || realTimeData) && (
              <motion.div 
                className="glass-card p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Target className="mr-2" size={20} />
                  Advanced Metrics
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Detection Method:</span>
                    <span className="font-medium">
                      {faceDetectionService.isReady() ? 'Client-side AI' : 'Server Analysis'}
                    </span>
                  </div>
                  
                  {(moodResult || realTimeData) && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Analysis Time:</span>
                        <span className="font-medium">
                          {new Date((moodResult || realTimeData).timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Faces Detected:</span>
                        <span className="font-medium">
                          {(moodResult || realTimeData).faceCount || 1}
                        </span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Status:</span>
                    <span className={`font-medium ${
                      serviceStatus === 'ready' ? 'text-green-600' :
                      serviceStatus === 'limited' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {serviceStatus === 'ready' ? 'Optimal' : 
                       serviceStatus === 'limited' ? 'Limited' : 'Error'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
          </div>
        </div>
      </div>

      {/* Professional Tips */}
      <motion.div 
        className="mt-12 glass-card p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Lightbulb className="text-yellow-500 mr-2" size={24} />
            <h3 className="text-2xl font-bold text-gray-800">Professional Tips for Best Results</h3>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Monitor size={24} className="text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Optimal Lighting</h4>
            <p className="text-sm text-gray-600">
              Face a window or bright light source. Avoid backlighting and harsh shadows.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target size={24} className="text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Face Positioning</h4>
            <p className="text-sm text-gray-600">
              Keep your face within the guide overlay and look directly at the camera.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart size={24} className="text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Natural Expressions</h4>
            <p className="text-sm text-gray-600">
              Be yourself. Authentic emotions provide more accurate and helpful insights.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles size={24} className="text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">HD Quality</h4>
            <p className="text-sm text-gray-600">
              Use HD resolution for more detailed facial analysis and better emotion detection.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedMoodDetectionPage;