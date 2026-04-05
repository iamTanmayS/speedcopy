import {
    UUID,
    HubId,
    City,
    ISODateString,
    DeliveryMode,
    PhoneNumber
} from "./shared";

export interface HubGoLiveChecklist {
    hubConfigured: boolean;
    vendorsMapped: boolean;
    skusPriced: boolean;
    capacitySet: boolean;
    testOrderCompleted: boolean;
    gstValidated: boolean;
    isReadyToLive: boolean;
}

export interface Hub {
    id: HubId;
    name: string;
    cityId: UUID;
    city?: City;
    address: string;
    latitude: number;
    longitude: number;
    managerName: string;
    managerPhone: PhoneNumber;
    pincodesCovered: string[];
    sameDayCutoffTime: string;
    nextDayCutoffTime: string;
    isActive: boolean;
    isPaused: boolean;
    pauseReason?: string;
    sameDayEnabled: boolean;
    sameDayDisabledReason?: string;
    vendorIds: UUID[];
    activeVendorCount: number;
    goLiveChecklist: HubGoLiveChecklist;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface CreateHubRequest {
    name: string;
    cityId: UUID;
    address: string;
    latitude: number;
    longitude: number;
    managerName: string;
    managerPhone: PhoneNumber;
    pincodesCovered: string[];
    sameDayCutoffTime: string;
    nextDayCutoffTime: string;
}

export interface UpdateHubRequest extends Partial<CreateHubRequest> {
    hubId: HubId;
}

export interface RoutingContext {
    orderId: UUID;
    cityId: UUID;
    hubId: HubId;
    skuIds: UUID[];
    quantity: number;
    deliveryMode: DeliveryMode;
    requestedAt: ISODateString;
}

export interface VendorAssignmentCandidate {
    vendorId: UUID;
    priorityScore: number;
    availableCapacity: number;
    supportsAllSKUs: boolean;
    withinCutoffWindow: boolean;
    rejectionRateOk: boolean;
    estimatedCompletionAt: ISODateString;
}

export interface RoutingDecision {
    orderId: UUID;
    selectedVendorId: UUID;
    candidates: VendorAssignmentCandidate[];
    deliveryMode: DeliveryMode;
    autoFallbackApplied: boolean;
    fallbackReason?: "cutoff_passed" | "capacity_full" | "all_vendors_unavailable";
    decidedAt: ISODateString;
}

export interface CapacityCheckResult {
    hubId: HubId;
    deliveryMode: DeliveryMode;
    isCapacityAvailable: boolean;
    availableVendorCount: number;
    totalSlots: number;
    usedSlots: number;
    sameDaySafe: boolean;
    checkedAt: ISODateString;
}

export interface HubAutoDefenceEvent {
    id: UUID;
    hubId: HubId;
    trigger: "sla_risk" | "low_vendor_count" | "cutoff_approaching";
    action: "disable_same_day" | "pause_hub";
    reason: string;
    triggeredAt: ISODateString;
    resolvedAt?: ISODateString;
    resolvedBy?: UUID;
}
