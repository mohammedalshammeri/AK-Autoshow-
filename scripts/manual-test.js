/**
 * CarShowX Admin System Manual Test Script
 * This script will guide you through testing the admin system
 */

import { AdminService } from '../lib/SimpleAdminService';

async function testAdminSystem() {
  console.log('🚀 CarShowX Admin System Manual Test');
  console.log('====================================\n');

  const adminService = new AdminService();

  // Test 1: Database Connection
  console.log('📊 Test 1: Database Connection');
  try {
    const result = await adminService.getAllUsers({ limit: 1 });
    if (result.success) {
      console.log('✅ Database connection successful');
      console.log(`📈 Found ${result.data?.length || 0} users in database`);
    } else {
      console.log('❌ Database connection failed:', result.error);
      console.log('\n🔧 Setup Required:');
      console.log('1. Go to Supabase Dashboard: https://bvebeycfhtikfmcyadiy.supabase.co');
      console.log('2. Go to SQL Editor');
      console.log('3. Run the SQL from: database/quick_admin_setup.sql');
      console.log('4. Then run this test again\n');
      return;
    }
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    return;
  }

  // Test 2: User Authentication
  console.log('\n🔑 Test 2: User Authentication');
  try {
    const loginResult = await adminService.authenticateUser(
      'admin@carshowx.app',
      'CarShowX@2025!',
      false,
      { browser: 'Test Browser' },
      '127.0.0.1'
    );

    if (loginResult.success) {
      console.log('✅ User authentication successful');
      console.log(`👤 Logged in as: ${loginResult.user.email} (${loginResult.user.role})`);
      console.log(`🎫 Session token: ${loginResult.session.token.substring(0, 20)}...`);

      // Test 3: Session Validation
      console.log('\n🎫 Test 3: Session Validation');
      const sessionResult = await adminService.validateSession(loginResult.session.token);
      
      if (sessionResult.success) {
        console.log('✅ Session validation successful');
      } else {
        console.log('❌ Session validation failed:', sessionResult.error);
      }

      // Test 4: Logout
      console.log('\n🚪 Test 4: Logout');
      const logoutResult = await adminService.invalidateSession(loginResult.session.token);
      
      if (logoutResult.success) {
        console.log('✅ Logout successful');
      } else {
        console.log('❌ Logout failed:', logoutResult.error);
      }

    } else {
      console.log('❌ User authentication failed:', loginResult.error);
      console.log('\n🔧 Possible Issues:');
      console.log('- Admin user does not exist');
      console.log('- Password is incorrect');
      console.log('- Database tables are not set up');
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
  }

  // Test 5: Permission System
  console.log('\n🛡️ Test 5: Permission System');
  try {
    const users = await adminService.getAllUsers({ limit: 5 });
    if (users.success && users.data && users.data.length > 0) {
      for (const user of users.data) {
        const hasFullAccess = adminService.checkPermission(user, 'full_access');
        const canManageUsers = adminService.checkPermission(user, 'can_manage_users');
        console.log(`✅ ${user.role} permissions - Full Access: ${hasFullAccess}, Manage Users: ${canManageUsers}`);
      }
    } else {
      console.log('❌ No users found for permission testing');
    }
  } catch (error) {
    console.log('❌ Permission test error:', error.message);
  }

  console.log('\n🎉 Manual testing completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Test the admin login page: http://localhost:3000/admin/login');
  console.log('2. Test the API endpoints using the test page: http://localhost:3000/admin/test');
  console.log('3. Check activity logs in the database');
}

// Run the test
testAdminSystem().catch(console.error);
