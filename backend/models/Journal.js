const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  mood: {
    type: String,
    required: false,
    enum: ['happy', 'sad', 'anxious', 'grateful', 'excited', 'calm', 'stressed', 'thoughtful', 'content', 'overwhelmed', 'frustrated', 'hopeful', 'lonely', 'confident', 'uncertain', 'motivated', 'tired', 'peaceful', 'joyful', 'reflective', 'burnout', 'other'],
    default: 'thoughtful'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  suggestions: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  enhancedSuggestions: [{
    category: {
      type: String,
      enum: ['immediate', 'daily_practice', 'lifestyle', 'professional', 'social'],
      default: 'daily_practice'
    },
    action: String,
    reason: String,
    timeframe: {
      type: String,
      enum: ['now', 'today', 'this_week', 'ongoing'],
      default: 'ongoing'
    }
  }],
  summary: {
    type: String,
    trim: true
  },
  aiAnalysis: {
    emotions: [{
      emotion: String,
      confidence: Number,
      intensity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }],
    keywords: [String],
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1,
      default: 0
    },
    psychologicalThemes: [{
      theme: String,
      confidence: Number,
      description: String
    }],
    stressIndicators: {
      level: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
      },
      triggers: [String],
      physicalSigns: [String],
      cognitivePatterns: [String]
    },
    positiveElements: [{
      element: String,
      description: String
    }],
    growthOpportunities: [{
      area: String,
      description: String
    }],
    riskFactors: [{
      factor: String,
      level: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
      },
      description: String
    }],
    categories: [{
      category: String,
      subcategory: String,
      confidence: Number
    }],
    labels: [String],
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    followUpRecommended: {
      type: Boolean,
      default: false
    },
    cbtInsights: {
      thoughtPatterns: [String],
      cognitiveDistortions: [{
        type: String,
        example: String
      }],
      behavioralPatterns: [String]
    },
    enhancedAnalysis: {
      type: Boolean,
      default: false
    },
    aiSource: {
      type: String,
      enum: ['gemini', 'fallback', 'openai'],
      default: 'fallback'
    }
  },
  faceAnalysis: {
    enabled: {
      type: Boolean,
      default: false
    },
    mood: {
      type: String,
      enum: ['happy', 'sad', 'anxious', 'grateful', 'excited', 'calm', 'stressed', 'thoughtful', 'content', 'overwhelmed', 'frustrated', 'hopeful', 'lonely', 'confident', 'uncertain'],
      required: false
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    rawEmotion: {
      type: String,
      enum: ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'],
      required: false
    },
    expressions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    faceCount: {
      type: Number,
      default: 0
    },
    moodInsights: {
      type: String,
      trim: true
    },
    suggestions: [String],
    analysisTimestamp: {
      type: Date,
      default: Date.now
    },
    analysisMethod: {
      type: String,
      enum: ['face-analysis', 'fallback', 'combined'],
      default: 'face-analysis'
    },
    fallbackReason: {
      type: String,
      trim: true
    },
    combinedWithText: {
      type: Boolean,
      default: false
    }
  },
  wordCount: {
    type: Number,
    default: 0
  },
  userId: {
    type: String,
    required: false // Optional for now, can be added later for user authentication
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate word count
journalSchema.pre('save', function(next) {
  if (this.text) {
    this.wordCount = this.text.trim().split(/\s+/).length;
  }
  next();
});

// Index for better query performance
journalSchema.index({ date: -1 });
journalSchema.index({ mood: 1 });
journalSchema.index({ user: 1, date: -1 });
journalSchema.index({ user: 1 });
journalSchema.index({ 'faceAnalysis.enabled': 1 });
journalSchema.index({ 'faceAnalysis.mood': 1 });
journalSchema.index({ user: 1, 'faceAnalysis.enabled': 1 });

module.exports = mongoose.model('Journal', journalSchema);
