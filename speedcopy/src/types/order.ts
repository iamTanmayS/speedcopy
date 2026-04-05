import {
    UUID,
    ISODateString,
    PaisaAmount,
    DeliveryMode,
    Address,
    DeliverySlot,
    HubId,
    UserRole
} from "./shared";
import { CustomerProfile } from "./auth";
import { Product, SKU } from "./catalog";
import { UploadedFile, EditorState } from "./upload";
import { TaxBreakdown } from "./cart";
import { VendorProfile } from "./vendor";
import { Hub } from "./hub";
import { DeliveryPartnerProfile } from "./delivery";

export type OrderStatus =
    | "CREATED"
    | "CONFIRMED"
    | "PAYMENT_FAILED"
    | "AWAITING_VENDOR_ACCEPTANCE"
    | "ACCEPTED"
    | "IN_PRODUCTION"
    | "QC_HOLD"
    | "READY_FOR_PICKUP"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "VENDOR_REJECTED"
    | "REASSIGNMENT_PENDING"
    | "DELIVERY_FAILED"
    | "REFUND_INITIATED"
    | "REFUNDED"
    | "REPRINT"
    | "CANCELLED";

export type CancellationReason =
    | "customer_request"
    | "vendor_unavailable"
    | "payment_failure"
    | "quality_issue"
    | "admin_cancelled"
    | "all_vendors_rejected";

export type RejectionReason =
    | "file_quality_poor"
    | "capacity_full"
    | "machine_breakdown"
    | "material_unavailable"
    | "incorrect_specs"
    | "other";

export interface OrderStatusEvent {
    id: UUID;
    orderId: UUID;
    fromStatus?: OrderStatus;
    toStatus: OrderStatus;
    triggeredBy: UUID;
    triggeredByRole: UserRole;
    reason?: string;
    note?: string;
    timestamp: ISODateString;
    metadata?: Record<string, unknown>;
}

export interface OrderItem {
    id: UUID;
    orderId: UUID;
    productId: UUID;
    product?: Product;
    skuId: UUID;
    sku?: SKU;
    quantity: number;
    fileId?: UUID;
    uploadedFile?: UploadedFile;
    editorState?: EditorState;
    customizationNotes?: string;
    unitPrice: PaisaAmount;
    totalPrice: PaisaAmount;
    deliveryMode: DeliveryMode;
}

export interface Order {
    id: UUID;
    orderNumber: string;
    customerId: UUID;
    customer?: CustomerProfile;
    items: OrderItem[];
    status: OrderStatus;
    statusHistory: OrderStatusEvent[];
    // Assignment
    hubId?: HubId;
    hub?: Hub;
    vendorId?: UUID;
    vendor?: VendorProfile;
    deliveryPartnerId?: UUID;
    deliveryPartner?: DeliveryPartnerProfile;
    // Address & Delivery
    deliveryAddressId: UUID;
    deliveryAddress: Address;
    deliveryMode: DeliveryMode;
    deliverySlotId: UUID;
    deliverySlot?: DeliverySlot;
    estimatedDelivery: ISODateString;
    actualDelivery?: ISODateString;
    // Financials — locked at order creation, never edited
    subtotal: PaisaAmount;
    deliveryFee: PaisaAmount;
    discountAmount: PaisaAmount;
    walletDeducted: PaisaAmount;
    taxBreakdown: TaxBreakdown;
    totalAmount: PaisaAmount;
    paidAmount: PaisaAmount;
    gstLockedAt: ISODateString;
    // Cancellation
    cancellationReason?: CancellationReason;
    cancelledAt?: ISODateString;
    cancelledBy?: UUID;
    adminApprovalRequired: boolean;
    // Reprint
    originalOrderId?: UUID;
    reprintReason?: string;
    // Support
    ticketIds: UUID[];
    // Dispute
    isDisputed: boolean;
    disputeReason?: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface OrderListResponse {
    orders: Order[];
    total: number;
    page: number;
    pageSize: number;
}

export interface OrderDetailResponse {
    order: Order;
}

export interface OrderEditWindowStatus {
    orderId: UUID;
    canEdit: boolean;
    canCancel: boolean;
    windowClosesAt: ISODateString;
    reason?: string;
}

export type ClarificationStatus = "pending" | "resolved" | "timed_out" | "escalated";

export interface OrderClarification {
    id: UUID;
    orderId: UUID;
    requestedBy: UUID;
    requestedByRole: UserRole;
    question: string;
    attachmentUrls?: string[];
    status: ClarificationStatus;
    response?: string;
    responseAt?: ISODateString;
    createdAt: ISODateString;
    slaDeadline: ISODateString;
}

export interface RespondToClarificationRequest {
    clarificationId: UUID;
    response: string;
    attachmentUrls?: string[];
}

export type RefundStatus =
    | "INITIATED"
    | "PENDING_ADMIN_APPROVAL"
    | "APPROVED"
    | "PROCESSING"
    | "COMPLETED"
    | "REJECTED";

export type RefundMethod =
    | "wallet_credit"
    | "original_payment"
    | "bank_transfer";

export type RefundInitiatorType = "customer" | "support_ops" | "admin" | "system";

export interface InitiateRefundRequest {
    orderId: UUID;
    reason: string;
    evidenceUrls?: string[];
    requestedMethod?: RefundMethod;
}

export interface AdminRefundApprovalRequest {
    refundId: UUID;
    decision: "approve" | "reject";
    reason: string;
    overrideAmount?: PaisaAmount;
    overrideMethod?: RefundMethod;
}

export interface RefundStatusEvent {
    fromStatus?: RefundStatus;
    toStatus: RefundStatus;
    changedBy?: UUID;
    changedByRole?: UserRole;
    note?: string;
    timestamp: ISODateString;
}

export interface RefundRecord {
    id: UUID;
    orderId: UUID;
    customerId: UUID;
    initiatedBy: UUID;
    initiatorType: RefundInitiatorType;
    status: RefundStatus;
    requestedAmount: PaisaAmount;
    approvedAmount?: PaisaAmount;
    method?: RefundMethod;
    reason: string;
    evidenceUrls: string[];
    adminNote?: string;
    requiresAdminApproval: boolean;
    reviewedBy?: UUID;
    reviewedAt?: ISODateString;
    gatewayRefundId?: string;
    gatewayStatus?: string;
    statusHistory: RefundStatusEvent[];
    initiatedAt: ISODateString;
    completedAt?: ISODateString;
}

export type ReprintReason =
    | "damaged_in_delivery"
    | "print_quality_issue"
    | "wrong_item_delivered"
    | "missing_item"
    | "admin_approved";

export interface ReprintRequest {
    orderId: UUID;
    reason: ReprintReason;
    description?: string;
    evidenceUrls?: string[];
}

export interface ReprintRecord {
    id: UUID;
    originalOrderId: UUID;
    newOrderId?: UUID;
    reason: ReprintReason;
    description?: string;
    evidenceUrls: string[];
    requestedBy: UUID;
    requestedByRole: UserRole;
    approvedBy?: UUID;
    approvedAt?: ISODateString;
    status: "pending_approval" | "approved" | "rejected" | "in_production" | "completed";
    rejectionReason?: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}
