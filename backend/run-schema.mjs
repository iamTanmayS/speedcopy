import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        await client.connect();
        console.log('Connected to database.');
        const sql = fs.readFileSync('src/db/migrations/full_schema.sql', 'utf8');
        await client.query(sql);
        console.log('Schema applied successfully.');
    } catch (err) {
        console.error('Error applying schema:', err.message);
    } finally {
        await client.end();
    }
}

run();
