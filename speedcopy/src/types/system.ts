import { UUID, ISODateString, SupportedChannel } from "./shared";

export type AbuseType =
    | "multiple_accounts"
    | "referral_farming"
    | "fake_address"
    | "payment_fraud"
    | "abusive_language"
    | "vendor_order_hogging"
    | "inappropriate_upload";

export interface AbuseFlag {
    id: UUID;
    entityId: UUID;
    entityType: "customer" | "vendor" | "delivery_partner" | "order" | "file";
    abuseType: AbuseType;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    autoFlagged: boolean;
    dismissed: boolean;
    dismissedBy?: UUID;
    dismissReason?: string;
    createdAt: ISODateString;
}

export interface ActionLog {
    id: UUID;
    actorId: UUID;
    action: string;
    entityType: string;
    entityId?: UUID;
    ipAddress?: string;
    userAgent?: string;
    details: Record<string, unknown>;
    createdAt: ISODateString;
}

export interface NotificationLog {
    id: UUID;
    recipientId: UUID;
    channel: SupportedChannel;
    templateId: string;
    trigger: string;
    deliveryStatus: "sent" | "failed" | "delivered" | "read";
    externalId?: string; // e.g. MSG91 or SNS message id
    sentAt: ISODateString;
}

export interface CreateCityRequest {
    name: string;
    state: string;
    polygonGeoJSON?: Record<string, unknown>;
    isActive: boolean;
    sameDayEnabled: boolean;
}
