
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
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
                const role = (data.role || '').toLowerCase();
                const isAdmin = role === 'admin' || role === 'hr' || role === 'manager';
                if (!currentView) {
                    setCurrentView(isAdmin ? 'admin-dashboard' : 'employee-dashboard');
                }
            } else if (!currentView) {
                setCurrentView('employee-dashboard');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
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

function App() {
    return (
        <AppProvider>
            <AuthProvider>
                <AuthWrapper />
            </AuthProvider>
        </AppProvider>
    );
}

export default App;
