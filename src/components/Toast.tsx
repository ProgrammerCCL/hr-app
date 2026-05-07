import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export interface ToastProps { id: number; message: string; type: 'success' | 'error' | 'info'; }

export const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, []);
    const styles = {
        success: { bar: 'bg-emerald-500', icon: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />, border: 'border-emerald-500/20' },
        error: { bar: 'bg-red-500', icon: <AlertCircle size={18} className="text-red-400 shrink-0" />, border: 'border-red-500/20' },
        info: { bar: 'bg-indigo-500', icon: <AlertTriangle size={18} className="text-indigo-400 shrink-0" />, border: 'border-indigo-500/20' },
    };
    const s = styles[type];
    return (
        <div className={`flex items-center gap-3 bg-slate-800/95 border ${s.border} backdrop-blur-xl rounded-2xl px-4 py-3.5 shadow-2xl min-w-[280px] max-w-[360px] animate-scaleIn pointer-events-auto`}>
            <div className={`w-1 self-stretch rounded-full ${s.bar} shrink-0`} />
            {s.icon}
            <p className="text-white text-sm font-semibold leading-snug flex-1 break-words">{message}</p>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors shrink-0 ml-1"><X size={14} /></button>
        </div>
    );
};
