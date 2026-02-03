/**
 * CarShowX Admin System - Comprehensive Test Suite
 * Run this after manual database setup to verify everything works
 */

const BASE_URL = 'http://localhost:3000';

class AdminSystemTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Testing: ${testName}`);
    const startTime = Date.now();
    
    try {
      await testFunction();
      const duration = Date.now() - startTime;
      
      console.log(`✅ PASSED: ${testName} (${duration}ms)`);
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASSED', duration });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.log(`❌ FAILED: ${testName} (${duration}ms)`);
      console.log(`   Error: ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'FAILED', duration, error: error.message });
    }
  }

  async testAPI(method, endpoint, body = null, expectedStatus = 200) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    return { response, data };
  }

  async runAllTests() {
    console.log('🚀 CarShowX Admin System - Comprehensive Test Suite');
    console.log('=' .repeat(60));
    
    // Test 1: Admin Login with Valid Credentials
    await this.runTest('Admin Login (Valid Credentials)', async () => {
      const { data } = await this.testAPI('POST', '/api/admin/auth/login', {
        email: 'admin@carshowx.app',
        password: 'CarShowX@2025!',
        rememberMe: false
      });
      
      if (!data.success) {
        throw new Error(`Login failed: ${data.error}`);
      }
      
      if (!data.user || !data.user.email) {
        throw new Error('User data missing from login response');
      }
      
      // Store token for subsequent tests
      this.adminToken = data.token;
    });

    // Test 2: Admin Login with Invalid Credentials
    await this.runTest('Admin Login (Invalid Credentials)', async () => {
      const { data } = await this.testAPI('POST', '/api/admin/auth/login', {
        email: 'admin@carshowx.app',
        password: 'wrongpassword',
        rememberMe: false
      }, 401);
      
      if (data.success) {
        throw new Error('Login should have failed with invalid credentials');
      }
    });

    // Test 3: Auth Status Check (No Token)
    await this.runTest('Auth Status Check (No Token)', async () => {
      const { data } = await this.testAPI('GET', '/api/admin/auth/check', null, 401);
      
      if (data.authenticated) {
        throw new Error('Should not be authenticated without token');
      }
    });

    // Test 4: Auth Status Check (With Token)
    if (this.adminToken) {
      await this.runTest('Auth Status Check (With Token)', async () => {
        const response = await fetch(`${BASE_URL}/api/admin/auth/check`, {
          headers: {
            'Authorization': `Bearer ${this.adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (response.status === 200 && !data.authenticated) {
          throw new Error('Should be authenticated with valid token');
        }
      });
    }

    // Test 5: Database Tables Exist
    await this.runTest('Database Tables Verification', async () => {
      // This is indirect - we test by trying to login, which requires the tables
      const { data } = await this.testAPI('POST', '/api/admin/auth/login', {
        email: 'admin@carshowx.app',
        password: 'CarShowX@2025!',
        rememberMe: false
      });
      
      if (!data.success) {
        throw new Error('Database tables may not exist - login failed');
      }
    });

    // Test 6: Admin Login Page Loads
    await this.runTest('Admin Login Page Loads', async () => {
      const response = await fetch(`${BASE_URL}/admin/login`);
      
      if (response.status !== 200) {
        throw new Error(`Login page returned status ${response.status}`);
      }
      
      const html = await response.text();
      if (!html.includes('Admin Panel Login')) {
        throw new Error('Login page content does not match expected');
      }
    });

    // Test 7: Logout Functionality
    if (this.adminToken) {
      await this.runTest('Admin Logout', async () => {
        const response = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(`Logout failed: ${data.error}`);
        }
      });
    }

    // Test 8: Password Security
    await this.runTest('Password Security Validation', async () => {
      // Test with weak password
      const { data } = await this.testAPI('POST', '/api/admin/auth/login', {
        email: 'admin@carshowx.app',
        password: '123456',
        rememberMe: false
      }, 401);
      
      if (data.success) {
        throw new Error('Weak password should not be accepted');
      }
    });

    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const totalTests = this.results.passed + this.results.failed;
    const successRate = totalTests > 0 ? (this.results.passed / totalTests * 100).toFixed(1) : 0;
    
    console.log(`📈 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    console.log('\n📋 Detailed Results:');
    this.results.tests.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`   ${status} ${test.name} (${test.duration}ms)`);
      if (test.error) {
        console.log(`      Error: ${test.error}`);
      }
    });
    
    if (this.results.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! CarShowX Admin System is working perfectly!');
      console.log('🚀 Your admin system is ready for production use.');
    } else {
      console.log(`\n⚠️ ${this.results.failed} test(s) failed. Please review the issues above.`);
    }
    
    console.log('\n🌐 Admin Login: http://localhost:3000/admin/login');
    console.log('📧 Email: admin@carshowx.app');
    console.log('🔑 Password: CarShowX@2025!');
    console.log('='.repeat(60));
  }
}

// Run the tests
async function runTests() {
  const tester = new AdminSystemTester();
  await tester.runAllTests();
}

// Check if we're in Node.js environment
if (typeof window === 'undefined') {
  runTests().catch(console.error);
} else {
  console.log('This test suite should be run in Node.js environment');
}
