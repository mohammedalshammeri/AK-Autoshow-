
import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  try {
    const sql = fs.readFileSync('add_description_to_sponsors.sql', 'utf8');
    console.log('Running SQL:', sql);
    await client.query(sql);
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
