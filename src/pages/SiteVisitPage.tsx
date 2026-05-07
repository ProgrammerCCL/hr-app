
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Clock, Camera, X, Building, CheckCircle, Plus, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase/client';
import { useApp } from '../context/AppContext';
import type { SiteVisit } from '../types';

const SiteVisitPage = ({ onBack }: { onBack: () => void }) => {
    const { user } = useAuth();
    const { showToast } = useApp();
    const [visits, setVisits] = useState<SiteVisit[]>([]);
    const [activeVisit, setActiveVisit] = useState<SiteVisit | null>(null);
    const [showNewVisit, setShowNewVisit] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [locationName, setLocationName] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraAction, setCameraAction] = useState<'check_in' | 'check_out'>('check_in');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        fetchVisits();
        return () => { stream?.getTracks().forEach(t => t.stop()); };
    }, []);

    const fetchVisits = async () => {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase.from('site_visits').select('*').eq('user_id', user!.id).gte('created_at', `${today}T00:00:00`).order('created_at', { ascending: false });
        if (data) {
            setVisits(data as SiteVisit[]);
            const active = data.find((v: any) => v.status === 'active');
            setActiveVisit(active as SiteVisit || null);
        }
        setLoading(false);
    };

    const startCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setStream(s);
            if (videoRef.current) videoRef.current.srcObject = s;
        } catch {
            try {
                const s = await navigator.mediaDevices.getUserMedia({ video: true });
                setStream(s);
                if (videoRef.current) videoRef.current.srcObject = s;
            } catch { showToast('Cannot access camera', 'error'); setShowCamera(false); }
        }
    };

    const stopCamera = () => { stream?.getTracks().forEach(t => t.stop()); setStream(null); };

    useEffect(() => {
        if (showCamera) startCamera();
        else stopCamera();
    }, [showCamera]);

    const captureAndSubmit = () => {
        if (cameraAction === 'check_in' && !customerName.trim()) { showToast('กรุณาใส่ชื่อลูกค้า', 'error'); return; }
        if (videoRef.current && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                ctx.drawImage(videoRef.current, 0, 0);
                const photo = canvasRef.current.toDataURL('image/jpeg', 0.7);
                if (cameraAction === 'check_in') handleCheckIn(photo);
                else handleCheckOut(photo);
            }
        }
    };

    const handleCheckIn = async (photo: string) => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { error } = await supabase.from('site_visits').insert([{
                user_id: user!.id,
                customer_name: customerName.trim(),
                location_name: locationName.trim() || customerName.trim(),
                location_lat: pos.coords.latitude,
                location_lng: pos.coords.longitude,
                check_in_time: new Date().toISOString(),
                check_in_photo: photo,
                notes: notes.trim(),
                status: 'active'
            }]);
            if (error) { showToast('Error: ' + error.message, 'error'); return; }
            setShowCamera(false);
            setShowNewVisit(false);
            setCustomerName('');
            setLocationName('');
            setNotes('');
            fetchVisits();
        }, () => showToast('ไม่สามารถเข้าถึง GPS ได้', 'error'));
    };

    const handleCheckOut = async (photo: string) => {
        if (!activeVisit) return;
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { error } = await supabase.from('site_visits').update({
                check_out_time: new Date().toISOString(),
                check_out_photo: photo,
                status: 'completed'
            }).eq('id', activeVisit.id);
            if (error) { showToast('Error: ' + error.message, 'error'); return; }
            setShowCamera(false);
            fetchVisits();
        }, () => showToast('ไม่สามารถเข้าถึง GPS ได้', 'error'));
    };

    const formatTime = (t?: string) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const calcDuration = (start: string, end?: string) => {
        const s = new Date(start).getTime();
        const e = end ? new Date(end).getTime() : Date.now();
        const diff = e - s;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        return `${h}h ${m.toString().padStart(2, '0')}m`;
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fadeIn">
                    <div className="w-full max-w-md bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-white animate-scaleIn">
                        <div className="p-6 flex justify-between items-center bg-white border-b border-slate-100">
                            <h3 className="text-slate-800 font-black tracking-tight flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cameraAction === 'check_in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    <MapPin size={18} strokeWidth={2.5} />
                                </div>
                                {cameraAction === 'check_in' ? 'Check-in Customer' : 'Check-out Customer'}
                            </h3>
                            <button onClick={() => setShowCamera(false)} className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 transition-all flex items-center justify-center"><X size={24} /></button>
                        </div>
                        <div className="relative aspect-[3/4] bg-slate-900 overflow-hidden ring-4 ring-slate-50 ring-inset">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="absolute inset-0 border-[20px] border-white/10 pointer-events-none"></div>
                        </div>
                        <div className="p-8 space-y-3 bg-white">
                            <div className="text-center">
                                <button onClick={captureAndSubmit} className="w-24 h-24 rounded-full bg-white border-[6px] border-slate-100 flex items-center justify-center active:scale-90 transition-all mx-auto shadow-xl ring-2 ring-indigo-500 ring-offset-4">
                                    <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-inner">
                                        <Camera size={32} strokeWidth={2.5} />
                                    </div>
                                </button>
                            </div>
                            <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-4">Take a photo to confirm</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="px-6 py-5 flex items-center gap-4 bg-white/80 backdrop-blur-md border-b border-slate-300 sticky top-0 z-40">
                <button onClick={onBack} className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center shadow-sm border border-slate-200"><ArrowLeft size={22} strokeWidth={3} /></button>
                <div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Site Visit</h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Field Operation Unit</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 pb-24 custom-scrollbar">
                {/* Active Visit Banner */}
                {activeVisit && (
                    <div className="bg-white p-7 my-6 rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-500/5 animate-fadeIn ring-2 ring-emerald-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> On-Site
                            </div>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 flex-shrink-0">
                                    <Building size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-slate-800 leading-tight">{activeVisit.customer_name}</h3>
                                    <p className="text-sm font-bold text-slate-400 flex items-center gap-1.5 mt-1"><MapPin size={14} className="text-emerald-500" />{activeVisit.location_name}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in Time</p>
                                    <p className="font-mono text-lg font-black text-slate-700 leading-none">{formatTime(activeVisit.check_in_time)}</p>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Current Duration</p>
                                    <p className="font-mono text-lg font-black text-indigo-600 leading-none">{calcDuration(activeVisit.check_in_time)}</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => { setCameraAction('check_out'); setShowCamera(true); }}
                            className="w-full py-5 rounded-[1.5rem] bg-rose-600 text-white font-black text-sm active:scale-95 transition-all shadow-xl shadow-rose-200 flex items-center justify-center gap-3">
                            <X size={20} strokeWidth={3} /> CHECK OUT FROM SITE
                        </button>
                    </div>
                )}

                {/* New Visit Form */}
                {!activeVisit && !showNewVisit && (
                    <button onClick={() => setShowNewVisit(true)} className="w-full bg-white p-8 my-6 rounded-[2.5rem] border border-slate-200 border-dashed hover:border-indigo-400 hover:bg-indigo-50/30 transition-all active:scale-95 flex flex-col items-center gap-4 text-slate-400 group">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                            <Plus size={32} strokeWidth={3} />
                        </div>
                        <div className="text-center">
                            <span className="font-black text-lg text-slate-800 block">Check-in New Site</span>
                            <span className="text-xs font-bold uppercase tracking-widest mt-1">Found a new customer</span>
                        </div>
                    </button>
                )}

                {showNewVisit && !activeVisit && (
                    <div className="bg-white p-8 my-6 rounded-[2.5rem] border border-slate-300 shadow-xl shadow-slate-200/30 space-y-6 animate-scaleIn">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <Building size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="font-black text-xl text-slate-900 tracking-tight">Visit Entry</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Customer / Company *</label>
                                <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="ABC Co., Ltd." className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-4 text-slate-900 font-black focus:border-indigo-600 focus:outline-none transition-all shadow-sm" autoFocus />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Location Details</label>
                                <input value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="Floor 5, Building B" className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-4 text-slate-900 font-black focus:border-indigo-600 focus:outline-none transition-all shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Notes</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Brief details about the visit..." className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-4 text-slate-900 font-black focus:border-indigo-600 focus:outline-none resize-none transition-all shadow-sm" />
                            </div>
                        </div>
                        
                        <div className="flex gap-4 pt-2">
                            <button onClick={() => setShowNewVisit(false)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-sm active:scale-95 transition-all">Cancel</button>
                            <button onClick={() => { setCameraAction('check_in'); setShowCamera(true); }} disabled={!customerName.trim()}
                                className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm active:scale-95 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2">
                                <Camera size={18} strokeWidth={2.5} /> CHECK IN
                            </button>
                        </div>
                    </div>
                )}

                {/* Visit History */}
                <div className="mt-10 mb-4 flex items-center justify-between">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Today's Timeline</h3>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <Clock size={16} />
                    </div>
                </div>
                
                <div className="space-y-4">
                    {visits.filter(v => v.status === 'completed').map(v => (
                        <div key={v.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-[1.25rem] bg-slate-50 flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                                        <User size={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 leading-tight">{v.customer_name}</h4>
                                        <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1.5"><MapPin size={12} className="text-slate-300" />{v.location_name}</p>
                                        {v.notes && <p className="text-xs text-slate-500 mt-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">"{v.notes}"</p>}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-mono text-[11px] font-black">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {formatTime(v.check_in_time)}
                                        </div>
                                        <div className="flex items-center justify-end gap-1.5 text-rose-500 font-mono text-[11px] font-black">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> {formatTime(v.check_out_time)}
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] font-black text-slate-400 tracking-widest">{calcDuration(v.check_in_time, v.check_out_time)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {visits.filter(v => v.status === 'completed').length === 0 && !loading && (
                        <div className="bg-white/50 p-12 rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center gap-3">
                            <Clock size={32} className="text-slate-200" />
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No history today</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SiteVisitPage;
