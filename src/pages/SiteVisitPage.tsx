
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Clock, Camera, X, Building, CheckCircle, Plus, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase/client';
import type { SiteVisit } from '../types';

const SiteVisitPage = ({ onBack }: { onBack: () => void }) => {
    const { user } = useAuth();
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
            } catch { alert('Cannot access camera'); setShowCamera(false); }
        }
    };

    const stopCamera = () => { stream?.getTracks().forEach(t => t.stop()); setStream(null); };

    useEffect(() => {
        if (showCamera) startCamera();
        else stopCamera();
    }, [showCamera]);

    const captureAndSubmit = () => {
        if (cameraAction === 'check_in' && !customerName.trim()) { alert('กรุณาใส่ชื่อลูกค้า'); return; }
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
            if (error) { alert('Error: ' + error.message); return; }
            setShowCamera(false);
            setShowNewVisit(false);
            setCustomerName('');
            setLocationName('');
            setNotes('');
            fetchVisits();
        }, () => alert('ไม่สามารถเข้าถึง GPS ได้'));
    };

    const handleCheckOut = async (photo: string) => {
        if (!activeVisit) return;
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { error } = await supabase.from('site_visits').update({
                check_out_time: new Date().toISOString(),
                check_out_photo: photo,
                status: 'completed'
            }).eq('id', activeVisit.id);
            if (error) { alert('Error: ' + error.message); return; }
            setShowCamera(false);
            fetchVisits();
        }, () => alert('ไม่สามารถเข้าถึง GPS ได้'));
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
        <div className="flex flex-col h-screen bg-[#0f172a] text-white overflow-hidden">
            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden border border-white/10">
                        <div className="p-4 flex justify-between items-center bg-gray-800/50">
                            <h3 className="text-white font-semibold">{cameraAction === 'check_in' ? '📍 เช็คอินลูกค้า' : '👋 เช็คเอาท์ลูกค้า'}</h3>
                            <button onClick={() => setShowCamera(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="relative aspect-[3/4] bg-black">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="text-center">
                                <button onClick={captureAndSubmit} className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center active:scale-95 transition mx-auto">
                                    <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-900"></div>
                                </button>
                            </div>
                            <p className="text-center text-gray-500 text-xs">ถ่ายรูปยืนยัน</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="p-4 flex items-center gap-4 bg-gray-900/50 backdrop-blur-md border-b border-white/5">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition"><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Site Visit</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-4 pb-20">
                {/* Active Visit Banner */}
                {activeVisit && (
                    <div className="glass-panel p-5 my-4 border-l-4 border-green-500 animate-fadeIn">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-xs text-green-400 font-semibold uppercase tracking-wider">● กำลังอยู่หน้างาน</p>
                                <h3 className="text-lg font-bold mt-1">{activeVisit.customer_name}</h3>
                                <p className="text-sm text-gray-400 flex items-center gap-1 mt-1"><MapPin size={14} />{activeVisit.location_name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">เข้า</p>
                                <p className="font-mono text-lg">{formatTime(activeVisit.check_in_time)}</p>
                                <p className="text-xs text-gray-400 mt-1">{calcDuration(activeVisit.check_in_time)}</p>
                            </div>
                        </div>
                        <button onClick={() => { setCameraAction('check_out'); setShowCamera(true); }}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold active:scale-95 transition shadow-lg shadow-red-900/20">
                            เช็คเอาท์ออกจากลูกค้า
                        </button>
                    </div>
                )}

                {/* New Visit Form */}
                {!activeVisit && !showNewVisit && (
                    <button onClick={() => setShowNewVisit(true)} className="w-full glass-panel p-5 my-4 flex items-center justify-center gap-3 text-indigo-400 hover:bg-white/5 transition active:scale-95">
                        <Plus size={24} /> <span className="font-semibold text-lg">เช็คอินพบลูกค้า</span>
                    </button>
                )}

                {showNewVisit && !activeVisit && (
                    <div className="glass-panel p-5 my-4 space-y-4 animate-fadeIn">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><Building size={20} className="text-orange-400" /> บันทึกพบลูกค้า</h3>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">ชื่อลูกค้า / บริษัท *</label>
                            <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="เช่น บริษัท ABC จำกัด" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" autoFocus />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">สถานที่</label>
                            <input value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="เช่น อาคารสำนักงาน ชั้น 5" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">หมายเหตุ</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="รายละเอียดเพิ่มเติม..." className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none resize-none" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowNewVisit(false)} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300">ยกเลิก</button>
                            <button onClick={() => { setCameraAction('check_in'); setShowCamera(true); }} disabled={!customerName.trim()}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2">
                                <Camera size={18} /> ถ่ายรูป & เช็คอิน
                            </button>
                        </div>
                    </div>
                )}

                {/* Visit History */}
                <h3 className="text-lg font-semibold mt-6 mb-3">ประวัติวันนี้</h3>
                <div className="space-y-3">
                    {visits.filter(v => v.status === 'completed').map(v => (
                        <div key={v.id} className="glass-panel p-4 hover:bg-white/5 transition">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0 mt-0.5"><User size={18} /></div>
                                    <div>
                                        <h4 className="font-medium">{v.customer_name}</h4>
                                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><MapPin size={12} />{v.location_name}</p>
                                        {v.notes && <p className="text-xs text-gray-500 mt-1">{v.notes}</p>}
                                    </div>
                                </div>
                                <div className="text-right text-xs flex-shrink-0">
                                    <div className="flex items-center gap-1 text-green-400"><Clock size={12} /> {formatTime(v.check_in_time)}</div>
                                    <div className="flex items-center gap-1 text-red-400 mt-1"><Clock size={12} /> {formatTime(v.check_out_time)}</div>
                                    <p className="mt-1 text-gray-400 font-mono">{calcDuration(v.check_in_time, v.check_out_time)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {visits.filter(v => v.status === 'completed').length === 0 && !loading && (
                        <p className="text-gray-500 text-sm text-center py-6">ยังไม่มีประวัติวันนี้</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SiteVisitPage;
