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

// ─── SLA Engine ───────────────────────────────────────────────────────────────

export interface SLAPolicy {
    id: UUID;
    name: string;
    category: 'printing' | 'gifting' | 'shopping';
    deliveryMode: 'same_day' | 'next_day' | 'standard';
    acceptanceWindowMins: number;
    productionWindowMins: number;
    dispatchWindowMins: number;
    deliveryWindowMins: number;
    isActive: boolean;
}

export interface SLAViolation {
    id: UUID;
    orderId: UUID;
    policyId?: UUID;
    violationType: string;
    severity: 'low' | 'medium' | 'high';
    breachedAt: ISODateString;
    resolvedAt?: ISODateString;
    resolutionNote?: string;
}

// ─── Support System ───────────────────────────────────────────────────────────

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SupportTicket {
    id: UUID;
    ticketNumber: string;
    subject: string;
    description?: string;
    status: TicketStatus;
    priority: TicketPriority;
    category?: string;
    requesterId: UUID;
    requesterType: 'CUSTOMER' | 'VENDOR' | 'DELIVERY_PARTNER';
    assignedTo?: UUID;
    orderId?: UUID;
    lastRespondedAt?: ISODateString;
    resolvedAt?: ISODateString;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface TicketMessage {
    id: UUID;
    ticketId: UUID;
    senderId: UUID;
    message: string;
    attachmentUrls: string[];
    isInternal: boolean;
    createdAt: ISODateString;
}

// ─── Delivery Partners ────────────────────────────────────────────────────────

export interface DeliveryPartner {
    id: UUID;
    name: string;
    phone?: string;
    type: 'INTERNAL' | 'AGGREGATOR';
    status: 'ACTIVE' | 'SUSPENDED';
    currentCityId?: UUID;
    vehicleType?: string;
    payoutRatePerKm?: PaisaAmount;
    basePayout?: PaisaAmount;
    rating?: number;
    totalDeliveries: number;
    failureRate: Percentage;
    isOnline: boolean;
    lastLocationLat?: number;
    lastLocationLng?: number;
}

// ─── Safety & Kill Switches ───────────────────────────────────────────────────

export interface PlatformConfig {
    key: string;
    value: any;
    description?: string;
    updatedBy?: UUID;
    updatedAt: ISODateString;
}
