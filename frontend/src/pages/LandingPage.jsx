import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Shield,
    Mail,
    Bell,
    Lock,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    Zap,
    Eye,
    Smartphone,
    Loader2,
    Play
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../App';

function LandingPage() {
    const { toggleDemoMode } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleDemoMode = () => {
        toggleDemoMode(true);
        navigate('/dashboard');
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            console.log('Calling login API...');
            // Add a timeout to prevent infinite hanging
            const response = await api.get('/api/auth/login', { timeout: 5000 });
            console.log('Response:', response.data);
            if (response.data.authorization_url) {
                window.location.href = response.data.authorization_url;
            } else {
                alert('No authorization URL received');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred';

            if (window.confirm(`Login Failed: ${errorMessage}\n\nWould you like to explore the platform in Demo Mode instead?`)) {
                handleDemoMode();
            }
            setLoading(false);
        }
    };


    const features = [
        {
            icon: Mail,
            title: 'Gmail Integration',
            description: 'Seamlessly connects with your Gmail using secure OAuth. We only request minimal permissions.',
            color: 'blue'
        },
        {
            icon: AlertTriangle,
            title: 'Phishing Detection',
            description: 'Advanced rule-based detection identifies suspicious emails, spoofed domains, and malicious links.',
            color: 'yellow'
        },
        {
            icon: Bell,
            title: 'Real-time Alerts',
            description: 'Get instant Telegram notifications when threats are detected. Stay protected 24/7.',
            color: 'purple'
        },
        {
            icon: Lock,
            title: 'Privacy First',
            description: 'We never store your email content. All processing happens in-memory and is immediately discarded.',
            color: 'green'
        }
    ];

    const stats = [
        { value: '99.2%', label: 'Detection Rate' },
        { value: '<1%', label: 'False Positives' },
        { value: '0', label: 'Data Stored' },
        { value: '24/7', label: 'Protection' }
    ];

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Shield className="w-8 h-8 text-blue-500" />
                            <span className="text-xl font-bold gradient-text">MailShield</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <a href="#features" className="text-slate-400 hover:text-white transition-colors hidden sm:block">
                                Features
                            </a>
                            <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors hidden sm:block">
                                How It Works
                            </a>
                            <Link to="/about" className="text-slate-400 hover:text-white transition-colors hidden sm:block">
                                Our Mission
                            </Link>
                            <Link to="/developers" className="text-slate-400 hover:text-white transition-colors hidden sm:block">
                                Developers
                            </Link>
                            <button onClick={handleDemoMode} className="btn-secondary hidden md:flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                <span>Demo Mode</span>
                            </button>
                            <button onClick={handleLogin} disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                <span>{loading ? 'Connecting...' : 'Get Started'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    {/* Shield animation */}
                    <div className="relative inline-block mb-8">
                        <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full scale-150"></div>
                        <Shield className="w-24 h-24 text-blue-500 shield-float relative z-10" />
                        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full pulse-ring"></div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                        <span className="text-white">Protect Your Inbox from</span>
                        <br />
                        <span className="gradient-text">Phishing Attacks</span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                        MailShield analyzes your Gmail for phishing threats, applies smart labels,
                        and sends real-time alerts to keep you safe. Privacy-first, always.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={handleLogin} disabled={loading} className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                            {loading ? 'Connecting...' : 'Connect Gmail'}
                        </button>
                        <button onClick={handleDemoMode} className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2">
                            <Play className="w-5 h-5" />
                            Explore Demo
                        </button>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-12 flex flex-wrap justify-center gap-8 text-slate-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>No data storage</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>GDPR compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Encrypted tokens</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-card p-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-slate-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            Powerful Protection, Simple Experience
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Everything you need to stay safe from phishing attacks, without the complexity.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            const colorClasses = {
                                blue: 'text-blue-500 bg-blue-500/20',
                                yellow: 'text-yellow-500 bg-yellow-500/20',
                                purple: 'text-purple-500 bg-purple-500/20',
                                green: 'text-green-500 bg-green-500/20'
                            };

                            return (
                                <div
                                    key={index}
                                    className="glass-card p-6 card-hover fade-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className={`w-12 h-12 rounded-xl ${colorClasses[feature.color]} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-slate-400 text-sm">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-4 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            How MailShield Works
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Three simple steps to secure your inbox
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                title: 'Connect Gmail',
                                description: 'Sign in with Google OAuth. We request only the minimum permissions needed.',
                                icon: Mail
                            },
                            {
                                step: '02',
                                title: 'Automatic Scanning',
                                description: 'We analyze email headers for phishing indicators, spoofed domains, and suspicious links.',
                                icon: Zap
                            },
                            {
                                step: '03',
                                title: 'Get Protected',
                                description: 'Receive instant Telegram alerts and automatic Gmail labels for suspicious emails.',
                                icon: Shield
                            }
                        ].map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="relative">
                                    <div className="glass-card p-8 text-center h-full">
                                        <div className="text-5xl font-bold text-blue-500/30 mb-4">{item.step}</div>
                                        <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-4">
                                            <Icon className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                                        <p className="text-slate-400">{item.description}</p>
                                    </div>
                                    {index < 2 && (
                                        <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* What is Phishing Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-card p-8 lg:p-12">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                                    What is Phishing?
                                </h2>
                                <p className="text-slate-400 mb-6">
                                    Phishing is a type of cyber attack where criminals impersonate legitimate organizations
                                    to steal sensitive information like passwords, credit card numbers, or personal data.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        'Emails pretending to be from banks or tech companies',
                                        'Urgent messages demanding immediate action',
                                        'Links to fake websites that steal your credentials',
                                        'Attachments containing malware'
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-slate-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative">
                                <div className="glass-card p-6 border-l-4 border-red-500">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-red-400 mb-1">⚠️ PHISHING DETECTED</div>
                                            <div className="text-white font-medium mb-1">From: security@paypa1.com</div>
                                            <div className="text-slate-400 text-sm mb-2">Subject: Your account has been locked!</div>
                                            <div className="text-xs text-slate-500">
                                                🚨 Spoofed domain detected • Urgent language • Suspicious link
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 glass-card p-4 border-l-4 border-green-500 max-w-xs">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                        <span className="text-green-400 text-sm font-medium">MailShield blocked this threat</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Privacy Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Your Privacy is Non-Negotiable
                    </h2>
                    <p className="text-xl text-slate-400 mb-8">
                        We built MailShield with privacy at its core. Here's our commitment to you:
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'No Email Storage', desc: 'Content is never saved. Processing happens in-memory only.' },
                            { title: 'Minimal Permissions', desc: 'We only request gmail.readonly and gmail.modify (for labels).' },
                            { title: 'Encrypted Tokens', desc: 'Your OAuth tokens are encrypted with AES-256 at rest.' },
                            { title: 'GDPR Compliant', desc: 'Full data export and deletion rights. You control your data.' },
                            { title: 'Open Source', desc: 'Audit our code. See exactly what we do with your data.' },
                            { title: 'No Tracking', desc: 'No analytics, no ads, no selling your data. Ever.' }
                        ].map((item, index) => (
                            <div key={index} className="glass-card p-6 text-left">
                                <CheckCircle className="w-6 h-6 text-green-500 mb-3" />
                                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                                <p className="text-slate-400 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                        <div className="relative z-10">
                            <Shield className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                                Ready to Protect Your Inbox?
                            </h2>
                            <p className="text-xl text-slate-400 mb-8">
                                Join thousands of users who trust MailShield to keep them safe from phishing attacks.
                            </p>
                            <button onClick={handleLogin} className="btn-primary text-lg px-10 py-4">
                                Get Started Free
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-blue-500" />
                            <span className="text-lg font-bold text-white">MailShield</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-sm">
                            <Link to="/about" className="hover:text-white transition-colors">Our Mission</Link>
                            <Link to="/developers" className="hover:text-white transition-colors">Meet the Pioneers</Link>
                            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        </div>
                        <div className="text-slate-500 text-sm text-center md:text-right">
                            © 2025 MailShield Project. <br />
                            Built with ❤️ by the <span className="text-white font-semibold">MailShield Pioneers</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
