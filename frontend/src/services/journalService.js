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
    
    // Always throw the error - no mock fallback
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
    throw error;
  }
};

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
    
    throw error;
  }
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