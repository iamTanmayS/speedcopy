import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { apiFetch } from '../utils/api';
import type { ApiSuccess } from '../types/shared';
import { Tag, Plus, RefreshCcw, Calendar, Users, X, Check } from 'lucide-react';

export const CouponList: React.FC = () => {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchCoupons = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        try {
            const res = await apiFetch<ApiSuccess<any[]>>('/api/admin/coupons');
            setCoupons(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const toggleStatus = async (coupon: any) => {
        try {
            await apiFetch(`/api/admin/coupons/${coupon.id}/toggle`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: !coupon.is_active })
            });
            fetchCoupons(true);
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) return <div className="loading-container">Loading campaigns...</div>;

    return (
        <div className="admin-page">
            <header className="page-header">
                <div className="header-left">
                    <h1 className="page-title">Coupons & Campaigns</h1>
                    <p className="page-subtitle">Manage platform-wide promotions and growth incentives</p>
                </div>
                <div className="header-right">
                    <button className="refresh-btn" onClick={() => fetchCoupons(true)}>
                        <RefreshCcw size={16} className={isRefreshing ? 'spinning' : ''} />
                        <span>Refresh</span>
                    </button>
                    <button className="sc-button sc-button-primary ml-2">
                        <Plus size={16} />
                        <span className="ml-2">Create New Coupon</span>
                    </button>
                </div>
            </header>

            <div className="stats-grid mb-8">
                <Card className="stat-card">
                    <div className="stat-icon-wrapper blue"><Tag size={20} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Active Coupons</p>
                        <h3 className="stat-value">{coupons.filter(c => c.is_active).length}</h3>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-icon-wrapper green"><Users size={20} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Total Redemptions</p>
                        <h3 className="stat-value">{coupons.reduce((acc, c) => acc + (c.current_usage || 0), 0)}</h3>
                    </div>
                </Card>
            </div>

            <div className="coupon-grid card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Discount</th>
                            <th>Usage</th>
                            <th>Expiry</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((c) => (
                            <tr key={c.id}>
                                <td>
                                    <div className="coupon-code-badge">{c.code}</div>
                                    <div className="text-muted-sm mt-1">{c.description}</div>
                                </td>
                                <td>
                                    <strong>{c.discount_type === 'PERCENT' ? `${c.discount_value}%` : `₹${c.discount_value / 100}`}</strong>
                                    <div className="text-muted-sm">Min: ₹{c.min_order_value / 100}</div>
                                </td>
                                <td>
                                    <div className="usage-stat">
                                        <span>{c.current_usage || 0} / {c.usage_limit || '∞'}</span>
                                        <div className="usage-bar-bg">
                                            <div 
                                                className="usage-bar-fill" 
                                                style={{ width: c.usage_limit ? `${(c.current_usage || 0) / c.usage_limit * 100}%` : '0%' }} 
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="date-item">
                                        <Calendar size={12} />
                                        <span>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-pill ${c.is_active ? 'active' : 'inactive'}`}>
                                        {c.is_active ? 'Active' : 'Paused'}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        className={`icon-btn ${c.is_active ? 'text-error' : 'text-success'}`}
                                        onClick={() => toggleStatus(c)}
                                        title={c.is_active ? 'Deactivate' : 'Activate'}
                                    >
                                        {c.is_active ? <X size={18} /> : <Check size={18} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
