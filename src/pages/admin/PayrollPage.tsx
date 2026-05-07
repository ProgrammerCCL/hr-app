
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
    const { t, lang, showToast, showConfirm } = useApp();
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
        const { data } = await supabase.from('payroll_records').select('*, profiles(first_name, last_name, employee_code, department, position, bank_name, bank_account)').eq('month', month).eq('year', year).order('created_at');
        if (data) setRecords(data as PayrollRecord[]);
        setLoading(false);
    };

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
            if (!isSunday && !isHoliday) count++;
        }
        return count;
    };

    const requestGeneratePayroll = async () => {
        const activeEmps = employees.filter(e => e.is_active !== false);
        const confirmed = await showConfirm({
            title: t.calculateSalary || 'Calculated Salary',
            message: `${t.calculatingFor} ${month}/${year} ${t.for} ${t.employees} ${activeEmps.length} ${t.persons}?`,
            confirmText: t.calculateSalary || 'เริ่มคำนวณ',
            type: 'info'
        });
        
        if (confirmed) generatePayrollLogic();
    };

    const generatePayrollLogic = async () => {
        const activeEmps = employees.filter(e => e.is_active !== false);
        setGenerating(true);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        const baseWorkingDays = getFullTimeWorkingDays(year, month);

        for (const emp of activeEmps) {
            const baseSalary = emp.base_salary || 0;
            const isDaily = emp.employee_type === 'daily';

            const { data: logs } = await supabase.from('attendance_logs').select('*').eq('user_id', emp.id).gte('timestamp', `${startDate}T00:00:00`).lte('timestamp', `${endDate}T23:59:59`);
            const { data: leaves } = await supabase.from('leave_requests').select('*').eq('user_id', emp.id).eq('status', 'approved').gte('start_date', startDate).lte('end_date', endDate);

            const checkIns = (logs || []).filter((l: any) => l.type === 'check_in');
            const uniqueDays = new Set(checkIns.map((l: any) => new Date(l.timestamp).toISOString().split('T')[0]));
            const actualDays = uniqueDays.size;

            let lateCount = 0;
            checkIns.forEach((l: any) => {
                const tObj = new Date(l.timestamp);
                const [h, m_val] = workStartTime.split(':').map(Number);
                const limit = new Date(tObj); limit.setHours(h, m_val + lateThreshold, 0, 0);
                if (tObj > limit) lateCount++;
            });

            let leaveDaysCount = 0;
            (leaves || []).forEach((lv: any) => {
                const s = new Date(lv.start_date);
                const e = new Date(lv.end_date);
                leaveDaysCount += Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1;
            });

            // 1. Config Working Days (22, 26, 30)
            const configWorkingDays = parseInt(settings.working_days_per_month || '30');
            const divisorDays = isDaily ? 1 : configWorkingDays;
            
            // 2. Compute absent days based on actual schedule vs presence
            const absentDays = isDaily ? 0 : Math.max(0, baseWorkingDays - actualDays - leaveDaysCount);
            const dailyRate = isDaily ? baseSalary : (baseSalary / divisorDays);

            const grossPay = isDaily ? (actualDays * dailyRate) : baseSalary;

            const lateDed = lateCount * lateDeduction;
            const absentDed = absentDays * dailyRate;
            
            // Base items before Tax/SS (Add OT & Allowance logic here later)
            const otAmount = 0;
            const otherAdditions = 0;
            const otherDeductions = 0;

            const totalIncomeForTax = grossPay + otAmount + otherAdditions - lateDed - absentDed - otherDeductions;
            const socialSecurity = isDaily && (totalIncomeForTax < 1650) ? 0 : Math.min(Math.max(0, totalIncomeForTax) * ssRate, ssMax);

            // ==========================================
            // 3. Pro YTD + Annualized Tax Calculation 
            // ==========================================
            // Fetch YTD Data from previous months
            const { data: ytdData } = await supabase.from('payroll_records')
                .select('gross_pay, ot_amount, other_additions, late_deduction, absent_deduction, other_deductions, withholding_tax, social_security')
                .eq('user_id', emp.id)
                .eq('year', year)
                .lt('month', month);

            const ytdIncomeBefore = (ytdData || []).reduce((sum, r) => sum + (r.gross_pay + r.ot_amount + r.other_additions - r.late_deduction - r.absent_deduction - r.other_deductions), 0);
            const ytdTaxPaid = (ytdData || []).reduce((sum, r) => sum + r.withholding_tax, 0);
            const ytdSSO = (ytdData || []).reduce((sum, r) => sum + r.social_security, 0);

            const incomeThisMonth = totalIncomeForTax;
            const currentSSO = socialSecurity;
            const currentMonth = month;
            
            // --- FULL PRO TAX LOGIC ---
            const annualIncome = (incomeThisMonth + ytdIncomeBefore) * (12 / currentMonth);
            const expense = Math.min(annualIncome * 0.5, 100000);
            const allowance = 60000 + Math.min(ytdSSO + currentSSO, ssMax * 12);
            const netIncome = annualIncome - expense - allowance;

            let tax = 0;
            if (netIncome > 5000000) tax += (netIncome - 5000000) * 0.35;
            if (netIncome > 2000000) tax += (Math.min(netIncome, 5000000) - 2000000) * 0.30;
            if (netIncome > 1000000) tax += (Math.min(netIncome, 2000000) - 1000000) * 0.25;
            if (netIncome > 750000)  tax += (Math.min(netIncome, 1000000) - 750000) * 0.20;
            if (netIncome > 500000)  tax += (Math.min(netIncome, 750000) - 500000) * 0.15;
            if (netIncome > 300000)  tax += (Math.min(netIncome, 500000) - 300000) * 0.10;
            if (netIncome > 150000)  tax += (Math.min(netIncome, 300000) - 150000) * 0.05;

            const annualTax = Math.max(tax, 0);
            const remainingMonths = 12 - currentMonth + 1;
            const monthlyTax = Math.max(Math.round((annualTax - ytdTaxPaid) / remainingMonths), 0);

            const netPay = totalIncomeForTax - socialSecurity - monthlyTax;

            await supabase.from('payroll_records').upsert({
                user_id: emp.id, month, year, base_salary: baseSalary,
                working_days: baseWorkingDays, actual_days: actualDays,
                late_count: lateCount, absent_days: absentDays, leave_days: leaveDaysCount,
                ot_hours: 0, ot_amount: otAmount,
                late_deduction: lateDed, absent_deduction: absentDed,
                social_security: socialSecurity, withholding_tax: monthlyTax,
                other_deductions: otherDeductions, other_additions: otherAdditions,
                gross_pay: (grossPay + otAmount + otherAdditions), net_pay: netPay,
                status: 'draft'
            }, { onConflict: 'user_id,month,year' });
        }

        fetchRecords();
        setGenerating(false);
        showToast(t.salaryCalculated || 'คำนวณเงินเดือนเสร็จสิ้น!', 'success');
    };

    const requestConfirmPayroll = async () => {
        const confirmed = await showConfirm({
            title: t.confirmAll || 'ยืนยันข้อมูล',
            message: t.confirmAllSalaries || 'คุณแน่ใจหรือไม่ว่าต้องการยืนยันข้อมูลเงินเดือนทั้งหมด?',
            confirmText: t.confirmAll || 'ยืนยันทั้งหมด',
            type: 'warning'
        });
        
        if (confirmed) confirmPayrollLogic();
    };

    const confirmPayrollLogic = async () => {
        await supabase.from('payroll_records').update({ status: 'confirmed' }).eq('month', month).eq('year', year).eq('status', 'draft');
        fetchRecords();
        showToast(t.success || 'ยืนยันสำเร็จ', 'success');
    };

    const fmt = (n: number) => n.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalNet = records.reduce((s, r) => s + (r.net_pay || 0), 0);
    const totalGross = records.reduce((s, r) => s + (r.gross_pay || 0), 0);

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex gap-3 items-center">
                    <select value={month} onChange={e => setMonth(Number(e.target.value))} className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 text-sm outline-none font-medium">
                        {[t.jan, t.feb, t.mar, t.apr, t.may, t.jun, t.jul, t.aug, t.sep, t.oct, t.nov, t.dec].map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 text-sm outline-none font-medium">
                        {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={requestGeneratePayroll} disabled={generating} className="px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-500 transition flex items-center gap-2 disabled:opacity-50 shadow-sm">
                        <Calculator size={16} /> {generating ? t.calculating : t.calculateSalary}
                    </button>
                    {records.some(r => r.status === 'draft') && (
                        <button onClick={requestConfirmPayroll} className="px-5 py-2.5 bg-emerald-600 rounded-xl text-sm font-bold text-white hover:bg-emerald-500 transition flex items-center gap-2 shadow-sm">
                            <CheckCircle size={16} /> {t.confirmAll}
                        </button>
                    )}
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <p className="text-3xl font-black text-slate-800">{records.length}</p>
                    <p className="text-sm font-bold text-slate-500 mt-1">{t.employees}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <p className="text-3xl font-black text-emerald-600">฿{fmt(totalGross)}</p>
                    <p className="text-sm font-bold text-slate-500 mt-1">{t.grossBase}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <p className="text-3xl font-black text-indigo-600">฿{fmt(totalNet)}</p>
                    <p className="text-sm font-bold text-slate-500 mt-1">{t.netBase}</p>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
                        <th className="p-3">{t.employee}</th><th className="p-3 text-right">{t.salaryHeader}</th><th className="p-3 text-center">{t.presentHeader}</th><th className="p-3 text-center">{t.lateHeader}</th><th className="p-3 text-center">{t.absentHeader}</th><th className="p-3 text-right">{t.lateDeductionHeader}</th><th className="p-3 text-right">{t.absentDeductionHeader}</th><th className="p-3 text-right">{t.ssHeader}</th><th className="p-3 text-right">{t.taxHeader}</th><th className="p-3 text-right">{t.netPayHeader}</th><th className="p-3 text-center">{t.statusHeader}</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {records.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50 transition text-sm">
                                <td className="p-3"><div className="text-sm font-bold text-slate-800">{r.profiles?.first_name} {r.profiles?.last_name}</div><div className="text-xs text-slate-500">{r.profiles?.department}</div></td>
                                <td className="p-3 text-right font-mono text-slate-700">{fmt(r.base_salary)}</td>
                                <td className="p-3 text-center text-slate-700">{r.actual_days}/{r.working_days}</td>
                                <td className="p-3 text-center"><span className={r.late_count > 0 ? 'text-amber-600 font-bold' : 'text-slate-500'}>{r.late_count}</span></td>
                                <td className="p-3 text-center"><span className={r.absent_days > 0 ? 'text-red-600 font-bold' : 'text-slate-500'}>{r.absent_days}</span></td>
                                <td className="p-3 text-right text-red-600 font-mono">{r.late_deduction > 0 ? `-${fmt(r.late_deduction)}` : '-'}</td>
                                <td className="p-3 text-right text-red-600 font-mono">{r.absent_deduction > 0 ? `-${fmt(r.absent_deduction)}` : '-'}</td>
                                <td className="p-3 text-right font-mono text-slate-600">{fmt(r.social_security)}</td>
                                <td className="p-3 text-right font-mono text-slate-600">{fmt(r.withholding_tax)}</td>
                                <td className="p-3 text-right font-black text-emerald-600 font-mono">{fmt(r.net_pay)}</td>
                                <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-md text-[10px] border font-bold ${r.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : r.status === 'paid' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{r.status}</span></td>
                            </tr>
                        ))}
                        {records.length === 0 && <tr><td colSpan={11} className="p-8 text-center text-slate-400 font-bold">{loading ? t.loading : t.noPayrollDataHint}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayrollPage;
