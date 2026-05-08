
import { useState, useEffect } from 'react';
import { BarChart3, Star, Award, TrendingUp, Users, Settings, Plus, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Profile, KPICriteria, KPIEvaluation } from '@/types';

interface KPIPageProps {
    employees: Profile[];
    settings: Record<string, string>;
}

import { useApp } from '@/context/AppContext';

const KPIPage = ({ employees, settings }: KPIPageProps) => {
    const { t, lang, showToast, showConfirm } = useApp();
    const { user } = useAuth();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [criteria, setCriteria] = useState<KPICriteria[]>([]);
    const [evaluations, setEvaluations] = useState<KPIEvaluation[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    // KPI Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [editingCriteria, setEditingCriteria] = useState<KPICriteria[]>([]);

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

    const requestGenerateKPI = async () => {
        const confirmed = await showConfirm({
            title: t.evaluateKPI || 'ประเมิน KPI',
            message: `${t.evaluatingKPI} ${month}/${year}?`,
            confirmText: t.evaluateKPI || 'เริ่มประเมิน',
            type: 'info'
        });
        
        if (confirmed) generateKPILogic();
    };

    const generateKPILogic = async () => {
        setGenerating(true);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        const workingDays = getWorkingDays(year, month);
        
        const activeEmployees = employees.filter(e => e.is_active !== false);
        if (activeEmployees.length === 0) {
            showToast('ไม่พบพนักงานที่ทำงานในระบบ', 'error');
            setGenerating(false);
            return;
        }

        for (const emp of activeEmployees) {
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

            const { error: upsertError } = await supabase.from('kpi_evaluations').upsert({
                user_id: emp.id, month, year,
                scores, total_score: totalScore, grade,
                evaluator_id: user!.id
            }, { onConflict: 'user_id,month,year' });
            
            if (upsertError) {
                console.error("KPI Upsert Error:", upsertError);
                showToast("Error: " + upsertError.message, 'error');
                setGenerating(false);
                return;
            }
        }

        fetchData();
        setGenerating(false);
        showToast(t.kpiSuccess || 'ประเมิน KPI เสร็จสมบูรณ์แล้ว', 'success');
    };

    // --- KPI SETTINGS LOGIC ---
    const openSettings = () => {
        setEditingCriteria(JSON.parse(JSON.stringify(criteria)));
        setShowSettings(true);
    };

    const addCriterion = () => {
        const newCriterion: KPICriteria = {
            id: crypto.randomUUID(),
            name: '',
            description: '',
            weight: 10,
            category: 'custom',
            is_active: true,
            created_at: new Date().toISOString()
        };
        setEditingCriteria([...editingCriteria, newCriterion]);
    };

    const removeCriterion = (id: string) => {
        setEditingCriteria(editingCriteria.filter(c => c.id !== id));
    };

    const updateCriterion = (id: string, field: keyof KPICriteria, value: any) => {
        setEditingCriteria(editingCriteria.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const saveCriteria = async () => {
        if (editingCriteria.some(c => !c.name.trim())) {
            showToast('กรุณากรอกชื่อหัวข้อการประเมินให้ครบถ้วน', 'error');
            return;
        }

        const totalWeight = editingCriteria.reduce((sum, c) => sum + Number(c.weight), 0);
        if (totalWeight !== 100) {
            showToast(`น้ำหนักรวมทั้งหมดต้องเท่ากับ 100% (ปัจจุบัน ${totalWeight}%)`, 'error');
            return;
        }

        const currentIds = new Set(criteria.map(c => c.id));
        const editingIds = new Set(editingCriteria.map(c => c.id));
        const toDelete = Array.from(currentIds).filter(id => !editingIds.has(id));

        setLoading(true);
        if (toDelete.length > 0) {
            await supabase.from('kpi_criteria').delete().in('id', toDelete);
        }

        const toUpsert = editingCriteria.map(c => {
            const { ...rest } = c;
            return rest;
        });

        const { error } = await supabase.from('kpi_criteria').upsert(toUpsert);
        if (error) {
            showToast('Error: ' + error.message, 'error');
            setLoading(false);
            return;
        }

        setShowSettings(false);
        fetchData();
        showToast('บันทึกการตั้งค่า KPI สำเร็จ', 'success');
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center glass-panel p-5 rounded-2xl">
                <div className="flex gap-3 items-center">
                    <div className="relative">
                        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="appearance-none bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-4 pr-10 py-2.5 text-slate-900 dark:text-white text-sm font-medium outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                            {[t.jan, t.feb, t.mar, t.apr, t.may, t.jun, t.jul, t.aug, t.sep, t.oct, t.nov, t.dec].map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                    </div>
                    <div className="relative">
                        <select value={year} onChange={e => setYear(Number(e.target.value))} className="appearance-none bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-4 pr-10 py-2.5 text-slate-900 dark:text-white text-sm font-medium outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={openSettings} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Settings size={16} /> {t.settings || 'ตั้งค่า KPI'}
                    </button>
                    <button onClick={requestGenerateKPI} disabled={generating} className="px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-500 transition flex items-center gap-2 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/30">
                        <BarChart3 size={16} /> {generating ? (t.evaluating || 'กำลังประเมิน...') : (t.evaluateKPI || 'ประเมิน KPI')}
                    </button>
                </div>
            </div>

            {/* KPI Criteria View */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {criteria.map(c => (
                    <div key={c.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-slate-800/50">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-base font-bold text-slate-800 dark:text-white line-clamp-1">{c.name}</h3>
                                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20 px-2 py-1 rounded-full whitespace-nowrap">
                                    {c.category === 'custom' ? 'อื่นๆ/สะสม' : c.category.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 min-h-[40px]">{c.description || '-'}</p>
                        </div>
                        <div className="mt-5 flex items-center gap-4">
                            <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner flex items-center">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${c.weight}%` }}></div>
                            </div>
                            <span className="text-sm font-black font-mono text-slate-700 dark:text-slate-300">{c.weight}%</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Rankings */}
            <div className="glass-panel rounded-2xl overflow-hidden mt-6 shadow-sm border border-slate-200/50 dark:border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <th className="p-4 pl-6 w-16 text-center">#</th>
                            <th className="p-4">{t.employee}</th>
                            <th className="p-4 text-center">{t.presentDays}</th>
                            <th className="p-4 text-center">{t.onTime}</th>
                            <th className="p-4 text-center">{t.leaveUsage}</th>
                            <th className="p-4 text-center">{t.siteVisit}</th>
                            <th className="p-4 text-center">{t.totalScore}</th>
                            <th className="p-4 pr-6 text-center">{t.grade}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {evaluations.map((ev, i) => {
                            const g = getGrade(ev.total_score);
                            return (
                                <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition duration-200">
                                    <td className="p-4 pl-6 text-center">
                                        {i === 0 ? <span className="text-2xl drop-shadow-md">🥇</span> : i === 1 ? <span className="text-2xl drop-shadow-md">🥈</span> : i === 2 ? <span className="text-2xl drop-shadow-md">🥉</span> : <span className="text-slate-400 dark:text-slate-500 font-bold">{i + 1}</span>}
                                    </td>
                                    <td className="p-4 leading-tight">
                                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{ev.profiles?.first_name} {ev.profiles?.last_name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ev.profiles?.department} • {ev.profiles?.position}</div>
                                    </td>
                                    <td className="p-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">{ev.scores.attendance_rate || 0}%</td>
                                    <td className="p-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">{ev.scores.punctuality || 0}%</td>
                                    <td className="p-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">{ev.scores.leave_usage || 0}%</td>
                                    <td className="p-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">{ev.scores.site_visits || 0}%</td>
                                    <td className="p-4 text-center">
                                        <div className="flex flex-col items-center justify-center gap-1.5">
                                            <span className="text-sm font-black text-slate-800 dark:text-white">{ev.total_score}</span>
                                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${ev.total_score}%` }}></div>
                                            </div>
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

            {/* KPI Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] animate-slideUp relative z-[150]">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white"><Settings size={20} className="text-indigo-500" /> ตั้งค่าหัวข้อการประเมิน KPI (KPI Criteria)</h3>
                            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"><X size={20} /></button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 space-y-4">
                            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-500/20 text-indigo-800 dark:text-indigo-300 text-sm flex gap-3">
                                <span className="text-xl">💡</span>
                                <div>
                                    <p className="font-bold mb-1">คำแนะนำ:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>คุณสามารถลบหัวข้อซ้ำๆ ออกได้เลย เพื่อให้น้ำหนักรวมเหลือ 100%</li>
                                        <li>หากใช้ประเภทย่อย (Category) <span className="font-mono bg-indigo-100 dark:bg-indigo-500/20 px-1 rounded">attendance, punctuality, leave</span> คะแนนทั้งหมดจะถูกดึงและคำนวณจากระบบอัตโนมัติ</li>
                                        <li>หากเป็นประเภท <span className="font-mono bg-indigo-100 dark:bg-indigo-500/20 px-1 rounded">custom (อื่นๆ)</span> คะแนนจะคำนวณจากแต้มอื่นๆ เช่น คะแนน Site Visit หรือผลประเมินที่กรอกเอง</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {editingCriteria.map((c, i) => (
                                    <div key={c.id} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 relative group transition-all">
                                        <div className="flex-1 space-y-3">
                                            <div className="grid grid-cols-[1fr_200px_100px] gap-3">
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">ชื่อหัวข้อประเมิน (TH/EN)</label>
                                                    <input value={c.name} onChange={e => updateCriterion(c.id, 'name', e.target.value)} placeholder="เช่น การมาทำงาน, ผลงาน" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">หมวดหมู่ (คำนวณอัตโนมัติ)</label>
                                                    <select value={c.category} onChange={e => updateCriterion(c.id, 'category', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition">
                                                        <option value="attendance">เวลาทำงาน (Attendance)</option>
                                                        <option value="punctuality">ความตรงต่อเวลา (Punctuality)</option>
                                                        <option value="leave">การลางาน (Leave Usage)</option>
                                                        <option value="custom">อื่นๆ / กำหนดเอง (Custom)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">น้ำหนัก (%)</label>
                                                    <div className="relative">
                                                        <input type="number" min="0" max="100" value={c.weight} onChange={e => updateCriterion(c.id, 'weight', Number(e.target.value))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 pr-8 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition text-right font-mono font-bold" />
                                                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <input value={c.description || ''} onChange={e => updateCriterion(c.id, 'description', e.target.value)} placeholder="รายละเอียดหรือคำอธิบายวิธีให้คะแนนเพิ่มเติม (ตัวเลือก)" className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 transition" />
                                            </div>
                                        </div>
                                        <button onClick={() => removeCriterion(c.id)} className="w-10 h-[66px] mt-1 flex items-center justify-center bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 rounded-xl transition shrink-0 border border-red-100 dark:border-red-500/20" title="ลบหัวข้อ"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>

                            <button onClick={addCriterion} className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl flex justify-center items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600 transition font-medium text-sm">
                                <Plus size={18} /> เพิ่มหัวข้อการประเมิน
                            </button>
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                            <div className="flex gap-3 items-center bg-white dark:bg-slate-900 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px]">เป้าหมาย 100%</span>
                                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                                <span className={`text-xl font-bold font-mono tracking-tight ${editingCriteria.reduce((sum, c) => sum + Number(c.weight), 0) === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {editingCriteria.reduce((sum, c) => sum + Number(c.weight), 0)}%
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowSettings(false)} className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm">
                                    ยกเลิก
                                </button>
                                <button onClick={saveCriteria} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                                    <Save size={18} /> บันทึกการตั้งค่า
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KPIPage;
