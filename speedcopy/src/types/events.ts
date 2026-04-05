import { UUID, ISODateString } from "./shared";
import { OrderStatus } from "./order";
import { DeliveryMode } from "./shared";

// =============================================================================
// DOMAIN EVENTS (Service-to-Service via Kafka / EventBridge)
// =============================================================================

export interface BaseDomainEvent {
    eventId: UUID;
    timestamp: ISODateString;
    correlationId?: UUID; // from API request tracing
    causationId?: UUID;   // previous event that triggered this
    version: "1.0";
}

export interface UserRegisteredEvent extends BaseDomainEvent {
    type: "UserRegistered";
    payload: {
        userId: UUID;
        phone: string;
    };
}

export interface OrderCreatedEvent extends BaseDomainEvent {
    type: "OrderCreated";
    payload: {
        orderId: UUID;
        customerId: UUID;
        cityId: UUID;
        totalAmount: number;
        deliveryMode: DeliveryMode;
        hubId?: UUID;
    };
}

export interface OrderStatusChangedEvent extends BaseDomainEvent {
    type: "OrderStatusChanged";
    payload: {
        orderId: UUID;
        oldStatus: string;
        newStatus: string;
        changedBy: UUID;
    };
}

export interface VendorAssignedEvent extends BaseDomainEvent {
    type: "VendorAssigned";
    payload: {
        orderId: UUID;
        vendorId: UUID;
        hubId: UUID;
        deadline: ISODateString;
    };
}

export interface RoutingDecisionMadeEvent extends BaseDomainEvent {
    type: "RoutingDecisionMade";
    payload: {
        orderId: UUID;
        hubId: UUID;
        selectedVendorId: UUID;
        autoFallbackApplied: boolean;
    };
}

export interface PaymentCompletedEvent extends BaseDomainEvent {
    type: "PaymentCompleted";
    payload: {
        paymentId: UUID;
        orderId?: UUID;
        amount: number;
        method: string;
    };
}

export interface DeliveryLocationUpdatedEvent extends BaseDomainEvent {
    type: "DeliveryLocationUpdated";
    payload: {
        deliveryPartnerId: UUID;
        orderId: UUID;
        latitude: number;
        longitude: number;
    };
}

export interface DeliveryFailedEvent extends BaseDomainEvent {
    type: "DeliveryFailed";
    payload: {
        orderId: UUID;
        deliveryPartnerId: UUID;
        reason: string;
    };
}

export interface RefundCompletedEvent extends BaseDomainEvent {
    type: "RefundCompleted";
    payload: {
        refundId: UUID;
        orderId: UUID;
        amount: number;
        method: string;
    };
}

export interface ReprintRequestedEvent extends BaseDomainEvent {
    type: "ReprintRequested";
    payload: {
        reprintId: UUID;
        originalOrderId: UUID;
        reason: string;
    };
}

export interface SLABreachedEvent extends BaseDomainEvent {
    type: "SLABreached";
    payload: {
        breachId: UUID;
        targetType: string;
        entityId: UUID;
        entityType: string;
        delayMinutes: number;
    };
}

export interface HubAutoDefenceTriggeredEvent extends BaseDomainEvent {
    type: "HubAutoDefenceTriggered";
    payload: {
        eventId: UUID;
        hubId: UUID;
        trigger: string;
        action: string;
    };
}

export interface VendorPayoutProcessedEvent extends BaseDomainEvent {
    type: "VendorPayoutProcessed";
    payload: {
        batchId: UUID;
        vendorId: UUID;
        netAmount: number;
        transactionReference: string;
    };
}

export interface FeatureFlagChangedEvent extends BaseDomainEvent {
    type: "FeatureFlagChanged";
    payload: {
        key: string;
        isEnabled: boolean;
        changedBy: UUID;
    };
}

export type DomainEvent =
    | UserRegisteredEvent
    | OrderCreatedEvent
    | OrderStatusChangedEvent
    | VendorAssignedEvent
    | RoutingDecisionMadeEvent
    | PaymentCompletedEvent
    | DeliveryLocationUpdatedEvent
    | DeliveryFailedEvent
    | RefundCompletedEvent
    | ReprintRequestedEvent
    | SLABreachedEvent
    | HubAutoDefenceTriggeredEvent
    | VendorPayoutProcessedEvent
    | FeatureFlagChangedEvent;

// =============================================================================
// WEBSOCKET EVENTS (Server-to-Client UI updates)
// =============================================================================

export type WSClientType = "customer_app" | "vendor_app" | "delivery_app" | "admin_panel";

export interface WSConnectPayload {
    token: string;
    clientType: WSClientType;
    deviceId: string;
}

export type WSSubscriptionTopic =
    | `order:${UUID}`
    | `vendor:${UUID}:queue`
    | `delivery:${UUID}:location`
    | `hub:${UUID}:metrics`
    | `ticket:${UUID}`;

export type WSEventType =
    | "ORDER_STATUS_UPDATE"
    | "DELIVERY_LOCATION_UPDATE"
    | "VENDOR_NEW_ORDER"
    | "TICKET_NEW_MESSAGE"
    | "SYSTEM_ALERT";

export interface OrderStatusChangedWSPayload {
    orderId: UUID;
    status: OrderStatus;
    timestamp: ISODateString;
    message: string;
}

export interface DeliveryLocationWSPayload {
    deliveryPartnerId: UUID;
    orderId: UUID;
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: ISODateString;
}

export interface VendorNewOrderWSPayload {
    vendorId: UUID;
    orderId: UUID;
    skus: string[];
    acceptDeadline: ISODateString;
}

export interface TicketNewMessageWSPayload {
    ticketId: UUID;
    messageId: UUID;
    senderName: string;
    contentSnippet: string;
    timestamp: ISODateString;
}

export interface SystemAlertWSPayload {
    title: string;
    message: string;
    level: "info" | "warning" | "critical";
    requiresReload?: boolean;
}

export interface WSEvent<T = unknown> {
    eventId: UUID;
    type: WSEventType;
    topic?: WSSubscriptionTopic;
    timestamp: ISODateString;
    data: T;
}
