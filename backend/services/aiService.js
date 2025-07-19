const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async analyzeJournal(text) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not set, using mock analysis');
        return this.getMockAnalysis(text);
      }

      const prompt = `
        Analyze the following journal entry and provide insights:
        
        "${text}"
        
        Please provide a JSON response with the following structure:
        {
          "mood": "primary emotion (happy, sad, anxious, grateful, excited, calm, stressed, thoughtful, content, overwhelmed)",
          "confidence": "confidence level from 0 to 1",
          "emotions": [
            {"emotion": "emotion name", "confidence": 0.8}
          ],
          "sentiment": "positive, negative, or neutral",
          "sentimentScore": "score from -1 to 1",
          "keywords": ["important", "keywords", "from", "text"],
          "suggestions": [
            "personalized wellness suggestion 1",
            "personalized wellness suggestion 2",
            "personalized wellness suggestion 3"
          ],
          "summary": "brief summary of the journal entry and emotional state"
        }
        
        Focus on being helpful, empathetic, and providing actionable wellness suggestions based on the emotional content.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return this.validateAndCleanAnalysis(analysis);
      } else {
        console.warn('Could not parse AI response, using mock analysis');
        return this.getMockAnalysis(text);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.getMockAnalysis(text);
    }
  }

  validateAndCleanAnalysis(analysis) {
    const validMoods = ['happy', 'sad', 'anxious', 'grateful', 'excited', 'calm', 'stressed', 'thoughtful', 'content', 'overwhelmed'];
    
    return {
      mood: validMoods.includes(analysis.mood) ? analysis.mood : 'thoughtful',
      confidence: Math.max(0, Math.min(1, analysis.confidence || 0.7)),
      emotions: Array.isArray(analysis.emotions) ? analysis.emotions.slice(0, 5) : [],
      sentiment: ['positive', 'negative', 'neutral'].includes(analysis.sentiment) ? analysis.sentiment : 'neutral',
      sentimentScore: Math.max(-1, Math.min(1, analysis.sentimentScore || 0)),
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords.slice(0, 10) : [],
      suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions.slice(0, 4) : [],
      summary: typeof analysis.summary === 'string' ? analysis.summary.substring(0, 500) : 'Journal entry processed successfully.'
    };
  }

  getMockAnalysis(text) {
    const positiveWords = ['happy', 'joy', 'great', 'wonderful', 'amazing', 'grateful', 'love', 'excited', 'perfect', 'awesome'];
    const negativeWords = ['sad', 'stressed', 'overwhelmed', 'anxious', 'worried', 'tired', 'frustrated', 'angry', 'difficult'];
    const calmWords = ['peaceful', 'calm', 'relaxed', 'content', 'serene', 'quiet', 'meditative'];
    
    const lowerText = text.toLowerCase();
    const words = text.split(/\s+/);
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const calmCount = calmWords.filter(word => lowerText.includes(word)).length;
    
    let mood = 'thoughtful';
    let sentiment = 'neutral';
    let sentimentScore = 0;
    
    if (positiveCount > negativeCount && positiveCount > calmCount) {
      mood = ['happy', 'excited', 'grateful'][Math.floor(Math.random() * 3)];
      sentiment = 'positive';
      sentimentScore = 0.3 + (positiveCount * 0.2);
    } else if (negativeCount > positiveCount) {
      mood = ['stressed', 'anxious', 'overwhelmed'][Math.floor(Math.random() * 3)];
      sentiment = 'negative';
      sentimentScore = -0.3 - (negativeCount * 0.2);
    } else if (calmCount > 0) {
      mood = 'calm';
      sentiment = 'positive';
      sentimentScore = 0.2;
    }

    const suggestions = this.getMockSuggestions(mood);
    
    return {
      mood,
      confidence: 0.75 + Math.random() * 0.2,
      emotions: [
        { emotion: mood, confidence: 0.8 },
        { emotion: 'reflective', confidence: 0.6 }
      ],
      sentiment,
      sentimentScore: Math.max(-1, Math.min(1, sentimentScore)),
      keywords: this.extractKeywords(text),
      suggestions,
      summary: this.generateMockSummary(text, mood, words.length)
    };
  }

  getMockSuggestions(mood) {
    const suggestionMap = {
      happy: [
        'Keep up the positive energy by maintaining your current habits',
        'Share your joy with others to amplify the positive feelings',
        'Consider journaling about what specifically made you happy today',
        'Take a moment to appreciate this positive moment fully'
      ],
      grateful: [
        'Continue practicing gratitude - it\'s clearly benefiting your well-being',
        'Consider writing thank-you notes to people who made a difference',
        'Try a gratitude meditation before bed',
        'Keep a gratitude jar for future reflection'
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
        'Limit caffeine and practice gentle movement'
      ],
      calm: [
        'Maintain this peaceful state with regular meditation',
        'Spend time in nature to enhance your sense of calm',
        'Consider yoga or gentle stretching',
        'Keep a calm environment around you'
      ],
      thoughtful: [
        'Your reflective nature is a strength - continue this self-awareness',
        'Consider exploring your thoughts through creative expression',
        'Try mindfulness meditation to deepen your insights',
        'Journal regularly to track your emotional patterns'
      ]
    };
    
    return suggestionMap[mood] || [
      'Remember to be kind to yourself',
      'Take time for activities that bring you joy',
      'Stay connected with supportive people in your life',
      'Practice mindful breathing when feeling overwhelmed'
    ];
  }

  extractKeywords(text) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 8);
  }

  generateMockSummary(text, mood, wordCount) {
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
      return baseTemplate + ' Your detailed reflection shows good self-awareness and emotional processing.';
    } else if (wordCount < 50) {
      return baseTemplate + ' Consider expanding on your thoughts in future entries for deeper insights.';
    } else {
      return baseTemplate + ' This entry shows a healthy level of self-reflection.';
    }
  }
}

module.exports = new AIService();
