/**
 * CarShowX Admin API Testing Script
 * 
 * Tests all admin authentication API endpoints
 */

const BASE_URL = 'http://localhost:3000';

class APITester {
  constructor() {
    this.results = [];
  }

  async testEndpoint(name, method, url, data = null, headers = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Testing ${name}...`);
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(`${BASE_URL}${url}`, options);
      const result = await response.json();
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        success: response.ok,
        status: response.status,
        duration,
        data: result
      });
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Duration: ${duration}ms`);
      console.log(`   Response: ${JSON.stringify(result, null, 2).substring(0, 200)}...`);
      console.log('');
      
      return { success: response.ok, data: result, status: response.status };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        success: false,
        status: 0,
        duration,
        error: error.message
      });
      
      console.error(`❌ ${name} failed:`, error.message);
      console.log('');
      
      return { success: false, error: error.message };
    }
  }

  async runAllTests() {
    console.log('🚀 Starting API Endpoint Tests...\n');
    
    // Test 1: Login with valid credentials
    const loginResult = await this.testEndpoint(
      'Admin Login (Valid)',
      'POST',
      '/api/admin/auth/login',
      {
        email: 'admin@carshowx.app',
        password: 'CarShowX@2025!',
        rememberMe: false
      }
    );
    
    let authToken = null;
    if (loginResult.success && loginResult.data.token) {
      authToken = loginResult.data.token;
    }
    
    // Test 2: Login with invalid credentials
    await this.testEndpoint(
      'Admin Login (Invalid)',
      'POST',
      '/api/admin/auth/login',
      {
        email: 'admin@carshowx.app',
        password: 'wrongpassword',
        rememberMe: false
      }
    );
    
    // Test 3: Check auth status with valid token
    if (authToken) {
      await this.testEndpoint(
        'Auth Status Check (Valid)',
        'GET',
        '/api/admin/auth/check',
        null,
        {
          'Authorization': `Bearer ${authToken}`
        }
      );
    }
    
    // Test 4: Check auth status without token
    await this.testEndpoint(
      'Auth Status Check (No Token)',
      'GET',
      '/api/admin/auth/check'
    );
    
    // Test 5: Logout with valid token
    if (authToken) {
      await this.testEndpoint(
        'Admin Logout (Valid)',
        'POST',
        '/api/admin/auth/logout',
        null,
        {
          'Authorization': `Bearer ${authToken}`
        }
      );
    }
    
    // Test 6: Logout without token
    await this.testEndpoint(
      'Admin Logout (No Token)',
      'POST',
      '/api/admin/auth/logout'
    );
    
    // Test 7: Test with malformed data
    await this.testEndpoint(
      'Login (Malformed Data)',
      'POST',
      '/api/admin/auth/login',
      {
        email: 'not-an-email',
        password: '123'
      }
    );
    
    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 API ENDPOINT TEST RESULTS');
    console.log('='.repeat(60));
    
    let totalTests = this.results.length;
    let passedTests = 0;
    let totalDuration = 0;
    
    this.results.forEach((result) => {
      totalDuration += result.duration;
      
      if (result.success) {
        passedTests++;
        console.log(`✅ ${result.name}: PASSED (${result.status}, ${result.duration}ms)`);
      } else {
        console.log(`❌ ${result.name}: FAILED (${result.status}, ${result.duration}ms)`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
    });
    
    console.log('\n' + '-'.repeat(60));
    console.log(`📈 SUMMARY: ${passedTests}/${totalTests} tests passed`);
    console.log(`⏱️ Total execution time: ${totalDuration}ms`);
    console.log(`🎯 Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ALL API TESTS PASSED! Endpoints are working correctly.');
    } else {
      console.log('\n⚠️ Some API tests failed. Please review endpoint implementations.');
    }
    
    console.log('='.repeat(60) + '\n');
  }
}

// Run the tests
async function runAPITests() {
  const tester = new APITester();
  await tester.runAllTests();
}

// Export for use as module or run directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { APITester, runAPITests };
} else {
  runAPITests().catch(console.error);
}
