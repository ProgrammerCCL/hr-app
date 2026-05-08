
import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Download, Search, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Profile, AttendanceLog } from '@/types';
import { useApp } from '@/context/AppContext';

interface AttendanceManageProps {
    employees: Profile[];
}

const AttendanceManagePage = ({ employees }: AttendanceManageProps) => {
    const { t, lang, showToast, showConfirm } = useApp();
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [editingLog, setEditingLog] = useState<AttendanceLog | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLog, setNewLog] = useState({ user_id: '', type: 'check_in' as string, timestamp: '', location_name: 'Head Office', note: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });

    useEffect(() => { fetchLogs(); }, [selectedDate, selectedEmployee]);

    const fetchLogs = async () => {
        let query = supabase.from('attendance_logs')
            .select('*, profiles(first_name, last_name, avatar_url, employee_code)')
            .gte('timestamp', `${selectedDate}T00:00:00`)
            .lt('timestamp', `${selectedDate}T23:59:59`)
            .order('timestamp', { ascending: false });
        if (selectedEmployee) query = query.eq('user_id', selectedEmployee);
        const { data } = await query;
        setLogs((data || []) as AttendanceLog[]);
    };

    const handleAddLog = async () => {
        if (!newLog.user_id || !newLog.timestamp) {
            showToast(t.selectEmployeeAndTime, 'error');
            return;
        }
        
        try {
            // Convert local input time to UTC
            const isoTimestamp = new Date(newLog.timestamp).toISOString();
            
            const { error } = await supabase.from('attendance_logs').insert([{
                user_id: newLog.user_id,
                type: newLog.type,
                timestamp: isoTimestamp,
                location_name: newLog.location_name,
                location_lat: 0, 
                location_lng: 0,
            }]);
            
            if (error) throw error;
            
            setShowAddModal(false);
            setNewLog({ user_id: '', type: 'check_in', timestamp: '', location_name: 'Head Office', note: '' });
            fetchLogs();
            showToast(t.success, 'success');
        } catch (error: any) {
            showToast('Error: ' + error.message, 'error');
        }
    };

    const handleUpdateLog = async () => {
        if (!editingLog) return;
        
        try {
            // Convert local input time back to UTC
            const isoTimestamp = new Date(editingLog.timestamp).toISOString();
            
            const { error } = await supabase.from('attendance_logs').update({
                timestamp: isoTimestamp,
                type: editingLog.type,
                location_name: editingLog.location_name,
            }).eq('id', editingLog.id);
            
            if (error) throw error;
            
            setEditingLog(null);
            fetchLogs();
            showToast(t.success, 'success');
        } catch (error: any) {
            showToast('Error: ' + error.message, 'error');
        }
    };

    const requestDeleteLog = async (id: string) => {
        const confirmed = await showConfirm({
            title: t.confirm,
            message: t.deleteConfirm,
            confirmText: t.delete,
            type: 'danger'
        });
        
        if (confirmed) executeDeleteLog(id);
    };

    const executeDeleteLog = async (id: string) => {
        await supabase.from('attendance_logs').delete().eq('id', id);
        fetchLogs();
        showToast(t.success, 'success');
    };

    // === EXPORT CSV ===
    const exportCSV = async () => {
        const startDate = dateRange.start;
        const endDate = dateRange.end;
        let query = supabase.from('attendance_logs')
            .select('*, profiles(first_name, last_name, employee_code, department)')
            .gte('timestamp', `${startDate}T00:00:00`)
            .lte('timestamp', `${endDate}T23:59:59`)
            .order('timestamp', { ascending: true });
        if (selectedEmployee) query = query.eq('user_id', selectedEmployee);
        const { data } = await query;
        if (!data || data.length === 0) {
            showToast(t.noData, 'info');
            return;
        }

        const bom = '\uFEFF';
        const headers = [t.dateHeader, t.timeHeader, t.employeeCode, t.fullname, t.department, t.type, t.location];
        const rows = data.map((log: any) => [
            new Date(log.timestamp).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US'),
            new Date(log.timestamp).toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US'),
            log.profiles?.employee_code || '',
            `${log.profiles?.first_name || ''} ${log.profiles?.last_name || ''}`,
            log.profiles?.department || '',
            t[log.type as keyof typeof t] || log.type,
            log.location_name || '',
        ]);
        const csv = bom + [headers.join(','), ...rows.map(r => r.map((c: string) => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `attendance_${startDate}_to_${endDate}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    // Find employees who forgot to check out
    const getMissingCheckouts = () => {
        const empCheckIns = new Map<string, AttendanceLog>();
        const empCheckOuts = new Set<string>();
        logs.forEach(log => {
            if (log.type === 'check_in' && !empCheckIns.has(log.user_id)) empCheckIns.set(log.user_id, log);
            if (log.type === 'check_out') empCheckOuts.add(log.user_id);
        });
        return Array.from(empCheckIns.entries()).filter(([uid]) => !empCheckOuts.has(uid)).map(([, log]) => log);
    };

    const missingCheckouts = getMissingCheckouts();
    const filteredLogs = logs.filter(log => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const p = log.profiles as any;
        return p?.first_name?.toLowerCase().includes(q) || p?.last_name?.toLowerCase().includes(q) || p?.employee_code?.toLowerCase().includes(q);
    });

    const activeEmployees = employees.filter(e => e.is_active !== false);

    // Helper to format UTC timestamp to local datetime-local string
    const formatToLocalDatetime = (utcString: string) => {
        if (!utcString) return '';
        const date = new Date(utcString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {missingCheckouts.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 shadow-sm shadow-amber-100/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                            <AlertTriangle size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <span className="font-black text-amber-900 text-lg tracking-tight leading-none">{t.forgotCheckOut}</span>
                            <p className="text-amber-700/70 text-xs font-bold uppercase tracking-wider">{missingCheckouts.length} {t.persons} Pending</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {missingCheckouts.map(log => {
                            const p = log.profiles as any;
                            return (
                                <button key={log.user_id} onClick={() => { 
                                    const nowStr = formatToLocalDatetime(new Date().toISOString());
                                    const datePart = selectedDate;
                                    setNewLog({ user_id: log.user_id, type: 'check_out', timestamp: `${datePart}T17:30`, location_name: 'Head Office', note: '' }); 
                                    setShowAddModal(true); 
                                }}
                                    className="px-4 py-2 bg-white rounded-xl text-xs font-black text-amber-700 hover:bg-amber-600 hover:text-white transition-all border border-amber-200 shadow-sm active:scale-95">
                                    {p?.first_name} {p?.last_name} — {t.clickToAddCheckOut}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col xl:flex-row gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-300 shadow-sm">
                <div className="flex flex-col md:flex-row gap-3 flex-1">
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-slate-800 text-sm focus:border-indigo-500 focus:outline-none font-black transition-all shadow-sm" />
                    <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-slate-800 text-sm outline-none min-w-[200px] font-black focus:border-indigo-500 transition-all shadow-sm">
                        <option value="">-- {t.everyone} --</option>
                        {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.employee_code ? `[${e.employee_code}] ` : ''}{e.first_name} {e.last_name}</option>)}
                    </select>
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={`${t.search}...`} className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-12 pr-4 py-3 text-slate-800 text-sm focus:border-indigo-500 focus:outline-none font-black transition-all shadow-sm" />
                    </div>
                </div>
                <button onClick={() => { setNewLog({ ...newLog, timestamp: `${selectedDate}T08:30` }); setShowAddModal(true); }} className="px-8 py-3 bg-indigo-600 rounded-2xl text-sm font-black text-white hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95">
                    <Plus size={18} strokeWidth={3} /> {t.addRecord}
                </button>
            </div>

            {/* Export section */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-300 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <Download size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <span className="font-black text-slate-900 block leading-none">Export Data</span>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Download Attendance Logs</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-800 text-xs font-black focus:border-indigo-500 outline-none shadow-sm" />
                    <span className="text-slate-400 font-black px-1 text-[10px]">TO</span>
                    <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-800 text-xs font-black focus:border-indigo-500 outline-none shadow-sm" />
                    <button onClick={exportCSV} className="px-6 py-2.5 bg-emerald-600 rounded-xl text-xs font-black text-white hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95">
                        <Download size={14} strokeWidth={2.5} /> {t.export_csv}
                    </button>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-300 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-100/80 border-b-2 border-slate-300 text-slate-900 text-base font-black uppercase">
                                <th className="p-6">{t.employee}</th>
                                <th className="p-6">{t.idHeader}</th>
                                <th className="p-6">{t.time}</th>
                                <th className="p-6">{t.type}</th>
                                <th className="p-6">{t.location}</th>
                                <th className="p-6 text-right">{t.manageHeader}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogs.map(log => {
                                const p = log.profiles as any;
                                const isEditing = editingLog?.id === log.id;
                                return (
                                    <tr key={log.id} className={`transition-all ${isEditing ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm ring-offset-2">
                                                    <img src={p?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user_id}`} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-black text-slate-800 block leading-tight">{p?.first_name} {p?.last_name}</span>
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{p?.department || 'Staff'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-xs font-black font-mono text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-lg border border-indigo-100/50">{p?.employee_code || '-'}</span>
                                        </td>
                                        <td className="p-6">
                                            {isEditing ? (
                                                <input 
                                                    type="datetime-local" 
                                                    value={editingLog.timestamp} 
                                                    onChange={e => setEditingLog({ ...editingLog, timestamp: e.target.value })} 
                                                    className="bg-white border-2 border-indigo-200 rounded-xl pl-3 pr-8 py-2 text-slate-800 text-xs w-48 font-bold focus:border-indigo-500 outline-none shadow-sm" 
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-slate-400" />
                                                    <span className="text-sm font-black text-slate-700 font-mono">{new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            {isEditing ? (
                                                <select value={editingLog.type} onChange={e => setEditingLog({ ...editingLog, type: e.target.value as any })} className="bg-white border-2 border-indigo-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-black focus:border-indigo-500 outline-none shadow-sm">
                                                    <option value="check_in">{t.check_in}</option><option value="check_out">{t.check_out}</option><option value="site_in">{t.site_in}</option><option value="site_out">{t.site_out}</option>
                                                </select>
                                            ) : (
                                                <span className={`px-5 py-2 rounded-xl text-sm font-black uppercase whitespace-nowrap border shadow-sm ${
                                                    log.type === 'check_in' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                    log.type === 'check_out' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                                                    'bg-sky-50 text-sky-700 border-sky-100'}`}>
                                                    {t[log.type as keyof typeof t] || log.type}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            {isEditing ? (
                                                <input value={editingLog.location_name} onChange={e => setEditingLog({ ...editingLog, location_name: e.target.value })} className="bg-white border-2 border-indigo-200 rounded-xl px-3 py-2 text-slate-800 text-xs w-40 font-black focus:border-indigo-500 outline-none shadow-sm" />
                                            ) : (
                                                <span className="text-xs font-bold text-slate-500">{log.location_name}</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            {isEditing ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={handleUpdateLog} className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center border border-emerald-100 shadow-sm active:scale-90"><Save size={16} strokeWidth={3} /></button>
                                                    <button onClick={() => setEditingLog(null)} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all flex items-center justify-center border border-slate-200 shadow-sm active:scale-90"><X size={16} strokeWidth={3} /></button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingLog({ ...log, timestamp: formatToLocalDatetime(log.timestamp) })} className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center border border-indigo-100 shadow-sm active:scale-90"><Edit3 size={16} strokeWidth={2.5} /></button>
                                                    <button onClick={() => requestDeleteLog(log.id)} className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border border-rose-100 shadow-sm active:scale-90"><Trash2 size={16} strokeWidth={2.5} /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredLogs.length === 0 && <tr><td colSpan={6} className="p-16 text-center text-slate-400 font-bold">{t.noDataToday}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <p className="text-sm text-slate-500 text-right font-black uppercase tracking-wide">{filteredLogs.length} {t.records} Found</p>

            {/* ADD MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-[150] bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
                    <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] border border-white shadow-2xl animate-scaleIn">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Plus size={20} strokeWidth={3} /></div>
                                {t.addAttendanceRecord}
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 transition-all flex items-center justify-center"><X size={24} /></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.employee} *</label>
                                <select value={newLog.user_id} onChange={e => setNewLog({ ...newLog, user_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-black focus:border-indigo-500 outline-none transition-all">
                                    <option value="">-- {t.select} --</option>
                                    {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.employee_code ? `[${e.employee_code}] ` : ''}{e.first_name} {e.last_name}</option>)}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.type}</label>
                                    <select value={newLog.type} onChange={e => setNewLog({ ...newLog, type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-black focus:border-indigo-500 outline-none transition-all">
                                        <option value="check_in">{t.check_in}</option><option value="check_out">{t.check_out}</option><option value="site_in">{t.site_in}</option><option value="site_out">{t.site_out}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.dateTime} *</label>
                                    <input type="datetime-local" value={newLog.timestamp} onChange={e => setNewLog({ ...newLog, timestamp: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-3 text-slate-800 text-sm font-bold focus:border-indigo-500 outline-none transition-all" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.location}</label>
                                <input value={newLog.location_name} onChange={e => setNewLog({ ...newLog, location_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-black focus:border-indigo-500 outline-none transition-all" />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-sm hover:bg-slate-100 transition-all active:scale-95">{t.cancel}</button>
                            <button onClick={handleAddLog} className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Save size={18} strokeWidth={2.5} /> {t.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceManagePage;
