import { UUID, ISODateString } from "./shared";
import { ErrorCode } from "./shared";

export type NetworkStatus = "online" | "offline" | "slow_3g";
export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
    id: UUID;
    type: ToastType;
    title: string;
    message?: string;
    durationMs?: number;
    action?: { label: string; onPress: () => void };
}

export type ModalId =
    | "city_selection"
    | "qc_warning"
    | "low_dpi_warning"
    | "coupon_picker"
    | "address_picker"
    | "cancel_order_confirm"
    | "refund_confirm"
    | "logout_confirm"
    | "kill_switch_confirm";

export interface ModalState {
    activeModal: ModalId | null;
    modalProps?: Record<string, unknown>;
}

export interface NetworkState {
    status: NetworkStatus;
    lastCheckedAt: ISODateString;
}

export interface ScreenState<T> {
    data: T | null;
    isLoading: boolean;
    isRefreshing: boolean;
    error: ErrorCode | null;
    lastFetchedAt?: ISODateString;
}
