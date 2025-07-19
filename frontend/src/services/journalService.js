import axios from 'axios';

// Configure axios base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Journal service functions
export const submitJournal = async (text) => {
  try {
    const response = await api.post('/journal', {
      text,
      date: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting journal:', error);
    
    // Mock response for development when backend is not available
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          _id: Date.now().toString(),
          text,
          date: new Date().toISOString(),
          mood: getMockMood(text),
          confidence: 0.85,
          suggestions: getMockSuggestions(text),
          summary: getMockSummary(text),
        });
      }, 2000); // Simulate API delay
    });
  }
};

export const getAllJournals = async () => {
  try {
    const response = await api.get('/journal');
    return response.data;
  } catch (error) {
    console.error('Error fetching journals:', error);
    
    // Mock data for development
    return [
      {
        _id: '1',
        date: new Date().toISOString(),
        text: 'Today was a wonderful day filled with gratitude and joy. I accomplished my morning routine and felt really productive. The weather was perfect, and I had a great conversation with a friend.',
        mood: 'happy',
        confidence: 0.9,
        suggestions: [
          'Keep up the positive energy by maintaining your morning routine',
          'Consider journaling about what specifically made you feel grateful',
          'Schedule more social time since connections boost your mood'
        ],
        summary: 'A highly positive and productive day with strong social connections and successful routine completion.'
      },
      {
        _id: '2',
        date: new Date(Date.now() - 86400000).toISOString(),
        text: 'Feeling a bit overwhelmed with work lately. There are so many deadlines approaching and I\'m struggling to keep up. Need to find better balance between work and personal life.',
        mood: 'stressed',
        confidence: 0.85,
        suggestions: [
          'Try time-blocking techniques to manage your workload better',
          'Take regular 5-minute breaks throughout your workday',
          'Consider meditation or deep breathing exercises',
          'Set clearer boundaries between work and personal time'
        ],
        summary: 'Work stress is impacting well-being. Focus needed on time management and work-life balance strategies.'
      }
    ];
  }
};

export const getJournalStats = async (timeRange = 'week') => {
  try {
    const response = await api.get(`/journal/stats?range=${timeRange}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching journal stats:', error);
    
    // Mock stats for development
    return {
      totalEntries: 15,
      currentStreak: 5,
      longestStreak: 12,
      averageMood: 7.2,
      moodTrend: generateMockMoodTrend(),
      moodDistribution: [
        { name: 'Happy', value: 35, color: '#10B981' },
        { name: 'Calm', value: 25, color: '#3B82F6' },
        { name: 'Grateful', value: 20, color: '#8B5CF6' },
        { name: 'Stressed', value: 15, color: '#F59E0B' },
        { name: 'Sad', value: 5, color: '#EF4444' },
      ],
      weeklyReflection: `This ${timeRange} showed great emotional balance with a positive trend. You've been consistently grateful and maintaining good mental wellness habits. Keep focusing on the activities that bring you joy and consider incorporating more stress-relief techniques.`
    };
  }
};

// Helper functions for mock data
const getMockMood = (text) => {
  const positiveWords = ['happy', 'joy', 'great', 'wonderful', 'amazing', 'grateful', 'love', 'excited', 'perfect', 'awesome'];
  const negativeWords = ['sad', 'stressed', 'overwhelmed', 'anxious', 'worried', 'tired', 'frustrated', 'angry', 'difficult'];
  const calmWords = ['peaceful', 'calm', 'relaxed', 'content', 'serene', 'quiet', 'meditative'];
  
  const lowerText = text.toLowerCase();
  
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  const calmCount = calmWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount && positiveCount > calmCount) {
    return ['happy', 'excited', 'grateful'][Math.floor(Math.random() * 3)];
  } else if (negativeCount > positiveCount) {
    return ['stressed', 'anxious', 'overwhelmed'][Math.floor(Math.random() * 3)];
  } else if (calmCount > 0) {
    return 'calm';
  } else {
    return 'thoughtful';
  }
};

const getMockSuggestions = (text) => {
  const mood = getMockMood(text);
  
  const suggestionMap = {
    happy: [
      'Keep up the positive energy by maintaining your current habits',
      'Share your joy with others to amplify the positive feelings',
      'Consider journaling about what specifically made you happy today'
    ],
    grateful: [
      'Continue practicing gratitude - it\'s clearly benefiting your well-being',
      'Consider writing thank-you notes to people who made a difference',
      'Try a gratitude meditation before bed'
    ],
    stressed: [
      'Take regular breaks throughout your day',
      'Try deep breathing exercises: 4 counts in, hold for 4, out for 4',
      'Consider time-blocking to manage your workload better',
      'Schedule some self-care time this week'
    ],
    anxious: [
      'Practice grounding techniques: name 5 things you can see, 4 you can hear, 3 you can touch',
      'Try progressive muscle relaxation',
      'Consider talking to someone you trust about your concerns',
      'Limit caffeine if you haven\'t already'
    ],
    calm: [
      'Maintain this peaceful state with regular meditation',
      'Spend time in nature to enhance your sense of calm',
      'Consider yoga or gentle stretching'
    ],
    thoughtful: [
      'Your reflective nature is a strength - continue this self-awareness',
      'Consider exploring your thoughts through creative expression',
      'Try mindfulness meditation to deepen your insights'
    ]
  };
  
  return suggestionMap[mood] || [
    'Remember to be kind to yourself',
    'Take time for activities that bring you joy',
    'Stay connected with supportive people in your life'
  ];
};

const getMockSummary = (text) => {
  const mood = getMockMood(text);
  const wordCount = text.split(' ').length;
  
  const templates = {
    happy: 'A joyful and positive entry reflecting good emotional well-being.',
    grateful: 'An appreciative reflection showing strong emotional resilience.',
    stressed: 'Work or life pressures are affecting your well-being. Focus needed on stress management.',
    anxious: 'Anxiety is present in your thoughts. Consider implementing calming strategies.',
    calm: 'A peaceful and balanced state of mind reflected in your writing.',
    thoughtful: 'A reflective entry showing good self-awareness and introspection.'
  };
  
  const baseTemplate = templates[mood] || 'A thoughtful entry reflecting your current emotional state.';
  
  if (wordCount > 100) {
    return baseTemplate + ' Your detailed reflection shows good self-awareness.';
  } else {
    return baseTemplate + ' Consider expanding on your thoughts in future entries.';
  }
};

const generateMockMoodTrend = () => {
  const today = new Date();
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    data.push({
      date: date.toISOString(),
      mood: Math.floor(Math.random() * 4) + 6 // Random mood between 6-10
    });
  }
  
  return data;
};

export default api;
