require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function applyPermissionsSystem() {
  try {
    console.log('🔐 Setting up Advanced Permissions System...\n');

    // IMPORTANT: use the production-safe SQL that matches current UUID-based admin_users
    const sql = fs.readFileSync('setup_permissions_system_prod_safe.sql', 'utf8');
    await pool.query(sql);

    console.log('✅ Permissions system applied!\n');
    console.log('📋 Roles available:');
    console.log('   🔴 admin         - كل الصلاحيات');
    console.log('   🟡 management    - قبول/رفض المشاركين فقط');
    console.log('   🟢 organizer     - مسح QR + فحص السلامة');
    console.log('   🔵 data_entry    - إضافة بيانات الجولات');
    console.log('   ⚪ viewer        - مشاهدة فقط\n');

    console.log('📊 New Features:');
    console.log('   ✓ Activity Log - تتبع جميع العمليات (admin_activity_log)');
    console.log('   ✓ Role Expansion - تفعيل management/organizer/data_entry');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

applyPermissionsSystem();
