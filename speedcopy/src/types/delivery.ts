import { UUID, PhoneNumber, HubId, ISODateString, Address, DeliveryMode } from "./shared";

export type DeliveryPartnerStatus = "available" | "on_delivery" | "offline" | "suspended";

export interface DeliveryPartnerProfile {
    id: UUID;
    name: string;
    phone: PhoneNumber;
    hubId: HubId;
    vehicleType: "bike" | "bicycle" | "foot" | "van";
    vehicleNumber?: string;
    status: DeliveryPartnerStatus;
    isActive: boolean;
    currentLatitude?: number;
    currentLongitude?: number;
    lastLocationUpdatedAt?: ISODateString;
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    createdAt: ISODateString;
}

export interface DeliveryAttempt {
    id: UUID;
    orderId: UUID;
    deliveryPartnerId: UUID;
    attemptNumber: number;
    status: "in_transit" | "delivered" | "failed" | "returned";
    failureReason?: string;
    customerOTP?: string;       // OTP for proof of delivery
    proofImageUrl?: string;
    startedAt: ISODateString;
    completedAt?: ISODateString;
    latitude?: number;
    longitude?: number;
}

export interface DeliveryProof {
    orderId: UUID;
    deliveryPartnerId: UUID;
    type: "photo" | "otp" | "signature";
    proofUrl?: string;
    otpVerified?: boolean;
    latitude: number;
    longitude: number;
    timestamp: ISODateString;
}

export interface DeliveryPickupItem {
    orderId: UUID;
    orderNumber: string;
    vendorId: UUID;
    vendorName: string;
    vendorAddress: string;
    customerName: string;
    customerPhone: PhoneNumber;
    deliveryAddress: Address;
    deliveryMode: DeliveryMode;
    estimatedDelivery: ISODateString;
    itemCount: number;
    specialInstructions?: string;
    readyForPickupAt: ISODateString;
}

export interface DeliveryPickupList {
    partnerId: UUID;
    hubId: HubId;
    items: DeliveryPickupItem[];
    generatedAt: ISODateString;
}

export interface ConfirmPickupRequest {
    orderId: UUID;
    deliveryPartnerId: UUID;
    pickedUpAt: ISODateString;
    latitude: number;
    longitude: number;
}

export interface UpdateDeliveryLocationRequest {
    deliveryPartnerId: UUID;
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: ISODateString;
}

export interface UpdatePartnerStatusRequest {
    deliveryPartnerId: UUID;
    status: DeliveryPartnerStatus;
}

export interface ConfirmDeliveryRequest {
    orderId: UUID;
    deliveryPartnerId: UUID;
    proofType: "photo" | "otp" | "signature";
    proofImageUrl?: string;
    otpEntered?: string;
    latitude: number;
    longitude: number;
    deliveredAt: ISODateString;
}

export interface MarkDeliveryFailedRequest {
    orderId: UUID;
    deliveryPartnerId: UUID;
    reason: string;
    latitude: number;
    longitude: number;
    timestamp: ISODateString;
}

export interface DeliveryPartnerAppHomeResponse {
    partner: DeliveryPartnerProfile;
    pickupList: DeliveryPickupList;
    activeDeliveries: DeliveryPickupItem[];
    todayStats: {
        completed: number;
        failed: number;
        totalDistanceKm?: number;
    };
}
