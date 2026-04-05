import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { DataTable, type Column } from '../components/DataTable';
import { Button } from '../components/Button';
import { Store, RefreshCw, Lock, LockOpen } from 'lucide-react';
import './ListPage.css';

interface Vendor {
    id: string;
    business_name?: string;
    businessName?: string;
    owner_name?: string;
    ownerName?: string;
    phone: string;
    is_active?: boolean;
    isActive?: boolean;
    is_locked?: boolean;
    isLocked?: boolean;
    current_capacity?: number;
    currentCapacity?: number;
}

export const VendorsList: React.FC = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    useEffect(() => { fetchVendors(); }, []);

    const fetchVendors = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch<any>('/api/admin/vendors');
            setVendors(res.data.items || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleLock = async (vendor: Vendor) => {
        setLoadingId(vendor.id);
        const isLocked = vendor.is_locked ?? vendor.isLocked ?? false;
        // Optimistic update
        setVendors(prev => prev.map(v =>
            v.id === vendor.id
                ? { ...v, is_locked: !isLocked, isLocked: !isLocked }
                : v
        ));
        try {
            await apiFetch(`/api/admin/vendors/${vendor.id}/${isLocked ? 'unlock' : 'lock'}`, {
                method: 'PATCH',
                body: JSON.stringify({ reason: 'Admin action' })
            });
            const res = await apiFetch<any>('/api/admin/vendors');
            setVendors(res.data.items || []);
        } catch (e) {
            console.error(e);
            // Revert on error
            setVendors(prev => prev.map(v =>
                v.id === vendor.id
                    ? { ...v, is_locked: isLocked, isLocked: isLocked }
                    : v
            ));
        } finally {
            setLoadingId(null);
        }
    };

    const getBusinessName = (v: Vendor) => v.businessName || v.business_name || '—';
    const getOwnerName = (v: Vendor) => v.ownerName || v.owner_name || '—';
    const getIsActive = (v: Vendor) => v.isActive ?? v.is_active ?? false;
    const getIsLocked = (v: Vendor) => v.isLocked ?? v.is_locked ?? false;
    const getCapacity = (v: Vendor) => {
        const cap = v.currentCapacity ?? v.current_capacity;
        return cap !== undefined && cap !== null ? cap : '—';
    };

    const columns: Column<Vendor>[] = [
        {
            header: 'Business',
            accessor: (v) => (
                <div className="entity-cell">
                    <div className="entity-icon purple"><Store size={14} /></div>
                    <div>
                        <div className="entity-name">{getBusinessName(v)}</div>
                        <div className="entity-sub">{getOwnerName(v)}</div>
                    </div>
                </div>
            )
        },
        { header: 'Phone', accessor: (v) => v.phone || '—' },
        { header: 'Capacity', accessor: (v) => getCapacity(v) },
        {
            header: 'Status',
            accessor: (v) => (
                <span className={`badge ${getIsLocked(v) ? 'badge-error' : (getIsActive(v) ? 'badge-success' : 'badge-warning')}`}>
                    {getIsLocked(v) ? 'Locked' : (getIsActive(v) ? 'Active' : 'Inactive')}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (v) => (
                <Button
                    size="sm"
                    variant={getIsLocked(v) ? 'primary' : 'danger'}
                    isLoading={loadingId === v.id}
                    onClick={() => toggleLock(v)}
                >
                    {getIsLocked(v)
                        ? <><LockOpen size={13} style={{ marginRight: 4 }} />Unlock</>
                        : <><Lock size={13} style={{ marginRight: 4 }} />Lock</>
                    }
                </Button>
            )
        }
    ];

    return (
        <div className="list-page">
            <div className="list-page-header">
                <div className="list-page-title">
                    <div className="list-page-icon green">
                        <Store size={20} />
                    </div>
                    <div>
                        <h3>Vendors</h3>
                        <p className="list-page-subtitle">{vendors.length} registered vendor partners</p>
                    </div>
                </div>
                <div className="list-page-actions">
                    <Button variant="secondary" onClick={fetchVendors}>
                        <RefreshCw size={14} />
                        <span style={{ marginLeft: 6 }}>Refresh</span>
                    </Button>
                </div>
            </div>
            <DataTable data={vendors} columns={columns} isLoading={isLoading} />
        </div>
    );
};
