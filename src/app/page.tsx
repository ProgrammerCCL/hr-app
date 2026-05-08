
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase/client';
import Login from '@/components/views/Login';
import EmployeeDashboard from '@/components/views/EmployeeDashboard';
import AdminDashboard from '@/components/views/AdminDashboard';
import type { Profile } from '@/types';

export default function Home() {
    const { user, loading } = useAuth();
    const { t } = useApp();
    const [currentView, setCurrentView] = useState<string | null>(null);
    const [profile, setProfileState] = useState<Profile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
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
                const role = String(data.role || 'employee').toLowerCase();
                const isAdmin = role === 'admin' || role === 'hr' || role === 'manager';
                if (!currentView) {
                    setCurrentView(isAdmin ? 'admin-dashboard' : 'employee-dashboard');
                }
            } else {
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
                    <p className="text-gray-400 text-sm">กำลังโหลด...</p>
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
        <main className="min-h-screen bg-[#0f172a]">
            {renderView()}
        </main>
    );
}
