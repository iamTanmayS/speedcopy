export type UUID = string;
export type ISODateString = string; // ISO 8601 e.g. "2024-11-01T12:00:00Z"
export type PhoneNumber = string;   // E.164 format e.g. "+919876543210"
export type PaisaAmount = number;   // All money stored in paise (₹1 = 100 paise)
export type City = string;
export type HubId = UUID;
export type DeliveryMode = "same_day" | "next_day";

export type UserRole =
    | "customer"
    | "vendor"
    | "delivery_partner"
    | "admin";

export type ErrorCode =
    | "AUTH_INVALID_CREDENTIALS"
    | "AUTH_UNAUTHORIZED"
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "ORDER_NOT_EDITABLE"
    | "INTERNAL_SERVER_ERROR";

export interface ApiSuccess<T> {
    success: true;
    data: T;
    message?: string;
}

export interface ApiError {
    success: false;
    error: {
        code: ErrorCode;
        message: string;
    };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface Address {
    id: UUID;
    recipientName: string;
    phone: PhoneNumber;
    line1: string;
    line2?: string;
    city: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
}
