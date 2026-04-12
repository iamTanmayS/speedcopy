import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_ADMIN = {
    phone: '+919999999999',
    password: 'adminpassword123',
    name: 'Super Admin'
};

async function runSeed() {
    const client = new pg.Client({ 
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 60000
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const hash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

        // 1. Upsert into users
        const userRes = await client.query(`
            INSERT INTO users (phone_number, password_hash, role, name, provider)
            VALUES ($1, $2, 'super_admin', $3, 'phone')
            ON CONFLICT (phone_number) 
            DO UPDATE SET 
                password_hash = EXCLUDED.password_hash,
                role = 'super_admin',
                updated_at = NOW()
            RETURNING id
        `, [DEFAULT_ADMIN.phone, hash, DEFAULT_ADMIN.name]);

        const userId = userRes.rows[0].id;
        console.log(`User created/updated: ${DEFAULT_ADMIN.phone} (ID: ${userId})`);

        // 2. Ensure sub_admins entry exists for monitoring
        await client.query(`
            INSERT INTO sub_admins (user_id, name, email, phone, role, permissions)
            VALUES ($1, $2, 'admin@speedcopy.io', $3, 'super_admin', '{manage_all}')
            ON CONFLICT (email) DO NOTHING
        `, [userId, DEFAULT_ADMIN.name, DEFAULT_ADMIN.phone]);

        console.log('\n=========================================');
        console.log('ADMIN SEEDED SUCCESSFULLY');
        console.log(`Phone: ${DEFAULT_ADMIN.phone}`);
        console.log(`Password: ${DEFAULT_ADMIN.password}`);
        console.log('=========================================\n');

    } catch (err) {
        console.error('Seeding error:', err.message);
        throw err;
    } finally {
        await client.end();
    }
}

async function main() {
    let retries = 5;
    while (retries > 0) {
        try {
            await runSeed();
            break;
        } catch (err) {
            retries--;
            console.error(`Attempt failed. Retries left: ${retries}`);
            if (retries === 0) process.exit(1);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

main();
