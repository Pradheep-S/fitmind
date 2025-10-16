import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const moodService = {
  // Analyze mood from uploaded image
  analyzeMoodFromImage: async (imageFile, journalText = '') => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      if (journalText.trim()) {
        formData.append('journalText', journalText);
      }

      const token = localStorage.getItem('fitmind-token');
      
      const response = await axios.post(
        `${API_URL}/api/mood/analyze-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000 // 30 second timeout for image processing
        }
      );

      return response.data;
    } catch (error) {
      console.error('Mood analysis error:', error);
      
      if (error.response?.status === 401) {
        // Token expired
        localStorage.removeItem('fitmind-token');
        throw new Error('Session expired. Please log in again.');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid image file');
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Analysis timeout. Please try with a smaller image.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to analyze mood from image');
    }
  },

  // Get supported moods and capabilities
  getSupportedMoods: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/mood/supported-moods`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supported moods:', error);
      
      // Return fallback data
      return {
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
      };
    }
  },

  // Test the mood analysis service
  testService: async () => {
    try {
      const token = localStorage.getItem('fitmind-token');
      
      const response = await axios.get(
        `${API_URL}/api/mood/test-service`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Service test error:', error);
      throw new Error(error.response?.data?.message || 'Service test failed');
    }
  },

  // Utility function to validate image file
  validateImageFile: (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!file) {
      throw new Error('No file provided');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, and WebP images are supported');
    }
    
    if (file.size > maxSize) {
      throw new Error('Image file too large. Maximum size is 10MB');
    }
    
    return true;
  },

  // Get mood emoji mapping
  getMoodEmoji: (mood) => {
    const moodEmojiMap = {
      'happy': '😊',
      'sad': '😢',
      'anxious': '😰',
      'grateful': '🙏',
      'excited': '🎉',
      'calm': '😌',
      'stressed': '😤',
      'thoughtful': '🤔',
      'content': '😊',
      'overwhelmed': '😵‍💫',
      'frustrated': '😤',
      'hopeful': '🌟',
      'lonely': '😔',
      'confident': '💪',
      'uncertain': '🤷'
    };
    
    return moodEmojiMap[mood?.toLowerCase()] || '🌟';
  },

  // Get mood color for UI
  getMoodColor: (mood) => {
    const moodColorMap = {
      'happy': 'from-yellow-400 to-orange-500',
      'sad': 'from-blue-400 to-blue-600',
      'anxious': 'from-red-400 to-pink-500',
      'grateful': 'from-green-400 to-emerald-500',
      'excited': 'from-purple-400 to-pink-500',
      'calm': 'from-blue-300 to-cyan-400',
      'stressed': 'from-red-500 to-orange-500',
      'thoughtful': 'from-indigo-400 to-purple-500',
      'content': 'from-green-300 to-blue-400',
      'overwhelmed': 'from-orange-400 to-red-500',
      'frustrated': 'from-red-400 to-red-600',
      'hopeful': 'from-yellow-300 to-green-400',
      'lonely': 'from-gray-400 to-blue-500',
      'confident': 'from-emerald-400 to-cyan-500',
      'uncertain': 'from-gray-300 to-indigo-400'
    };
    
    return moodColorMap[mood?.toLowerCase()] || 'from-gray-400 to-gray-600';
  }
};

export default moodService;