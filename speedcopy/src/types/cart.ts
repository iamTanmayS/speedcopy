import {
    UUID,
    ISODateString,
    PaisaAmount,
    Percentage,
    DeliveryMode,
    Address,
    DeliverySlot
} from "./shared";
import { Product, SKU } from "./catalog";
import { UploadedFile, EditorState } from "./upload";

export interface CouponUsageRecord {
    id: UUID;
    couponId: UUID;
    customerId: UUID;
    orderId: UUID;
    discountApplied: PaisaAmount;
    usedAt: ISODateString;
}

export type CouponType = "flat" | "percent" | "wallet_credit" | "free_delivery";
export type CouponScope = "all" | "category" | "product" | "sku" | "first_order";
export type CouponStatus = "active" | "exhausted" | "expired" | "disabled";

export type CouponBehaviorTrigger =
    | "abandoned_checkout"
    | "payment_failure"
    | "inactivity_7d"
    | "inactivity_30d"
    | "order_cancelled"
    | "post_refund";

export interface Coupon {
    id: UUID;
    code: string;
    type: CouponType;
    discountValue: PaisaAmount | Percentage;
    maxDiscountAmount?: PaisaAmount;  // cap for percent type
    minOrderValue: PaisaAmount;
    scope: CouponScope;
    scopeIds?: UUID[];                // categoryIds, productIds etc.
    isUserSpecific: boolean;
    targetUserIds?: UUID[];
    behaviorTrigger?: CouponBehaviorTrigger;
    usageLimitTotal: number;
    usageLimitPerUser: number;
    usedCount: number;
    validFrom: ISODateString;
    validUntil: ISODateString;
    status: CouponStatus;
    createdBy: UUID;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface CreateCouponRequest {
    code: string;
    type: CouponType;
    discountValue: PaisaAmount | Percentage;
    maxDiscountAmount?: PaisaAmount;
    minOrderValue: PaisaAmount;
    scope: CouponScope;
    scopeIds?: UUID[];
    isUserSpecific: boolean;
    targetUserIds?: UUID[];
    behaviorTrigger?: CouponBehaviorTrigger;
    usageLimitTotal: number;
    usageLimitPerUser: number;
    validFrom: ISODateString;
    validUntil: ISODateString;
}

export interface CartItem {
    id: UUID;
    cartId: UUID;
    productId: UUID;
    product?: Product;
    skuId: UUID;
    sku?: SKU;
    quantity: number;
    fileId?: UUID;
    uploadedFile?: UploadedFile;
    qcApprovalToken?: string;
    editorState?: EditorState;
    customizationNotes?: string;
    configSelections?: Record<string, string>; // Maps option keys to option value IDs
    unitPrice: PaisaAmount;
    totalPrice: PaisaAmount;
    deliveryMode: DeliveryMode;
    addedAt: ISODateString;
    updatedAt: ISODateString;
}

export interface Cart {
    id: UUID;
    customerId: UUID;
    items: CartItem[];
    subtotal: PaisaAmount;
    deliveryFee: PaisaAmount;
    discountAmount: PaisaAmount;
    taxAmount: PaisaAmount;
    totalAmount: PaisaAmount;
    appliedCouponId?: UUID;
    appliedCoupon?: Coupon;
    walletApplied: PaisaAmount;
    status: "active" | "checked_out" | "abandoned" | "expired";
    createdAt: ISODateString;
    updatedAt: ISODateString;
    expiresAt: ISODateString;
}

export interface AddToCartRequest {
    productId: UUID;
    skuId: UUID;
    quantity: number;
    fileId?: UUID;
    qcApprovalToken?: string;
    editorState?: EditorState;
    customizationNotes?: string;
    deliveryMode: DeliveryMode;
}

export interface UpdateCartItemRequest {
    cartItemId: UUID;
    quantity?: number;
    deliveryMode?: DeliveryMode;
    fileId?: UUID;
    qcApprovalToken?: string;
}

export interface RemoveCartItemRequest {
    cartItemId: UUID;
}

export interface ApplyCouponRequest {
    couponCode: string;
}

export interface ApplyCouponResponse {
    success: boolean;
    coupon?: Coupon;
    discountAmount?: PaisaAmount;
    message?: string;
}

export interface ApplyWalletRequest {
    amount: PaisaAmount;
}

export interface TaxBreakdown {
    cgst: PaisaAmount;
    sgst: PaisaAmount;
    igst: PaisaAmount;
    total: PaisaAmount;
    gstPercent: Percentage;
}

export interface CheckoutSummary {
    cartId: UUID;
    items: CartItem[];
    addressId: UUID;
    address: Address;
    deliverySlotId: UUID;
    deliverySlot: DeliverySlot;
    subtotal: PaisaAmount;
    deliveryFee: PaisaAmount;
    discountAmount: PaisaAmount;
    walletApplied: PaisaAmount;
    taxBreakdown: TaxBreakdown;
    totalPayable: PaisaAmount;
    estimatedDelivery: ISODateString;
    gstNumber?: string;
}

export interface InitiateCheckoutRequest {
    cartId: UUID;
    addressId: UUID;
    deliverySlotId: UUID;
}

export interface InitiateCheckoutResponse {
    checkoutId: UUID;
    summary: CheckoutSummary;
    paymentRequired: PaisaAmount;
    expiresAt: ISODateString; // checkout session expiry
}
