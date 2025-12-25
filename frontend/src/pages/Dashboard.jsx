import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import api from '../services/api';
import {
    Shield,
    Mail,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    RefreshCw,
    Clock,
    Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function Dashboard() {
    const { user, fetchUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanResults, setScanResults] = useState(null);
    const [recentEmails, setRecentEmails] = useState([]);

    useEffect(() => {
        loadRecentEmails();
    }, []);

    const loadRecentEmails = async () => {
        try {
            const response = await api.get('/api/emails/recent?limit=10');
            setRecentEmails(response.data);
        } catch (error) {
            console.error('Failed to load emails:', error);
        }
    };

    const handleScan = async () => {
        setScanning(true);
        setScanResults(null);
        try {
            const response = await api.post('/api/emails/scan', {
                max_emails: 50,
                include_read: false
            });
            setScanResults(response.data);
            await fetchUser(); // Refresh user stats
            await loadRecentEmails();
        } catch (error) {
            console.error('Scan failed:', error);
            alert('Scan failed. Please ensure Gmail is connected.');
        } finally {
            setScanning(false);
        }
    };

    const stats = [
        {
            label: 'Emails Scanned',
            value: user?.emails_scanned || 0,
            icon: Mail,
            color: 'blue',
            bgColor: 'bg-blue-500/20',
            textColor: 'text-blue-400'
        },
        {
            label: 'Phishing Blocked',
            value: user?.phishing_detected || 0,
            icon: AlertTriangle,
            color: 'red',
            bgColor: 'bg-red-500/20',
            textColor: 'text-red-400'
        },
        {
            label: 'Suspicious',
            value: user?.suspicious_detected || 0,
            icon: Shield,
            color: 'yellow',
            bgColor: 'bg-yellow-500/20',
            textColor: 'text-yellow-400'
        },
        {
            label: 'Safe Emails',
            value: (user?.emails_scanned || 0) - (user?.phishing_detected || 0) - (user?.suspicious_detected || 0),
            icon: CheckCircle,
            color: 'green',
            bgColor: 'bg-green-500/20',
            textColor: 'text-green-400'
        }
    ];

    // Pie chart data
    const pieData = [
        { name: 'Phishing', value: user?.phishing_detected || 0, color: '#ef4444' },
        { name: 'Suspicious', value: user?.suspicious_detected || 0, color: '#f59e0b' },
        { name: 'Safe', value: Math.max(0, (user?.emails_scanned || 0) - (user?.phishing_detected || 0) - (user?.suspicious_detected || 0)), color: '#22c55e' }
    ].filter(d => d.value > 0);

    const getRiskBadge = (level) => {
        const badges = {
            high: { class: 'risk-high', label: '🚨 High Risk' },
            medium: { class: 'risk-medium', label: '⚠️ Suspicious' },
            low: { class: 'risk-low', label: 'ℹ️ Low Risk' },
            safe: { class: 'risk-safe', label: '✅ Safe' }
        };
        const badge = badges[level] || badges.safe;
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>{badge.label}</span>;
    };

    return (
        <div className="space-y-6 fade-in">
            {/* Welcome Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">
                        Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {user?.last_scan_at
                            ? `Last scan: ${new Date(user.last_scan_at.endsWith('Z') ? user.last_scan_at : user.last_scan_at + 'Z').toLocaleString()}`
                            : 'Start your first scan to protect your inbox'}
                    </p>
                </div>
                <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                    {scanning ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <Zap className="w-5 h-5" />
                            Scan Now
                        </>
                    )}
                </button>
            </div>

            {/* Scan Results Alert */}
            {scanResults && (
                <div className="glass-card p-6 border-l-4 border-blue-500 fade-in">
                    <h3 className="text-lg font-semibold text-white mb-2">Scan Complete!</h3>
                    <div className="flex flex-wrap gap-6 text-sm">
                        <div><span className="text-slate-400">Scanned:</span> <span className="text-white font-medium">{scanResults.total_scanned}</span></div>
                        <div><span className="text-slate-400">Phishing:</span> <span className="text-red-400 font-medium">{scanResults.phishing_found}</span></div>
                        <div><span className="text-slate-400">Suspicious:</span> <span className="text-yellow-400 font-medium">{scanResults.suspicious_found}</span></div>
                        <div><span className="text-slate-400">Safe:</span> <span className="text-green-400 font-medium">{scanResults.safe_found}</span></div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="stat-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                </div>
                                <TrendingUp className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className={`text-3xl font-bold ${stat.textColor} mb-1`}>
                                {stat.value.toLocaleString()}
                            </div>
                            <div className="text-slate-400 text-sm">{stat.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Pie Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
                    {pieData.length > 0 ? (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-slate-500">
                            No scan data yet
                        </div>
                    )}
                    <div className="flex justify-center gap-4 mt-4">
                        {pieData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-slate-400 text-sm">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Emails */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Recent Emails</h3>
                        <button
                            onClick={loadRecentEmails}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>

                    {recentEmails.length > 0 ? (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {recentEmails.map((email, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${email.risk_level === 'high' ? 'bg-red-500' :
                                        email.risk_level === 'medium' ? 'bg-yellow-500' :
                                            email.risk_level === 'low' ? 'bg-blue-500' : 'bg-green-500'
                                        }`}></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-white font-medium truncate">{email.sender}</p>
                                                <p className="text-slate-400 text-sm truncate">{email.subject}</p>
                                            </div>
                                            {getRiskBadge(email.risk_level)}
                                        </div>
                                        {email.detection_reasons?.length > 0 && (
                                            <p className="text-slate-500 text-xs mt-2 truncate">
                                                {email.detection_reasons[0]}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No emails scanned yet</p>
                            <p className="text-sm">Click "Scan Now" to analyze your inbox</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={handleScan}
                        disabled={scanning}
                        className="p-4 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 transition-colors text-left"
                    >
                        <Zap className="w-6 h-6 text-blue-400 mb-2" />
                        <span className="text-white font-medium block">Quick Scan</span>
                        <span className="text-slate-400 text-sm">Scan unread emails</span>
                    </button>

                    <button
                        onClick={() => alert("Auto-scanning is enabled by default every 30 minutes! Configure in Settings.")}
                        className="p-4 rounded-xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 transition-colors text-left"
                    >
                        <Clock className="w-6 h-6 text-purple-400 mb-2" />
                        <span className="text-white font-medium block">Schedule Scan</span>
                        <span className="text-slate-400 text-sm">Manage interval</span>
                    </button>

                    <button
                        onClick={() => window.open(`${api.defaults.baseURL}/api/emails/report/pdf`, '_blank')}
                        className="p-4 rounded-xl bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 transition-colors text-left"
                    >
                        <Shield className="w-6 h-6 text-green-400 mb-2" />
                        <span className="text-white font-medium block">Security Report</span>
                        <span className="text-slate-400 text-sm">Download PDF</span>
                    </button>

                    <button
                        onClick={() => {
                            if (window.confirm("Export all your data? This will download a JSON file.")) {
                                window.open(`${api.defaults.baseURL}/api/emails/export`, '_blank');
                            }
                        }}
                        className="p-4 rounded-xl bg-yellow-600/20 border border-yellow-500/30 hover:bg-yellow-600/30 transition-colors text-left"
                    >
                        <Mail className="w-6 h-6 text-yellow-400 mb-2" />
                        <span className="text-white font-medium block">Export Data</span>
                        <span className="text-slate-400 text-sm">GDPR Download</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
