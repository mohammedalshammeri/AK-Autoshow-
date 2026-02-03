/**
 * CarShowX Admin System - Setup Verification Script
 * Run this after manual database setup to verify everything works
 */

async function verifySetup() {
  console.log('🔍 CarShowX Admin System - Setup Verification');
  console.log('=============================================\n');

  const BASE_URL = 'http://localhost:3000';
  
  // Test 1: Check if login page loads
  console.log('🧪 Test 1: Admin Login Page...');
  try {
    const response = await fetch(`${BASE_URL}/admin/login`);
    if (response.ok) {
      console.log('✅ Login page loads correctly');
    } else {
      console.log('❌ Login page failed to load');
    }
  } catch (error) {
    console.log('❌ Cannot connect to server - make sure Next.js is running');
    return;
  }

  // Test 2: Test login with correct credentials
  console.log('\n🧪 Test 2: Valid Login Credentials...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@carshowx.app',
        password: 'CarShowX@2025!',
        rememberMe: false
      })
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok && loginData.success) {
      console.log('✅ Login successful! Database is properly set up.');
      console.log(`   User: ${loginData.user.full_name} (${loginData.user.role})`);
      
      // Test 3: Verify logout works
      if (loginData.token) {
        console.log('\n🧪 Test 3: Logout Functionality...');
        const logoutResponse = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        });

        const logoutData = await logoutResponse.json();
        if (logoutResponse.ok && logoutData.success) {
          console.log('✅ Logout works correctly');
        } else {
          console.log('⚠️ Logout may have issues, but login works');
        }
      }

    } else if (loginResponse.status === 401) {
      console.log('❌ Login failed - Database tables may not exist yet');
      console.log('   Please run the SQL scripts in Supabase dashboard first');
      console.log('   See QUICK_DATABASE_SETUP.md for instructions');
    } else {
      console.log('❌ Login failed with unexpected error:', loginData.error);
    }
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
  }

  // Test 4: Test invalid credentials
  console.log('\n🧪 Test 4: Invalid Login Credentials...');
  try {
    const invalidResponse = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@carshowx.app',
        password: 'wrongpassword',
        rememberMe: false
      })
    });

    const invalidData = await invalidResponse.json();

    if (invalidResponse.status === 401 && !invalidData.success) {
      console.log('✅ Invalid credentials properly rejected');
    } else {
      console.log('⚠️ Security issue - invalid credentials not properly rejected');
    }
  } catch (error) {
    console.log('⚠️ Could not test invalid credentials');
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  console.log('🌐 Admin Login: http://localhost:3000/admin/login');
  console.log('📧 Email: admin@carshowx.app');
  console.log('🔑 Password: CarShowX@2025!');
  console.log('\nIf login test passed, your admin system is ready! 🎉');
  console.log('='.repeat(50));
}

verifySetup().catch(console.error);
