import * as faceapi from 'face-api.js';

class FaceDetectionService {
  constructor() {
    this.isInitialized = false;
    this.modelsLoaded = false;
    this.detectionOptions = null;
    this.modelPath = '/face-models'; // Models should be in public/face-models/
  }

  // Initialize face-api.js with models
  async initialize() {
    if (this.isInitialized) return true;

    try {
      console.log('Initializing Face Detection Service...');
      
      // Load face detection models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(this.modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.modelPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(this.modelPath),
        faceapi.nets.faceExpressionNet.loadFromUri(this.modelPath),
        faceapi.nets.ageGenderNet.loadFromUri(this.modelPath)
      ]);

      this.modelsLoaded = true;
      
      // Set detection options
      this.detectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.5
      });

      this.isInitialized = true;
      console.log('Face Detection Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Face Detection Service:', error);
      this.isInitialized = false;
      return false;
    }
  }

  // Check if service is ready
  isReady() {
    return this.isInitialized && this.modelsLoaded;
  }

  // Detect faces and expressions from video element
  async detectFromVideo(videoElement) {
    if (!this.isReady()) {
      throw new Error('Face detection service not initialized');
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoElement, this.detectionOptions)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      return this.processDetections(detections);
    } catch (error) {
      console.error('Video face detection error:', error);
      return null;
    }
  }

  // Detect faces and expressions from image element
  async detectFromImage(imageElement) {
    if (!this.isReady()) {
      throw new Error('Face detection service not initialized');
    }

    try {
      const detections = await faceapi
        .detectAllFaces(imageElement, this.detectionOptions)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      return this.processDetections(detections);
    } catch (error) {
      console.error('Image face detection error:', error);
      return null;
    }
  }

  // Process detection results
  processDetections(detections) {
    if (!detections || detections.length === 0) {
      return {
        faceCount: 0,
        faces: [],
        dominantEmotion: null,
        avgConfidence: 0,
        expressions: {}
      };
    }

    const faces = detections.map((detection, index) => {
      const { expressions, age, gender, genderProbability } = detection;
      const box = detection.detection.box;
      
      // Get dominant emotion
      const emotionEntries = Object.entries(expressions);
      const dominantEmotion = emotionEntries.reduce((max, current) => 
        current[1] > max[1] ? current : max
      );

      return {
        id: index,
        box: {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height
        },
        expressions: expressions,
        dominantEmotion: {
          emotion: dominantEmotion[0],
          confidence: dominantEmotion[1]
        },
        age: Math.round(age),
        gender: gender,
        genderConfidence: genderProbability,
        landmarks: detection.landmarks
      };
    });

    // Calculate overall statistics
    const allExpressions = {};
    const emotionKeys = Object.keys(detections[0].expressions);
    
    emotionKeys.forEach(emotion => {
      const values = detections.map(d => d.expressions[emotion]);
      allExpressions[emotion] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    // Find overall dominant emotion
    const overallDominantEmotion = Object.entries(allExpressions)
      .reduce((max, current) => current[1] > max[1] ? current : max);

    return {
      faceCount: detections.length,
      faces: faces,
      dominantEmotion: {
        emotion: overallDominantEmotion[0],
        confidence: overallDominantEmotion[1]
      },
      avgConfidence: Object.values(allExpressions).reduce((sum, val) => sum + val, 0) / emotionKeys.length,
      expressions: allExpressions,
      timestamp: Date.now()
    };
  }

  // Real-time emotion tracking
  startRealTimeDetection(videoElement, callback, options = {}) {
    if (!this.isReady()) {
      throw new Error('Face detection service not initialized');
    }

    const {
      interval = 200, // Detection interval in ms
      minConfidence = 0.3,
      enableSmoothing = true
    } = options;

    let isRunning = true;
    let smoothingBuffer = [];
    const bufferSize = 5;

    const detect = async () => {
      if (!isRunning) return;

      try {
        const result = await this.detectFromVideo(videoElement);
        
        if (result && result.faceCount > 0) {
          let processedResult = result;

          // Apply smoothing if enabled
          if (enableSmoothing) {
            smoothingBuffer.push(result);
            if (smoothingBuffer.length > bufferSize) {
              smoothingBuffer.shift();
            }
            processedResult = this.applySmoothingFilter(smoothingBuffer);
          }

          // Only callback if confidence meets threshold
          if (processedResult.dominantEmotion.confidence >= minConfidence) {
            callback(processedResult);
          }
        }

        setTimeout(detect, interval);
      } catch (error) {
        console.error('Real-time detection error:', error);
        setTimeout(detect, interval * 2); // Retry with longer interval
      }
    };

    detect();

    // Return stop function
    return () => {
      isRunning = false;
    };
  }

  // Apply smoothing filter to reduce jitter
  applySmoothingFilter(buffer) {
    if (buffer.length === 0) return null;
    if (buffer.length === 1) return buffer[0];

    const latest = buffer[buffer.length - 1];
    const smoothedExpressions = {};
    
    // Average emotions across buffer
    Object.keys(latest.expressions).forEach(emotion => {
      const values = buffer.map(result => result.expressions[emotion]);
      smoothedExpressions[emotion] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    // Find smoothed dominant emotion
    const dominantEmotion = Object.entries(smoothedExpressions)
      .reduce((max, current) => current[1] > max[1] ? current : max);

    return {
      ...latest,
      expressions: smoothedExpressions,
      dominantEmotion: {
        emotion: dominantEmotion[0],
        confidence: dominantEmotion[1]
      }
    };
  }

  // Get emotion insights
  getEmotionInsights(emotion, confidence) {
    const insights = {
      happy: {
        high: "You're radiating joy! This positive energy can boost your overall well-being.",
        medium: "You're showing signs of happiness. Consider what's bringing you joy today.",
        low: "There are subtle hints of contentment. Small moments of joy are building up."
      },
      sad: {
        high: "You're experiencing significant sadness. It's okay to feel this way - consider reaching out for support.",
        medium: "You're showing some signs of sadness. Take time to process your feelings.",
        low: "There's a touch of melancholy. Sometimes quiet reflection can be healing."
      },
      angry: {
        high: "Strong anger is present. Take deep breaths and consider healthy ways to process this emotion.",
        medium: "You're showing signs of frustration. What might be causing these feelings?",
        low: "There's some tension present. Physical activity might help release it."
      },
      fearful: {
        high: "Significant fear or anxiety is detected. Consider breathing exercises or speaking with someone.",
        medium: "You're showing some signs of worry. What concerns might you address today?",
        low: "There's subtle nervousness. Grounding techniques might be helpful."
      },
      surprised: {
        high: "You're very surprised! Strong reactions can indicate important moments.",
        medium: "Something has caught your attention. New experiences can be enriching.",
        low: "There's a hint of curiosity. Stay open to new discoveries."
      },
      disgusted: {
        high: "Strong aversion is present. Consider what boundaries you might need to set.",
        medium: "You're showing some displeasure. What changes might improve your situation?",
        low: "There's subtle discomfort. Trust your instincts about your environment."
      },
      neutral: {
        high: "You're in a calm, balanced state. This equanimity is valuable for decision-making.",
        medium: "You're showing emotional stability. This balance serves you well.",
        low: "You're relatively calm. This peaceful state can be restorative."
      }
    };

    const level = confidence >= 0.7 ? 'high' : confidence >= 0.4 ? 'medium' : 'low';
    return insights[emotion]?.[level] || "Your emotional state is unique and valid.";
  }

  // Analyze facial landmarks for additional insights
  analyzeFacialLandmarks(landmarks) {
    if (!landmarks) return {};

    const positions = landmarks.positions;
    
    // Analyze mouth curve for smile intensity
    const mouthPoints = positions.slice(48, 68);
    const mouthLeft = mouthPoints[0];
    const mouthRight = mouthPoints[6];
    const mouthTop = mouthPoints[13];
    const mouthBottom = mouthPoints[19];
    
    const smileIntensity = (mouthLeft.y + mouthRight.y) / 2 - mouthTop.y;
    
    // Analyze eye openness
    const leftEye = positions.slice(36, 42);
    const rightEye = positions.slice(42, 48);
    
    const leftEyeOpenness = this.calculateEyeOpenness(leftEye);
    const rightEyeOpenness = this.calculateEyeOpenness(rightEye);
    
    return {
      smileIntensity: Math.max(0, smileIntensity / 10), // Normalized
      eyeOpenness: (leftEyeOpenness + rightEyeOpenness) / 2,
      facialSymmetry: Math.abs(leftEyeOpenness - rightEyeOpenness) < 0.1
    };
  }

  calculateEyeOpenness(eyePoints) {
    const topPoint = (eyePoints[1].y + eyePoints[2].y) / 2;
    const bottomPoint = (eyePoints[4].y + eyePoints[5].y) / 2;
    const width = Math.abs(eyePoints[3].x - eyePoints[0].x);
    
    return (bottomPoint - topPoint) / width;
  }

  // Convert to format compatible with existing mood service
  convertToMoodServiceFormat(faceResult) {
    if (!faceResult || faceResult.faceCount === 0) {
      return null;
    }

    return {
      success: true,
      data: {
        mood: faceResult.dominantEmotion.emotion,
        confidence: faceResult.dominantEmotion.confidence,
        expressions: faceResult.expressions,
        faceCount: faceResult.faceCount,
        method: 'face-detection',
        timestamp: faceResult.timestamp,
        moodInsights: this.getEmotionInsights(
          faceResult.dominantEmotion.emotion,
          faceResult.dominantEmotion.confidence
        ),
        suggestions: this.generateSuggestions(faceResult.dominantEmotion.emotion)
      }
    };
  }

  generateSuggestions(emotion) {
    const suggestions = {
      happy: [
        "Share your joy with others - happiness is contagious!",
        "Capture this moment in your journal to remember what brings you joy",
        "Consider spreading kindness to extend this positive energy"
      ],
      sad: [
        "Be gentle with yourself - it's okay to feel sad sometimes",
        "Try some deep breathing or meditation to find inner peace",
        "Reach out to a friend or loved one for support",
        "Engage in a comforting activity like listening to music or reading"
      ],
      angry: [
        "Take a few deep breaths before responding to any situation",
        "Try physical exercise to channel this energy constructively",
        "Consider what boundaries you might need to set",
        "Practice the STOP technique: Stop, Take a breath, Observe, Proceed mindfully"
      ],
      fearful: [
        "Use grounding techniques: name 5 things you can see, 4 you can touch, 3 you can hear",
        "Practice box breathing: inhale for 4, hold for 4, exhale for 4, hold for 4",
        "Remember that it's okay to ask for help when feeling overwhelmed",
        "Focus on what you can control in this moment"
      ],
      surprised: [
        "Take a moment to process this new information or experience",
        "Consider how this surprise might lead to growth or learning",
        "Stay open to new possibilities that may emerge"
      ],
      disgusted: [
        "Trust your instincts about what feels right for you",
        "Consider what changes you might need to make in your environment",
        "Set healthy boundaries to protect your well-being"
      ],
      neutral: [
        "This balanced state is perfect for making important decisions",
        "Use this calm energy for reflection or planning",
        "Consider practicing gratitude for this moment of peace"
      ]
    };

    return suggestions[emotion] || [
      "Every emotion is valid and temporary",
      "Take time to honor how you're feeling right now"
    ];
  }
}

// Create singleton instance
const faceDetectionService = new FaceDetectionService();

export default faceDetectionService;