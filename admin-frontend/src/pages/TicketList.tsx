import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { apiFetch } from '../utils/api';
import type { ApiSuccess } from '../types/shared';
import { LifeBuoy, Filter, Search, MoreVertical, User, Tag, Clock, Send, MessageSquare } from 'lucide-react';

export const TicketList: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [reply, setReply] = useState('');

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch<ApiSuccess<any[]>>('/api/admin/tickets');
            setTickets(res.data);
        } catch (err) {
            console.error("Ticket fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTicketDetail = async (id: string) => {
        try {
            const res = await apiFetch<ApiSuccess<any>>(`/api/admin/tickets/${id}`);
            setSelectedTicket(res.data);
        } catch (err) {
            console.error("Ticket detail error:", err);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleSendReply = async () => {
        if (!reply.trim() || !selectedTicket) return;
        try {
            await apiFetch(`/api/admin/tickets/${selectedTicket.id}/messages`, {
                method: 'POST',
                body: JSON.stringify({ message: reply, isInternal: false })
            });
            setReply('');
            fetchTicketDetail(selectedTicket.id);
        } catch (err) {
            console.error("Reply error:", err);
        }
    };

    if (isLoading && tickets.length === 0) return <div className="loading-container">Loading helpdesk...</div>;

    return (
        <div className="admin-page tickets-page">
            <header className="page-header">
                <div className="header-left">
                    <h1 className="page-title">Support & Helpdesk</h1>
                    <p className="page-subtitle">Manage customer and vendor resolutions</p>
                </div>
                <div className="header-right">
                    <div className="search-bar">
                        <Search size={16} />
                        <input type="text" placeholder="Search ticket # or customer..." />
                    </div>
                </div>
            </header>

            <div className="tickets-layout">
                {/* Ticket Sidebar List */}
                <div className="tickets-sidebar card">
                    <div className="sidebar-header">
                        <span>{tickets.length} Tickets</span>
                        <Filter size={16} />
                    </div>
                    <div className="ticket-items">
                        {tickets.map((t) => (
                            <div 
                                key={t.id} 
                                className={`ticket-item ${selectedTicket?.id === t.id ? 'active' : ''}`}
                                onClick={() => fetchTicketDetail(t.id)}
                            >
                                <div className="ticket-item-top">
                                    <span className="ticket-num">#{t.ticket_number}</span>
                                    <span className={`priority-dot ${t.priority.toLowerCase()}`} title={t.priority} />
                                </div>
                                <h4 className="ticket-subject">{t.subject}</h4>
                                <div className="ticket-item-footer">
                                    <span className="requester-name">{t.requester_name}</span>
                                    <span className="ticket-date">{new Date(t.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ticket Conversation Detail */}
                <div className="ticket-content">
                    {selectedTicket ? (
                        <Card className="ticket-detail-view">
                            <div className="detail-header">
                                <div className="header-main">
                                    <h2>{selectedTicket.subject}</h2>
                                    <div className="header-meta">
                                        <span className={`status-tag ${selectedTicket.status.toLowerCase()}`}>{selectedTicket.status}</span>
                                        <span className="meta-sep" />
                                        <span className="meta-item"><User size={14} /> {selectedTicket.requester_name} ({selectedTicket.requester_type})</span>
                                        <span className="meta-sep" />
                                        <span className="meta-item"><Tag size={14} /> {selectedTicket.category || 'General'}</span>
                                    </div>
                                </div>
                                <div className="header-actions">
                                    <button className="sc-button sc-button-secondary sc-button-sm">Resolve</button>
                                    <button className="icon-btn ml-2"><MoreVertical size={18} /></button>
                                </div>
                            </div>

                            <div className="conversation-thread">
                                <div className="ticket-original-desc">
                                    <div className="desc-avatar">{selectedTicket.requester_name.charAt(0)}</div>
                                    <div className="desc-body">
                                        <div className="desc-meta">
                                            <strong>{selectedTicket.requester_name}</strong>
                                            <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                                        </div>
                                        <p>{selectedTicket.description}</p>
                                    </div>
                                </div>

                                <div className="messages-list">
                                    {(selectedTicket.messages || []).map((m: any) => (
                                        <div key={m.id} className={`message-bubble ${m.sender_role === 'customer' ? 'external' : 'internal'}`}>
                                            <div className="message-header">
                                                <strong>{m.sender_name}</strong>
                                                <span>{new Date(m.created_at).toLocaleTimeString()}</span>
                                            </div>
                                            <p>{m.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="reply-section">
                                <div className="reply-tools">
                                    <button className="tool-btn"><MessageSquare size={16} /> Public Reply</button>
                                    <button className="tool-btn"><Clock size={16} /> Internal Note</button>
                                </div>
                                <textarea 
                                    placeholder="Type your reply here..." 
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                />
                                <div className="reply-footer">
                                    <p className="text-muted">Customer will be notified via Email/Push</p>
                                    <button className="sc-button sc-button-primary" onClick={handleSendReply}>
                                        <Send size={16} />
                                        <span className="ml-2">Send Reply</span>
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="no-selection card">
                            <LifeBuoy size={64} className="text-muted" />
                            <h3>Select a ticket</h3>
                            <p>Pick a ticket from the sidebar to view conversation history and respond.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
