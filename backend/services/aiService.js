const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeJournal(text) {
    try {
      if (!process.env.GEMINI_API_KEY || process.env.USE_MOCK_AI === 'true') {
        console.warn('Using mock analysis (API disabled or key not set)');
        return this.getMockAnalysis(text);
      }

      console.log('Attempting to use Gemini API for analysis...');
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
        console.log('Gemini API analysis successful');
        return this.validateAndCleanAnalysis(analysis);
      } else {
        console.warn('Could not parse AI response, using mock analysis');
        return this.getMockAnalysis(text);
      }
    } catch (error) {
      console.error('AI analysis error:', error.message || error);
      if (error.status === 429) {
        console.log('Rate limit exceeded - falling back to enhanced mock analysis');
      }
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
    console.log('=== USING MOCK ANALYSIS ===');
    console.log('Text for analysis:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    
    const positiveWords = ['happy', 'joy', 'great', 'wonderful', 'amazing', 'grateful', 'love', 'excited', 'perfect', 'awesome', 'good', 'better', 'best', 'fantastic', 'brilliant', 'excellent', 'pleased', 'delighted'];
    const negativeWords = ['sad', 'stressed', 'overwhelmed', 'anxious', 'worried', 'tired', 'frustrated', 'angry', 'difficult', 'bad', 'worse', 'worst', 'terrible', 'awful', 'depressed', 'upset', 'disappointed'];
    const calmWords = ['peaceful', 'calm', 'relaxed', 'content', 'serene', 'quiet', 'meditative', 'tranquil', 'still', 'centered', 'balanced'];
    
    const lowerText = text.toLowerCase();
    const words = text.split(/\s+/);
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const calmCount = calmWords.filter(word => lowerText.includes(word)).length;
    
    console.log(`Word analysis - Positive: ${positiveCount}, Negative: ${negativeCount}, Calm: ${calmCount}`);
    
    let mood = 'thoughtful';
    let sentiment = 'neutral';
    let sentimentScore = 0;
    
    // More sophisticated mood detection based on content
    if (positiveCount > negativeCount && positiveCount > calmCount && positiveCount > 0) {
      const happyMoods = ['happy', 'excited', 'grateful', 'content'];
      mood = happyMoods[Math.floor(Math.random() * happyMoods.length)];
      sentiment = 'positive';
      sentimentScore = Math.min(0.8, 0.3 + (positiveCount * 0.15));
    } else if (negativeCount > positiveCount && negativeCount > 0) {
      const negMoods = ['stressed', 'anxious', 'overwhelmed', 'sad'];
      mood = negMoods[Math.floor(Math.random() * negMoods.length)];
      sentiment = 'negative';
      sentimentScore = Math.max(-0.8, -0.3 - (negativeCount * 0.15));
    } else if (calmCount > 0) {
      mood = 'calm';
      sentiment = 'positive';
      sentimentScore = 0.2 + (calmCount * 0.1);
    } else {
      // Vary the mood even without keywords based on text characteristics
      const neutralMoods = ['thoughtful', 'content', 'calm'];
      mood = neutralMoods[Math.floor(Math.random() * neutralMoods.length)];
      sentiment = 'neutral';
      sentimentScore = (Math.random() - 0.5) * 0.4; // Random between -0.2 and 0.2
    }

    // Add some variability based on text length and time
    const textVariability = (text.length % 7) / 10; // 0-0.6 based on text length
    const timeVariability = (Date.now() % 11) / 20; // 0-0.5 based on current time
    
    const suggestions = this.getMockSuggestions(mood);
    const confidence = Math.round((0.65 + Math.random() * 0.25 + textVariability) * 100) / 100;
    
    const analysis = {
      mood,
      confidence: Math.min(0.95, confidence),
      emotions: [
        { emotion: mood, confidence: Math.round((0.7 + Math.random() * 0.2) * 100) / 100 },
        { emotion: 'reflective', confidence: Math.round((0.5 + Math.random() * 0.3) * 100) / 100 }
      ],
      sentiment,
      sentimentScore: Math.round(Math.max(-1, Math.min(1, sentimentScore + timeVariability - 0.25)) * 100) / 100,
      keywords: this.extractKeywords(text),
      suggestions,
      summary: this.generateMockSummary(text, mood, words.length)
    };
    
    console.log('Generated mock analysis:', {
      mood: analysis.mood,
      confidence: analysis.confidence,
      sentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      suggestionsCount: analysis.suggestions.length,
      keywordsCount: analysis.keywords.length
    });
    
    return analysis;
  }

  getMockSuggestions(mood) {
    const suggestionSets = {
      happy: [
        ['Keep up the positive energy by maintaining your current habits', 'Share your joy with others to amplify the positive feelings', 'Consider journaling about what specifically made you happy today', 'Take a moment to appreciate this positive moment fully'],
        ['Continue the activities that brought you this happiness', 'Express gratitude for the positive experiences you\'re having', 'Share your good mood with friends and family', 'Document what worked well today for future reference'],
        ['Maintain this positive momentum in your daily routine', 'Consider what specific factors contributed to your happiness', 'Practice savoring these positive emotions mindfully', 'Use this energy to tackle important goals']
      ],
      grateful: [
        ['Continue practicing gratitude - it\'s clearly benefiting your well-being', 'Consider writing thank-you notes to people who made a difference', 'Try a gratitude meditation before bed', 'Keep a gratitude jar for future reflection'],
        ['Expand your gratitude practice to different areas of life', 'Share your appreciation with others who have helped you', 'Notice small daily blessings you might usually overlook', 'Practice gratitude journaling consistently'],
        ['Express thanks to someone who has impacted your life positively', 'Create a gratitude ritual for your morning or evening', 'Focus on being grateful for challenges that helped you grow', 'Consider volunteer work to give back to your community']
      ],
      excited: [
        ['Channel this excitement into productive action toward your goals', 'Share your enthusiasm with supportive friends and family', 'Use this energy to tackle challenging tasks', 'Document what\'s exciting you for future motivation'],
        ['Plan concrete steps to make the most of this exciting opportunity', 'Balance excitement with realistic expectations and planning', 'Use this momentum to push through any obstacles', 'Consider how to sustain this positive energy long-term'],
        ['Transform excitement into focused action and commitment', 'Share your enthusiasm to inspire others around you', 'Create a vision board or plan for what excites you', 'Practice mindful excitement without getting overwhelmed']
      ],
      content: [
        ['Appreciate and maintain this sense of inner peace', 'Notice what contributes to your feeling of contentment', 'Use this stable emotional state to reflect on your goals', 'Practice gratitude for this moment of satisfaction'],
        ['Build on this foundation of contentment for future growth', 'Share your peaceful energy with others who might need it', 'Consider how to maintain this balance during challenging times', 'Use this clarity to make important life decisions'],
        ['Cultivate habits that support this sense of well-being', 'Practice mindfulness to stay present with these good feelings', 'Consider what life circumstances contribute to your contentment', 'Document this positive state for future reference']
      ],
      stressed: [
        ['Take regular breaks throughout your day to prevent burnout', 'Try deep breathing exercises: 4 counts in, hold for 4, out for 4', 'Consider time-blocking to manage your workload better', 'Schedule some dedicated self-care time this week'],
        ['Practice progressive muscle relaxation to release physical tension', 'Identify the specific sources of stress and address them systematically', 'Consider delegating tasks or asking for help where possible', 'Try a brief mindfulness meditation when feeling overwhelmed'],
        ['Prioritize your tasks and focus on what\'s most important', 'Create boundaries between work and personal time', 'Consider talking to someone about what\'s stressing you', 'Try gentle exercise like walking to reduce stress hormones']
      ],
      anxious: [
        ['Practice grounding techniques: name 5 things you can see, 4 you can hear, 3 you can touch', 'Try progressive muscle relaxation to calm your nervous system', 'Consider talking to someone you trust about your concerns', 'Limit caffeine and practice gentle movement'],
        ['Use box breathing (4-4-4-4) to activate your parasympathetic nervous system', 'Challenge anxious thoughts with evidence-based thinking', 'Consider what you can control vs. what you cannot', 'Try journaling to externalize your worries'],
        ['Practice mindfulness meditation to stay present', 'Create a worry time - 15 minutes daily to process concerns', 'Use positive self-talk to counter anxious thoughts', 'Consider gentle yoga or stretching to ease physical tension']
      ],
      sad: [
        ['Allow yourself to feel these emotions without judgment', 'Reach out to a trusted friend or family member for support', 'Consider gentle movement like a walk in nature', 'Practice self-compassion and treat yourself kindly'],
        ['Try creative expression like drawing, writing, or music', 'Focus on basic self-care: nutrition, sleep, and hygiene', 'Consider what small step might improve your mood', 'Remember that this feeling is temporary and will pass'],
        ['Connect with supportive people in your life', 'Consider professional support if sadness persists', 'Practice gratitude for small positive moments', 'Engage in activities that usually bring you comfort']
      ],
      overwhelmed: [
        ['Break large tasks down into smaller, manageable steps', 'Prioritize your to-do list and focus on the most important items', 'Consider saying no to non-essential commitments', 'Ask for help or delegate where possible'],
        ['Create a simple daily routine to provide structure', 'Practice the two-minute rule: if it takes less than 2 minutes, do it now', 'Consider what you can eliminate or postpone', 'Take breaks and practice deep breathing when feeling swamped'],
        ['Focus on one task at a time instead of multitasking', 'Create physical and mental boundaries around your time', 'Consider using time-management tools or apps', 'Remember that you don\'t have to do everything perfectly']
      ],
      calm: [
        ['Maintain this peaceful state with regular meditation practice', 'Spend time in nature to enhance your sense of calm', 'Consider yoga or gentle stretching to support relaxation', 'Use this clarity to reflect on your life direction'],
        ['Practice mindful breathing to sustain this tranquil state', 'Create a peaceful environment in your living space', 'Consider what activities help you maintain inner peace', 'Share this calming energy with others who might benefit'],
        ['Develop a daily mindfulness practice to cultivate calm', 'Notice and appreciate moments of stillness throughout your day', 'Use this peaceful state to make thoughtful decisions', 'Consider meditation or contemplative practices']
      ],
      thoughtful: [
        ['Your reflective nature is a strength - continue this self-awareness', 'Consider exploring your thoughts through creative expression', 'Try mindfulness meditation to deepen your insights', 'Journal regularly to track your emotional and mental patterns'],
        ['Use your thoughtfulness to gain clarity on important decisions', 'Consider discussing your insights with trusted friends or mentors', 'Practice balancing reflection with action', 'Document your thoughts and insights for future reference'],
        ['Channel your reflective energy into creative or intellectual pursuits', 'Consider how your insights can benefit others', 'Balance thinking with being present in the moment', 'Use your self-awareness for personal growth and development']
      ]
    };
    
    const sets = suggestionSets[mood] || suggestionSets.thoughtful;
    return sets[Math.floor(Math.random() * sets.length)];
  }

  extractKeywords(text) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those', 'just', 'very', 'really', 'quite', 'so', 'too', 'also', 'then', 'now', 'here', 'there', 'where', 'when', 'how', 'what', 'why', 'who', 'feel', 'feeling', 'think', 'thinking', 'today', 'yesterday', 'tomorrow']);
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    // Get unique words and sort by frequency
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    return Object.keys(wordFreq)
      .sort((a, b) => wordFreq[b] - wordFreq[a])
      .slice(0, Math.min(8, Object.keys(wordFreq).length));
  }

  generateMockSummary(text, mood, wordCount) {
    const templates = {
      happy: [
        'A joyful and positive entry reflecting good emotional well-being and life satisfaction.',
        'An uplifting reflection showing optimism and positive emotional state.',
        'A cheerful entry indicating strong mental wellness and positive outlook.',
        'A delightful reflection demonstrating happiness and emotional balance.'
      ],
      grateful: [
        'An appreciative reflection showing strong emotional resilience and gratitude practice.',
        'A thankful entry demonstrating healthy emotional processing and appreciation.',
        'A grateful reflection indicating good emotional balance and mindfulness.',
        'A heartwarming entry expressing gratitude and positive perspective.'
      ],
      excited: [
        'An energetic entry showing enthusiasm and positive anticipation.',
        'A vibrant reflection indicating high motivation and excitement about life.',
        'An animated entry reflecting strong engagement and passionate feelings.',
        'A dynamic reflection showing enthusiasm and forward-looking energy.'
      ],
      content: [
        'A peaceful entry showing satisfaction and emotional balance.',
        'A balanced reflection indicating stability and life contentment.',
        'A serene entry demonstrating inner peace and acceptance.',
        'A harmonious reflection showing satisfaction with current circumstances.'
      ],
      stressed: [
        'Work or life pressures are affecting your well-being. Focus needed on stress management.',
        'Signs of stress and overwhelm present. Consider implementing coping strategies.',
        'Tension and pressure evident in your thoughts. Self-care and stress relief recommended.',
        'Stress indicators in your writing suggest need for balance and support.'
      ],
      anxious: [
        'Anxiety is present in your thoughts. Consider implementing calming strategies.',
        'Worried thoughts and concerns are affecting your peace of mind.',
        'Nervous energy and apprehension detected. Grounding techniques may help.',
        'Anxious feelings evident. Consider mindfulness and relaxation practices.'
      ],
      sad: [
        'Sadness and melancholy are present in your reflection. Support may be beneficial.',
        'Low mood detected in your entry. Gentle self-care and connection recommended.',
        'Feelings of sadness expressed. Consider reaching out for support if needed.',
        'Melancholy tone suggests need for compassion and possibly professional support.'
      ],
      overwhelmed: [
        'Feeling overwhelmed by life circumstances. Breaking tasks down may help.',
        'Sense of being overwhelmed present. Prioritization and support recommended.',
        'Too much on your plate right now. Consider delegating and simplifying.',
        'Overwhelm indicators suggest need for better time management and boundaries.'
      ],
      calm: [
        'A peaceful and balanced state of mind reflected in your writing.',
        'Tranquil thoughts and emotional equilibrium evident in your entry.',
        'A centered reflection showing good emotional regulation and mindfulness.',
        'Calm and composed entry indicating inner peace and emotional stability.'
      ],
      thoughtful: [
        'A reflective entry showing good self-awareness and introspection.',
        'Deep thinking and self-reflection evident in your thoughtful writing.',
        'Contemplative mood with healthy self-examination and insight.',
        'Introspective entry demonstrating strong emotional intelligence and awareness.'
      ]
    };
    
    const moodTemplates = templates[mood] || templates.thoughtful;
    const baseTemplate = moodTemplates[Math.floor(Math.random() * moodTemplates.length)];
    
    const lengthComments = {
      short: [
        ' Consider expanding on your thoughts in future entries for deeper insights.',
        ' Brief but meaningful reflection - try elaborating more next time.',
        ' Concise entry - deeper exploration might yield additional insights.'
      ],
      medium: [
        ' This entry shows a healthy level of self-reflection and awareness.',
        ' Good balance of reflection with meaningful emotional expression.',
        ' Solid level of self-examination and emotional processing evident.'
      ],
      long: [
        ' Your detailed reflection shows excellent self-awareness and emotional processing.',
        ' Comprehensive and thoughtful analysis of your emotional state.',
        ' Thorough reflection demonstrating strong commitment to self-understanding.'
      ]
    };
    
    let lengthCategory = 'medium';
    if (wordCount < 40) lengthCategory = 'short';
    else if (wordCount > 120) lengthCategory = 'long';
    
    const lengthCommentArray = lengthComments[lengthCategory];
    const lengthComment = lengthCommentArray[Math.floor(Math.random() * lengthCommentArray.length)];
    
    return baseTemplate + lengthComment;
  }
}

module.exports = new AIService();
