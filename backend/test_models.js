// Load environment variables
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAvailableModels() {
    try {
        console.log('🔑 API Key available:', !!process.env.GEMINI_API_KEY);
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        console.log('📋 Listing available models...');
        
        // Try a simple request with different model names
        const modelNames = [
            'gemini-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-1.0-pro',
            'text-bison-001'
        ];
        
        for (const modelName of modelNames) {
            try {
                console.log(`\n🧪 Testing model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hello');
                console.log(`✅ ${modelName} - WORKS`);
                console.log(`   Response preview: ${result.response.text().substring(0, 50)}...`);
            } catch (error) {
                console.log(`❌ ${modelName} - FAILED: ${error.message.substring(0, 100)}...`);
            }
        }
        
    } catch (error) {
        console.error('❌ Failed to test models:', error.message);
    }
}

listAvailableModels();