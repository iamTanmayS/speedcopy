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

    // Wipe all tables in one shot with CASCADE to bypass FK ordering issues
    await client.query(`
      TRUNCATE TABLE
        users, cities, hubs, vendors, vendor_onboarding_applications,
        orders, order_items, order_status_events, refund_records,
        vendor_payout_records, vendor_settlement_batches, sub_admins,
        admin_audit_logs, export_jobs, abuse_flags,
        categories, sub_categories, products, skus,
        product_config_options, product_config_option_values, quantity_slabs
      CASCADE
    `);

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

    console.log("Inserting Catalog Hierarchy...");
    const catPrintId = randomUUID();
    const catGiftsId = randomUUID();
    const catStationeryId = randomUUID();

    await client.query(`
      INSERT INTO categories (id, name, is_active) VALUES 
      ($1, 'printing', true),
      ($2, 'gifts', true),
      ($3, 'stationery', true)
    `, [catPrintId, catGiftsId, catStationeryId]);

    // ─── Sub-Categories ───────────────────────────────
    const subFlyerId      = randomUUID(); // Printing -> Marketing Materials
    const subDocId        = randomUUID(); // Printing -> Document Printing
    const subBizCardId    = randomUUID(); // Printing -> Business Cards
    const subPhotoId      = randomUUID(); // Gifts -> Photo Gifts
    const subCorporateId  = randomUUID(); // Gifts -> Corporate Gifts
    const subOfficeId     = randomUUID(); // Stationery -> Office Supplies
    const subNotebookId   = randomUUID(); // Stationery -> Notebooks

    await client.query(`INSERT INTO sub_categories (id, category_id, title) VALUES ($1, $2, 'Marketing Materials')`, [subFlyerId,     catPrintId]);
    await client.query(`INSERT INTO sub_categories (id, category_id, title) VALUES ($1, $2, 'Document Printing')`,   [subDocId,       catPrintId]);
    await client.query(`INSERT INTO sub_categories (id, category_id, title) VALUES ($1, $2, 'Business Cards')`,      [subBizCardId,   catPrintId]);
    await client.query(`INSERT INTO sub_categories (id, category_id, title) VALUES ($1, $2, 'Photo Gifts')`,         [subPhotoId,     catGiftsId]);
    await client.query(`INSERT INTO sub_categories (id, category_id, title) VALUES ($1, $2, 'Corporate Gifts')`,     [subCorporateId, catGiftsId]);
    await client.query(`INSERT INTO sub_categories (id, category_id, title) VALUES ($1, $2, 'Office Supplies')`,     [subOfficeId,    catStationeryId]);
    await client.query(`INSERT INTO sub_categories (id, category_id, title) VALUES ($1, $2, 'Notebooks & Diaries')`, [subNotebookId,  catStationeryId]);

    // ─── PRODUCTS (10 total) ──────────────────────────
    const prodFlyerId       = randomUUID(); // editor_only
    const prodBrochureId    = randomUUID(); // upload_or_editor
    const prodDocId         = randomUUID(); // upload_only
    const prodBizCardId     = randomUUID(); // editor_only
    const prodBannerRollId  = randomUUID(); // upload_only
    const prodMugId         = randomUUID(); // upload_only
    const prodPhotoBookId   = randomUUID(); // upload_or_editor
    const prodCushionId     = randomUUID(); // upload_only
    const prodPenId         = randomUUID(); // none
    const prodNotebookId    = randomUUID(); // none

    // Printing products
    await client.query(`INSERT INTO products (id, sub_category_id, slug, title, description, customization_mode, primary_cta) VALUES
      ($1, $2, 'flyer-a4',       'Standard Flyer A4',      'High-impact A4 marketing flyers printed on 100–170gsm paper.',   'editor_only',      'edit_and_print')`,
      [prodFlyerId, subFlyerId]);

    await client.query(`INSERT INTO products (id, sub_category_id, slug, title, description, customization_mode, primary_cta) VALUES
      ($1, $2, 'brochure-tri',   'Tri-fold Brochure',       'Premium tri-fold brochures. Upload your design or use our editor.', 'upload_or_editor', 'edit_and_print')`,
      [prodBrochureId, subFlyerId]);

    await client.query(`INSERT INTO products (id, sub_category_id, slug, title, description, customization_mode, primary_cta) VALUES
      ($1, $2, 'document-print', 'Document Printing',       'Print any document - reports, assignments, thesis, and more.',   'upload_only',      'customize')`,
      [prodDocId, subDocId]);

    await client.query(`INSERT INTO products (id, sub_category_id, slug, title, description, customization_mode, primary_cta) VALUES
      ($1, $2, 'business-card',  'Premium Business Card',   'Matte or glossy finish business cards. Design in our editor.',  'editor_only',      'edit_and_print')`,
      [prodBizCardId, subBizCardId]);

    await client.query(`INSERT INTO products (id, sub_category_id, slug, title, description, customization_mode, primary_cta) VALUES
      ($1, $2, 'banner-roll-up', 'Roll-Up Banner 85x200cm', 'High-resolution roll-up standee banners. Upload your artwork.', 'upload_only',      'customize')`,
      [prodBannerRollId, subFlyerId]);

    // Gift products
    await client.query(`INSERT INTO products (id, sub_category_id, slug, title, description, customization_mode, primary_cta) VALUES
      ($1, $2, 'magic-mug',      'Magic Photo Mug',         'Color-changing mug that reveals your photo when filled with hot liquid.', 'upload_only', 'customize')`,
      [prodMugId, subPhotoId]);

    await client.query(`INSERT INTO products (id, sub_category_id, slug, title, description, customization_mode, primary_cta) VALUES
      ($1, $2, 'photo-book-a4',  'Premium Photo Book A4',   'Hardcover photo book. Upload photos or arrange using our editor.', 'upload_or_editor', 'customize')`,
      [prodPhotoBookId, subPhotoId]);

    await client.query(`INSERT INTO products (id, sub_category_id, slug, title, description, customization_mode, primary_cta) VALUES
      ($1, $2, 'cushion-custom', 'Personalised Cushion',    'Soft 12x12 inch personalised cushion with your favourite photo.',  'upload_only',      'customize')`,
      [prodCushionId, subCorporateId]);

    // Stationery products
    await client.query(`INSERT INTO products (id, sub_category_id, slug, title, description, customization_mode, primary_cta) VALUES
      ($1, $2, 'pilot-v5',       'Pilot V5 Liquid Ink Pen', 'Smooth writing blue ink liquid pen 0.5mm tip.',                  'none',             'customize')`,
      [prodPenId, subOfficeId]);

    await client.query(`INSERT INTO products (id, sub_category_id, slug, title, description, customization_mode, primary_cta) VALUES
      ($1, $2, 'diary-a5',       'Branded A5 Diary',        'Hardcover A5 diary with 200 ruled pages. Corporate gifting ready.', 'none',           'customize')`,
      [prodNotebookId, subNotebookId]);

    // ─── SKUs ─────────────────────────────────────────
    const skuFlyer100Id     = randomUUID();
    const skuFlyer170Id     = randomUUID();
    const skuBrochure100Id  = randomUUID();
    const skuBrochure170Id  = randomUUID();
    const skuDocBWId        = randomUUID();
    const skuDocColorId     = randomUUID();
    const skuBizMatte50Id   = randomUUID();
    const skuBizGloss50Id   = randomUUID();
    const skuBannerStdId    = randomUUID();
    const skuMugWhiteId     = randomUUID();
    const skuPhotoBook20Id  = randomUUID();
    const skuPhotoBook40Id  = randomUUID();
    const skuCushion12Id    = randomUUID();
    const skuPenBlueId      = randomUUID();
    const skuDiaryA5Id      = randomUUID();

    const skuInserts = [
      [skuFlyer100Id,    prodFlyerId,      'FLY-A4-100G',   'Flyer 100gsm',               5.00,   3.50,  30.00, 'next_day'],
      [skuFlyer170Id,    prodFlyerId,      'FLY-A4-170G',   'Flyer 170gsm Premium',        8.00,   5.50,  31.00, 'same_day'],
      [skuBrochure100Id, prodBrochureId,   'BRO-TRI-100G',  'Brochure 100gsm',            12.00,   8.00,  33.00, 'next_day'],
      [skuBrochure170Id, prodBrochureId,   'BRO-TRI-170G',  'Brochure 170gsm Gloss',      18.00,  12.00,  33.00, 'same_day'],
      [skuDocBWId,       prodDocId,        'DOC-BW-A4',     'B&W A4 Print',                1.50,   1.00,  33.00, 'same_day'],
      [skuDocColorId,    prodDocId,        'DOC-CLR-A4',    'Color A4 Print',              5.00,   3.50,  30.00, 'same_day'],
      [skuBizMatte50Id,  prodBizCardId,    'BIZ-MTT-50',    'Matte Finish (50 Cards)',   299.00, 199.00,  33.00, 'next_day'],
      [skuBizGloss50Id,  prodBizCardId,    'BIZ-GLS-50',    'Glossy Finish (50 Cards)',  349.00, 249.00,  28.00, 'same_day'],
      [skuBannerStdId,   prodBannerRollId, 'BNR-RU-85-200', 'Roll-Up 85x200cm',          999.00, 699.00,  30.00, 'next_day'],
      [skuMugWhiteId,    prodMugId,        'MUG-WHT-001',   'White Magic Mug 11oz',       299.00, 199.00,  33.00, 'next_day'],
      [skuPhotoBook20Id, prodPhotoBookId,  'PBK-A4-20',     'Photo Book 20 Pages',        799.00, 549.00,  31.00, 'next_day'],
      [skuPhotoBook40Id, prodPhotoBookId,  'PBK-A4-40',     'Photo Book 40 Pages',       1299.00, 899.00,  30.00, 'next_day'],
      [skuCushion12Id,   prodCushionId,    'CSH-12-WHT',    'Cushion 12x12 with Fill',    499.00, 349.00,  30.00, 'next_day'],
      [skuPenBlueId,     prodPenId,        'PEN-BLU-001',   'Pilot V5 Blue',               60.00,  55.00,   8.00, 'same_day'],
      [skuDiaryA5Id,     prodNotebookId,   'DRY-A5-200',    'Hardcover A5 Diary 200pg',   349.00, 279.00,  20.00, 'next_day'],
    ];

    for (const sku of skuInserts) {
      await client.query(`
        INSERT INTO skus (id, product_id, sku_code, title, mrp, selling_price, discount_percent, delivery_badge)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, sku);
    }

    // ─── CONFIG OPTIONS & VALUES ──────────────────────

    // Flyer: Print Sides
    const optFlyerSideId  = randomUUID();
    const valFlyerSS      = randomUUID();
    const valFlyerDS      = randomUUID();
    await client.query(`INSERT INTO product_config_options (id, product_id, key, label, type, is_required, sort_order) VALUES ($1,$2,'sides','Print Sides','single',true,1)`, [optFlyerSideId, prodFlyerId]);
    await client.query(`INSERT INTO product_config_option_values (id, option_id, value, label, price_delta, sort_order) VALUES ($1,$2,'single','Single Sided',0.00,1),($3,$2,'double','Double Sided',2.50,2)`, [valFlyerSS, optFlyerSideId, valFlyerDS]);

    // Brochure: Fold Type
    const optBroFoldId    = randomUUID();
    const valBroTri       = randomUUID();
    const valBroZ         = randomUUID();
    await client.query(`INSERT INTO product_config_options (id, product_id, key, label, type, is_required, sort_order) VALUES ($1,$2,'fold','Fold Type','single',true,1)`, [optBroFoldId, prodBrochureId]);
    await client.query(`INSERT INTO product_config_option_values (id, option_id, value, label, price_delta, sort_order) VALUES ($1,$2,'tri_fold','Tri-fold',0.00,1),($3,$2,'z_fold','Z-fold',3.00,2)`, [valBroTri, optBroFoldId, valBroZ]);

    // Document: Binding
    const optDocBindId    = randomUUID();
    const valDocNone      = randomUUID();
    const valDocStaple    = randomUUID();
    const valDocSpiral    = randomUUID();
    await client.query(`INSERT INTO product_config_options (id, product_id, key, label, type, is_required, sort_order) VALUES ($1,$2,'binding','Binding Type','single',true,1)`, [optDocBindId, prodDocId]);
    await client.query(`INSERT INTO product_config_option_values (id, option_id, value, label, price_delta, sort_order) VALUES ($1,$2,'none','No Binding',0.00,1),($3,$2,'staple','Staple',5.00,2),($4,$2,'spiral','Spiral Bind',25.00,3)`, [valDocNone, optDocBindId, valDocStaple, valDocSpiral]);

    // Document: Color Mode
    const optDocSideId    = randomUUID();
    const valDocSS        = randomUUID();
    const valDocDS        = randomUUID();
    await client.query(`INSERT INTO product_config_options (id, product_id, key, label, type, is_required, sort_order) VALUES ($1,$2,'sides','Print Sides','single',true,2)`, [optDocSideId, prodDocId]);
    await client.query(`INSERT INTO product_config_option_values (id, option_id, value, label, price_delta, sort_order) VALUES ($1,$2,'single','Single Sided',0.00,1),($3,$2,'double','Double Sided',0.50,2)`, [valDocSS, optDocSideId, valDocDS]);

    // Business Card: Paper Weight
    const optBizPaperWeightId = randomUUID();
    const valBiz300           = randomUUID();
    const valBiz350           = randomUUID();
    await client.query(`INSERT INTO product_config_options (id, product_id, key, label, type, is_required, sort_order) VALUES ($1,$2,'paper_weight','Paper Weight','single',true,1)`, [optBizPaperWeightId, prodBizCardId]);
    await client.query(`INSERT INTO product_config_option_values (id, option_id, value, label, price_delta, sort_order) VALUES ($1,$2,'300gsm','300 GSM',0.00,1),($3,$2,'350gsm','350 GSM Premium',30.00,2)`, [valBiz300, optBizPaperWeightId, valBiz350]);

    // Mug: Size
    const optMugSizeId    = randomUUID();
    const valMug11        = randomUUID();
    const valMug15        = randomUUID();
    await client.query(`INSERT INTO product_config_options (id, product_id, key, label, type, is_required, sort_order) VALUES ($1,$2,'mug_size','Mug Size','single',true,1)`, [optMugSizeId, prodMugId]);
    await client.query(`INSERT INTO product_config_option_values (id, option_id, value, label, price_delta, sort_order) VALUES ($1,$2,'11oz','11 oz (Standard)',0.00,1),($3,$2,'15oz','15 oz (Large)',50.00,2)`, [valMug11, optMugSizeId, valMug15]);

    // ─── QUANTITY SLABS ───────────────────────────────
    const slabInserts = [
      // Flyer 100gsm slabs
      [randomUUID(), skuFlyer100Id, 1,    99,   4.50],
      [randomUUID(), skuFlyer100Id, 100,  499,  3.20],
      [randomUUID(), skuFlyer100Id, 500,  null, 2.50],
      // Flyer 170gsm premium slabs
      [randomUUID(), skuFlyer170Id, 1,    99,   6.50],
      [randomUUID(), skuFlyer170Id, 100,  499,  5.00],
      [randomUUID(), skuFlyer170Id, 500,  null, 4.00],
      // Brochure slabs
      [randomUUID(), skuBrochure100Id, 50,  249, 9.00],
      [randomUUID(), skuBrochure100Id, 250, null, 7.00],
      // Document B&W slabs
      [randomUUID(), skuDocBWId,  1,   49,  1.50],
      [randomUUID(), skuDocBWId,  50,  199, 1.00],
      [randomUUID(), skuDocBWId,  200, null, 0.70],
      // Document Color slabs
      [randomUUID(), skuDocColorId, 1,  49,  5.00],
      [randomUUID(), skuDocColorId, 50, null, 3.50],
      // Business Card slabs (qty in sets of 50)
      [randomUUID(), skuBizMatte50Id, 1,   4,   199.00],
      [randomUUID(), skuBizMatte50Id, 5,   null, 149.00],
      // Banner - single unit pricing
      [randomUUID(), skuBannerStdId, 1, null, 699.00],
      // Photo Book slabs
      [randomUUID(), skuPhotoBook20Id, 1, 4,    549.00],
      [randomUUID(), skuPhotoBook20Id, 5, null,  499.00],
    ];

    for (const slab of slabInserts) {
      await client.query(`
        INSERT INTO quantity_slabs (id, sku_id, min_qty, max_qty, unit_price)
        VALUES ($1, $2, $3, $4, $5)
      `, slab);
    }

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
