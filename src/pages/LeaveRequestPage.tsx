
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
    const { t, showToast } = useApp();
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [profileData, setProfileData] = useState<any>(null);
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
        const { data, error } = await supabase.from('leave_types').select('*').eq('is_active', true).order('sort_order');
        if (error) {
            console.error('Error fetching leave types:', error);
            return;
        }
        if (data) {
            setLeaveTypes(data as LeaveType[]);
            if (data.length > 0) setLeaveType(data[0].name);
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
            
            // Also fetch basic profile once for display
            const { data: pData } = await supabase.from('profiles').select('role, first_name, last_name').eq('id', user!.id).single();
            if (pData) setProfileData(pData);
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
            showToast(t.fileSizeError, 'error');
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
        if (!confirm(t.deleteConfirm)) return;

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
            showToast('ไม่สามารถยกเลิกได้: ' + error.message, 'error');
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
                showToast('ไม่สามารถอัพโหลดไฟล์ได้: ' + error.message + '\n\nอาจต้องสร้าง Storage Bucket "leave-attachments" ใน Supabase ก่อน', 'error');
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
            showToast(t.pleaseFillAll, 'error');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            showToast(t.invalidDateRange, 'error');
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
            const minAdvance = selectedTypeConfig.min_advance || selectedTypeConfig.advance_days || 0;
            const maxBackdated = selectedTypeConfig.max_backdated || (selectedTypeConfig.allow_retroactive ? 30 : 0);
            
            if (minAdvance > 0 && diffDays < minAdvance) {
                showToast(`⚠️ ประเภทการลานี้ต้องลาล่วงหน้าอย่างน้อย ${minAdvance} วัน`, 'error');
                return;
            }
            if (maxBackdated > 0 && diffDays < -maxBackdated) {
                showToast(`⚠️ ประเภทการลานี้ไม่อนุญาตให้ลาย้อนหลังเกิน ${maxBackdated} วัน`, 'error');
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
            const { data: pData } = await supabase.from('profiles').select('first_name, last_name, role, manager_id').eq('id', user!.id).single();
            if (pData) setProfileData(pData);
            const requesterName = pData ? `${pData.first_name} ${pData.last_name || ''}`.trim() : t.employee;

            let reqStatus = 'pending';
            if (pData?.role === 'admin' || pData?.role === 'hr') {
                reqStatus = 'approved';
                if (pData?.manager_id) {
                    reqStatus = 'pending_manager';
                } else {
                    reqStatus = 'pending'; // Fallback direct to HR if no manager
                }
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
                    approver_id: pData?.manager_id || null
                }
            ]);

            if (error) throw error;

            // === NOTIFY APPROVER ===
            const leaveLabel = leaveTypes.find(lt => lt.name === leaveType)?.label || leaveType;
            if (reqStatus === 'pending_manager' && pData?.manager_id) {
                // Notify Manager
                await supabase.from('notifications').insert([{
                    user_id: pData.manager_id,
                    type: 'leave_request',
                    title: `📋 ${t.newLeaveRequestTitle}: ${requesterName}`,
                    message: `${requesterName} ${t.submitted} ${leaveLabel} ${startDate} ${t.to} ${durationMode === 'full_day' ? endDate : startDate} (${totalDays} ${t.days})${attachmentUrl ? ` 📎 ${t.attachmentBadge}` : ''} — ${t.waitingForYourApproval}`,
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
                        message: `${requesterName} ${t.submitted} ${leaveLabel} ${startDate} ${t.to} ${durationMode === 'full_day' ? endDate : startDate} (${totalDays} ${t.days})${attachmentUrl ? ` 📎 ${t.attachmentBadge}` : ''} — ${t.waitingForHR}`,
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

            showToast(`✅ ${t.leaveSubmittedSuccess}\n\n${t.leaveTypeLabel} ${leaveLabel}\n${t.dateLabel} ${startDate} - ${durationMode === 'full_day' ? endDate : startDate}\n${t.amountLabel} ${totalDays} ${t.daysLabel}${attachmentUrl ? `\n📎 ${t.attachedLabel}` : ''}`, 'success');
            setReason('');
            setStartDate('');
            setEndDate('');
            setDurationMode('full_day');
            removeAttachment();
            setActiveTab('history');
            fetchLeaveRequests();

        } catch (error: any) {
            showToast("Error submitting request: " + error.message, 'error');
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

    const leaveTypeConfig = leaveTypes.map((lt, idx) => ({
        id: lt.id || `lt-${idx}`,
        value: lt.name,
        label: (t as any)[lt.name] || lt.label,
        quota: lt.quota_per_year || 0,
        icon: getLeaveIcon(lt.name),
        min_advance: lt.min_days_advance || lt.advance_days || 0,
        max_backdated: lt.max_days_backdated || (typeof lt.allow_retroactive === 'number' ? lt.allow_retroactive : lt.allow_retroactive ? 30 : 0),
        advance_days: lt.advance_days || 0,
        allow_retroactive: lt.allow_retroactive
    }));

    const selectedTypeConfig = leaveTypeConfig.find(lt => lt.value === leaveType);
    const usedDays = getUsedDays(leaveType);
    const remainingDays = (selectedTypeConfig?.quota || 0) - usedDays;

    // Notice Period Validation
    const getNoticeValidation = () => {
        if (!startDate || !selectedTypeConfig) return { isValid: true };
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const diffTime = start.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const minAdvance = selectedTypeConfig.min_advance || 0;
        const maxBackdated = selectedTypeConfig.max_backdated || 0;
        
        if (minAdvance > 0 && diffDays < minAdvance) {
            return { 
                isValid: false, 
                message: lang === 'th' 
                    ? `ต้องลาล่วงหน้าอย่างน้อย ${minAdvance} วัน (เร็วที่สุดคือ ${new Date(today.getTime() + minAdvance * 86400000).toLocaleDateString('th-TH')})`
                    : `Requires ${minAdvance} days advance notice (Earliest: ${new Date(today.getTime() + minAdvance * 86400000).toLocaleDateString('en-GB')})`
            };
        }
        
        if (diffDays < 0 && Math.abs(diffDays) > maxBackdated) {
            return {
                isValid: false,
                message: lang === 'th'
                    ? `ลาย้อนหลังได้ไม่เกิน ${maxBackdated} วัน (ย้อนหลังได้ถึง ${new Date(today.getTime() - maxBackdated * 86400000).toLocaleDateString('th-TH')})`
                    : `Cannot backdate more than ${maxBackdated} days (Up to ${new Date(today.getTime() - maxBackdated * 86400000).toLocaleDateString('en-GB')})`
            };
        }
        
        return { isValid: true };
    };

    const noticeValidation = getNoticeValidation();

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
                                        className={`w-full bg-white dark:bg-slate-900 border ${!noticeValidation.isValid ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900/30' : 'border-slate-200 dark:border-slate-700'} rounded-xl p-3.5 text-slate-900 dark:text-white text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/30 outline-none transition-all shadow-sm`}
                                    />
                                    {!noticeValidation.isValid && (
                                        <p className="mt-2 text-xs font-bold text-rose-500 flex items-center gap-1 animate-pulse">
                                            <AlertCircle size={14} /> {noticeValidation.message}
                                        </p>
                                    )}
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
                                disabled={loading || uploading || !startDate || !endDate || !reason.trim() || !noticeValidation.isValid}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 pb-20">
                            {requests.map((req) => {
                                const days = calculateRequestDays(req);
                                const typeInfo = leaveTypeConfig.find(lt => lt.value === req.leave_type);
                                const submittedAt = new Date(req.created_at);
                                const diffHrs = Math.floor((new Date().getTime() - submittedAt.getTime()) / (1000 * 60 * 60));
                                const timeAgoStr = diffHrs < 1 ? t.justNow : diffHrs < 24 ? `${diffHrs} ${t.hoursAgo}` : `${Math.floor(diffHrs/24)} ${t.daysAgo}`;
                                
                                return (
                                    <div key={req.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all flex flex-col relative group">
                                        {/* Status Badge Top Right */}
                                        <div className="absolute top-6 right-6 z-10">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${
                                                req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                                req.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' :
                                                req.status === 'cancelled' ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600' :
                                                'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${req.status === 'approved' ? 'bg-emerald-500' : req.status === 'rejected' ? 'bg-rose-500' : req.status === 'pending_manager' || req.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                                {req.status === 'approved' ? t.approved : req.status === 'rejected' ? t.rejected : req.status === 'cancelled' ? t.cancelled : req.status === 'pending_manager' ? t.pendingManagerStatus : t.pendingHRStatus}
                                            </span>
                                        </div>

                                        {/* Profile / Icon Header */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-3xl shadow-inner border border-indigo-100/50 dark:border-indigo-500/20">
                                                {typeInfo?.icon || '📄'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-800 dark:text-white leading-none mb-1">
                                                    {user?.email?.split('@')[0]}
                                                </h3>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{profileData?.role || 'Employee'}</p>
                                            </div>
                                        </div>

                                        {/* Structured Details Table-like Layout */}
                                        <div className="space-y-2.5 mb-6 flex-1">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-slate-400 dark:text-slate-500">{t.docNo}</span>
                                                <span className="font-mono font-black text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-700/50">LV-{req.id.slice(0, 4).toUpperCase()}-{req.id.slice(-4).toUpperCase()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-slate-400 dark:text-slate-500">{t.leaveType}:</span>
                                                <span className="font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                    {typeInfo?.label || req.leave_type}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-slate-400 dark:text-slate-500">{t.dateLabel}:</span>
                                                <span className="font-black text-slate-700 dark:text-slate-300">
                                                    {new Date(req.start_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })} - {new Date(req.end_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-slate-400 dark:text-slate-500">{t.amountLabel}:</span>
                                                <span className="font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-0.5 rounded-full">{days} {t.days}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-slate-400 dark:text-slate-500">{t.submittedAt}</span>
                                                <span className="font-bold text-slate-500 dark:text-slate-400">{timeAgoStr}</span>
                                            </div>
                                        </div>

                                        {/* Reason box */}
                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 mb-6">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.reason}:</p>
                                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic line-clamp-2">
                                                {req.reason || '-'}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                            {req.attachment_url ? (
                                                <a href={req.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors text-xs font-black border border-indigo-100 dark:border-indigo-500/20 active:scale-95 shadow-sm">
                                                    <Paperclip size={14} strokeWidth={3} /> {t.viewAttachment}
                                                </a>
                                            ) : (
                                                <div></div>
                                            )}

                                            {req.status !== 'cancelled' && req.status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleCancelLeave(req.id)}
                                                    className="px-6 py-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-all font-black text-sm flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95"
                                                >
                                                    <X size={16} strokeWidth={3} /> {t.cancel}
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
