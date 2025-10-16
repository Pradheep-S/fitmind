import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, CameraOff, RotateCcw, Upload, Eye, Loader2, 
  AlertCircle, CheckCircle, Play, Square, Focus, 
  Volume2, VolumeX, Monitor, Settings
} from 'lucide-react';

const EnhancedMoodCamera = ({ onMoodDetected, isAnalyzing, disabled, onEmotionData, onCameraReady, ...props }) => {
  // Camera state
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  
  // Enhanced features
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [fps, setFps] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [resolution, setResolution] = useState('HD');
  const [mirrorMode, setMirrorMode] = useState(true);
  
  // Device capabilities
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [streamStats, setStreamStats] = useState({
    width: 0,
    height: 0,
    frameRate: 0
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const detectionInterval = useRef(null);
  const fpsInterval = useRef(null);
  const lastFrameTime = useRef(0);

  useEffect(() => {
    initializeCamera();
    
    return () => {
      cleanup();
    };
  }, []);

  // FPS counter
  useEffect(() => {
    if (isStreaming) {
      fpsInterval.current = setInterval(() => {
        const currentTime = Date.now();
        const deltaTime = currentTime - lastFrameTime.current;
        if (deltaTime > 0) {
          setFps(Math.round(1000 / deltaTime));
        }
        lastFrameTime.current = currentTime;
      }, 1000);
    } else {
      if (fpsInterval.current) {
        clearInterval(fpsInterval.current);
        fpsInterval.current = null;
      }
    }

    return () => {
      if (fpsInterval.current) {
        clearInterval(fpsInterval.current);
      }
    };
  }, [isStreaming]);

  const initializeCamera = async () => {
    try {
      await checkCameraAvailability();
      await getAvailableDevices();
    } catch (err) {
      console.error('Camera initialization failed:', err);
    }
  };

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasCamera(videoDevices.length > 0);
      
      if (videoDevices.length === 0) {
        setError('No camera devices found. You can still upload an image for analysis.');
      }
    } catch (err) {
      console.error('Error checking camera availability:', err);
      setError('Unable to access camera permissions.');
      setHasCamera(false);
    }
  };

  const getAvailableDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);
      
      // Select front camera by default
      const frontCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('front') || 
        device.label.toLowerCase().includes('user')
      );
      setSelectedDeviceId(frontCamera?.deviceId || videoDevices[0]?.deviceId || '');
    } catch (err) {
      console.error('Error getting camera devices:', err);
    }
  };

  const getConstraints = () => {
    const baseConstraints = {
      video: {
        facingMode: 'user',
        width: resolution === '4K' ? { ideal: 3840 } : 
               resolution === 'FHD' ? { ideal: 1920 } : 
               resolution === 'HD' ? { ideal: 1280 } : { ideal: 640 },
        height: resolution === '4K' ? { ideal: 2160 } : 
                resolution === 'FHD' ? { ideal: 1080 } : 
                resolution === 'HD' ? { ideal: 720 } : { ideal: 480 },
        frameRate: { ideal: 30, min: 15 }
      }
    };

    if (selectedDeviceId) {
      baseConstraints.video.deviceId = { exact: selectedDeviceId };
    }

    if (audioEnabled) {
      baseConstraints.audio = true;
    }

    return baseConstraints;
  };

  const startCamera = async () => {
    try {
      setError(null);
      setCameraReady(false);
      setFrameCount(0);
      setIsInitializingCamera(true);
      
      // Set streaming to true immediately to hide drag/drop area
      setIsStreaming(true);
      
      const constraints = getConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Get stream stats
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          setStreamStats({
            width: settings.width || 0,
            height: settings.height || 0,
            frameRate: settings.frameRate || 0
          });
        }
        
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          setIsInitializingCamera(false);
          startFaceDetection();
          
          // Notify parent about camera ready
          if (onCameraReady) {
            onCameraReady(videoRef.current);
          }
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setIsInitializingCamera(false);
      handleCameraError(err);
    }
  };

  const handleCameraError = (err) => {
    let errorMessage = 'Unable to access camera. ';
    
    if (err.name === 'NotAllowedError') {
      errorMessage += 'Camera permission was denied. Please allow camera access and try again.';
    } else if (err.name === 'NotFoundError') {
      errorMessage += 'No camera device found.';
    } else if (err.name === 'NotReadableError') {
      errorMessage += 'Camera is already in use by another application.';
    } else if (err.name === 'OverconstrainedError') {
      errorMessage += 'Camera does not support the requested settings.';
    } else {
      errorMessage += 'Please check your camera settings.';
    }
    
    setError(errorMessage);
    setIsStreaming(false);
    setCameraReady(false);
  };

  const stopCamera = () => {
    cleanup();
    setIsStreaming(false);
    setCameraReady(false);
    setCapturedImage(null);
    setFaceDetected(false);
    setCurrentEmotion(null);
    setConfidenceLevel(0);
    setFrameCount(0);
    setFps(0);
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    
    if (fpsInterval.current) {
      clearInterval(fpsInterval.current);
      fpsInterval.current = null;
    }
  };

  // Mock face detection - replace with actual face-api.js integration
  const startFaceDetection = () => {
    if (!videoRef.current) return;

    detectionInterval.current = setInterval(async () => {
      if (!videoRef.current || !cameraReady) return;

      setFrameCount(prev => prev + 1);

      // Mock face detection results
      const mockDetection = Math.random() > 0.3; // 70% chance of face detection
      setFaceDetected(mockDetection);

      if (mockDetection) {
        // Mock face position
        const centerX = videoRef.current.videoWidth / 2;
        const centerY = videoRef.current.videoHeight / 2;
        const width = 200;
        const height = 250;
        
        setFacePosition({
          x: centerX - width / 2 + (Math.random() - 0.5) * 50,
          y: centerY - height / 2 + (Math.random() - 0.5) * 50,
          width,
          height
        });

        // Mock emotion detection
        const emotions = ['happy', 'sad', 'surprised', 'angry', 'fearful', 'disgusted', 'neutral'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        const confidence = Math.random() * 0.4 + 0.6; // 60-100% confidence
        
        setCurrentEmotion(randomEmotion);
        setConfidenceLevel(confidence);

        // Emit real-time emotion data
        if (onEmotionData) {
          onEmotionData({
            emotion: randomEmotion,
            confidence,
            faceDetected: true,
            timestamp: Date.now()
          });
        }
      }
    }, 100); // 10 FPS detection
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply mirror effect if enabled
    if (mirrorMode) {
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0);
    } else {
      context.drawImage(video, 0, 0);
    }
    
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        
        const file = new File([blob], 'captured-mood.jpg', { type: 'image/jpeg' });
        onMoodDetected && onMoodDetected(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const startRecording = () => {
    setIsRecording(true);
    // Add video recording logic here
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Stop video recording logic here
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      stopCamera();
      onMoodDetected && onMoodDetected(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      stopCamera();
      onMoodDetected && onMoodDetected(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
  };

  const getStatusColor = () => {
    if (!cameraReady) return 'text-yellow-500';
    if (faceDetected) return 'text-green-500';
    return 'text-blue-500';
  };

  const getStatusText = () => {
    if (!cameraReady) return 'Initializing...';
    if (faceDetected) return 'Face Detected';
    return 'Looking for face...';
  };

  return (
    <motion.div 
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-card p-6">
        {/* Header with Status */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Eye className="mr-2" size={24} />
            Enhanced Mood Detection
          </h3>
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-3">
            {isStreaming && (
              <>
                <div className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${faceDetected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                  <span className={getStatusColor()}>{getStatusText()}</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  {fps} FPS
                </div>
                
                {isRecording && (
                  <div className="flex items-center text-red-600 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                    REC
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Camera Settings */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            disabled={isStreaming}
            className="px-3 py-1 bg-white/50 border border-gray-300 rounded-lg text-sm"
          >
            <option value="SD">SD (640x480)</option>
            <option value="HD">HD (1280x720)</option>
            <option value="FHD">Full HD (1920x1080)</option>
            <option value="4K">4K (3840x2160)</option>
          </select>
          
          <button
            onClick={() => setMirrorMode(!mirrorMode)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              mirrorMode ? 'bg-blue-500 text-white' : 'bg-white/50 text-gray-600'
            }`}
          >
            Mirror
          </button>
          
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            disabled={isStreaming}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              audioEnabled ? 'bg-green-500 text-white' : 'bg-white/50 text-gray-600'
            }`}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
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

        {/* Camera/Image Display Area */}
        <div className="relative mb-4">
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative border-2 border-gray-200 shadow-lg">
            {/* Live Video Stream */}
            {isStreaming && !capturedImage && (
              <div className="relative w-full h-full">
                {isInitializingCamera ? (
                  // Camera Loading State
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <Loader2 className="animate-spin mx-auto mb-4 text-gray-500" size={48} />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Starting Camera</h3>
                      <p className="text-sm text-gray-600">Please allow camera access when prompted</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted={!audioEnabled}
                      className={`w-full h-full object-cover ${mirrorMode ? 'transform scale-x-[-1]' : ''}`}
                    />
                    
                    {/* Professional Overlays */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Face Detection Guide */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          className="border-2 border-white/60 rounded-xl bg-white/10 backdrop-blur-sm"
                          style={{
                            width: '320px',
                            height: '400px'
                          }}
                          animate={{
                            borderColor: faceDetected ? '#22c55e' : '#ffffff99',
                            backgroundColor: faceDetected ? '#22c55e20' : '#ffffff10'
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex flex-col items-center justify-center h-full text-white/80">
                            <motion.div
                              animate={{ 
                                scale: faceDetected ? 1.1 : 1,
                                color: faceDetected ? '#22c55e' : '#ffffff'
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <Eye size={32} className="mb-2" />
                            </motion.div>
                            <p className="text-sm font-medium">
                              {faceDetected ? 'Perfect! Face detected' : 'Position your face here'}
                            </p>
                            <p className="text-xs mt-1 opacity-75">
                              Look directly at the camera
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                  {/* Face Detection Box */}
                  {faceDetected && facePosition.width > 0 && (
                    <motion.div
                      className="absolute border-2 border-green-400 rounded-lg"
                      style={{
                        left: `${(facePosition.x / videoRef.current?.videoWidth) * 100}%`,
                        top: `${(facePosition.y / videoRef.current?.videoHeight) * 100}%`,
                        width: `${(facePosition.width / videoRef.current?.videoWidth) * 100}%`,
                        height: `${(facePosition.height / videoRef.current?.videoHeight) * 100}%`
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      {/* Face detection corners */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-green-400"></div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-green-400"></div>
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-green-400"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-green-400"></div>
                    </motion.div>
                  )}

                  {/* Real-time Emotion Display */}
                  {currentEmotion && faceDetected && (
                    <motion.div
                      className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-xl backdrop-blur-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {currentEmotion === 'happy' ? '😊' :
                           currentEmotion === 'sad' ? '😢' :
                           currentEmotion === 'angry' ? '😠' :
                           currentEmotion === 'fearful' ? '😨' :
                           currentEmotion === 'disgusted' ? '🤢' :
                           currentEmotion === 'surprised' ? '😲' :
                           '😐'}
                        </span>
                        <div>
                          <p className="text-sm font-medium capitalize">{currentEmotion}</p>
                          <div className="flex items-center">
                            <div className="w-20 h-1 bg-white/30 rounded-full mr-2">
                              <motion.div 
                                className="h-1 bg-green-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${confidenceLevel * 100}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <span className="text-xs">{Math.round(confidenceLevel * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Camera Status */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      LIVE
                    </div>
                    
                    {cameraReady && (
                      <div className="bg-green-500/90 text-white px-2 py-1 rounded text-xs flex items-center">
                        <CheckCircle size={12} className="mr-1" />
                        {streamStats.width}x{streamStats.height}
                      </div>
                    )}
                    
                    {isRecording && (
                      <div className="bg-red-500/90 text-white px-2 py-1 rounded text-xs flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                        REC
                      </div>
                    )}
                  </div>

                  {/* Bottom Status Bar */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-4">
                          <span>Frames: {frameCount}</span>
                          <span>FPS: {fps}</span>
                          {faceDetected && (
                            <span className="text-green-400">
                              ● Face Detected
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Focus size={16} />
                          <span>Auto Focus</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
            )}

            {/* Captured Image */}
            {capturedImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-full"
              >
                <img
                  src={capturedImage}
                  alt="Captured for mood analysis"
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute top-4 left-4">
                  <div className="bg-blue-500/90 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    <Camera size={12} className="mr-2" />
                    Photo Captured
                  </div>
                </div>
              </motion.div>
            )}

            {/* Drag and Drop Area */}
            {!isStreaming && !capturedImage && (
              <div
                className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed transition-all duration-200 ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 bg-gray-50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 text-lg font-medium mb-2">
                  Drag and drop an image here
                </p>
                <p className="text-gray-500 text-sm text-center px-4">
                  Or use the camera controls below to capture your mood
                </p>
              </div>
            )}

            {/* Analysis Overlay */}
            {isAnalyzing && (
              <motion.div 
                className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-white text-center">
                  <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-semibold mb-2">Analyzing Your Mood</h3>
                  <p className="text-sm opacity-80">Processing facial expressions...</p>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Hidden Elements */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Professional Control Panel */}
        <div className="space-y-4">
          {/* Primary Controls */}
          {hasCamera && (
            <div className="flex space-x-2">
              {!isStreaming ? (
                <motion.button
                  onClick={startCamera}
                  disabled={disabled || isAnalyzing}
                  className="flex-1 primary-btn flex items-center justify-center space-x-2 py-3"
                  whileHover={!disabled && !isAnalyzing ? { scale: 1.02 } : {}}
                  whileTap={!disabled && !isAnalyzing ? { scale: 0.98 } : {}}
                >
                  <Camera size={20} />
                  <span>Start HD Camera</span>
                </motion.button>
              ) : (
                <>
                  {!capturedImage ? (
                    <>
                      <motion.button
                        onClick={captureImage}
                        disabled={disabled || isAnalyzing}
                        className="flex-1 primary-btn flex items-center justify-center space-x-2 py-3"
                        whileHover={!disabled && !isAnalyzing ? { scale: 1.02 } : {}}
                        whileTap={!disabled && !isAnalyzing ? { scale: 0.98 } : {}}
                      >
                        <Camera size={20} />
                        <span>Capture Photo</span>
                      </motion.button>
                      
                      <motion.button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={disabled || isAnalyzing}
                        className={`px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                          isRecording 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                        whileHover={!disabled && !isAnalyzing ? { scale: 1.02 } : {}}
                        whileTap={!disabled && !isAnalyzing ? { scale: 0.98 } : {}}
                      >
                        {isRecording ? <Square size={20} /> : <Play size={20} />}
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      onClick={retakePhoto}
                      disabled={disabled || isAnalyzing}
                      className="flex-1 secondary-btn flex items-center justify-center space-x-2 py-3"
                      whileHover={!disabled && !isAnalyzing ? { scale: 1.02 } : {}}
                      whileTap={!disabled && !isAnalyzing ? { scale: 0.98 } : {}}
                    >
                      <RotateCcw size={20} />
                      <span>Retake Photo</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={stopCamera}
                    disabled={disabled || isAnalyzing}
                    className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                    whileHover={!disabled && !isAnalyzing ? { scale: 1.02 } : {}}
                    whileTap={!disabled && !isAnalyzing ? { scale: 0.98 } : {}}
                  >
                    <CameraOff size={20} />
                  </motion.button>
                </>
              )}
            </div>
          )}

          {/* Upload Control */}
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isAnalyzing}
            className="w-full secondary-btn flex items-center justify-center space-x-2 py-3"
            whileHover={!disabled && !isAnalyzing ? { scale: 1.02 } : {}}
            whileTap={!disabled && !isAnalyzing ? { scale: 0.98 } : {}}
          >
            <Upload size={20} />
            <span>Upload Image</span>
          </motion.button>
        </div>

        {/* Professional Tips */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-start">
            <Eye className="text-blue-600 mr-3 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-blue-800 font-semibold mb-2">Professional Tips</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Ensure good lighting - face a window or bright light source</li>
                <li>• Position your face within the guide overlay for best results</li>
                <li>• Natural expressions work better than forced smiles</li>
                <li>• HD resolution provides more accurate emotion detection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedMoodCamera;