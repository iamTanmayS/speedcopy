import { UUID, ISODateString, UserRole, Percentage } from "./shared";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed" | "reopened";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory =
    | "order_issue"
    | "payment_issue"
    | "file_upload"
    | "vendor_complaint"
    | "delivery_issue"
    | "referral_wallet"
    | "other";

export interface TicketMessage {
    id: UUID;
    ticketId: UUID;
    senderId: UUID;
    senderRole: UserRole;
    content: string;
    attachmentUrls: string[];
    isInternalNote: boolean;
    createdAt: ISODateString;
}

export interface SupportTicket {
    id: UUID;
    ticketNumber: string;
    customerId: UUID;
    orderId?: UUID;
    vendorId?: UUID;
    category: TicketCategory;
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    assignedTo?: UUID;       // Support Ops / Admin ID
    escalatedTo?: UUID;      // Auto-escalation handling
    messages: TicketMessage[];
    slaDeadline: ISODateString;
    slaBreached: boolean;
    reopenedCount: number;
    tags: string[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
    resolvedAt?: ISODateString;
    closedAt?: ISODateString;
}

export interface CreateTicketRequest {
    category: TicketCategory;
    subject: string;
    description: string;
    orderId?: UUID;
    attachmentUrls?: string[];
}

export interface ReplyToTicketRequest {
    ticketId: UUID;
    content: string;
    attachmentUrls?: string[];
    isInternalNote?: boolean;
}

export interface AssignTicketRequest {
    ticketId: UUID;
    agentId: UUID;
}

export interface BulkAssignTicketsRequest {
    ticketIds: UUID[];
    agentId: UUID;
}

export interface EscalateTicketRequest {
    ticketId: UUID;
    reason: string;
}

export interface ResolveTicketRequest {
    ticketId: UUID;
    resolutionNote: string;
}

export interface AgentSummary {
    agentId: UUID;
    agentName: string;
    openTickets: number;
    resolvedToday: number;
    avgResolutionTimeMinutes: number;
    slaBreachCount: number;
    csatScore: number; // out of 5
}

export interface SupportOpsDashboard {
    unassignedTickets: number;
    openTickets: number;
    urgentTickets: number;
    slaBreachedTickets: number;
    myActiveTickets: number;
    agentSummaries: AgentSummary[];
    topCategories: Array<{ category: TicketCategory; count: number }>;
    generatedAt: ISODateString;
}
