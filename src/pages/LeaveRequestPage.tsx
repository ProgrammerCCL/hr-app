
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FileText, CheckCircle2, Clock, XCircle, Plus, Upload, Paperclip, Image, File, X, Calendar, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase/client';
import type { LeaveRequest, LeaveType } from '../types';
import { SettingsToolbar } from '../components/SettingsToolbar';

interface LeaveRequestPageProps {
    onBack: () => void;
}

const LeaveRequestPage = ({ onBack }: LeaveRequestPageProps) => {
    const { user } = useAuth();
    const { t, lang } = useApp();
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [leaveType, setLeaveType] = useState('sick');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [durationMode, setDurationMode] = useState<'full_day' | 'half_day' | 'hourly'>('full_day');
    const [halfDaySession, setHalfDaySession] = useState<'morning' | 'afternoon'>('morning');
    const [hourlyStartTime, setHourlyStartTime] = useState('09:00');
    const [hourlyEndTime, setHourlyEndTime] = useState('10:00');

    useEffect(() => {
        if (user) {
            fetchLeaveRequests();
            fetchLeaveTypes();
        }
    }, [user]);

    const fetchLeaveTypes = async () => {
        const { data } = await supabase.from('leave_types').select('*').eq('is_active', true).order('sort_order');
        if (data && data.length > 0) {
            setLeaveTypes(data as LeaveType[]);
            setLeaveType(data[0].name);
        }
    };

    const fetchLeaveRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('leave_requests')
                .select('*, approver:profiles!leave_requests_approver_id_fkey(first_name, last_name)')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setRequests(data as LeaveRequest[]);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const calculateDays = () => {
        if (!startDate) return 0;
        if (durationMode === 'full_day') {
            if (!endDate) return 0;
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end < start) return 0;
            return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        } else if (durationMode === 'half_day') {
            return 0.5;
        } else if (durationMode === 'hourly') {
            const [sh, sm] = hourlyStartTime.split(':').map(Number);
            const [eh, em] = hourlyEndTime.split(':').map(Number);
            let diffH = eh - sh;
            let diffM = em - sm;
            if (diffM < 0) {
                diffH -= 1;
                diffM += 60;
            }
            const totalHours = diffH + (diffM / 60);
            if (totalHours <= 0) return 0;
            return Number((totalHours / 8).toFixed(3));
        }
        return 0;
    };

    // Calculate used leave days per type (from approved requests this year)
    const getUsedDays = (type: string) => {
        const currentYear = new Date().getFullYear();
        return requests
            .filter(r => r.leave_type === type && r.status === 'approved' && new Date(r.start_date).getFullYear() === currentYear)
            .reduce((sum, r) => {
                const days = r.total_days || (Math.ceil((new Date(r.end_date).getTime() - new Date(r.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1);
                return sum + days;
            }, 0);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert(t.fileSizeError);
            return;
        }

        setAttachmentFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => setAttachmentPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setAttachmentPreview(null);
        }
    };

    const removeAttachment = () => {
        setAttachmentFile(null);
        setAttachmentPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCancelLeave = async (id: string) => {
        if (!confirm("คุณต้องการยกเลิกใบลาใบนี้ใช่หรือไม่?")) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('leave_requests')
                .update({ status: 'cancelled' })
                .eq('id', id);

            if (error) throw error;
            fetchLeaveRequests();
        } catch (error: any) {
            console.error('Error cancelling leave:', error);
            alert('ไม่สามารถยกเลิกได้: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const uploadAttachment = async (): Promise<string | null> => {
        if (!attachmentFile || !user) return null;
        setUploading(true);
        try {
            const fileExt = attachmentFile.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage
                .from('leave-attachments')
                .upload(fileName, attachmentFile);

            if (error) {
                console.error('Upload error:', error);
                // If bucket doesn't exist, save as base64
                if (attachmentFile.type.startsWith('image/') && attachmentPreview) {
                    return attachmentPreview; // Use base64 as fallback
                }
                alert('ไม่สามารถอัพโหลดไฟล์ได้: ' + error.message + '\n\nอาจต้องสร้าง Storage Bucket "leave-attachments" ใน Supabase ก่อน');
                return null;
            }

            const { data: urlData } = supabase.storage
                .from('leave-attachments')
                .getPublicUrl(fileName);

            return urlData.publicUrl;
        } catch (err: any) {
            console.error('Upload failed:', err);
            // Fallback to base64 for images
            if (attachmentFile.type.startsWith('image/') && attachmentPreview) {
                return attachmentPreview;
            }
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate || !reason.trim()) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            alert("วันสิ้นสุดต้องไม่ก่อนวันเริ่ม");
            return;
        }

        // Validate Advance and Backdated rules
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const diffTime = start.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (86400000));

        if (selectedTypeConfig) {
            if (selectedTypeConfig.min_advance > 0 && diffDays < selectedTypeConfig.min_advance) {
                alert(`⚠️ ประเภทการลานี้ต้องลาล่วงหน้าอย่างน้อย ${selectedTypeConfig.min_advance} วัน`);
                return;
            }
            if (selectedTypeConfig.max_backdated > 0 && diffDays < -selectedTypeConfig.max_backdated) {
                alert(`⚠️ ประเภทการลานี้ไม่อนุญาตให้ลาย้อนหลังเกิน ${selectedTypeConfig.max_backdated} วัน`);
                return;
            }
        }

        setLoading(true);
        try {
            // Upload attachment if exists
            let attachmentUrl: string | null = null;
            if (attachmentFile) {
                attachmentUrl = await uploadAttachment();
            }

            // Fetch profile data to determine status
            const { data: profileData } = await supabase.from('profiles').select('first_name, last_name, role, manager_id').eq('id', user!.id).single();
            const requesterName = profileData ? `${profileData.first_name} ${profileData.last_name || ''}`.trim() : t.employee;

            let reqStatus = 'pending';
            if (profileData?.role === 'admin' || profileData?.role === 'hr') {
                reqStatus = 'approved';
            } else if (profileData?.role === 'employee' && profileData?.manager_id) {
                reqStatus = 'pending_manager';
            }

            const { error } = await supabase.from('leave_requests').insert([
                {
                    user_id: user!.id,
                    leave_type: leaveType,
                    start_date: startDate,
                    end_date: durationMode === 'full_day' ? endDate : startDate,
                    total_days: totalDays,
                    reason: durationMode === 'half_day' ? `${reason} (${t.halfDay} ${halfDaySession === 'morning' ? t.am : t.pm})` : durationMode === 'hourly' ? `${reason} (ลารายชั่วโมง ${hourlyStartTime} - ${hourlyEndTime})` : reason,
                    attachment_url: attachmentUrl,
                    status: reqStatus,
                    approver_id: profileData?.manager_id || null
                }
            ]);

            if (error) throw error;

            // === NOTIFY APPROVER ===
            const leaveLabel = leaveTypes.find(lt => lt.name === leaveType)?.label || leaveType;
            if (reqStatus === 'pending_manager' && profileData?.manager_id) {
                // Notify Manager
                await supabase.from('notifications').insert([{
                    user_id: profileData.manager_id,
                    type: 'leave_request',
                    title: `📋 ${t.newLeaveRequestTitle}: ${requesterName}`,
                    message: `${requesterName} ${t.submitted}${lang === 'ja' ? '' : ' '}${leaveLabel} ${startDate} ${t.to} ${durationMode === 'full_day' ? endDate : startDate} (${totalDays} ${t.days})${attachmentUrl ? ` 📎 ${t.attachmentBadge}` : ''} — ${t.waitingForYourApproval}`,
                    related_id: null,
                    created_by: user!.id,
                }]);
            } else if (reqStatus === 'pending') {
                // Notify HR/Admin
                const { data: admins } = await supabase.from('profiles').select('id').in('role', ['admin', 'hr', 'Admin', 'HR']);
                if (admins && admins.length > 0) {
                    const notifications = admins.map((a: any) => ({
                        user_id: a.id,
                        type: 'leave_request',
                        title: `📋 ${t.newLeaveRequestTitle}: ${requesterName}`,
                        message: `${requesterName} ${t.submitted}${lang === 'ja' ? '' : ' '}${leaveLabel} ${startDate} ${t.to} ${durationMode === 'full_day' ? endDate : startDate} (${totalDays} ${t.days})${attachmentUrl ? ` 📎 ${t.attachmentBadge}` : ''} — ${t.waitingForHR}`,
                        related_id: null,
                        created_by: user!.id,
                    }));
                    await supabase.from('notifications').insert(notifications);
                }
            }

            // Browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(t.leaveSubmittedSuccess, { body: `${leaveLabel} ${startDate} - ${durationMode === 'full_day' ? endDate : startDate} (${totalDays} ${t.daysLabel})` });
            }

            alert(`✅ ${t.leaveSubmittedSuccess}\n\n${t.leaveTypeLabel} ${leaveLabel}\n${t.dateLabel} ${startDate} - ${durationMode === 'full_day' ? endDate : startDate}\n${t.amountLabel} ${totalDays} ${t.daysLabel}${attachmentUrl ? `\n📎 ${t.attachedLabel}` : ''}`);
            setReason('');
            setStartDate('');
            setEndDate('');
            setDurationMode('full_day');
            removeAttachment();
            setActiveTab('history');
            fetchLeaveRequests();

        } catch (error: any) {
            alert("Error submitting request: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const totalDays = calculateDays();

    const getLeaveIcon = (name: string) => {
        const iconMap: Record<string, string> = {
            'sick': '🤒',
            'personal': '👤',
            'unpaid_personal': '👤',
            'unpaid': '👤',
            'annual': '🏖️',
            'vacation': '🏖️',
            'ordination': '🙏',
            'maternity': '👶',
            'funeral_parents': '🕯️',
            'funeral_relatives': '🕯️',
            'holiday_swap': '🔄',
            'sterilization': '🏥',
            'wedding': '💍',
            'w': '💍'
        };
        return iconMap[name] || '📄';
    };

    const leaveTypeConfig = (leaveTypes.length > 0) ? leaveTypes.map((lt, idx) => ({
        id: lt.id || `lt-${idx}`,
        value: lt.name,
        label: (t as any)[lt.name] || lt.label,
        quota: lt.quota_per_year || 0,
        icon: getLeaveIcon(lt.name),
        min_advance: lt.min_days_advance || 0,
        max_backdated: lt.max_days_backdated || 0
    })) : [
        { id: 'sick', value: 'sick', label: 'ลาป่วย', icon: '🤒', quota: 30, min_advance: 0, max_backdated: 2 },
        { id: 'personal', value: 'personal', label: 'ลากิจ', icon: '👤', quota: 3, min_advance: 3, max_backdated: 0 },
        { id: 'unpaid_personal', value: 'unpaid_personal', label: 'ลากิจไม่รับค่าจ้าง', icon: '👤', quota: 999, min_advance: 3, max_backdated: 0 },
        { id: 'annual', value: 'annual', label: 'ลาพักร้อน', icon: '🏖️', quota: 6, min_advance: 3, max_backdated: 0 },
        { id: 'ordination', value: 'ordination', label: 'ลาบวช', icon: '🙏', quota: 30, min_advance: 30, max_backdated: 0 },
        { id: 'maternity', value: 'maternity', label: 'ลาคลอดบุตร', icon: '👶', quota: 30, min_advance: 30, max_backdated: 0 },
        { id: 'funeral_parents', value: 'funeral_parents', label: 'ลาชาปณกิจ พ่อ แม่', icon: '🕯️', quota: 7, min_advance: 0, max_backdated: 3 },
        { id: 'funeral_relatives', value: 'funeral_relatives', label: 'ลาชาปณกิจ ญาติพี่น้อง', icon: '🕯️', quota: 3, min_advance: 0, max_backdated: 3 },
        { id: 'holiday_swap', value: 'holiday_swap', label: 'ลาสลับวันหยุดแทนที่ทำงานในวันหยุด', icon: '🔄', quota: 999, min_advance: 1, max_backdated: 0 },
        { id: 'sterilization', value: 'sterilization', label: 'ลาทำหมัน', icon: '🏥', quota: 7, min_advance: 1, max_backdated: 0 },
    ];

    const selectedTypeConfig = leaveTypeConfig.find(lt => lt.value === leaveType);
    const usedDays = getUsedDays(leaveType);
    const remainingDays = (selectedTypeConfig?.quota || 0) - usedDays;

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <Image size={16} className="text-blue-400" />;
        if (['pdf'].includes(ext || '')) return <FileText size={16} className="text-red-400" />;
        return <File size={16} className="text-gray-400" />;
    };

    const calculateRequestDays = (req: LeaveRequest) => {
        if (req.total_days) return req.total_days;
        return Math.ceil((new Date(req.end_date).getTime() - new Date(req.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-white overflow-hidden transition-colors">
            {/* Header */}
            <header className="px-5 py-4 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10 border-b border-slate-200/50 dark:border-slate-700/50 transition-colors">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700">
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </button>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        {t.submitLeave}
                    </h1>
                </div>
                <SettingsToolbar />
            </header>

            {/* Tabs */}
            <div className="px-4 md:px-6 pt-6 pb-2">
                <div className="flex p-1.5 gap-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-full max-w-xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${activeTab === 'new' ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                    >
                        <Plus size={18} strokeWidth={2.5} className={activeTab === 'new' ? '' : 'opacity-70'} /> {t.newRequest}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                    >
                        <Clock size={18} strokeWidth={2.5} className={activeTab === 'history' ? '' : 'opacity-70'} /> {t.leaveHistory} <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${activeTab === 'history' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200' : 'bg-slate-200/50 dark:bg-slate-700/50'}`}>{requests.length}</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-20 scrollbar-hide">

                {activeTab === 'new' && (
                    <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn w-full">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-8">
                            {/* Leave Type */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 tracking-wide">{t.leaveType}</label>
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 lg:gap-4">
                                    {leaveTypeConfig.map((type) => {
                                        const used = getUsedDays(type.value);
                                        const remaining = type.quota - used;
                                        const isSelected = leaveType === type.value;
                                        return (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setLeaveType(type.value)}
                                                className={`p-4 rounded-2xl text-sm transition-all flex flex-col items-center gap-2 relative border-2 ${isSelected
                                                    ? 'bg-indigo-50/80 dark:bg-indigo-500/10 border-indigo-500 shadow-[0_4px_15px_rgba(99,102,241,0.1)] text-indigo-700 dark:text-indigo-300 scale-[1.02] z-10'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-300 hover:-translate-y-0.5'
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800 animate-fadeIn">
                                                        <span className="text-sm text-white font-bold leading-none">✓</span>
                                                    </div>
                                                )}
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-colors ${isSelected ? 'bg-white dark:bg-indigo-500/20 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700'}`}>
                                                    <span className="text-[26px]">{type.icon}</span>
                                                </div>
                                                <span className={`text-sm font-extrabold text-center leading-[1.2] tracking-wide ${isSelected ? 'text-indigo-700 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{type.label}</span>
                                                {type.quota > 0 && (
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md mt-1 border ${remaining <= 0 ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' : remaining <= 2 ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'}`}>
                                                        {remaining}/{type.quota} {t.days}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Leave Balance Warning */}
                            {selectedTypeConfig && selectedTypeConfig.quota > 0 && remainingDays <= 0 && (
                                <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 flex items-center gap-3">
                                    <AlertCircle size={20} className="text-rose-500 flex-shrink-0" strokeWidth={2.5} />
                                    <span className="text-sm font-bold text-rose-700 dark:text-rose-300">⚠️ {t.leaveType} {selectedTypeConfig.label} {t.outOfQuota} ({t.used} {usedDays}/{selectedTypeConfig.quota} {t.days})</span>
                                </div>
                            )}

                            {/* Duration Mode */}
                            <div className="flex flex-col gap-3 py-2 border-t border-slate-100 dark:border-slate-700/50">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.leaveType}</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDurationMode('full_day')}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${durationMode === 'full_day' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'}`}
                                    >
                                        {t.fullDay}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setDurationMode('half_day'); setEndDate(startDate); }}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${durationMode === 'half_day' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'}`}
                                    >
                                        {t.halfDay}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setDurationMode('hourly'); setEndDate(startDate); }}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${durationMode === 'hourly' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'}`}
                                    >
                                        {t.hourly}
                                    </button>
                                </div>

                                {durationMode === 'half_day' && (
                                    <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 w-fit animate-fadeIn mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setHalfDaySession('morning')}
                                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${halfDaySession === 'morning' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm border border-slate-200 dark:border-transparent' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                        >
                                            {t.am}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHalfDaySession('afternoon')}
                                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${halfDaySession === 'afternoon' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm border border-slate-200 dark:border-transparent' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                        >
                                            {t.pm}
                                        </button>
                                    </div>
                                )}

                                {durationMode === 'hourly' && (
                                    <div className="flex flex-col gap-2 mt-2">
                                        <div className="flex flex-wrap items-center gap-4 animate-fadeIn p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1 pointer-events-none">ตั้งแต่เวลา (Start Time)</label>
                                                <input
                                                    type="time"
                                                    value={hourlyStartTime}
                                                    onChange={e => setHourlyStartTime(e.target.value)}
                                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm font-medium focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-200 shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1 pointer-events-none">ถึงเวลา (End Time)</label>
                                                <input
                                                    type="time"
                                                    value={hourlyEndTime}
                                                    onChange={e => setHourlyEndTime(e.target.value)}
                                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm font-medium focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-200 shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        {(() => {
                                            const [sh, sm] = hourlyStartTime.split(':').map(Number);
                                            const [eh, em] = hourlyEndTime.split(':').map(Number);
                                            let diffH = eh - sh;
                                            let diffM = em - sm;
                                            if (diffM < 0) {
                                                diffH -= 1;
                                                diffM += 60;
                                            }
                                            if (diffH < 0 || (diffH === 0 && diffM <= 0)) {
                                                return <div className="text-sm font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 px-4 py-2.5 rounded-xl w-fit animate-fadeIn">⚠️ เวลาไม่ถูกต้อง กรุณาตรวจสอบเวลาที่เลือกใหม่อีกครั้ง</div>;
                                            }
                                            return (
                                                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-3 rounded-xl w-fit flex items-center gap-2 shadow-sm animate-fadeIn">
                                                    <Clock size={16} strokeWidth={2.5} />
                                                    {t.totalLeaveTime} <span className="text-indigo-700 dark:text-indigo-300 ml-1 text-base">{diffH} {t.hourLabel} {diffM > 0 ? `${diffM} ${t.minuteLabel}` : ''}</span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* Date Range */}
                            <div className={`grid ${durationMode !== 'full_day' ? 'grid-cols-1' : 'grid-cols-2 mt-4'} gap-4 lg:gap-6`}>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{durationMode !== 'full_day' ? t.leaveDate : t.startDate}</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            if (!endDate || new Date(e.target.value) > new Date(endDate)) {
                                                setEndDate(e.target.value);
                                            }
                                            if (durationMode !== 'full_day') setEndDate(e.target.value);
                                        }}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-white text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/30 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                {durationMode === 'full_day' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.endDate}</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            min={startDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-white text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/30 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Days Summary */}
                            {totalDays > 0 && (
                                <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-5 shadow-inner">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={20} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.totalDays}</span>
                                        </div>
                                        <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300 tracking-tight">{totalDays} <span className="text-sm font-bold text-indigo-500 dark:text-indigo-400/70">{t.days}</span></span>
                                    </div>
                                    {selectedTypeConfig && selectedTypeConfig.quota > 0 && (
                                        <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-500/20">
                                            <div className="flex justify-between text-xs font-bold mb-2">
                                                <span className="text-slate-500 dark:text-slate-400">{t.usedQuota}</span>
                                                <span className="text-slate-700 dark:text-slate-300">{usedDays} / {selectedTypeConfig.quota} {t.days}</span>
                                            </div>
                                            <div className="w-full bg-white dark:bg-slate-800 rounded-full h-2 shadow-inner overflow-hidden border border-slate-200 dark:border-slate-700">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${(usedDays + totalDays) > selectedTypeConfig.quota ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-400 to-indigo-600'}`}
                                                    style={{ width: `${Math.min(100, ((usedDays + totalDays) / selectedTypeConfig.quota) * 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-sm mt-2 font-bold">
                                                <span className="text-slate-500 dark:text-slate-500">{t.remainingAfter}: <span className="text-slate-700 dark:text-slate-300">{Math.max(0, remainingDays - totalDays)} {t.days}</span></span>
                                                {(usedDays + totalDays) > selectedTypeConfig.quota && (
                                                    <span className="text-rose-500 dark:text-rose-400 animate-pulse">{t.quotaExceeded}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.reason}</label>
                                <textarea
                                    rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder={t.reasonPlaceholder}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-white text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/30 outline-none transition-all shadow-sm resize-none"
                                />
                            </div>

                            {/* File Attachment */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    <Paperclip size={16} className="inline mr-1 text-slate-400" strokeWidth={2.5} /> {t.attachmentHint} <span className="text-slate-500 font-medium ml-1">({t.attachments})</span>
                                </label>

                                {!attachmentFile ? (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Upload size={24} className="text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition" />
                                        </div>
                                        <p className="text-base font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-1">{t.clickToUpload}</p>
                                        <p className="text-sm font-bold text-slate-400">DOC, PDF, JPG, PNG — Max 5MB</p>
                                    </button>
                                ) : (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-4 shadow-sm">
                                        {/* Preview */}
                                        {attachmentPreview && (
                                            <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-black/30 max-h-48 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                                <img src={attachmentPreview} alt="preview" className="max-h-48 object-contain" />
                                            </div>
                                        )}
                                        {/* File info */}
                                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3 rounded-xl">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="text-indigo-500">{getFileIcon(attachmentFile.name)}</div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{attachmentFile.name}</p>
                                                    <p className="text-xs font-bold text-slate-500">{(attachmentFile.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeAttachment}
                                                className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition flex-shrink-0"
                                            >
                                                <X size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || uploading || !startDate || !endDate || !reason.trim()}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black text-base transition-all hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[98%] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mt-6 shadow-lg shadow-indigo-500/10"
                            >
                                {loading || uploading ? (
                                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> {uploading ? t.saving : t.submitting}</>
                                ) : (
                                    <><Send size={20} strokeWidth={2.5} /> {t.submitRequest} {totalDays > 0 && `(${totalDays} ${t.days})`}</>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4 animate-fadeIn w-full pb-8">
                        {requests.length === 0 && (
                            <div className="text-center py-16 bg-white/50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <FileText size={32} strokeWidth={2.5} className="text-slate-400" />
                                </div>
                                <h3 className="text-lg font-black text-slate-700 dark:text-slate-300 mb-1">{t.noLeaves}</h3>
                                <p className="text-sm font-bold text-slate-500">No leave requests found in history.</p>
                            </div>
                        )}
                        <div className="flex flex-col gap-4 lg:gap-5">
                            {requests.map((req) => {
                                const days = calculateRequestDays(req);
                                return (
                                    <div key={req.id} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/80 hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100"></div>

                                        <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm shrink-0">
                                                    <span className="text-2xl">{leaveTypeConfig.find(lt => lt.value === req.leave_type)?.icon || '📄'}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-black text-slate-800 dark:text-white capitalize flex items-center gap-2">
                                                        {leaveTypeConfig.find(lt => lt.value === req.leave_type)?.label || req.leave_type}
                                                        <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-500/20">
                                                            {days} {t.days}
                                                        </span>
                                                    </h3>
                                                    <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                        <Calendar size={14} className="text-slate-400" /> {new Date(req.start_date).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        {req.start_date !== req.end_date && (
                                                            <> - {new Date(req.end_date).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex flex-col items-end gap-2">
                                                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${req.status === 'approved' ? 'border-emerald-200 text-emerald-600 bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/10' :
                                                    req.status === 'rejected' ? 'border-rose-200 text-rose-600 bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:bg-rose-500/10' :
                                                        req.status === 'cancelled' ? 'border-slate-200 text-slate-500 bg-slate-50 dark:border-slate-500/20 dark:text-slate-400 dark:bg-slate-500/10' :
                                                            'border-amber-200 text-amber-600 bg-amber-50 dark:border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/10'
                                                    }`}>
                                                    {req.status === 'approved' ? `✅ ${t.approved}` : req.status === 'rejected' ? `❌ ${t.rejected}` : req.status === 'cancelled' ? `🔘 ${t.cancelled}` : req.status === 'pending_manager' ? `⏳ ${t.pendingManager}${req.approver ? ` (${req.approver.first_name})` : ''}` : `⏳ ${t.pendingHR}`}
                                                </span>
                                            </div>
                                        </div>

                                        {req.reason && (
                                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 mb-4 relative z-10">
                                                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 line-clamp-2"><span className="text-slate-400 dark:text-slate-500 mr-1">💬</span> {req.reason}</p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50 relative z-10">
                                            {/* Attachment in history */}
                                            {req.attachment_url ? (
                                                <div className="flex-1">
                                                    {req.attachment_url.startsWith('data:image') || req.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                                                        <a href={req.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group w-fit">
                                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-black/30 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                                                <img src={req.attachment_url} alt="attachment" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                            </div>
                                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 transition-colors flex items-center gap-1"><Paperclip size={12} strokeWidth={2.5} /> {t.viewAttachment}</span>
                                                        </a>
                                                    ) : (
                                                        <a href={req.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors w-fit">
                                                            <Paperclip size={14} strokeWidth={2.5} />
                                                            {t.viewAttachment}
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex-1"></div>
                                            )}

                                            {/* Cancel Button */}
                                            {req.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => handleCancelLeave(req.id)}
                                                    className="px-4 py-2 rounded-xl bg-white dark:bg-rose-500/5 text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-50 peer-hover:bg-rose-500/10 transition-all font-bold text-xs flex items-center gap-2 shadow-sm active:scale-95 shrink-0"
                                                >
                                                    <XCircle size={14} strokeWidth={2.5} /> {t.cancelRequest}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default LeaveRequestPage;
