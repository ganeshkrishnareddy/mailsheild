import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import api from '../services/api';
import { Settings as SettingsIcon, Bell, MessageCircle, Shield, ToggleLeft, ToggleRight, Send, Trash2 } from 'lucide-react';

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
        <button onClick={() => onChange(!enabled)} className="focus:outline-none">
            {enabled ? <ToggleRight className="w-10 h-6 text-blue-500" /> : <ToggleLeft className="w-10 h-6 text-slate-500" />}
        </button>
    );

    return (
        <div className="space-y-6 fade-in max-w-3xl">
            <h1 className="text-2xl font-bold text-white">Settings</h1>

            {/* Auto Labeling */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Auto Labeling</h3>
                            <p className="text-slate-400 text-sm">Automatically apply Gmail labels to flagged emails</p>
                        </div>
                    </div>
                    <Toggle enabled={settings.auto_labeling_enabled} onChange={(v) => updateSetting('auto_labeling_enabled', v)} />
                </div>
            </div>

            {/* Notifications */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Bell className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Notifications</h3>
                            <p className="text-slate-400 text-sm">Get alerts for suspicious emails</p>
                        </div>
                    </div>
                    <Toggle enabled={settings.notification_enabled} onChange={(v) => updateSetting('notification_enabled', v)} />
                </div>

                <div className="ml-16">
                    <p className="text-slate-400 text-sm mb-3">Notification Level</p>
                    <div className="flex gap-2">
                        {['high', 'medium', 'all'].map(level => (
                            <button key={level} onClick={() => updateSetting('notification_level', level)}
                                className={`px-4 py-2 rounded-lg capitalize ${settings.notification_level === level ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400'}`}>
                                {level} risk{level === 'all' ? 's' : ''}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Telegram */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Telegram Integration</h3>
                        <p className="text-slate-400 text-sm">
                            {user?.telegram_connected ? '✅ Connected' : 'Connect for instant alerts'}
                        </p>
                    </div>
                </div>

                {user?.telegram_connected ? (
                    <div className="flex gap-3">
                        <button onClick={sendTestNotification} disabled={loading}
                            className="btn-secondary flex items-center gap-2">
                            <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Send Test'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button onClick={getTelegramCode} className="btn-primary">Get Verification Code</button>
                        {telegramCode && (
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <p className="text-slate-400 text-sm mb-2">Send this code to @mailshield_alert_bot:</p>
                                <p className="text-2xl font-mono text-blue-400">{telegramCode}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Privacy */}
            <div className="glass-card p-6">
                <h3 className="text-white font-medium mb-4">Privacy & Data</h3>
                <div className="space-y-3">
                    <button onClick={async () => {
                        const res = await api.get('/api/settings/privacy-export');
                        console.log('Exported data:', res.data);
                        alert('Data exported to console');
                    }} className="btn-secondary w-full justify-center">Export My Data</button>
                    <button onClick={() => {
                        if (confirm('Delete your account? This cannot be undone.')) {
                            api.delete('/api/settings/account').then(() => window.location.href = '/');
                        }
                    }} className="w-full px-4 py-3 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
