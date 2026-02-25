
import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Download, Search, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import type { Profile, AttendanceLog } from '../../types';

interface AttendanceManageProps {
    employees: Profile[];
}

import { useApp } from '../../context/AppContext';

const AttendanceManagePage = ({ employees }: AttendanceManageProps) => {
    const { t, lang } = useApp();
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
        if (!newLog.user_id || !newLog.timestamp) { alert(t.selectEmployeeAndTime); return; }
        const { error } = await supabase.from('attendance_logs').insert([{
            user_id: newLog.user_id,
            type: newLog.type,
            timestamp: newLog.timestamp,
            location_name: newLog.location_name,
            latitude: 0, longitude: 0,
        }]);
        if (error) { alert('Error: ' + error.message); return; }
        setShowAddModal(false);
        setNewLog({ user_id: '', type: 'check_in', timestamp: '', location_name: 'Head Office', note: '' });
        fetchLogs();
    };

    const handleUpdateLog = async () => {
        if (!editingLog) return;
        const { error } = await supabase.from('attendance_logs').update({
            timestamp: editingLog.timestamp,
            type: editingLog.type,
            location_name: editingLog.location_name,
        }).eq('id', editingLog.id);
        if (error) { alert('Error: ' + error.message); return; }
        setEditingLog(null);
        fetchLogs();
    };

    const handleDeleteLog = async (id: string) => {
        if (!confirm(t.deleteConfirm)) return;
        await supabase.from('attendance_logs').delete().eq('id', id);
        fetchLogs();
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
        if (!data || data.length === 0) { alert(t.noData); return; }

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

    return (
        <div className="space-y-4 animate-fadeIn">
            {/* Alerts for missing checkouts */}
            {/* Alerts for missing checkouts */}
            {missingCheckouts.length > 0 && (
                <div className="bg-amber-500/10 dark:bg-yellow-500/10 border border-amber-500/20 dark:border-yellow-500/20 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={18} className="text-amber-600 dark:text-yellow-400" />
                        <span className="font-bold text-amber-800 dark:text-yellow-400">⚠️ {t.forgotCheckOut} ({missingCheckouts.length} {t.persons})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {missingCheckouts.map(log => {
                            const p = log.profiles as any;
                            return (
                                <button key={log.user_id} onClick={() => { setNewLog({ user_id: log.user_id, type: 'check_out', timestamp: `${selectedDate}T17:30`, location_name: 'Head Office', note: '' }); setShowAddModal(true); }}
                                    className="px-3 py-1.5 bg-white dark:bg-yellow-500/20 rounded-lg text-xs font-bold text-amber-700 dark:text-yellow-300 hover:bg-amber-100 dark:hover:bg-yellow-500/30 transition border border-amber-200 dark:border-yellow-500/20 shadow-sm">
                                    {p?.first_name} {p?.last_name} — {t.clickToAddCheckOut}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap gap-3 items-center">
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" />
                <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm outline-none min-w-[180px]">
                    <option value="">-- {t.everyone} --</option>
                    {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.employee_code ? `[${e.employee_code}] ` : ''}{e.first_name} {e.last_name}</option>)}
                </select>
                <div className="relative flex-1 max-w-xs"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={`${t.search}...`} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                <button onClick={() => { setNewLog({ ...newLog, timestamp: `${selectedDate}T08:30` }); setShowAddModal(true); }} className="px-4 py-2 bg-indigo-600 rounded-lg text-sm hover:bg-indigo-500 transition flex items-center gap-2"><Plus size={16} /> {t.addRecord}</button>
            </div>

            {/* Export section */}
            <div className="glass-panel p-4 flex flex-wrap gap-3 items-center">
                <Download size={18} className="text-emerald-400" />
                <span className="text-sm text-gray-400">Export CSV:</span>
                <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-indigo-500 focus:outline-none" />
                <span className="text-gray-500">{t.to}</span>
                <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-indigo-500 focus:outline-none" />
                <button onClick={exportCSV} className="px-4 py-2 bg-emerald-600 rounded-lg text-sm hover:bg-emerald-500 transition flex items-center gap-2"><Download size={14} /> {t.export_csv}</button>
            </div>

            {/* Attendance Table */}
            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-white/5 border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="p-3">{t.employee}</th><th className="p-3">{t.idHeader}</th><th className="p-3">{t.time}</th><th className="p-3">{t.type}</th><th className="p-3">{t.location}</th><th className="p-3 text-right">{t.manageHeader}</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredLogs.map(log => {
                            const p = log.profiles as any;
                            const isEditing = editingLog?.id === log.id;
                            return (
                                <tr key={log.id} className={`transition ${isEditing ? 'bg-indigo-500/10' : 'hover:bg-white/5'}`}>
                                    <td className="p-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gray-700 overflow-hidden"><img src={p?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user_id}`} alt="" className="w-full h-full object-cover" /></div><span className="text-sm">{p?.first_name} {p?.last_name}</span></div></td>
                                    <td className="p-3 text-xs font-mono text-indigo-400">{p?.employee_code || '-'}</td>
                                    <td className="p-3">
                                        {isEditing ? (
                                            <input type="datetime-local" value={editingLog.timestamp.slice(0, 16)} onChange={e => setEditingLog({ ...editingLog, timestamp: e.target.value + ':00Z' })} className="bg-gray-900 border border-indigo-500 rounded p-1.5 text-white text-xs w-44" />
                                        ) : (
                                            <span className="text-sm font-mono">{new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {isEditing ? (
                                            <select value={editingLog.type} onChange={e => setEditingLog({ ...editingLog, type: e.target.value as any })} className="bg-gray-900 border border-indigo-500 rounded p-1.5 text-white text-xs">
                                                <option value="check_in">{t.check_in}</option><option value="check_out">{t.check_out}</option><option value="site_in">{t.site_in}</option><option value="site_out">{t.site_out}</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 py-0.5 rounded text-xs border capitalize ${log.type === 'check_in' ? 'bg-green-500/10 text-green-400 border-green-500/20' : log.type === 'check_out' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                {t[log.type as keyof typeof t] || log.type}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {isEditing ? (
                                            <input value={editingLog.location_name} onChange={e => setEditingLog({ ...editingLog, location_name: e.target.value })} className="bg-gray-900 border border-indigo-500 rounded p-1.5 text-white text-xs w-32" />
                                        ) : (
                                            <span className="text-sm text-gray-400">{log.location_name}</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        {isEditing ? (
                                            <div className="flex justify-end gap-1">
                                                <button onClick={handleUpdateLog} className="p-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 transition"><Save size={14} /></button>
                                                <button onClick={() => setEditingLog(null)} className="p-1.5 rounded bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 transition"><X size={14} /></button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => setEditingLog({ ...log })} className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition"><Edit3 size={14} /></button>
                                                <button onClick={() => handleDeleteLog(log.id)} className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"><Trash2 size={14} /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredLogs.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">{t.noDataToday}</td></tr>}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-gray-500 text-right">{filteredLogs.length} {t.records}</p>

            {/* ADD MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-md p-6 space-y-4 border border-white/10 animate-fadeIn">
                        <div className="flex justify-between items-center"><h3 className="text-lg font-bold flex items-center gap-2"><Clock size={20} className="text-indigo-400" /> {t.addAttendanceRecord}</h3><button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button></div>
                        <div><label className="block text-xs text-gray-400 mb-1">{t.employee} *</label>
                            <select value={newLog.user_id} onChange={e => setNewLog({ ...newLog, user_id: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-white text-sm outline-none">
                                <option value="">-- {t.select} --</option>
                                {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.employee_code ? `[${e.employee_code}] ` : ''}{e.first_name} {e.last_name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs text-gray-400 mb-1">{t.type}</label>
                                <select value={newLog.type} onChange={e => setNewLog({ ...newLog, type: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-white text-sm outline-none">
                                    <option value="check_in">{t.check_in}</option><option value="check_out">{t.check_out}</option><option value="site_in">{t.site_in}</option><option value="site_out">{t.site_out}</option>
                                </select>
                            </div>
                            <div><label className="block text-xs text-gray-400 mb-1">{t.dateTime} *</label><input type="datetime-local" value={newLog.timestamp} onChange={e => setNewLog({ ...newLog, timestamp: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                        </div>
                        <div><label className="block text-xs text-gray-400 mb-1">{t.location}</label><input value={newLog.location_name} onChange={e => setNewLog({ ...newLog, location_name: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition">{t.cancel}</button>
                            <button onClick={handleAddLog} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold active:scale-95 transition flex items-center justify-center gap-2"><Save size={18} /> {t.save}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceManagePage;
