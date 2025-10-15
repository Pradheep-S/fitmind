// Simple test to verify Gemini connection
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testSimpleConnection() {
    try {
        console.log('🧪 Testing Simple Gemini Connection');
        console.log('===================================');
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        console.log('📤 Sending simple test request...');
        const result = await model.generateContent('Hello, can you respond with just "test successful"?');
        const response = await result.response;
        const text = response.text();
        
        console.log('📥 Response received:', text);
        
        if (text && text.trim().length > 0) {
            console.log('✅ Connection successful!');
            
            // Now test with a simple journal analysis
            console.log('\n📝 Testing journal analysis...');
            const journalPrompt = `Analyze this journal: "I feel happy today because I finished my project." 
            
            Respond with ONLY this JSON:
            {
              "mood": "happy",
              "confidence": 0.9,
              "sentiment": "positive"
            }`;
            
            const analysisResult = await model.generateContent(journalPrompt);
            const analysisResponse = await analysisResult.response;
            const analysisText = analysisResponse.text();
            
            console.log('📊 Analysis response:', analysisText);
            
            try {
                const parsed = JSON.parse(analysisText.trim());
                console.log('✅ JSON parsing successful:', parsed);
            } catch (parseError) {
                console.log('❌ JSON parsing failed:', parseError.message);
                console.log('Raw text:', analysisText);
            }
            
        } else {
            console.log('❌ Empty response received');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    }
}

testSimpleConnection();