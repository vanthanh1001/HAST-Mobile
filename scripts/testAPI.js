// Quick API test script để kiểm tra response format
const axios = require('axios');

async function testLoginAPI() {
  console.log('🧪 Testing HAST API Login...\n');
  
  const API_BASE_URL = 'https://api.hast-app.online';
  const LOGIN_ENDPOINT = '/api/auth/sign-in';
  
  // Test cases
  const testCases = [
    {
      name: 'Test 1: Wrong credentials',
      data: {
        user_name: 'wrong_user',
        password: 'wrong_password'
      }
    },
    {
      name: 'Test 2: Empty credentials',
      data: {
        user_name: '',
        password: ''
      }
    },
    {
      name: 'Test 3: Common test credentials',
      data: {
        user_name: 'test',
        password: 'test'
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`Request: ${JSON.stringify(testCase.data, null, 2)}`);
    
    try {
      const response = await axios.post(API_BASE_URL + LOGIN_ENDPOINT, testCase.data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`📦 Response:`, JSON.stringify(response.data, null, 2));
      
      // Analyze response structure
      const data = response.data;
      console.log('\n🔍 Analysis:');
      console.log(`- Has 'success' field: ${data.hasOwnProperty('success')}`);
      console.log(`- Has 'error' field: ${data.hasOwnProperty('error')}`);
      console.log(`- Has 'token' field: ${data.hasOwnProperty('token')}`);
      console.log(`- Has 'message' field: ${data.hasOwnProperty('message')}`);
      console.log(`- Has 'data' field: ${data.hasOwnProperty('data')}`);
      
      if (data.data) {
        console.log(`- data.token exists: ${!!data.data.token}`);
        console.log(`- data.access_token exists: ${!!data.data.access_token}`);
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Status: ${error.response.status}`);
        console.log(`📦 Error Response:`, JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.log(`🌐 Network Error: ${error.message}`);
      } else {
        console.log(`💥 Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Test connection first
async function testConnection() {
  console.log('🌐 Testing API connection...\n');
  
  try {
    const response = await axios.get('https://api.hast-app.online/api/time-slot', {
      timeout: 5000
    });
    
    console.log(`✅ Connection successful! Status: ${response.status}`);
    console.log(`📋 Time slots response:`, JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(`❌ Connection failed:`, error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 HAST API Test Suite\n');
  
  const connectionOK = await testConnection();
  
  if (connectionOK) {
    await testLoginAPI();
  } else {
    console.log('❌ Cannot proceed with login tests - connection failed');
  }
  
  console.log('\n✨ Test completed!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testLoginAPI, testConnection }; 