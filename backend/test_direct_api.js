// Test Google Gemini API directly with REST
require('dotenv').config();
const axios = require('axios');

async function testDirectAPI() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('🔑 API Key available:', !!apiKey);
        console.log('🔑 API Key preview:', apiKey ? apiKey.substring(0, 20) + '...' : 'Not found');
        
        // First, let's try to list models
        console.log('\n📋 Listing available models...');
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        
        try {
            const listResponse = await axios.get(listUrl);
            console.log('✅ Models API call successful');
            console.log('Available models:');
            listResponse.data.models?.forEach(model => {
                console.log(`  - ${model.name} (${model.displayName})`);
            });
            
            // Try with the first available model
            if (listResponse.data.models && listResponse.data.models.length > 0) {
                const firstModel = listResponse.data.models[0];
                console.log(`\n🧪 Testing with first available model: ${firstModel.name}`);
                
                const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${firstModel.name}:generateContent?key=${apiKey}`;
                const testRequest = {
                    contents: [{
                        parts: [{
                            text: 'Hello, can you analyze this journal entry?'
                        }]
                    }]
                };
                
                const generateResponse = await axios.post(generateUrl, testRequest);
                console.log('✅ Content generation successful');
                console.log('Response:', generateResponse.data.candidates[0].content.parts[0].text.substring(0, 100) + '...');
            }
            
        } catch (error) {
            console.error('❌ API Error:', error.response?.data || error.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testDirectAPI();