import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Target, Eye, Lock, Zap, ArrowLeft, Heart, Sparkles } from 'lucide-react';

function About() {
    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-3">
                            <Shield className="w-8 h-8 text-blue-500" />
                            <span className="text-xl font-bold gradient-text">MailShield</span>
                        </Link>
                        <Link to="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Hero */}
                    <div className="text-center mb-16 fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Our Vision for a Safer Internet
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                            Beyond Just Detection: <br />
                            <span className="gradient-text">Empowering Digital Trust</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed">
                            MailShield was born from a simple observation: phishing isn't just a technical problem; it's an exploitation of human trust. We're here to give that trust back.
                        </p>
                    </div>

                    {/* Mission Cards */}
                    <div className="grid md:grid-cols-2 gap-8 mb-20">
                        <div className="glass-card p-8 card-hover">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                                <Target className="w-6 h-6 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-white">Our Mission</h2>
                            <p className="text-slate-400 leading-relaxed">
                                To democratize advanced cybersecurity tools. We believe everyone—regardless of technical skill—deserves to have professional-grade phishing protection protecting their personal information.
                            </p>
                        </div>
                        <div className="glass-card p-8 card-hover">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                                <Lock className="w-6 h-6 text-purple-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-white">Privacy Manifesto</h2>
                            <p className="text-slate-400 leading-relaxed">
                                Security shouldn't come at the cost of privacy. Our "Zero-Storage" architecture ensures that while we scan your mail for threats, we never actually 'read' your life.
                            </p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="prose prose-invert max-w-none">
                        <h3 className="text-2xl font-bold text-white mb-4">The MailShield Difference</h3>
                        <p className="text-slate-400 mb-6">
                            Most security platforms focus on enterprise gates. MailShield is focused on the individual. We've combined deep learning patterns with traditional heuristic analysis to create an engine that's fast, accurate, and completely transparent.
                        </p>
                        <div className="glass-card p-8 border-l-4 border-blue-500">
                            <h4 className="text-lg font-bold text-white mb-2 italic">"Innovation is not just about what you build, but who you protect."</h4>
                            <p className="text-slate-500">— The MailShield Pioneers</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-slate-800 bg-slate-950/50">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-slate-500 flex items-center justify-center gap-2 mb-4">
                        Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by the <span className="text-white font-semibold">MailShield Pioneers</span>
                    </p>
                    <div className="flex justify-center gap-6 text-sm text-slate-400">
                        <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white">Terms of Service</Link>
                        <Link to="/developers" className="hover:text-white">Meet the Team</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default About;
