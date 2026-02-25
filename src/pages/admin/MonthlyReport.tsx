
import { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertTriangle, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import type { Profile, AttendanceLog, LeaveRequest } from '../../types';

interface MonthlyReportProps {
    employees: Profile[];
    settings: Record<string, string>;
}

import { useApp } from '../../context/AppContext';

const MonthlyReport = ({ employees, settings }: MonthlyReportProps) => {
    const { t, lang } = useApp();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const workStartTime = settings.work_start_time || '08:30';
    const lateThreshold = parseInt(settings.late_threshold_minutes || '15');

    useEffect(() => { generateReport(); }, [month, year]);

    const generateReport = async () => {
        setLoading(true);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        const workingDays = getWorkingDays(year, month);

        const report = [];
        for (const emp of employees.filter(e => e.is_active !== false)) {
            const { data: logs } = await supabase.from('attendance_logs').select('*').eq('user_id', emp.id).gte('timestamp', `${startDate}T00:00:00`).lte('timestamp', `${endDate}T23:59:59`);
            const { data: leaves } = await supabase.from('leave_requests').select('*').eq('user_id', emp.id).eq('status', 'approved').gte('start_date', startDate).lte('end_date', endDate);

            const checkIns = (logs || []).filter((l: any) => l.type === 'check_in');
            const uniqueDays = new Set(checkIns.map((l: any) => new Date(l.timestamp).toISOString().split('T')[0]));
            const presentDays = uniqueDays.size;

            let lateDays = 0;
            checkIns.forEach((l: any) => {
                const t = new Date(l.timestamp);
                const [h, m] = workStartTime.split(':').map(Number);
                const limit = new Date(t); limit.setHours(h, m + lateThreshold, 0, 0);
                if (t > limit) lateDays++;
            });

            let leaveDays = 0;
            (leaves || []).forEach((lv: any) => {
                const s = new Date(lv.start_date);
                const e = new Date(lv.end_date);
                leaveDays += Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1;
            });

            const absentDays = Math.max(0, workingDays - presentDays - leaveDays);

            report.push({
                employee: emp,
                presentDays,
                lateDays,
                leaveDays,
                absentDays,
                workingDays,
                attendanceRate: workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0
            });
        }
        setReportData(report);
        setLoading(false);
    };

    const getWorkingDays = (y: number, m: number) => {
        let count = 0;
        const days = new Date(y, m, 0).getDate();
        for (let d = 1; d <= days; d++) {
            const day = new Date(y, m - 1, d).getDay();
            if (day !== 0 && day !== 6) count++;
        }
        return count;
    };

    const totals = reportData.reduce((acc, r) => ({
        present: acc.present + r.presentDays,
        late: acc.late + r.lateDays,
        leave: acc.leave + r.leaveDays,
        absent: acc.absent + r.absentDays,
    }), { present: 0, late: 0, leave: 0, absent: 0 });

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-white/5">
                <div className="flex gap-3 items-center">
                    <select value={month} onChange={e => setMonth(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none">
                        {[t.jan, t.feb, t.mar, t.apr, t.may, t.jun, t.jul, t.aug, t.sep, t.oct, t.nov, t.dec].map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none">
                        {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button onClick={generateReport} className="px-4 py-2 bg-indigo-600 rounded-lg text-sm hover:bg-indigo-500 transition">{t.loadData}</button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="glass-panel p-4 text-center"><p className="text-3xl font-bold text-green-400">{totals.present}</p><p className="text-xs text-gray-400 mt-1">{t.workingDaysTotal}</p></div>
                <div className="glass-panel p-4 text-center"><p className="text-3xl font-bold text-yellow-400">{totals.late}</p><p className="text-xs text-gray-400 mt-1">{t.lateDaysTotal}</p></div>
                <div className="glass-panel p-4 text-center"><p className="text-3xl font-bold text-blue-400">{totals.leave}</p><p className="text-xs text-gray-400 mt-1">{t.leaveDaysTotal}</p></div>
                <div className="glass-panel p-4 text-center"><p className="text-3xl font-bold text-red-400">{totals.absent}</p><p className="text-xs text-gray-400 mt-1">{t.absentDaysTotal}</p></div>
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-white/5 border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="p-4">{t.employee}</th><th className="p-4 text-center">{t.workingDays}</th><th className="p-4 text-center">{t.presentDays}</th><th className="p-4 text-center">{t.lateDays}</th><th className="p-4 text-center">{t.leaveDays}</th><th className="p-4 text-center">{t.absentDays}</th><th className="p-4 text-center">{t.attendanceRate}</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {reportData.map(r => (
                            <tr key={r.employee.id} className="hover:bg-white/5 transition">
                                <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden"><img src={r.employee.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.employee.email}`} alt="" className="w-full h-full object-cover" /></div><div><p className="text-sm font-medium">{r.employee.first_name} {r.employee.last_name}</p><p className="text-xs text-gray-500">{r.employee.department || '-'}</p></div></div></td>
                                <td className="p-4 text-center text-sm">{r.workingDays}</td>
                                <td className="p-4 text-center text-sm text-green-400 font-semibold">{r.presentDays}</td>
                                <td className="p-4 text-center text-sm"><span className={r.lateDays > 0 ? 'text-yellow-400' : 'text-gray-500'}>{r.lateDays}</span></td>
                                <td className="p-4 text-center text-sm text-blue-400">{r.leaveDays}</td>
                                <td className="p-4 text-center text-sm"><span className={r.absentDays > 0 ? 'text-red-400 font-bold' : 'text-gray-500'}>{r.absentDays}</span></td>
                                <td className="p-4 text-center"><div className="flex items-center justify-center gap-2"><div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${r.attendanceRate}%` }}></div></div><span className="text-xs font-mono">{r.attendanceRate}%</span></div></td>
                            </tr>
                        ))}
                        {reportData.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500">{loading ? t.loading : t.noData}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MonthlyReport;
