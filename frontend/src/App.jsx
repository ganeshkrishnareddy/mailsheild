import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Developers from './pages/Developers';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Dashboard from './pages/Dashboard';
import EmailInsights from './pages/EmailInsights';
import Settings from './pages/Settings';
import Awareness from './pages/Awareness';
import AuthCallback from './pages/AuthCallback';
import Layout from './components/Layout';
import api from './services/api';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);

    useEffect(() => {
        const demoStored = localStorage.getItem('mailshield_demo') === 'true';
        if (demoStored) {
            enableDemoMode();
            return;
        }

        const token = localStorage.getItem('mailshield_token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const enableDemoMode = () => {
        setIsDemoMode(true);
        localStorage.setItem('mailshield_demo', 'true');
        setUser({
            id: 'demo-user-123',
            name: 'Demo Analyst',
            email: 'demo@mailshield.security',
            picture: 'https://ui-avatars.com/api/?name=Demo+Analyst&background=3b82f6&color=fff',
            emails_scanned: 1248,
            phishing_detected: 42,
            suspicious_detected: 12,
            last_scan_at: new Date().toISOString()
        });
        setLoading(false);
    };

    const toggleDemoMode = (val) => {
        if (val) {
            enableDemoMode();
        } else {
            setIsDemoMode(false);
            localStorage.removeItem('mailshield_demo');
            setUser(null);
        }
    };

    const fetchUser = async () => {
        if (isDemoMode) return;
        try {
            const response = await api.get('/api/auth/me');
            setUser(response.data);
        } catch (error) {
            localStorage.removeItem('mailshield_token');
            delete api.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = (token) => {
        setIsDemoMode(false);
        localStorage.removeItem('mailshield_demo');
        localStorage.setItem('mailshield_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchUser();
    };

    const logout = async () => {
        if (!isDemoMode) {
            try {
                await api.post('/api/auth/logout');
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        localStorage.removeItem('mailshield_token');
        localStorage.removeItem('mailshield_demo');
        setIsDemoMode(false);
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, isDemoMode, toggleDemoMode }}>
            {children}
        </AuthContext.Provider>
    );
}

// Protected Route Component
function ProtectedRoute({ children }) {
    const { user, loading, isDemoMode } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user && !isDemoMode) {
        return <Navigate to="/" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/developers" element={<Developers />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/emails" element={
                        <ProtectedRoute>
                            <Layout>
                                <EmailInsights />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                        <ProtectedRoute>
                            <Layout>
                                <Settings />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/awareness" element={
                        <ProtectedRoute>
                            <Layout>
                                <Awareness />
                            </Layout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
