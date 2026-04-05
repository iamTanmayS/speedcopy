import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function insertAdmin() {
    try {
        await client.connect();
        const hash = await bcrypt.hash('admin123', 10);
        await client.query(`
            INSERT INTO users (name, phone_number, password_hash, role, permissions) 
            VALUES ('Super Admin', '+919999999999', $1, 'super_admin', '{"all"}')
            ON CONFLICT (phone_number) DO UPDATE SET role = 'super_admin', permissions = '{"all"}', password_hash = $1
        `, [hash]);
        console.log('Admin user seeded successfully.');
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
insertAdmin();
