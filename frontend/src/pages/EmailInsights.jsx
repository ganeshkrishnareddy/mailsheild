import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Mail, AlertTriangle, CheckCircle, Shield, Search, RefreshCw, ChevronDown, ChevronRight, X } from 'lucide-react';

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
        const badges = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low', safe: 'badge-safe' };
        const labels = { high: 'PHISHING', medium: 'SUSPICIOUS', low: 'MODERATE', safe: 'SAFE' };
        return <span className={`badge-risk ${badges[level] || badges.safe}`}>{labels[level] || labels.safe}</span>;
    };

    return (
        <div className="space-y-8 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-tight">Email Insights</h1>
                    <p className="text-slate-400 text-sm mt-1">Deep analysis of your inbox activity</p>
                </div>
                <button
                    onClick={loadEmails}
                    disabled={loading}
                    className="w-11 h-11 flex items-center justify-center rounded-2xl glass-interactive text-slate-400 hover:text-white disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Filters - Modern Scrollable Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {['all', 'phishing', 'suspicious', 'safe'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-2xl capitalize text-sm font-bold whitespace-nowrap transition-all duration-300 border ${filter === f
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        {f === 'all' ? 'All Activity' : f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="glass-card p-16 text-center space-y-4">
                    <div className="spinner w-12 h-12 mx-auto"></div>
                    <p className="text-slate-500 text-sm font-medium animate-pulse">Analyzing threats...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-slate-600 opacity-30" />
                    </div>
                    <p className="text-white font-bold text-lg">Clean Inbox</p>
                    <p className="text-slate-400 text-sm mt-2 max-w-[240px] mx-auto">No emails matching these risk levels were found in your recent activity.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((email, i) => (
                        <div
                            key={i}
                            className={`glass-interactive p-5 overflow-hidden group ${expandedEmail === i ? 'gradient-border-active ring-1 ring-blue-500/30' : ''}`}
                            onClick={() => setExpandedEmail(expandedEmail === i ? null : i)}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${email.risk_level === 'high' ? 'bg-red-500/10 text-red-500' :
                                        email.risk_level === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                            'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {email.sender?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-bold truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight text-sm">
                                            {email.sender}
                                        </p>
                                        <p className="text-slate-400 text-sm truncate mt-0.5">{email.subject}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {getRiskBadge(email.risk_level)}
                                    <ChevronDown className={`w-4 h-4 text-slate-600 transition-all duration-300 ${expandedEmail === i ? 'rotate-180 text-blue-400' : 'group-hover:text-slate-400'}`} />
                                </div>
                            </div>

                            {expandedEmail === i && (
                                <div className="mt-6 pt-6 border-t border-white/10 animate-fadeIn">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Threat Analysis</h4>
                                    <div className="space-y-2">
                                        {email.detection_reasons?.length > 0 ? (
                                            email.detection_reasons.map((r, j) => (
                                                <div key={j} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                                    <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${email.risk_level === 'high' ? 'text-red-400' : 'text-yellow-400'}`} />
                                                    <p className="text-slate-300 text-sm leading-relaxed">{r}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/10">
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                                <p className="text-green-400/80 text-sm font-medium">No red flags detected in our automated scan.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        {email.risk_level !== 'safe' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleMarkSafe(email.message_id); }}
                                                className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-500 transition-colors shadow-lg shadow-green-500/20 active:scale-95 flex items-center gap-2"
                                            >
                                                <Shield className="w-4 h-4" />
                                                Trust Sender
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors active:scale-95 flex items-center gap-2 border border-white/5"
                                        >
                                            <X className="w-4 h-4" />
                                            Dismiss Alert
                                        </button>
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
