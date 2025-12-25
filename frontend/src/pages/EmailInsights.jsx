import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Mail, AlertTriangle, CheckCircle, Shield, Search, RefreshCw, ChevronDown } from 'lucide-react';

function EmailInsights() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [expandedEmail, setExpandedEmail] = useState(null);

    useEffect(() => { loadEmails(); }, []);

    const loadEmails = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/emails/recent?limit=50');
            setEmails(response.data);
        } catch (error) { console.error('Failed to load emails:', error); }
        finally { setLoading(false); }
    };

    const handleMarkSafe = async (messageId) => {
        try {
            await api.post(`/api/emails/mark-safe/${messageId}`);
            setEmails(prev => prev.map(e => e.message_id === messageId ? { ...e, risk_level: 'safe' } : e));
        } catch (error) { alert('Failed to mark as safe'); }
    };

    const filtered = emails.filter(e => {
        if (filter === 'phishing') return e.risk_level === 'high';
        if (filter === 'suspicious') return ['medium', 'low'].includes(e.risk_level);
        if (filter === 'safe') return e.risk_level === 'safe';
        return true;
    });

    const getRiskBadge = (level) => {
        const badges = { high: 'risk-high', medium: 'risk-medium', low: 'risk-low', safe: 'risk-safe' };
        const labels = { high: '🚨 High', medium: '⚠️ Medium', low: 'ℹ️ Low', safe: '✅ Safe' };
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[level] || badges.safe}`}>{labels[level] || labels.safe}</span>;
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Email Insights</h1>
                <button onClick={loadEmails} className="btn-secondary flex items-center gap-2">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto">
                {['all', 'phishing', 'suspicious', 'safe'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400'}`}>
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="glass-card p-12 text-center"><div className="spinner w-12 h-12 mx-auto"></div></div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-12 text-center"><Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" /><p className="text-slate-400">No emails found</p></div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((email, i) => (
                        <div key={i} className="glass-card p-4 cursor-pointer hover:bg-slate-700/30" onClick={() => setExpandedEmail(expandedEmail === i ? null : i)}>
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-white font-medium truncate">{email.sender}</p>
                                    <p className="text-slate-400 text-sm truncate">{email.subject}</p>
                                </div>
                                {getRiskBadge(email.risk_level)}
                            </div>
                            {expandedEmail === i && (
                                <div className="mt-4 pt-4 border-t border-slate-700">
                                    {email.detection_reasons?.map((r, j) => <p key={j} className="text-slate-400 text-sm">• {r}</p>)}
                                    <div className="flex gap-2 mt-4">
                                        {email.risk_level !== 'safe' && (
                                            <button onClick={(e) => { e.stopPropagation(); handleMarkSafe(email.message_id); }}
                                                className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-sm">Mark Safe</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default EmailInsights;
