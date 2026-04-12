import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { Card } from '../components/Card';
import { Banknote, RefreshCw, ArrowLeftRight, CheckCircle, XCircle } from 'lucide-react';
import './ListPage.css';

export const FinanceList: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'payouts' | 'refunds'>('payouts');
    const [batches, setBatches] = useState<any[]>([]);
    const [refunds, setRefunds] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'payouts') {
                const res = await apiFetch<any>('/api/admin/payouts/batches');
                setBatches(res.data.items || res.data || []);
            } else {
                const res = await apiFetch<any>('/api/admin/refunds');
                setRefunds(res.data.items || res.data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [activeTab]);

    const handleReviewRefund = async (id: string, action: 'APPROVE' | 'REJECT') => {
        try {
            await apiFetch(`/api/admin/refunds/${id}/review`, {
                method: 'POST',
                body: JSON.stringify({ action, reason: 'Reviewed by Admin' })
            });
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const formatAmount = (paisa: number) => `₹${(paisa / 100).toLocaleString('en-IN')}`;

    if (isLoading && (batches.length === 0 && refunds.length === 0)) {
        return <div className="loading-container">Loading financials...</div>;
    }

    return (
        <div className="admin-page">
            <header className="page-header">
                <div className="header-left">
                    <h1 className="page-title">Financial Ledger & Settlements</h1>
                    <p className="page-subtitle">Manage vendor payouts and customer refund approvals</p>
                </div>
                <div className="header-right">
                    <button className="refresh-btn" onClick={fetchData}>
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                </div>
            </header>

            <div className="tab-control mb-6">
                <button 
                    className={`tab-btn ${activeTab === 'payouts' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('payouts')}
                >
                    <Banknote size={16} />
                    <span>Settlement Batches</span>
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'refunds' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('refunds')}
                >
                    <ArrowLeftRight size={16} />
                    <span>Refund Requests</span>
                </button>
            </div>

            {activeTab === 'payouts' ? (
                <Card className="card p-0 overflow-hidden">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Batch Ref</th>
                                <th>Gross Amount</th>
                                <th>Platform Fee</th>
                                <th>Net Payout</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches.map((b) => (
                                <tr key={b.id}>
                                    <td><span className="mono-text">{b.batchReference || b.batch_reference || '—'}</span></td>
                                    <td>{formatAmount(b.grossAmount || b.gross_amount || 0)}</td>
                                    <td>{formatAmount(b.totalPlatformFee || b.total_platform_fee || 0)}</td>
                                    <td><strong>{formatAmount(b.netAmount || b.net_amount || 0)}</strong></td>
                                    <td>
                                        <span className={`status-pill ${(b.status || '').toLowerCase()}`}>
                                            {b.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td>{new Date(b.createdAt || b.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            ) : (
                <Card className="card p-0 overflow-hidden">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Customer / Order</th>
                                <th>Amount</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refunds.map((r) => (
                                <tr key={r.id}>
                                    <td>
                                        <strong>{r.user_name || 'Customer'}</strong>
                                        <div className="text-muted-sm">Order #{r.order_number}</div>
                                    </td>
                                    <td><strong className="text-error">{formatAmount(r.amount_paisa)}</strong></td>
                                    <td>{r.reason || 'General Refund'}</td>
                                    <td>
                                        <span className={`status-pill ${(r.status || '').toLowerCase()}`}>
                                            {r.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td>
                                        {r.status === 'PENDING' && (
                                            <div className="action-group">
                                                <button 
                                                    className="icon-btn text-success" 
                                                    onClick={() => handleReviewRefund(r.id, 'APPROVE')}
                                                    title="Approve Refund"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button 
                                                    className="icon-btn text-error ml-2" 
                                                    onClick={() => handleReviewRefund(r.id, 'REJECT')}
                                                    title="Reject Refund"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {refunds.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-muted">No pending refund requests</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    );
};
