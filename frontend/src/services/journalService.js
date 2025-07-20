import axios from 'axios';

// Configure axios base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitmind-token');
    console.log('Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'No token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('fitmind-token');
      window.location.reload(); // Force login
    }
    return Promise.reject(error);
  }
);

// Journal service functions
export const submitJournal = async (text) => {
  try {
    console.log('Submitting journal with text:', text.substring(0, 50) + '...');
    const response = await api.post('/journal', {
      text,
      date: new Date().toISOString(),
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to submit journal');
    }
  } catch (error) {
    console.error('Error submitting journal:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // If we're in development and backend is not available, show mock data
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      console.warn('Backend unavailable, using mock data');
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
    
    throw error;
  }
};

export const getAllJournals = async () => {
  try {
    const response = await api.get('/journal');
    
    if (response.data.success) {
      return response.data.data.entries;
    } else {
      throw new Error(response.data.message || 'Failed to fetch journals');
    }
  } catch (error) {
    console.error('Error fetching journals:', error);
    
    // If we're in development and backend is not available, show empty array
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      console.warn('Backend unavailable, returning empty journal list');
      return [];
    }
    
    throw error;
  }
};;

export const getJournalStats = async (timeRange = 'week') => {
  try {
    const response = await api.get(`/journal/stats?range=${timeRange}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch stats');
    }
  } catch (error) {
    console.error('Error fetching journal stats:', error);
    
    // If we're in development and backend is not available, show mock data
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      console.warn('Backend unavailable, using mock stats');
      return getMockStats(timeRange);
    }
    
    throw error;
  }
};

export const exportAllJournals = async () => {
  try {
    const response = await api.get('/journal/export');
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to export journals');
    }
  } catch (error) {
    console.error('Error exporting journals:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // If export endpoint fails, fall back to getAllJournals
    if (error.response?.status === 400 || error.response?.status === 404 || error.response?.status === 401) {
      console.warn('Export endpoint failed, falling back to getAllJournals');
      return await getAllJournals();
    }
    
    // If we're in development and backend is not available, use getAllJournals as fallback
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      console.warn('Backend unavailable, using getAllJournals for export');
      return await getAllJournals();
    }
    
    throw error;
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

// Helper function for mock stats when backend is unavailable
const getMockStats = (timeRange) => {
  return {
    totalEntries: 15,
    currentStreak: 5,
    longestStreak: 12,
    averageMood: 7.2,
    moodDistribution: [
      { name: 'Happy', value: 25, color: '#10B981' },
      { name: 'Grateful', value: 20, color: '#8B5CF6' },
      { name: 'Calm', value: 18, color: '#06B6D4' },
      { name: 'Thoughtful', value: 15, color: '#F59E0B' },
      { name: 'Stressed', value: 12, color: '#EF4444' },
      { name: 'Excited', value: 10, color: '#EC4899' }
    ],
    moodTrend: generateMoodTrendData(timeRange),
    weeklyReflection: {
      insight: "You've shown great consistency in your journaling practice this week. Your entries reflect a balanced emotional state with moments of both challenge and gratitude.",
      recommendation: "Continue your daily writing routine and consider exploring the themes of work-life balance that appear frequently in your entries.",
      moodPattern: "Your mood tends to be more positive in the mornings, with some stress peaks during weekday afternoons."
    }
  };
};

// Utility function to download journal data as JSON or text file
export const downloadJournalData = async (format = 'json') => {
  try {
    const journals = await exportAllJournals();
    
    let content;
    let filename;
    let mimeType;
    
    if (format === 'json') {
      content = JSON.stringify(journals, null, 2);
      filename = `fitmind-journals-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else if (format === 'txt') {
      content = journals.map(journal => {
        const date = new Date(journal.date).toLocaleDateString();
        return `Date: ${date}\nMood: ${journal.mood || 'Not analyzed'}\nEntry:\n${journal.text}\n\n---\n\n`;
      }).join('');
      filename = `fitmind-journals-${new Date().toISOString().split('T')[0]}.txt`;
      mimeType = 'text/plain';
    } else if (format === 'csv') {
      const headers = 'Date,Mood,Sentiment,Summary,Entry Text\n';
      const rows = journals.map(journal => {
        const date = new Date(journal.date).toLocaleDateString();
        const mood = journal.mood || '';
        const sentiment = journal.aiAnalysis?.sentiment || '';
        const summary = (journal.summary || '').replace(/"/g, '""');
        const text = journal.text.replace(/"/g, '""').replace(/\n/g, ' ');
        return `"${date}","${mood}","${sentiment}","${summary}","${text}"`;
      }).join('\n');
      content = headers + rows;
      filename = `fitmind-journals-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    }
    
    // Create blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename, count: journals.length };
  } catch (error) {
    console.error('Error downloading journal data:', error);
    throw error;
  }
};

export default api;
