import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Users, Store, ShoppingCart, MapPin, 
    Banknote, ShieldAlert, LogOut, ChevronLeft, ChevronRight,
    Clock, LifeBuoy, Zap, Tag, Box
} from 'lucide-react';
import './AdminLayout.css';

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Orders', icon: ShoppingCart, path: '/orders' },
    { name: 'Vendors', icon: Store, path: '/vendors' },
    { name: 'SLAs', icon: Clock, path: '/sla' },
    { name: 'Tickets', icon: LifeBuoy, path: '/tickets' },
    { name: 'Finance', icon: Banknote, path: '/finance' },
    { name: 'Coupons', icon: Tag, path: '/coupons' },
    { name: 'Inventory', icon: Box, path: '/inventory' },
    { name: 'Hubs', icon: MapPin, path: '/hubs' },
    { name: 'Users', icon: Users, path: '/users' },
    { name: 'Safety', icon: Zap, path: '/safety' },
    { name: 'Admin', icon: ShieldAlert, path: '/subadmins' },
];

export const AdminLayout: React.FC = () => {
    const { user, isLoading, logout } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: 'var(--fg-muted)' }}>
                <div style={{ width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>Authenticating...</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userInitial = (user.name || 'A').charAt(0).toUpperCase();

    return (
        <div className="admin-layout">
            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand-section">
                        <span className="brand-logo">
                            <span className="brand-logo-dot" />
                            {!isCollapsed && <span className="brand-text">SPEEDCOPY</span>}
                        </span>
                        {!isCollapsed && <span className="brand-subtitle">Admin Console</span>}
                    </div>
                    <button 
                        className="sidebar-toggle-btn" 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path));
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon size={20} className="nav-icon" />
                                {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    {!isCollapsed && (
                        <div className="user-info">
                            <div className="user-avatar">{userInitial}</div>
                            <div className="user-details">
                                <span className="user-name">{user.name || 'Admin'}</span>
                                <span className="user-role">{user.role?.replace(/_/g, ' ') || 'Admin'}</span>
                            </div>
                        </div>
                    )}
                    <button className="logout-btn" onClick={logout} title={isCollapsed ? "Sign out" : undefined}>
                        <LogOut size={isCollapsed ? 20 : 16} />
                        {!isCollapsed && <span>Sign out</span>}
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
