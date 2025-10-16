const faceAnalysisService = require('./services/faceAnalysisService');
const fs = require('fs').promises;
const path = require('path');

async function testModelLoading() {
  console.log('🧪 Testing Face-API.js Model Loading');
  console.log('====================================\n');

  try {
    // Test model initialization
    console.log('1️⃣ Testing model initialization...');
    await faceAnalysisService.initializeModels();
    
    if (faceAnalysisService.isInitialized) {
      console.log('✅ All face-api.js models loaded successfully!');
      console.log('🎯 Full facial emotion recognition is now active');
    } else {
      console.log('⚠️ Models not loaded - running in fallback mode');
    }

    // Check model files
    console.log('\n2️⃣ Checking model files...');
    const modelPath = path.join(__dirname, 'models/face-models');
    const files = await fs.readdir(modelPath);
    
    const requiredModels = [
      'tiny_face_detector_model-weights_manifest.json',
      'face_landmark_68_model-weights_manifest.json', 
      'face_recognition_model-weights_manifest.json',
      'face_expression_model-weights_manifest.json'
    ];

    const requiredShards = [
      'tiny_face_detector_model-shard1',
      'face_landmark_68_model-shard1',
      'face_recognition_model-shard1', 
      'face_expression_model-shard1'
    ];

    console.log('📋 Model Files Status:');
    requiredModels.forEach(model => {
      const exists = files.includes(model);
      console.log(`${exists ? '✅' : '❌'} ${model}`);
    });

    console.log('\n📋 Model Shards Status:');
    requiredShards.forEach(shard => {
      const exists = files.includes(shard);
      console.log(`${exists ? '✅' : '❌'} ${shard}`);
    });

    console.log(`\n📁 Total files in models directory: ${files.length}`);

    // Test with a mock analysis
    console.log('\n3️⃣ Testing analysis capability...');
    try {
      // Create a small test buffer (won't work but will test the pipeline)
      const testBuffer = Buffer.from('test');
      const result = await faceAnalysisService.analyzeImage(testBuffer);
      
      if (result.success) {
        console.log('✅ Analysis pipeline working with real models!');
      } else {
        console.log('⚠️ Analysis using fallback mode:', result.fallbackReason);
      }
    } catch (error) {
      console.log('⚠️ Analysis test failed (expected with test buffer):', error.message.substring(0, 50));
    }

    console.log('\n🎉 Model Testing Complete!');
    
  } catch (error) {
    console.error('❌ Model test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testModelLoading();
}

module.exports = { testModelLoading };