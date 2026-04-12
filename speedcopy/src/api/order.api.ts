import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import type { Order, OrderStatus } from '../types/order';

export interface OrderStatusEvent {
    id: string;
    orderId: string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    note: string | null;
    timestamp: string;
}

export interface OrderDetailExtended extends Order {
    history: OrderStatusEvent[];
}

export interface CreateOrderRequest {
    items: any[];
    deliveryAddress: any;
    subtotal: number;
    deliveryFee: number;
    discountAmount: number;
    totalAmount: number;
}

export const useOrderDetailsQuery = (orderId: string) => {
    return useQuery({
        queryKey: ['orderDetail', orderId],
        queryFn: async (): Promise<OrderDetailExtended> => {
            const response = await apiClient.get(`/api/orders/${orderId}`);
            return response.data.data;
        },
        enabled: !!orderId,
        // Poll every 30s so vendor status updates appear without manual refresh
        refetchInterval: 30_000,
        // Always refetch when the screen comes into focus
        refetchOnWindowFocus: true,
    });
};

export const useMyOrdersQuery = () => {
    return useQuery({
        queryKey: ['myOrders'],
        queryFn: async () => {
            const response = await apiClient.get('/api/orders');
            return response.data.data;
        },
    });
};

export const useCreateOrderMutation = () => {
    return useMutation({
        mutationFn: async (orderData: CreateOrderRequest) => {
            const response = await apiClient.post('/api/orders', orderData);
            return response.data;
        },
    });
};
