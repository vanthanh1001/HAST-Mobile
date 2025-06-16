const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://api.hast-app.online';
const TEST_USERNAME = 'test123'; // Replace with test username

async function testResetPassword() {
  console.log('🔄 Testing Reset Password API...');
  console.log('=' .repeat(60));

  try {
    console.log('\n📧 Testing Reset Password Request:');
    console.log(`Username: ${TEST_USERNAME}`);
    console.log(`Endpoint: PUT ${API_BASE_URL}/api/auth/reset-password`);
    
    const response = await axios.put(
      `${API_BASE_URL}/api/auth/reset-password`,
      TEST_USERNAME,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('\n✅ Response received:');
    console.log(`Status: ${response.status}`);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    // Analyze HAST API response format
    console.log('\n🔍 Analysis:');
    console.log(`- Has 'success' field: ${response.data.hasOwnProperty('success')}`);
    console.log(`- Success value: ${response.data.success}`);
    console.log(`- Has 'description' field: ${response.data.hasOwnProperty('description')}`);
    console.log(`- Description: "${response.data.description}"`);
    console.log(`- Has 'status' field: ${response.data.hasOwnProperty('status')}`);
    console.log(`- Status value: "${response.data.status}"`);

    if (response.data.success === true) {
      console.log('\n✅ Reset password request successful!');
      console.log(`Message: ${response.data.description}`);
    } else {
      console.log('\n❌ Reset password request failed!');
      console.log(`Error: ${response.data.description || 'Unknown error'}`);
    }

  } catch (error) {
    console.log('\n❌ Error occurred:');
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      
      // Analyze error response
      if (error.response.data?.description) {
        console.log(`\nError message: ${error.response.data.description}`);
      }
    } else if (error.request) {
      console.log('Network error - no response received');
      console.log(`Request: ${error.request}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✨ Test completed!');
}

// Test different scenarios
async function testMultipleScenarios() {
  const testCases = [
    { username: 'nonexistentuser123', description: 'Non-existent user' },
    { username: 'invalidformat', description: 'Invalid format' },
    { username: '', description: 'Empty username' },
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.description}`);
    console.log(`Username: "${testCase.username}"`);
    
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/reset-password`,
        testCase.username,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );

      console.log(`Status: ${response.status}`);
      console.log(`Success: ${response.data.success}`);
      console.log(`Description: ${response.data.description}`);
      
    } catch (error) {
      console.log(`Error: ${error.response?.status || 'Network Error'}`);
      console.log(`Message: ${error.response?.data?.description || error.message}`);
    }
    
    console.log('-'.repeat(40));
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 HAST API Reset Password Test Suite');
  console.log('=' .repeat(60));
  
  // Test main scenario
  await testResetPassword();
  
  // Test edge cases
  console.log('\n🔍 Testing Edge Cases:');
  await testMultipleScenarios();
  
  console.log('\n🎯 Test Notes:');
  console.log('- Replace TEST_USERNAME with a real username for actual testing');
  console.log('- Check email inbox for reset password email');
  console.log('- HAST API uses success field instead of HTTP status codes');
  console.log('- description field contains the actual message');
  console.log('- Authorization header may not be required for reset password');
}

runAllTests().catch(console.error); 