import {
    UUID,
    PhoneNumber,
    ISODateString,
    PaisaAmount,
    City,
    UserRole
} from "./shared";

export type Permission =
    | "manage_categories"
    | "manage_vendors"
    | "manage_pricing"
    | "manage_coupons"
    | "manage_orders"
    | "manage_refunds"
    | "manage_users"
    | "manage_hubs"
    | "manage_delivery_partners"
    | "view_financials"
    | "view_reports"
    | "export_reports"
    | "manage_sub_admins"
    | "manage_templates"
    | "manage_banners"
    | "city_kill_switch"
    | "feature_kill_switch"
    | "emergency_actions"
    | "override_sla"
    | "view_audit_logs"
    | "manage_vendor_payouts";

export interface DeviceMeta {
    deviceId: string;
    platform: "android" | "ios" | "web";
    osVersion: string;
    appVersion: string;
    fcmToken?: string;
}

export interface LoginRequest {
    phone: PhoneNumber;
}

export interface LoginResponse {
    message: string;
    otpExpiresAt: ISODateString;
}

export interface OTPVerifyRequest {
    phone: PhoneNumber;
    otp: string;
    deviceId: string;
    deviceMeta: DeviceMeta;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: ISODateString;
}

export type OnboardingStep =
    | "city_selection"
    | "profile_setup"
    | "completed";

export interface AuthenticatedUser {
    id: UUID;
    phone: PhoneNumber;
    role: UserRole;
    name?: string;
    email?: string;
    profileComplete: boolean;
    cityId?: UUID;
    onboardingStep?: OnboardingStep;
}

export interface OTPVerifyResponse {
    tokens: AuthTokens;
    user: AuthenticatedUser;
    isNewUser: boolean;
    onboardingRequired: boolean;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    tokens: AuthTokens;
}

export interface LogoutRequest {
    refreshToken: string;
}

export interface Session {
    sessionId: UUID;
    userId: UUID;
    role: UserRole;
    deviceId: string;
    deviceMeta: DeviceMeta;
    createdAt: ISODateString;
    lastActiveAt: ISODateString;
    expiresAt: ISODateString;
    isActive: boolean;
}

export interface OnboardingStatusResponse {
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];
}

export interface SelectCityRequest {
    cityId: UUID;
}

export interface SelectCityResponse {
    cityId: UUID;
    cityName: string;
    isLive: boolean;
    sameDayEnabled: boolean;
    nextStep: OnboardingStep;
}

export interface CompleteProfileRequest {
    name: string;
    email?: string;
}

export interface UpdateProfileRequest {
    name: string;
    email?: string;
    profilePhotoUrl?: string;
}

export interface NotificationPreferences {
    whatsapp: boolean;
    push: boolean;
    email: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    referralUpdates: boolean;
}

export interface UpdateNotificationPreferencesRequest {
    whatsapp: boolean;
    push: boolean;
    email: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    referralUpdates: boolean;
}

export interface CustomerProfile {
    id: UUID;
    phone: PhoneNumber;
    name: string;
    email?: string;
    profilePhotoUrl?: string;
    cityId?: UUID;
    city?: City;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    isActive: boolean;
    isFlagged: boolean;
    flagReason?: string;
    walletBalance: PaisaAmount;
    totalOrders: number;
    referralCode: string;
    referredBy?: UUID;
    notificationPreferences: NotificationPreferences;
}
