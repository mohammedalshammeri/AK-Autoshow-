// Test admin login
require('dotenv').config({ path: '.env.local' });

async function testAdminLogin() {
  console.log('🧪 Testing admin login...');

  try {
    const response = await fetch('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({        email: 'admin@akautoshow.app',
        password: 'AKAutoshow@2025!',
        rememberMe: false
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Login successful!');
      console.log('👤 User:', data.user.email);
      console.log('🎯 Role:', data.user.role);
      console.log('🔑 Token received:', data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Login failed:', data.error);
      console.log('📊 Status:', response.status);
    }

  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testAdminLogin();
