
import { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Coffee, Calendar, CalendarDays, LogOut, FileText, User, Loader2, X, Building, Briefcase, Shield, Lock, Eye, EyeOff, Crosshair, Route, Clock, Mail, Phone, CreditCard, Edit2, Check, RotateCcw, History, ChevronLeft, ChevronRight, UserCheck, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase/client';
import type { Profile, AttendanceLog, LeaveRequest, AppNotification } from '../types';
import LeaveRequestPage from './LeaveRequestPage';
import SiteVisitPage from './SiteVisitPage';
import EmployeePayslipView from './EmployeePayslipView';
import { SettingsToolbar } from '../components/SettingsToolbar';

// === Haversine formula: คำนวณระยะทางระหว่าง 2 จุด GPS (กิโลเมตร) ===
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// === คำนวณระยะทางรวมจาก logs ที่เรียงตามเวลา ===
function calculateTotalDistance(logs: AttendanceLog[]): number {
    let total = 0;
    const sorted = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        if (prev.location_lat && prev.location_lng && curr.location_lat && curr.location_lng) {
            total += haversineDistance(prev.location_lat, prev.location_lng, curr.location_lat, curr.location_lng);
        }
    }
    return total;
}

// === คำนวณระยะทางจากจุดก่อนหน้า ===
function getDistanceFromPrevious(logs: AttendanceLog[], currentIndex: number): number | null {
    const sorted = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const currId = logs[currentIndex]?.id;
    const sortedIdx = sorted.findIndex(l => l.id === currId);
    if (sortedIdx <= 0) return null;
    const prev = sorted[sortedIdx - 1];
    const curr = sorted[sortedIdx];
    if (prev.location_lat && prev.location_lng && curr.location_lat && curr.location_lng) {
        return haversineDistance(prev.location_lat, prev.location_lng, curr.location_lat, curr.location_lng);
    }
    return null;
}

// === คำนวณอายุงาน ===
function calculateTenure(startDate: string) {
    if (!startDate) return null;
    const start = new Date(startDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    if (months < 0) {
        years--;
        months += 12;
    }
    return { years, months };
}

// === ATTENDANCE DETAIL MODAL ===
const AttendanceDetailModal = ({
    pair,
    profile,
    onClose,
    t,
    lang
}: {
    pair: { in?: AttendanceLog; out?: AttendanceLog },
    profile: Profile,
    onClose: () => void,
    t: any,
    lang: string
}) => {
    const [activeTab, setActiveTab] = useState<'details' | 'photoIn' | 'photoOut'>('details');
    const logOut = pair.out;
    const logIn = pair.in;
    const baseLog = logIn || logOut;

    if (!baseLog) return null;

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date(baseLog.timestamp).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', dateOptions);

    const timeIn = logIn ? new Date(logIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
    const timeOut = logOut ? new Date(logOut.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';

    const isSiteVisit = baseLog.type === 'site_in' || baseLog.type === 'site_out';
    const isComplete = !!logIn && !!logOut;

    // Calculate duration
    let duration = '';
    if (logIn && logOut) {
        const diffMs = new Date(logOut.timestamp).getTime() - new Date(logIn.timestamp).getTime();
        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        duration = `${hrs} ${t.hourLabel} ${mins} ${t.minuteLabel}`;
    }

    const tabs = [
        { key: 'details' as const, label: t.details, icon: <Clock size={14} /> },
        { key: 'photoIn' as const, label: t.checkInPhoto, icon: <Camera size={14} />, hasData: !!logIn?.photo_url },
        { key: 'photoOut' as const, label: t.checkOutPhoto, icon: <Camera size={14} />, hasData: !!logOut?.photo_url },
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center backdrop-blur-sm" onClick={onClose}>
            <div onClick={e => e.stopPropagation()} className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] flex flex-col relative animate-fadeIn overflow-hidden shadow-2xl max-h-[92vh]">

                {/* Modern Gradient Header */}
                <div className={`relative overflow-hidden shrink-0 ${isSiteVisit ? 'bg-gradient-to-br from-orange-500 to-amber-600' : 'bg-gradient-to-br from-teal-500 to-emerald-600'}`}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9zdmc+')] opacity-50"></div>
                    <div className="relative p-5 pb-6">
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 transition-colors active:scale-95">
                                <ChevronLeft size={20} className="text-white" />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase ${isComplete ? 'bg-white/20 text-white' : 'bg-yellow-400/30 text-yellow-100'}`}>
                                    {isComplete ? `✓ ${t.success_status}` : `⏳ ${t.waiting_out_status}`}
                                </span>
                            </div>
                        </div>

                        <h3 className="text-white font-black text-xl mb-1 tracking-tight">
                            {isSiteVisit ? t.siteLog : t.attendanceLog}
                        </h3>
                        <p className="text-white/70 text-sm font-medium">{dateStr}</p>

                        {/* Time Display */}
                        <div className="mt-5 flex items-center gap-3">
                            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-white/10">
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1">เข้า</p>
                                <p className="text-white text-2xl font-black font-mono tracking-tight">{timeIn}</p>
                            </div>
                            <div className="flex flex-col items-center gap-1 text-white/40">
                                <ChevronRight size={18} />
                                {duration && <span className="text-[10px] font-bold text-white/50 whitespace-nowrap">{duration}</span>}
                            </div>
                            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-white/10">
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1">ออก</p>
                                <p className="text-white text-2xl font-black font-mono tracking-tight">{timeOut}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pill Tabs */}
                <div className="flex gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 shrink-0 overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all active:scale-95 ${activeTab === tab.key
                                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-md border border-teal-200 dark:border-teal-500/30 ring-1 ring-teal-100 dark:ring-teal-500/10'
                                : 'bg-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/40'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {'hasData' in tab && tab.hasData && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {activeTab === 'details' && (
                        <div className="p-5 space-y-4">
                            {/* Employee Card */}
                            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                                    {(profile.first_name || 'U').charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px] truncate">{profile.first_name} {profile.last_name || ''}</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold">{profile.position || 'Employee'}</p>
                                </div>
                                <div className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20">
                                    <span className="text-[11px] font-mono font-black text-teal-600 dark:text-teal-400">#{baseLog.id.slice(0, 8).toUpperCase()}</span>
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                                <div className="p-4 flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-500/20">
                                        <MapPin size={18} className="text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{t.location}</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-200 text-[14px]">{baseLog.location_name || t.notSpecified}</p>
                                        {baseLog.location_lat && baseLog.location_lng && (
                                            <p className="text-[11px] font-mono text-slate-400 mt-1">{baseLog.location_lat.toFixed(6)}, {baseLog.location_lng.toFixed(6)}</p>
                                        )}
                                    </div>
                                </div>
                                {baseLog.location_lat && (
                                    <a
                                        href={`https://www.google.com/maps?q=${baseLog.location_lat},${baseLog.location_lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-700/30 text-blue-600 dark:text-blue-400 text-sm font-bold border-t border-slate-100 dark:border-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors active:scale-[98%]"
                                    >
                                        <MapPin size={14} /> {t.openMap}
                                    </a>
                                )}
                            </div>


                        </div>
                    )}

                    {activeTab === 'photoIn' && (
                        <div className="p-5">
                            {logIn?.photo_url ? (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ภาพบันทึกเข้า · {timeIn}</p>
                                    <img src={logIn.photo_url} alt="Check In" className="w-full object-contain rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-black" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-slate-600">
                                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
                                        <Camera size={32} strokeWidth={1.5} />
                                    </div>
                                    <p className="font-bold text-base text-slate-400 dark:text-slate-500">{t.noPhotoIn}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'photoOut' && (
                        <div className="p-5">
                            {logOut?.photo_url ? (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ภาพบันทึกออก · {timeOut}</p>
                                    <img src={logOut.photo_url} alt="Check Out" className="w-full object-contain rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-black" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-slate-600">
                                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
                                        <Camera size={32} strokeWidth={1.5} />
                                    </div>
                                    <p className="font-bold text-base text-slate-400 dark:text-slate-500">{t.noPhotoOut}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface EmployeeDashboardProps {
    onNavigate: (view: any) => void;
}

const EmployeeDashboard = ({ onNavigate }: EmployeeDashboardProps) => {
    const { user, signOut } = useAuth();
    const { t, lang } = useApp();
    const [activeTab, setActiveTab] = useState('home');
    const [currentView, setCurrentView] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [todayLogs, setTodayLogs] = useState<AttendanceLog[]>([]);
    const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [leaveBalance, setLeaveBalance] = useState({ total: 15, used: 0, remaining: 15 });
    const [workingHours, setWorkingHours] = useState('--:--');

    // Camera & Modal State
    const [showCamera, setShowCamera] = useState(false);
    const [attendanceType, setAttendanceType] = useState<'check_in' | 'check_out' | 'site_in' | 'site_out'>('check_in');
    const [locationNote, setLocationNote] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    // Change password state
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState<Partial<Profile>>({});
    const [pwForm, setPwForm] = useState({ newPassword: '', confirmPassword: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    // GPS live position state
    const [livePosition, setLivePosition] = useState<{ lat: number; lng: number } | null>(null);
    const [todayDistance, setTodayDistance] = useState<number>(0);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [selectedLogDetail, setSelectedLogDetail] = useState<{ in?: AttendanceLog; out?: AttendanceLog } | null>(null);
    const [managerName, setManagerName] = useState<string>('');
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [showNotifPanel, setShowNotifPanel] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast(t.fileSizeError || 'File is too large (max 2MB)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileForm(prev => ({ ...prev, avatar_url: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    // === AVATAR CLICK: OPEN PROFILE ===
    const handleAvatarClick = () => {
        setActiveTab('profile');
        setCurrentView('dashboard');
    };
    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        }
    }, [user]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setCameraStream(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (e) {
                showToast("Cannot access camera. Please allow camera permissions.", 'error');
                setShowCamera(false);
            }
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    useEffect(() => {
        if (showCamera) {
            startCamera();
            if (attendanceType === 'site_in') {
                setLocationNote('');
            } else if (attendanceType === 'check_in' || attendanceType === 'check_out') {
                setLocationNote('Head Office');
            } else if (attendanceType === 'site_out') {
                setLocationNote('Left Site');
            }
            // Get live GPS position for display
            setLivePosition(null);
            navigator.geolocation?.getCurrentPosition(
                (pos) => setLivePosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => { },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            stopCamera();
            setLivePosition(null);
        }
    }, [showCamera, attendanceType]);

    const capturePhoto = () => {
        if (attendanceType === 'site_in' && !locationNote.trim()) {
            showToast("Please enter the Site/Client Name", 'error');
            return;
        }

        if (!locationNote.trim()) {
            if (attendanceType === 'check_in' || attendanceType === 'check_out') {
                showToast("Please verify your location name", 'error');
                return;
            }
        }

        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
                const photoData = canvasRef.current.toDataURL('image/jpeg', 0.7);
                submitAttendance(photoData);
            }
        }
    };

    const calculateWorkingHours = (logs: AttendanceLog[]) => {
        if (!logs || logs.length === 0) return '--:--';

        let totalMs = 0;
        const sorted = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];
            const isLikeIn = current.type === 'check_in' || current.type === 'site_in';

            if (isLikeIn) {
                const inTime = new Date(current.timestamp).getTime();
                const next = sorted[i + 1];
                const nextIsLikeOut = next && (next.type === 'check_out' || next.type === 'site_out');

                if (nextIsLikeOut) {
                    const outTime = new Date(next.timestamp).getTime();
                    totalMs += Math.max(0, outTime - inTime);
                    i++; // skip next out
                } else {
                    // Still working in this session
                    const now = Math.max(Date.now(), inTime);
                    totalMs += (now - inTime);
                }
            }
        }

        if (totalMs === 0) return '--:--';

        const hours = Math.floor(totalMs / (1000 * 60 * 60));
        const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Try with work_shifts join first, fallback to basic query
            let profileData: any = null;
            let profileError: any = null;

            const res1 = await supabase.from('profiles').select('*, work_shifts(*)').eq('id', user!.id).single();
            if (res1.error) {
                // FK relationship may not exist — fallback to basic query
                console.warn('[EmployeeDashboard] work_shifts join failed, trying basic query:', res1.error.message);
                const res2 = await supabase.from('profiles').select('*').eq('id', user!.id).single();
                profileData = res2.data;
                profileError = res2.error;
            } else {
                profileData = res1.data;
                profileError = null;
            }

            // === DEBUG ===
            if (profileData) {
                setProfile(profileData);
                // Fetch manager/approver name
                if (profileData.manager_id) {
                    const { data: mgr } = await supabase.from('profiles').select('first_name, last_name').eq('id', profileData.manager_id).single();
                    if (mgr) setManagerName(`${mgr.first_name} ${mgr.last_name || ''}`.trim());
                }
            } else {
                console.warn('[EmployeeDashboard] ⚠️ No profile data! RLS SELECT policy on profiles may be missing.');
            }

            // Get attendance logs for today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: logs } = await supabase
                .from('attendance_logs')
                .select('*')
                .eq('user_id', user!.id)
                .gte('timestamp', today.toISOString())
                .order('timestamp', { ascending: false });

            if (logs && logs.length > 0) {
                setTodayLogs(logs as AttendanceLog[]);
                const latestLog = logs[0]; // descending order by timestamp
                const isCurrentlyIn = latestLog.type === 'check_in' || latestLog.type === 'site_in';
                setIsCheckedIn(isCurrentlyIn);

                setWorkingHours(calculateWorkingHours(logs as AttendanceLog[]));
                setTodayDistance(calculateTotalDistance(logs as AttendanceLog[]));
            } else if (logs) {
                setTodayLogs([]);
                setIsCheckedIn(false);
                setWorkingHours('--:--');
                setTodayDistance(0);
            }

            // Get leave balance
            const { data: allUserLeaves } = await supabase
                .from('leave_requests')
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            const approvedCount = (allUserLeaves || []).filter(r => r.status === 'approved').length;
            setLeaveBalance({ total: 15, used: approvedCount, remaining: 15 - approvedCount });
            setRecentLeaves((allUserLeaves || []).slice(0, 5));

            // Fetch notifications
            const { data: notifs } = await supabase.from('notifications')
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false })
                .limit(20);
            if (notifs) setNotifications(notifs as AppNotification[]);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const initiateAttendance = (type: 'check_in' | 'check_out' | 'site_in' | 'site_out') => {
        setAttendanceType(type);
        setShowCamera(true);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitAttendance = async (photo: string) => {
        if (isSubmitting) return; // Concurrency guard
        try {
            setIsSubmitting(true);
            setLoading(true);

            // Get GPS location
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;

            // Simple "ontime" logic (assuming 9 AM start)
            const now = new Date();
            const hour = now.getHours();
            const status = hour < 9 ? 'ontime' : 'late';

            const { error } = await supabase.from('attendance_logs').insert({
                user_id: user!.id,
                type: attendanceType,
                timestamp: now.toISOString(),
                location_lat: latitude,
                location_lng: longitude,
                location_name: locationNote,
                photo_url: photo,
                status: attendanceType === 'check_in' ? status : 'ontime'
            });

            if (error) throw error;

            setShowCamera(false);
            await fetchDashboardData();
            showToast(t.attendanceSuccess, 'success');

        } catch (error: any) {
            console.error('Error submitting attendance:', error);
            showToast(`${t.attendanceFailed} ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const startEditing = () => {
        if (!profile) return;
        setProfileForm({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            phone: profile.phone || '',
            bank_name: profile.bank_name || '',
            bank_account: profile.bank_account || '',
            tax_id: profile.tax_id || '',
            social_security_id: profile.social_security_id || '',
        });
        setIsEditingProfile(true);
    };

    const handleSaveProfile = async () => {
        if (!user || !profile) return;
        try {
            setIsSavingProfile(true);
            const { error } = await supabase
                .from('profiles')
                .update(profileForm)
                .eq('id', user.id);

            if (error) throw error;

            setProfile({ ...profile, ...profileForm } as Profile);
            setIsEditingProfile(false);
            showToast(t.profileUpdateSuccess || 'Profile updated successfully', 'success');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            showToast(`${t.errorUpdatingProfile || 'Error updating profile'}: ${error.message}`, 'error');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        try {
            if (pwForm.newPassword !== pwForm.confirmPassword) {
                showToast(t.passwordNotMatch, 'error');
                return;
            }
            if (pwForm.newPassword.length < 6) {
                showToast(t.passwordMinLength, 'error');
                return;
            }

            setPwLoading(true);
            const { error } = await supabase.auth.updateUser({
                password: pwForm.newPassword
            });

            if (error) throw error;

            showToast(t.changePasswordSuccessAlert, 'success');
            setShowChangePassword(false);
            setPwForm({ newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            showToast(`${t.errorUpdatingPassword} ${err.message}`, 'error');
        } finally {
            setPwLoading(false);
        }
    };

    if (currentView === 'leave-request') {
        return <LeaveRequestPage onBack={() => setCurrentView('dashboard')} />;
    }

    if (currentView === 'payslip') {
        return <EmployeePayslipView userId={user!.id} onBack={() => setCurrentView('dashboard')} />;
    }

    if (loading && !profile) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 relative mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t.loadingData}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t.pleaseWaitPreparingData}</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-100 dark:bg-slate-950 flex justify-center selection:bg-indigo-100 dark:selection:bg-indigo-500/30">
            <div className="w-full lg:max-w-7xl bg-[#f8fafc] dark:bg-[#0f172a] flex flex-col font-sans h-[100dvh] relative md:shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:md:shadow-[0_0_40px_rgba(0,0,0,0.5)] lg:border-l lg:border-r border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Camera Overlay Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-fadeIn overflow-y-auto scrollbar-hide">
                    <div className="flex justify-between items-start p-4 md:p-6 shrink-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent">
                        <div>
                            <h3 className="text-2xl font-black tracking-tight flex items-center gap-2.5" style={{ color: '#ffffff' }}>
                                <Camera style={{ color: '#ffffff' }} size={26} /> {attendanceType === 'site_in' ? t.siteArrival : attendanceType === 'site_out' ? t.siteDeparture : attendanceType.replace('_', ' ').toUpperCase()}
                            </h3>
                            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white mt-2.5 shadow-lg">
                                <span className="text-sm font-extrabold text-slate-800 tracking-wide">{t.cameraVerification}</span>
                            </div>
                        </div>
                        <button onClick={() => setShowCamera(false)} className="w-12 h-12 md:w-14 md:h-14 shrink-0 flex items-center justify-center rounded-2xl bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/30 active:scale-95 border-2 border-white/20">
                            <X size={28} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="flex-1 relative flex flex-col items-center justify-center px-4 shrink-0 min-h-[40vh] py-4">
                        <div className="relative w-full max-w-xs md:max-w-sm max-h-[45vh] lg:max-h-[55vh] aspect-[3/4] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-[4px] md:border-[6px] border-white/10 bg-black group mx-auto shrink-0 flex items-center justify-center">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                            <canvas ref={canvasRef} className="hidden" />

                            <div className="absolute inset-0 border-[2px] border-indigo-500/30 rounded-[1.8rem] md:rounded-[2.5rem] pointer-events-none"></div>
                            <div className="absolute inset-4 md:inset-8 border-[1.5px] border-white/20 border-dashed rounded-[1.5rem] md:rounded-[2rem] pointer-events-none"></div>

                            {/* Decorative scanline effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-indigo-500/5 opacity-50 pointer-events-none"></div>
                        </div>
                    </div>

                    <div className="p-4 md:p-8 pb-8 md:pb-12 w-full max-w-sm md:max-w-md mx-auto shrink-0 mt-auto">
                        <div className="glass-panel p-5 md:p-6 space-y-4 md:space-y-5 border-white/10 backdrop-blur-2xl shadow-xl">
                            <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-200 dark:border-slate-700 shadow-sm transition-all">
                                <Crosshair size={18} className={livePosition ? 'text-emerald-500' : 'text-amber-500 animate-pulse'} />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 font-bold uppercase tracking-wider">{t.gpsLocation}</p>
                                    {livePosition ? (
                                        <a href={`https://www.google.com/maps?q=${livePosition.lat},${livePosition.lng}`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-indigo-600 dark:text-cyan-400 hover:underline font-bold transition">
                                            {livePosition.lat.toFixed(5)}, {livePosition.lng.toFixed(5)}
                                        </a>
                                    ) : (
                                        <span className="text-sm text-slate-400 italic font-medium">{t.waiting}</span>
                                    )}
                                </div>
                            </div>

                            {(attendanceType === 'site_in' || attendanceType === 'check_out') && (
                                <div className="animate-fadeIn">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 block">
                                        {attendanceType === 'site_in' ? t.clientSiteName : t.locationalNote}
                                    </label>
                                    <input
                                        type="text"
                                        value={locationNote}
                                        onChange={(e) => setLocationNote(e.target.value)}
                                        placeholder={attendanceType === 'site_in' ? t.egApple : t.egHeadOffice}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white text-base font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none shadow-sm"
                                        autoFocus={attendanceType === 'site_in'}
                                    />
                                </div>
                            )}

                            <div className="flex justify-center pt-2 pb-1 text-center flex-col items-center">
                                <button 
                                    onClick={capturePhoto} 
                                    disabled={loading || isSubmitting}
                                    className={`w-20 h-20 rounded-full bg-white dark:bg-slate-800 border-[3px] border-slate-200 dark:border-slate-600 flex items-center justify-center active:scale-95 transition-all shadow-md hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500 group mb-3 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <div className={`w-[56px] h-[56px] rounded-full bg-slate-900 dark:bg-white group-hover:scale-95 transition-transform ${(loading || isSubmitting) ? 'animate-pulse' : ''}`}></div>
                                </button>
                                <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
                                    {isSubmitting ? (t.saving || 'กำลังบันทึก...') : (attendanceType === 'site_in' ? t.enterSiteName : t.takeSelfie)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Viewer Modal */}
            {selectedPhoto && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedPhoto(null)}>
                    <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full backdrop-blur-md">
                        <X size={28} />
                    </button>
                    <img
                        src={selectedPhoto}
                        alt="Attendance"
                        className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-white/60 mt-6 font-medium tracking-wide">{t.tapToClose}</p>
                </div>
            )}

            {/* Header */}
            <header className="px-5 pt-4 pb-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shrink-0 rounded-b-[2rem] shadow-sm border-b border-slate-200/50 dark:border-slate-700/50 z-50 flex justify-between items-center relative gap-2">
                <div className="flex items-center gap-4">
                    <div className="w-[3.5rem] h-[3.5rem] rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[3px] cursor-pointer shadow-md hover:shadow-lg transition-all hover:scale-105 shrink-0" onClick={handleAvatarClick} title="Profile">
                        <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Profile" className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5 capitalize">{profile?.position || 'Employee'}</p>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none tracking-tight truncate">
                            {profile?.first_name || 'Team'} <span className="text-amber-500 inline-block">👋</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                    <SettingsToolbar />
                    <div className="relative">
                        <button onClick={() => setShowNotifPanel(!showNotifPanel)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700 relative">
                            <Bell size={18} strokeWidth={2.5} />
                            {notifications.filter(n => !n.is_read).length > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-[10px] text-white font-bold rounded-full flex items-center justify-center border border-white dark:border-slate-900">{notifications.filter(n => !n.is_read).length}</span>}
                        </button>
                        {showNotifPanel && (
                            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl z-50">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center"><span className="font-bold text-sm text-slate-800 dark:text-white">🔔 {t.notifications || 'การแจ้งเตือน'}</span>
                                    <button onClick={async () => { const unread = notifications.filter(n => !n.is_read).map(n => n.id); if (unread.length > 0) { await supabase.from('notifications').update({ is_read: true }).in('id', unread); setNotifications(prev => prev.map(n => ({ ...n, is_read: true }))); } }} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400">{t.readAll || 'อ่านทั้งหมด'}</button>
                                </div>
                                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800 scrollbar-hide">
                                    {notifications.length === 0 && <p className="p-8 text-center text-slate-400 font-bold text-sm">{t.noNotifications || 'ไม่มีการแจ้งเตือน'}</p>}
                                    {notifications.map(n => (
                                        <div key={n.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer ${!n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-500/5 border-l-[3px] border-indigo-500' : 'border-l-[3px] border-transparent'}`}
                                            onClick={async () => { if (!n.is_read) { await supabase.from('notifications').update({ is_read: true }).eq('id', n.id); setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x)); } }}>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1">{n.title}</p>
                                            {n.message && <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>}
                                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-2">{new Date(n.created_at).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {(['admin', 'hr', 'manager'].includes((profile?.role || '').toLowerCase())) && (
                        <button onClick={() => onNavigate('admin-dashboard')} className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-all active:scale-95 shadow-sm border border-indigo-100 dark:border-indigo-500/20" title="Admin Panel">
                            <Shield size={18} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-5 pt-3 pb-8 scrollbar-hide">

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        <div className="lg:col-span-7 space-y-6">
                        {/* Status Card */}
                        <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 relative overflow-hidden backdrop-blur-md">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-base font-bold tracking-wide uppercase mb-1.5">{t.currentStatus}</p>
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-3 h-3 rounded-full shadow-sm ${isCheckedIn ? 'bg-emerald-500 shadow-emerald-500/30 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                        <h2 className={`text-2xl font-black tracking-tight ${isCheckedIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                            {isCheckedIn ? t.working : t.notCheckedIn}
                                        </h2>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 dark:text-slate-400 text-base font-bold tracking-wide uppercase mb-1.5">{t.today}</p>
                                    <p className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100 tracking-wider leading-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-[1rem] shadow-inner">
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-700/50 border-t border-slate-100 dark:border-slate-700/50 pt-5 mt-2 relative z-10 bg-slate-50/50 dark:bg-slate-900/30 -mx-6 -mb-6 px-6 pb-6 rounded-b-[2.5rem]">
                                <div className="text-center px-1 py-2 sm:py-0">
                                    <p className="text-[11px] sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 sm:mb-1.5 uppercase tracking-widest">{t.inTime}</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">{todayLogs.find(l => l.type === 'check_in')?.timestamp ? new Date(todayLogs.find(l => l.type === 'check_in')!.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                                </div>
                                <div className="text-center px-1 py-2 sm:py-0">
                                    <p className="text-[11px] sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 sm:mb-1.5 uppercase tracking-widest">{t.outTime}</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">{todayLogs.find(l => l.type === 'check_out')?.timestamp ? new Date(todayLogs.find(l => l.type === 'check_out')!.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                                </div>
                                <div className="text-center px-1 py-2 sm:py-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/30 sm:border-none">
                                    <p className="text-[11px] sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 sm:mb-1.5 uppercase tracking-widest">{t.workingHrs}</p>
                                    <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm sm:text-base">{workingHours}</p>
                                </div>
                                <div className="text-center px-1 py-2 sm:py-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/30 sm:border-none">
                                    <p className="text-[11px] sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 sm:mb-1.5 uppercase tracking-widest">{t.distance}</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">{todayDistance > 0 ? todayDistance.toFixed(1) : '0'} <span className="text-[11px] text-slate-500 font-semibold uppercase">km</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                            <button onClick={() => initiateAttendance('site_in')} className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center gap-3 hover:bg-orange-50 dark:hover:bg-slate-700/50 transition-all group active:scale-95">
                                <div className="w-14 h-14 rounded-[1.2rem] bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform border border-orange-100 dark:border-orange-500/20 shadow-sm"><Briefcase size={24} strokeWidth={2.5} /></div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 text-center leading-tight tracking-wide" dangerouslySetInnerHTML={{ __html: t.siteArrival.split(' ').join('<br />') }}></span>
                            </button>
                            <button onClick={() => initiateAttendance('site_out')} className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center gap-3 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all group active:scale-95">
                                <div className="w-14 h-14 rounded-[1.2rem] bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform border border-blue-100 dark:border-blue-500/20 shadow-sm"><Building size={24} strokeWidth={2.5} /></div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 text-center leading-tight tracking-wide" dangerouslySetInnerHTML={{ __html: t.siteDeparture.split(' ').join('<br />') }}></span>
                            </button>
                            <button onClick={() => setCurrentView('payslip')} className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center gap-3 hover:bg-emerald-50 dark:hover:bg-slate-700/50 transition-all group active:scale-95">
                                <div className="w-14 h-14 rounded-[1.2rem] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100 dark:border-emerald-500/20 shadow-sm"><FileText size={24} strokeWidth={2.5} /></div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 text-center leading-tight tracking-wide" dangerouslySetInnerHTML={{ __html: t.payslip.split(' ').join('<br />') }}></span>
                            </button>
                        </div>

                        {profile?.work_shifts && (
                            <div className="bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20 rounded-[1.5rem] p-4 flex items-center justify-center gap-3 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/30 text-indigo-500 flex items-center justify-center"><Clock size={16} strokeWidth={2.5} /></div>
                                <span className="text-sm font-bold text-indigo-800 dark:text-indigo-300 tracking-wide">{t.shift}: {profile.work_shifts.start_time?.slice(0, 5)} - {profile.work_shifts.end_time?.slice(0, 5)}</span>
                            </div>
                        )}
                        </div>

                        <div className="lg:col-span-5 space-y-8">
                        <div className="mt-0 lg:mt-0">
                            <div className="flex justify-between items-center mb-5 px-2">
                                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{t.recentActivity}</h3>
                                <button onClick={() => setActiveTab('calendar')} className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-4 py-2 rounded-full transition-colors active:scale-95">{t.viewAll}</button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {todayLogs.length === 0 && (
                                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 text-center border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                                            <Calendar size={24} className="text-slate-400 dark:text-slate-500" strokeWidth={2.5} />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-semibold tracking-wide">{t.noActivityToday}</p>
                                    </div>
                                )}
                                {(() => {
                                    // Pair today's logs using similar logic as HistoryTab
                                    const sortedLogs = [...todayLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                                    const paired: { in?: AttendanceLog; out?: AttendanceLog }[] = [];

                                    for (let i = 0; i < sortedLogs.length; i++) {
                                        const current = sortedLogs[i];
                                        const isLikeIn = current.type === 'check_in' || current.type === 'site_in';
                                        const isLikeOut = current.type === 'check_out' || current.type === 'site_out';

                                        if (isLikeIn) {
                                            const next = sortedLogs[i + 1];
                                            const nextIsLikeOut = next && (next.type === 'check_out' || next.type === 'site_out');

                                            if (nextIsLikeOut) {
                                                paired.push({ in: current, out: next });
                                                i++;
                                            } else {
                                                paired.push({ in: current });
                                            }
                                        } else if (isLikeOut) {
                                            paired.push({ out: current });
                                        }
                                    }

                                    return paired.reverse().map((pair, idx) => {
                                        const log = pair.in || pair.out;
                                        if (!log) return null;

                                        const dist = pair.in && pair.out && pair.in.location_lat && pair.in.location_lng && pair.out.location_lat && pair.out.location_lng
                                            ? haversineDistance(pair.in.location_lat, pair.in.location_lng, pair.out.location_lat, pair.out.location_lng)
                                            : null;

                                        const timeIn = pair.in ? new Date(pair.in.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '##:##';
                                        const timeOut = pair.out ? new Date(pair.out.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '##:##';

                                        // Determine icon logic based on the pair type
                                        const isSiteSession = pair.in?.type === 'site_in' || pair.out?.type === 'site_out';

                                        return (
                                            <div key={log.id} onClick={() => setSelectedLogDetail(pair)} className="cursor-pointer bg-white dark:bg-slate-800 rounded-[1.5rem] p-4.5 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-500/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center flex-shrink-0 ${isSiteSession ? 'bg-orange-50/50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20' : 'bg-indigo-50/50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20'}`}>
                                                        {isSiteSession ? <Briefcase size={20} strokeWidth={2.5} /> : <Clock size={20} strokeWidth={2.5} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 capitalize text-sm mb-1">{isSiteSession ? 'Site Visit' : 'Attendance'}</h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 font-medium tracking-wide">
                                                            <span className="font-mono bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md text-sm font-bold shadow-sm">{timeIn} - {timeOut}</span>
                                                            <span className="truncate">{log.location_name || 'No Location Data'}</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        {pair.in?.status === 'ontime' && (
                                                            <div className="text-[10px] font-extrabold px-2.5 py-1 rounded-md tracking-widest uppercase text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">ON TIME</div>
                                                        )}
                                                        {pair.in?.status === 'late' && (
                                                            <div className="text-[10px] font-extrabold px-2.5 py-1 rounded-md tracking-widest uppercase text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">LATE</div>
                                                        )}
                                                        {dist !== null && dist > 0.01 && (
                                                            <span className="text-sm text-indigo-600 bg-indigo-50 border border-indigo-100 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                                                                <Route size={10} strokeWidth={2.5} /> {dist.toFixed(2)} km
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* GPS Coordinates & Photo indicators */}
                                                <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/30 flex items-center gap-2 ml-[4rem]">
                                                    {log.location_lat && log.location_lng ? (
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs font-mono text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700 flex-1 font-medium transition-colors">
                                                            <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                                                            <span className="truncate">{log.location_lat.toFixed(6)}, {log.location_lng.toFixed(6)}</span>
                                                        </div>
                                                    ) : <div className="flex-1"></div>}

                                                    {log.photo_url && (
                                                        <div
                                                            className="flex items-center justify-center gap-1 rounded-xl bg-slate-50 dark:bg-slate-800 p-2 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700"
                                                            title={t.viewPhoto}
                                                        >
                                                            <Camera size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {/* Recent Leaves Status */}
                        {recentLeaves.length > 0 && (
                            <div className="mt-8 pt-2">
                                <div className="flex justify-between items-center mb-5 px-2">
                                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">สถานะการลาล่าสุด</h3>
                                    <button onClick={() => setActiveTab('leave')} className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-4 py-2 rounded-full transition-colors active:scale-95">{t.viewAll}</button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {recentLeaves.map(leave => (
                                        <div key={leave.id} className="bg-white dark:bg-slate-800 rounded-[1.5rem] p-4.5 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:border-purple-200 dark:hover:border-purple-500/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center flex-shrink-0 bg-purple-50/50 text-purple-500 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20`}>
                                                    <Calendar size={20} strokeWidth={2.5} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 capitalize text-sm">{leave.leave_type}</h4>
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                            leave.status === 'approved' ? 'bg-emerald-500 text-white' : 
                                                            leave.status === 'rejected' ? 'bg-rose-500 text-white' : 
                                                            'bg-amber-500 text-white'
                                                        }`}>
                                                            {leave.status === 'approved' ? t.approved : leave.status === 'pending_manager' ? 'รอหัวหน้าอนุมัติ' : leave.status === 'pending' ? 'รอ HR อนุมัติ' : leave.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 font-medium tracking-wide">
                                                        <span className="font-mono bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md text-xs font-bold">
                                                            {new Date(leave.start_date).toLocaleDateString('th-TH', {day:'numeric', month:'short'})} - {new Date(leave.end_date).toLocaleDateString('th-TH', {day:'numeric', month:'short'})}
                                                        </span>
                                                        <span className="truncate italic">"{leave.reason}"</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'calendar' && <HistoryTab userId={user?.id} onViewPhoto={setSelectedPhoto} onSelectLogDetail={setSelectedLogDetail} />}

                {/* COMPANY CALENDAR TAB */}
                {activeTab === 'company-calendar' && <CompanyCalendar userId={user?.id} onViewPhoto={setSelectedPhoto} onSelectLogDetail={setSelectedLogDetail} />}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="animate-fadeIn pt-2 pb-24">
                        <div className="flex flex-col items-center mb-8 relative">
                            {!isEditingProfile ? (
                                <button onClick={startEditing} className="absolute top-0 right-0 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm text-slate-500 hover:text-indigo-500 transition-colors group active:scale-95" title={t.edit || 'Edit Profile'}>
                                    <Edit2 size={20} className="group-hover:rotate-12 transition-transform" />
                                </button>
                            ) : (
                                <div className="absolute top-0 right-0 flex gap-2">
                                    <button onClick={() => setIsEditingProfile(false)} className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm text-slate-500 hover:text-rose-500 transition-colors group active:scale-95" title={t.cancel || 'Cancel'}>
                                        <RotateCcw size={20} className="group-hover:-rotate-45 transition-transform" />
                                    </button>
                                    <button onClick={handleSaveProfile} disabled={isSavingProfile} className="p-3 rounded-2xl bg-indigo-500 border border-indigo-600 shadow-sm text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 group active:scale-95" title={t.save || 'Save Changes'}>
                                        {isSavingProfile ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} className="group-hover:scale-110 transition-transform" />}
                                    </button>
                                </div>
                            )}

                            <div className="relative w-[110px] h-[110px] rounded-[2.5rem] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[3px] mb-5 shadow-xl rotate-[5deg] hover:rotate-0 transition-transform duration-300 group">
                                <img src={isEditingProfile && profileForm.avatar_url ? profileForm.avatar_url : (profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`)} alt="Profile" className={`w-full h-full rounded-[2.3rem] bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 object-cover -rotate-[5deg] transition-all ${isEditingProfile ? 'opacity-80' : ''}`} />
                                {isEditingProfile && (
                                    <>
                                        <div onClick={() => fileInputRef.current?.click()} className="absolute inset-[3px] rounded-[2.3rem] bg-black/40 -rotate-[5deg] flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors z-10 opacity-100 backdrop-blur-[2px]">
                                            <Camera size={28} className="text-white" />
                                        </div>
                                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" />
                                    </>
                                )}
                            </div>

                            {!isEditingProfile ? (
                                <>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-1">{profile?.first_name} {profile?.last_name}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold tracking-wide">{profile?.position || 'Employee'}</p>
                                </>
                            ) : (
                                <div className="space-y-3 w-full max-w-[280px]">
                                    <div className="flex gap-2">
                                        <input type="text" value={profileForm.first_name || ''} onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })} placeholder={t.firstName} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm font-bold focus:border-indigo-500 outline-none text-center" />
                                        <input type="text" value={profileForm.last_name || ''} onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })} placeholder={t.lastName} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm font-bold focus:border-indigo-500 outline-none text-center" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold tracking-wide text-center">{profile?.position || 'Employee'}</p>
                                </div>
                            )}

                            <div className="mt-3 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black shadow-sm border border-indigo-100 dark:border-indigo-500/20 uppercase tracking-widest">{profile?.department || 'General Department'}</div>
                        </div>

                        {/* 2-column grid on large screens */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">

                            {/* Personal Information */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 mb-1">{t.personalInfo}</h3>
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-[1.8rem] border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[1rem] bg-slate-50 dark:bg-slate-900/80 flex items-center justify-center border border-slate-200/50 dark:border-slate-700 font-bold shrink-0 text-slate-500"><User size={20} strokeWidth={2.5} /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.employeeId}</p>
                                            <p className="font-bold text-slate-800 dark:text-slate-100 font-mono text-[15px] truncate uppercase">{profile?.employee_code || user?.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[1rem] bg-slate-50 dark:bg-slate-900/80 flex items-center justify-center border border-slate-200/50 dark:border-slate-700 font-bold shrink-0 text-slate-500"><Mail size={20} strokeWidth={2.5} /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.emailLabel}</p>
                                            <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px] truncate">{profile?.email || user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[1rem] bg-slate-50 dark:bg-slate-900/80 flex items-center justify-center border border-slate-200/50 dark:border-slate-700 font-bold shrink-0 text-slate-500"><Phone size={20} strokeWidth={2.5} /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.phoneLabel}</p>
                                            {!isEditingProfile ? (
                                                <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px] truncate">{profile?.phone || '-'}</p>
                                            ) : (
                                                <input type="text" value={profileForm.phone || ''} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder={t.phoneLabel} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 text-slate-900 dark:text-white text-sm font-bold focus:border-indigo-500 outline-none" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Employment Information */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 mb-1">{t.employmentInfo}</h3>
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-[1.8rem] border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-500/20 shrink-0 text-indigo-500"><Briefcase size={20} strokeWidth={2.5} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.roleHeader}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-800 dark:text-slate-100 capitalize text-[15px]">{profile?.role}</p>
                                                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">{profile?.is_active ? t.active : t.inactive}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-500/20 shrink-0 text-indigo-500"><Clock size={20} strokeWidth={2.5} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.shift}</p>
                                            <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">{profile?.work_shifts?.label || '-'} ({profile?.work_shifts?.start_time?.slice(0, 5)} - {profile?.work_shifts?.end_time?.slice(0, 5)})</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-500/20 shrink-0 text-indigo-500"><Calendar size={20} strokeWidth={2.5} /></div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.hireDate}</p>
                                            <div className="flex flex-wrap items-baseline gap-x-2">
                                                <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">{profile?.start_date ? new Date(profile.start_date).toLocaleDateString() : '-'}</p>
                                                {(() => {
                                                    const tenure = profile?.start_date ? calculateTenure(profile.start_date) : null;
                                                    if (!tenure) return null;
                                                    return (
                                                        <span className="text-indigo-600 dark:text-indigo-400 text-xs font-black">
                                                            ({tenure.years} {t.years}, {tenure.months} {t.months})
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Leave Approver */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[1rem] bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-100/50 dark:border-amber-500/20 shrink-0 text-amber-500"><UserCheck size={20} strokeWidth={2.5} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">ผู้อนุมัติการลา</p>
                                        <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">{managerName || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Information */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 mb-1">{t.financialInfo}</h3>
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-[1.8rem] border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[1rem] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100/50 dark:border-emerald-500/20 shrink-0 text-emerald-500"><CreditCard size={20} strokeWidth={2.5} /></div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.bankName} / {t.bankAccount}</p>
                                        {!isEditingProfile ? (
                                            <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">{profile?.bank_name || '-'} - {profile?.bank_account || '-'}</p>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input type="text" value={profileForm.bank_name || ''} onChange={e => setProfileForm({ ...profileForm, bank_name: e.target.value })} placeholder={t.bankName} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 text-slate-900 dark:text-white text-sm font-bold focus:border-indigo-500 outline-none" />
                                                <input type="text" value={profileForm.bank_account || ''} onChange={e => setProfileForm({ ...profileForm, bank_account: e.target.value })} placeholder={t.bankAccount} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 text-slate-900 dark:text-white text-sm font-bold focus:border-indigo-500 outline-none" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[1rem] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100/50 dark:border-emerald-500/20 shrink-0 text-emerald-500"><Shield size={20} strokeWidth={2.5} /></div>
                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.taxId}</p>
                                            {!isEditingProfile ? (
                                                <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px] truncate">{profile?.tax_id || '-'}</p>
                                            ) : (
                                                <input type="text" value={profileForm.tax_id || ''} onChange={e => setProfileForm({ ...profileForm, tax_id: e.target.value })} placeholder={t.taxId} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 text-slate-900 dark:text-white text-sm font-bold focus:border-indigo-500 outline-none" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.socialSecurityId}</p>
                                            {!isEditingProfile ? (
                                                <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px] truncate">{profile?.social_security_id || '-'}</p>
                                            ) : (
                                                <input type="text" value={profileForm.social_security_id || ''} onChange={e => setProfileForm({ ...profileForm, social_security_id: e.target.value })} placeholder={t.socialSecurityId} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 text-slate-900 dark:text-white text-sm font-bold focus:border-indigo-500 outline-none" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>{/* end 2-col grid */}

                        <div className="pt-4 pb-6 flex flex-col gap-3 lg:flex-row lg:gap-4">
                            <button onClick={() => setShowChangePassword(true)} className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2 font-bold shadow-sm active:scale-95 group">
                                <Lock size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform text-slate-400 dark:text-slate-500" /> {t.changePassword}
                            </button>
                            <button onClick={() => signOut()} className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/30 hover:border-rose-300 dark:hover:border-rose-500/50 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all flex items-center justify-center gap-2 font-bold shadow-sm active:scale-95 group">
                                <LogOut size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" /> {t.signOut}
                            </button>
                        </div>

                        {/* Change Password Modal */}
                        {showChangePassword && (
                            <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
                                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[2.5rem] p-7 border border-slate-200 dark:border-slate-700/50 shadow-2xl animate-fadeIn">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2.5 text-slate-900 dark:text-white"><Lock size={22} className="text-indigo-500" strokeWidth={2.5} /> {t.changePassword}</h3>
                                        <button onClick={() => { setShowChangePassword(false); setPwForm({ newPassword: '', confirmPassword: '' }); }} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition"><X size={18} strokeWidth={2.5} /></button>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 mb-6 shadow-sm">
                                        <p className="text-amber-800 dark:text-amber-300 text-base font-bold flex items-center gap-2"><span>⚠️</span> {t.passwordMinLength}</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-2">🔒 {t.newPassword}</label>
                                            <div className="relative">
                                                <input type={showNewPw ? 'text' : 'password'} value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder={t.minLength6} className={`w-full bg-slate-50 dark:bg-slate-900 border ${pwForm.newPassword && pwForm.newPassword.length < 6 ? 'border-rose-300 focus:ring-rose-200 dark:border-rose-500 dark:focus:ring-rose-900' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900/30'} rounded-2xl p-4 pr-12 text-slate-900 dark:text-white text-sm focus:ring-2 outline-none transition-shadow font-medium`} />
                                                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                            </div>
                                            {pwForm.newPassword && pwForm.newPassword.length < 6 && <p className="text-rose-500 dark:text-rose-400 text-sm font-bold mt-2 ml-1 flex items-center gap-1.5"><span>❌</span> {t.mustAtLeast6} ({pwForm.newPassword.length}/6)</p>}
                                        </div>
                                        <div>
                                            <label className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-2">🔒 {t.confirmPassword}</label>
                                            <div className="relative">
                                                <input type={showConfirmPw ? 'text' : 'password'} value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder={t.typeAgain} className={`w-full bg-slate-50 dark:bg-slate-900 border ${pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword ? 'border-rose-300 focus:ring-rose-200 dark:border-rose-500 dark:focus:ring-rose-900' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900/30'} rounded-2xl p-4 pr-12 text-slate-900 dark:text-white text-sm focus:ring-2 outline-none transition-shadow font-medium`} />
                                                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                            </div>
                                            {pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword && <p className="text-rose-500 dark:text-rose-400 text-sm font-bold mt-2 ml-1 flex items-center gap-1.5"><span>❌</span> {t.passwordNotMatch}</p>}
                                            {pwForm.confirmPassword && pwForm.confirmPassword === pwForm.newPassword && pwForm.newPassword.length >= 6 && <p className="text-emerald-500 dark:text-emerald-400 text-sm font-bold mt-2 ml-1 flex items-center gap-1.5"><span>✅</span> {t.passwordMatch}</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-8">
                                        <button onClick={() => { setShowChangePassword(false); setPwForm({ newPassword: '', confirmPassword: '' }); }} className="flex-[0.8] py-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-extrabold transition">{t.cancel}</button>
                                        <button onClick={handleChangePassword} disabled={pwLoading || pwForm.newPassword.length < 6 || pwForm.newPassword !== pwForm.confirmPassword} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none hover:shadow-lg disabled:active:scale-100">
                                            <Lock size={18} strokeWidth={2.5} /> {pwLoading ? t.saving : t.save}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </main>

            {/* Bottom Navigation */}
            <nav className="w-full shrink-0 mt-auto bg-white/98 dark:bg-slate-800/98 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-700/50 md:rounded-b-none rounded-t-[2.5rem] px-1 py-3 flex justify-around items-center z-50 shadow-[0_-15px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_-5px_40px_rgba(0,0,0,0.5)] pb-safe relative">
                <button onClick={() => { setActiveTab('home'); setCurrentView('dashboard'); }} className={`flex flex-col items-center gap-1 w-20 transition-all relative py-1.5 rounded-2xl ${activeTab === 'home' && currentView === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-500/15' : 'text-slate-400'}`} title={t.home}>
                    <MapPin size={28} className={`${activeTab === 'home' && currentView === 'dashboard' ? 'scale-110' : ''}`} strokeWidth={activeTab === 'home' && currentView === 'dashboard' ? 3 : 2.5} />
                    <span className="text-[14px] font-black tracking-tighter leading-none">{t.home}</span>
                </button>
                <button onClick={() => { setActiveTab('calendar'); setCurrentView('dashboard'); }} className={`flex flex-col items-center gap-1 w-20 transition-all relative py-1.5 rounded-2xl ${activeTab === 'calendar' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-500/15' : 'text-slate-400'}`}>
                    <Calendar size={28} className={`${activeTab === 'calendar' ? 'scale-110' : ''}`} strokeWidth={activeTab === 'calendar' ? 3 : 2.5} />
                    <span className="text-[14px] font-black tracking-tighter leading-none">{t.history}</span>
                </button>
                {/* Center Floating Action Button */}
                <div className="w-20 h-14 relative flex justify-center">
                    <button onClick={() => initiateAttendance(isCheckedIn ? 'check_out' : 'check_in')} className={`absolute bottom-1 w-[4.5rem] h-[4.5rem] rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl transform transition-transform hover:scale-105 active:scale-90 border-[5px] border-white dark:border-slate-900 ${isCheckedIn ? 'bg-gradient-to-tr from-rose-500 to-red-600' : 'bg-gradient-to-tr from-indigo-500 to-purple-600'}`}>
                        <Camera size={34} strokeWidth={2.5} />
                    </button>
                </div>
                <button onClick={() => setCurrentView('leave-request')} className={`flex flex-col items-center gap-1 w-20 transition-all relative py-1.5 rounded-2xl ${currentView === 'leave-request' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-500/15' : 'text-slate-400'}`}>
                    <FileText size={28} className={`${currentView === 'leave-request' ? 'scale-110' : ''}`} strokeWidth={currentView === 'leave-request' ? 3 : 2.5} />
                    <span className="text-[14px] font-black tracking-tighter leading-none">{t.requestLeave}</span>
                </button>
                <button onClick={() => { setActiveTab('company-calendar'); setCurrentView('dashboard'); }} className={`flex flex-col items-center gap-1 w-20 transition-all relative py-1.5 rounded-2xl ${activeTab === 'company-calendar' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-500/15' : 'text-slate-400'}`}>
                    <CalendarDays size={28} className={`${activeTab === 'company-calendar' ? 'scale-110' : ''}`} strokeWidth={activeTab === 'company-calendar' ? 3 : 2.5} />
                    <span className="text-[14px] font-black tracking-tighter leading-none whitespace-nowrap">{t.companyCalendar}</span>
                </button>
            </nav>

            {selectedLogDetail && profile && (
                <AttendanceDetailModal
                    pair={selectedLogDetail}
                    profile={profile}
                    onClose={() => setSelectedLogDetail(null)}
                    t={t}
                    lang={lang}
                />
            )}
            </div>
        </div>
    );
};

const HistoryTab = ({ userId, onViewPhoto, onSelectLogDetail }: { userId?: string; onViewPhoto: (url: string) => void; onSelectLogDetail?: (pair: any) => void }) => {
    const { t } = useApp();
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            const fetchHistory = async () => {
                const { data } = await supabase.from('attendance_logs')
                    .select('*')
                    .eq('user_id', userId)
                    .order('timestamp', { ascending: false })
                    .limit(100);
                if (data) setLogs(data as AttendanceLog[]);
                setLoading(false);
            };
            fetchHistory();
        }
    }, [userId]);

    // Group logs by local date
    const groupedLogs = logs.reduce((acc: any, log) => {
        const date = new Date(log.timestamp);
        const dateKey = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
        if (!acc[dateKey]) acc[dateKey] = { date: dateKey, displayDate: date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }), items: [] };
        acc[dateKey].items.push(log);
        return acc;
    }, {});

    const dayGroups = Object.values(groupedLogs);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="font-bold tracking-wide">Loading history...</p>
        </div>
    );

    const pairLogs = (items: AttendanceLog[]) => {
        const sortedItems = [...items].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const paired: { in?: AttendanceLog; out?: AttendanceLog }[] = [];

        for (let i = 0; i < sortedItems.length; i++) {
            const current = sortedItems[i];
            const isLikeIn = current.type === 'check_in' || current.type === 'site_in';
            const isLikeOut = current.type === 'check_out' || current.type === 'site_out';

            if (isLikeIn) {
                const next = sortedItems[i + 1];
                const nextIsLikeOut = next && (next.type === 'check_out' || next.type === 'site_out');

                if (nextIsLikeOut) {
                    paired.push({ in: current, out: next });
                    i++; // Skip next
                } else {
                    paired.push({ in: current });
                }
            } else if (isLikeOut) {
                paired.push({ out: current });
            }
        }
        return paired;
    };

    return (
        <div className="animate-fadeIn pb-24 space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Calendar className="text-indigo-500" /> {t.attendanceHistory}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{logs.length} {t.records}</span>
                </div>
            </div>
            {dayGroups.length === 0 && (
                <div className="bg-white dark:bg-slate-800/50 rounded-[2rem] p-10 text-center border border-slate-100 dark:border-slate-700/50 shadow-sm">
                    <History className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                    <p className="text-slate-500 dark:text-slate-400 font-bold">{t.noHistoryFound}</p>
                </div>
            )}

            <div className="space-y-4">
                {dayGroups.map((group: any) => {
                    const pairedLogs = pairLogs(group.items);
                    return (
                        <div key={group.date} className="bg-white dark:bg-slate-800/80 rounded-[2rem] p-5 lg:p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-50 dark:border-slate-700/30">
                                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                <h3 className="font-black text-slate-800 dark:text-slate-200 tracking-tight text-xl">{group.displayDate}</h3>
                            </div>

                            <div className="space-y-0 relative">
                                {/* Vertical Timeline Line */}
                                <div className="absolute left-[7px] top-2 bottom-6 w-[1.5px] bg-slate-100 dark:bg-slate-700/50"></div>

                                {pairedLogs.reverse().map((pair, idx) => {
                                    const log = pair.in || pair.out;
                                    if (!log) return null;

                                    const timeIn = pair.in ? new Date(pair.in.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '##:##';
                                    const timeOut = pair.out ? new Date(pair.out.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '##:##';

                                    return (
                                        <div key={log.id} onClick={() => onSelectLogDetail && onSelectLogDetail(pair)} className="cursor-pointer group relative pl-8 pb-6 last:pb-2 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 rounded-xl transition-colors">
                                            {/* Timeline Dot */}
                                            <div className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-[3px] border-white dark:border-slate-800 z-10 shadow-sm ${pair.in && pair.out ? 'bg-teal-500' : pair.in ? 'bg-sky-400' : 'bg-rose-400'
                                                }`}></div>

                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-start justify-between">
                                                    <h4 className="text-lg font-black text-slate-700 dark:text-slate-200 leading-tight">
                                                        {pair.in && pair.out ? 'บันทึกสำเร็จ' : pair.in ? 'บันทึกสำเร็จ (ยังไม่บันทึกออก)' : 'บันทึกออก (ไม่พบเข้า)'}
                                                    </h4>
                                                    <div className="border border-teal-500/30 dark:border-teal-400/20 bg-teal-50/30 dark:bg-teal-400/5 rounded px-2 py-0.5 text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 shadow-sm">
                                                        #{log.id.slice(0, 8).toUpperCase()}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mt-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-slate-400" />
                                                        <span className="font-mono text-[15px] tracking-tight">{timeIn} - {timeOut}</span>
                                                    </div>
                                                    {pair.in?.status === 'ontime' && (
                                                        <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-black border border-emerald-100 dark:border-emerald-500/20 shadow-sm">Ontime</span>
                                                    )}
                                                </div>

                                                <div className="flex items-start gap-2 text-sm font-bold text-slate-400 leading-relaxed mt-1">
                                                    <MapPin size={16} className="shrink-0 mt-0.5 opacity-60" />
                                                    <span className="line-clamp-2">{log.location_name || 'No Location Data'}</span>
                                                </div>

                                                {log.photo_url && (
                                                    <button
                                                        onClick={() => onViewPhoto(log.photo_url!)}
                                                        className="flex items-center gap-1.5 text-[10px] font-black text-[#00897b] hover:underline mt-2 bg-[#00897b]/5 px-3 py-1.5 rounded-xl w-fit border border-[#00897b]/10 active:scale-95 transition-all"
                                                    >
                                                        <Camera size={13} /> {t.viewPhoto}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CompanyCalendar = ({ userId, onViewPhoto, onSelectLogDetail }: { userId?: string; onViewPhoto: (url: string) => void; onSelectLogDetail?: (pair: any) => void }) => {
    const { t } = useApp();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDayLogs, setSelectedDayLogs] = useState<AttendanceLog[]>([]);
    const [selectedDayLeaves, setSelectedDayLeaves] = useState<LeaveRequest[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    useEffect(() => {
        if (userId) {
            fetchMonthLogs();
        }
    }, [userId, currentDate.getMonth(), currentDate.getFullYear()]);

    const fetchMonthLogs = async () => {
        setLoading(true);
        // Use YYYY-MM-DD for cleaner database comparison with 'date' type columns
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toLocaleDateString('en-CA');
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toLocaleDateString('en-CA');

        const [logRes, leaveRes] = await Promise.all([
            supabase.from('attendance_logs')
                .select('*')
                .eq('user_id', userId!)
                .gte('timestamp', `${startOfMonth}T00:00:00`)
                .lte('timestamp', `${endOfMonth}T23:59:59`)
                .order('timestamp', { ascending: true }),
            supabase.from('leave_requests')
                .select('*')
                .eq('user_id', userId!)
                .or(`status.eq.approved,status.eq.pending,status.eq.pending_manager`)
                .filter('end_date', 'gte', startOfMonth)
                .filter('start_date', 'lte', endOfMonth)
        ]);

        if (logRes.data) setLogs(logRes.data as AttendanceLog[]);
        if (leaveRes.data) setLeaves(leaveRes.data as LeaveRequest[]);
        setLoading(false);
    };

    useEffect(() => {
        if (selectedDate) {
            const dateStr = selectedDate.toLocaleDateString('en-CA');
            const dayLogs = logs.filter(l => new Date(l.timestamp).toLocaleDateString('en-CA') === dateStr);
            setSelectedDayLogs(dayLogs);
            
            const dayLeaves = leaves.filter(l => {
                const startStr = new Date(l.start_date).toLocaleDateString('en-CA');
                const endStr = new Date(l.end_date).toLocaleDateString('en-CA');
                return dateStr >= startStr && dateStr <= endStr;
            });
            setSelectedDayLeaves(dayLeaves);
        }
    }, [selectedDate, logs, leaves]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const months = [
        t.jan, t.feb, t.mar, t.apr, t.may, t.jun,
        t.jul, t.aug, t.sep, t.oct, t.nov, t.dec
    ];

    // สามารถเพิ่ม แก้ไข หรือลบ วันหยุดได้ที่ข้อมูลด้านล่างนี้เลยครับ
    const holidays2026: Record<string, string> = {
        // --- วันหยุดประจำปี (Public Holidays) ---
        '2026-01-01': 'วันขึ้นปีใหม่ (New Year\'s Day)',
        '2026-03-03': 'วันหยุดพิเศษ (Special Holiday)',
        '2026-04-06': 'วันจักรี (Chakri Memorial Day)',
        '2026-04-13': 'วันสงกรานต์ (Songkran Festival)',
        '2026-04-14': 'วันสงกรานต์ (Songkran Festival)',
        '2026-05-01': 'วันแรงงานแห่งชาติ (National Labour Day)',
        '2026-06-03': 'วันเฉลิมพระชนมพรรษาพระราชินี (H.M. Queen\'s Birthday)',
        '2026-07-28': 'วันเฉลิมพระชนมพรรษา ร.10 (H.M. King\'s Birthday)',
        '2026-08-12': 'วันแม่แห่งชาติ (Mother\'s Day)',
        '2026-10-13': 'วันคล้ายวันสวรรคต ร.9 (H.M. King IX Memorial Day)',
        '2026-10-23': 'วันปิยมหาราช (Chulalongkorn Day)',
        '2026-12-05': 'วันพ่อแห่งชาติ (H.M. Father\'s Day)',
        '2026-12-31': 'วันสิ้นปี (New Year\'s Eve)',

        // --- วันหยุดพิเศษเสาร์ (Special Saturdays) ---
        '2026-01-10': 'วันเสาร์หยุดพิเศษ / วันเด็กแห่งชาติ',
        '2026-01-24': 'วันเสาร์หยุดพิเศษ / วันตรุษจีน',
        '2026-02-07': 'วันเสาร์หยุดพิเศษ / วันมาฆบูชา',
        '2026-02-21': 'วันเสาร์หยุดพิเศษ',
        '2026-03-07': 'วันเสาร์หยุดพิเศษ',
        '2026-03-21': 'วันเสาร์หยุดพิเศษ',
        '2026-04-11': 'วันเสาร์หยุดพิเศษ',
        '2026-04-25': 'วันเสาร์หยุดพิเศษ',
        '2026-05-09': 'วันเสาร์หยุดพิเศษ',
        '2026-05-23': 'วันเสาร์หยุดพิเศษ',
        '2026-06-06': 'วันเสาร์หยุดพิเศษ',
        '2026-06-20': 'วันเสาร์หยุดพิเศษ',
    };

    const weekDays = [
        { key: 'Sun', label: 'อา', isSun: true },
        { key: 'Mon', label: 'จ', isSun: false },
        { key: 'Tue', label: 'อ', isSun: false },
        { key: 'Wed', label: 'พ', isSun: false },
        { key: 'Thu', label: 'พฤ', isSun: false },
        { key: 'Fri', label: 'ศ', isSun: false },
        { key: 'Sat', label: 'ส', isSun: false }
    ];

    const changeYear = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear() + offset, currentDate.getMonth(), 1));
        setSelectedDate(null);
    };

    const selectMonth = (monthIndex: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
        setSelectedDate(null);
    };

    return (
        <div className="animate-fadeIn pb-24 flex flex-col items-center overflow-y-auto">
            <div className="flex flex-col lg:flex-row bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden w-full max-w-5xl">

                {/* PART 1: LEFT SIDEBAR (Year & Months) */}
                <div className="w-full lg:w-32 bg-[#00897b] text-white flex flex-col shrink-0">
                    <div className="p-4 lg:p-4 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4 lg:mb-4">
                            <button onClick={() => changeYear(-1)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={16} /></button>
                            <span className="text-lg font-black tracking-tighter">{currentDate.getFullYear()}</span>
                            <button onClick={() => changeYear(1)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={16} /></button>
                        </div>

                        <div className="space-y-0.5 overflow-x-auto lg:overflow-x-visible flex lg:flex-col pb-2 lg:pb-0 scrollbar-hide flex-1">
                            {months.map((m, idx) => (
                                <button
                                    key={m}
                                    onClick={() => selectMonth(idx)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-lg lg:text-[19px] font-black transition-all whitespace-nowrap lg:whitespace-normal shrink-0 ${currentDate.getMonth() === idx ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10 opacity-70'
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* PART 2: MIDDLE (Calendar Grid) */}
                <div className="flex-1 p-3 lg:p-4 flex flex-col border-r border-slate-50 dark:border-slate-700/50 min-w-0">
                    <div className="flex flex-col items-center mb-4">
                        <div className="flex items-center gap-3 text-[#00897b] dark:text-teal-400">
                            <button 
                                onClick={() => selectMonth((currentDate.getMonth() - 1 + 12) % 12)}
                                className="p-1.5 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-full transition-all active:scale-90"
                            >
                                <ChevronLeft size={18} strokeWidth={3} />
                            </button>
                            <h3 className="text-xl font-black tracking-tight min-w-[100px] text-center">{months[currentDate.getMonth()]}</h3>
                            <button 
                                onClick={() => selectMonth((currentDate.getMonth() + 1) % 12)}
                                className="p-1.5 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-full transition-all active:scale-90"
                            >
                                <ChevronRight size={18} strokeWidth={3} />
                            </button>
                        </div>
                        <div className="w-8 h-1 bg-[#00897b]/20 rounded-full mt-1.5"></div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(d => (
                            <div key={d.key} className={`text-center text-[10px] lg:text-xs font-black uppercase tracking-tighter ${d.isSun ? 'text-rose-500' : 'text-slate-400'}`}>
                                {d.label}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 lg:gap-1.5 flex-1 content-start">
                        {/* 1. EMPTY SPACES FOR PREVIOUS MONTH */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-prev-${i}`} className="aspect-square lg:aspect-auto lg:h-12"></div>
                        ))}

                        {/* 2. CURRENT MONTH DAYS */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const dateStr = date.toLocaleDateString('en-CA');
                            const dayLogs = logs.filter(l => new Date(l.timestamp).toLocaleDateString('en-CA') === dateStr);
                            const dayLeaves = leaves.filter(l => {
                                const startStr = new Date(l.start_date).toLocaleDateString('en-CA');
                                const endStr = new Date(l.end_date).toLocaleDateString('en-CA');
                                return dateStr >= startStr && dateStr <= endStr;
                            });
                            const hasLogs = dayLogs.length > 0;
                            const hasLeaves = dayLeaves.length > 0;
                            const isSelected = selectedDate?.toLocaleDateString('en-CA') === dateStr;
                            const isToday = new Date().toLocaleDateString('en-CA') === dateStr;

                            const checkInLogs = dayLogs.filter(l => l.type === 'check_in');
                            const checkOutLogs = dayLogs.filter(l => l.type === 'check_out');

                            const isHoliday = !!holidays2026[dateStr];

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(date)}
                                    className={`aspect-square lg:aspect-auto lg:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-95 group ${isSelected ? 'bg-[#00897b] text-white shadow-xl shadow-teal-500/20' :
                                        isToday ? 'bg-teal-50 border border-teal-100 text-[#00897b] font-black' :
                                            hasLeaves ? 'bg-purple-50 border border-purple-100 text-purple-600 font-bold' :
                                            isHoliday ? 'bg-orange-50 border border-orange-100 text-orange-600 font-bold' :
                                                'hover:bg-slate-50 text-slate-600 font-medium'
                                        }`}
                                >
                                    <span className={`text-sm lg:text-base ${isSelected ? 'scale-110 font-black' : ''}`}>{day}</span>
                                    <div className="flex gap-0.5 mt-0.5 min-h-[4px]">
                                        {hasLogs && (
                                            <>
                                                {checkInLogs.length > 0 && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-sky-400'}`}></div>}
                                                {checkOutLogs.length > 0 && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-purple-400'}`}></div>}
                                            </>
                                        )}
                                        {hasLeaves && !isSelected && <div className="w-1 h-1 rounded-full bg-purple-500"></div>}
                                        {isHoliday && !isSelected && !hasLeaves && <div className="w-1 h-1 rounded-full bg-orange-400"></div>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* PART 3: RIGHT (Details & Timeline) */}
                <div className="w-full lg:w-[380px] p-5 lg:p-6 shrink-0 bg-white dark:bg-slate-800/50 overflow-y-auto max-h-[500px] lg:max-h-full scrollbar-hide border-l border-slate-50 dark:border-slate-700/30">
                    {selectedDate ? (
                        <div className="animate-fadeIn">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-slate-700 dark:text-white">
                                    {selectedDate.getDate()} {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                                </h3>
                                {holidays2026[selectedDate.toLocaleDateString('en-CA')] && (
                                    <div className="mt-2 text-sm font-bold text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 px-3 py-1.5 rounded-lg border border-orange-100 dark:border-orange-500/20 inline-flex items-center gap-2">
                                        <span className="text-base">🎉</span> {holidays2026[selectedDate.toLocaleDateString('en-CA')]}
                                    </div>
                                )}
                            </div>

                            {selectedDayLogs.length === 0 && selectedDayLeaves.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-50 space-y-4">
                                    {!holidays2026[selectedDate.toLocaleDateString('en-CA')] ? (
                                        <>
                                            <Clock size={40} />
                                            <p className="text-sm font-bold">{t.noDataToday}</p>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <div className="text-4xl mb-3">
                                                {holidays2026[selectedDate.toLocaleDateString('en-CA')].includes('เสาร์') ? '🎉' : '🏖️'}
                                            </div>
                                            <p className="text-sm font-black text-orange-500 uppercase tracking-widest">
                                                {holidays2026[selectedDate.toLocaleDateString('en-CA')].includes('เสาร์')
                                                    ? 'วันเสาร์หยุดพิเศษ'
                                                    : t.publicHoliday}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-0 relative">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[7px] top-2 bottom-6 w-[1.5px] bg-slate-100 dark:bg-slate-700/50"></div>
                                    
                                    {/* LEAVES */}
                                    {selectedDayLeaves.map(leave => (
                                        <div key={`leave-${leave.id}`} className="cursor-pointer group relative pl-8 pb-10 last:pb-2 transition-all">
                                            <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-[3px] border-white dark:border-slate-800 z-10 shadow-sm bg-purple-500"></div>
                                            <div className="flex flex-col gap-2 p-3 -mt-3 -ml-3 rounded-2xl group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <h4 className="text-base font-black text-purple-600 dark:text-purple-400 capitalize">
                                                        {leave.leave_type} (อนุมัติแล้ว)
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                                    <Calendar size={14} />
                                                    <span className="font-mono text-[14px]">
                                                        {new Date(leave.start_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {new Date(leave.end_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                                {leave.reason && (
                                                    <div className="flex items-start gap-2 text-[13px] text-slate-400 font-bold leading-relaxed mt-1">
                                                        <span>{leave.reason}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {(() => {
                                        // Specific pairing for current day selection
                                        const sortedDayLogs = [...selectedDayLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                                        const dayPairs: { in?: AttendanceLog; out?: AttendanceLog }[] = [];

                                        for (let i = 0; i < sortedDayLogs.length; i++) {
                                            const current = sortedDayLogs[i];
                                            const isLikeIn = current.type === 'check_in' || current.type === 'site_in';
                                            const isLikeOut = current.type === 'check_out' || current.type === 'site_out';

                                            if (isLikeIn) {
                                                const next = sortedDayLogs[i + 1];
                                                const nextIsLikeOut = next && (next.type === 'check_out' || next.type === 'site_out');

                                                if (nextIsLikeOut) {
                                                    dayPairs.push({ in: current, out: next });
                                                    i++;
                                                } else {
                                                    dayPairs.push({ in: current });
                                                }
                                            } else if (isLikeOut) {
                                                dayPairs.push({ out: current });
                                            }
                                        }

                                        return dayPairs.map((pair, idx) => {
                                            const log = pair.in || pair.out;
                                            if (!log) return null;

                                            const timeIn = pair.in ? new Date(pair.in.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '##:##';
                                            const timeOut = pair.out ? new Date(pair.out.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '##:##';

                                            return (
                                                <div key={log.id} onClick={() => onSelectLogDetail && onSelectLogDetail(pair)} className="cursor-pointer group relative pl-8 pb-10 last:pb-2 transition-all">
                                                    {/* Timeline Dot */}
                                                    <div className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-[3px] border-white dark:border-slate-800 z-10 shadow-sm ${pair.in && pair.out ? 'bg-teal-500' : pair.in ? 'bg-sky-400' : 'bg-rose-400'
                                                        }`}></div>

                                                    <div className="flex flex-col gap-2 p-3 -mt-3 -ml-3 rounded-2xl group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors">
                                                        <div className="flex items-start justify-between">
                                                            <h4 className="text-base font-black text-slate-700 dark:text-slate-200">
                                                                {pair.in && pair.out ? 'บันทึกสำเร็จ' : pair.in ? 'บันทึกสำเร็จ (ยังไม่บันทึกออก)' : 'บันทึกออก (ไม่พบเข้า)'}
                                                            </h4>
                                                            <div className="border border-teal-500/30 dark:border-teal-400/20 bg-teal-50/30 dark:bg-teal-400/5 rounded px-2 py-0.5 text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400">
                                                                #{log.id.slice(0, 8).toUpperCase()}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                                            <Clock size={14} />
                                                            <span className="font-mono text-[14px]">{timeIn} - {timeOut}</span>
                                                        </div>

                                                        {log.location_name && (
                                                            <div className="flex items-start gap-2 text-[13px] text-slate-400 font-bold leading-relaxed mt-1">
                                                                <MapPin size={14} className="shrink-0 mt-0.5 opacity-60" />
                                                                <span>{log.location_name}</span>
                                                            </div>
                                                        )}

                                                        {log.photo_url && (
                                                            <div
                                                                className="flex items-center gap-1.5 text-[10px] font-black text-[#00897b] mt-1 opacity-70 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Camera size={12} /> ข้อมูลรูปภาพแนบคลิกที่นี่
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-start p-2">
                            <h4 className="text-xl font-black text-slate-700 dark:text-white mb-6 w-full text-left flex items-center gap-2">
                                <Calendar size={22} className="text-[#00897b]" strokeWidth={2.5} /> {t.allHolidays}
                            </h4>
                            <div className="w-full space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                {Object.entries(holidays2026)
                                    .filter(([date]) => new Date(date).getFullYear() === currentDate.getFullYear())
                                    .map(([date, name]) => {
                                        const d = new Date(date);
                                        const isPast = d < new Date();
                                        return (
                                            <div key={date} className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${isPast ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-orange-50/30 border-orange-100 dark:bg-orange-500/5 dark:border-orange-500/20'}`}>
                                                <div className={`p-2 rounded-xl shrink-0 font-mono text-center min-w-[50px] ${isPast ? 'bg-slate-200 text-slate-500' : 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'}`}>
                                                    <div className="text-[10px] uppercase font-black uppercase leading-none mb-1">{months[d.getMonth()]}</div>
                                                    <div className="text-lg font-black leading-none">{d.getDate()}</div>
                                                </div>
                                                <div className="pt-0.5">
                                                    <p className={`text-sm font-black ${isPast ? 'text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>{name}</p>
                                                    <p className="text-[11px] font-bold text-slate-400">2026</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default EmployeeDashboard;
