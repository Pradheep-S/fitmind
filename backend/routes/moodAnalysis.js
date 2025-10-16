const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const router = express.Router();
const faceAnalysisService = require('../services/faceAnalysisService');
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Analyze mood from uploaded image
router.post('/analyze-image', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('\n🔍 === MOOD ANALYSIS FROM IMAGE ===');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('📷 Image received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Process image with sharp for optimization
    let processedImageBuffer;
    try {
      processedImageBuffer = await sharp(req.file.buffer)
        .resize(640, 480, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      console.log('🖼️ Image processed successfully');
    } catch (processError) {
      console.error('❌ Image processing error:', processError.message);
      processedImageBuffer = req.file.buffer;
    }

    // Analyze the image for facial expressions
    const faceAnalysis = await faceAnalysisService.analyzeImage(processedImageBuffer);
    
    console.log('🎭 Face analysis result:', {
      success: faceAnalysis.success,
      mood: faceAnalysis.mood,
      confidence: faceAnalysis.confidence,
      faceCount: faceAnalysis.faceCount
    });

    // Optionally combine with text analysis if provided
    let combinedAnalysis = faceAnalysis;
    if (req.body.journalText && req.body.journalText.trim()) {
      console.log('📝 Combining with text analysis...');
      
      try {
        const textAnalysis = await aiService.analyzeJournal(req.body.journalText);
        
        // Combine face and text analysis
        combinedAnalysis = {
          ...faceAnalysis,
          textAnalysis: {
            mood: textAnalysis.mood,
            confidence: textAnalysis.confidence,
            sentiment: textAnalysis.sentiment,
            summary: textAnalysis.summary,
            suggestions: textAnalysis.suggestions
          },
          combinedMood: faceAnalysis.confidence > 0.7 ? faceAnalysis.mood : textAnalysis.mood,
          analysisMethod: 'combined'
        };
        
        console.log('🔀 Combined analysis completed');
      } catch (textError) {
        console.error('❌ Text analysis error:', textError.message);
        // Continue with just face analysis
      }
    }

    res.json({
      success: true,
      data: combinedAnalysis,
      message: faceAnalysis.success ? 
        'Facial mood analysis completed successfully' : 
        'Facial analysis failed, using fallback method'
    });

  } catch (error) {
    console.error('❌ Mood analysis endpoint error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze mood from image',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get supported moods and emotions
router.get('/supported-moods', (req, res) => {
  res.json({
    success: true,
    data: {
      moods: [
        'happy', 'sad', 'anxious', 'grateful', 'excited', 
        'calm', 'stressed', 'thoughtful', 'content', 
        'overwhelmed', 'frustrated', 'hopeful', 'lonely', 
        'confident', 'uncertain'
      ],
      faceExpressions: [
        'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'
      ],
      analysisCapabilities: {
        faceDetection: true,
        emotionRecognition: true,
        multiplefaces: true,
        textCombination: true
      }
    }
  });
});

// Test endpoint for face analysis service
router.get('/test-service', auth, async (req, res) => {
  try {
    await faceAnalysisService.initializeModels();
    
    res.json({
      success: true,
      message: 'Face analysis service is operational',
      initialized: faceAnalysisService.isInitialized,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Face analysis service test failed',
      error: error.message
    });
  }
});

// Error handling middleware specific to this router
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }

  next(error);
});

module.exports = router;