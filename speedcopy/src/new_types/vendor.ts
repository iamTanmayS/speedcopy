import {
    UUID,
    PhoneNumber,
    Address,
    ISODateString,
    HubId
} from "./shared";
import { OrderStatus } from "./order";

export interface VendorProfile {
    id: UUID;
    businessName: string;
    ownerName: string;
    phone: PhoneNumber;
    address: Omit<Address, "id" | "customerId">;
    hubId: HubId;
    isActive: boolean;
    isAvailable: boolean; // toggle for receiving orders
    createdAt: ISODateString;
}

export interface VendorOrderQueueItem {
    orderId: UUID;
    orderNumber: string;
    status: OrderStatus;
    items: Array<{
        productName: string;
        skuName: string;
        quantity: number;
    }>;
    assignedAt: ISODateString;
}

export interface VendorDashboardSummary {
    vendorId: UUID;
    todayAssigned: number;
    todayCompleted: number;
    pendingAcceptanceOrders: VendorOrderQueueItem[];
    inProductionOrders: VendorOrderQueueItem[];
}

export interface VendorOrderAction {
    orderId: UUID;
    action: "accept" | "reject";
}

export interface VendorOrderStatusUpdate {
    orderId: UUID;
    status: "IN_PRODUCTION" | "READY_FOR_PICKUP";
}
