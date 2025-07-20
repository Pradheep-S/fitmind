const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  profileImage: {
    type: String,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    dailyReminder: {
      enabled: {
        type: Boolean,
        default: false
      },
      time: {
        type: String,
        default: '20:00' // 8 PM
      }
    }
  },
  stats: {
    totalEntries: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastEntryDate: {
      type: Date,
      default: null
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    profileImage: this.profileImage,
    preferences: this.preferences,
    stats: this.stats,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt
  };
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with salt of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update user stats when a journal entry is created
userSchema.methods.updateStats = async function() {
  const Journal = mongoose.model('Journal');
  
  // Get total entries for this user
  const totalEntries = await Journal.countDocuments({ user: this._id });
  
  // Get last entry date
  const lastEntry = await Journal.findOne({ user: this._id }).sort({ date: -1 });
  const lastEntryDate = lastEntry ? lastEntry.date : null;
  
  // Calculate current streak
  let currentStreak = 0;
  if (lastEntryDate) {
    const entries = await Journal.find({ user: this._id })
      .sort({ date: -1 })
      .select('date');
    
    let streakDate = new Date();
    streakDate.setHours(0, 0, 0, 0);
    
    for (const entry of entries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((streakDate - entryDate) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 0 || dayDiff === 1) {
        currentStreak++;
        streakDate.setDate(streakDate.getDate() - 1);
      } else {
        break;
      }
    }
  }
  
  // Update stats
  this.stats.totalEntries = totalEntries;
  this.stats.currentStreak = currentStreak;
  this.stats.longestStreak = Math.max(this.stats.longestStreak, currentStreak);
  this.stats.lastEntryDate = lastEntryDate;
  
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
