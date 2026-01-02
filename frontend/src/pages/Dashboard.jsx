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
    Zap,
    ChevronRight,
    Settings as SettingsIcon,
    Bell
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

function Dashboard() {
    const { user, fetchUser, isDemoMode } = useAuth();
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanResults, setScanResults] = useState(null);
    const [recentEmails, setRecentEmails] = useState([]);
    const [recentUrlScans, setRecentUrlScans] = useState([]);

    useEffect(() => {
        if (isDemoMode) {
            generateMockData();
        } else {
            loadRecentEmails();
            loadRecentUrlScans();
        }
    }, [isDemoMode]);

    const generateMockData = () => {
        const mockEmails = [
            { sender: 'security@paypa1.co', subject: 'Urgent: Account Verification Required', risk_level: 'high', timestamp: new Date().toISOString() },
            { sender: 'hr@amazon-office.net', subject: 'Your tax documents are ready', risk_level: 'high', timestamp: new Date().toISOString() },
            { sender: 'it-support@microsoft.com.co', subject: 'Critical Security Patch for Windows', risk_level: 'medium', timestamp: new Date().toISOString() },
            { sender: 'newsletter@github.com', subject: 'Your weekly code summary', risk_level: 'safe', timestamp: new Date().toISOString() },
            { sender: 'shipping@fedex-tracking.biz', subject: 'Package delivery failed - Action needed', risk_level: 'medium', timestamp: new Date().toISOString() }
        ];

        const mockUrls = [
            { url: 'https://login-verification-secure.com/auth', risk_level: 'high' },
            { url: 'https://github.com/ganeshkrishnareddy', risk_level: 'low' },
            { url: 'http://amazon-prime-gift.xyz/claim', risk_level: 'high' }
        ];

        setRecentEmails(mockEmails);
        setRecentUrlScans(mockUrls);
    };

    const loadRecentEmails = async () => {
        try {
            const response = await api.get('/api/emails/recent?limit=5');
            setRecentEmails(response.data);
        } catch (error) {
            console.error('Failed to load emails:', error);
        }
    };

    const loadRecentUrlScans = async () => {
        try {
            const response = await api.get('/api/threats/recent-urls');
            setRecentUrlScans(response.data);
        } catch (error) {
            console.error('Failed to load URL scans:', error);
        }
    };

    const handleScan = async () => {
        setScanning(true);
        setScanResults(null);

        if (isDemoMode) {
            // Simulate a realistic scan delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            setScanResults({
                total_scanned: 48,
                phishing_found: 3,
                suspicious_found: 1
            });
            setScanning(false);
            return;
        }

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
            label: 'Total Scanned',
            value: user?.emails_scanned || 0,
            icon: Mail,
            color: 'blue',
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-400'
        },
        {
            label: 'Phishing Found',
            value: user?.phishing_detected || 0,
            icon: AlertTriangle,
            color: 'red',
            bgColor: 'bg-red-500/10',
            textColor: 'text-red-400'
        },
        {
            label: 'Suspicious',
            value: user?.suspicious_detected || 0,
            icon: Shield,
            color: 'yellow',
            bgColor: 'bg-yellow-500/10',
            textColor: 'text-yellow-400'
        },
        {
            label: 'Protected',
            value: (user?.emails_scanned || 0) - (user?.phishing_detected || 0) - (user?.suspicious_detected || 0),
            icon: CheckCircle,
            color: 'green',
            bgColor: 'bg-green-500/10',
            textColor: 'text-green-400'
        }
    ];

    const pieData = [
        { name: 'Phishing', value: user?.phishing_detected || 0, color: '#ef4444' },
        { name: 'Suspicious', value: user?.suspicious_detected || 0, color: '#f59e0b' },
        { name: 'Safe', value: Math.max(0, (user?.emails_scanned || 0) - (user?.phishing_detected || 0) - (user?.suspicious_detected || 0)), color: '#22c55e' }
    ].filter(d => d.value > 0);

    const getRiskBadge = (level) => {
        const badges = {
            high: 'badge-high',
            medium: 'badge-medium',
            low: 'badge-low',
            safe: 'badge-safe'
        };
        const labels = {
            high: 'PHISHING',
            medium: 'SUSPICIOUS',
            low: 'MODERATE',
            safe: 'SAFE'
        };
        return <span className={`badge-risk ${badges[level] || badges.safe}`}>{labels[level] || labels.safe}</span>;
    };

    return (
        <div className="space-y-8 fade-in">
            {/* Optimized Header for Mobile */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-tight">
                            Dashboard
                        </h1>
                        {isDemoMode && (
                            <div className="px-2 py-1 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                Demo Mode
                            </div>
                        )}
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                        {isDemoMode ? 'Simulating real-time AI phishing analysis' : (user?.last_scan_at
                            ? `Last scan: ${new Date(user.last_scan_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : 'Start protecting your inbox')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/settings" className="w-11 h-11 flex items-center justify-center rounded-2xl glass-interactive text-slate-400 hover:text-white">
                        <SettingsIcon className="w-5 h-5" />
                    </Link>
                    <div className="hidden lg:flex items-center gap-3 bg-slate-800/50 p-1.5 rounded-2xl border border-white/5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-medium mr-2">{user?.name?.split(' ')[0]}</span>
                    </div>
                </div>
            </div>

            {/* Premium Call-to-Action */}
            <div className="glass-card p-6 lg:p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-700"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">Ready for a scan?</h2>
                        <p className="text-slate-400 text-sm lg:text-base max-w-sm">
                            We'll check your recent emails for phishing attempts and malicious links.
                        </p>
                    </div>
                    <button
                        onClick={handleScan}
                        disabled={scanning}
                        className="btn-primary w-full md:w-auto min-w-[160px] relative overflow-hidden group/btn"
                    >
                        {scanning ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>Scanning Inbox...</span>
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5 text-yellow-400 group-hover/btn:scale-125 transition-transform" />
                                <span>Analyze Recent Emails</span>
                            </>
                        )}
                        {scanning && <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-[scan_2s_linear_infinite]" style={{ width: '100%' }}></div>}
                    </button>
                </div>
            </div>

            {/* Scan Results - Compact & Impactful */}
            {scanResults && (
                <div className="glass-card bg-blue-500/5 border-blue-500/20 p-5 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white font-bold">Scan Complete</p>
                            <p className="text-slate-400 text-xs">Analyzed {scanResults.total_scanned} emails</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center">
                            <div className="text-red-400 font-bold leading-none">{scanResults.phishing_found}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Phishing</div>
                        </div>
                        <div className="text-center">
                            <div className="text-yellow-400 font-bold leading-none">{scanResults.suspicious_found}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Suspicious</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid - Better Mobile Responsiveness */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-1 lg:px-0">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="stat-card group hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex items-center justify-between w-full">
                                <div className={`stat-icon ${stat.bgColor} ${stat.textColor}`}>
                                    <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrendingUp className="w-4 h-4 text-slate-500" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className={`text-2xl lg:text-3xl font-bold ${stat.textColor} tracking-tight`}>
                                    {stat.value.toLocaleString()}
                                </div>
                                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">{stat.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Risk Distribution - Enhanced visual hierarchy */}
                <div className="glass-card p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        Threat Distribution
                        <Shield className="w-4 h-4 text-blue-400" />
                    </h3>
                    {pieData.length > 0 ? (
                        <div className="flex-1 min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: '#0f172a',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                            <Shield className="w-12 h-12 opacity-10 mb-4" />
                            <p className="text-sm">Scan to see distribution</p>
                        </div>
                    )}
                    <div className="grid grid-cols-3 gap-2 mt-6">
                        {pieData.map((item, index) => (
                            <div key={index} className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/5">
                                <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: item.color }}></div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">{item.name}</span>
                                <span className="text-sm font-bold text-white leading-none mt-1">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity - Premium List Design */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Recent Email Threats</h3>
                        <Link to="/emails" className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 group">
                            Full Insights
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {recentEmails.length > 0 ? (
                        <div className="space-y-4">
                            {recentEmails.map((email, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center gap-4 group cursor-pointer"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform ${email.risk_level === 'high' ? 'bg-red-500/20 text-red-400' :
                                        email.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {email.sender?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <p className="text-white font-bold truncate text-sm lg:text-base">{email.sender}</p>
                                            {getRiskBadge(email.risk_level)}
                                        </div>
                                        <p className="text-slate-400 text-xs lg:text-sm truncate pr-4">{email.subject}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors hidden sm:block" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-500">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="font-bold text-slate-400">No threats detected</p>
                            <p className="text-xs max-w-[200px] mx-auto mt-2">Recently analyzed emails will appear here if risks are found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Browser Protection - Dark Mode/Extension Style */}
            <div className="glass-card p-6 overflow-hidden relative">
                <div className="absolute bottom-0 right-0 opacity-10 -mr-8 -mb-8">
                    <Shield className="w-32 h-32 text-blue-400" />
                </div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            Real-time Protection
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        </h3>
                        <p className="text-slate-400 text-xs">Extension active on 124 websites</p>
                    </div>
                    <button onClick={loadRecentUrlScans} className="text-slate-500 hover:text-white transition-all">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {recentUrlScans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentUrlScans.slice(0, 3).map((scan, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${scan.risk_level === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-white text-xs font-bold truncate">{scan.url}</p>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{scan.risk_level} risk detected</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-4 text-center border-2 border-dashed border-white/5 rounded-2xl">
                        <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Extension Data Hub</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;

