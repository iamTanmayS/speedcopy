-- =============================================================================
-- SpeedCopy — Admin Extended Schema Migration (007)
-- Adds Support Tickets, SLA Engine, Delivery Partners, and Feature Flags
-- =============================================================================

-- ─── SLA POLICIES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sla_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., 'printing', 'gifting', 'shopping'
    delivery_mode VARCHAR(20) NOT NULL, -- 'same_day', 'next_day', 'standard'
    
    -- All times in minutes
    acceptance_window_mins INTEGER NOT NULL DEFAULT 30,
    production_window_mins INTEGER NOT NULL DEFAULT 240,
    dispatch_window_mins INTEGER NOT NULL DEFAULT 60,
    delivery_window_mins INTEGER NOT NULL DEFAULT 120,
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SLA VIOLATIONS & TRACKING ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sla_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    policy_id UUID REFERENCES sla_policies(id),
    violation_type VARCHAR(50) NOT NULL, -- 'ACCEPTANCE_DELAY', 'PRODUCTION_DELAY', etc.
    severity VARCHAR(20) NOT NULL DEFAULT 'low',
    breached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution_note TEXT,
    is_notified BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_sla_violations_order ON sla_violations(order_id);

-- ─── SUPPORT TICKETS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    category VARCHAR(50), -- e.g., 'PAYMENT', 'DELIVERY', 'QUALITY'
    
    requester_id UUID NOT NULL REFERENCES users(id),
    requester_type VARCHAR(20) NOT NULL, -- 'CUSTOMER', 'VENDOR', 'DELIVERY_PARTNER'
    
    assigned_to UUID REFERENCES users(id), -- Admin/Staff ID
    order_id UUID REFERENCES orders(id),
    
    last_responded_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tickets_requester ON support_tickets(requester_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);

-- ─── TICKET MESSAGES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    attachment_urls TEXT[] DEFAULT '{}',
    is_internal BOOLEAN NOT NULL DEFAULT false, -- If true, only visible to admin/staff
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── DELIVERY PARTNERS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    type VARCHAR(30) NOT NULL, -- 'INTERNAL', 'AGGREGATOR' (Rapido, Porter, etc.)
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    current_city_id UUID REFERENCES cities(id),
    
    vehicle_type VARCHAR(50),
    payout_rate_per_km INTEGER DEFAULT 0, -- in paise
    base_payout INTEGER DEFAULT 0, -- in paise
    
    rating NUMERIC(3, 2),
    total_deliveries INTEGER DEFAULT 0,
    failure_rate NUMERIC(5, 2) DEFAULT 0.00,
    
    is_online BOOLEAN NOT NULL DEFAULT false,
    last_location_lat NUMERIC(10, 7),
    last_location_lng NUMERIC(10, 7),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PLATFORM CONFIG & KILL SWITCHES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert global kill switch as a config entry if not exists
INSERT INTO platform_config (key, value, description)
VALUES ('global_kill_switch', '{"active": false, "reason": ""}', 'Platform-wide emergency stop')
ON CONFLICT (key) DO NOTHING;

-- ─── COUPONS & CAMPAIGNS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'PERCENT', 'FLAT'
    discount_value INTEGER NOT NULL, -- in paise or percent
    min_order_value INTEGER DEFAULT 0,
    max_discount INTEGER,
    
    usage_limit INTEGER,
    usage_per_user INTEGER DEFAULT 1,
    current_usage INTEGER DEFAULT 0,
    
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SEED DATA ────────────────────────────────────────────────────────────────
INSERT INTO sla_policies (name, category, delivery_mode, acceptance_window_mins, production_window_mins, dispatch_window_mins, delivery_window_mins)
VALUES 
('Express Print (Same Day)', 'printing', 'same_day', 15, 120, 30, 60),
('Standard Print (Next Day)', 'printing', 'next_day', 60, 480, 60, 120),
('Gift Custom (Standard)', 'gifting', 'standard', 120, 1440, 120, 360)
ON CONFLICT DO NOTHING;
