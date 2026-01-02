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
    ArrowLeft,
    Heart
} from 'lucide-react';

function Developers() {
    const developers = [
        {
            name: "P Ganesh Krishna Reddy",
            role: "Security Engineer & Full Stack Developer",
            initials: "PG",
            color: "blue",
            imageBg: "bg-blue-600/20",
            textColor: "text-blue-500",
            description: "Final Year Computer Science (Cyber Security) student at LPU. A certified Security Engineer and Full Stack Developer with deep expertise in data protection, risk assessment, and secure system architecture. Recipient of the Reliance Foundation Scholarship.",
            skills: ["CompTIA Security+ / CySA+ / PenTest+", "Web & API Security (OWASP)", "Data Privacy & Governance", "FastAPI / React / Node.js", "Linux Hardening (Red Hat Certified)"],
            links: {
                portfolio: "https://pganeshkrishnareddy.netlify.app",
                linkedin: "https://linkedin.com/in/pganeshkrishnareddy",
                github: "https://github.com/ganeshkrishnareddy",
                email: "pganeshkrishnareddy@gmail.com"
            },
            projects: [
                {
                    name: "MailShield",
                    desc: "Architected the backend and security detection logic for this platform.",
                    tech: "FastAPI, OAuth 2.0, Python"
                },
                {
                    name: "Security Risk Validation",
                    desc: "Conducted structured assessments identifying data exposure and access flaws.",
                    tech: "Burp Suite, OWASP ZAP, Nmap"
                },
                {
                    name: "Secure File Transfer",
                    desc: "Built an encrypted solution emphasizing confidentiality and HMAC integrity.",
                    tech: "AES-256, RSA, HMAC, Linux"
                }
            ]
        },
        {
            name: "Vinodh Kumar Reddy Kora",
            role: "Security Researcher & Android Developer",
            initials: "VK",
            color: "purple",
            imageBg: "bg-purple-600/20",
            textColor: "text-purple-500",
            description: "B.Tech (Hons.) in Cyber Security and Blockchain student at LPU. A certified Cybersecurity Enthusiast with a focus on defensive security, digital forensics, and network defense. Expert in mobile security and threat analysis.",
            skills: ["CompTIA Security+ / Network+ ce", "Digital Forensic Investigator (QHC)", "Blockchain & Defensive Security", "Android (Kotlin / Jetpack Compose)", "Incident Response & Forensics"],
            links: {
                linkedin: "https://www.linkedin.com/in/vinodh-kumar-reddy-kora/",
                email: "vinodhreddy@example.com"
            },
            projects: [
                {
                    name: "MailShield Android",
                    desc: "Developed the native Android application and mobile threat analysis layer.",
                    tech: "Kotlin, Jetpack Compose, Retrofit"
                },
                {
                    name: "Digital Forensics Analysis",
                    desc: "Conducted deep-dive investigations into security incidents and data breaches.",
                    tech: "Quick Heal Certified Forensics"
                },
                {
                    name: "PhishGuard Logic",
                    desc: "Implemented advanced heuristic algorithms for detecting malicious mail patterns.",
                    tech: "Python, Scikit-learn, Android"
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

                    {/* Independence Banner */}
                    <div className="text-center fade-in">
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Original Concept & Independent Implementation
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-slate-800 bg-slate-950/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-sm">
                        <Link to="/about" className="hover:text-white transition-colors">Our Mission</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                    <div className="text-slate-500 text-sm text-center md:text-right">
                        © 2025 MailShield Project. <br />
                        Built with <Heart className="inline w-4 h-4 text-red-500 fill-red-500" /> by the <span className="text-white font-semibold">MailShield Pioneers</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Developers;
