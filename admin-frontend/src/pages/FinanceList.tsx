import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { DataTable, type Column } from '../components/DataTable';
import { Button } from '../components/Button';
import { Banknote, RefreshCw } from 'lucide-react';
import './ListPage.css';

interface Batch {
    id: string;
    batch_reference?: string;
    batchReference?: string;
    gross_amount?: number;
    grossAmount?: number;
    total_platform_fee?: number;
    totalPlatformFee?: number;
    net_amount?: number;
    netAmount?: number;
    status: string;
    created_at?: string;
    createdAt?: string;
}

export const FinanceList: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { fetchBatches(); }, []);

    const fetchBatches = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch<any>('/api/admin/payouts/batches');
            setBatches(res.data.items || res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch ((status || '').toLowerCase()) {
            case 'paid': return 'badge-success';
            case 'failed': return 'badge-error';
            default: return 'badge-warning';
        }
    };

    const formatAmount = (paisa: number | undefined) => {
        if (paisa === undefined || paisa === null || isNaN(Number(paisa))) return '—';
        return `₹${(Number(paisa) / 100).toLocaleString('en-IN')}`;
    };

    const columns: Column<Batch>[] = [
        { header: 'Batch Ref', accessor: (b) => <span className="mono-text">{b.batchReference || b.batch_reference || '—'}</span> },
        { header: 'Gross', accessor: (b) => formatAmount(b.grossAmount ?? b.gross_amount) },
        { header: 'Platform Fee', accessor: (b) => formatAmount(b.totalPlatformFee ?? b.total_platform_fee) },
        { header: 'Net Payout', accessor: (b) => <strong>{formatAmount(b.netAmount ?? b.net_amount)}</strong> },
        { header: 'Created', accessor: (b) => {
            const d = b.createdAt || b.created_at;
            return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        }},
        {
            header: 'Status',
            accessor: (b) => (
                <span className={`badge ${getStatusBadge(b.status)}`}>
                    {b.status || '—'}
                </span>
            )
        }
    ];

    return (
        <div className="list-page">
            <div className="list-page-header">
                <div className="list-page-title">
                    <div className="list-page-icon green">
                        <Banknote size={20} />
                    </div>
                    <div>
                        <h3>Settlement Batches</h3>
                        <p className="list-page-subtitle">Vendor payout settlement records</p>
                    </div>
                </div>
                <div className="list-page-actions">
                    <Button variant="secondary" onClick={fetchBatches}>
                        <RefreshCw size={14} />
                        <span style={{ marginLeft: 6 }}>Refresh</span>
                    </Button>
                </div>
            </div>
            <DataTable data={batches} columns={columns} isLoading={isLoading} />
        </div>
    );
};
