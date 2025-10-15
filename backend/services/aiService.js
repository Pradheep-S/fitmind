const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
  }

  async initializeGemini() {
    if (this.initialized) {
      return;
    }

    try {
      console.log('🚀 Initializing Gemini AI...');
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
      }

      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      // Use gemini-2.5-flash which was working before
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      });
      
      this.initialized = true;
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
    }
  }

  async analyzeJournal(text) {
    console.log('\n🔍 === JOURNAL ANALYSIS REQUESTED ===');
    console.log('📝 Text length:', text.length);
    
    try {
      await this.initializeGemini();

      if (!this.initialized) {
        return this.getMockAnalysis(text, 'AI not available');
      }

      console.log('🤖 Attempting Gemini API analysis...');
      
      const prompt = `You are an expert mental health and emotional wellness AI assistant. Analyze this journal entry and provide insights in JSON format.

Journal entry: "${text}"

Analyze the emotional content and provide comprehensive feedback. Focus on:
- Primary mood and emotions
- Stress levels and triggers
- Positive elements to reinforce
- Actionable suggestions for wellbeing
- Risk assessment and follow-up needs

Respond with ONLY valid JSON in this exact structure (no markdown, no extra text):
{
  "mood": "happy or sad or anxious or grateful or excited or calm or stressed or thoughtful or content or overwhelmed or frustrated or hopeful or lonely or confident or uncertain",
  "confidence": 0.85,
  "emotions": [
    {"emotion": "primary_emotion", "confidence": 0.9, "intensity": "low or medium or high"}
  ],
  "sentiment": "positive or negative or neutral",
  "sentimentScore": 0.7,
  "psychologicalThemes": [
    {"theme": "theme_name", "confidence": 0.8, "description": "brief explanation"}
  ],
  "stressIndicators": {
    "level": "low or medium or high",
    "triggers": ["trigger1", "trigger2"],
    "physicalSigns": ["sign1", "sign2"],
    "cognitivePatterns": ["pattern1", "pattern2"]
  },
  "positiveElements": [
    {"element": "element_name", "description": "brief description"}
  ],
  "suggestions": [
    {
      "category": "immediate or daily_practice or lifestyle",
      "action": "specific actionable suggestion",
      "reason": "why this helps",
      "timeframe": "now or today or this_week or ongoing"
    }
  ],
  "summary": "Brief 2-3 sentence summary of emotional state and key insights",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "categories": [
    {"category": "mental_health", "subcategory": "anxiety_management", "confidence": 0.8}
  ],
  "labels": ["tag1", "tag2", "tag3"],
  "urgencyLevel": "low or medium or high",
  "followUpRecommended": true
}`;

      console.log('📤 Sending request to Gemini...');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      console.log('📥 Raw response length:', responseText?.length || 0);
      console.log('📄 Raw response:', responseText);
      
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Empty response from Gemini');
      }
      
      // Clean and parse JSON
      let jsonText = responseText.trim();
      
      console.log('🧹 Cleaning response text...');
      
      // Remove markdown formatting if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
        console.log('Removed ```json prefix');
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
        console.log('Removed ``` prefix');
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
        console.log('Removed ``` suffix');
      }
      jsonText = jsonText.trim();
      
      // Extract JSON object if it's embedded in other text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
        console.log('Extracted JSON object from text');
      }
      
      console.log('🔍 Final JSON text length:', jsonText.length);
      console.log('🔍 Final JSON preview:', jsonText.substring(0, 200) + '...');
      
      console.log('🔍 Parsing JSON...');
      let analysis;
      
      try {
        analysis = JSON.parse(jsonText);
      } catch (parseError) {
        console.log('❌ Initial JSON parsing failed:', parseError.message);
        console.log('🔧 Attempting to repair JSON...');
        
        // Try to fix common JSON issues
        let repairedJson = jsonText;
        
        // Remove any trailing incomplete parts
        const lastCompleteObject = repairedJson.lastIndexOf('}');
        if (lastCompleteObject > 0) {
          repairedJson = repairedJson.substring(0, lastCompleteObject + 1);
        }
        
        // Try to close any unclosed arrays or objects
        const openBraces = (repairedJson.match(/\{/g) || []).length;
        const closeBraces = (repairedJson.match(/\}/g) || []).length;
        const openBrackets = (repairedJson.match(/\[/g) || []).length;
        const closeBrackets = (repairedJson.match(/\]/g) || []).length;
        
        // Add missing closing braces
        for (let i = 0; i < openBraces - closeBraces; i++) {
          repairedJson += '}';
        }
        
        // Add missing closing brackets
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          repairedJson += ']';
        }
        
        try {
          analysis = JSON.parse(repairedJson);
          console.log('✅ JSON repair successful!');
        } catch (repairError) {
          console.log('❌ JSON repair also failed:', repairError.message);
          throw new Error('Failed to parse JSON response');
        }
      }
      
      // Validate required fields
      if (!analysis.mood || !analysis.suggestions || !analysis.summary) {
        throw new Error('Invalid analysis structure');
      }
      
      // Ensure backward compatibility with existing schema
      if (analysis.suggestions && analysis.suggestions.length > 0 && typeof analysis.suggestions[0] === 'object') {
        // Convert new format to old format for compatibility
        analysis.suggestions = analysis.suggestions.map(s => s.action || s);
      }
      
      // Mark as real AI analysis
      analysis.aiSource = 'gemini';
      analysis.enhancedAnalysis = true;
      
      console.log('✅ Gemini analysis successful!');
      console.log('📊 Mood:', analysis.mood, 'Confidence:', analysis.confidence);
      console.log('🏷️ Categories:', analysis.categories?.length || 0);
      console.log('💡 Suggestions:', analysis.suggestions?.length || 0);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Gemini analysis error:', error.message);
      console.log('🔄 Using fallback analysis');
      return this.getMockAnalysis(text, 'Gemini error');
    }
  }

  getMockAnalysis(text, reason = 'fallback') {
    console.log(`=== USING FALLBACK ANALYSIS (${reason}) ===`);
    
    // Basic sentiment analysis based on keywords
    const positiveWords = ['happy', 'good', 'great', 'amazing', 'wonderful', 'love', 'excited', 'grateful', 'blessed', 'accomplished'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'depressed', 'anxious', 'worried'];
    
    const textLower = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
    
    let mood = 'content';
    let sentiment = 'neutral';
    let sentimentScore = 0.1;
    
    if (positiveCount > negativeCount) {
      mood = 'happy';
      sentiment = 'positive';
      sentimentScore = 0.6;
    } else if (negativeCount > positiveCount) {
      mood = 'thoughtful';
      sentiment = 'negative';
      sentimentScore = -0.4;
    }
    
    return {
      mood: mood,
      confidence: 0.75,
      emotions: [{ emotion: mood, confidence: 0.7, intensity: 'medium' }],
      sentiment: sentiment,
      sentimentScore: sentimentScore,
      psychologicalThemes: [
        { theme: 'self_reflection', confidence: 0.8, description: 'Personal introspection and awareness' }
      ],
      stressIndicators: {
        level: 'low',
        triggers: [],
        physicalSigns: [],
        cognitivePatterns: []
      },
      positiveElements: [
        { element: 'self_awareness', description: 'Shows engagement in self-reflection' }
      ],
      growthOpportunities: [
        { area: 'emotional_awareness', description: 'Continue journaling to build emotional intelligence' }
      ],
      suggestions: [
        {
          category: 'daily_practice',
          action: 'Take time for self-reflection and mindfulness',
          reason: 'To enhance emotional awareness',
          timeframe: 'daily'
        },
        {
          category: 'lifestyle',
          action: 'Consider sharing your thoughts with someone you trust',
          reason: 'To build social connections and support',
          timeframe: 'this_week'
        },
        {
          category: 'immediate',
          action: 'Practice gratitude for positive aspects of your life',
          reason: 'To maintain a balanced perspective',
          timeframe: 'now'
        }
      ],
      riskFactors: [],
      summary: "A personal reflection capturing current thoughts and feelings with opportunities for continued growth.",
      keywords: ['reflection', 'thoughts', 'feelings', 'awareness'],
      themes: ['personal_growth', 'self_awareness'],
      categories: [
        { category: 'mental_health', subcategory: 'self_reflection', confidence: 0.8 }
      ],
      labels: ['self_care', 'personal_development'],
      urgencyLevel: 'low',
      followUpRecommended: false,
      cbtInsights: {
        thoughtPatterns: [],
        cognitiveDistortions: [],
        behavioralPatterns: []
      },
      aiSource: 'fallback',
      enhancedAnalysis: false
    };
  }
}

module.exports = new AIService();
