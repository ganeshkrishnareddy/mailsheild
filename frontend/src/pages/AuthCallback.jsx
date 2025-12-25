import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../App';
import { Shield } from 'lucide-react';

function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            login(token);
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-xl font-semibold text-white mb-2">Authenticating...</h2>
                <p className="text-slate-400">Please wait while we secure your session</p>
            </div>
        </div>
    );
}

export default AuthCallback;
