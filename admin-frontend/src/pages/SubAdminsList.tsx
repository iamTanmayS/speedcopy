import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { DataTable, type Column } from '../components/DataTable';
import { Button } from '../components/Button';
import { ShieldAlert, RefreshCw, UserX } from 'lucide-react';
import './ListPage.css';

interface SubAdmin {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active?: boolean;
    isActive?: boolean;
    permissions: string[];
}

export const SubAdminsList: React.FC = () => {
    const [admins, setAdmins] = useState<SubAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    useEffect(() => { fetchAdmins(); }, []);

    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch<any>('/api/admin/sub-admins');
            setAdmins(res.data.items || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const revokeAccess = async (admin: SubAdmin) => {
        if (!window.confirm(`Revoke access for ${admin.name}? This action cannot be easily undone.`)) return;
        setLoadingId(admin.id);
        try {
            await apiFetch(`/api/admin/sub-admins/${admin.id}`, { method: 'DELETE' });
            setAdmins(prev => prev.filter(a => a.id !== admin.id));
        } catch (e) {
            console.error(e);
            fetchAdmins();
        } finally {
            setLoadingId(null);
        }
    };

    const getIsActive = (a: SubAdmin) => a.isActive ?? a.is_active ?? true;
    const getPermCount = (a: SubAdmin) => {
        if (Array.isArray(a.permissions)) return a.permissions.length;
        return 0;
    };

    const columns: Column<SubAdmin>[] = [
        {
            header: 'Admin',
            accessor: (a) => (
                <div className="user-cell">
                    <div className="user-avatar-sm admin">{(a.name || '?').charAt(0).toUpperCase()}</div>
                    <div>
                        <div className="user-name-sm">{a.name}</div>
                        <div className="user-email-sm">{a.email}</div>
                    </div>
                </div>
            )
        },
        { header: 'Role', accessor: (a) => <span className={`badge ${a.role === 'super_admin' ? 'badge-error' : 'badge-info'}`}>{a.role}</span> },
        { header: 'Permissions', accessor: (a) => <span className="badge badge-neutral">{getPermCount(a)} perms</span> },
        {
            header: 'Status',
            accessor: (a) => (
                <span className={`badge ${getIsActive(a) ? 'badge-success' : 'badge-error'}`}>
                    {getIsActive(a) ? 'Active' : 'Revoked'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (a) => (
                getIsActive(a) ? (
                    <Button
                        size="sm"
                        variant="danger"
                        isLoading={loadingId === a.id}
                        onClick={() => revokeAccess(a)}
                    >
                        <UserX size={13} style={{ marginRight: 4 }} />
                        Revoke
                    </Button>
                ) : (
                    <span className="text-muted-sm">No actions</span>
                )
            )
        }
    ];

    return (
        <div className="list-page">
            <div className="list-page-header">
                <div className="list-page-title">
                    <div className="list-page-icon red">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h3>Sub-Admins</h3>
                        <p className="list-page-subtitle">{admins.length} admin accounts</p>
                    </div>
                </div>
                <div className="list-page-actions">
                    <Button variant="secondary" onClick={fetchAdmins}>
                        <RefreshCw size={14} />
                        <span style={{ marginLeft: 6 }}>Refresh</span>
                    </Button>
                </div>
            </div>
            <DataTable data={admins} columns={columns} isLoading={isLoading} />
        </div>
    );
};
