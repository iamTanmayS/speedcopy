import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { DataTable, type Column } from '../components/DataTable';
import { Button } from '../components/Button';
import { MapPin, RefreshCw, PauseCircle, PlayCircle } from 'lucide-react';
import './ListPage.css';

interface Hub {
    id: string;
    name: string;
    manager_name?: string;
    managerName?: string;
    is_active: boolean;
    is_paused: boolean;
    same_day_enabled?: boolean;
    sameDayEnabled?: boolean;
}

export const HubsList: React.FC = () => {
    const [hubs, setHubs] = useState<Hub[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    useEffect(() => { fetchHubs(); }, []);

    const fetchHubs = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch<any>('/api/admin/hubs');
            setHubs(res.data.items || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePause = async (hub: Hub) => {
        setLoadingId(hub.id);
        const currentlyPaused = hub.is_paused;
        // Optimistic update
        setHubs(prev => prev.map(h =>
            h.id === hub.id ? { ...h, is_paused: !currentlyPaused } : h
        ));
        try {
            await apiFetch(`/api/admin/hubs/${hub.id}/${currentlyPaused ? 'resume' : 'pause'}`, {
                method: 'POST',
                body: JSON.stringify({ reason: 'Admin override' })
            });
            // Re-fetch to confirm server state
            const res = await apiFetch<any>('/api/admin/hubs');
            setHubs(res.data.items || []);
        } catch (e) {
            console.error(e);
            // Revert optimistic update on error
            setHubs(prev => prev.map(h =>
                h.id === hub.id ? { ...h, is_paused: currentlyPaused } : h
            ));
        } finally {
            setLoadingId(null);
        }
    };

    const getManagerName = (h: Hub) => h.managerName || h.manager_name || 'Unassigned';
    const getSameDay = (h: Hub) => h.sameDayEnabled ?? h.same_day_enabled ?? false;

    const columns: Column<Hub>[] = [
        {
            header: 'Hub Name',
            accessor: (h) => (
                <div className="entity-cell">
                    <div className="entity-icon purple"><MapPin size={14} /></div>
                    <span className="entity-name">{h.name}</span>
                </div>
            )
        },
        { header: 'Manager', accessor: (h) => getManagerName(h) },
        {
            header: 'Same Day',
            accessor: (h) => getSameDay(h)
                ? <span className="badge badge-success">Enabled</span>
                : <span className="badge badge-neutral">Disabled</span>
        },
        {
            header: 'Status',
            accessor: (h) => (
                <span className={`badge ${h.is_paused ? 'badge-warning' : (h.is_active ? 'badge-success' : 'badge-neutral')}`}>
                    {h.is_paused ? 'Paused' : (h.is_active ? 'Active' : 'Archived')}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (h) => (
                <Button
                    size="sm"
                    variant={h.is_paused ? 'primary' : 'secondary'}
                    isLoading={loadingId === h.id}
                    onClick={() => togglePause(h)}
                >
                    {h.is_paused
                        ? <><PlayCircle size={13} style={{ marginRight: 4 }} />Resume</>
                        : <><PauseCircle size={13} style={{ marginRight: 4 }} />Pause</>
                    }
                </Button>
            )
        }
    ];

    return (
        <div className="list-page">
            <div className="list-page-header">
                <div className="list-page-title">
                    <div className="list-page-icon orange">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h3>Hubs Operations</h3>
                        <p className="list-page-subtitle">{hubs.length} distribution hubs</p>
                    </div>
                </div>
                <div className="list-page-actions">
                    <Button variant="secondary" onClick={fetchHubs}>
                        <RefreshCw size={14} />
                        <span style={{ marginLeft: 6 }}>Refresh</span>
                    </Button>
                </div>
            </div>
            <DataTable data={hubs} columns={columns} isLoading={isLoading} />
        </div>
    );
};
