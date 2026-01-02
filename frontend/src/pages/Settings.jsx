import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import api from '../services/api';
import { Settings as SettingsIcon, Bell, MessageCircle, Shield, ToggleLeft, ToggleRight, Send, Trash2, Unlink, ChevronRight } from 'lucide-react';

function Settings() {
    const { user, fetchUser } = useAuth();
    const [settings, setSettings] = useState({
        auto_labeling_enabled: true,
        notification_enabled: true,
        notification_level: 'high'
    });
    const [telegramCode, setTelegramCode] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setSettings({
                auto_labeling_enabled: user.auto_labeling_enabled,
                notification_enabled: user.notification_enabled,
                notification_level: user.notification_level || 'high'
            });
        }
    }, [user]);

    const updateSetting = async (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        try {
            await api.put('/api/settings/', { [key]: value });
            fetchUser();
        } catch (error) { console.error('Failed to update:', error); }
    };

    const getTelegramCode = async () => {
        try {
            const response = await api.get('/api/notifications/telegram/connect');
            setTelegramCode(response.data.verification_code || '');
        } catch (error) { console.error('Failed to get code:', error); }
    };

    const sendTestNotification = async () => {
        setLoading(true);
        try {
            await api.post('/api/notifications/test');
            alert('Test notification sent!');
        } catch (error) { alert('Failed to send test notification'); }
        finally { setLoading(false); }
    };

    const Toggle = ({ enabled, onChange }) => (
        <button onClick={() => onChange(!enabled)} className="focus:outline-none p-1">
            {enabled ? <ToggleRight className="w-12 h-7 text-blue-500" /> : <ToggleLeft className="w-12 h-7 text-slate-700" />}
        </button>
    );

    return (
        <div className="space-y-8 fade-in max-w-4xl">
            <div>
                <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-slate-400 text-sm mt-1">Manage your protection and account preferences</p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Security Settings Section */}
                <div className="lg:col-span-3 space-y-6">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Security & Automation</h2>

                    {/* Auto Labeling */}
                    <div className="glass-card p-6 lg:p-8">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
                                    <Shield className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-lg">Gmail Auto-Labeling</h3>
                                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                                        MailShield will automatically mark emails with [PHISH] or [SUSP] labels in your Gmail inbox for quick identification.
                                    </p>
                                </div>
                            </div>
                            <Toggle enabled={settings.auto_labeling_enabled} onChange={(v) => updateSetting('auto_labeling_enabled', v)} />
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="glass-card p-6 lg:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/10">
                                    <Bell className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-lg">Threat Notifications</h3>
                                    <p className="text-slate-400 text-sm mt-1">Instant alerts when new threats are detected.</p>
                                </div>
                            </div>
                            <Toggle enabled={settings.notification_enabled} onChange={(v) => updateSetting('notification_enabled', v)} />
                        </div>

                        <div className="pl-0 lg:pl-[68px]">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Risk Threshold</p>
                                <div className="flex flex-wrap gap-2">
                                    {['high', 'medium', 'all'].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => updateSetting('notification_level', level)}
                                            className={`px-5 py-2.5 rounded-xl capitalize text-sm font-bold transition-all duration-300 ${settings.notification_level === level
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400'
                                                : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'
                                                }`}
                                        >
                                            {level === 'all' ? 'All Risks' : `${level} Risks Only`}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-slate-500 text-xs mt-4 italic">
                                    * High risk includes phishing attempts. Medium includes suspicious redirects.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Telegram Integration */}
                    <div className="glass-card p-6 lg:p-8">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/10">
                                <MessageCircle className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg">Telegram Connection</h3>
                                <p className="text-slate-400 text-sm mt-1">Receive security alerts on your mobile via Telegram bot.</p>
                            </div>
                        </div>

                        <div className="pl-0 lg:pl-[68px]">
                            {user?.telegram_connected ? (
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-green-500/10 border border-green-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-green-400 font-bold text-sm tracking-tight">Active & Connected</span>
                                    </div>
                                    <button onClick={sendTestNotification} disabled={loading}
                                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors">
                                        {loading ? 'Sending...' : 'Send Test'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <button onClick={getTelegramCode} className="btn-primary w-full lg:w-auto h-auto px-8">
                                        Link Telegram Account
                                    </button>
                                    {telegramCode && (
                                        <div className="p-5 bg-slate-900 border border-blue-500/30 rounded-2xl animate-fadeIn">
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Setup Instructions</p>
                                            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                                                Open <strong>@mailshield_alert_bot</strong> on Telegram and send this unique code to verify your account:
                                            </p>
                                            <div className="text-3xl font-mono text-blue-400 tracking-wider bg-black/30 p-4 rounded-xl text-center border border-white/5">
                                                {telegramCode}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Account & Metadata Sidebar */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Data & Privacy</h2>

                    <div className="glass-card p-6 lg:p-8 space-y-6">
                        <div>
                            <h3 className="text-white font-bold">Data Management</h3>
                            <p className="text-slate-400 text-xs mt-1">MailShield respects your privacy under GDPR guidelines.</p>
                        </div>

                        <div className="space-y-3">
                            <button onClick={async () => {
                                const res = await api.get('/api/settings/privacy-export');
                                console.log('Exported data:', res.data);
                                alert('Your request has been processed. Download JSON from console.');
                            }} className="btn-secondary w-full text-sm py-3 px-4">
                                Export Personal JSON
                            </button>

                            <div className="pt-4 border-t border-white/5">
                                <button onClick={() => {
                                    if (confirm('Disconnect from Gmail? Scans will stop immediately.')) {
                                        // Logic for disconnect
                                    }
                                }} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <Unlink className="w-4 h-4" />
                                        <span className="text-sm font-bold">Disconnect Gmail</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <button onClick={() => {
                                    if (confirm('Delete your entire account? This action is permanent and cannot be undone.')) {
                                        api.delete('/api/settings/account').then(() => window.location.href = '/');
                                    }
                                }} className="w-full mt-3 flex items-center gap-3 p-4 rounded-2xl bg-red-600/10 text-red-500 hover:bg-red-600/20 transition-all font-bold text-sm">
                                    <Trash2 className="w-4 h-4" />
                                    Delete MailShield Account
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 text-center">
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                            Built with Pride <br /> MailShield v1.0.0 Stable
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
