import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { apiFetch } from '../utils/api';
import type { ApiSuccess } from '../types/shared';
import { Box, AlertTriangle, CheckCircle, RefreshCcw, Search, ExternalLink } from 'lucide-react';

export const InventoryOversight: React.FC = () => {
    const [skus, setSkus] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchInventory = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        try {
            // Re-using catalog search or creating a specialized admin inventory endpoint
            // For now, using a general catalog fetch
            const res = await apiFetch<ApiSuccess<any[]>>('/api/catalog/products/search?q=');
            // Mocking some stock data if not present in the record yet
            setSkus(res.data.map(p => ({
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

    if (isLoading) return <div className="loading-container">Scanning supply chain...</div>;

    const outOfStock = skus.filter(s => s.stockStatus === 'OUT_OF_STOCK').length;
    const lowStock = skus.filter(s => s.stockStatus === 'LOW_STOCK').length;

    return (
        <div className="admin-page">
            <header className="page-header">
                <div className="header-left">
                    <h1 className="page-title">Inventory & Stock Oversight</h1>
                    <p className="page-subtitle">Monitor product availability across all regions and vendors</p>
                </div>
                <div className="header-right">
                    <button className="refresh-btn" onClick={() => fetchInventory(true)}>
                        <RefreshCcw size={16} className={isRefreshing ? 'spinning' : ''} />
                        <span>Refresh Supply</span>
                    </button>
                </div>
            </header>

            <div className="stats-grid mb-8">
                <Card className="stat-card">
                    <div className="stat-icon-wrapper red"><AlertTriangle size={20} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Out of Stock</p>
                        <h3 className="stat-value">{outOfStock}</h3>
                        <p className="stat-sub text-error">Critical impact on orders</p>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-icon-wrapper orange"><Box size={20} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Low Stock Alarms</p>
                        <h3 className="stat-value">{lowStock}</h3>
                        <p className="stat-sub text-warning">Restock recommended</p>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-icon-wrapper green"><CheckCircle size={20} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Healthy Supply</p>
                        <h3 className="stat-value">{skus.length - outOfStock - lowStock}</h3>
                    </div>
                </Card>
            </div>

            <Card className="inventory-card card">
                <div className="card-controls mb-4">
                    <div className="search-bar w-full max-w-md">
                        <Search size={16} />
                        <input type="text" placeholder="Filter by product name or vendor..." />
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Product / SKU</th>
                            <th>Vendor</th>
                            <th>Stock Level</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {skus.map((s) => (
                            <tr key={s.id}>
                                <td>
                                    <div className="product-info-cell">
                                        <div className="product-thumb-sm">
                                            {s.image_url ? <img src={s.image_url} alt="" /> : <Box size={16} />}
                                        </div>
                                        <div>
                                            <strong>{s.name}</strong>
                                            <div className="text-muted-sm">{s.category_name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{s.vendor_name || 'SpeedCopy Central'}</td>
                                <td>
                                    <div className="stock-level-cell">
                                        <strong>{s.quantity} units</strong>
                                        <div className="stock-meter">
                                            <div 
                                                className={`stock-meter-fill ${s.stockStatus.toLowerCase()}`} 
                                                style={{ width: `${Math.min(100, (s.quantity / 50) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-pill ${s.stockStatus.toLowerCase()}`}>
                                        {s.stockStatus.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td>
                                    <button className="icon-btn" title="View Details">
                                        <ExternalLink size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
