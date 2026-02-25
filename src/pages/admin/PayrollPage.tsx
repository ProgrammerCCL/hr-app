
import { useState, useEffect } from 'react';
import { DollarSign, Calculator, CheckCircle, AlertTriangle, Save, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../context/AuthContext';
import type { Profile, PayrollRecord } from '../../types';

interface PayrollPageProps {
    employees: Profile[];
    settings: Record<string, string>;
}

import { useApp } from '../../context/AppContext';

const PayrollPage = ({ employees, settings }: PayrollPageProps) => {
    const { t, lang } = useApp();
    const { user } = useAuth();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [records, setRecords] = useState<PayrollRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const workStartTime = settings.work_start_time || '08:30';
    const lateThreshold = parseInt(settings.late_threshold_minutes || '15');
    const lateDeduction = parseFloat(settings.late_deduction_per_time || '50');
    const otMultiplier = parseFloat(settings.ot_rate_multiplier || '1.5');
    const ssRate = parseFloat(settings.social_security_rate || '5') / 100;
    const ssMax = parseFloat(settings.social_security_max || '750');

    useEffect(() => { fetchRecords(); }, [month, year]);

    const fetchRecords = async () => {
        setLoading(true);
        const { data } = await supabase.from('payroll_records').select('*, profiles(first_name, last_name, department, position, bank_name, bank_account)').eq('month', month).eq('year', year).order('created_at');
        if (data) setRecords(data as PayrollRecord[]);
        setLoading(false);
    };

    const getWorkingDays = (y: number, m: number) => {
        let count = 0;
        const days = new Date(y, m, 0).getDate();
        for (let d = 1; d <= days; d++) { const day = new Date(y, m - 1, d).getDay(); if (day !== 0 && day !== 6) count++; }
        return count;
    };

    const generatePayroll = async () => {
        const activeEmps = employees.filter(e => e.is_active !== false);
        if (!confirm(`${t.calculatingFor} ${month}/${year} ${t.for} ${t.employees} ${activeEmps.length} ${t.persons}?`)) return;
        setGenerating(true);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        const workingDays = getWorkingDays(year, month);

        for (const emp of employees.filter(e => e.is_active !== false)) {
            const baseSalary = emp.base_salary || 0;
            if (baseSalary <= 0) continue;

            const { data: logs } = await supabase.from('attendance_logs').select('*').eq('user_id', emp.id).gte('timestamp', `${startDate}T00:00:00`).lte('timestamp', `${endDate}T23:59:59`);
            const { data: leaves } = await supabase.from('leave_requests').select('*').eq('user_id', emp.id).eq('status', 'approved').gte('start_date', startDate).lte('end_date', endDate);

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

            let leaveDaysCount = 0;
            (leaves || []).forEach((lv: any) => {
                const s = new Date(lv.start_date);
                const e = new Date(lv.end_date);
                leaveDaysCount += Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1;
            });

            const absentDays = Math.max(0, workingDays - actualDays - leaveDaysCount);
            const dailyRate = baseSalary / workingDays;
            const lateDed = lateCount * lateDeduction;
            const absentDed = absentDays * dailyRate;
            const socialSecurity = Math.min(baseSalary * ssRate, ssMax);

            // Simple withholding tax estimation (progressive)
            const annualIncome = baseSalary * 12;
            const taxableIncome = Math.max(0, annualIncome - 150000 - (socialSecurity * 12) - 60000); // personal + SS + expense
            let annualTax = 0;
            if (taxableIncome > 0) {
                if (taxableIncome <= 150000) annualTax = 0;
                else if (taxableIncome <= 300000) annualTax = (taxableIncome - 150000) * 0.05;
                else if (taxableIncome <= 500000) annualTax = 7500 + (taxableIncome - 300000) * 0.10;
                else if (taxableIncome <= 750000) annualTax = 27500 + (taxableIncome - 500000) * 0.15;
                else if (taxableIncome <= 1000000) annualTax = 65000 + (taxableIncome - 750000) * 0.20;
                else if (taxableIncome <= 2000000) annualTax = 115000 + (taxableIncome - 1000000) * 0.25;
                else if (taxableIncome <= 5000000) annualTax = 365000 + (taxableIncome - 2000000) * 0.30;
                else annualTax = 1265000 + (taxableIncome - 5000000) * 0.35;
            }
            const monthlyTax = Math.round(annualTax / 12);

            const grossPay = baseSalary;
            const totalDeductions = lateDed + absentDed + socialSecurity + monthlyTax;
            const netPay = grossPay - totalDeductions;

            await supabase.from('payroll_records').upsert({
                user_id: emp.id, month, year, base_salary: baseSalary,
                working_days: workingDays, actual_days: actualDays,
                late_count: lateCount, absent_days: absentDays, leave_days: leaveDaysCount,
                ot_hours: 0, ot_amount: 0,
                late_deduction: lateDed, absent_deduction: absentDed,
                social_security: socialSecurity, withholding_tax: monthlyTax,
                other_deductions: 0, other_additions: 0,
                gross_pay: grossPay, net_pay: netPay,
                status: 'draft'
            }, { onConflict: 'user_id,month,year' });
        }

        fetchRecords();
        setGenerating(false);
        alert(t.salaryCalculated);
    };

    const confirmPayroll = async () => {
        if (!confirm(t.confirmAllSalaries)) return;
        await supabase.from('payroll_records').update({ status: 'confirmed' }).eq('month', month).eq('year', year).eq('status', 'draft');
        fetchRecords();
    };

    const fmt = (n: number) => n.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalNet = records.reduce((s, r) => s + (r.net_pay || 0), 0);
    const totalGross = records.reduce((s, r) => s + (r.gross_pay || 0), 0);

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
                <div className="flex gap-3">
                    <button onClick={generatePayroll} disabled={generating} className="px-4 py-2 bg-indigo-600 rounded-lg text-sm hover:bg-indigo-500 transition flex items-center gap-2 disabled:opacity-50">
                        <Calculator size={16} /> {generating ? t.calculating : t.calculateSalary}
                    </button>
                    {records.some(r => r.status === 'draft') && (
                        <button onClick={confirmPayroll} className="px-4 py-2 bg-green-600 rounded-lg text-sm hover:bg-green-500 transition flex items-center gap-2">
                            <CheckCircle size={16} /> {t.confirmAll}
                        </button>
                    )}
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-4 text-center"><p className="text-2xl font-bold text-white">{records.length}</p><p className="text-xs text-gray-400">{t.employees}</p></div>
                <div className="glass-panel p-4 text-center"><p className="text-2xl font-bold text-green-400">฿{fmt(totalGross)}</p><p className="text-xs text-gray-400">{t.grossBase}</p></div>
                <div className="glass-panel p-4 text-center"><p className="text-2xl font-bold text-emerald-400">฿{fmt(totalNet)}</p><p className="text-xs text-gray-400">{t.netBase}</p></div>
            </div>

            {/* Payroll Table */}
            <div className="glass-panel overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead><tr className="bg-white/5 border-b border-white/5 text-gray-400 text-[11px] uppercase tracking-wider">
                        <th className="p-3">{t.employee}</th><th className="p-3 text-right">{t.salaryHeader}</th><th className="p-3 text-center">{t.presentHeader}</th><th className="p-3 text-center">{t.lateHeader}</th><th className="p-3 text-center">{t.absentHeader}</th><th className="p-3 text-right">{t.lateDeductionHeader}</th><th className="p-3 text-right">{t.absentDeductionHeader}</th><th className="p-3 text-right">{t.ssHeader}</th><th className="p-3 text-right">{t.taxHeader}</th><th className="p-3 text-right">{t.netPayHeader}</th><th className="p-3 text-center">{t.statusHeader}</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {records.map(r => (
                            <tr key={r.id} className="hover:bg-white/5 transition text-sm">
                                <td className="p-3"><div className="text-sm font-medium">{r.profiles?.first_name} {r.profiles?.last_name}</div><div className="text-xs text-gray-500">{r.profiles?.department}</div></td>
                                <td className="p-3 text-right font-mono">{fmt(r.base_salary)}</td>
                                <td className="p-3 text-center">{r.actual_days}/{r.working_days}</td>
                                <td className="p-3 text-center"><span className={r.late_count > 0 ? 'text-yellow-400' : ''}>{r.late_count}</span></td>
                                <td className="p-3 text-center"><span className={r.absent_days > 0 ? 'text-red-400' : ''}>{r.absent_days}</span></td>
                                <td className="p-3 text-right text-red-400 font-mono">{r.late_deduction > 0 ? `-${fmt(r.late_deduction)}` : '-'}</td>
                                <td className="p-3 text-right text-red-400 font-mono">{r.absent_deduction > 0 ? `-${fmt(r.absent_deduction)}` : '-'}</td>
                                <td className="p-3 text-right font-mono">{fmt(r.social_security)}</td>
                                <td className="p-3 text-right font-mono">{fmt(r.withholding_tax)}</td>
                                <td className="p-3 text-right font-bold text-emerald-400 font-mono">{fmt(r.net_pay)}</td>
                                <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] border ${r.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : r.status === 'paid' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>{r.status}</span></td>
                            </tr>
                        ))}
                        {records.length === 0 && <tr><td colSpan={11} className="p-8 text-center text-gray-500">{loading ? t.loading : t.noPayrollDataHint}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayrollPage;
