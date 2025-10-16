const tf = require('@tensorflow/tfjs-node');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
const fs = require('fs').promises;
const path = require('path');

// Patch canvas for face-api.js
faceapi.env.monkeyPatch({
  Canvas,
  Image,
  ImageData
});

class FaceAnalysisService {
  constructor() {
    this.isInitialized = false;
    this.modelPath = path.join(__dirname, '../models/face-models');
  }

  async initializeModels() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🚀 Initializing face analysis models...');
      
      // Create models directory if it doesn't exist
      await this.ensureModelsDirectory();

      // Load face-api.js models
      await faceapi.nets.tinyFaceDetector.loadFromDisk(this.modelPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(this.modelPath);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(this.modelPath);
      await faceapi.nets.faceExpressionNet.loadFromDisk(this.modelPath);

      this.isInitialized = true;
      console.log('✅ Face analysis models initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize face analysis models:', error.message);
      console.log('📋 Using fallback emotion detection');
    }
  }

  async ensureModelsDirectory() {
    try {
      await fs.access(this.modelPath);
    } catch (error) {
      console.log('📁 Creating models directory...');
      await fs.mkdir(this.modelPath, { recursive: true });
      console.log('⚠️ Note: Face detection models not found. Download from face-api.js repository');
      console.log('📥 Models needed: tiny_face_detector, face_landmark_68, face_recognition, face_expression');
    }
  }

  async analyzeImage(imageBuffer) {
    console.log('\n🔍 === FACIAL MOOD ANALYSIS REQUESTED ===');
    console.log('📷 Image buffer size:', imageBuffer.length);

    try {
      await this.initializeModels();

      if (!this.isInitialized) {
        return this.getFallbackAnalysis('Models not loaded');
      }

      // Create canvas from image buffer
      const img = new Image();
      img.src = imageBuffer;

      // Detect faces and expressions
      console.log('🤖 Running face detection...');
      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length === 0) {
        console.log('😐 No faces detected in image');
        return this.getFallbackAnalysis('No faces detected');
      }

      console.log(`👤 Detected ${detections.length} face(s)`);

      // Analyze the first (primary) face
      const primaryFace = detections[0];
      const expressions = primaryFace.expressions;

      // Get dominant emotion
      const dominantEmotion = this.getDominantEmotion(expressions);
      const confidence = expressions[dominantEmotion];

      // Map to FitMind mood categories
      const moodMapping = this.mapEmotionToMood(dominantEmotion, expressions);

      console.log('🎭 Dominant emotion:', dominantEmotion, 'Confidence:', confidence);
      console.log('😊 Mapped mood:', moodMapping.mood);

      return {
        success: true,
        mood: moodMapping.mood,
        confidence: confidence,
        rawEmotion: dominantEmotion,
        expressions: expressions,
        faceCount: detections.length,
        moodInsights: moodMapping.insights,
        suggestions: this.generateSuggestions(moodMapping.mood, dominantEmotion),
        timestamp: new Date().toISOString(),
        method: 'face-analysis'
      };

    } catch (error) {
      console.error('❌ Face analysis error:', error.message);
      return this.getFallbackAnalysis(`Analysis error: ${error.message}`);
    }
  }

  getDominantEmotion(expressions) {
    let maxConfidence = 0;
    let dominantEmotion = 'neutral';

    for (const [emotion, confidence] of Object.entries(expressions)) {
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        dominantEmotion = emotion;
      }
    }

    return dominantEmotion;
  }

  mapEmotionToMood(emotion, expressions) {
    // Map face-api.js emotions to FitMind mood categories
    const emotionToMoodMap = {
      'happy': {
        mood: 'happy',
        insights: 'Your facial expression shows positive emotions and contentment.'
      },
      'sad': {
        mood: 'sad',
        insights: 'Your expression indicates some sadness or melancholy feelings.'
      },
      'angry': {
        mood: 'frustrated',
        insights: 'Your facial expression shows signs of frustration or anger.'
      },
      'fearful': {
        mood: 'anxious',
        insights: 'Your expression suggests anxiety or nervousness.'
      },
      'disgusted': {
        mood: 'frustrated',
        insights: 'Your expression shows displeasure or dissatisfaction.'
      },
      'surprised': {
        mood: 'excited',
        insights: 'Your expression indicates surprise or heightened alertness.'
      },
      'neutral': {
        mood: 'calm',
        insights: 'Your expression appears calm and composed.'
      }
    };

    // Check for mixed emotions
    const sortedEmotions = Object.entries(expressions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (sortedEmotions.length > 1) {
      const [first, second] = sortedEmotions;
      const confidenceDiff = first[1] - second[1];

      // If emotions are close, provide mixed interpretation
      if (confidenceDiff < 0.3) {
        return {
          mood: emotionToMoodMap[emotion].mood,
          insights: `Your expression shows mixed emotions, primarily ${emotion} with hints of ${second[0]}. This suggests complex feelings that might benefit from deeper reflection.`
        };
      }
    }

    return emotionToMoodMap[emotion] || emotionToMoodMap['neutral'];
  }

  generateSuggestions(mood, rawEmotion) {
    const suggestions = {
      'happy': [
        'Share your positive energy with others today',
        'Take a moment to reflect on what\'s bringing you joy',
        'Consider writing about your happy thoughts in your journal'
      ],
      'sad': [
        'Practice self-compassion and allow yourself to feel these emotions',
        'Reach out to a trusted friend or family member',
        'Consider gentle activities like listening to music or taking a walk'
      ],
      'anxious': [
        'Try deep breathing exercises (4-7-8 technique)',
        'Ground yourself by naming 5 things you can see, 4 you can touch, 3 you can hear',
        'Consider meditation or mindfulness practices'
      ],
      'frustrated': [
        'Take some deep breaths and count to ten',
        'Channel your energy into physical activity or exercise',
        'Write about what\'s frustrating you to gain clarity'
      ],
      'excited': [
        'Harness this positive energy for productive activities',
        'Share your excitement with people who matter to you',
        'Consider setting new goals while you\'re feeling motivated'
      ],
      'calm': [
        'Enjoy this peaceful state of mind',
        'Use this clarity for planning or reflection',
        'Practice gratitude for this moment of tranquility'
      ]
    };

    return suggestions[mood] || suggestions['calm'];
  }

  getFallbackAnalysis(reason) {
    console.log(`=== USING FALLBACK FACE ANALYSIS (${reason}) ===`);
    
    return {
      success: false,
      mood: 'thoughtful',
      confidence: 0.5,
      rawEmotion: 'neutral',
      expressions: { neutral: 0.5 },
      faceCount: 0,
      moodInsights: 'Unable to analyze facial expressions. Consider ensuring good lighting and facing the camera directly.',
      suggestions: [
        'Try taking another photo with better lighting',
        'Make sure your face is clearly visible and centered',
        'Consider expressing your mood through journaling instead'
      ],
      timestamp: new Date().toISOString(),
      method: 'fallback',
      fallbackReason: reason
    };
  }

  async analyzeMoodFromText(text) {
    // Fallback text-based mood analysis for comparison
    const emotionKeywords = {
      happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'blessed', 'grateful'],
      sad: ['sad', 'down', 'depressed', 'upset', 'disappointed', 'hurt', 'crying', 'tears'],
      anxious: ['anxious', 'worried', 'nervous', 'stressed', 'panic', 'fear', 'scared', 'overwhelmed'],
      frustrated: ['angry', 'mad', 'frustrated', 'annoyed', 'irritated', 'furious', 'rage'],
      calm: ['calm', 'peaceful', 'serene', 'relaxed', 'zen', 'tranquil', 'content']
    };

    const textLower = text.toLowerCase();
    const moodScores = {};

    for (const [mood, keywords] of Object.entries(emotionKeywords)) {
      const count = keywords.filter(keyword => textLower.includes(keyword)).length;
      moodScores[mood] = count / keywords.length;
    }

    const dominantMood = Object.entries(moodScores)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      mood: dominantMood[0] || 'thoughtful',
      confidence: dominantMood[1] || 0.3,
      method: 'text-analysis'
    };
  }
}

module.exports = new FaceAnalysisService();