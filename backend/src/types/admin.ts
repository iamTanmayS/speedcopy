import type { UUID, ISODateString, PaisaAmount, Percentage, UserRole } from './shared.js';
import type { Permission } from './auth.js';

// ─── Sub-Admin Management ────────────────────────────────────────────────────

export interface SubAdminProfile {
    id: UUID;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    permissions: Permission[];
    hubIds: UUID[];
    cityIds: UUID[];
    isActive: boolean;
    lastLoginAt?: ISODateString;
    createdAt: ISODateString;
}

export interface CreateSubAdminRequest {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    permissions: Permission[];
    hubIds?: UUID[];
    cityIds?: UUID[];
}

export interface UpdateSubAdminRequest extends Partial<CreateSubAdminRequest> {
    adminId: UUID;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AdminAuditLog {
    id: UUID;
    adminId: UUID;
    adminName: string;
    action: string;
    entityType: string;
    entityId: string;
    changes: {
        before: Record<string, unknown>;
        after: Record<string, unknown>;
    };
    ipAddress: string;
    reason?: string;
    confirmationTokenRequired: boolean;
    actedAt: ISODateString;
}

// ─── Dashboard Aggregates ─────────────────────────────────────────────────────

export interface OrderStatsSummary {
    totalOrders: number;
    totalGrossValue: PaisaAmount;
    averageOrderValue: PaisaAmount;
    completionRatePercent: Percentage;
    slaBreachRatePercent: Percentage;
    cancellationRatePercent: Percentage;
    refundRatePercent: Percentage;
}

export interface VendorPerformanceSummary {
    activeVendors: number;
    avgAcceptanceTime: number; // minutes
    avgProductionTime: number; // minutes
    totalVendorPayouts: PaisaAmount;
}

export interface HubHealthSummary {
    hubId: UUID;
    hubName: string;
    ordersProcessing: number;
    capacityUtilization: Percentage;
    vendorsOnline: number;
    slaRiskOrders: number;
}

export interface RevenueReport {
    grossMerchandiseValue: PaisaAmount;
    discountsGiven: PaisaAmount;
    netRevenue: PaisaAmount;
    cogs: PaisaAmount;
    grossMarginPercent: Percentage;
}

export interface AdminOverviewDashboard {
    dateStart: ISODateString;
    dateEnd: ISODateString;
    orders: OrderStatsSummary;
    vendors: VendorPerformanceSummary;
    hubHealth: HubHealthSummary[];
    revenue: RevenueReport;
    generatedAt: ISODateString;
}

// ─── Export Jobs ──────────────────────────────────────────────────────────────

export type ExportEntityType =
    | 'orders'
    | 'customers'
    | 'vendors'
    | 'payouts'
    | 'tickets'
    | 'audit_logs';

export type ExportFormat = 'csv' | 'excel' | 'json';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ExportRequest {
    entityType: ExportEntityType;
    format: ExportFormat;
    dateFrom: ISODateString;
    dateTo: ISODateString;
    filters?: Record<string, unknown>;
}

export interface ExportJob {
    id: UUID;
    requestedBy: UUID;
    entityType: ExportEntityType;
    format: ExportFormat;
    status: ExportStatus;
    progressPercent: Percentage;
    downloadUrl?: string;
    expiresAt?: ISODateString;
    errorReason?: string;
    requestedAt: ISODateString;
    completedAt?: ISODateString;
}
