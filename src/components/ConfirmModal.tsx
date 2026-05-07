import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'success' | 'danger' | 'warning';
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal = ({ isOpen, title, message, confirmLabel = 'ยืนยัน', cancelLabel = 'ยกเลิก', variant = 'warning', onConfirm, onCancel }: ConfirmModalProps) => {
    if (!isOpen) return null;
    const colors = {
        success: { bg: 'from-emerald-500/20 to-teal-500/10', icon: 'text-emerald-400', btn: 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30', ring: 'ring-emerald-500/20' },
        danger: { bg: 'from-red-500/20 to-rose-500/10', icon: 'text-red-400', btn: 'bg-red-500 hover:bg-red-400 shadow-red-500/30', ring: 'ring-red-500/20' },
        warning: { bg: 'from-amber-500/20 to-orange-500/10', icon: 'text-amber-400', btn: 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/30', ring: 'ring-amber-500/20' },
    };
    const c = colors[variant];
    const Icon = variant === 'success' ? CheckCircle2 : variant === 'danger' ? AlertCircle : AlertTriangle;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
            <div className={`relative w-full max-w-sm rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 animate-scaleIn`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} pointer-events-none`} />
                <div className="relative p-7 text-center">
                    <div className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-white/5 ring-2 ${c.ring}`}>
                        <Icon size={32} className={c.icon} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 tracking-tight">{title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-7 whitespace-pre-wrap">{message}</p>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-sm transition-all active:scale-95 border border-white/5">{cancelLabel}</button>
                        <button onClick={onConfirm} className={`flex-1 py-3 rounded-xl text-white font-black text-sm transition-all active:scale-95 shadow-lg ${c.btn}`}>{confirmLabel}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
