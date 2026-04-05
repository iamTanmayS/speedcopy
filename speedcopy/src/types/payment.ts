import {
    UUID,
    ISODateString,
    PaisaAmount,
    Percentage
} from "./shared";

export type PaymentGateway = "razorpay" | "cashfree" | "payu";
export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet_external";
export type PaymentStatus = "pending" | "processing" | "success" | "failed" | "refunded" | "partially_refunded";

export interface GSTDetails {
    customerGSTIN?: string;
    vendorGSTIN: string;
    placeOfSupply: string;
    isIGST: boolean;
}

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: PaisaAmount;
    totalPrice: PaisaAmount;
    hsnCode: string;
    taxPercent: Percentage;
    taxAmount: PaisaAmount;
}

export interface Invoice {
    id: UUID;
    invoiceNumber: string;
    orderId: UUID;
    customerId: UUID;
    invoiceUrl: string;     // PDF URL
    issuedAt: ISODateString;
    gstDetails: GSTDetails;
    lineItems: InvoiceLineItem[];
    subtotal: PaisaAmount;
    taxTotal: PaisaAmount;
    grandTotal: PaisaAmount;
}

export interface InitiatePaymentRequest {
    checkoutId: UUID;
    paymentMethod: PaymentMethod;
}

export interface InitiatePaymentResponse {
    paymentId: UUID;
    gateway: PaymentGateway;
    gatewayOrderId: string;
    gatewayKey: string;
    amount: PaisaAmount;
    currency: "INR";
    expiresAt: ISODateString;
}

export interface PaymentVerifyRequest {
    paymentId: UUID;
    gatewayPaymentId: string;
    gatewaySignature: string;
}

export interface PaymentVerifyResponse {
    success: boolean;
    orderId?: UUID;
    message?: string;
}

export interface Payment {
    id: UUID;
    checkoutId: UUID;
    orderId?: UUID;
    customerId: UUID;
    gateway: PaymentGateway;
    gatewayPaymentId?: string;
    gatewayOrderId: string;
    method: PaymentMethod;
    amount: PaisaAmount;
    currency: "INR";
    status: PaymentStatus;
    failureReason?: string;
    initiatedAt: ISODateString;
    completedAt?: ISODateString;
    refundedAt?: ISODateString;
    refundAmount?: PaisaAmount;
    invoice?: Invoice;
}
