import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { apiFetch } from '../utils/api';
import type { PlatformConfig } from '../types/admin';
import type { ApiSuccess } from '../types/shared';
import { ShieldAlert, RefreshCcw, Power } from 'lucide-react';

export const SafetyConsole: React.FC = () => {
    const [configs, setConfigs] = useState<PlatformConfig[]>([]);
    const [hubs, setHubs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [configRes, hubRes] = await Promise.all([
                apiFetch<ApiSuccess<PlatformConfig[]>>('/api/admin/safety/flags'),
                apiFetch<ApiSuccess<any[]>>('/api/admin/hubs')
            ]);
            setConfigs(configRes.data);
            setHubs(hubRes.data);
        } catch (err) {
            console.error("Safety data fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleFlag = async (key: string, currentValue: any) => {
        const newValue = { ...currentValue, active: !currentValue.active };
        setIsProcessing(key);
        try {
            await apiFetch(`/api/admin/safety/flags/${key}`, {
                method: 'POST',
                body: JSON.stringify({ value: newValue })
            });
            fetchData();
        } catch (err) {
            console.error("Flag toggle error:", err);
        } finally {
            setIsProcessing(null);
        }
    };

    if (isLoading) return <div className="loading-container">Scanning safety protocols...</div>;

    const globalKillSwitch = configs.find(c => c.key === 'global_kill_switch');

    return (
        <div className="admin-page safety-page">
            <header className="page-header">
                <div className="header-left">
                    <h1 className="page-title">Safety & Operations Control</h1>
                    <p className="page-subtitle">Critical controls for platform uptime and emergency handling</p>
                </div>
                <div className="header-right">
                    <button className="refresh-btn" onClick={fetchData}>
                        <RefreshCcw size={16} />
                        <span>Refresh Status</span>
                    </button>
                </div>
            </header>

            {/* Global Kill Switch - Highly Visible */}
            <div className="emergency-section">
                <Card className={`emergency-card ${globalKillSwitch?.value.active ? 'active' : ''}`}>
                    <div className="emergency-header">
                        <div className="emergency-title">
                            <ShieldAlert size={32} />
                            <div>
                                <h2>Global Platform Kill Switch</h2>
                                <p>Immediately stops all orders and intake platform-wide</p>
                            </div>
                        </div>
                        <button 
                            className={`kill-switch-btn ${globalKillSwitch?.value.active ? 'active' : ''}`}
                            onClick={() => globalKillSwitch && handleToggleFlag('global_kill_switch', globalKillSwitch.value)}
                            disabled={isProcessing === 'global_kill_switch'}
                        >
                            <Power size={20} />
                            <span>{globalKillSwitch?.value.active ? 'PLATFORM STOPPED' : 'PLATFORM LIVE'}</span>
                        </button>
                    </div>
                </Card>
            </div>

            <div className="safety-grid mt-8">
                {/* Feature Flags */}
                <section className="flags-section">
                    <h3 className="section-title">Operational Feature Flags</h3>
                    <div className="flags-list mt-4">
                        {configs.filter(c => c.key !== 'global_kill_switch').map((config) => (
                            <Card key={config.key} className="flag-card">
                                <div className="flag-info">
                                    <h4 className="flag-key">{config.key.replace(/_/g, ' ').toUpperCase()}</h4>
                                    <p className="flag-desc">{config.description || 'No description provided'}</p>
                                </div>
                                <div className="flag-control">
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={config.value.active} 
                                            onChange={() => handleToggleFlag(config.key, config.value)}
                                            disabled={isProcessing === config.key}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </Card>
                        ))}
                        {configs.length <= 1 && <p className="text-muted">No additional flags configured.</p>}
                    </div>
                </section>

                {/* Hub Operations */}
                <section className="hubs-safety-section">
                    <h3 className="section-title">City & Hub Control Centers</h3>
                    <div className="hubs-safety-list mt-4 card">
                        <table className="admin-table">
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
                                        <td><strong>{hub.name}</strong></td>
                                        <td>{hub.city_name || 'Mumbai'}</td>
                                        <td>
                                            <span className={`status-pill ${hub.is_paused ? 'paused' : 'active'}`}>
                                                {hub.is_paused ? 'PAUSED' : 'LIVE'}
                                            </span>
                                        </td>
                                        <td>{hub.orders_processing || 0}</td>
                                        <td>
                                            <button className={`sc-button sc-button-sm ${hub.is_paused ? 'sc-button-primary' : 'sc-button-secondary'}`}>
                                                {hub.is_paused ? 'Resume' : 'Pause'}
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
