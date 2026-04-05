import {
    UUID,
    ISODateString,
    PaisaAmount,
    Address,
    HubId
} from "./shared";
import { CustomerProfile } from "./auth";
import { Product, SKU } from "./catalog";
import { UploadedFile } from "./upload";
import { VendorProfile } from "./vendor";

export type OrderStatus =
    | "CREATED"
    | "AWAITING_VENDOR_ACCEPTANCE"
    | "ACCEPTED"
    | "IN_PRODUCTION"
    | "READY_FOR_PICKUP"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

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
    unitPrice: PaisaAmount;
    totalPrice: PaisaAmount;
}

export interface Order {
    id: UUID;
    orderNumber: string;
    customerId: UUID;
    customer?: CustomerProfile;
    items: OrderItem[];
    status: OrderStatus;

    // Assignment
    hubId?: HubId;
    vendorId?: UUID;
    vendor?: VendorProfile;

    // Delivery
    deliveryAddress: Address;

    // Financials
    totalAmount: PaisaAmount;

    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface OrderListResponse {
    orders: Order[];
    total: number;
}
