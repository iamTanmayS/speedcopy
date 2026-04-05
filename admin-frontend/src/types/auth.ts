import type { UUID, PhoneNumber, ISODateString, UserRole } from './shared.js';

export type Permission =
    | 'manage_categories'
    | 'manage_vendors'
    | 'manage_pricing'
    | 'manage_coupons'
    | 'manage_orders'
    | 'manage_refunds'
    | 'manage_users'
    | 'manage_hubs'
    | 'manage_delivery_partners'
    | 'view_financials'
    | 'view_reports'
    | 'export_reports'
    | 'manage_sub_admins'
    | 'manage_templates'
    | 'manage_banners'
    | 'city_kill_switch'
    | 'feature_kill_switch'
    | 'emergency_actions'
    | 'override_sla'
    | 'view_audit_logs'
    | 'manage_vendor_payouts';

export interface AuthTokens {
    accessToken: string;
}

export interface LoginRequest {
    phone: PhoneNumber;
    password?: string;
}

export interface AuthenticatedUser {
    id: UUID;
    phone: PhoneNumber;
    role: UserRole;
    name?: string;
    email?: string;
    permissions: Permission[];
}

export interface LoginResponse {
    tokens: AuthTokens;
    user: AuthenticatedUser;
}

export interface CustomerProfile {
    id: UUID;
    phone: PhoneNumber;
    name: string;
    email?: string;
    city?: string;
    isActive: boolean;
    createdAt: ISODateString;
}
