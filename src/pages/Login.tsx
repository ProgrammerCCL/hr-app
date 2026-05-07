
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Hash, CalendarDays, Check, FileText, User } from 'lucide-react';
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
    const [loginMode, setLoginMode] = useState<'email' | 'code'>('code');
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
        <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 relative font-sans">
            <div className="absolute top-4 right-4 z-50">
                <SettingsToolbar />
            </div>

            <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] overflow-hidden relative z-10 min-h-[480px] md:min-h-[520px]">
                {/* LEFT SIDE - BRANDING */}
                <div className="hidden md:flex w-full md:w-5/12 p-8 lg:p-10 text-white bg-gradient-to-br from-[#2563eb] via-[#3b82f6] to-[#06b6d4] flex-col relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-sm">
                                <CalendarDays className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight leading-none text-white drop-shadow-sm">LeaveFlow</h2>
                                <p className="text-[13px] font-medium text-blue-100">{t.loginSubTitle}</p>
                            </div>
                        </div>

                        <div className="my-auto">
                            <div className="text-3xl lg:text-4xl font-black leading-[1.15] mb-4 tracking-tight drop-shadow-sm">
                                {String(t.loginPromoteTitle || '')}
                            </div>
                            <p className="text-blue-100/90 text-[15px] font-medium mb-12 max-w-sm leading-relaxed">
                                {t.loginPromoteDesc}
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-4 bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10 transition-transform hover:translate-x-1">
                                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <Check className="text-white" size={18} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-white">{t.loginFeature1Title}</h3>
                                        <p className="text-xs text-blue-100/80">{t.loginFeature1Desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10 transition-transform hover:translate-x-1">
                                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <Mail className="text-white" size={18} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-white">{t.loginFeature2Title}</h3>
                                        <p className="text-xs text-blue-100/80">{t.loginFeature2Desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10 transition-transform hover:translate-x-1">
                                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <FileText className="text-white" size={18} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-white">{t.loginFeature3Title}</h3>
                                        <p className="text-xs text-blue-100/80">{t.loginFeature3Desc}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - LOGIN FORM */}
                <div className="w-full md:w-7/12 p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-white relative">
                    <div className="max-w-[400px] w-full mx-auto flex flex-col h-full py-4">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-[1.25rem] mx-auto mb-5 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <CalendarDays size={32} strokeWidth={2} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1.5">{t.signIn || 'เข้าสู่ระบบ'}</h2>
                            <p className="text-slate-500 text-sm font-bold">ระบบใบลาออนไลน์ - BUGpairoj Group</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 p-3.5 rounded-xl text-[13px] font-bold text-center flex items-center justify-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> {error}
                                </div>
                            )}
                            {message && (
                                <div className="bg-green-50 border border-green-100 text-green-600 p-3.5 rounded-xl text-[13px] font-bold text-center flex items-center justify-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> {message}
                                </div>
                            )}

                            {/* Login Mode Switcher */}
                            <div className="flex bg-slate-100 rounded-xl p-1 mb-2">
                                <button type="button" onClick={() => { setLoginMode('email'); setLoginId(''); }}
                                    className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${
                                        loginMode === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}>
                                    <Mail size={15} strokeWidth={2.5} /> {t.loginByEmail}
                                </button>
                                <button type="button" onClick={() => { setLoginMode('code'); setLoginId(''); }}
                                    className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${
                                        loginMode === 'code' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}>
                                    <Hash size={15} strokeWidth={2.5} /> {t.loginByEmployeeCode}
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">{t.usernameOrCode} <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={loginId}
                                        onChange={(e) => setLoginId(loginMode === 'code' ? e.target.value.toUpperCase() : e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-[46px] text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm"
                                        placeholder={loginMode === 'email' ? t.enterUsername : t.enterCode}
                                        required
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        {loginMode === 'email' ? <User size={18} strokeWidth={2.5} /> : <Hash size={18} strokeWidth={2.5} />}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">{t.password} <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-[46px] pr-12 text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm"
                                        placeholder={t.enterPassword}
                                        required
                                        minLength={6}
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Lock size={18} strokeWidth={2.5} />
                                    </div>
                                    <button type="button" onClick={() => setPasswordVisible(!passwordVisible)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1">
                                        {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 pb-3">
                                <label className="flex items-center space-x-2.5 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="w-5 h-5 border-2 border-slate-300 rounded bg-slate-50 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                                            <Check size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                                        </div>
                                    </div>
                                    <span className="text-slate-600 text-[13px] font-bold group-hover:text-slate-800 transition-colors">{t.rememberLogin}</span>
                                </label>
                            </div>

                            <button type="submit" disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] hover:from-blue-600 hover:to-cyan-500 text-white rounded-xl font-bold text-[15px] shadow-[0_8px_20px_rgba(37,_99,_235,_0.2)] transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden">
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>{t.signIn}</span>
                                        <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
