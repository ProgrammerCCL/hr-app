
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { ArrowRight, Mail, Lock, Building, Eye, EyeOff, Hash } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SettingsToolbar } from '../components/SettingsToolbar';

const Login = () => {
    const { t } = useApp();
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loginMode, setLoginMode] = useState<'email' | 'code'>('email');
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const savedLoginId = localStorage.getItem('hrms_loginId');
        const savedPassword = localStorage.getItem('hrms_password');
        const savedLoginMode = localStorage.getItem('hrms_loginMode') as 'email' | 'code';
        if (savedLoginId && savedPassword) {
            setLoginId(savedLoginId);
            setPassword(savedPassword);
            setRememberMe(true);
            if (savedLoginMode) setLoginMode(savedLoginMode);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            let email = loginId;
            if (loginMode === 'code') {
                const { data: profile, error: lookupError } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('employee_code', loginId.trim().toUpperCase())
                    .single();
                if (lookupError || !profile) {
                    throw new Error('ไม่พบรหัสพนักงานนี้ในระบบ');
                }
                email = profile.email;
            }
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            if (rememberMe) {
                localStorage.setItem('hrms_loginId', loginId);
                localStorage.setItem('hrms_password', password);
                localStorage.setItem('hrms_loginMode', loginMode);
            } else {
                localStorage.removeItem('hrms_loginId');
                localStorage.removeItem('hrms_password');
                localStorage.removeItem('hrms_loginMode');
            }
        } catch (err: any) {
            if (err.message.includes('Email not confirmed')) {
                setError('Please check your email inbox to confirm your account.');
            } else {
                setError(err.message || 'Authentication failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-[#0f172a] overflow-hidden relative">
            <div className="absolute top-4 right-4 z-50">
                <SettingsToolbar />
            </div>
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000" />
            </div>

            <div className="glass-panel w-full max-w-md p-8 relative z-10 border border-white/10 backdrop-blur-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <Building size={32} />
                    </div>
                    <h1 className="text-3xl font-bold" style={{ color: '#4f46e5' }}>
                        {t.welcomeBack}
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 mt-2">
                        {t.signInToAccount}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-sm text-center">
                            {message}
                        </div>
                    )}

                    <div className="flex bg-white/5 rounded-lg p-1">
                        <button type="button" onClick={() => { setLoginMode('email'); setLoginId(''); }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-1.5
                                ${loginMode === 'email' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>
                            <Mail size={14} /> {t.email}
                        </button>
                        <button type="button" onClick={() => { setLoginMode('code'); setLoginId(''); }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-1.5
                                ${loginMode === 'code' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>
                            <Hash size={14} /> {t.employeeCode}
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">
                            {loginMode === 'email' ? t.email : t.employeeCode}
                        </label>
                        <div className="relative group">
                            <input
                                type={loginMode === 'email' ? 'email' : 'text'}
                                value={loginId}
                                onChange={(e) => setLoginId(loginMode === 'code' ? e.target.value.toUpperCase() : e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all group-hover:border-white/20"
                                placeholder={loginMode === 'email' ? 'name@company.com' : 'EMP001'}
                                required
                            />
                            {loginMode === 'email' ? (
                                <Mail className="absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            ) : (
                                <Hash className="absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">{t.password}</label>
                        <div className="relative group">
                            <input
                                type={passwordVisible ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all group-hover:border-white/20"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <Lock className="absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            <button type="button" onClick={() => setPasswordVisible(!passwordVisible)}
                                className="absolute right-3.5 top-3.5 text-gray-500 hover:text-white transition-colors">
                                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
                            />
                            <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{t.rememberMe}</span>
                        </label>
                    </div>

                    <button type="submit" disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden">
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>{t.signIn}</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
