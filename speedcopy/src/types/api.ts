import { ISODateString, UUID, UserRole, DeliveryMode, SupportedChannel, PaisaAmount } from "./shared";
import { OrderStatus } from "./order";
import { TicketStatus, TicketPriority, TicketCategory } from "./support";
import { VendorPayoutStatus } from "./finance";
import { ReferralStatus, ReferralSourceType } from "./referral";
import { AbuseType, AbuseFlag, NotificationLog } from "./system";
import { BasePaginationParams } from "./shared";
import { VendorOnboardingStatus } from "./vendor";

export interface OrderListRequest extends BasePaginationParams {
    status?: OrderStatus | OrderStatus[];
    customerId?: UUID;
    vendorId?: UUID;
    hubId?: UUID;
    cityId?: UUID;
    deliveryMode?: DeliveryMode;
    dateFrom?: ISODateString;
    dateTo?: ISODateString;
    isDisputed?: boolean;
    isSLABreached?: boolean;
}

export interface CustomerListRequest extends BasePaginationParams {
    search?: string;
    cityId?: UUID;
    isActive?: boolean;
    isFlagged?: boolean;
    dateFrom?: ISODateString;
    dateTo?: ISODateString;
}

export interface VendorListRequest extends BasePaginationParams {
    search?: string;
    hubId?: UUID;
    cityId?: UUID;
    isActive?: boolean;
    isAvailable?: boolean;
    isLocked?: boolean;
    gstVerified?: boolean;
    onboardingStatus?: VendorOnboardingStatus;
}

export interface TicketListRequest extends BasePaginationParams {
    status?: TicketStatus | TicketStatus[];
    priority?: TicketPriority;
    category?: TicketCategory;
    assignedTo?: UUID;
    raisedByRole?: UserRole;
    orderId?: UUID;
    vendorId?: UUID;
    slaBreached?: boolean;
    dateFrom?: ISODateString;
    dateTo?: ISODateString;
}

export interface PayoutListRequest extends BasePaginationParams {
    vendorId?: UUID;
    hubId?: UUID;
    cityId?: UUID;
    status?: VendorPayoutStatus;
    settlementCycle?: string;
    dateFrom?: ISODateString;
    dateTo?: ISODateString;
}

export interface AuditLogListRequest extends BasePaginationParams {
    adminId?: UUID;
    action?: string;
    entityType?: string;
    entityId?: UUID;
    dateFrom?: ISODateString;
    dateTo?: ISODateString;
}

export interface ReferralListRequest extends BasePaginationParams {
    referrerId?: UUID;
    refereeId?: UUID;
    status?: ReferralStatus;
    sourceType?: ReferralSourceType;
    isFraudFlagged?: boolean;
    dateFrom?: ISODateString;
    dateTo?: ISODateString;
}

export interface NotificationLogListRequest extends BasePaginationParams {
    recipient?: UUID;
    channel?: SupportedChannel;
    deliveryStatus?: NotificationLog["deliveryStatus"];
    trigger?: string;
    dateFrom?: ISODateString;
    dateTo?: ISODateString;
}

export interface AbuseFlagListRequest extends BasePaginationParams {
    entityType?: AbuseFlag["entityType"];
    abuseType?: AbuseType;
    severity?: AbuseFlag["severity"];
    autoFlagged?: boolean;
    dismissed?: boolean;
    dateFrom?: ISODateString;
    dateTo?: ISODateString;
}
