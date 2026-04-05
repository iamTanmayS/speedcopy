import { ISODateString, UUID, DeliveryMode, Percentage } from "./shared";

export type SLATargetType =
    | "vendor_acceptance"
    | "production"
    | "pickup"
    | "delivery"
    | "ticket_first_response"
    | "ticket_resolution"
    | "refund_processing"
    | "clarification_response";

export interface SLARule {
    id: UUID;
    targetType: SLATargetType;
    deliveryMode?: DeliveryMode;
    thresholdMinutes: number;
    warningAtPercent: Percentage;
    isActive: boolean;
    cityId?: UUID;
    createdBy: UUID;
    updatedAt: ISODateString;
}

export interface SLABreach {
    id: UUID;
    targetType: SLATargetType;
    entityId: UUID;
    entityType: "order" | "ticket" | "refund";
    vendorId?: UUID;
    hubId?: UUID;
    slaDeadline: ISODateString;
    breachedAt: ISODateString;
    delayMinutes: number;
    isAcknowledged: boolean;
    acknowledgedBy?: UUID;
}

export interface UpsertSLARuleRequest {
    targetType: SLATargetType;
    deliveryMode?: DeliveryMode;
    thresholdMinutes: number;
    warningAtPercent: Percentage;
    cityId?: UUID;
    reason: string;
}
