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

    useEffect(() => {
        const token = localStorage.getItem('mailshield_token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
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
        localStorage.setItem('mailshield_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchUser();
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('mailshield_token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// Protected Route Component
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    if (!user) {
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
