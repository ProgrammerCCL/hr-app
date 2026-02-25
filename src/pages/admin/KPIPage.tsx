
import { useState, useEffect } from 'react';
import { BarChart3, Star, Award, TrendingUp, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../context/AuthContext';
import type { Profile, KPICriteria, KPIEvaluation } from '../../types';

interface KPIPageProps {
    employees: Profile[];
    settings: Record<string, string>;
}

import { useApp } from '../../context/AppContext';

const KPIPage = ({ employees, settings }: KPIPageProps) => {
    const { t, lang } = useApp();
    const { user } = useAuth();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [criteria, setCriteria] = useState<KPICriteria[]>([]);
    const [evaluations, setEvaluations] = useState<KPIEvaluation[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const workStartTime = settings.work_start_time || '08:30';
    const lateThreshold = parseInt(settings.late_threshold_minutes || '15');

    useEffect(() => { fetchData(); }, [month, year]);

    const fetchData = async () => {
        setLoading(true);
        const { data: c } = await supabase.from('kpi_criteria').select('*').eq('is_active', true).order('category');
        if (c) setCriteria(c as KPICriteria[]);
        const { data: e } = await supabase.from('kpi_evaluations').select('*, profiles(first_name, last_name, department, position)').eq('month', month).eq('year', year).order('total_score', { ascending: false });
        if (e) setEvaluations(e as KPIEvaluation[]);
        setLoading(false);
    };

    const getWorkingDays = (y: number, m: number) => {
        let count = 0;
        const days = new Date(y, m, 0).getDate();
        for (let d = 1; d <= days; d++) { const day = new Date(y, m - 1, d).getDay(); if (day !== 0 && day !== 6) count++; }
        return count;
    };

    const getGrade = (score: number) => {
        if (score >= 90) return { grade: 'A', color: 'text-green-400', bg: 'bg-green-500/10' };
        if (score >= 80) return { grade: 'B', color: 'text-blue-400', bg: 'bg-blue-500/10' };
        if (score >= 70) return { grade: 'C', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
        if (score >= 60) return { grade: 'D', color: 'text-orange-400', bg: 'bg-orange-500/10' };
        return { grade: 'F', color: 'text-red-400', bg: 'bg-red-500/10' };
    };

    const generateKPI = async () => {
        if (!confirm(`${t.evaluatingKPI} ${month}/${year}?`)) return;
        setGenerating(true);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        const workingDays = getWorkingDays(year, month);

        for (const emp of employees.filter(e => e.is_active !== false)) {
            const { data: logs } = await supabase.from('attendance_logs').select('*').eq('user_id', emp.id).gte('timestamp', `${startDate}T00:00:00`).lte('timestamp', `${endDate}T23:59:59`);
            const { data: leaves } = await supabase.from('leave_requests').select('*').eq('user_id', emp.id).eq('status', 'approved').gte('start_date', startDate).lte('end_date', endDate);
            const { data: siteVisits } = await supabase.from('site_visits').select('*').eq('user_id', emp.id).gte('created_at', `${startDate}T00:00:00`).lte('created_at', `${endDate}T23:59:59`);

            const checkIns = (logs || []).filter((l: any) => l.type === 'check_in');
            const uniqueDays = new Set(checkIns.map((l: any) => new Date(l.timestamp).toISOString().split('T')[0]));
            const actualDays = uniqueDays.size;

            let lateCount = 0;
            checkIns.forEach((l: any) => {
                const t = new Date(l.timestamp);
                const [h, m] = workStartTime.split(':').map(Number);
                const limit = new Date(t); limit.setHours(h, m + lateThreshold, 0, 0);
                if (t > limit) lateCount++;
            });

            let leaveDays = 0;
            (leaves || []).forEach((lv: any) => {
                const s = new Date(lv.start_date); const e = new Date(lv.end_date);
                leaveDays += Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1;
            });

            // Calculate scores
            const attendanceRate = workingDays > 0 ? Math.min(100, Math.round((actualDays / workingDays) * 100)) : 0;
            const punctuality = actualDays > 0 ? Math.min(100, Math.round(((actualDays - lateCount) / actualDays) * 100)) : 0;
            const leaveQuota = parseInt(settings.annual_leave_quota || '6') + parseInt(settings.sick_leave_quota || '30') + parseInt(settings.personal_leave_quota || '3');
            const leaveUsage = Math.min(100, Math.round(((leaveQuota - leaveDays) / leaveQuota) * 100));
            const siteVisitScore = Math.min(100, (siteVisits?.length || 0) * 10); // 10 points per visit, max 100

            const scores: Record<string, number> = {
                attendance_rate: attendanceRate,
                punctuality: punctuality,
                leave_usage: Math.max(0, leaveUsage),
                site_visits: siteVisitScore,
            };

            // Weighted total
            let totalScore = 0;
            let totalWeight = 0;
            criteria.forEach(c => {
                const key = c.category === 'attendance' ? 'attendance_rate' : c.category === 'punctuality' ? 'punctuality' : c.category === 'leave' ? 'leave_usage' : 'site_visits';
                if (scores[key] !== undefined) {
                    totalScore += scores[key] * (c.weight / 100);
                    totalWeight += c.weight;
                }
            });
            if (totalWeight > 0) totalScore = Math.round((totalScore / totalWeight) * 100);
            const { grade } = getGrade(totalScore);

            await supabase.from('kpi_evaluations').upsert({
                user_id: emp.id, month, year,
                scores, total_score: totalScore, grade,
                evaluator_id: user!.id
            }, { onConflict: 'user_id,month,year' });
        }

        fetchData();
        setGenerating(false);
        alert(t.kpiSuccess);
    };

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-white/5">
                <div className="flex gap-3 items-center">
                    <select value={month} onChange={e => setMonth(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        {[t.jan, t.feb, t.mar, t.apr, t.may, t.jun, t.jul, t.aug, t.sep, t.oct, t.nov, t.dec].map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <button onClick={generateKPI} disabled={generating} className="px-4 py-2 bg-indigo-600 rounded-lg text-sm hover:bg-indigo-500 transition flex items-center gap-2 disabled:opacity-50">
                    <BarChart3 size={16} /> {generating ? t.evaluating : t.evaluateKPI}
                </button>
            </div>

            {/* KPI Criteria */}
            <div className="grid grid-cols-4 gap-4">
                {criteria.map(c => (
                    <div key={c.id} className="glass-panel p-4">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{c.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.weight}%` }}></div></div>
                            <span className="text-xs font-mono text-indigo-400">{c.weight}%</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Rankings */}
            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-white/5 border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="p-4 w-12">#</th><th className="p-4">{t.employee}</th><th className="p-4 text-center">{t.presentDays}</th><th className="p-4 text-center">{t.onTime}</th><th className="p-4 text-center">{t.leaveUsage}</th><th className="p-4 text-center">{t.siteVisit}</th><th className="p-4 text-center">{t.totalScore}</th><th className="p-4 text-center">{t.grade}</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {evaluations.map((ev, i) => {
                            const g = getGrade(ev.total_score);
                            return (
                                <tr key={ev.id} className="hover:bg-white/5 transition">
                                    <td className="p-4">
                                        {i === 0 ? <span className="text-yellow-400">🥇</span> : i === 1 ? <span className="text-gray-300">🥈</span> : i === 2 ? <span className="text-orange-400">🥉</span> : <span className="text-gray-500">{i + 1}</span>}
                                    </td>
                                    <td className="p-4"><div className="text-sm font-medium">{ev.profiles?.first_name} {ev.profiles?.last_name}</div><div className="text-xs text-gray-500">{ev.profiles?.department} • {ev.profiles?.position}</div></td>
                                    <td className="p-4 text-center font-mono text-sm">{ev.scores.attendance_rate || 0}%</td>
                                    <td className="p-4 text-center font-mono text-sm">{ev.scores.punctuality || 0}%</td>
                                    <td className="p-4 text-center font-mono text-sm">{ev.scores.leave_usage || 0}%</td>
                                    <td className="p-4 text-center font-mono text-sm">{ev.scores.site_visits || 0}%</td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${ev.total_score}%` }}></div></div>
                                            <span className="text-sm font-bold">{ev.total_score}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center"><span className={`text-xl font-bold ${g.color}`}>{ev.grade}</span></td>
                                </tr>
                            );
                        })}
                        {evaluations.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-gray-500">{loading ? t.loading : t.evaluateKpiStartHint}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KPIPage;
