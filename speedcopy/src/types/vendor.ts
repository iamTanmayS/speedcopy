import {
    UUID,
    PhoneNumber,
    Address,
    ISODateString,
    Percentage,
    HubId,
    DeliveryMode
} from "./shared";
import { Hub } from "./hub";
import { OrderStatus, RejectionReason } from "./order";

export type MachineType =
    | "digital_offset"
    | "uv_printer"
    | "dtf_printer"
    | "laser_cutter"
    | "sublimation"
    | "wide_format"
    | "binding_machine";

export interface VendorMachine {
    type: MachineType;
    count: number;
    isOperational: boolean;
}

export interface VendorWorkingHours {
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
    openTime: string;  // "HH:MM"
    closeTime: string;
    isHoliday: boolean;
}

export interface VendorMetrics {
    totalAssigned: number;
    totalAccepted: number;
    totalRejected: number;
    rejectionPercent: Percentage;
    avgProductionTimeMinutes: number;
    slaBreachCount: number;
    lastOrderAt?: ISODateString;
}

export interface VendorProfile {
    id: UUID;
    businessName: string;
    ownerName: string;
    phone: PhoneNumber;
    email?: string;
    address: Omit<Address, "id" | "customerId" | "isDefault" | "createdAt" | "updatedAt">;
    hubId: HubId;
    hub?: Hub;
    cityId: UUID;
    machines: VendorMachine[];
    supportedSKUIds: UUID[];
    dailyCapacity: number;
    currentCapacity: number;
    workingHours: VendorWorkingHours[];
    gstNumber?: string;
    gstVerified: boolean;
    panNumber?: string;
    bankAccountNumber?: string;
    bankIFSC?: string;
    bankAccountName?: string;
    isAvailable: boolean;
    isActive: boolean;
    isLocked: boolean;
    lockReason?: string;
    priorityScore: number;
    metrics: VendorMetrics;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export type VendorOnboardingStatus =
    | "pending"
    | "in_review"
    | "documents_required"
    | "approved"
    | "rejected";

export type VendorDocumentType =
    | "gst_certificate"
    | "pan_card"
    | "cancelled_cheque"
    | "aadhar"
    | "shop_photo"
    | "machine_photo";

export interface VendorDocument {
    id: UUID;
    vendorId: UUID;
    type: VendorDocumentType;
    fileUrl: string;
    fileName: string;
    uploadedAt: ISODateString;
    verifiedAt?: ISODateString;
    verifiedBy?: UUID;
    isVerified: boolean;
    rejectionReason?: string;
}

export interface VendorOnboardingApplication {
    id: UUID;
    status: VendorOnboardingStatus;
    businessName: string;
    ownerName: string;
    phone: PhoneNumber;
    email?: string;
    businessAddress: Omit<Address, "id" | "customerId" | "isDefault" | "createdAt" | "updatedAt">;
    gstNumber?: string;
    panNumber?: string;
    documents: VendorDocument[];
    hubId?: HubId;
    machines: VendorMachine[];
    supportedSKUIds: UUID[];
    dailyCapacity: number;
    workingHours: VendorWorkingHours[];
    bankAccountNumber?: string;
    bankIFSC?: string;
    bankAccountName?: string;
    reviewedBy?: UUID;
    reviewedAt?: ISODateString;
    rejectionReason?: string;
    submittedAt?: ISODateString;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface SubmitVendorOnboardingRequest {
    businessName: string;
    ownerName: string;
    phone: PhoneNumber;
    email?: string;
    businessAddress: Omit<Address, "id" | "customerId" | "isDefault" | "createdAt" | "updatedAt">;
    gstNumber?: string;
    panNumber?: string;
    hubId: HubId;
    machines: VendorMachine[];
    supportedSKUIds: UUID[];
    dailyCapacity: number;
    workingHours: VendorWorkingHours[];
    bankAccountNumber: string;
    bankIFSC: string;
    bankAccountName: string;
}

export interface AdminOnboardingReviewRequest {
    applicationId: UUID;
    decision: "approve" | "reject" | "request_documents";
    reason: string;
    requiredDocuments?: VendorDocumentType[];
}

export interface VendorOrderQueueItem {
    orderId: UUID;
    orderNumber: string;
    status: OrderStatus;
    items: Array<{
        productName: string;
        skuName: string;
        quantity: number;
        filePreviewUrl?: string;
    }>;
    deliveryMode: DeliveryMode;
    estimatedDelivery: ISODateString;
    acceptDeadline: ISODateString;
    assignedAt: ISODateString;
}

export interface VendorProductionQueueItem extends VendorOrderQueueItem {
    acceptedAt: ISODateString;
    productionDeadline: ISODateString;
    slaWarning: boolean;
}

export interface VendorDashboardSummary {
    vendorId: UUID;
    todayAssigned: number;
    todayAccepted: number;
    todayRejected: number;
    todayInProduction: number;
    todayReadyForPickup: number;
    todayCompleted: number;
    dailyCapacity: number;
    currentCapacity: number;
    capacityUtilizationPercent: Percentage;
    pendingAcceptanceCount: number;
    pendingAcceptanceOrders: VendorOrderQueueItem[];
    slaAtRiskCount: number;
    qcHoldCount: number;
    metrics: VendorMetrics;
    generatedAt: ISODateString;
}

export interface VendorAppHomeResponse {
    summary: VendorDashboardSummary;
    pendingQueue: VendorOrderQueueItem[];
    inProductionQueue: VendorProductionQueueItem[];
    isAvailable: boolean;
}

export interface VendorOrderAction {
    orderId: UUID;
    action: "accept" | "reject";
    rejectionReason?: RejectionReason;
    rejectionNote?: string;
}

export interface VendorOrderStatusUpdate {
    orderId: UUID;
    status: "IN_PRODUCTION" | "QC_HOLD" | "READY_FOR_PICKUP";
    note?: string;
    mediaUrls?: string[]; // proof photos
}

export interface VendorCapacityUpdateRequest {
    currentCapacity: number; // admin-bounded
    isAvailable: boolean;
}

export interface VendorRejectionLog {
    id: UUID;
    vendorId: UUID;
    orderId: UUID;
    reason: RejectionReason;
    note?: string;
    rejectedAt: ISODateString;
    orderReassigned: boolean;
    reassignedToVendorId?: UUID;
    reassignedAt?: ISODateString;
}
