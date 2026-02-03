const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// --- Connection Setup ---
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envFile = fs.readFileSync(envPath, 'utf8');
            const match = envFile.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
            if (match) {
                connectionString = match[1].trim();
                console.log('Found DATABASE_URL in .env.local');
            }
        }
    } catch (e) {
        console.log('Could not read .env.local:', e.message);
    }
}

if (!connectionString) {
    console.error('❌ Error: DATABASE_URL not found. Make sure .env.local exists.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function deleteSampleData() {
    const client = await pool.connect();
    try {
        console.log('🗑️  Deleting sample participants (email ending in @example.com)...');
        
        // Check cascade first again just to be sure (though we checked via tool)
        // We will just trust the DELETE CASCADE relation we verified.
        
        const deleteQuery = `DELETE FROM registrations WHERE email LIKE '%@example.com' RETURNING id, email`;
        const res = await client.query(deleteQuery);
        
        console.log(`✅ Deleted ${res.rowCount} registrations.`);
        if (res.rowCount > 0) {
            console.log('Sample deleted emails:', res.rows.slice(0, 5).map(r => r.email).join(', ') + (res.rowCount > 5 ? '...' : ''));
        }

    } catch (err) {
        console.error('❌ Error deleting data:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

deleteSampleData();
