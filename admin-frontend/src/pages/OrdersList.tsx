import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { DataTable, type Column } from '../components/DataTable';
import { Button } from '../components/Button';
import { ShoppingCart, RefreshCw } from 'lucide-react';
import './ListPage.css';

interface Order {
    id: string;
    order_number?: string;
    orderNumber?: string;
    status: string;
    delivery_mode?: string;
    deliveryMode?: string;
    total_amount?: number;
    totalAmount?: number;
    created_at?: string;
    createdAt?: string;
}

export const OrdersList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch<any>('/api/admin/orders');
            setOrders(res.data.items || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch ((status || '').toUpperCase()) {
            case 'DELIVERED': return 'badge-success';
            case 'CANCELLED': return 'badge-error';
            case 'CREATED':
            case 'PENDING': return 'badge-neutral';
            default: return 'badge-warning';
        }
    };

    const formatAmount = (amount: number | undefined) => {
        if (amount === undefined || amount === null) return '—';
        const rupees = amount / 100;
        return `₹${rupees.toLocaleString('en-IN')}`;
    };

    const columns: Column<Order>[] = [
        {
            header: 'Order #',
            accessor: (o) => (
                <span className="order-id">#{o.orderNumber || o.order_number || o.id.slice(0, 8).toUpperCase()}</span>
            )
        },
        { header: 'Amount', accessor: (o) => formatAmount(o.totalAmount ?? o.total_amount) },
        { header: 'Mode', accessor: (o) => <span className="badge badge-neutral">{o.deliveryMode || o.delivery_mode || '—'}</span> },
        { header: 'Date', accessor: (o) => {
            const d = o.createdAt || o.created_at;
            return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        }},
        {
            header: 'Status',
            accessor: (o) => (
                <span className={`badge ${getStatusBadge(o.status)}`}>
                    {o.status || '—'}
                </span>
            )
        }
    ];

    return (
        <div className="list-page">
            <div className="list-page-header">
                <div className="list-page-title">
                    <div className="list-page-icon blue">
                        <ShoppingCart size={20} />
                    </div>
                    <div>
                        <h3>Orders</h3>
                        <p className="list-page-subtitle">{orders.length} orders loaded</p>
                    </div>
                </div>
                <div className="list-page-actions">
                    <Button variant="secondary" onClick={fetchOrders}>
                        <RefreshCw size={14} />
                        <span style={{ marginLeft: 6 }}>Refresh</span>
                    </Button>
                </div>
            </div>
            <DataTable data={orders} columns={columns} isLoading={isLoading} />
        </div>
    );
};
