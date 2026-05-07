
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
    const { t, showToast } = useApp();
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
        if (stats.length === 0) { showToast(t.noData, 'error'); return; }
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
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-indigo-600" />
                    <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:border-indigo-500 focus:outline-none transition-all" />
                    {loading && <span className="text-xs text-indigo-500 font-bold animate-pulse flex items-center gap-2"><Clock size={14} className="animate-spin" /> {t.loading}</span>}
                </div>
                <button onClick={exportExecCSV} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95">
                    <Download size={16} strokeWidth={2.5} /> {t.export || 'Export CSV'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center group hover:border-indigo-100 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Users size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-3xl font-black text-slate-800 leading-none mb-1">{stats.length}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.totalEmployees}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center group hover:border-emerald-100 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-3xl font-black text-emerald-600 leading-none mb-1">{avgOnTime}%</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.avgOnTime}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center group hover:border-amber-100 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Clock size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-3xl font-black text-amber-600 leading-none mb-1">{totalLate}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.lateTotal}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center group hover:border-rose-100 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <AlertTriangle size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-3xl font-black text-rose-600 leading-none mb-1">{totalAbsent}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.absentTotal}</p>
                </div>
            </div>

            {/* Top Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black mb-5 flex items-center gap-2 text-amber-600 tracking-tight">
                        <TrendingDown size={20} strokeWidth={2.5} /> {t.topLate}
                    </h3>
                    <div className="space-y-3">
                        {topLate.map((s, i) => (
                            <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:border-amber-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{s.name}</p>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.code} • {s.department}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-amber-600">{s.lateDays} {t.days}</p>
                                    <p className="text-[11px] font-bold text-slate-400">{s.lateMinutes} {t.minutes}</p>
                                </div>
                            </div>
                        ))}
                        {topLate.length === 0 && <p className="text-slate-400 text-sm font-bold text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">{t.noData}</p>}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black mb-5 flex items-center gap-2 text-emerald-600 tracking-tight">
                        <Award size={20} strokeWidth={2.5} /> {t.topOnTime}
                    </h3>
                    <div className="space-y-3">
                        {topOnTime.filter(s => s.totalDays > 0).map((s, i) => (
                            <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:border-emerald-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${i === 0 ? 'bg-emerald-100 text-emerald-700' : i === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{s.name}</p>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.code} • {s.department}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-600">{s.onTimePercent}%</p>
                                    <p className="text-[11px] font-bold text-slate-400">{s.avgWorkHours} {t.hours}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Full Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-[0.1em]">
                                <th className="p-5 pl-8">{t.idHeader}</th>
                                <th className="p-5">{t.fullNameHeader}</th>
                                <th className="p-5">{t.department}</th>
                                <th className="p-5 text-center">{t.workingDays}</th>
                                <th className="p-5 text-center">{t.lateDays}</th>
                                <th className="p-5 text-center">{t.absentDays}</th>
                                <th className="p-5 text-center">{t.avgWorkHoursShort}</th>
                                <th className="p-5 pr-8">{t.onTime}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {stats.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-5 pl-8 text-xs font-bold text-indigo-600">{s.code}</td>
                                    <td className="p-5">
                                        <p className="text-sm font-bold text-slate-800">{s.name}</p>
                                        <p className="text-[11px] font-bold text-slate-400">{s.shift}</p>
                                    </td>
                                    <td className="p-5 text-xs font-bold text-slate-500">{s.department}</td>
                                    <td className="p-5 text-center text-sm font-bold text-slate-700">{s.totalDays}</td>
                                    <td className="p-5 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wider ${s.lateDays > 3 ? 'bg-rose-50 text-rose-600 border border-rose-100' : s.lateDays > 0 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'text-slate-400 bg-slate-50'}`}>{s.lateDays}</span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wider ${s.absentDays > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'text-slate-400 bg-slate-50'}`}>{s.absentDays}</span>
                                    </td>
                                    <td className="p-5 text-center text-sm font-bold text-slate-700">{s.avgWorkHours}</td>
                                    <td className="p-5 pr-8">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 min-w-[60px] h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${s.onTimePercent >= 90 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : s.onTimePercent >= 70 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'}`} style={{ width: `${s.onTimePercent}%` }}></div>
                                            </div>
                                            <span className="text-xs font-black text-slate-600 min-w-[32px]">{s.onTimePercent}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {stats.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50/30">
                        <Users size={48} strokeWidth={1} className="mb-4 opacity-20" />
                        <p className="font-bold tracking-tight">{t.noData}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExecDashboard;
