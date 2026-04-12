import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { apiFetch } from '../utils/api';
import type { SLAPolicy } from '../types/admin';
import type { ApiSuccess } from '../types/shared';
import { Clock, AlertTriangle, CheckCircle, Settings, RefreshCcw } from 'lucide-react';

export const SLAList: React.FC = () => {
    const [policies, setPolicies] = useState<SLAPolicy[]>([]);
    const [atRiskOrders, setAtRiskOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        
        try {
            const [policiesRes, riskRes] = await Promise.all([
                apiFetch<ApiSuccess<SLAPolicy[]>>('/api/admin/sla/policies'),
                apiFetch<ApiSuccess<any[]>>('/api/admin/sla/at-risk')
            ]);
            setPolicies(policiesRes.data);
            setAtRiskOrders(riskRes.data);
        } catch (err) {
            console.error("SLA data fetch error:", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) return <div className="loading-container">Loading SLA metrics...</div>;

    return (
        <div className="admin-page">
            <header className="page-header">
                <div className="header-left">
                    <h1 className="page-title">SLA & Risk Monitoring</h1>
                    <p className="page-subtitle">Track delivery compliance and intervene on at-risk orders</p>
                </div>
                <div className="header-right">
                    <button className="refresh-btn" onClick={() => fetchData(true)} disabled={isRefreshing}>
                        <RefreshCcw size={16} className={isRefreshing ? 'spinning' : ''} />
                        <span>Refresh</span>
                    </button>
                    <button className="sc-button sc-button-secondary ml-2">
                        <Settings size={16} />
                        <span className="ml-2">Configure Policies</span>
                    </button>
                </div>
            </header>

            <div className="dashboard-sections">
                <section className="risk-section">
                    <div className="section-header">
                        <h2 className="section-title">Critical & At-Risk Orders</h2>
                        <span className="badge badge-error">{atRiskOrders.length} Urgent</span>
                    </div>

                    {atRiskOrders.length === 0 ? (
                        <div className="empty-state">
                            <CheckCircle size={48} className="text-success" />
                            <h3>All clear!</h3>
                            <p>No orders are currently breaching SLA thresholds.</p>
                        </div>
                    ) : (
                        <div className="risk-grid">
                            {atRiskOrders.map((order: any) => (
                                <Card key={order.id} className="risk-card">
                                    <div className="risk-level" data-severity={order.severity} />
                                    <div className="risk-card-content">
                                        <div className="risk-card-header">
                                            <span className="order-num">#{order.order_number}</span>
                                            <span className={`severity-tag ${order.severity}`}>{order.severity.toUpperCase()}</span>
                                        </div>
                                        <h4 className="violation-reason">{order.violation_type.replace(/_/g, ' ')}</h4>
                                        <div className="risk-details">
                                            <div className="detail-item">
                                                <Clock size={12} />
                                                <span>Breached {new Date(order.breached_at).toLocaleTimeString()}</span>
                                            </div>
                                            <div className="detail-item">
                                                <AlertTriangle size={12} />
                                                <span>{order.policy_name || 'Standard Policy'}</span>
                                            </div>
                                        </div>
                                        <button className="sc-button sc-button-primary sc-button-sm mt-4 w-full">
                                            Intervene Now
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                <section className="policy-section mt-8">
                    <div className="section-header">
                        <h2 className="section-title">Established SLA Policies</h2>
                    </div>
                    <div className="policy-table-wrapper card">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Policy Name</th>
                                    <th>Category</th>
                                    <th>Mode</th>
                                    <th>Acceptance</th>
                                    <th>Production</th>
                                    <th>Delivery</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {policies.map((policy: SLAPolicy) => (
                                    <tr key={policy.id}>
                                        <td><strong>{policy.name}</strong></td>
                                        <td>{policy.category.toUpperCase()}</td>
                                        <td>{policy.deliveryMode.replace(/_/g, ' ')}</td>
                                        <td>{policy.acceptanceWindowMins}m</td>
                                        <td>{policy.productionWindowMins}m</td>
                                        <td>{policy.deliveryWindowMins}m</td>
                                        <td>
                                            <span className={`status-pill ${policy.isActive ? 'active' : 'inactive'}`}>
                                                {policy.isActive ? 'Active' : 'Paused'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="icon-btn hover:text-accent">
                                                <Settings size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};
