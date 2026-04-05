import { UUID, ISODateString, PaisaAmount } from "./shared";
import { CustomerProfile } from "./auth";

export type ReferralStatus =
    | "pending"     // code applied, waiting for first order
    | "completed"   // first order delivered, reward granted
    | "expired"     // didn't order within validity
    | "fraud_flagged"; // blocked by anti-abuse

export type ReferralSourceType = "whatsapp" | "link_copy" | "sms" | "organic";

export interface ReferralConfig {
    referrerReward: PaisaAmount;
    refereeRewardAmount: PaisaAmount;
    refereeRewardType: "wallet_credit" | "discount_coupon";
    minOrderValue: PaisaAmount;
    validityDays: number;
    maxReferralsPerUser: number;
    isActive: boolean;
}

export interface ReferralCodeInfo {
    code: string;
    referrerId: UUID;
    referrerName: string;
}

export interface ReferralRecord {
    id: UUID;
    referrerId: UUID;
    referrer?: CustomerProfile;
    refereeId: UUID;
    referee?: CustomerProfile;
    codeUsed: string;
    source: ReferralSourceType;
    status: ReferralStatus;
    qualifyingOrderId?: UUID;
    referrerRewardAmount: PaisaAmount;
    refereeRewardAmount: PaisaAmount;
    isFraudFlagged: boolean;
    fraudReason?: string;
    expiresAt: ISODateString;
    createdAt: ISODateString;
    completedAt?: ISODateString;
}

export interface VerifyReferralRequest {
    code: string;
}

export interface VerifyReferralResponse {
    isValid: boolean;
    message?: string;
    referrerName?: string;
    rewardDetails?: {
        amount: PaisaAmount;
        type: "wallet_credit" | "discount_coupon";
    };
}
