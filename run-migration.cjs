
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Setup connection
// 1. Try to read DATABASE_URL from .env.local manually because we are in a script
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
    console.error('❌ Error: DATABASE_URL not found. Make sure .env.local exists and has DATABASE_URL for Neon.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Required for Neon
});

async function runMigration() {
    try {
        const sql = fs.readFileSync('apply_group_registration_schema.sql', 'utf8');
        console.log('🚀 Connecting to Neon DB...');
        await pool.query(sql);
        console.log('✅ Migration applied successfully to Neon DB!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
