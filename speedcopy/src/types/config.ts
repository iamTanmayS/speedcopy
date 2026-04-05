import { ISODateString, UUID, UserRole } from "./shared";

export type FeatureKey =
    | "same_day_delivery"
    | "wallet_payments"
    | "referral_program"
    | "design_templates"
    | "saved_designs"
    | "in_app_chat_support"
    | "vendor_self_onboarding"
    | "data_export"
    | "promo_banners";

export interface FeatureFlag {
    key: FeatureKey;
    isEnabled: boolean;
    enabledForCities?: UUID[];
    enabledForRoles?: UserRole[];
    killedAt?: ISODateString;
    killedBy?: UUID;
    killedReason?: string;
}

export interface AppConfig {
    features: FeatureFlag[];
    minimumAppVersion: string;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
    supportPhone: string;
    supportWhatsApp: string;
}

export interface AppConfigResponse {
    config: AppConfig;
    fetchedAt: ISODateString;
}

export interface UpdateFeatureFlagRequest {
    key: FeatureKey;
    isEnabled: boolean;
    enabledForCities?: UUID[];
    enabledForRoles?: UserRole[];
    reason: string;
}
