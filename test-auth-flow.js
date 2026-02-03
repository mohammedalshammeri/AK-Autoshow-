/**
 * Quick test script to verify admin authentication flow
 */

async function testAuthFlow() {
  const BASE_URL = 'http://localhost:3001';
  
  console.log('🧪 Testing Admin Authentication Flow...\n');

  // Test 1: Auth check without token
  console.log('1️⃣ Testing auth check without token...');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/auth/check`);
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Result: ${data.authenticated ? '✅ Authenticated' : '❌ Not Authenticated'}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 2: Login
  console.log('\n2️⃣ Testing login...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({        email: 'admin@akautoshow.app',
        password: 'AKAutoshow@2025!',
        rememberMe: false
      }),
    });
    
    console.log(`   Status: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    console.log(`   Success: ${loginData.success ? '✅ Yes' : '❌ No'}`);
    
    if (loginData.success && loginData.user) {
      console.log(`   User: ${loginData.user.email} (${loginData.user.role})`);
      
      // Extract cookies for next request
      const cookies = loginResponse.headers.get('set-cookie');
      console.log(`   Cookies set: ${cookies ? '✅ Yes' : '❌ No'}`);
      
      // Test 3: Auth check with token
      console.log('\n3️⃣ Testing auth check with token...');
      const authResponse = await fetch(`${BASE_URL}/api/admin/auth/check`, {
        headers: {
          'Cookie': cookies || ''
        }
      });
      
      console.log(`   Status: ${authResponse.status}`);
      const authData = await authResponse.json();
      console.log(`   Authenticated: ${authData.authenticated ? '✅ Yes' : '❌ No'}`);
      
      if (authData.authenticated && authData.user) {
        console.log(`   User: ${authData.user.email} (${authData.user.role})`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n🏁 Test completed');
}

// Run the test
testAuthFlow().catch(console.error);
