-- =============================================================================
-- SpeedCopy — Full Working Schema (run this once against your DB)
-- Includes: users, orders, vendors, and all admin tables
-- Safe: uses IF NOT EXISTS everywhere
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200),
    email VARCHAR(200),
    phone_number VARCHAR(20) UNIQUE,
    password_hash TEXT,
    provider VARCHAR(30) DEFAULT 'phone',
    role VARCHAR(30) NOT NULL DEFAULT 'customer',
    permissions TEXT[] NOT NULL DEFAULT '{}',
    city VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_flagged BOOLEAN NOT NULL DEFAULT false,
    flag_reason TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    wallet_balance INTEGER NOT NULL DEFAULT 0,
    total_orders INTEGER NOT NULL DEFAULT 0,
    referral_code VARCHAR(20),
    referred_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CITIES ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    same_day_enabled BOOLEAN NOT NULL DEFAULT true,
    kill_switch_active BOOLEAN NOT NULL DEFAULT false,
    kill_switch_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── HUBS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    city_id UUID REFERENCES cities(id),
    address TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    manager_name VARCHAR(200),
    manager_phone VARCHAR(20),
    pincodes_covered TEXT[] DEFAULT '{}',
    same_day_cutoff_time VARCHAR(5) DEFAULT '14:00',
    next_day_cutoff_time VARCHAR(5) DEFAULT '20:00',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_paused BOOLEAN NOT NULL DEFAULT false,
    pause_reason TEXT,
    same_day_enabled BOOLEAN NOT NULL DEFAULT true,
    same_day_disabled_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── VENDORS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    business_name VARCHAR(200) NOT NULL,
    owner_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(200),
    hub_id UUID REFERENCES hubs(id),
    city_id UUID REFERENCES cities(id),
    daily_capacity INTEGER DEFAULT 50,
    current_capacity INTEGER DEFAULT 50,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    lock_reason TEXT,
    priority_score INTEGER DEFAULT 100,
    gst_number VARCHAR(20),
    gst_verified BOOLEAN DEFAULT false,
    pan_number VARCHAR(20),
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_account_name TEXT,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── VENDOR ONBOARDING ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_onboarding_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    business_name VARCHAR(200) NOT NULL,
    owner_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(200),
    gst_number VARCHAR(20),
    pan_number VARCHAR(20),
    hub_id UUID REFERENCES hubs(id),
    daily_capacity INTEGER DEFAULT 50,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_account_name TEXT,
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ORDERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID REFERENCES users(id),
    vendor_id UUID REFERENCES vendors(id),
    hub_id UUID REFERENCES hubs(id),
    status VARCHAR(40) NOT NULL DEFAULT 'CREATED',
    delivery_mode VARCHAR(20) DEFAULT 'next_day',
    delivery_address JSONB,
    estimated_delivery TIMESTAMPTZ,
    actual_delivery TIMESTAMPTZ,
    subtotal INTEGER NOT NULL DEFAULT 0,
    delivery_fee INTEGER NOT NULL DEFAULT 0,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    wallet_deducted INTEGER NOT NULL DEFAULT 0,
    total_amount INTEGER NOT NULL DEFAULT 0,
    paid_amount INTEGER NOT NULL DEFAULT 0,
    cancellation_reason VARCHAR(50),
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES users(id),
    admin_approval_required BOOLEAN DEFAULT false,
    is_disputed BOOLEAN DEFAULT false,
    dispute_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_hub ON orders(hub_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ─── ORDER ITEMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id UUID,
    sku_id UUID,
    product_name VARCHAR(200),
    sku_name VARCHAR(200),
    quantity INTEGER NOT NULL DEFAULT 1,
    file_id UUID,
    unit_price INTEGER NOT NULL DEFAULT 0,
    total_price INTEGER NOT NULL DEFAULT 0,
    delivery_mode VARCHAR(20)
);

-- ─── ORDER STATUS EVENTS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_status_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    from_status VARCHAR(40),
    to_status VARCHAR(40) NOT NULL,
    triggered_by UUID REFERENCES users(id),
    triggered_by_role VARCHAR(30),
    reason TEXT,
    note TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_status_events(order_id);

-- ─── REFUND RECORDS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refund_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    initiated_by UUID NOT NULL,
    initiator_type VARCHAR(20) NOT NULL DEFAULT 'customer',
    status VARCHAR(30) NOT NULL DEFAULT 'INITIATED',
    requested_amount INTEGER NOT NULL DEFAULT 0,
    approved_amount INTEGER,
    method VARCHAR(30),
    reason TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    admin_note TEXT,
    requires_admin_approval BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    gateway_refund_id TEXT,
    gateway_status TEXT,
    status_history JSONB DEFAULT '[]',
    initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_refunds_order ON refund_records(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refund_records(status);

-- ─── VENDOR PAYOUTS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_payout_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    order_number VARCHAR(50) NOT NULL,
    order_amount INTEGER NOT NULL DEFAULT 0,
    platform_fee INTEGER NOT NULL DEFAULT 0,
    platform_fee_percent NUMERIC(5,2) DEFAULT 10.00,
    tds_deducted INTEGER NOT NULL DEFAULT 0,
    net_payable INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    hold_reason TEXT,
    settlement_batch_id UUID,
    paid_at TIMESTAMPTZ,
    transaction_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payouts_vendor ON vendor_payout_records(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON vendor_payout_records(status);

-- ─── SETTLEMENT BATCHES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_settlement_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_reference VARCHAR(100) NOT NULL UNIQUE,
    cycle VARCHAR(20) DEFAULT 'weekly',
    period_from TIMESTAMPTZ NOT NULL,
    period_to TIMESTAMPTZ NOT NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    payout_record_ids UUID[] DEFAULT '{}',
    gross_amount INTEGER NOT NULL DEFAULT 0,
    total_platform_fee INTEGER NOT NULL DEFAULT 0,
    total_tds INTEGER NOT NULL DEFAULT 0,
    net_amount INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    failure_reason TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    transaction_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SUB ADMINS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sub_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'sub_admin',
    permissions TEXT[] NOT NULL DEFAULT '{}',
    hub_ids UUID[] NOT NULL DEFAULT '{}',
    city_ids UUID[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ADMIN AUDIT LOGS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    admin_name VARCHAR(200) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id TEXT NOT NULL,
    changes JSONB NOT NULL DEFAULT '{"before": {}, "after": {}}',
    ip_address VARCHAR(50),
    reason TEXT,
    confirmation_token_required BOOLEAN NOT NULL DEFAULT false,
    acted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON admin_audit_logs(acted_at DESC);

-- ─── EXPORT JOBS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_by UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    format VARCHAR(10) NOT NULL DEFAULT 'csv',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    progress_percent INTEGER NOT NULL DEFAULT 0,
    filters JSONB,
    date_from TIMESTAMPTZ,
    date_to TIMESTAMPTZ,
    download_url TEXT,
    expires_at TIMESTAMPTZ,
    error_reason TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ─── ABUSE FLAGS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS abuse_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    abuse_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'low',
    description TEXT NOT NULL,
    auto_flagged BOOLEAN NOT NULL DEFAULT false,
    dismissed BOOLEAN NOT NULL DEFAULT false,
    dismissed_by UUID REFERENCES users(id),
    dismiss_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
