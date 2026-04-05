export type UUID = string;
export type ISODateString = string; // ISO 8601 e.g. "2024-11-01T12:00:00Z"
export type PhoneNumber = string;   // E.164 format e.g. "+919876543210"
export type PaisaAmount = number;   // All money stored in paise (₹1 = 100 paise)
export type DPI = number;
export type Percentage = number;    // 0–100

export type City = string;
export type HubId = UUID;

export type SupportedChannel = "whatsapp" | "push" | "telegram";

export type DeliveryBadge = "same-day" | "next-day";

export type MediaType = "image/jpeg" | "image/png" | "application/pdf" | "image/webp";

export type UserRole =
    | "customer"
    | "vendor"
    | "delivery_partner"
    | "support_ops"
    | "sub_admin"
    | "admin"
    | "super_admin";

export type ErrorCode =
    // Auth
    | "AUTH_INVALID_PHONE"
    | "AUTH_OTP_EXPIRED"
    | "AUTH_OTP_INVALID"
    | "AUTH_OTP_MAX_ATTEMPTS"
    | "AUTH_TOKEN_EXPIRED"
    | "AUTH_TOKEN_INVALID"
    | "AUTH_REFRESH_TOKEN_INVALID"
    | "AUTH_UNAUTHORIZED"
    | "AUTH_FORBIDDEN"
    // Validation
    | "VALIDATION_ERROR"
    | "VALIDATION_MISSING_FIELD"
    // Profile / Onboarding
    | "PROFILE_NOT_FOUND"
    | "CITY_NOT_SUPPORTED"
    | "CITY_NOT_LIVE"
    // Catalog
    | "CATEGORY_NOT_FOUND"
    | "PRODUCT_NOT_FOUND"
    | "SKU_NOT_FOUND"
    | "SKU_NOT_AVAILABLE_IN_CITY"
    | "PRODUCT_INACTIVE"
    // File / QC
    | "FILE_NOT_FOUND"
    | "FILE_UPLOAD_FAILED"
    | "FILE_DPI_TOO_LOW"
    | "FILE_QC_NOT_APPROVED"
    | "FILE_APPROVAL_TOKEN_INVALID"
    | "FILE_APPROVAL_TOKEN_EXPIRED"
    | "FILE_TYPE_UNSUPPORTED"
    | "FILE_SIZE_EXCEEDED"
    // Cart
    | "CART_NOT_FOUND"
    | "CART_EXPIRED"
    | "CART_EMPTY"
    | "CART_ITEM_NOT_FOUND"
    | "CART_QC_REQUIRED"
    // Checkout
    | "CHECKOUT_SESSION_EXPIRED"
    | "CHECKOUT_DELIVERY_UNAVAILABLE"
    | "CHECKOUT_CUTOFF_PASSED"
    | "CHECKOUT_HUB_PAUSED"
    | "CHECKOUT_CITY_KILLED"
    | "CHECKOUT_ADDRESS_REQUIRED"
    // Payment
    | "PAYMENT_FAILED"
    | "PAYMENT_ALREADY_COMPLETED"
    | "PAYMENT_GATEWAY_ERROR"
    | "PAYMENT_SIGNATURE_INVALID"
    | "PAYMENT_AMOUNT_MISMATCH"
    // Coupon
    | "COUPON_NOT_FOUND"
    | "COUPON_EXPIRED"
    | "COUPON_EXHAUSTED"
    | "COUPON_NOT_APPLICABLE"
    | "COUPON_MIN_ORDER_NOT_MET"
    | "COUPON_USER_LIMIT_REACHED"
    // Wallet
    | "WALLET_INSUFFICIENT_BALANCE"
    | "WALLET_AMOUNT_EXCEEDS_PAYABLE"
    // Order
    | "ORDER_NOT_FOUND"
    | "ORDER_EDIT_WINDOW_CLOSED"
    | "ORDER_CANCEL_REQUIRES_ADMIN"
    | "ORDER_INVALID_STATUS_TRANSITION"
    | "ORDER_ALREADY_CANCELLED"
    // Refund
    | "REFUND_NOT_ELIGIBLE"
    | "REFUND_ALREADY_INITIATED"
    | "REFUND_REQUIRES_ADMIN_APPROVAL"
    // Vendor
    | "VENDOR_NOT_FOUND"
    | "VENDOR_LOCKED"
    | "VENDOR_UNAVAILABLE"
    | "VENDOR_CAPACITY_FULL"
    | "VENDOR_NO_ELIGIBLE_FOUND"
    // Hub / Routing
    | "HUB_NOT_FOUND"
    | "HUB_PAUSED"
    | "HUB_NOT_LIVE"
    | "HUB_GO_LIVE_BLOCKED"
    // Ticket
    | "TICKET_NOT_FOUND"
    | "TICKET_ALREADY_CLOSED"
    // Admin
    | "ADMIN_KILL_SWITCH_CONFIRMATION_REQUIRED"
    | "ADMIN_PERMISSION_DENIED"
    // System
    | "RATE_LIMITED"
    | "INTERNAL_SERVER_ERROR"
    | "SERVICE_UNAVAILABLE"
    | "UPSTREAM_TIMEOUT";

export interface ApiSuccess<T> {
    success: true;
    data: T;
    message?: string;
    timestamp: ISODateString;
    requestId: UUID;
}

export interface ApiError {
    success: false;
    error: {
        code: ErrorCode;
        message: string;
        details?: Record<string, string[]>; // field-level validation errors
    };
    timestamp: ISODateString;
    requestId: UUID;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface BasePaginationParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface Address {
    id: UUID;
    customerId: UUID;
    label?: string; // "Home", "Office"
    recipientName: string;
    phone: PhoneNumber;
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    cityId: UUID;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    isDefault: boolean;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface AddAddressRequest {
    label?: string;
    recipientName: string;
    phone: PhoneNumber;
    line1: string;
    line2?: string;
    landmark?: string;
    cityId: UUID;
    pincode: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<AddAddressRequest> {
    addressId: UUID;
}

export interface AddressListResponse {
    addresses: Address[];
}

export type DeliveryMode = "same_day" | "next_day";

export interface DeliverySlot {
    id: UUID;
    hubId: HubId;
    mode: DeliveryMode;
    cutoffTime: string;  // "HH:MM" 24h
    label: string;       // "Today by 8 PM"
    isAvailable: boolean;
    unavailableReason?: "cutoff_passed" | "capacity_full" | "hub_paused" | "city_kill";
}

export interface DeliveryOptionsRequest {
    pincodeOrCityId: string;
    skuIds: UUID[];
}

export interface DeliveryOptionsResponse {
    availableModes: DeliverySlot[];
    coverageAvailable: boolean;
    unavailableReason?: string;
}
