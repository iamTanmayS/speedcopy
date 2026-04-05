import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { DataTable, type Column } from '../components/DataTable';
import { Button } from '../components/Button';
import { Users, Search, RefreshCw } from 'lucide-react';
import './ListPage.css';

interface User {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
    role: string;
    is_active: boolean;
    is_flagged: boolean;
    created_at: string;
}

export const UsersList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch<any>('/api/admin/users?pageSize=50');
            setUsers(res.data.items || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleActive = async (user: User) => {
        setLoadingId(user.id);
        try {
            const endpoint = user.is_active ? 'deactivate' : 'activate';
            await apiFetch(`/api/admin/users/${user.id}/${endpoint}`, {
                method: 'PATCH',
                body: JSON.stringify({ reason: 'Admin toggled' })
            });
            // Optimistic update
            setUsers(prev => prev.map(u =>
                u.id === user.id ? { ...u, is_active: !u.is_active } : u
            ));
        } catch (e) {
            console.error(e);
            fetchUsers(); // Re-fetch on error
        } finally {
            setLoadingId(null);
        }
    };

    const filteredUsers = users.filter(u => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (u.name || '').toLowerCase().includes(q) ||
            (u.phone || '').includes(q) ||
            (u.email || '').toLowerCase().includes(q);
    });

    const columns: Column<User>[] = [
        {
            header: 'User',
            accessor: (u) => (
                <div className="user-cell">
                    <div className="user-avatar-sm">{(u.name || u.phone || '?').charAt(0).toUpperCase()}</div>
                    <div>
                        <div className="user-name-sm">{u.name || '—'}</div>
                        <div className="user-email-sm">{u.phone}</div>
                    </div>
                </div>
            )
        },
        { header: 'Role', accessor: (u) => <span className="badge badge-neutral">{u.role || 'user'}</span> },
        {
            header: 'Status',
            accessor: (u) => (
                <span className={`badge ${u.is_active ? 'badge-success' : 'badge-error'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Flagged',
            accessor: (u) => (
                u.is_flagged
                    ? <span className="badge badge-warning">Flagged</span>
                    : <span className="badge badge-neutral">Clean</span>
            )
        },
        {
            header: 'Joined',
            accessor: (u) => u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
        },
        {
            header: 'Actions',
            accessor: (u) => (
                <Button
                    size="sm"
                    variant={u.is_active ? 'danger' : 'primary'}
                    isLoading={loadingId === u.id}
                    onClick={() => toggleActive(u)}
                >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                </Button>
            )
        }
    ];

    return (
        <div className="list-page">
            <div className="list-page-header">
                <div className="list-page-title">
                    <div className="list-page-icon blue">
                        <Users size={20} />
                    </div>
                    <div>
                        <h3>Users</h3>
                        <p className="list-page-subtitle">{users.length} total registered users</p>
                    </div>
                </div>
                <div className="list-page-actions">
                    <div className="search-box">
                        <Search size={14} className="search-icon" />
                        <input
                            className="search-input"
                            placeholder="Search by name, phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="secondary" onClick={fetchUsers}>
                        <RefreshCw size={14} />
                        <span style={{ marginLeft: 6 }}>Refresh</span>
                    </Button>
                </div>
            </div>
            <DataTable data={filteredUsers} columns={columns} isLoading={isLoading} />
        </div>
    );
};
