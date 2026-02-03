const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Setup connection
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
    ssl: { rejectUnauthorized: false }
});

async function runSql() {
    const fileName = process.argv[2];
    if (!fileName) {
        console.error('Please provide a SQL file name or SQL query as an argument.');
        process.exit(1);
    }

    try {
        let sql;
        if (fs.existsSync(fileName)) {
            sql = fs.readFileSync(fileName, 'utf8');
            console.log(`🚀 Executing SQL from file: ${fileName}...`);
        } else {
            sql = fileName; // Treat as raw query
            console.log(`🚀 Executing raw SQL query...`);
        }

        const result = await pool.query(sql);
        console.log('✅ Query executed successfully!');

        if (Array.isArray(result)) {
            // Multiple statements
            let hasRows = false;
            result.forEach((res, i) => {
                if (res.command) {
                     console.log(`Statement ${i+1}: ${res.command} ${res.rowCount !== null ? `(${res.rowCount} rows)` : ''}`);
                }
                if (res.rows && res.rows.length > 0) {
                    hasRows = true;
                    console.table(res.rows);
                }
            });
            if (!hasRows) console.log('No data returned from any statement.');

        } else if (result.rows && result.rows.length > 0) {
            console.table(result.rows);
        } else {
            console.log('No rows returned.');
        }
    } catch (err) {
        console.error('❌ Query failed:', err);
    } finally {
        await pool.end();
    }
}

runSql();
