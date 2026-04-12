import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import type { PlatformConfig } from '../types/admin';
import type { ApiSuccess } from '../types/shared';
import { ShieldAlert, RefreshCcw, Power, Zap, AlertTriangle } from 'lucide-react';
import './AdminModules.css';

export const SafetyConsole: React.FC = () => {
    const [configs, setConfigs] = useState<PlatformConfig[]>([]);
    const [hubs, setHubs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        setError(null);
        try {
            const [configRes, hubRes] = await Promise.all([
                apiFetch<ApiSuccess<PlatformConfig[]>>('/api/admin/safety/flags'),
                apiFetch<ApiSuccess<any[]>>('/api/admin/hubs')
            ]);
            setConfigs(configRes.data ?? []);
            setHubs(hubRes.data ?? []);
        } catch (err: any) {
            setError(err.message || 'Failed to load safety data');
            console.error('Safety data fetch error:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleToggleFlag = async (key: string, currentValue: any) => {
        const newValue = { ...currentValue, active: !currentValue.active };
        setIsProcessing(key);
        try {
            await apiFetch(`/api/admin/safety/flags/${key}`, {
                method: 'POST',
                body: JSON.stringify({ value: newValue })
            });
            fetchData(true);
        } catch (err) {
            console.error('Flag toggle error:', err);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleToggleHub = async (hubId: string, isPaused: boolean) => {
        setIsProcessing(`hub-${hubId}`);
        try {
            await apiFetch(`/api/admin/safety/hubs/${hubId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ isPaused: !isPaused })
            });
            fetchData(true);
        } catch (err) {
            console.error('Hub toggle error:', err);
        } finally {
            setIsProcessing(null);
        }
    };

    if (isLoading) {
        return (
            <div className="module-loading">
                <div className="module-spinner" />
                <span>Scanning safety protocols...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="module-loading">
                <AlertTriangle size={32} color="var(--red-500)" />
                <span style={{ color: 'var(--red-500)' }}>{error}</span>
                <button className="btn-refresh" onClick={() => fetchData()}>Retry</button>
            </div>
        );
    }

    const globalKillSwitch = configs.find(c => c.key === 'global_kill_switch');
    const isKillActive = globalKillSwitch?.value?.active ?? false;
    const featureFlags = configs.filter(c => c.key !== 'global_kill_switch');

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Safety &amp; Operations Control</h1>
                    <p>Critical controls for platform uptime and emergency handling</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={() => fetchData(true)} disabled={isRefreshing}>
                        <RefreshCcw size={15} className={isRefreshing ? 'spinning' : ''} />
                        Refresh Status
                    </button>
                </div>
            </div>

            {/* Global Kill Switch */}
            <div className={`kill-switch-zone ${isKillActive ? 'platform-stopped' : ''}`}>
                <div className="kill-switch-info">
                    <ShieldAlert size={32} color={isKillActive ? 'var(--red-500)' : 'var(--fg-muted)'} />
                    <div>
                        <div className="kill-switch-title">Global Platform Kill Switch</div>
                        <div className="kill-switch-desc">
                            {isKillActive
                                ? '⚠️ Platform is currently STOPPED — no new orders are being accepted.'
                                : 'Immediately stops all order intake and processing platform-wide.'
                            }
                        </div>
                    </div>
                </div>
                <button
                    className={`kill-btn ${isKillActive ? 'active' : ''}`}
                    onClick={() => globalKillSwitch && handleToggleFlag('global_kill_switch', globalKillSwitch.value)}
                    disabled={isProcessing === 'global_kill_switch'}
                >
                    <Power size={18} />
                    {isKillActive ? 'PLATFORM STOPPED — Click to Resume' : 'PLATFORM LIVE — Click to Stop'}
                </button>
            </div>

            {/* Stats Row */}
            <div className="stats-row" style={{ marginBottom: 24 }}>
                <div className="stat-mini">
                    <div className="stat-mini-icon blue"><Zap size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Feature Flags</div>
                        <div className="stat-mini-value">{featureFlags.length}</div>
                    </div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-icon green"><ShieldAlert size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Active Flags</div>
                        <div className="stat-mini-value">{featureFlags.filter(c => c.value?.active).length}</div>
                    </div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-icon orange"><Power size={18} /></div>
                    <div className="stat-mini-body">
                        <div className="stat-mini-label">Live Hubs</div>
                        <div className="stat-mini-value">{hubs.filter(h => !h.is_paused).length} / {hubs.length}</div>
                    </div>
                </div>
            </div>

            <div className="safety-grid">
                {/* Feature Flags */}
                <section className="hubs-safety-section">
                    <h3 className="section-title" style={{ marginBottom: 16 }}>Operational Feature Flags</h3>
                    {featureFlags.length === 0 ? (
                        <div className="sla-ok-box" style={{ background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                            <Zap size={36} />
                            <strong style={{ color: 'var(--fg-default)' }}>No flags configured</strong>
                            <p>Feature flags will appear here once configured in the database.</p>
                        </div>
                    ) : (
                        <div className="flags-list">
                            {featureFlags.map((config) => (
                                <div key={config.key} className="flag-item">
                                    <div className="flag-info">
                                        <div className="flag-key">{config.key.replace(/_/g, ' ')}</div>
                                        <div className="flag-desc">{config.description || 'No description provided'}</div>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={config.value?.active ?? false}
                                            onChange={() => handleToggleFlag(config.key, config.value)}
                                            disabled={isProcessing === config.key}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Hub Operations */}
                <section className="hubs-safety-section">
                    <h3 className="section-title" style={{ marginBottom: 16 }}>City &amp; Hub Control Centers</h3>
                    {hubs.length === 0 ? (
                        <div className="sla-ok-box" style={{ background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                            <ShieldAlert size={36} />
                            <strong style={{ color: 'var(--fg-default)' }}>No hubs found</strong>
                            <p>Hub operations will appear here once hubs are configured.</p>
                        </div>
                    ) : (
                        <div className="module-table-wrapper">
                            <table className="module-table">
                                <thead>
                                    <tr>
                                        <th>Hub Name</th>
                                        <th>City</th>
                                        <th>Status</th>
                                        <th>Orders</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hubs.map((hub: any) => (
                                        <tr key={hub.id}>
                                            <td>
                                                <strong style={{ color: 'var(--fg-default)', fontSize: 13 }}>{hub.name}</strong>
                                            </td>
                                            <td style={{ color: 'var(--fg-muted)', fontSize: 13 }}>{hub.city_name || '—'}</td>
                                            <td>
                                                <span className={`pill ${hub.is_paused ? 'pill-yellow' : 'pill-green'}`}>
                                                    {hub.is_paused ? 'PAUSED' : 'LIVE'}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--fg-secondary)', fontSize: 13 }}>
                                                {hub.orders_processing || 0}
                                            </td>
                                            <td>
                                                <button
                                                    className={hub.is_paused ? 'btn-success-sm' : 'btn-danger-sm'}
                                                    onClick={() => handleToggleHub(hub.id, hub.is_paused)}
                                                    disabled={isProcessing === `hub-${hub.id}`}
                                                >
                                                    {isProcessing === `hub-${hub.id}` ? '...' : hub.is_paused ? 'Resume' : 'Pause'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
