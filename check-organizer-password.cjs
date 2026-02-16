const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkOrganizerPassword() {
  try {
    const result = await pool.query(
      `SELECT id, email, password_hash, full_name, role, assigned_event_id 
       FROM admin_users 
       WHERE email = 'organizer@drift.com'`
    );

    if (result.rows.length === 0) {
      console.log('❌ No user found with email: organizer@drift.com');
      console.log('Creating organizer user...');
      
      const hashedPassword = await bcrypt.hash('organizer123', 10);
      
      await pool.query(
        `INSERT INTO admin_users (email, password_hash, full_name, role, assigned_event_id) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['organizer@drift.com', hashedPassword, 'Drift Organizer', 'organizer', 5]
      );
      
      console.log('✅ Organizer user created successfully!');
      return;
    }

    const user = result.rows[0];
    console.log('✅ User found:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.full_name);
    console.log('   Role:', user.role);
    console.log('   Event ID:', user.assigned_event_id);
    console.log('   Password Hash:', user.password_hash.substring(0, 20) + '...');

    // Test password
    const isValidPassword = await bcrypt.compare('organizer123', user.password_hash);
    console.log('\n🔐 Password Test:');
    console.log('   Password "organizer123":', isValidPassword ? '✅ VALID' : '❌ INVALID');

    if (!isValidPassword) {
      console.log('\n🔧 Fixing password...');
      const newHash = await bcrypt.hash('organizer123', 10);
      await pool.query(
        `UPDATE admin_users SET password_hash = $1 WHERE email = $2`,
        [newHash, 'organizer@drift.com']
      );
      console.log('✅ Password updated successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkOrganizerPassword();
