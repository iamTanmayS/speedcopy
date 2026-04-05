import { UUID, PaisaAmount, ISODateString, Percentage } from "./shared";

export type LedgerEntryType =
    | "referral_credit"
    | "cashback_credit"
    | "admin_adjustment_credit"
    | "order_payment_debit"
    | "refund_credit"
    | "reversal"
    | "coupon_discount_debit"
    | "expiry_debit";

export interface WalletLedgerEntry {
    id: UUID;
    walletId: UUID;
    customerId: UUID;
    type: LedgerEntryType;
    amount: PaisaAmount;          // always positive; direction implied by type
    direction: "credit" | "debit";
    balanceAfter: PaisaAmount;
    referenceId?: UUID;           // orderId, referralId etc.
    referenceType?: string;
    description: string;
    createdAt: ISODateString;
    isImmutable: true;            // ledger entries NEVER edited
    reversalEntryId?: UUID;       // if reversed, points to new entry
}

export interface Wallet {
    id: UUID;
    customerId: UUID;
    balance: PaisaAmount;
    lifetimeCredit: PaisaAmount;
    lifetimeDebit: PaisaAmount;
    lastTransactionAt?: ISODateString;
    createdAt: ISODateString;
}

export interface WalletLedgerResponse {
    wallet: Wallet;
    entries: WalletLedgerEntry[];
    total: number;
    page: number;
    pageSize: number;
}

export type VendorPayoutStatus =
    | "pending"
    | "in_settlement"
    | "paid"
    | "on_hold"
    | "reversed";

export type SettlementCycle = "weekly" | "biweekly" | "monthly";

export interface VendorPayoutRecord {
    id: UUID;
    vendorId: UUID;
    orderId: UUID;
    orderNumber: string;
    orderAmount: PaisaAmount;
    platformFee: PaisaAmount;
    platformFeePercent: Percentage;
    tdsDeducted: PaisaAmount;
    netPayable: PaisaAmount;
    status: VendorPayoutStatus;
    holdReason?: string;
    settlementBatchId?: UUID;
    paidAt?: ISODateString;
    transactionReference?: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface VendorSettlementBatch {
    id: UUID;
    batchReference: string;
    cycle: SettlementCycle;
    periodFrom: ISODateString;
    periodTo: ISODateString;
    vendorId: UUID;
    payoutRecordIds: UUID[];
    grossAmount: PaisaAmount;
    totalPlatformFee: PaisaAmount;
    totalTDS: PaisaAmount;
    netAmount: PaisaAmount;
    status: "draft" | "approved" | "processing" | "paid" | "failed";
    approvedBy?: UUID;
    approvedAt?: ISODateString;
    processedAt?: ISODateString;
    failureReason?: string;
    bankAccountNumber?: string;
    bankIFSC?: string;
    transactionReference?: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface VendorPayoutSummary {
    vendorId: UUID;
    pendingAmount: PaisaAmount;
    lastPaidAmount: PaisaAmount;
    lastPaidAt?: ISODateString;
    totalLifetimePaid: PaisaAmount;
    onHoldAmount: PaisaAmount;
    nextSettlementDate?: ISODateString;
}

export interface AdminProcessPayoutRequest {
    batchId: UUID;
    transactionReference: string;
    processedAt: ISODateString;
    reason: string;
}
