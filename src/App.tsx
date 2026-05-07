import { useState, useEffect, ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase/client';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import type { Profile } from './types';
import type { Lang } from './i18n/translations';



function AuthWrapper() {
    const { user, loading } = useAuth();
    const { t } = useApp();
    const [currentView, setCurrentView] = useState<string | null>(null);
    const [profile, setProfileState] = useState<Profile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            // Only show full loading if we don't have a profile yet
            fetchProfile(!profile);
        } else {
            setProfileState(null);
            setProfileLoading(false);
            setCurrentView(null);
        }
    }, [user?.id]);

    const fetchProfile = async (shouldShowLoading = true) => {
        try {
            if (shouldShowLoading) setProfileLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user!.id)
                .single();

            if (error) {
                console.error('Profile fetch error:', error);
            }

            if (data) {
                setProfileState(data);
                const role = (data.role || 'employee').toLowerCase();
                const isAdmin = role === 'admin' || role === 'hr' || role === 'manager';
                console.log('User logged in with role:', role, 'isAdmin:', isAdmin);
                if (!currentView) {
                    setCurrentView(isAdmin ? 'admin-dashboard' : 'employee-dashboard');
                }
            } else {
                console.warn('No profile found for user, defaulting to employee-dashboard');
                if (!currentView) {
                    setCurrentView('employee-dashboard');
                }
            }
        } catch (error) {
            console.error('Critical Error in fetchProfile:', error);
            if (!currentView) setCurrentView('employee-dashboard');
        } finally {
            setProfileLoading(false);
        }
    };

    if (loading || profileLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0f172a] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    <p className="text-gray-400 text-sm">{t.loading}</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    const navigate = (view: string) => setCurrentView(view);

    const renderView = () => {
        switch (currentView) {
            case 'admin-dashboard':
                return <AdminDashboard onNavigate={navigate} />;
            case 'employee-dashboard':
                return <EmployeeDashboard onNavigate={navigate} />;
            default:
                return <EmployeeDashboard onNavigate={navigate} />;
        }
    };

    return (
        <div className="min-h-screen text-white relative overflow-hidden">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[100px] float-anim" />
                <div className="absolute bottom-[0%] right-[-5%] w-[30%] h-[30%] bg-blue-600/20 rounded-full blur-[80px] float-anim" style={{ animationDelay: '2s' }} />
            </div>
            {renderView()}
        </div>
    );
}

import React, { Component, ErrorInfo } from 'react';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: any, info: any}> {
    constructor(props: {children: ReactNode}) {
        super(props);
        this.state = { hasError: false, error: null, info: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    componentDidCatch(error: any, info: ErrorInfo) {
        this.setState({ info });
        console.error("ErrorBoundary caught an error", error, info);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
                    <div className="max-w-4xl w-full bg-slate-800 p-8 rounded-3xl border border-rose-500/30 shadow-2xl overflow-hidden">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center shrink-0">
                                <AlertCircle size={28} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-black">Application Error</h2>
                        </div>
                        <div className="bg-slate-950/50 rounded-2xl p-6 mb-6 border border-slate-700/50">
                            <p className="text-rose-400 font-black mb-2 text-lg">
                                {this.state.error?.toString() || "Unknown Error"}
                            </p>
                            <pre className="text-xs text-slate-400 font-mono overflow-auto max-h-[300px] whitespace-pre-wrap leading-relaxed">
                                {this.state.error?.stack}
                            </pre>
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 bg-indigo-600 rounded-2xl font-black hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    return (
        <ErrorBoundary>
            <AppProvider>
                <AuthProvider>
                    <AuthWrapper />
                </AuthProvider>
            </AppProvider>
        </ErrorBoundary>
    );
}

export default App;
