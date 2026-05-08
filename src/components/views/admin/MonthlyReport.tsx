
import { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertTriangle, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Profile, AttendanceLog, LeaveRequest } from '@/types';

interface MonthlyReportProps {
    employees: Profile[];
    settings: Record<string, string>;
}

import { useApp } from '@/context/AppContext';

const MonthlyReport = ({ employees, settings }: MonthlyReportProps) => {
    const { t, lang } = useApp();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const workStartTime = settings.work_start_time || '08:30';
    const lateThreshold = parseInt(settings.late_threshold_minutes || '15');

    useEffect(() => { generateReport(); }, [month, year]);

    const holidays2026: Record<string, string> = {
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

    const getFullTimeWorkingDays = (y: number, m: number) => {
        let count = 0;
        const days = new Date(y, m, 0).getDate();
        for (let d = 1; d <= days; d++) {
            const dateObj = new Date(y, m - 1, d);
            const dateStr = dateObj.toLocaleDateString('en-CA');
            const dayOfWeek = dateObj.getDay();

            const isSunday = dayOfWeek === 0;
            const isHoliday = !!holidays2026[dateStr];

            if (!isSunday && !isHoliday) {
                count++;
            }
        }
        return count;
    };

    const generateReport = async () => {
        setLoading(true);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        const baseWorkingDays = getFullTimeWorkingDays(year, month);

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
                const [h, m_val] = workStartTime.split(':').map(Number);
                const limit = new Date(t); limit.setHours(h, m_val + lateThreshold, 0, 0);
                if (t > limit) lateDays++;
            });

            let leaveDays = 0;
            (leaves || []).forEach((lv: any) => {
                const s = new Date(lv.start_date);
                const e = new Date(lv.end_date);
                leaveDays += Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1;
            });

            const isDaily = emp.employee_type === 'daily';
            const workingDays = isDaily ? presentDays : baseWorkingDays;
            const absentDays = isDaily ? 0 : Math.max(0, workingDays - presentDays - leaveDays);

            report.push({
                employee: emp,
                presentDays,
                lateDays,
                leaveDays,
                absentDays,
                workingDays,
                attendanceRate: workingDays > 0 ? Math.round(((presentDays + leaveDays) / workingDays) * 100) : 0
            });
        }
        setReportData(report);
        setLoading(false);
    };

    const totals = reportData.reduce((acc, r) => ({
        present: acc.present + r.presentDays,
        late: acc.late + r.lateDays,
        leave: acc.leave + r.leaveDays,
        absent: acc.absent + r.absentDays,
    }), { present: 0, late: 0, leave: 0, absent: 0 });

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-indigo-600" />
                        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:border-indigo-500 outline-none transition-all">
                            {[t.jan, t.feb, t.mar, t.apr, t.may, t.jun, t.jul, t.aug, t.sep, t.oct, t.nov, t.dec].map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:border-indigo-500 outline-none transition-all">
                        {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button onClick={generateReport} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center gap-2">
                        {loading ? <Clock size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        {t.loadData}
                    </button>
                </div>
                <button onClick={() => {}} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95">
                    <Download size={16} strokeWidth={2.5} /> {t.export || 'Export'}
                </button>
            </div>

            {/* Info Note for Calculation Plan */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 flex gap-4 text-sm text-indigo-800 shadow-sm">
                <AlertTriangle size={24} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                    <p className="font-black text-indigo-900 mb-2 text-base">ℹ️ เกณฑ์การคำนวณวันทำงาน</p>
                    <ul className="list-disc pl-5 space-y-1.5 opacity-90 text-sm font-medium text-indigo-700">
                        <li><strong>พนักงานประจำ:</strong> ยอด "วันทำงานรวม" คำนวณจากจำนวนวันในเดือน หักลบ วันอาทิตย์ และ <strong>วันหยุดบริษัท/วันหยุดนักขัตฤกษ์/เสาร์หยุดพิเศษ</strong> ตามปฏิทิน</li>
                        <li><strong>พนักงานรายวัน:</strong> ยอด "วันทำงานรวม" จะนับตามยอดที่มีการบันทึกเข้างานจริงเท่านั้น (ช่องขาดงานจึงเป็น 0 เสมอ)</li>
                        <li><strong>เปอร์เซ็นต์มาทำงาน:</strong> คำนวณจาก (วันมาทำงานจริง + วันลาที่อนุมัติแล้ว) ÷ จำนวนวันทำงานรวม</li>
                    </ul>
                </div>
            </div>

            {/* Monthly Holidays Display */}
            {(() => {
                const currentMonthHolidays = Object.entries(holidays2026).filter(([date]) => {
                    const d = new Date(date);
                    return d.getFullYear() === year && d.getMonth() + 1 === month;
                }).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

                if (currentMonthHolidays.length === 0) return null;

                return (
                    <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4 text-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={18} className="text-orange-500 dark:text-orange-400" />
                            <h4 className="font-semibold text-orange-800 dark:text-orange-300">วันหยุดประจำเดือน {t.jan && [t.jan, t.feb, t.mar, t.apr, t.may, t.jun, t.jul, t.aug, t.sep, t.oct, t.nov, t.dec][month - 1]} {year} ({currentMonthHolidays.length} วัน)</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {currentMonthHolidays.map(([date, name]) => {
                                const d = new Date(date);
                                const dayName = d.toLocaleDateString('th-TH', { weekday: 'short' });
                                return (
                                    <div key={date} className="flex flex-col bg-white/50 dark:bg-black/20 p-2.5 rounded-lg border border-orange-100 dark:border-orange-500/10">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-orange-600 dark:text-orange-400 font-bold text-lg leading-none">{d.getDate()}</span>
                                            <span className="text-xs text-orange-500 dark:text-orange-400 font-medium">({dayName})</span>
                                        </div>
                                        <span className="text-orange-800 dark:text-orange-200 text-xs mt-1 font-medium">{name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center group hover:border-emerald-100 transition-all">
                    <p className="text-4xl font-black text-emerald-600 leading-none mb-2">{totals.present}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.workingDaysTotal}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center group hover:border-amber-100 transition-all">
                    <p className="text-4xl font-black text-amber-500 leading-none mb-2">{totals.late}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.lateDaysTotal}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center group hover:border-blue-100 transition-all">
                    <p className="text-4xl font-black text-blue-600 leading-none mb-2">{totals.leave}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.leaveDaysTotal}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center group hover:border-rose-100 transition-all">
                    <p className="text-4xl font-black text-rose-600 leading-none mb-2">{totals.absent}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.absentDaysTotal}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-[0.1em]">
                                <th className="p-5 pl-8">{t.employee}</th>
                                <th className="p-5 text-center">{t.workingDays}</th>
                                <th className="p-5 text-center">{t.presentDays}</th>
                                <th className="p-5 text-center">{t.lateDays}</th>
                                <th className="p-5 text-center">{t.leaveDays}</th>
                                <th className="p-5 text-center">{t.absentDays}</th>
                                <th className="p-5 pr-8 text-center">{t.attendanceRate}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {reportData.map(r => (
                                <tr key={r.employee.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-5 pl-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                                                <img src={r.employee.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.employee.email}`} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{r.employee.first_name} {r.employee.last_name}</p>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{r.employee.department || '-'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center text-sm font-bold text-slate-700">{r.workingDays}</td>
                                    <td className="p-5 text-center text-sm text-emerald-600 font-black">{r.presentDays}</td>
                                    <td className="p-5 text-center text-sm font-bold">
                                        <span className={r.lateDays > 0 ? 'text-amber-600' : 'text-slate-400'}>{r.lateDays}</span>
                                    </td>
                                    <td className="p-5 text-center text-sm text-blue-600 font-bold">{r.leaveDays}</td>
                                    <td className="p-5 text-center text-sm font-bold">
                                        <span className={r.absentDays > 0 ? 'text-rose-600 font-black' : 'text-slate-400'}>{r.absentDays}</span>
                                    </td>
                                    <td className="p-5 pr-8 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.3)]" style={{ width: `${r.attendanceRate}%` }}></div>
                                            </div>
                                            <span className="text-xs font-black text-indigo-600">{r.attendanceRate}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {reportData.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-16 text-center text-slate-400 font-bold italic bg-slate-50/30">
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Clock className="animate-spin" size={20} /> {t.loading}
                                            </div>
                                        ) : t.noData}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MonthlyReport;
