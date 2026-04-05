import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log("Connecting to the database...");
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log("Cleaning up old mock data...");
    // Save super admin ID
    const saRes = await client.query(`SELECT id FROM users WHERE phone_number = '+919999999999'`);
    const saId = saRes.rows[0]?.id;

    // Delete existing data safely
    await client.query(`DELETE FROM vendor_settlement_batches`);
    await client.query(`DELETE FROM vendor_payout_records`);
    await client.query(`DELETE FROM refund_records`);
    await client.query(`DELETE FROM order_status_events`);
    await client.query(`DELETE FROM order_items`);
    await client.query(`DELETE FROM orders`);
    await client.query(`DELETE FROM vendor_onboarding_applications`);
    await client.query(`DELETE FROM vendors`);
    await client.query(`DELETE FROM sub_admins`);
    await client.query(`DELETE FROM hubs`);
    await client.query(`DELETE FROM cities`);
    if (saId) {
       await client.query(`DELETE FROM users WHERE id != $1`, [saId]);
    } else {
       await client.query(`DELETE FROM users`);
    }

    console.log("Inserting Cities & Hubs...");
    const city1 = randomUUID();
    const city2 = randomUUID();
    await client.query(`INSERT INTO cities (id, name, state) VALUES ($1, 'Mumbai', 'MH'), ($2, 'Bangalore', 'KA')`, [city1, city2]);

    const hub1 = randomUUID();
    const hub2 = randomUUID();
    const hub3 = randomUUID();
    await client.query(`
      INSERT INTO hubs (id, name, city_id, manager_name, manager_phone) VALUES 
      ($1, 'Andheri Hub', $4, 'Ramesh Singh', '+918888888801'),
      ($2, 'Bandra Hub', $4, 'Suresh Patel', '+918888888802'),
      ($3, 'Koramangala Hub', $5, 'Arun Kumar', '+918888888803')
    `, [hub1, hub2, hub3, city1, city2]);

    console.log("Inserting Passwords...");
    const pwd = await bcrypt.hash('password123', 10);

    console.log("Inserting Vendors...");
    const vendors = [];
    const customerIds = [];

    // Create 5 vendor users and vendor records
    const vNames = ['Speedy Prints', 'Quality Copy', 'Xerox Master', 'PrintWorks', 'FastDoc'];
    for(let i=0; i<5; i++) {
        const uid = randomUUID();
        const vid = randomUUID();
        await client.query(`
            INSERT INTO users (id, name, phone_number, password_hash, role) 
            VALUES ($1, $2, $3, $4, 'vendor')
        `, [uid, vNames[i] + ' Owner', '+91777777770' + i, pwd]);

        await client.query(`
            INSERT INTO vendors (id, user_id, business_name, owner_name, phone, hub_id, city_id, is_active, is_available) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)
        `, [vid, uid, vNames[i], vNames[i] + ' Owner', '+91777777770' + i, i < 2 ? hub1 : i < 4 ? hub2 : hub3, i < 4 ? city1 : city2, i !== 4]);
        
        vendors.push(vid);
    }

    console.log("Inserting Customers...");
    const cNames = ['Raj', 'Simran', 'Amit', 'Priya', 'Karan', 'Neha', 'Vikram', 'Pooja', 'Rahul', 'Anjali', 'Rohan', 'Sneha', 'Aryan', 'Kavya', 'Siddharth'];
    for(let i=0; i<15; i++) {
        const cid = randomUUID();
        await client.query(`
            INSERT INTO users (id, name, phone_number, password_hash, role, total_orders) 
            VALUES ($1, $2, $3, $4, 'customer', $5)
        `, [cid, cNames[i], '+9166666666' + i.toString().padStart(2, '0'), pwd, Math.floor(Math.random() * 20)]);
        customerIds.push(cid);
    }

    console.log("Inserting Sub-Admins...");
    for(let i=0; i<2; i++) {
        const uid = randomUUID();
        await client.query(`
            INSERT INTO users (id, name, email, phone_number, password_hash, role, permissions) 
            VALUES ($1, $2, $3, $4, $5, 'sub_admin', '{"manage_orders", "view_reports"}')
        `, [uid, `Sub Admin ${i+1}`, `admin${i+1}@speedcopy.in`, `+91555555550${i}`, pwd]);

        await client.query(`
            INSERT INTO sub_admins (user_id, name, email, phone, role) 
            VALUES ($1, $2, $3, $4, 'Operations Lead')
        `, [uid, `Sub Admin ${i+1}`, `admin${i+1}@speedcopy.in`, `+91555555550${i}`]);
    }

    console.log("Inserting Orders...");
    const statuses = ['CREATED', 'ACCEPTED', 'PRINTING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    const orderIds = [];
    
    // Create 50 orders
    for(let i=1; i<=60; i++) {
        const oid = randomUUID();
        const cid = customerIds[Math.floor(Math.random() * customerIds.length)];
        const vid = vendors[Math.floor(Math.random() * vendors.length)];
        const hid = i % 2 === 0 ? hub1 : (i % 3 === 0 ? hub2 : hub3);
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        let subtotal = Math.floor(Math.random() * 500) * 100 + 2000; // 20 to 520 rupees
        let deliveryFee = 5000;
        let totalAmount = subtotal + deliveryFee;
        let paidAmount = status === 'CANCELLED' ? 0 : totalAmount;

        let created_at = new Date();
        created_at.setDate(created_at.getDate() - Math.floor(Math.random() * 30));

        await client.query(`
            INSERT INTO orders (id, order_number, customer_id, vendor_id, hub_id, status, subtotal, delivery_fee, total_amount, paid_amount, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
        `, [
            oid, `ORD-${i.toString().padStart(6, '0')}`, cid, vid, hid, status, subtotal, deliveryFee, totalAmount, paidAmount, created_at
        ]);
        
        orderIds.push({id: oid, vendorId: vid, amount: subtotal, status, created_at});
    }

    console.log("Inserting Finance Records (Settlements/Payouts)...");
    for(let i=0; i<30; i++) {
        // pick a delivered order
        const ord = orderIds.find(o => o.status === 'DELIVERED');
        if(!ord) break;
        
        const platformFee = Math.floor(ord.amount * 0.1);
        const net = ord.amount - platformFee;
        
        await client.query(`
            INSERT INTO vendor_payout_records (vendor_id, order_id, order_number, order_amount, platform_fee, net_payable, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [ord.vendorId, ord.id, `ORD-SETTLE-${i}`, ord.amount, platformFee, net, i < 15 ? 'paid' : 'pending', ord.created_at]);
    }

    // Creating one settlement batch
    await client.query(`
        INSERT INTO vendor_settlement_batches (batch_reference, period_from, period_to, vendor_id, gross_amount, net_amount, status)
        VALUES ('BATCH-2026-04-W1', NOW() - INTERVAL '7 days', NOW(), $1, 100000, 90000, 'approved')
    `, [vendors[0]]);

    await client.query('COMMIT');
    console.log("✅ Full mock database seeded successfully!");
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("❌ Seeding failed:", e);
  } finally {
    client.release();
    pool.end();
  }
}

run();
