import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, ArrowLeft, Heart } from 'lucide-react';

function PrivacyPolicy() {
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
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-green-500" />
                        </div>
                        <h1 className="text-4xl font-bold">Privacy Policy</h1>
                    </div>

                    <div className="glass-card p-8 prose prose-invert max-w-none">
                        <p className="text-slate-400 mb-6 italic">Last Updated: December 26, 2025</p>

                        <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Our Commitment</h2>
                        <p className="text-slate-400 mb-6">
                            MailShield is built on the principle of "Minimally Necessary Data." We only access what is absolutely required to protect you from phishing.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Data We Access</h2>
                        <ul className="list-disc pl-6 text-slate-400 space-y-2 mb-6">
                            <li><strong>Email Headers:</strong> sender info, subject, and routing metadata.</li>
                            <li><strong>Gmail Labels:</strong> Only to create and apply security categories.</li>
                            <li><strong>Profile Info:</strong> Your email address and name for account identification.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. What We Never Store</h2>
                        <p className="text-slate-400 mb-6">
                            We <strong>never store the body content</strong> of your emails. Analysis happens in volatile memory (RAM) and is purged immediately after the scan is complete.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Security</h2>
                        <p className="text-slate-400 mb-6">
                            Your OAuth tokens are encrypted using military-grade AES-256 encryption at rest. We never share your data with third parties or advertisers.
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
                        <Link to="/terms" className="hover:text-white">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default PrivacyPolicy;
