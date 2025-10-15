const axios = require('axios');

async function triggerJournalAnalysis() {
  console.log('Triggering journal analysis to check backend logs...');
  
  // First get a valid token
  try {
    // Try to login first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.token;
      console.log('✅ Login successful, got token');
      
      // Now submit a journal entry
      const journalResponse = await axios.post('http://localhost:5000/api/journal', {
        text: "I'm feeling really anxious today. Work has been overwhelming and I can't stop worrying about everything. I feel stressed and need some guidance.",
        date: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (journalResponse.data.success) {
        console.log('✅ Journal submitted successfully');
        console.log('Check the backend logs for AI analysis details!');
      } else {
        console.log('❌ Journal submission failed:', journalResponse.data.message);
      }
    }
  } catch (error) {
    console.log('⚠️ Auth failed, trying to register new user...');
    
    try {
      // Try to register
      const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      if (registerResponse.data.success) {
        const token = registerResponse.data.token;
        console.log('✅ Registration successful, got token');
        
        // Now submit a journal entry
        const journalResponse = await axios.post('http://localhost:5000/api/journal', {
          text: "I'm feeling really anxious today. Work has been overwhelming and I can't stop worrying about everything. I feel stressed and need some guidance.",
          date: new Date().toISOString()
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (journalResponse.data.success) {
          console.log('✅ Journal submitted successfully');
          console.log('Check the backend logs for AI analysis details!');
        } else {
          console.log('❌ Journal submission failed:', journalResponse.data.message);
        }
      }
    } catch (regError) {
      console.error('❌ Both login and registration failed');
      console.error('Error:', regError.response?.data || regError.message);
    }
  }
}

triggerJournalAnalysis();