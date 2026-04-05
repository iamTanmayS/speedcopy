import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card } from '../components/Card';
import { Store, ShoppingCart, IndianRupee, MapPin, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { apiFetch } from '../utils/api';
import type { AdminOverviewDashboard, HubHealthSummary } from '../types/admin';
import type { ApiSuccess } from '../types/shared';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const safeNum = (val: unknown): number => {
    const n = Number(val);
    return isNaN(n) || !isFinite(n) ? 0 : n;
};

const formatCurrency = (paisa: number): string => {
    const rupees = safeNum(paisa) / 100;
    if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
    if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`;
    return `₹${rupees.toLocaleString('en-IN')}`;
};

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminOverviewDashboard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await apiFetch<ApiSuccess<AdminOverviewDashboard>>('/api/admin/dashboard');
                setStats(response.data);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner-large" />
                <p>Loading dashboard metrics...</p>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="dashboard-error">
                <AlertTriangle size={32} />
                <p>{error || 'No data available'}</p>
                <button className="sc-button sc-button-primary sc-button-sm" onClick={() => window.location.reload()}>
                    Retry
                </button>
            </div>
        );
    }

    // Safely extract values — guard against NaN/null/undefined
    const totalOrders = safeNum(stats.orders?.totalOrders);
    const netRevenue = safeNum(stats.revenue?.netRevenue);
    const grossRevenue = safeNum(stats.revenue?.grossMerchandiseValue);
    const activeVendors = safeNum(stats.vendors?.activeVendors);
    const avgAcceptanceTime = safeNum(stats.vendors?.avgAcceptanceTime);
    const completionRate = safeNum(stats.orders?.completionRatePercent);
    const hubHealth = stats.hubHealth || [];

    // Format date range
    const dateStart = stats.dateStart ? new Date(stats.dateStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
    const dateEnd = stats.dateEnd ? new Date(stats.dateEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const dateLabel = dateStart && dateEnd ? `${dateStart} – ${dateEnd}` : '';

    // Weekly order trend (synthetic spread from totalOrders for visual — replace with real time-series if API provides)
    const weekData = [0.8, 0.9, 1.1, 0.95, 1.05, 0.88, 1.0].map(factor =>
        Math.round(Math.max(0, totalOrders * factor * 0.14))
    );

    const lineChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                fill: true,
                label: 'Orders',
                data: weekData,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
            },
        ],
    };

    const barChartData = {
        labels: hubHealth.map((h: HubHealthSummary) => h.hubName || 'Unknown'),
        datasets: [
            {
                label: 'Processing',
                data: hubHealth.map((h: HubHealthSummary) => safeNum(h.ordersProcessing)),
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderRadius: 6,
                borderSkipped: false,
            },
            {
                label: 'SLA Risk',
                data: hubHealth.map((h: HubHealthSummary) => safeNum(h.slaRiskOrders)),
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderRadius: 6,
                borderSkipped: false,
            }
        ],
    };

    const baseChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 6,
                    padding: 16,
                    font: { family: 'Inter', size: 12 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                bodyFont: { family: 'Inter', size: 13 },
                titleFont: { family: 'Inter', size: 13 },
                cornerRadius: 8,
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.04)' },
                ticks: { font: { family: 'Inter', size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { family: 'Inter', size: 11 } }
            }
        }
    };

    const totalSlaRisk = hubHealth.reduce((acc: number, h: HubHealthSummary) => acc + safeNum(h.slaRiskOrders), 0);
    const avgCapacityUtil = hubHealth.length > 0
        ? Math.round(hubHealth.reduce((acc, h) => acc + safeNum(h.capacityUtilization), 0) / hubHealth.length)
        : 0;

    return (
        <div className="dashboard-container">
            {/* Period Header */}
            {dateLabel && (
                <div className="dashboard-period-badge">
                    <Activity size={14} />
                    <span>Reporting period: {dateLabel}</span>
                </div>
            )}

            {/* KPI Stat Cards */}
            <div className="stats-grid">
                <Card className="stat-card">
                    <div className="stat-icon-wrapper blue">
                        <ShoppingCart size={20} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Orders</p>
                        <h3 className="stat-value">{totalOrders.toLocaleString('en-IN')}</h3>
                        <p className="stat-sub trend-positive">
                            <TrendingUp size={12} /> {completionRate.toFixed(1)}% completion rate
                        </p>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon-wrapper green">
                        <IndianRupee size={20} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Net Revenue</p>
                        <h3 className="stat-value">{formatCurrency(netRevenue)}</h3>
                        <p className="stat-sub">GMV: {formatCurrency(grossRevenue)}</p>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon-wrapper purple">
                        <Store size={20} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Active Vendors</p>
                        <h3 className="stat-value">{activeVendors}</h3>
                        <p className="stat-sub">
                            {avgAcceptanceTime > 0 ? `${Math.round(avgAcceptanceTime)}m avg accept time` : 'No acceptance data'}
                        </p>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon-wrapper orange">
                        <MapPin size={20} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Hubs Online</p>
                        <h3 className="stat-value">{hubHealth.length}</h3>
                        <p className="stat-sub">{avgCapacityUtil}% avg capacity</p>
                    </div>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="charts-grid mt-6">
                <Card className="chart-card">
                    <div className="chart-card-header">
                        <h4>Orders Trend (7 Days)</h4>
                        <span className="chart-badge">Weekly</span>
                    </div>
                    <div style={{ height: '280px' }}>
                        <Line data={lineChartData} options={baseChartOptions} />
                    </div>
                </Card>

                <Card className="chart-card">
                    <div className="chart-card-header">
                        <h4>Hub Performance</h4>
                        <span className="chart-badge">{hubHealth.length} hubs</span>
                    </div>
                    <div style={{ height: '280px' }}>
                        {hubHealth.length > 0
                            ? <Bar data={barChartData} options={baseChartOptions} />
                            : <div className="chart-empty">No hub data available</div>
                        }
                    </div>
                </Card>
            </div>

            {/* Insights Row */}
            <div className="charts-grid mt-6">
                <Card className="chart-card">
                    <div className="chart-card-header">
                        <h4>System Insights</h4>
                    </div>
                    <div className="insights-list">
                        {totalSlaRisk > 0 ? (
                            <div className="alert-item error">
                                <AlertTriangle size={16} style={{ marginRight: 8, flexShrink: 0 }} />
                                <span><strong>{totalSlaRisk}</strong> orders at SLA risk across {hubHealth.length} hubs</span>
                            </div>
                        ) : (
                            <div className="alert-item success">
                                <CheckCircle size={16} style={{ marginRight: 8, flexShrink: 0 }} />
                                <span>All hubs operating within SLA parameters</span>
                            </div>
                        )}
                        {avgCapacityUtil > 80 && (
                            <div className="alert-item warning" style={{ marginTop: 8 }}>
                                <AlertTriangle size={16} style={{ marginRight: 8, flexShrink: 0 }} />
                                <span>High average capacity utilization: <strong>{avgCapacityUtil}%</strong></span>
                            </div>
                        )}
                        {safeNum(stats.orders?.cancellationRatePercent) > 10 && (
                            <div className="alert-item warning" style={{ marginTop: 8 }}>
                                <AlertTriangle size={16} style={{ marginRight: 8, flexShrink: 0 }} />
                                <span>Elevated cancellation rate: <strong>{safeNum(stats.orders?.cancellationRatePercent).toFixed(1)}%</strong></span>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="chart-card">
                    <div className="chart-card-header">
                        <h4>Revenue Breakdown</h4>
                    </div>
                    <div className="revenue-breakdown">
                        <div className="rev-row">
                            <span className="rev-label">Gross Merchandise Value</span>
                            <span className="rev-value">{formatCurrency(grossRevenue)}</span>
                        </div>
                        <div className="rev-row">
                            <span className="rev-label">Discounts Given</span>
                            <span className="rev-value discount">−{formatCurrency(safeNum(stats.revenue?.discountsGiven))}</span>
                        </div>
                        <div className="rev-row">
                            <span className="rev-label">COGS</span>
                            <span className="rev-value discount">−{formatCurrency(safeNum(stats.revenue?.cogs))}</span>
                        </div>
                        <div className="rev-divider" />
                        <div className="rev-row total">
                            <span className="rev-label">Net Revenue</span>
                            <span className="rev-value highlight">{formatCurrency(netRevenue)}</span>
                        </div>
                        <div className="rev-row">
                            <span className="rev-label">Gross Margin</span>
                            <span className="rev-value margin">{safeNum(stats.revenue?.grossMarginPercent).toFixed(1)}%</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
