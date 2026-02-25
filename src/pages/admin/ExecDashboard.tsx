
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, Users, Calendar, Award, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import type { Profile, WorkShift } from '../../types';

interface ExecDashProps {
    employees: Profile[];
    settings: any;
}

interface EmployeeStat {
    id: string;
    name: string;
    code: string;
    department: string;
    shift: string;
    totalDays: number;
    lateDays: number;
    lateMinutes: number;
    absentDays: number;
    avgWorkHours: number;
    leavesTaken: number;
    onTimePercent: number;
}

import { useApp } from '../../context/AppContext';

const ExecDashboard = ({ employees, settings }: ExecDashProps) => {
    const { t } = useApp();
    const [month, setMonth] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; });
    const [stats, setStats] = useState<EmployeeStat[]>([]);
    const [loading, setLoading] = useState(false);
    const [shifts, setShifts] = useState<WorkShift[]>([]);

    useEffect(() => { fetchData(); }, [month]);

    const fetchData = async () => {
        setLoading(true);
        const [year, mon] = month.split('-').map(Number);
        const startDate = `${year}-${String(mon).padStart(2, '0')}-01`;
        const lastDay = new Date(year, mon, 0).getDate();
        const endDate = `${year}-${String(mon).padStart(2, '0')}-${lastDay}`;

        const [logRes, leaveRes, shiftRes] = await Promise.all([
            supabase.from('attendance_logs').select('*').gte('timestamp', `${startDate}T00:00:00`).lte('timestamp', `${endDate}T23:59:59`).order('timestamp'),
            supabase.from('leave_requests').select('*').eq('status', 'approved').gte('start_date', startDate).lte('end_date', endDate),
            supabase.from('work_shifts').select('*'),
        ]);

        const allLogs = logRes.data || [];
        const allLeaves = leaveRes.data || [];
        const allShifts = (shiftRes.data || []) as WorkShift[];
        setShifts(allShifts);

        const workStartDefault = settings.work_start_time || '08:30';
        const lateThresholdDefault = parseInt(settings.late_threshold_minutes || '15');

        // Calculate working days in month (Mon-Fri)
        let workDaysInMonth = 0;
        for (let d = 1; d <= lastDay; d++) {
            const day = new Date(year, mon - 1, d).getDay();
            if (day !== 0 && day !== 6) workDaysInMonth++;
        }

        const empStats: EmployeeStat[] = employees.filter(e => e.is_active !== false).map(emp => {
            const empLogs = allLogs.filter(l => l.user_id === emp.id);
            const empLeaves = allLeaves.filter((l: any) => l.user_id === emp.id);

            // Get employee shift
            const empShift = allShifts.find(s => s.id === emp.shift_id);
            const shiftStart = empShift?.start_time?.slice(0, 5) || workStartDefault;
            const lateThreshold = empShift?.late_threshold_minutes || lateThresholdDefault;

            // Group logs by date
            const logsByDate = new Map<string, any[]>();
            empLogs.forEach(log => {
                const date = log.timestamp.split('T')[0];
                if (!logsByDate.has(date)) logsByDate.set(date, []);
                logsByDate.get(date)!.push(log);
            });

            let lateDays = 0;
            let totalLateMinutes = 0;
            let totalWorkMinutes = 0;
            let daysPresent = 0;

            logsByDate.forEach((dayLogs, _date) => {
                const checkIn = dayLogs.find((l: any) => l.type === 'check_in');
                const checkOut = dayLogs.find((l: any) => l.type === 'check_out');

                if (checkIn) {
                    daysPresent++;
                    const inTime = new Date(checkIn.timestamp);
                    const inHHMM = `${String(inTime.getHours()).padStart(2, '0')}:${String(inTime.getMinutes()).padStart(2, '0')}`;

                    // Compare with shift start time
                    const [shiftH, shiftM] = shiftStart.split(':').map(Number);
                    const shiftMinutes = shiftH * 60 + shiftM + lateThreshold;
                    const inMinutes = inTime.getHours() * 60 + inTime.getMinutes();

                    if (inMinutes > shiftMinutes) {
                        lateDays++;
                        totalLateMinutes += (inMinutes - (shiftH * 60 + shiftM));
                    }

                    if (checkOut) {
                        const outTime = new Date(checkOut.timestamp);
                        totalWorkMinutes += (outTime.getTime() - inTime.getTime()) / 60000;
                    }
                }
            });

            // Count leave days
            let leavesDays = 0;
            empLeaves.forEach((leave: any) => {
                const s = new Date(leave.start_date);
                const e = new Date(leave.end_date);
                leavesDays += Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            });

            const absentDays = Math.max(0, workDaysInMonth - daysPresent - leavesDays);
            const avgWorkHours = daysPresent > 0 ? totalWorkMinutes / daysPresent / 60 : 0;
            const onTimePercent = daysPresent > 0 ? ((daysPresent - lateDays) / daysPresent * 100) : 0;

            return {
                id: emp.id,
                name: `${emp.first_name} ${emp.last_name}`,
                code: emp.employee_code || '-',
                department: emp.department || '-',
                shift: empShift?.label || '-',
                totalDays: daysPresent,
                lateDays,
                lateMinutes: totalLateMinutes,
                absentDays,
                avgWorkHours: Math.round(avgWorkHours * 10) / 10,
                leavesTaken: leavesDays,
                onTimePercent: Math.round(onTimePercent),
            };
        });

        setStats(empStats.sort((a, b) => b.lateDays - a.lateDays));
        setLoading(false);
    };

    const exportExecCSV = () => {
        if (stats.length === 0) { alert(t.noData); return; }
        const bom = '\uFEFF';
        const headers = [t.idHeader, t.fullname, t.department, t.shift, t.workingDays, `${t.lateDays} (${t.days})`, `${t.lateDays} (${t.minutes})`, t.absentDays, t.leaveDays, t.avgWorkHoursShort, t.onTimePercent];
        const rows = stats.map(s => [s.code, s.name, s.department, s.shift, s.totalDays, s.lateDays, s.lateMinutes, s.absentDays, s.leavesTaken, s.avgWorkHours, `${s.onTimePercent}%`]);
        const csv = bom + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `executive_report_${month}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    // Summary stats
    const totalPresent = stats.reduce((a, b) => a + b.totalDays, 0);
    const totalLate = stats.reduce((a, b) => a + b.lateDays, 0);
    const totalAbsent = stats.reduce((a, b) => a + b.absentDays, 0);
    const avgOnTime = stats.length > 0 ? Math.round(stats.reduce((a, b) => a + b.onTimePercent, 0) / stats.length) : 0;
    const topLate = stats.slice(0, 5);
    const topOnTime = [...stats].sort((a, b) => b.onTimePercent - a.onTimePercent).slice(0, 5);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Controls */}
            <div className="flex items-center gap-4">
                <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none" />
                <button onClick={exportExecCSV} className="px-4 py-2 bg-emerald-600 rounded-lg text-sm hover:bg-emerald-500 transition flex items-center gap-2"><Download size={14} /> Export CSV</button>
                {loading && <span className="text-xs text-gray-500 animate-pulse">{t.loading}</span>}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="glass-panel p-5 text-center">
                    <Users size={24} className="mx-auto text-indigo-400 mb-2" />
                    <p className="text-2xl font-bold">{stats.length}</p>
                    <p className="text-xs text-gray-400">{t.totalEmployees}</p>
                </div>
                <div className="glass-panel p-5 text-center">
                    <TrendingUp size={24} className="mx-auto text-green-400 mb-2" />
                    <p className="text-2xl font-bold text-green-400">{avgOnTime}%</p>
                    <p className="text-xs text-gray-400">{t.avgOnTime}</p>
                </div>
                <div className="glass-panel p-5 text-center">
                    <Clock size={24} className="mx-auto text-yellow-400 mb-2" />
                    <p className="text-2xl font-bold text-yellow-400">{totalLate}</p>
                    <p className="text-xs text-gray-400">{t.lateTotal}</p>
                </div>
                <div className="glass-panel p-5 text-center">
                    <AlertTriangle size={24} className="mx-auto text-red-400 mb-2" />
                    <p className="text-2xl font-bold text-red-400">{totalAbsent}</p>
                    <p className="text-xs text-gray-400">{t.absentTotal}</p>
                </div>
            </div>

            {/* Top Lists */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-yellow-400"><TrendingDown size={18} /> {t.topLate}</h3>
                    <div className="space-y-2">
                        {topLate.map((s, i) => (
                            <div key={s.id} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-red-500/30 text-red-400' : i === 1 ? 'bg-orange-500/30 text-orange-400' : 'bg-gray-500/20 text-gray-400'}`}>{i + 1}</span>
                                    <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-gray-500">{s.code} | {s.department}</p></div>
                                </div>
                                <div className="text-right"><p className="text-sm font-bold text-yellow-400">{s.lateDays} {t.days}</p><p className="text-xs text-gray-500">{s.lateMinutes} {t.minutes}</p></div>
                            </div>
                        ))}
                        {topLate.length === 0 && <p className="text-gray-500 text-sm text-center py-4">{t.noData}</p>}
                    </div>
                </div>
                <div className="glass-panel p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-400"><Award size={18} /> {t.topOnTime}</h3>
                    <div className="space-y-2">
                        {topOnTime.filter(s => s.totalDays > 0).map((s, i) => (
                            <div key={s.id} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-green-500/30 text-green-400' : i === 1 ? 'bg-emerald-500/30 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>{i + 1}</span>
                                    <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-gray-500">{s.code} | {s.department}</p></div>
                                </div>
                                <div className="text-right"><p className="text-sm font-bold text-green-400">{s.onTimePercent}%</p><p className="text-xs text-gray-500">{s.avgWorkHours} {t.hours}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Full Table */}
            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-white/5 border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="p-3">{t.idHeader}</th><th className="p-3">{t.fullNameHeader}</th><th className="p-3">{t.department}</th><th className="p-3">{t.shift}</th>
                        <th className="p-3 text-center">{t.workingDays}</th><th className="p-3 text-center">{t.lateDays}</th><th className="p-3 text-center">{t.absentDays}</th><th className="p-3 text-center">{t.leaveDays}</th>
                        <th className="p-3 text-center">{t.avgWorkHoursShort}</th><th className="p-3 text-center">{t.onTime}</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {stats.map(s => (
                            <tr key={s.id} className="hover:bg-white/5 transition">
                                <td className="p-3 text-xs font-mono text-indigo-400">{s.code}</td>
                                <td className="p-3 text-sm">{s.name}</td>
                                <td className="p-3 text-sm text-gray-400">{s.department}</td>
                                <td className="p-3 text-xs text-gray-400">{s.shift}</td>
                                <td className="p-3 text-center text-sm">{s.totalDays}</td>
                                <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-xs ${s.lateDays > 3 ? 'bg-red-500/20 text-red-400' : s.lateDays > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-500'}`}>{s.lateDays}</span></td>
                                <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-xs ${s.absentDays > 0 ? 'bg-red-500/20 text-red-400' : 'text-gray-500'}`}>{s.absentDays}</span></td>
                                <td className="p-3 text-center text-sm text-gray-400">{s.leavesTaken}</td>
                                <td className="p-3 text-center text-sm font-mono">{s.avgWorkHours}</td>
                                <td className="p-3 text-center">
                                    <div className="flex items-center gap-2 justify-center">
                                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.onTimePercent >= 90 ? 'bg-green-500' : s.onTimePercent >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${s.onTimePercent}%` }}></div></div>
                                        <span className="text-xs font-mono">{s.onTimePercent}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExecDashboard;
