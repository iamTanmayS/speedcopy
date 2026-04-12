import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import type { ApiSuccess } from '../types/shared';
import { Box, AlertTriangle, CheckCircle, RefreshCcw, Search, TrendingDown, Package } from 'lucide-react';
import './AdminModules.css';

export const InventoryOversight: React.FC = () => {
    const [skus, setSkus] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK'>('all');

    const fetchInventory = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        try {
            const res = await apiFetch<ApiSuccess<any[]>>('/api/catalog/products/search?q=');
            // Augment with stock simulation data since we don't have a dedicated inventory endpoint yet
            setSkus((res.data || []).map(p => ({
                ...p,
                stockStatus: Math.random() > 0.15 ? 'IN_STOCK' : (Math.random() > 0.5 ? 'LOW_STOCK' : 'OUT_OF_STOCK'),
                quantity: Math.floor(Math.random() * 50)
            })));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => { fetchInventory(); }, []);

    const outOfStock = skus.filter(s => s.stockStatus === 'OUT_OF_STOCK').length;
    const lowStock = skus.filter(s => s.stockStatus === 'LOW_STOCK').length;
    const inStock = skus.filter(s => s.stockStatus === 'IN_STOCK').length;

    const filteredSkus = skus.filter(s => {
        const matchSearch = !search ||
            s.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
            s.category_name?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || s.stockStatus === filter;
        return matchSearch && matchFilter;
    });

    if (isLoading) {
        return (
            <div className="module-loading">
                <div className="module-spinner" />
                <span>Scanning supply chain...</span>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Inventory &amp; Stock Oversight</h1>
                    <p>Monitor product availability across all regions and vendors</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={() => fetchInventory(true)} disabled={isRefreshing}>
                        <RefreshCcw size={15} className={isRefreshing ? 'spinning' : ''} />
                        Refresh Supply
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-mini" style={{ cursor: 'pointer', borderColor: filter === 'OUT_OF_STOCK' ? 'var(--red-500)' : undefined }}
                    onClick={() => setFilter(f => f === 'OUT_OF_STOCK' ? 'all' : 'OUT_OF_STOCK')}>
                    <div className="stat-mini-icon red"><AlertTriangle size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Out of Stock</div>
                        <div className="stat-mini-value">{outOfStock}</div>
                    </div>
                </div>
                <div className="stat-mini" style={{ cursor: 'pointer', borderColor: filter === 'LOW_STOCK' ? 'var(--yellow-500)' : undefined }}
                    onClick={() => setFilter(f => f === 'LOW_STOCK' ? 'all' : 'LOW_STOCK')}>
                    <div className="stat-mini-icon orange"><TrendingDown size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Low Stock Alerts</div>
                        <div className="stat-mini-value">{lowStock}</div>
                    </div>
                </div>
                <div className="stat-mini" style={{ cursor: 'pointer', borderColor: filter === 'IN_STOCK' ? 'var(--green-500)' : undefined }}
                    onClick={() => setFilter(f => f === 'IN_STOCK' ? 'all' : 'IN_STOCK')}>
                    <div className="stat-mini-icon green"><CheckCircle size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">In Stock</div>
                        <div className="stat-mini-value">{inStock}</div>
                    </div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-icon blue"><Package size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Total SKUs</div>
                        <div className="stat-mini-value">{skus.length}</div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 14px', borderRadius: 8,
                    background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                    flex: 1, maxWidth: 360
                }}>
                    <Search size={15} color="var(--fg-muted)" />
                    <input
                        type="text"
                        placeholder="Filter by product or vendor..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--fg-default)', fontFamily: 'var(--font-sans)', fontSize: 13, flex: 1 }}
                    />
                </div>
                {filter !== 'all' && (
                    <button className="btn-danger-sm" onClick={() => setFilter('all')}>
                        Clear Filter: {filter.replace(/_/g, ' ')}
                    </button>
                )}
            </div>

            {/* Inventory Table */}
            <div className="module-table-wrapper">
                {filteredSkus.length === 0 ? (
                    <div className="empty-state-card">
                        <Box size={40} />
                        <h3>{skus.length === 0 ? 'No products found' : 'No matching products'}</h3>
                        <p>{skus.length === 0 ? 'Products will appear here once catalog is configured.' : 'Try changing your search or filter.'}</p>
                    </div>
                ) : (
                    <table className="module-table">
                        <thead>
                            <tr>
                                <th>Product / SKU</th>
                                <th>Category</th>
                                <th>Vendor</th>
                                <th>Stock Level</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSkus.map((s) => (
                                <tr key={s.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 8,
                                                background: 'var(--bg-muted)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                overflow: 'hidden', flexShrink: 0
                                            }}>
                                                {s.image_url
                                                    ? <img src={s.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <Box size={16} color="var(--fg-muted)" />
                                                }
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--fg-default)', fontSize: 13 }}>{s.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{s.category_name || '—'}</td>
                                    <td style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>{s.vendor_name || 'SpeedCopy Central'}</td>
                                    <td>
                                        <div style={{ minWidth: 120 }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-default)' }}>
                                                {s.quantity} units
                                            </span>
                                            <div style={{ height: 4, background: 'var(--bg-muted)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${Math.min(100, (s.quantity / 50) * 100)}%`,
                                                    borderRadius: 2,
                                                    background: s.stockStatus === 'IN_STOCK' ? 'var(--green-500)'
                                                        : s.stockStatus === 'LOW_STOCK' ? 'var(--yellow-500)'
                                                        : 'var(--red-500)'
                                                }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`pill ${
                                            s.stockStatus === 'IN_STOCK' ? 'pill-green' :
                                            s.stockStatus === 'LOW_STOCK' ? 'pill-yellow' :
                                            'pill-red'
                                        }`}>
                                            {s.stockStatus.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
