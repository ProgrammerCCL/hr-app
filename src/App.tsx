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

// Global Error Logging for Production
if (typeof window !== 'undefined') {
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('GLOBAL_CRASH:', { message, source, lineno, colno, error });
        return false;
    };
    window.onunhandledrejection = function(event) {
        console.error('UNHANDLED_PROMISE:', event.reason);
    };
}



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
        try {
            switch (currentView) {
                case 'admin-dashboard':
                    return <AdminDashboard onNavigate={navigate} />;
                case 'employee-dashboard':
                    return <EmployeeDashboard onNavigate={navigate} />;
                default:
                    return <EmployeeDashboard onNavigate={navigate} />;
            }
        } catch (err: any) {
            console.error('RenderView Error:', err);
            return (
                <div className="p-8 text-center bg-rose-500/10 rounded-3xl border border-rose-500/30">
                    <h3 className="text-rose-400 font-black mb-2">Render Error</h3>
                    <p className="text-sm text-rose-300/70">{err.message}</p>
                </div>
            );
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
                    <div className="max-w-4xl w-full text-center">
                        <div className="w-24 h-24 bg-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(244,63,94,0.3)] animate-pulse">
                            <AlertCircle size={48} className="text-white" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4 tracking-tight drop-shadow-xl">
                            {this.state.error?.name || "Application Error"}
                        </h2>
                        <div className="bg-rose-950/20 backdrop-blur-md border border-rose-500/30 rounded-3xl p-6 mb-8 text-left max-w-2xl mx-auto shadow-2xl">
                            <p className="text-rose-200 font-bold mb-4 flex items-center gap-2">
                                <AlertCircle size={20} /> {this.state.error?.message || "Unknown Error"}
                            </p>
                            <pre className="text-xs text-rose-300/60 font-mono overflow-auto max-h-[150px] whitespace-pre-wrap leading-relaxed scrollbar-hide p-4 bg-black/30 rounded-2xl border border-white/5 mb-4">
                                {this.state.error?.stack || "No stack trace available"}
                            </pre>
                            <p className="text-rose-400/50 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Component Stack</p>
                            <pre className="text-[10px] text-rose-300/40 font-mono overflow-auto max-h-[150px] whitespace-pre-wrap leading-tight scrollbar-hide p-4 bg-black/20 rounded-2xl border border-white/5">
                                {this.state.info?.componentStack || "No component stack available"}
                            </pre>
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-10 py-5 bg-white text-rose-600 rounded-3xl font-black text-lg hover:scale-105 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95"
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
                    <div className="fixed top-2 left-2 z-[9999] px-2 py-1 bg-black/50 text-[10px] text-white rounded font-mono pointer-events-none">
                        v1.0.debug-stack-trace
                    </div>
                    <AuthWrapper />
                </AuthProvider>
            </AppProvider>
        </ErrorBoundary>
    );
}

export default App;
