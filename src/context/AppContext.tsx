import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import translations, { Lang, langLabels } from '../i18n/translations';
import { CheckCircle2, AlertCircle, Info, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

type Theme = 'dark' | 'light';

interface AppContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: typeof translations['th'];
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    langLabels: typeof langLabels;
    showToast: (message: string, type?: ToastType) => void;
    showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>(() => {
        const saved = localStorage.getItem('hrms_lang');
        if (saved === 'en' || saved === 'th') return saved as Lang;
        return 'th';
    });

    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem('hrms_theme');
        return (saved as Theme) || 'light';
    });

    const setLang = (newLang: Lang) => {
        setLangState(newLang);
        localStorage.setItem('hrms_lang', newLang);
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('hrms_theme', newTheme);
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // Apply theme class to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        }
    }, [theme]);

    const t = translations[lang] || translations['th'];

    // Toasts State
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Confirmation Modal State
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        options: ConfirmOptions;
        resolve: (value: boolean) => void;
    } | null>(null);

    const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                options,
                resolve
            });
        });
    };

    const handleConfirmResponse = (value: boolean) => {
        if (confirmState) {
            confirmState.resolve(value);
            setConfirmState(null);
        }
    };

    return (
        <AppContext.Provider value={{ lang, setLang, t, theme, setTheme, toggleTheme, langLabels, showToast, showConfirm }}>
            {children}
            
            {/* Global Modern Toasts (Centered Screen) */}
            <div className="fixed inset-0 z-[10001] pointer-events-none flex flex-col items-center justify-center gap-3 p-4">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div 
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.8, rotateX: -15 }}
                            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={`
                                pointer-events-auto
                                flex flex-col items-center gap-2 p-8 rounded-[3rem] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.3)] 
                                backdrop-blur-3xl border text-center relative overflow-hidden group min-w-[360px] max-w-md
                                ${theme === 'dark' 
                                    ? (toast.type === 'success' ? 'bg-slate-900/90 border-emerald-500/30' : 
                                       toast.type === 'error' ? 'bg-slate-900/90 border-rose-500/30' : 
                                       'bg-slate-900/90 border-indigo-500/30')
                                    : (toast.type === 'success' ? 'bg-white/95 border-emerald-100' : 
                                       toast.type === 'error' ? 'bg-white/95 border-rose-100' : 
                                       'bg-white/95 border-indigo-100')}
                            `}
                        >
                            <div className={`
                                flex items-center justify-center w-20 h-20 rounded-[2rem] mb-2
                                ${toast.type === 'success' ? 'bg-emerald-500 shadow-[0_12px_30px_rgba(16,185,129,0.4)]' : 
                                  toast.type === 'error' ? 'bg-rose-500 shadow-[0_12px_30px_rgba(244,63,94,0.4)]' : 
                                  'bg-indigo-500 shadow-[0_12px_30px_rgba(99,102,241,0.4)]'}
                            `}>
                                {toast.type === 'success' && <CheckCircle2 size={40} strokeWidth={2.5} className="text-white" />}
                                {toast.type === 'error' && <AlertCircle size={40} strokeWidth={2.5} className="text-white" />}
                                {toast.type === 'info' && <Info size={40} strokeWidth={2.5} className="text-white" />}
                            </div>
                            
                            <div className="px-4">
                                <h3 className={`text-3xl font-black tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                    {toast.type === 'success' ? (lang === 'th' ? 'สำเร็จ!' : 'Success!') : 
                                     toast.type === 'error' ? (lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error') : 
                                     (lang === 'th' ? 'ข้อมูล' : 'Information')}
                                </h3>
                                <p className={`text-lg font-bold leading-relaxed whitespace-pre-line ${theme === 'dark' ? 'text-white/70' : 'text-slate-500'}`}>
                                    {toast.message}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Global Modern Confirmation Modal */}
            <AnimatePresence>
                {confirmState?.isOpen && (
                    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => handleConfirmResponse(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 w-full max-w-sm p-8 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 text-center"
                        >
                            <div className={`
                                mx-auto flex items-center justify-center w-20 h-20 rounded-3xl mb-6
                                ${confirmState.options.type === 'danger' ? 'bg-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.3)]' : 
                                  confirmState.options.type === 'warning' ? 'bg-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]' : 
                                  'bg-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.3)]'}
                            `}>
                                {confirmState.options.type === 'danger' ? <AlertCircle size={40} strokeWidth={2.5} className="text-white" /> :
                                 confirmState.options.type === 'warning' ? <AlertCircle size={40} strokeWidth={2.5} className="text-white" /> :
                                 <HelpCircle size={40} strokeWidth={2.5} className="text-white" />}
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
                                {confirmState.options.title || (lang === 'th' ? 'ยืนยันการดำเนินการ' : 'Confirm Action')}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 leading-relaxed">
                                {confirmState.options.message}
                            </p>

                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => handleConfirmResponse(true)}
                                    className={`
                                        w-full py-4 rounded-2xl text-white font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg
                                        ${confirmState.options.type === 'danger' ? 'bg-rose-600 shadow-rose-200 dark:shadow-none' : 
                                          'bg-indigo-600 shadow-indigo-200 dark:shadow-none'}
                                    `}
                                >
                                    {confirmState.options.confirmText || (lang === 'th' ? 'ยืนยัน' : 'Confirm')}
                                </button>
                                <button 
                                    onClick={() => handleConfirmResponse(false)}
                                    className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    {confirmState.options.cancelText || (lang === 'th' ? 'ยกเลิก' : 'Cancel')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AppContext.Provider>
    );
}

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

