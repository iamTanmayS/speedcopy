import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const files = [
    'src/db/migrations/007_admin_extended_schema.sql'
];

async function runFile(file) {
    const client = new pg.Client({ 
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 60000,
    });

    try {
        await client.connect();
        console.log(`Connected for ${file}`);
        
        if (fs.existsSync(file)) {
            const sql = fs.readFileSync(file, 'utf8');
            // Split by semicolon and filter out empty strings to run queries individually if needed
            // But usually pg.Client can handle multiple queries in one string
            await client.query(sql);
            console.log(`Successfully applied ${file}`);
        } else {
            console.warn(`File not found: ${file}`);
        }
    } catch (err) {
        console.error(`Error applying ${file}:`, err.message);
        throw err;
    } finally {
        await client.end();
    }
}

async function main() {
    console.log('Starting migrations...');
    for (const file of files) {
        let retries = 2;
        while (retries >= 0) {
            try {
                await runFile(file);
                break;
            } catch (err) {
                if (retries === 0) {
                    console.error(`Final failure for ${file}. Dynamic exit.`);
                    process.exit(1);
                }
                console.log(`Retrying ${file} in 5s... (${retries} left)`);
                retries--;
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    }
    console.log('All migrations completed.');
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
