
import { useState, useEffect, useRef } from 'react';
import { FileText, Printer, X, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import type { Profile, PayrollRecord } from '../../types';
import { useApp } from '../../context/AppContext';

interface TaxDocPageProps {
    employees: Profile[];
    settings: Record<string, string>;
}

const TaxDocPage = ({ employees, settings }: TaxDocPageProps) => {
    const { t, lang } = useApp();
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [taxData, setTaxData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const generateTaxDoc = async () => {
        if (!selectedEmployee) { alert(t.selectEmployeeHint); return; }
        setLoading(true);
        const { data: records } = await supabase.from('payroll_records')
            .select('*, profiles(first_name, last_name, department, position, tax_id, social_security_id, bank_name, bank_account)')
            .eq('user_id', selectedEmployee).eq('year', year)
            .in('status', ['confirmed', 'paid'])
            .order('month');

        if (!records || records.length === 0) {
            alert(t.noSalaryDataYear);
            setLoading(false);
            return;
        }

        const totalIncome = records.reduce((s: number, r: any) => s + (r.gross_pay || 0), 0);
        const totalSS = records.reduce((s: number, r: any) => s + (r.social_security || 0), 0);
        const totalTax = records.reduce((s: number, r: any) => s + (r.withholding_tax || 0), 0);
        const totalNet = records.reduce((s: number, r: any) => s + (r.net_pay || 0), 0);
        const monthlyBreakdown = records.map((r: any) => ({
            month: r.month,
            gross: r.gross_pay,
            ss: r.social_security,
            tax: r.withholding_tax,
            net: r.net_pay
        }));

        setTaxData({
            employee: records[0].profiles,
            totalIncome,
            totalSS,
            totalTax,
            totalNet,
            monthlyBreakdown,
            months: records.length
        });
        setLoading(false);
    };

    const handlePrint = () => {
        if (!printRef.current) return;
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`
            <html><head><title>${t.taxDocFullTitle}</title>
            <style>
                body { font-family: 'Sarabun', 'Segoe UI', sans-serif; padding: 40px; color: #333; font-size: 14px; }
                .doc { max-width: 700px; margin: 0 auto; border: 2px solid #333; padding: 30px; }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 20px; }
                .header h2 { margin: 5px 0; font-size: 16px; font-weight: normal; }
                .section { margin: 15px 0; }
                .section h3 { font-size: 14px; background: #f5f5f5; padding: 5px 10px; margin: 0 0 10px 0; }
                .row { display: flex; justify-content: space-between; padding: 4px 10px; }
                .row.total { border-top: 2px solid #333; font-weight: bold; font-size: 16px; padding-top: 10px; margin-top: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { padding: 6px 8px; border: 1px solid #ddd; font-size: 12px; }
                th { background: #f5f5f5; }
                .text-right { text-align: right; }
                .signature { margin-top: 40px; display: flex; justify-content: space-between; }
                .sig-box { text-align: center; width: 200px; }
                .sig-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 5px; }
                @media print { body { padding: 0; } }
            </style></head><body>
            ${printRef.current.innerHTML}
            <script>window.print();</script>
            </body></html>
        `);
    };

    const fmt = (n: number) => n.toLocaleString(lang === 'th' ? 'th-TH' : lang === 'ja' ? 'ja-JP' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const monthNames = [t.jan, t.feb, t.mar, t.apr, t.may, t.jun, t.jul, t.aug, t.sep, t.oct, t.nov, t.dec];

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex gap-4 items-end bg-gray-900/50 p-4 rounded-xl border border-white/5">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">{t.taxYear}</label>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-400 mb-1">{t.employee}</label>
                    <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        <option value="">-- {t.selectEmployeeHint} --</option>
                        {employees.filter(e => e.is_active !== false).map(e => (
                            <option key={e.id} value={e.id}>{e.first_name} {e.last_name} — {e.department}</option>
                        ))}
                    </select>
                </div>
                <button onClick={generateTaxDoc} disabled={loading} className="px-4 py-2 bg-indigo-600 rounded-lg text-sm hover:bg-indigo-500 transition flex items-center gap-2 disabled:opacity-50">
                    <FileText size={16} /> {loading ? t.creating : t.createDoc}
                </button>
            </div>

            {taxData && (
                <div className="glass-panel p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">{t.taxDocFullTitle}</h3>
                        <button onClick={handlePrint} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-indigo-500"><Printer size={14} /> {t.print}</button>
                    </div>

                    <div ref={printRef}>
                        <div className="doc" style={{ maxWidth: '700px', margin: '0 auto', padding: '30px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <h1 style={{ margin: 0, fontSize: '18px' }}>{t.taxDocFullTitle}</h1>
                                <h2 style={{ margin: '5px 0', fontSize: '14px', fontWeight: 'normal' }}>{t.taxDocSubTitle}</h2>
                                <p style={{ fontSize: '12px', color: '#666' }}>{t.taxYear} {year}</p>
                            </div>

                            <div style={{ margin: '15px 0', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                                <p style={{ margin: '3px 0' }}><strong>{t.payer}:</strong> {settings.company_name || t.company}</p>
                            </div>

                            <div style={{ margin: '15px 0', padding: '10px', background: '#f0f9ff', borderRadius: '4px' }}>
                                <p style={{ margin: '3px 0' }}><strong>{t.payee}:</strong> {taxData.employee.first_name} {taxData.employee.last_name}</p>
                                <p style={{ margin: '3px 0', fontSize: '12px' }}>{t.department}: {taxData.employee.department || '-'} | {t.position}: {taxData.employee.position || '-'}</p>
                                <p style={{ margin: '3px 0', fontSize: '12px' }}>{t.taxPayerId}: {taxData.employee.tax_id || t.notSpecified}</p>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '6px 8px', border: '1px solid #ddd', background: '#f5f5f5', fontSize: '12px' }}>{t.date}</th>
                                        <th style={{ padding: '6px 8px', border: '1px solid #ddd', background: '#f5f5f5', fontSize: '12px', textAlign: 'right' }}>{t.incomeHeader}</th>
                                        <th style={{ padding: '6px 8px', border: '1px solid #ddd', background: '#f5f5f5', fontSize: '12px', textAlign: 'right' }}>{t.ssTitle}</th>
                                        <th style={{ padding: '6px 8px', border: '1px solid #ddd', background: '#f5f5f5', fontSize: '12px', textAlign: 'right' }}>{t.withholdingTaxTitle}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {taxData.monthlyBreakdown.map((m: any) => (
                                        <tr key={m.month}>
                                            <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontSize: '12px' }}>{monthNames[m.month - 1]}</td>
                                            <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontSize: '12px', textAlign: 'right' }}>{fmt(m.gross)}</td>
                                            <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontSize: '12px', textAlign: 'right' }}>{fmt(m.ss)}</td>
                                            <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontSize: '12px', textAlign: 'right' }}>{fmt(m.tax)}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ fontWeight: 'bold', background: '#f5f5f5' }}>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.totalYearly} ({taxData.months} {t.month})</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{fmt(taxData.totalIncome)}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{fmt(taxData.totalSS)}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{fmt(taxData.totalTax)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ textAlign: 'center', width: '200px' }}>
                                    <div style={{ borderTop: '1px solid #333', marginTop: '60px', paddingTop: '5px', fontSize: '12px' }}>{t.payerSignature}</div>
                                </div>
                                <div style={{ textAlign: 'center', width: '200px' }}>
                                    <div style={{ borderTop: '1px solid #333', marginTop: '60px', paddingTop: '5px', fontSize: '12px' }}>{t.date}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!taxData && (
                <div className="text-center py-16 text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p>{t.taxDocSelectHint}</p>
                </div>
            )}
        </div>
    );
};

export default TaxDocPage;
