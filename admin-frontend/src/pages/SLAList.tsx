import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import type { SLAPolicy } from '../types/admin';
import type { ApiSuccess } from '../types/shared';
import { Clock, AlertTriangle, CheckCircle, Settings, RefreshCcw, Shield } from 'lucide-react';
import './AdminModules.css';

export const SLAList: React.FC = () => {
    const [policies, setPolicies] = useState<SLAPolicy[]>([]);
    const [atRiskOrders, setAtRiskOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        setError(null);

        try {
            const [policiesRes, riskRes] = await Promise.all([
                apiFetch<ApiSuccess<SLAPolicy[]>>('/api/admin/sla/policies'),
                apiFetch<ApiSuccess<any[]>>('/api/admin/sla/at-risk')
            ]);
            setPolicies(policiesRes.data ?? []);
            setAtRiskOrders(riskRes.data ?? []);
        } catch (err: any) {
            setError(err.message || 'Failed to load SLA data');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const getSeverityPill = (sev: string) => {
        const map: Record<string, string> = { high: 'pill-red', medium: 'pill-yellow', low: 'pill-green' };
        return map[sev?.toLowerCase()] ?? 'pill-gray';
    };

    if (isLoading) return (
        <div className="module-loading">
            <div className="module-spinner" />
            <span>Loading SLA metrics...</span>
        </div>
    );

    if (error) return (
        <div className="module-loading">
            <AlertTriangle size={32} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>{error}</span>
            <button className="btn-refresh" onClick={() => fetchData()}>Retry</button>
        </div>
    );

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>SLA & Risk Monitoring</h1>
                    <p>Track delivery compliance and intervene on at-risk orders in real time</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={() => fetchData(true)} disabled={isRefreshing}>
                        <RefreshCcw size={15} className={isRefreshing ? 'spinning' : ''} />
                        Sync
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-mini">
                    <div className="stat-mini-icon red"><AlertTriangle size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Active Violations</div>
                        <div className="stat-mini-value">{atRiskOrders.length}</div>
                    </div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-icon blue"><Shield size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">SLA Policies</div>
                        <div className="stat-mini-value">{policies.length}</div>
                    </div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-icon green"><CheckCircle size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Active Policies</div>
                        <div className="stat-mini-value">{policies.filter(p => p.isActive).length}</div>
                    </div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-icon orange"><Clock size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Critical (High)</div>
                        <div className="stat-mini-value">{atRiskOrders.filter(o => o.severity === 'high').length}</div>
                    </div>
                </div>
            </div>

            <div className="sla-grid">
                {/* Left: At-Risk Orders */}
                <div className="sla-section-card">
                    <div className="sla-section-header">
                        <h2>Active Violations</h2>
                        <span className={`pill ${atRiskOrders.length > 0 ? 'pill-red' : 'pill-green'}`}>
                            {atRiskOrders.length} {atRiskOrders.length === 1 ? 'issue' : 'issues'}
                        </span>
                    </div>
                    {atRiskOrders.length === 0 ? (
                        <div className="sla-ok-box">
                            <CheckCircle size={40} />
                            <strong style={{ color: 'var(--fg-default)' }}>All clear!</strong>
                            <p>No orders are currently breaching SLA thresholds.</p>
                        </div>
                    ) : (
                        atRiskOrders.map((order: any) => (
                            <div key={order.id} className="sla-violation-item">
                                <div className={`sla-severity-bar ${order.severity}`} />
                                <div className="sla-violation-body">
                                    <div className="sla-violation-order">
                                        #{order.order_number}
                                        <span className={`pill ${getSeverityPill(order.severity)} ml-2`} style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                                            {order.severity?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="sla-violation-type">{(order.violation_type || '').replace(/_/g, ' ')}</div>
                                    <div className="sla-violation-time">
                                        <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                                        Breached: {order.breached_at ? new Date(order.breached_at).toLocaleString() : '—'}
                                    </div>
                                </div>
                                <button className="sla-intervene-btn">Intervene</button>
                            </div>
                        ))
                    )}
                </div>

                {/* Right: Policy Table */}
                <div className="sla-section-card">
                    <div className="sla-section-header">
                        <h2>SLA Policies</h2>
                        <span className="pill pill-blue">{policies.length} total</span>
                    </div>
                    {policies.length === 0 ? (
                        <div className="sla-ok-box">
                            <Settings size={36} />
                            <strong style={{ color: 'var(--fg-default)' }}>No policies configured</strong>
                            <p>Run the database migration to seed default SLA policies.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="module-table">
                                <thead>
                                    <tr>
                                        <th>Policy</th>
                                        <th>Mode</th>
                                        <th>Accept</th>
                                        <th>Produce</th>
                                        <th>Deliver</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {policies.map((p: SLAPolicy) => (
                                        <tr key={p.id}>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'var(--fg-default)', fontSize: 13 }}>{p.name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{p.category}</div>
                                            </td>
                                            <td style={{ textTransform: 'capitalize' }}>{(p.deliveryMode || '').replace(/_/g, ' ')}</td>
                                            <td>{p.acceptanceWindowMins}m</td>
                                            <td>{p.productionWindowMins}m</td>
                                            <td>{p.deliveryWindowMins}m</td>
                                            <td>
                                                <span className={`pill ${p.isActive ? 'pill-green' : 'pill-gray'}`}>
                                                    {p.isActive ? 'Active' : 'Off'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
