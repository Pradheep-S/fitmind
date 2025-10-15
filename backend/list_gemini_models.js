require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    console.log('🔍 Listing available Gemini models...');
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = await genAI.listModels();
    
    console.log('\n📋 Available Models:');
    console.log('==================');
    
    models.forEach(model => {
      console.log(`📦 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Supported Generation Methods: ${model.supportedGenerationMethods?.join(', ') || 'None'}`);
      console.log(`   Description: ${model.description || 'No description'}`);
      console.log('');
    });
    
    console.log(`\n✅ Found ${models.length} models`);
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
  }
}

listModels();