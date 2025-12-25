import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import {
    Shield,
    LayoutDashboard,
    Mail,
    Settings,
    BookOpen,
    LogOut,
    Menu,
    X,
    Bell
} from 'lucide-react';

function Layout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Email Insights', href: '/emails', icon: Mail },
        { name: 'Settings', href: '/settings', icon: Settings },
        { name: 'Learn', href: '/awareness', icon: BookOpen },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 glass-card rounded-none lg:rounded-r-2xl
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full p-4">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-4 py-4 mb-6">
                        <div className="relative">
                            <Shield className="w-10 h-10 text-blue-500" />
                            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30"></div>
                        </div>
                        <span className="text-xl font-bold gradient-text">MailShield</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive(item.href)
                                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}
                  `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="border-t border-slate-700/50 pt-4 mt-4">
                        <div className="flex items-center gap-3 px-4 py-2 mb-3">
                            {user?.picture_url ? (
                                <img
                                    src={user.picture_url}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full border-2 border-blue-500/50"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                                    <span className="text-white font-semibold">
                                        {user?.name?.charAt(0) || user?.email?.charAt(0)}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="glass sticky top-0 z-30 px-4 py-3 lg:px-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-400 hover:text-white"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                                <Bell className="w-6 h-6" />
                                {user?.phishing_detected > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                                        {user.phishing_detected}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default Layout;
