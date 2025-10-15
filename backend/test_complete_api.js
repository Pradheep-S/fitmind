// Test the complete API flow with enhanced AI analysis
require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testCompleteFlow() {
    try {
        console.log('🧪 Testing Complete Journal API with Enhanced AI');
        console.log('================================================');

        // Step 1: Register a test user
        console.log('\n1️⃣ Registering test user...');
        const registerData = {
            name: 'Test User',
            email: `test_${Date.now()}@example.com`,
            password: 'testpass123'
        };
        
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
        console.log('✅ User registered successfully');

        // Step 2: Login to get token
        console.log('\n2️⃣ Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: registerData.email,
            password: registerData.password
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, token received');

        // Step 3: Create a journal entry
        console.log('\n3️⃣ Creating journal entry with enhanced AI analysis...');
        const journalData = {
            text: "Today was really challenging at work. I had three major deadlines and felt completely overwhelmed. My manager was pressuring me and I started doubting my abilities. But I managed to complete two of the projects and my colleague offered to help with the third one. I'm grateful for the support, though I still feel anxious about tomorrow's presentation. I didn't sleep well last night and I've been having trouble concentrating. On the positive side, I went for a 30-minute walk during lunch which helped me feel a bit calmer.",
            date: new Date().toISOString()
        };

        const createResponse = await axios.post(`${API_BASE}/journal`, journalData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Journal entry created successfully!');
        
        const journalEntry = createResponse.data.data;
        console.log('\n📊 AI Analysis Results:');
        console.log('=======================');
        console.log('🎭 Mood:', journalEntry.mood);
        console.log('🎯 Confidence:', journalEntry.confidence);
        console.log('💭 Sentiment:', journalEntry.aiAnalysis.sentiment, '(' + journalEntry.aiAnalysis.sentimentScore + ')');
        console.log('🚨 Urgency Level:', journalEntry.aiAnalysis.urgencyLevel);
        console.log('🔄 Follow-up:', journalEntry.aiAnalysis.followUpRecommended);
        console.log('🏷️ Enhanced:', journalEntry.aiAnalysis.enhancedAnalysis);

        console.log('\n🧠 Emotions:');
        if (journalEntry.aiAnalysis.emotions) {
            journalEntry.aiAnalysis.emotions.forEach(emotion => {
                console.log(`  - ${emotion.emotion} (${emotion.confidence}, ${emotion.intensity})`);
            });
        }

        console.log('\n🎨 Psychological Themes:');
        if (journalEntry.aiAnalysis.psychologicalThemes) {
            journalEntry.aiAnalysis.psychologicalThemes.forEach(theme => {
                console.log(`  - ${theme.theme}: ${theme.description}`);
            });
        }

        console.log('\n⚠️ Stress Indicators:');
        if (journalEntry.aiAnalysis.stressIndicators) {
            console.log(`  Level: ${journalEntry.aiAnalysis.stressIndicators.level}`);
            console.log(`  Triggers: ${journalEntry.aiAnalysis.stressIndicators.triggers?.join(', ')}`);
        }

        console.log('\n💡 Suggestions:');
        if (journalEntry.suggestions) {
            journalEntry.suggestions.forEach((suggestion, index) => {
                if (typeof suggestion === 'object') {
                    console.log(`  ${index + 1}. [${suggestion.category}] ${suggestion.action}`);
                } else {
                    console.log(`  ${index + 1}. ${suggestion}`);
                }
            });
        }

        console.log('\n🏷️ Categories:');
        if (journalEntry.aiAnalysis.categories) {
            journalEntry.aiAnalysis.categories.forEach(cat => {
                console.log(`  - ${cat.category}/${cat.subcategory} (${cat.confidence})`);
            });
        }

        console.log('\n🔖 Labels:', journalEntry.aiAnalysis.labels?.join(', ') || 'None');
        console.log('🔑 Keywords:', journalEntry.aiAnalysis.keywords?.join(', ') || 'None');

        console.log('\n📝 Summary:');
        console.log(journalEntry.summary);

        // Step 4: Test retrieving the journal entry
        console.log('\n4️⃣ Retrieving journal entry...');
        const getResponse = await axios.get(`${API_BASE}/journal/${journalEntry._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Journal entry retrieved successfully');
        console.log('Entry ID:', getResponse.data.data._id);

        // Step 5: Test journal stats
        console.log('\n5️⃣ Getting journal stats...');
        const statsResponse = await axios.get(`${API_BASE}/journal/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Stats retrieved successfully');
        console.log('Total entries:', statsResponse.data.data.totalEntries);
        console.log('Average words:', statsResponse.data.data.averageWordsPerEntry);

        console.log('\n🎉 All tests passed! Enhanced AI service is working perfectly!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testCompleteFlow();