-- =============================================================================
-- SpeedCopy — Admin Schema Migration (003)
-- Creates tables needed for full admin panel functionality
-- Safe to run multiple times (uses IF NOT EXISTS)
-- =============================================================================

-- Cities
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    polygon_geojson JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    same_day_enabled BOOLEAN NOT NULL DEFAULT true,
    kill_switch_active BOOLEAN NOT NULL DEFAULT false,
    kill_switch_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hubs
CREATE TABLE IF NOT EXISTS hubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    city_id UUID NOT NULL REFERENCES cities(id),
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    manager_name VARCHAR(200),
    manager_phone VARCHAR(20),
    pincodes_covered TEXT[] NOT NULL DEFAULT '{}',
    same_day_cutoff_time VARCHAR(5) NOT NULL DEFAULT '14:00',
    next_day_cutoff_time VARCHAR(5) NOT NULL DEFAULT '20:00',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_paused BOOLEAN NOT NULL DEFAULT false,
    pause_reason TEXT,
    same_day_enabled BOOLEAN NOT NULL DEFAULT true,
    same_day_disabled_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sub-Admins
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

-- Admin Audit Logs (immutable)
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
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_acted_at ON admin_audit_logs(acted_at DESC);

-- Export Jobs
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
CREATE INDEX IF NOT EXISTS idx_export_jobs_requested_by ON export_jobs(requested_by);

-- Refund Records
CREATE TABLE IF NOT EXISTS refund_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    initiated_by UUID NOT NULL,
    initiator_type VARCHAR(20) NOT NULL,  -- customer|support_ops|admin|system
    status VARCHAR(30) NOT NULL DEFAULT 'INITIATED',
    requested_amount INTEGER NOT NULL,       -- in paise
    approved_amount INTEGER,
    method VARCHAR(30),                      -- wallet_credit|original_payment|bank_transfer
    reason TEXT NOT NULL,
    evidence_urls TEXT[] NOT NULL DEFAULT '{}',
    admin_note TEXT,
    requires_admin_approval BOOLEAN NOT NULL DEFAULT false,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    gateway_refund_id TEXT,
    gateway_status TEXT,
    status_history JSONB NOT NULL DEFAULT '[]',
    initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_refund_records_order_id ON refund_records(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_records_status ON refund_records(status);

-- Vendor Payout Records
CREATE TABLE IF NOT EXISTS vendor_payout_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    order_number VARCHAR(50) NOT NULL,
    order_amount INTEGER NOT NULL,           -- in paise
    platform_fee INTEGER NOT NULL,
    platform_fee_percent NUMERIC(5,2) NOT NULL,
    tds_deducted INTEGER NOT NULL DEFAULT 0,
    net_payable INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    hold_reason TEXT,
    settlement_batch_id UUID,
    paid_at TIMESTAMPTZ,
    transaction_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_vendor_id ON vendor_payout_records(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_status ON vendor_payout_records(status);

-- Vendor Settlement Batches
CREATE TABLE IF NOT EXISTS vendor_settlement_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_reference VARCHAR(100) NOT NULL UNIQUE,
    cycle VARCHAR(20) NOT NULL DEFAULT 'weekly',
    period_from TIMESTAMPTZ NOT NULL,
    period_to TIMESTAMPTZ NOT NULL,
    vendor_id UUID NOT NULL,
    payout_record_ids UUID[] NOT NULL DEFAULT '{}',
    gross_amount INTEGER NOT NULL,
    total_platform_fee INTEGER NOT NULL,
    total_tds INTEGER NOT NULL DEFAULT 0,
    net_amount INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    failure_reason TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    transaction_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_settlement_batches_vendor_id ON vendor_settlement_batches(vendor_id);

-- Abuse Flags
CREATE TABLE IF NOT EXISTS abuse_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,   -- customer|vendor|delivery_partner|order|file
    abuse_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'low',
    description TEXT NOT NULL,
    auto_flagged BOOLEAN NOT NULL DEFAULT false,
    dismissed BOOLEAN NOT NULL DEFAULT false,
    dismissed_by UUID,
    dismiss_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_abuse_flags_entity ON abuse_flags(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_abuse_flags_dismissed ON abuse_flags(dismissed);
