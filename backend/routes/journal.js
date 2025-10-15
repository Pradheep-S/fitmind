const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const User = require('../models/User');
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');
const { body, validationResult, query } = require('express-validator');

// @route   POST /api/journal
// @desc    Create a new journal entry with AI analysis
// @access  Private
router.post('/', auth, [
  body('text')
    .notEmpty()
    .withMessage('Journal text is required')
    .isLength({ min: 10 })
    .withMessage('Journal entry must be at least 10 characters long')
    .trim()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text, date } = req.body;

    // Get AI analysis
    console.log('Analyzing journal entry for user:', req.user._id);
    const analysis = await aiService.analyzeJournal(text);
    
    // Create new journal entry
    const journalEntry = new Journal({
      user: req.user._id,
      date: date || new Date(),
      text: text.trim(),
      mood: analysis.mood,
      confidence: analysis.confidence,
      suggestions: analysis.suggestions,
      enhancedSuggestions: analysis.suggestions && typeof analysis.suggestions[0] === 'object' ? analysis.suggestions : [],
      summary: analysis.summary,
      aiAnalysis: {
        emotions: analysis.emotions || [],
        keywords: analysis.keywords || [],
        sentiment: analysis.sentiment || 'neutral',
        sentimentScore: analysis.sentimentScore || 0,
        psychologicalThemes: analysis.psychologicalThemes || [],
        stressIndicators: analysis.stressIndicators || {
          level: 'low',
          triggers: [],
          physicalSigns: [],
          cognitivePatterns: []
        },
        positiveElements: analysis.positiveElements || [],
        growthOpportunities: analysis.growthOpportunities || [],
        riskFactors: analysis.riskFactors || [],
        categories: analysis.categories || [],
        labels: analysis.labels || [],
        urgencyLevel: analysis.urgencyLevel || 'low',
        followUpRecommended: analysis.followUpRecommended || false,
        cbtInsights: analysis.cbtInsights || {
          thoughtPatterns: [],
          cognitiveDistortions: [],
          behavioralPatterns: []
        },
        enhancedAnalysis: analysis.enhancedAnalysis || false,
        aiSource: analysis.aiSource || 'fallback'
      }
    });

    const savedEntry = await journalEntry.save();
    
    // Update user stats
    await req.user.updateStats();
    
    console.log('Journal entry saved successfully');
    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: savedEntry
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create journal entry', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/journal
// @desc    Get all journal entries for authenticated user
// @access  Private
router.get('/', auth, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('mood')
    .optional()
    .isIn(['happy', 'sad', 'anxious', 'grateful', 'excited', 'calm', 'stressed', 'thoughtful', 'content', 'overwhelmed', 'other', 'all'])
    .withMessage('Invalid mood filter'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const mood = req.query.mood;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Build filter object - always filter by user
    const filter = { user: req.user._id };
    if (mood && mood !== 'all') {
      filter.mood = mood;
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const entries = await Journal.find(filter)
      .sort({ date: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Journal.countDocuments(filter);

    res.json({
      success: true,
      data: {
        entries,
        pagination: {
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch journal entries',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/journal/stats
// @desc    Get journal statistics and analytics for authenticated user
// @access  Private
router.get('/stats', auth, [
  query('range')
    .optional()
    .isIn(['week', 'month', 'year'])
    .withMessage('Range must be week, month, or year')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const range = req.query.range || 'week'; // week, month, year
    const now = new Date();
    let startDate;

    switch (range) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    // Get entries in range for the authenticated user
    const entries = await Journal.find({
      user: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    // Calculate stats
    const totalEntries = entries.length;
    const totalWords = entries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
    
    // Mood distribution
    const moodCounts = {};
    entries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      value: count,
      percentage: totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0,
      color: getMoodColor(mood)
    }));

    // Mood trend (last 7 days)
    const moodTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayEntries = entries.filter(entry => 
        entry.date.toDateString() === date.toDateString()
      );
      
      const averageSentiment = dayEntries.length > 0
        ? dayEntries.reduce((sum, entry) => sum + entry.aiAnalysis.sentimentScore, 0) / dayEntries.length
        : 0;
      
      moodTrend.push({
        date: date.toISOString(),
        mood: Math.round((averageSentiment + 1) * 5), // Convert to 0-10 scale
        entries: dayEntries.length
      });
    }

    // Calculate streaks
    const sortedEntries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check for current streak
    if (sortedEntries.length > 0) {
      const lastEntryDate = new Date(sortedEntries[0].date);
      if (lastEntryDate.toDateString() === today.toDateString() || 
          lastEntryDate.toDateString() === yesterday.toDateString()) {
        let checkDate = new Date(lastEntryDate);
        for (const entry of sortedEntries) {
          const entryDate = new Date(entry.date);
          if (entryDate.toDateString() === checkDate.toDateString()) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // Calculate longest streak
    let prevDate = null;
    for (const entry of sortedEntries.reverse()) {
      const entryDate = new Date(entry.date);
      if (prevDate && Math.abs(entryDate - prevDate) <= 86400000) { // Within 24 hours
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
      prevDate = entryDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Generate AI reflection
    const weeklyReflection = generateWeeklyReflection(entries, moodDistribution);

    // Generate additional insights
    const insights = generateInsights(entries, moodDistribution, totalWords);

    // Generate reminders and goals (mock data for now - could be from user preferences)
    const reminders = generateReminders(entries);

    res.json({
      success: true,
      data: {
        totalEntries,
        totalWords,
        averageWordsPerEntry: totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0,
        currentStreak: req.user.stats.currentStreak,
        longestStreak: req.user.stats.longestStreak,
        moodDistribution,
        moodTrend,
        averageMood: moodTrend.length > 0 ? 
          Math.round(moodTrend.reduce((sum, day) => sum + day.mood, 0) / moodTrend.length * 10) / 10 : 0,
        weeklyReflection,
        insights,
        reminders,
        range
      }
    });
  } catch (error) {
    console.error('Error fetching journal stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch journal statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/journal/:id
// @desc    Get a specific journal entry for authenticated user
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await Journal.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!entry) {
      return res.status(404).json({ 
        success: false,
        message: 'Journal entry not found' 
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid journal entry ID' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch journal entry',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/journal/:id
// @desc    Update a journal entry
// @access  Private
router.put('/:id', auth, [
  body('text')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Journal entry must be at least 10 characters long')
    .trim()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const entry = await Journal.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!entry) {
      return res.status(404).json({ 
        success: false,
        message: 'Journal entry not found' 
      });
    }

    const { text } = req.body;
    
    if (text) {
      // Re-analyze if text is updated
      const analysis = await aiService.analyzeJournal(text);
      
      entry.text = text;
      entry.mood = analysis.mood;
      entry.confidence = analysis.confidence;
      entry.suggestions = analysis.suggestions;
      entry.enhancedSuggestions = analysis.suggestions && typeof analysis.suggestions[0] === 'object' ? analysis.suggestions : [];
      entry.summary = analysis.summary;
      entry.aiAnalysis = {
        emotions: analysis.emotions || [],
        keywords: analysis.keywords || [],
        sentiment: analysis.sentiment || 'neutral',
        sentimentScore: analysis.sentimentScore || 0,
        psychologicalThemes: analysis.psychologicalThemes || [],
        stressIndicators: analysis.stressIndicators || {
          level: 'low',
          triggers: [],
          physicalSigns: [],
          cognitivePatterns: []
        },
        positiveElements: analysis.positiveElements || [],
        growthOpportunities: analysis.growthOpportunities || [],
        riskFactors: analysis.riskFactors || [],
        categories: analysis.categories || [],
        labels: analysis.labels || [],
        urgencyLevel: analysis.urgencyLevel || 'low',
        followUpRecommended: analysis.followUpRecommended || false,
        cbtInsights: analysis.cbtInsights || {
          thoughtPatterns: [],
          cognitiveDistortions: [],
          behavioralPatterns: []
        },
        enhancedAnalysis: analysis.enhancedAnalysis || false,
        aiSource: analysis.aiSource || 'fallback'
      };
    }

    await entry.save();

    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      data: entry
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid journal entry ID' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Failed to update journal entry',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/journal/:id
// @desc    Delete a journal entry for authenticated user
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Journal.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!entry) {
      return res.status(404).json({ 
        success: false,
        message: 'Journal entry not found' 
      });
    }

    // Update user stats after deletion
    await req.user.updateStats();

    res.json({ 
      success: true,
      message: 'Journal entry deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid journal entry ID' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete journal entry',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper functions
function getMoodColor(mood) {
  const colors = {
    happy: '#10B981',        // Green
    grateful: '#8B5CF6',     // Purple
    excited: '#F59E0B',      // Amber
    calm: '#3B82F6',         // Blue
    content: '#06D6A0',      // Teal
    thoughtful: '#6B7280',   // Gray
    stressed: '#EF4444',     // Red
    anxious: '#F97316',      // Orange
    sad: '#8B5A7D',          // Purple-pink
    overwhelmed: '#DC2626',  // Dark red
    frustrated: '#B45309',   // Brown
    hopeful: '#059669',      // Emerald
    lonely: '#7C3AED',       // Violet
    confident: '#0891B2',    // Cyan
    uncertain: '#9CA3AF',    // Cool gray
    motivated: '#16A34A',    // Green
    tired: '#6B7280',        // Neutral gray
    peaceful: '#0EA5E9',     // Sky blue
    joyful: '#FBBF24',       // Yellow
    reflective: '#8B5CF6',   // Indigo
    burnout: '#991B1B',      // Dark red
    other: '#94A3B8'         // Slate gray
  };
  return colors[mood] || '#6B7280';
}

function generateWeeklyReflection(entries, moodDistribution) {
  if (entries.length === 0) {
    return "Start journaling to get personalized insights about your emotional patterns and well-being trends.";
  }

  const totalEntries = entries.length;
  const dominantMood = moodDistribution.reduce((prev, current) => 
    (prev.value > current.value) ? prev : current
  );
  
  const avgSentiment = entries.reduce((sum, entry) => 
    sum + entry.aiAnalysis.sentimentScore, 0) / totalEntries;

  let reflection = `Over the past period, you've made ${totalEntries} journal entries. `;
  
  if (avgSentiment > 0.2) {
    reflection += "Your overall emotional tone has been quite positive, showing good mental wellness. ";
  } else if (avgSentiment < -0.2) {
    reflection += "You've been processing some challenging emotions. Remember that difficult periods are part of growth. ";
  } else {
    reflection += "Your emotional state has been balanced, showing good emotional regulation. ";
  }

  reflection += `Your most frequent mood was ${dominantMood.name.toLowerCase()}, appearing in ${dominantMood.percentage}% of your entries. `;
  
  if (dominantMood.name.toLowerCase() === 'happy' || dominantMood.name.toLowerCase() === 'grateful') {
    reflection += "Keep nurturing the activities and mindset that support your positive well-being.";
  } else if (dominantMood.name.toLowerCase() === 'stressed' || dominantMood.name.toLowerCase() === 'anxious') {
    reflection += "Consider incorporating more stress-relief techniques and self-care practices into your routine.";
  } else {
    reflection += "Continue this reflective practice to maintain your emotional awareness and growth.";
  }

  return reflection;
}

function generateInsights(entries, moodDistribution, totalWords) {
  if (entries.length === 0) {
    return null;
  }

  // Find most productive day
  const dayEntries = {};
  entries.forEach(entry => {
    const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' });
    dayEntries[day] = (dayEntries[day] || 0) + 1;
  });
  const mostProductiveDay = Object.entries(dayEntries).reduce((a, b) => dayEntries[a[0]] > dayEntries[b[0]] ? a : b)[0];

  // Calculate emotional trend
  const avgSentiment = entries.reduce((sum, entry) => sum + entry.aiAnalysis.sentimentScore, 0) / entries.length;
  const emotionalTrend = avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral';

  // Calculate consistency score (based on entries in last 7 days)
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const recentEntries = entries.filter(entry => new Date(entry.date) >= last7Days);
  const consistencyScore = Math.min(Math.round((recentEntries.length / 7) * 100), 100);

  // Get top emotions
  const topEmotions = moodDistribution
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(mood => mood.name.toLowerCase());

  // Determine journaling frequency
  const avgWordsPerEntry = Math.round(totalWords / entries.length);
  const journalingFrequency = avgWordsPerEntry > 200 ? 'High' : avgWordsPerEntry > 100 ? 'Medium' : 'Low';

  // Calculate wellness indicators
  const positiveWords = ['happy', 'grateful', 'excited', 'calm', 'content', 'peaceful', 'joyful', 'hopeful', 'confident', 'motivated'];
  const negativeWords = ['stressed', 'anxious', 'sad', 'overwhelmed', 'frustrated', 'lonely', 'uncertain', 'tired', 'burnout'];
  
  const positiveCount = entries.filter(entry => 
    positiveWords.some(word => entry.text.toLowerCase().includes(word))
  ).length;
  
  const stressCount = entries.filter(entry => 
    negativeWords.some(word => entry.text.toLowerCase().includes(word))
  ).length;

  const gratitudeCount = entries.filter(entry => 
    entry.text.toLowerCase().includes('grateful') || 
    entry.text.toLowerCase().includes('thankful') ||
    entry.text.toLowerCase().includes('appreciate')
  ).length;

  return {
    mostProductiveDay,
    averageWordsPerDay: avgWordsPerEntry,
    emotionalTrend,
    consistencyScore,
    topEmotions,
    journalingFrequency,
    wellnessIndicators: {
      positiveThoughts: Math.min(Math.round((positiveCount / entries.length) * 100), 100),
      stressLevels: Math.min(Math.round((stressCount / entries.length) * 100), 100),
      gratitudePractice: Math.min(Math.round((gratitudeCount / entries.length) * 100), 100),
      selfCare: Math.max(65, Math.min(Math.round(avgSentiment * 50 + 50), 100)) // Based on sentiment
    }
  };
}

function generateReminders(entries) {
  // This could be enhanced to read from user preferences or goals in the database
  // For now, generating smart reminders based on journal patterns
  
  const recentStress = entries.slice(0, 3).some(entry => 
    entry.mood === 'stressed' || entry.mood === 'anxious' || entry.mood === 'overwhelmed'
  );

  const lowActivity = entries.length < 3;
  
  let currentGoals = [
    'Practice daily gratitude',
    'Maintain consistent journaling',
    'Focus on emotional awareness'
  ];

  let todos = [
    'Reflect on today\'s positive moments',
    'Set aside 10 minutes for mindfulness',
    'Plan one self-care activity'
  ];

  if (recentStress) {
    todos.unshift('Try a breathing exercise');
    todos.push('Consider talking to someone you trust');
    currentGoals.push('Manage stress levels');
  }

  if (lowActivity) {
    todos.unshift('Write a short journal entry');
    currentGoals.push('Build a consistent journaling habit');
  }

  const achievements = [];
  if (entries.length >= 5) achievements.push(`${entries.length} journal entries completed!`);
  if (entries.some(entry => entry.wordCount > 200)) achievements.push('Detailed journaling - great depth!');
  
  const positiveEntries = entries.filter(entry => entry.aiAnalysis.sentimentScore > 0.3);
  if (positiveEntries.length > entries.length * 0.6) {
    achievements.push('Maintaining positive mindset');
  }

  return {
    currentGoals: currentGoals.slice(0, 3),
    todos: todos.slice(0, 4),
    achievements: achievements.length > 0 ? achievements : ['Keep journaling to unlock achievements!']
  };
}

// @route   GET /api/journal/export
// @desc    Export all journal entries for the authenticated user
// @access  Private
router.get('/export', auth, async (req, res) => {
  try {
    console.log('Export endpoint hit by user:', req.user._id);
    
    const journals = await Journal.find({ user: req.user._id })
      .sort({ date: -1 })
      .lean();

    console.log(`Found ${journals.length} journal entries for export`);

    // Format the data for export
    const exportData = journals.map(journal => ({
      id: journal._id,
      date: journal.date,
      text: journal.text,
      mood: journal.mood,
      confidence: journal.confidence,
      sentiment: journal.aiAnalysis?.sentiment,
      sentimentScore: journal.aiAnalysis?.sentimentScore,
      emotions: journal.aiAnalysis?.emotions || [],
      keywords: journal.aiAnalysis?.keywords || [],
      suggestions: journal.suggestions || [],
      summary: journal.summary,
      createdAt: journal.createdAt,
      updatedAt: journal.updatedAt
    }));

    console.log(`Exporting ${exportData.length} journal entries for user ${req.user._id}`);
    
    res.json({
      success: true,
      message: 'Journal entries exported successfully',
      data: exportData,
      count: exportData.length,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting journal entries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to export journal entries', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
