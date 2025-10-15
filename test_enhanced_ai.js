// Load environment variables
require('dotenv').config({ path: './backend/.env' });
const aiService = require('./backend/services/aiService');

async function testEnhancedAI() {
    console.log('🧪 Testing Enhanced AI Service');
    console.log('====================================');
    
    const testText = `Today was really challenging at work. I had three major deadlines and felt completely overwhelmed. My manager was pressuring me and I started doubting my abilities. But I managed to complete two of the projects and my colleague offered to help with the third one. I'm grateful for the support, though I still feel anxious about tomorrow's presentation. I didn't sleep well last night and I've been having trouble concentrating. On the positive side, I went for a 30-minute walk during lunch which helped me feel a bit calmer.`;
    
    try {
        console.log('📝 Test Journal Entry:');
        console.log(testText.substring(0, 100) + '...\n');
        
        const analysis = await aiService.analyzeJournal(testText);
        
        console.log('📊 Analysis Results:');
        console.log('==================');
        console.log('🎭 Mood:', analysis.mood);
        console.log('🎯 Confidence:', analysis.confidence);
        console.log('💭 Sentiment:', analysis.sentiment, '(', analysis.sentimentScore, ')');
        console.log('🏷️ Enhanced Analysis:', analysis.enhancedAnalysis);
        console.log('🚨 Urgency Level:', analysis.urgencyLevel);
        console.log('🔄 Follow-up Recommended:', analysis.followUpRecommended);
        
        console.log('\n🧠 Emotions:');
        if (analysis.emotions) {
            analysis.emotions.forEach(emotion => {
                console.log(`  - ${emotion.emotion} (${emotion.confidence}, ${emotion.intensity})`);
            });
        }
        
        console.log('\n🎨 Themes:');
        if (analysis.psychologicalThemes) {
            analysis.psychologicalThemes.forEach(theme => {
                console.log(`  - ${theme.theme}: ${theme.description}`);
            });
        }
        
        console.log('\n⚠️ Stress Indicators:');
        if (analysis.stressIndicators) {
            console.log(`  Level: ${analysis.stressIndicators.level}`);
            console.log(`  Triggers: ${analysis.stressIndicators.triggers.join(', ')}`);
            console.log(`  Physical: ${analysis.stressIndicators.physicalSigns.join(', ')}`);
        }
        
        console.log('\n✨ Positive Elements:');
        if (analysis.positiveElements) {
            analysis.positiveElements.forEach(element => {
                console.log(`  - ${element.element}: ${element.description}`);
            });
        }
        
        console.log('\n💡 Suggestions:');
        if (analysis.suggestions) {
            analysis.suggestions.forEach((suggestion, index) => {
                if (typeof suggestion === 'object') {
                    console.log(`  ${index + 1}. [${suggestion.category}] ${suggestion.action}`);
                    console.log(`     Reason: ${suggestion.reason}`);
                    console.log(`     Timeframe: ${suggestion.timeframe}`);
                } else {
                    console.log(`  ${index + 1}. ${suggestion}`);
                }
            });
        }
        
        console.log('\n🏷️ Categories:');
        if (analysis.categories) {
            analysis.categories.forEach(cat => {
                console.log(`  - ${cat.category}/${cat.subcategory} (${cat.confidence})`);
            });
        }
        
        console.log('\n🔖 Labels:', analysis.labels?.join(', ') || 'None');
        console.log('🔑 Keywords:', analysis.keywords?.join(', ') || 'None');
        
        console.log('\n📝 Summary:');
        console.log(analysis.summary);
        
        console.log('\n✅ Test completed successfully!');
        
        // Also test fallback
        console.log('\n🔄 Testing fallback analysis...');
        const fallbackAnalysis = aiService.getMockAnalysis(testText, 'test');
        console.log('Fallback mood:', fallbackAnalysis.mood);
        console.log('Fallback enhanced:', fallbackAnalysis.enhancedAnalysis);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

testEnhancedAI();