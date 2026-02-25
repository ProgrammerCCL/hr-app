
import { useState, useEffect, useRef } from 'react';
import { Printer, Download, X, Building, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import type { PayrollRecord } from '../../types';

interface PayslipPageProps {
    settings: Record<string, string>;
}

import { useApp } from '../../context/AppContext';

const PayslipPage = ({ settings }: PayslipPageProps) => {
    const { t, lang } = useApp();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [records, setRecords] = useState<PayrollRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
    const [loading, setLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => { fetchRecords(); }, [month, year]);

    const fetchRecords = async () => {
        setLoading(true);
        const { data } = await supabase.from('payroll_records')
            .select('*, profiles(first_name, last_name, department, position, bank_name, bank_account)')
            .eq('month', month).eq('year', year)
            .in('status', ['confirmed', 'paid'])
            .order('created_at');
        if (data) setRecords(data as PayrollRecord[]);
        setLoading(false);
    };

    const fmt = (n: number) => n.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const monthNames = [t.jan, t.feb, t.mar, t.apr, t.may, t.jun, t.jul, t.aug, t.sep, t.oct, t.nov, t.dec];

    const handlePrint = () => {
        if (!printRef.current) return;
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`
            <html><head><title>Payslip</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #333; }
                .payslip { max-width: 700px; margin: 0 auto; border: 2px solid #333; padding: 30px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 24px; }
                .header p { margin: 5px 0; color: #666; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
                .info-item label { font-size: 12px; color: #888; display: block; }
                .info-item span { font-weight: 600; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; font-size: 14px; }
                th { background: #f5f5f5; font-weight: 600; }
                .text-right { text-align: right; }
                .total-row { background: #f0f9ff; font-weight: bold; }
                .net-row { background: #10b981; color: white; font-weight: bold; font-size: 16px; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
                @media print { body { padding: 0; } .no-print { display: none; } }
            </style></head><body>
            ${printRef.current.innerHTML}
            <div class="footer">${t.generatedByHrms}</div>
            <script>window.print();</script>
            </body></html>
        `);
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
            </div>

            {/* Payslip List */}
            <div className="grid grid-cols-2 gap-4">
                {records.map(r => (
                    <div key={r.id} className="glass-panel p-5 hover:bg-white/5 transition cursor-pointer group" onClick={() => setSelectedRecord(r)}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold">{r.profiles?.first_name} {r.profiles?.last_name}</h4>
                                <p className="text-xs text-gray-400">{r.profiles?.department} • {r.profiles?.position}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${r.status === 'paid' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>{r.status}</span>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                            <div>
                                <p className="text-xs text-gray-400">{t.salary}</p>
                                <p className="text-lg font-bold text-emerald-400">฿{fmt(r.net_pay)}</p>
                            </div>
                            <button className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition">{t.viewSlip} →</button>
                        </div>
                    </div>
                ))}
                {records.length === 0 && (
                    <div className="col-span-2 text-center py-10 text-gray-500">
                        <DollarSign size={48} className="mx-auto mb-4 opacity-20" />
                        {loading ? t.loading : t.noPayslipsHint}
                    </div>
                )}
            </div>

            {/* Payslip Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white text-gray-900 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
                            <h3 className="font-bold text-lg">{t.payslipTitle}</h3>
                            <div className="flex gap-2">
                                <button onClick={handlePrint} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-indigo-500"><Printer size={14} /> {t.print}</button>
                                <button onClick={() => setSelectedRecord(null)} className="p-1.5 rounded-lg hover:bg-gray-200"><X size={20} /></button>
                            </div>
                        </div>
                        <div ref={printRef} className="p-6">
                            <div className="payslip">
                                <div className="header">
                                    <h1>{settings.company_name || t.company}</h1>
                                    <p>{t.payslipTitle} {t.forMonth} {monthNames[selectedRecord.month - 1]} {selectedRecord.year}</p>
                                </div>
                                <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                                    <div><label style={{ fontSize: '12px', color: '#888' }}>{t.fullname}</label><br /><span style={{ fontWeight: 600 }}>{selectedRecord.profiles?.first_name} {selectedRecord.profiles?.last_name}</span></div>
                                    <div><label style={{ fontSize: '12px', color: '#888' }}>{t.department}</label><br /><span style={{ fontWeight: 600 }}>{selectedRecord.profiles?.department || '-'}</span></div>
                                    <div><label style={{ fontSize: '12px', color: '#888' }}>{t.position}</label><br /><span style={{ fontWeight: 600 }}>{selectedRecord.profiles?.position || '-'}</span></div>
                                    <div><label style={{ fontSize: '12px', color: '#888' }}>{t.bank}</label><br /><span style={{ fontWeight: 600 }}>{selectedRecord.profiles?.bank_name || '-'} {selectedRecord.profiles?.bank_account || ''}</span></div>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead><tr><th style={{ padding: '8px', border: '1px solid #ddd', background: '#f5f5f5', textAlign: 'left' }}>{t.item}</th><th style={{ padding: '8px', border: '1px solid #ddd', background: '#f5f5f5', textAlign: 'right' }}>{t.income}</th><th style={{ padding: '8px', border: '1px solid #ddd', background: '#f5f5f5', textAlign: 'right' }}>{t.deduction}</th></tr></thead>
                                    <tbody>
                                        <tr><td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.salary}</td><td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{fmt(selectedRecord.base_salary)}</td><td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>-</td></tr>
                                        {selectedRecord.ot_amount > 0 && <tr><td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.otTitle}</td><td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{fmt(selectedRecord.ot_amount)}</td><td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>-</td></tr>}
                                        {selectedRecord.late_deduction > 0 && <tr><td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.lateDeductionHeader} ({selectedRecord.late_count} {t.records})</td><td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>-</td><td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', color: 'red' }}>{fmt(selectedRecord.late_deduction)}</td></tr>}
                                        {selectedRecord.absent_deduction > 0 && <tr><td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.absentDeductionHeader} ({selectedRecord.absent_days} {t.days})</td><td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>-</td><td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', color: 'red' }}>{fmt(selectedRecord.absent_deduction)}</td></tr>}
                                        <tr><td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.ssTitle}</td><td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>-</td><td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{fmt(selectedRecord.social_security)}</td></tr>
                                        <tr><td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.withholdingTaxTitle}</td><td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>-</td><td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{fmt(selectedRecord.withholding_tax)}</td></tr>
                                        <tr style={{ background: '#f0fdf4', fontWeight: 'bold', fontSize: '16px' }}>
                                            <td style={{ padding: '12px 8px', border: '1px solid #ddd' }}>{t.netIncome}</td>
                                            <td colSpan={2} style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'right', color: '#059669' }}>฿{fmt(selectedRecord.net_pay)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                                    <p>{t.workingDays}: {selectedRecord.working_days} {t.days} | {t.presentDays}: {selectedRecord.actual_days} {t.days} | {t.leave}: {selectedRecord.leave_days} {t.days}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayslipPage;
