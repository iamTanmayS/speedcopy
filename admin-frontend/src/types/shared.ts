export type UUID = string;
export type ISODateString = string;
export type PhoneNumber = string;
export type PaisaAmount = number;
export type Percentage = number;
export type City = string;
export type HubId = UUID;
export type DeliveryMode = 'same_day' | 'next_day';

export type UserRole =
    | 'customer'
    | 'vendor'
    | 'delivery_partner'
    | 'support_ops'
    | 'sub_admin'
    | 'admin'
    | 'super_admin';

export type ErrorCode =
    | 'AUTH_INVALID_PHONE'
    | 'AUTH_OTP_EXPIRED'
    | 'AUTH_OTP_INVALID'
    | 'AUTH_OTP_MAX_ATTEMPTS'
    | 'AUTH_TOKEN_EXPIRED'
    | 'AUTH_TOKEN_INVALID'
    | 'AUTH_REFRESH_TOKEN_INVALID'
    | 'AUTH_UNAUTHORIZED'
    | 'AUTH_FORBIDDEN'
    | 'AUTH_INVALID_CREDENTIALS'
    | 'VALIDATION_ERROR'
    | 'VALIDATION_MISSING_FIELD'
    | 'PROFILE_NOT_FOUND'
    | 'CITY_NOT_SUPPORTED'
    | 'CITY_NOT_LIVE'
    | 'CATEGORY_NOT_FOUND'
    | 'PRODUCT_NOT_FOUND'
    | 'SKU_NOT_FOUND'
    | 'SKU_NOT_AVAILABLE_IN_CITY'
    | 'PRODUCT_INACTIVE'
    | 'FILE_NOT_FOUND'
    | 'FILE_UPLOAD_FAILED'
    | 'FILE_DPI_TOO_LOW'
    | 'FILE_QC_NOT_APPROVED'
    | 'FILE_TYPE_UNSUPPORTED'
    | 'FILE_SIZE_EXCEEDED'
    | 'CART_NOT_FOUND'
    | 'CART_EXPIRED'
    | 'CART_EMPTY'
    | 'ORDER_NOT_FOUND'
    | 'ORDER_EDIT_WINDOW_CLOSED'
    | 'ORDER_CANCEL_REQUIRES_ADMIN'
    | 'ORDER_INVALID_STATUS_TRANSITION'
    | 'ORDER_ALREADY_CANCELLED'
    | 'PAYMENT_FAILED'
    | 'PAYMENT_GATEWAY_ERROR'
    | 'COUPON_NOT_FOUND'
    | 'COUPON_EXPIRED'
    | 'COUPON_EXHAUSTED'
    | 'WALLET_INSUFFICIENT_BALANCE'
    | 'REFUND_NOT_ELIGIBLE'
    | 'REFUND_ALREADY_INITIATED'
    | 'REFUND_REQUIRES_ADMIN_APPROVAL'
    | 'VENDOR_NOT_FOUND'
    | 'VENDOR_LOCKED'
    | 'VENDOR_UNAVAILABLE'
    | 'HUB_NOT_FOUND'
    | 'HUB_PAUSED'
    | 'HUB_NOT_LIVE'
    | 'HUB_GO_LIVE_BLOCKED'
    | 'TICKET_NOT_FOUND'
    | 'ADMIN_KILL_SWITCH_CONFIRMATION_REQUIRED'
    | 'ADMIN_PERMISSION_DENIED'
    | 'NOT_FOUND'
    | 'ALREADY_EXISTS'
    | 'UNAUTHORIZED'
    | 'RATE_LIMITED'
    | 'INTERNAL_SERVER_ERROR'
    | 'SERVICE_UNAVAILABLE';

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
        details?: Record<string, string[]>;
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

export interface Address {
    id: UUID;
    customerId: UUID;
    label?: string;
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
