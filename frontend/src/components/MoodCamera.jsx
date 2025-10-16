import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, RotateCcw, Upload, Eye, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const MoodCamera = ({ onMoodDetected, isAnalyzing, disabled }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    checkCameraAvailability();
    
    return () => {
      stopCamera();
    };
  }, []);

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

  const startCamera = async () => {
    try {
      setError(null);
      setCameraReady(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          setIsStreaming(true);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Camera permission was denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera device found.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += 'Please check your camera settings.';
      }
      
      setError(errorMessage);
      setIsStreaming(false);
      setCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setCameraReady(false);
    setCapturedImage(null);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        
        // Convert to file for analysis
        const file = new File([blob], 'captured-mood.jpg', { type: 'image/jpeg' });
        onMoodDetected && onMoodDetected(file);
      }
    }, 'image/jpeg', 0.8);
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

  return (
    <motion.div 
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <Eye className="mr-2" size={20} />
            Mood Detection
          </h3>
          {isStreaming && (
            <div className="flex items-center text-green-600 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live
            </div>
          )}
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
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative border-2 border-gray-200">
            {/* Live Video Stream */}
            {isStreaming && !capturedImage && (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                
                {/* Camera Status Overlay */}
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <div className="flex items-center bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Live Camera
                  </div>
                  {cameraReady && (
                    <div className="bg-green-500/90 text-white px-2 py-1 rounded text-xs flex items-center">
                      <CheckCircle size={12} className="mr-1" />
                      Ready
                    </div>
                  )}
                </div>

                {/* Face Detection Guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-48 border-2 border-white/50 rounded-lg flex items-center justify-center">
                    <div className="text-white/70 text-center">
                      <Eye size={24} className="mx-auto mb-2" />
                      <p className="text-sm">Position your face here</p>
                    </div>
                  </div>
                </div>

                {/* Recording Indicator */}
                {cameraReady && (
                  <div className="absolute top-3 right-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
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
                
                {/* Captured Image Overlay */}
                <div className="absolute top-3 left-3">
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
                <Upload className="text-gray-400 mb-2" size={32} />
                <p className="text-gray-600 text-sm text-center px-4">
                  Drag and drop an image here, or use the buttons below
                </p>
              </div>
            )}

            {/* Analysis Overlay */}
            {isAnalyzing && (
              <motion.div 
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-white text-center">
                  <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                  <p className="text-sm">Analyzing your mood...</p>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Hidden Canvas for Image Capture */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Control Buttons */}
        <div className="space-y-3">
          {/* Camera Controls */}
          {hasCamera && (
            <div className="flex space-x-2">
              {!isStreaming ? (
                <motion.button
                  onClick={startCamera}
                  disabled={disabled || isAnalyzing}
                  className="flex-1 primary-btn flex items-center justify-center space-x-2"
                  whileHover={!disabled && !isAnalyzing ? { scale: 1.02 } : {}}
                  whileTap={!disabled && !isAnalyzing ? { scale: 0.98 } : {}}
                >
                  <Camera size={20} />
                  <span>Start Camera</span>
                </motion.button>
              ) : (
                <>
                  {!capturedImage ? (
                    <motion.button
                      onClick={captureImage}
                      disabled={disabled || isAnalyzing}
                      className="flex-1 primary-btn flex items-center justify-center space-x-2"
                      whileHover={!disabled && !isAnalyzing ? { scale: 1.02 } : {}}
                      whileTap={!disabled && !isAnalyzing ? { scale: 0.98 } : {}}
                    >
                      <Camera size={20} />
                      <span>Capture</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={retakePhoto}
                      disabled={disabled || isAnalyzing}
                      className="flex-1 secondary-btn flex items-center justify-center space-x-2"
                      whileHover={!disabled && !isAnalyzing ? { scale: 1.02 } : {}}
                      whileTap={!disabled && !isAnalyzing ? { scale: 0.98 } : {}}
                    >
                      <RotateCcw size={20} />
                      <span>Retake</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={stopCamera}
                    disabled={disabled || isAnalyzing}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                    whileHover={!disabled && !isAnalyzing ? { scale: 1.02 } : {}}
                    whileTap={!disabled && !isAnalyzing ? { scale: 0.98 } : {}}
                  >
                    <CameraOff size={20} />
                  </motion.button>
                </>
              )}
            </div>
          )}

          {/* Upload Button */}
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isAnalyzing}
            className="w-full secondary-btn flex items-center justify-center space-x-2"
            whileHover={!disabled && !isAnalyzing ? { scale: 1.02 } : {}}
            whileTap={!disabled && !isAnalyzing ? { scale: 0.98 } : {}}
          >
            <Upload size={20} />
            <span>Upload Image</span>
          </motion.button>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-sm">
            💡 <strong>Tip:</strong> For best results, ensure good lighting and face the camera directly. 
            Your facial expressions will be analyzed to determine your current mood.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MoodCamera;