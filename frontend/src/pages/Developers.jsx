import React from 'react';
import { Link } from 'react-router-dom';
import {
    Shield,
    Github,
    Linkedin,
    Mail,
    Globe,
    Code,
    Server,
    Database,
    Smartphone,
    Cpu,
    Briefcase,
    ExternalLink,
    ArrowLeft
} from 'lucide-react';

function Developers() {
    const developers = [
        {
            name: "P Ganesh Krishna Reddy",
            role: "Lead Full Stack & Backend Developer",
            initials: "PG",
            color: "blue",
            imageBg: "bg-blue-600/20",
            textColor: "text-blue-500",
            description: "Final Year B.Tech CSE Student at Lovely Professional University. A passionate Full Stack Developer who architected the entire MailShield platform, including the FastAPI backend, React frontend service integration, and scalable system design.",
            skills: ["Full Stack Development", "FastAPI / Python", "React / Node.js", "System Architecture", "Cloud Deployment"],
            links: {
                portfolio: "https://pganeshkrishnareddy.netlify.app",
                linkedin: "https://linkedin.com/in/pganeshkrishnareddy",
                github: "https://github.com/ganeshkrishnareddy",
                email: "pganeshkrishnareddy@gmail.com",
                phone: "+91-8374622779"
            },
            projects: [
                {
                    name: "MailShield",
                    desc: "Privacy-first phishing detection platform with real-time analysis.",
                    tech: "FastAPI, React, Tensorflow"
                },
                {
                    name: "Delivery Management System",
                    desc: "Comprehensive logistics platform with tracking and admin dashboard.",
                    tech: "MERN Stack, Flutter, Firebase"
                },
                {
                    name: "AI Code Assistant",
                    desc: "Agentic coding tool built with LLM integration.",
                    tech: "Python, LangChain, OpenAI"
                }
            ]
        },
        {
            name: "K Vinodh Kumar Reddy",
            role: "Security Research & Android Developer",
            initials: "KV",
            color: "purple",
            imageBg: "bg-purple-600/20",
            textColor: "text-purple-500",
            description: "Final Year B.Tech CSE Student at Lovely Professional University. Focused on cybersecurity and mobile development. Developed the core phishing detection algorithms, including homoglyph analysis and spam filters, and built the native Android application.",
            skills: ["Android Development (Kotlin)", "Cybersecurity", "Phishing Detection Algorithms", "Spam Filtering Logic", "Mobile UI/UX"],
            links: {
                email: "vinodhreddy@example.com"
            },
            projects: [
                {
                    name: "PhishGuard Android",
                    desc: "Native mobile app for on-the-go email security scanning.",
                    tech: "Kotlin, Jetpack Compose"
                },
                {
                    name: "SpamFilter Algo",
                    desc: "Advanced heuristic algorithm for detecting spam patterns.",
                    tech: "Python, Scikit-learn"
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white font-inter selection:bg-blue-500/30">

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
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-16 fade-in">
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                            Meet the <span className="gradient-text">Minds</span> Behind MailShield
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Final Year Computer Science Students from <br />
                            <strong className="text-white">Lovely Professional University (LPU)</strong>
                        </p>
                    </div>

                    {/* Developers Grid */}
                    <div className="grid lg:grid-cols-2 gap-12 mb-20">
                        {developers.map((dev, index) => (
                            <div key={index} className="glass-card p-8 lg:p-10 card-hover fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                                {/* Profile Header */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
                                    <div className={`w-24 h-24 rounded-full ${dev.imageBg} flex items-center justify-center flex-shrink-0 text-3xl font-bold ${dev.textColor}`}>
                                        {dev.initials}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">{dev.name}</h2>
                                        <div className={`inline-block px-3 py-1 rounded-full ${dev.imageBg} ${dev.textColor} font-medium text-sm mb-4`}>
                                            {dev.role}
                                        </div>
                                        <p className="text-slate-400 leading-relaxed">
                                            {dev.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Core Competencies</h3>
                                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                        {dev.skills.map((skill, sIndex) => (
                                            <span key={sIndex} className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Projects */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2 justify-center sm:justify-start">
                                        <Briefcase className="w-4 h-4" /> Notable Projects
                                    </h3>
                                    <div className="space-y-3">
                                        {dev.projects.map((project, pIndex) => (
                                            <div key={pIndex} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-semibold text-white">{project.name}</h4>
                                                    <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                                        {project.tech}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-400">{project.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact Links */}
                                <div className="pt-6 border-t border-slate-800 flex flex-wrap gap-4 justify-center sm:justify-start text-sm">
                                    {dev.links.portfolio && (
                                        <a href={dev.links.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
                                            <Globe className="w-4 h-4" /> Portfolio
                                        </a>
                                    )}
                                    {dev.links.github && (
                                        <a href={dev.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                            <Github className="w-4 h-4" /> GitHub
                                        </a>
                                    )}
                                    {dev.links.linkedin && (
                                        <a href={dev.links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
                                            <Linkedin className="w-4 h-4" /> LinkedIn
                                        </a>
                                    )}
                                    {dev.links.email && (
                                        <a href={`mailto:${dev.links.email}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                            <Mail className="w-4 h-4" /> Email
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* University Banner */}
                    <div className="text-center fade-in">
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Mentored by Expert Faculty at LPU
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-slate-800 bg-slate-950/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-slate-500 text-sm">
                        © 2025 MailShield.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Developers;
