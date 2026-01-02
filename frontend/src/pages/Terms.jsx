import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, ArrowLeft, Heart } from 'lucide-react';

function Terms() {
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
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-500" />
                        </div>
                        <h1 className="text-4xl font-bold">Terms of Service</h1>
                    </div>

                    <div className="glass-card p-8 prose prose-invert max-w-none">
                        <p className="text-slate-400 mb-6 italic">Last Updated: December 26, 2025</p>

                        <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-slate-400 mb-6">
                            By accessing MailShield, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Use License</h2>
                        <p className="text-slate-400 mb-6">
                            Permission is granted to use MailShield for personal, non-commercial security monitoring of your own Gmail account. You may not use this platform for any illegal activities.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Disclaimer</h2>
                        <p className="text-slate-400 mb-6">
                            While MailShield uses advanced detection logic, no security platform is 100% accurate. We provide this service "as is" and are not responsible for any missed threats or false positives.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Account Security</h2>
                        <p className="text-slate-400 mb-6">
                            You are responsible for maintaining the security of your Google account. MailShield only acts as a protective layer on top of your existing Gmail security.
                        </p>
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
                        <Link to="/about" className="hover:text-white">Our Mission</Link>
                        <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Terms;
