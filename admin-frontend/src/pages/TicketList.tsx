import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import type { ApiSuccess } from '../types/shared';
import { LifeBuoy, Filter, Search, MoreVertical, User, Tag, Clock, Send, MessageSquare, RefreshCcw } from 'lucide-react';
import './AdminModules.css';

export const TicketList: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [reply, setReply] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [search, setSearch] = useState('');

    const fetchTickets = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        try {
            const res = await apiFetch<ApiSuccess<any[]>>('/api/admin/tickets');
            setTickets(res.data ?? []);
        } catch (err) {
            console.error('Ticket fetch error:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchTicketDetail = async (id: string) => {
        try {
            const res = await apiFetch<ApiSuccess<any>>(`/api/admin/tickets/${id}`);
            setSelectedTicket(res.data);
        } catch (err) {
            console.error('Ticket detail error:', err);
        }
    };

    useEffect(() => { fetchTickets(); }, []);

    const handleSendReply = async () => {
        if (!reply.trim() || !selectedTicket) return;
        setIsSending(true);
        try {
            await apiFetch(`/api/admin/tickets/${selectedTicket.id}/messages`, {
                method: 'POST',
                body: JSON.stringify({ message: reply, isInternal: false })
            });
            setReply('');
            fetchTicketDetail(selectedTicket.id);
        } catch (err) {
            console.error('Reply error:', err);
        } finally {
            setIsSending(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedTicket) return;
        try {
            await apiFetch(`/api/admin/tickets/${selectedTicket.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'closed' })
            });
            fetchTickets(true);
            fetchTicketDetail(selectedTicket.id);
        } catch (err) {
            console.error('Resolve error:', err);
        }
    };

    const filteredTickets = tickets.filter(t =>
        !search ||
        t.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
        t.subject?.toLowerCase().includes(search.toLowerCase()) ||
        t.requester_name?.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="module-loading">
                <div className="module-spinner" />
                <span>Loading support tickets...</span>
            </div>
        );
    }

    return (
        <div className="admin-page" style={{ maxWidth: 1400, display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div className="admin-page-header" style={{ marginBottom: 20 }}>
                <div>
                    <h1>Support &amp; Helpdesk</h1>
                    <p>Manage customer and vendor support resolutions</p>
                </div>
                <div className="header-actions">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                        <Search size={15} color="var(--fg-muted)" />
                        <input
                            type="text"
                            placeholder="Search ticket or customer..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--fg-default)', fontFamily: 'var(--font-sans)', fontSize: 13, width: 200 }}
                        />
                    </div>
                    <button className="btn-refresh" onClick={() => fetchTickets(true)} disabled={isRefreshing}>
                        <RefreshCcw size={15} className={isRefreshing ? 'spinning' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Helpdesk layout */}
            <div className="helpdesk-layout">
                {/* Sidebar */}
                <div className="ticket-sidebar">
                    <div className="ticket-sidebar-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{filteredTickets.length} Tickets</span>
                        <Filter size={14} />
                    </div>
                    <div className="ticket-list">
                        {filteredTickets.length === 0 ? (
                            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>
                                {search ? 'No matching tickets' : 'No tickets yet'}
                            </div>
                        ) : (
                            filteredTickets.map((t) => (
                                <div
                                    key={t.id}
                                    className={`ticket-list-item ${selectedTicket?.id === t.id ? 'selected' : ''}`}
                                    onClick={() => fetchTicketDetail(t.id)}
                                >
                                    <div className="ticket-item-top">
                                        <span className="ticket-item-num">#{t.ticket_number}</span>
                                        <span
                                            className="priority-dot"
                                            style={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: t.priority === 'URGENT' ? '#ef4444'
                                                    : t.priority === 'HIGH' ? '#f97316'
                                                    : t.priority === 'MEDIUM' ? '#eab308'
                                                    : '#22c55e'
                                            }}
                                            title={t.priority}
                                        />
                                    </div>
                                    <div className="ticket-item-subject">{t.subject}</div>
                                    <div className="ticket-item-meta">
                                        <span>{t.requester_name}</span>
                                        <span>{new Date(t.created_at).toLocaleDateString('en-IN')}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail Panel */}
                {selectedTicket ? (
                    <div className="ticket-detail-panel">
                        {/* Header */}
                        <div className="ticket-detail-head">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div className="ticket-detail-subject">{selectedTicket.subject}</div>
                                    <div className="ticket-meta-row">
                                        <span className={`pill ${
                                            selectedTicket.status === 'open' ? 'pill-blue' :
                                            selectedTicket.status === 'closed' ? 'pill-green' : 'pill-yellow'
                                        }`} style={{ fontSize: 10 }}>
                                            {(selectedTicket.status || '').toUpperCase()}
                                        </span>
                                        <div className="ticket-meta-item">
                                            <User size={12} />
                                            <span>{selectedTicket.requester_name} ({selectedTicket.requester_type})</span>
                                        </div>
                                        <div className="ticket-meta-item">
                                            <Tag size={12} />
                                            <span>{selectedTicket.category || 'General'}</span>
                                        </div>
                                        <div className="ticket-meta-item">
                                            <Clock size={12} />
                                            <span>{new Date(selectedTicket.created_at).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {selectedTicket.status !== 'closed' && (
                                        <button className="btn-success-sm" onClick={handleResolve}>
                                            Resolve
                                        </button>
                                    )}
                                    <button className="btn-icon"><MoreVertical size={16} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Conversation */}
                        <div className="ticket-body">
                            {/* Original message */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: 'var(--bg-muted)', borderRadius: 8 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--indigo-500), #a855f7)',
                                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, fontWeight: 700, flexShrink: 0
                                }}>
                                    {selectedTicket.requester_name?.charAt(0) || '?'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <strong style={{ fontSize: 13, color: 'var(--fg-default)' }}>{selectedTicket.requester_name}</strong>
                                        <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{new Date(selectedTicket.created_at).toLocaleString('en-IN')}</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--fg-secondary)', lineHeight: 1.6, margin: 0 }}>
                                        {selectedTicket.description}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            {(selectedTicket.messages || []).map((m: any) => (
                                <div
                                    key={m.id}
                                    className={`message-bubble ${m.sender_role === 'customer' ? 'external' : 'internal'}`}
                                >
                                    <div className="message-meta">
                                        <span className="message-sender">{m.sender_name}</span>
                                        <span className="message-time">{new Date(m.created_at).toLocaleTimeString('en-IN')}</span>
                                    </div>
                                    <p className="message-text">{m.message}</p>
                                </div>
                            ))}
                        </div>

                        {/* Reply Area */}
                        <div className="ticket-reply-area">
                            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                                <button className="btn-icon" style={{ width: 'auto', padding: '6px 12px', gap: 6, fontSize: 12, fontWeight: 600 }}>
                                    <MessageSquare size={14} /> Public Reply
                                </button>
                                <button className="btn-icon" style={{ width: 'auto', padding: '6px 12px', gap: 6, fontSize: 12, fontWeight: 600 }}>
                                    <Clock size={14} /> Internal Note
                                </button>
                            </div>
                            <textarea
                                className="reply-textarea"
                                placeholder="Type your reply here..."
                                value={reply}
                                onChange={e => setReply(e.target.value)}
                            />
                            <div className="reply-footer">
                                <p style={{ fontSize: 12, color: 'var(--fg-muted)', margin: 0 }}>
                                    Customer will be notified via Email/Push
                                </p>
                                <button
                                    className="btn-primary"
                                    onClick={handleSendReply}
                                    disabled={isSending || !reply.trim()}
                                >
                                    <Send size={14} />
                                    {isSending ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="ticket-no-selection">
                        <LifeBuoy size={56} style={{ color: 'var(--indigo-400)', opacity: 0.5 }} />
                        <strong style={{ fontSize: 16, color: 'var(--fg-default)' }}>Select a ticket</strong>
                        <p>Pick a ticket from the sidebar to view conversation history and respond to customers.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
