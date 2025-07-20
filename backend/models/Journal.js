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
    enum: ['happy', 'sad', 'anxious', 'grateful', 'excited', 'calm', 'stressed', 'thoughtful', 'content', 'overwhelmed', 'other'],
    default: 'thoughtful'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  suggestions: [{
    type: String,
    trim: true
  }],
  summary: {
    type: String,
    trim: true
  },
  aiAnalysis: {
    emotions: [{
      emotion: String,
      confidence: Number
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

module.exports = mongoose.model('Journal', journalSchema);
