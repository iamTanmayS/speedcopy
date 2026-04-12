import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import type { ApiSuccess } from '../types/shared';
import { Tag, Plus, RefreshCcw, Calendar, Users, X, Check, Percent, Hash } from 'lucide-react';
import './AdminModules.css';

interface CreateCouponForm {
    code: string;
    description: string;
    discount_type: 'PERCENT' | 'FLAT';
    discount_value: number;
    min_order_value: number;
    max_discount_amount: number;
    usage_limit: number;
    expires_at: string;
}

const defaultForm: CreateCouponForm = {
    code: '',
    description: '',
    discount_type: 'PERCENT',
    discount_value: 10,
    min_order_value: 0,
    max_discount_amount: 0,
    usage_limit: 0,
    expires_at: '',
};

export const CouponList: React.FC = () => {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<CreateCouponForm>(defaultForm);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const fetchCoupons = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        try {
            const res = await apiFetch<ApiSuccess<any[]>>('/api/admin/coupons');
            setCoupons(res.data ?? []);
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

    const handleCreate = async () => {
        if (!form.code.trim()) { setCreateError('Coupon code is required'); return; }
        setIsCreating(true);
        setCreateError(null);
        try {
            await apiFetch('/api/admin/coupons', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    discount_value: Number(form.discount_value),
                    min_order_value: Number(form.min_order_value) * 100,
                    max_discount_amount: Number(form.max_discount_amount) * 100,
                    usage_limit: Number(form.usage_limit) || null,
                    expires_at: form.expires_at || null,
                })
            });
            setShowModal(false);
            setForm(defaultForm);
            fetchCoupons(true);
        } catch (err: any) {
            setCreateError(err.message || 'Failed to create coupon');
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) return <div className="module-loading"><div className="module-spinner" /><span>Loading coupons...</span></div>;

    const activeCoupons = coupons.filter(c => c.is_active).length;
    const totalRedemptions = coupons.reduce((acc, c) => acc + (c.current_usage || 0), 0);

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Coupons &amp; Campaigns</h1>
                    <p>Manage platform-wide promotions and growth incentives</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={() => fetchCoupons(true)} disabled={isRefreshing}>
                        <RefreshCcw size={15} className={isRefreshing ? 'spinning' : ''} />
                        Refresh
                    </button>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={16} />
                        Create Coupon
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-mini">
                    <div className="stat-mini-icon blue"><Tag size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Active Coupons</div>
                        <div className="stat-mini-value">{activeCoupons}</div>
                    </div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-icon green"><Users size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Total Redemptions</div>
                        <div className="stat-mini-value">{totalRedemptions}</div>
                    </div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-icon purple"><Hash size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Total Coupons</div>
                        <div className="stat-mini-value">{coupons.length}</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="module-table-wrapper">
                {coupons.length === 0 ? (
                    <div className="empty-state-card">
                        <Tag size={40} />
                        <h3>No coupons yet</h3>
                        <p>Create your first coupon to start offering promotions to customers.</p>
                    </div>
                ) : (
                    <table className="module-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Usage</th>
                                <th>Expiry</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((c) => (
                                <tr key={c.id}>
                                    <td>
                                        <div className="coupon-code-tag">{c.code}</div>
                                        {c.description && <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4 }}>{c.description}</div>}
                                    </td>
                                    <td>
                                        <strong style={{ color: 'var(--fg-default)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {c.discount_type === 'PERCENT'
                                                ? <><Percent size={13} />{c.discount_value}% off</>
                                                : <>₹{(c.discount_value / 100).toLocaleString('en-IN')} off</>
                                            }
                                        </strong>
                                        <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
                                            Min: ₹{(c.min_order_value / 100).toLocaleString('en-IN')}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: 120 }}>
                                            <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
                                                {c.current_usage || 0} / {c.usage_limit || '∞'}
                                            </span>
                                            <div className="usage-bar-track">
                                                <div
                                                    className="usage-bar-fill"
                                                    style={{ width: c.usage_limit ? `${Math.min(100, ((c.current_usage || 0) / c.usage_limit) * 100)}%` : '0%' }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--fg-muted)' }}>
                                            <Calendar size={12} />
                                            {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : 'Never'}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`pill ${c.is_active ? 'pill-green' : 'pill-gray'}`}>
                                            {c.is_active ? 'Active' : 'Paused'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`btn-icon ${c.is_active ? '' : ''}`}
                                            onClick={() => toggleStatus(c)}
                                            title={c.is_active ? 'Deactivate' : 'Activate'}
                                            style={{ color: c.is_active ? 'var(--red-500)' : 'var(--green-500)' }}
                                        >
                                            {c.is_active ? <X size={16} /> : <Check size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Coupon Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3>Create New Coupon</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {createError && (
                                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                                    {createError}
                                </div>
                            )}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Coupon Code *</label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g. SAVE20"
                                        value={form.code}
                                        onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Discount Type</label>
                                    <select className="form-select" value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as any }))}>
                                        <option value="PERCENT">Percentage (%)</option>
                                        <option value="FLAT">Flat Amount (₹)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Discount Value</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        min={1}
                                        value={form.discount_value}
                                        onChange={e => setForm(f => ({ ...f, discount_value: +e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Min. Order (₹)</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        min={0}
                                        value={form.min_order_value}
                                        onChange={e => setForm(f => ({ ...f, min_order_value: +e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Usage Limit (0 = unlimited)</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        min={0}
                                        value={form.usage_limit}
                                        onChange={e => setForm(f => ({ ...f, usage_limit: +e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Expires At</label>
                                    <input
                                        className="form-input"
                                        type="date"
                                        value={form.expires_at}
                                        onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description (optional)</label>
                                <input
                                    className="form-input"
                                    placeholder="Short description for internal reference"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-refresh" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleCreate} disabled={isCreating}>
                                {isCreating ? 'Creating...' : 'Create Coupon'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
