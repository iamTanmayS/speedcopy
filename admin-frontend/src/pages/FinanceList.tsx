import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { Banknote, RefreshCw, ArrowLeftRight, CheckCircle, XCircle, TrendingUp, Clock, Package } from 'lucide-react';
import './AdminModules.css';

export const FinanceList: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'payouts' | 'refunds'>('payouts');
    const [batches, setBatches] = useState<any[]>([]);
    const [refunds, setRefunds] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        try {
            if (activeTab === 'payouts') {
                const res = await apiFetch<any>('/api/admin/payouts/batches');
                setBatches(res.data?.items || res.data || []);
            } else {
                const res = await apiFetch<any>('/api/admin/refunds');
                setRefunds(res.data?.items || res.data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, [activeTab]);

    const handleReviewRefund = async (id: string, action: 'APPROVE' | 'REJECT') => {
        try {
            await apiFetch(`/api/admin/refunds/${id}/review`, {
                method: 'POST',
                body: JSON.stringify({ action, reason: 'Reviewed by Admin' })
            });
            fetchData(true);
        } catch (e) {
            console.error(e);
        }
    };

    const formatAmount = (paisa: number) =>
        `₹${((paisa || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const pendingRefunds = refunds.filter(r => r.status === 'PENDING').length;

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Financial Ledger &amp; Settlements</h1>
                    <p>Manage vendor payouts and customer refund approvals</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={() => fetchData(true)} disabled={isRefreshing}>
                        <RefreshCw size={15} className={isRefreshing ? 'spinning' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="stats-row">
                <div className="stat-mini">
                    <div className="stat-mini-icon blue"><Banknote size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Payout Batches</div>
                        <div className="stat-mini-value">{batches.length}</div>
                    </div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-icon green"><TrendingUp size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Total Settled</div>
                        <div className="stat-mini-value" style={{ fontSize: 18 }}>
                            {formatAmount(batches.filter(b => b.status === 'COMPLETED').reduce((a, b) => a + (b.netAmount || b.net_amount || 0), 0))}
                        </div>
                    </div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-icon red"><Clock size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Pending Refunds</div>
                        <div className="stat-mini-value">{pendingRefunds}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--border-light)', marginBottom: 20, paddingBottom: 0 }}>
                <button
                    onClick={() => setActiveTab('payouts')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '10px 20px', border: 'none', background: 'transparent',
                        color: activeTab === 'payouts' ? 'var(--accent)' : 'var(--fg-muted)',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer',
                        fontFamily: 'var(--font-sans)', borderBottom: activeTab === 'payouts' ? '2px solid var(--accent)' : '2px solid transparent',
                        marginBottom: -2, transition: 'all 0.15s'
                    }}
                >
                    <Banknote size={15} />
                    Settlement Batches
                </button>
                <button
                    onClick={() => setActiveTab('refunds')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '10px 20px', border: 'none', background: 'transparent',
                        color: activeTab === 'refunds' ? 'var(--accent)' : 'var(--fg-muted)',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer',
                        fontFamily: 'var(--font-sans)', borderBottom: activeTab === 'refunds' ? '2px solid var(--accent)' : '2px solid transparent',
                        marginBottom: -2, transition: 'all 0.15s',
                        position: 'relative'
                    }}
                >
                    <ArrowLeftRight size={15} />
                    Refund Requests
                    {pendingRefunds > 0 && (
                        <span style={{
                            position: 'absolute', top: 6, right: 6,
                            width: 16, height: 16, borderRadius: '50%',
                            background: 'var(--red-500)', color: '#fff',
                            fontSize: 9, fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {pendingRefunds}
                        </span>
                    )}
                </button>
            </div>

            {isLoading ? (
                <div className="module-loading">
                    <div className="module-spinner" />
                    <span>Loading {activeTab === 'payouts' ? 'payout batches' : 'refund requests'}...</span>
                </div>
            ) : activeTab === 'payouts' ? (
                <div className="module-table-wrapper">
                    {batches.length === 0 ? (
                        <div className="empty-state-card">
                            <Package size={40} />
                            <h3>No settlement batches</h3>
                            <p>Settlement batches will appear here once vendor payouts are created.</p>
                        </div>
                    ) : (
                        <table className="module-table">
                            <thead>
                                <tr>
                                    <th>Batch Reference</th>
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
                                        <td>
                                            <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                                                {b.batchReference || b.batch_reference || '—'}
                                            </span>
                                        </td>
                                        <td>{formatAmount(b.grossAmount || b.gross_amount || 0)}</td>
                                        <td style={{ color: 'var(--red-500)' }}>
                                            -{formatAmount(b.totalPlatformFee || b.total_platform_fee || 0)}
                                        </td>
                                        <td>
                                            <strong style={{ color: 'var(--green-500)' }}>
                                                {formatAmount(b.netAmount || b.net_amount || 0)}
                                            </strong>
                                        </td>
                                        <td>
                                            <span className={`pill ${
                                                b.status === 'COMPLETED' ? 'pill-green' :
                                                b.status === 'PROCESSING' ? 'pill-blue' :
                                                b.status === 'FAILED' ? 'pill-red' :
                                                'pill-yellow'
                                            }`}>
                                                {b.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                                            {new Date(b.createdAt || b.created_at).toLocaleDateString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div className="module-table-wrapper">
                    {refunds.length === 0 ? (
                        <div className="empty-state-card">
                            <CheckCircle size={40} />
                            <h3>All clear!</h3>
                            <p>No refund requests to review at this time.</p>
                        </div>
                    ) : (
                        <table className="module-table">
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
                                            <div style={{ fontWeight: 600, color: 'var(--fg-default)', fontSize: 13 }}>
                                                {r.user_name || 'Customer'}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
                                                Order #{r.order_number}
                                            </div>
                                        </td>
                                        <td>
                                            <strong style={{ color: 'var(--red-500)' }}>
                                                {formatAmount(r.amount_paisa)}
                                            </strong>
                                        </td>
                                        <td style={{ color: 'var(--fg-secondary)', fontSize: 13, maxWidth: 200 }}>
                                            {r.reason || 'General Refund'}
                                        </td>
                                        <td>
                                            <span className={`pill ${
                                                r.status === 'APPROVED' ? 'pill-green' :
                                                r.status === 'REJECTED' ? 'pill-red' :
                                                'pill-yellow'
                                            }`}>
                                                {r.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td>
                                            {r.status === 'PENDING' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <button
                                                        className="btn-success-sm"
                                                        onClick={() => handleReviewRefund(r.id, 'APPROVE')}
                                                        title="Approve Refund"
                                                    >
                                                        <CheckCircle size={14} /> Approve
                                                    </button>
                                                    <button
                                                        className="btn-danger-sm"
                                                        onClick={() => handleReviewRefund(r.id, 'REJECT')}
                                                        title="Reject Refund"
                                                    >
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};
