const mongoose = require('mongoose');
require('dotenv').config();

// Import the Journal model
const Journal = require('./models/Journal');

// The journal data to insert
const journalData = [
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cd1" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-01T07:43:11.009Z" },
    "text": "\"Felt overwhelmed with all the meetings today, barely had time to breathe.\"",
    "mood": "stressed",
    "confidence": 0.78,
    "suggestions": [
      "Take short breaks between meetings",
      "Schedule buffer time in your calendar",
      "Try deep breathing exercises to reset focus"
    ],
    "summary": "Workload stress detected. You may benefit from structured pauses and self-care intervals.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "stressed", "confidence": 0.78 },
        { "emotion": "drained", "confidence": 0.74 }
      ],
      "keywords": ["overwhelmed", "meetings", "time", "breathe"],
      "sentiment": "negative",
      "sentimentScore": -0.3
    },
    "wordCount": 12,
    "createdAt": { "$date": "2025-10-01T07:43:15.341Z" },
    "updatedAt": { "$date": "2025-10-01T07:43:15.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cd2" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-02T19:11:45.009Z" },
    "text": "\"Went on a long walk after work. It helped clear my mind and calm my thoughts.\"",
    "mood": "calm",
    "confidence": 0.87,
    "suggestions": [
      "Keep regular walking sessions",
      "Use walks to reflect or listen to calming music",
      "Appreciate your small wins daily"
    ],
    "summary": "Mindful self-care activity recognized. Positive coping strategy for managing daily stress.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "calm", "confidence": 0.87 },
        { "emotion": "relieved", "confidence": 0.84 }
      ],
      "keywords": ["walk", "clear mind", "calm"],
      "sentiment": "positive",
      "sentimentScore": 0.6
    },
    "wordCount": 16,
    "createdAt": { "$date": "2025-10-02T19:11:52.341Z" },
    "updatedAt": { "$date": "2025-10-02T19:11:52.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cd3" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-03T09:25:31.009Z" },
    "text": "\"Had a productive morning! Finished all my tasks before lunch and felt accomplished.\"",
    "mood": "motivated",
    "confidence": 0.9,
    "suggestions": [
      "Reward yourself for completing goals",
      "Maintain morning routines for focus",
      "End your day with gratitude reflection"
    ],
    "summary": "Strong productivity detected. Use this momentum to reinforce healthy work habits.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "motivated", "confidence": 0.9 },
        { "emotion": "accomplished", "confidence": 0.88 }
      ],
      "keywords": ["productive", "tasks", "accomplished"],
      "sentiment": "positive",
      "sentimentScore": 0.8
    },
    "wordCount": 16,
    "createdAt": { "$date": "2025-10-03T09:25:39.341Z" },
    "updatedAt": { "$date": "2025-10-03T09:25:39.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cd4" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-04T22:10:14.009Z" },
    "text": "\"Felt lonely tonight. I wish I had more time to connect with friends.\"",
    "mood": "lonely",
    "confidence": 0.74,
    "suggestions": [
      "Reach out to a close friend for a chat",
      "Plan social time this weekend",
      "Remind yourself that solitude can be restorative too"
    ],
    "summary": "Loneliness detected. Social reconnection and emotional expression may improve your well-being.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "lonely", "confidence": 0.74 },
        { "emotion": "sad", "confidence": 0.7 }
      ],
      "keywords": ["lonely", "friends", "connect"],
      "sentiment": "negative",
      "sentimentScore": -0.25
    },
    "wordCount": 13,
    "createdAt": { "$date": "2025-10-04T22:10:20.341Z" },
    "updatedAt": { "$date": "2025-10-04T22:10:20.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cd5" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-05T10:55:01.009Z" },
    "text": "\"Had brunch with family today. Lots of laughter and good conversations.\"",
    "mood": "happy",
    "confidence": 0.93,
    "suggestions": [
      "Nurture family bonds regularly",
      "Reflect on gratitude moments",
      "Capture memories through journaling"
    ],
    "summary": "Positive social experience noted. Connection and joy contribute strongly to emotional balance.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "happy", "confidence": 0.93 },
        { "emotion": "connected", "confidence": 0.9 }
      ],
      "keywords": ["family", "laughter", "conversations"],
      "sentiment": "positive",
      "sentimentScore": 0.9
    },
    "wordCount": 12,
    "createdAt": { "$date": "2025-10-05T10:55:09.341Z" },
    "updatedAt": { "$date": "2025-10-05T10:55:09.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cd6" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-06T08:43:22.009Z" },
    "text": "\"Couldn't sleep well last night. Feeling exhausted and irritable this morning.\"",
    "mood": "tired",
    "confidence": 0.79,
    "suggestions": [
      "Prioritize rest tonight",
      "Limit caffeine in the afternoon",
      "Try a short meditation before bed"
    ],
    "summary": "Sleep fatigue impacting mood detected. Focus on rest to restore balance.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "tired", "confidence": 0.79 },
        { "emotion": "irritable", "confidence": 0.75 }
      ],
      "keywords": ["sleep", "exhausted", "irritable"],
      "sentiment": "negative",
      "sentimentScore": -0.4
    },
    "wordCount": 14,
    "createdAt": { "$date": "2025-10-06T08:43:28.341Z" },
    "updatedAt": { "$date": "2025-10-06T08:43:28.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cd7" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-07T20:20:31.009Z" },
    "text": "\"Had a major presentation today and it went really well! Feeling proud of myself.\"",
    "mood": "confident",
    "confidence": 0.92,
    "suggestions": [
      "Celebrate your achievements",
      "Note what worked for future presentations",
      "Share your success with a supportive person"
    ],
    "summary": "Confidence and pride detected. Reinforcing competence enhances long-term self-esteem.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "confident", "confidence": 0.92 },
        { "emotion": "proud", "confidence": 0.9 }
      ],
      "keywords": ["presentation", "proud", "success"],
      "sentiment": "positive",
      "sentimentScore": 0.85
    },
    "wordCount": 15,
    "createdAt": { "$date": "2025-10-07T20:20:39.341Z" },
    "updatedAt": { "$date": "2025-10-07T20:20:39.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cd8" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-08T13:11:02.009Z" },
    "text": "\"The workload is piling up again. Feeling a bit anxious about keeping up.\"",
    "mood": "anxious",
    "confidence": 0.8,
    "suggestions": [
      "Break tasks into smaller pieces",
      "Use a to-do list to regain control",
      "Reach out if you need support"
    ],
    "summary": "Work-related anxiety detected. Organizational strategies can reduce overwhelm.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "anxious", "confidence": 0.8 },
        { "emotion": "pressured", "confidence": 0.77 }
      ],
      "keywords": ["workload", "anxious", "keeping up"],
      "sentiment": "negative",
      "sentimentScore": -0.22
    },
    "wordCount": 14,
    "createdAt": { "$date": "2025-10-08T13:11:09.341Z" },
    "updatedAt": { "$date": "2025-10-08T13:11:09.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cd9" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-09T17:50:42.009Z" },
    "text": "\"Tried a new recipe for dinner and it turned out great. Cooking helps me unwind.\"",
    "mood": "content",
    "confidence": 0.85,
    "suggestions": [
      "Keep exploring creative hobbies",
      "Savor mindful moments during routine tasks",
      "Share your creation with someone"
    ],
    "summary": "Creativity and calm detected. Simple pleasures are boosting your mental wellness.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "content", "confidence": 0.85 },
        { "emotion": "relaxed", "confidence": 0.83 }
      ],
      "keywords": ["recipe", "dinner", "cooking"],
      "sentiment": "positive",
      "sentimentScore": 0.7
    },
    "wordCount": 15,
    "createdAt": { "$date": "2025-10-09T17:50:50.341Z" },
    "updatedAt": { "$date": "2025-10-09T17:50:50.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cda" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-10T06:18:11.009Z" },
    "text": "\"Felt burnt out today. Couldn't focus on anything and kept procrastinating.\"",
    "mood": "burnout",
    "confidence": 0.77,
    "suggestions": [
      "Take a mental health break",
      "Prioritize rest and non-work time",
      "Avoid self-criticism for unproductive days"
    ],
    "summary": "Burnout symptoms detected. Rest and recovery should be your priority.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "burnout", "confidence": 0.77 },
        { "emotion": "tired", "confidence": 0.75 }
      ],
      "keywords": ["burnt out", "focus", "procrastinating"],
      "sentiment": "negative",
      "sentimentScore": -0.35
    },
    "wordCount": 14,
    "createdAt": { "$date": "2025-10-10T06:18:19.341Z" },
    "updatedAt": { "$date": "2025-10-10T06:18:19.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cdb" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-11T09:03:45.009Z" },
    "text": "\"Did some yoga in the morning. Felt lighter and more centered afterwards.\"",
    "mood": "peaceful",
    "confidence": 0.88,
    "suggestions": [
      "Maintain your mindfulness practice",
      "Incorporate stretching breaks at work",
      "Reflect on how calm routines shape your day"
    ],
    "summary": "Peaceful mindfulness achieved. Physical-mental connection observed.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "peaceful", "confidence": 0.88 },
        { "emotion": "centered", "confidence": 0.86 }
      ],
      "keywords": ["yoga", "centered", "morning"],
      "sentiment": "positive",
      "sentimentScore": 0.75
    },
    "wordCount": 14,
    "createdAt": { "$date": "2025-10-11T09:03:53.341Z" },
    "updatedAt": { "$date": "2025-10-11T09:03:53.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cdc" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-12T05:28:31.009Z" },
    "text": "\"I had a really stressful day at work today. My manager was very critical and I'm feeling anxious about my performance.\"",
    "mood": "stressed",
    "confidence": 0.75,
    "suggestions": [
      "Prioritize your tasks and focus on what's most important",
      "Create boundaries between work and personal time",
      "Try gentle exercise like walking to reduce stress hormones"
    ],
    "summary": "Work pressures are affecting well-being. Reflective writing may help process emotions.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "stressed", "confidence": 0.77 },
        { "emotion": "reflective", "confidence": 0.76 }
      ],
      "keywords": ["stressful", "manager", "critical", "performance"],
      "sentiment": "negative",
      "sentimentScore": -0.25
    },
    "wordCount": 21,
    "createdAt": { "$date": "2025-10-12T05:28:39.341Z" },
    "updatedAt": { "$date": "2025-10-12T05:28:39.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cdd" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-13T15:19:44.009Z" },
    "text": "\"Had a really fun evening playing board games with friends. Laughed so much!\"",
    "mood": "joyful",
    "confidence": 0.94,
    "suggestions": [
      "Keep nurturing friendships",
      "Plan more social evenings",
      "Document joyful memories"
    ],
    "summary": "Strong social joy detected. Friendships play a key role in emotional resilience.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "joyful", "confidence": 0.94 },
        { "emotion": "connected", "confidence": 0.91 }
      ],
      "keywords": ["friends", "games", "laughed"],
      "sentiment": "positive",
      "sentimentScore": 0.92
    },
    "wordCount": 13,
    "createdAt": { "$date": "2025-10-13T15:19:50.341Z" },
    "updatedAt": { "$date": "2025-10-13T15:19:50.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cde" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-14T08:41:28.009Z" },
    "text": "\"Started my morning with journaling and gratitude. Feeling balanced and ready for the day.\"",
    "mood": "grateful",
    "confidence": 0.91,
    "suggestions": [
      "Continue daily gratitude journaling",
      "End the day by reflecting on positives",
      "Celebrate small progress"
    ],
    "summary": "Gratitude reflection detected. Positive mental framing supports emotional balance.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "grateful", "confidence": 0.91 },
        { "emotion": "balanced", "confidence": 0.88 }
      ],
      "keywords": ["journaling", "gratitude", "balanced"],
      "sentiment": "positive",
      "sentimentScore": 0.85
    },
    "wordCount": 16,
    "createdAt": { "$date": "2025-10-14T08:41:35.341Z" },
    "updatedAt": { "$date": "2025-10-14T08:41:35.341Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "68eb3c876203044fb73e2cdf" },
    "user": { "$oid": "687cce4941425876d2545da5" },
    "date": { "$date": "2025-10-15T21:10:55.009Z" },
    "text": "\"Feeling proud of how I handled this week. There were tough days, but I managed them better than before.\"",
    "mood": "reflective",
    "confidence": 0.89,
    "suggestions": [
      "Acknowledge your growth regularly",
      "Note down what coping methods worked best",
      "Set a small goal for next week"
    ],
    "summary": "Reflective self-awareness detected. Positive resilience growth over time.",
    "aiAnalysis": {
      "emotions": [
        { "emotion": "reflective", "confidence": 0.89 },
        { "emotion": "proud", "confidence": 0.87 }
      ],
      "keywords": ["handled", "week", "tough days", "managed"],
      "sentiment": "positive",
      "sentimentScore": 0.7
    },
    "wordCount": 19,
    "createdAt": { "$date": "2025-10-15T21:11:02.341Z" },
    "updatedAt": { "$date": "2025-10-15T21:11:02.341Z" },
    "__v": 0
  }
];

// Function to transform the MongoDB export format to proper JavaScript objects
function transformData(data) {
  return data.map(entry => {
    const transformed = {
      _id: new mongoose.Types.ObjectId(entry._id.$oid),
      user: new mongoose.Types.ObjectId(entry.user.$oid),
      date: new Date(entry.date.$date),
      text: entry.text,
      mood: entry.mood,
      confidence: entry.confidence,
      suggestions: entry.suggestions,
      summary: entry.summary,
      aiAnalysis: entry.aiAnalysis,
      wordCount: entry.wordCount,
      createdAt: new Date(entry.createdAt.$date),
      updatedAt: new Date(entry.updatedAt.$date),
      __v: entry.__v
    };
    return transformed;
  });
}

// Function to insert data
async function insertJournalData() {
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitmind', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully!');

    // Transform the data
    const transformedData = transformData(journalData);
    
    // Check if data already exists
    console.log('Checking for existing data...');
    const existingCount = await Journal.countDocuments({
      _id: { $in: transformedData.map(item => item._id) }
    });
    
    if (existingCount > 0) {
      console.log(`Warning: ${existingCount} entries already exist in the database.`);
      console.log('Skipping insertion to avoid duplicates.');
      return;
    }

    // Insert data
    console.log(`Inserting ${transformedData.length} journal entries...`);
    const result = await Journal.insertMany(transformedData, { ordered: false });
    
    console.log(`Successfully inserted ${result.length} journal entries!`);
    
    // Verify insertion
    const totalCount = await Journal.countDocuments();
    console.log(`Total journal entries in database: ${totalCount}`);
    
  } catch (error) {
    console.error('Error inserting data:', error);
    
    // If it's a duplicate key error, provide more details
    if (error.code === 11000) {
      console.log('Some entries already exist in the database (duplicate key error).');
      console.log('This is normal if you\'re running the script multiple times.');
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the insertion
console.log('Starting journal data insertion...');
insertJournalData()
  .then(() => {
    console.log('Data insertion process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });