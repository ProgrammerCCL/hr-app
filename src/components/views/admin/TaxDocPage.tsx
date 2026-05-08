
import { useState, useEffect, useRef } from 'react';
import { FileText, Printer, X, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Profile, PayrollRecord } from '@/types';
import { useApp } from '@/context/AppContext';

interface TaxDocPageProps {
    employees: Profile[];
    settings: Record<string, string>;
}

const TaxDocPage = ({ employees, settings }: TaxDocPageProps) => {
    const { t, lang, showToast } = useApp();
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [taxData, setTaxData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    // Custom Alert Dialog State
    // REMOVED: Using global showToast instead

    const generateTaxDoc = async () => {
        if (!selectedEmployee) {
            showToast(t.selectEmployeeHint || 'กรุณาเลือกพนักงาน', 'error');
            return;
        }
        setLoading(true);
        const { data: records } = await supabase.from('payroll_records')
            .select('*, profiles(first_name, last_name, department, position, tax_id, social_security_id, bank_name, bank_account)')
            .eq('user_id', selectedEmployee).eq('year', year)
            .in('status', ['confirmed', 'paid'])
            .order('month');

        if (!records || records.length === 0) {
            showToast(t.noSalaryDataYear || 'ไม่พบข้อมูลเงินเดือนสำหรับปีที่เลือก', 'error');
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

        const expensesAllowed = Math.min(totalIncome * 0.5, 100000);
        const personalAllowance = 60000;
        const netTaxableIncome = Math.max(0, totalIncome - expensesAllowed - personalAllowance - totalSS);

        const empObj = employees.find(e => e.id === selectedEmployee) || records[0].profiles;
        setTaxData({
            employee: empObj,
            totalIncome,
            totalSS,
            totalTax,
            totalNet,
            monthlyBreakdown,
            months: records.length,
            expensesAllowed,
            personalAllowance,
            netTaxableIncome
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

    const fmt = (n: number) => n.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const monthNames = [t.jan, t.feb, t.mar, t.apr, t.may, t.jun, t.jul, t.aug, t.sep, t.oct, t.nov, t.dec];

    const convertToThaiBahtText = (amount: number): string => {
        if (!amount || amount === 0) return '(ศูนย์บาทถ้วน)';
        const numToWord = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
        const position = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
        const bahtStr = Math.floor(amount).toString();
        const satangStr = Math.round((amount % 1) * 100).toString().padStart(2, '0');
        const parseNum = (str: string) => {
            let res = '';
            for (let i = 0; i < str.length; i++) {
                const digit = parseInt(str[i], 10);
                const pos = str.length - i - 1;
                if (digit === 0) continue;
                if (pos === 0 && digit === 1 && str.length > 1 && str[i - 1] !== '0') res += 'เอ็ด';
                else if (pos === 1 && digit === 1) res += 'สิบ';
                else if (pos === 1 && digit === 2) res += 'ยี่สิบ';
                else res += numToWord[digit] + position[pos];
            }
            return res;
        };
        let text = parseNum(bahtStr) + 'บาท';
        if (satangStr === '00') text += 'ถ้วน';
        else text += parseNum(satangStr) + 'สตางค์';
        return `(${text})`;
    };

    const renderIDBoxes = (val: any) => {
        let rawId = "";
        if (typeof val === 'string') rawId = val;
        else if (val && typeof val === 'object') {
            rawId = val.social_security_id || val.tax_id || val.id || "";
        }

        const cleanId = String(rawId || '').replace(/\D/g, '');
        const digits = cleanId.padEnd(13, ' ');

        const result = [];
        for (let i = 0; i < 13; i++) {
            result.push(
                <div key={i} className="id-digit-box">
                    <span>{digits[i] === ' ' ? '\u00A0' : digits[i]}</span>
                </div>
            );
            if (i === 0 || i === 4 || i === 9 || i === 11) {
                result.push(<span key={`s-${i}`} className="id-separator">-</span>);
            }
        }

        return (
            <div className="id-boxes-row" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '10px' }}>
                {result}
                {!cleanId && <span style={{ color: 'red', fontSize: '10px', marginLeft: '5px' }}>(Missing ID!)</span>}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end bg-white p-6 rounded-2xl border border-slate-300 shadow-sm">
                <div className="w-full lg:w-32">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.taxYear}</label>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:border-indigo-600 outline-none transition-all shadow-sm">
                        {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.employee}</label>
                    <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:border-indigo-600 outline-none transition-all shadow-sm">
                        <option value="">-- {t.selectEmployeeHint} --</option>
                        {employees.filter(e => e.is_active !== false).map(e => (
                            <option key={e.id} value={e.id}>{e.first_name} {e.last_name} — {e.department}</option>
                        ))}
                    </select>
                </div>
                <button onClick={generateTaxDoc} disabled={loading} className="w-full lg:w-auto px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                    {loading ? <Clock size={16} className="animate-spin" /> : <FileText size={16} />}
                    {loading ? t.creating : t.createDoc}
                </button>
            </div>

            {taxData && (
                <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-slate-300 shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h3 className="font-black text-2xl text-slate-800 tracking-tight">{t.taxDocFullTitle}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Internal Preview & Print</p>
                        </div>
                        <button onClick={handlePrint} className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100 active:scale-95">
                            <Printer size={16} strokeWidth={2.5} /> {t.print}
                        </button>
                    </div>

                    <div className="bg-slate-50 p-4 md:p-8 rounded-[2rem] border border-slate-100 overflow-x-auto custom-scrollbar">
                        <div ref={printRef} className="tax-doc-container min-w-[700px]">
                            {/* ... Content stays inside Tax Doc Container ... */}
                            <style>{`
                                .tax-doc-container, .tax-doc-container * {
                                    color: #000000 !important;
                                    border-color: #000000 !important;
                                    background-color: transparent;
                                }
                                .tax-doc-container {
                                    background-color: #ffffff !important;
                                    padding: 20px;
                                }
                                .id-digit-box {
                                    border: 1.5px solid #000000 !important;
                                    width: 18px;
                                    height: 24px;
                                    display: inline-flex !important;
                                    align-items: center;
                                    justify-content: center;
                                    background-color: #ffffff !important;
                                    color: #000000 !important;
                                    font-weight: bold !important;
                                    font-size: 15px !important;
                                }
                                @media print {
                                    body { background: white !important; }
                                }
                            `}</style>
                            <div className="doc doc-print-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '30px', fontSize: '13px', lineHeight: '1.4', fontFamily: '"Sarabun", sans-serif', color: '#000000', backgroundColor: '#ffffff' }}>
                                {/* ... Internal Tax Doc Design ( ऑफिशियल format ) ... */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
                                        ฉบับที่ 1 (สำหรับผู้ถูกหักภาษี ณ ที่จ่าย ใช้แนบพร้อมกับแบบแสดงรายการภาษี)<br />
                                        ฉบับที่ 2 (สำหรับผู้ถูกหักภาษี ณ ที่จ่าย เก็บไว้เป็นหลักฐาน)
                                    </div>
                                    <div style={{ fontSize: '10px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div>เล่มที่ <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', width: '100px' }}></span></div>
                                        <div>เลขที่ <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', width: '100px' }}></span></div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', marginBottom: '5px' }}>
                                    <h1 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' }}>หนังสือรับรองการหักภาษี ณ ที่จ่าย</h1>
                                    <h2 style={{ margin: 0, fontSize: '12px', fontWeight: 'normal' }}>ตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร</h2>
                                </div>

                                <div style={{ border: '1px solid #000' }}>
                                    <div style={{ borderBottom: '1px solid #000', padding: '5px' }}>
                                        <div style={{ display: 'flex', marginBottom: '4px' }}>
                                            <div style={{ width: '160px', fontWeight: 'bold' }}>ผู้มีหน้าที่หักภาษี ณ ที่จ่าย : -</div>
                                            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                                <span style={{ fontWeight: 'bold' }}>เลขประจำตัวผู้เสียภาษีอากร (13 หลัก)*</span>
                                                {renderIDBoxes(settings.company_tax_id || settings.tax_id)}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', marginBottom: '4px', alignItems: 'flex-end' }}>
                                            <div style={{ width: '40px', fontWeight: 'bold' }}>ชื่อ</div>
                                            <div style={{ flex: 1, borderBottom: '1px dotted #000', paddingLeft: '5px' }}>{settings.company_name}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <div style={{ width: '40px', fontWeight: 'bold' }}>ที่อยู่</div>
                                            <div style={{ flex: 1, borderBottom: '1px dotted #000', paddingLeft: '5px' }}>{settings.company_address || ' '}</div>
                                        </div>
                                    </div>

                                    <div style={{ borderBottom: '1px solid #000', padding: '5px' }}>
                                        <div style={{ display: 'flex', marginBottom: '4px' }}>
                                            <div style={{ width: '160px', fontWeight: 'bold' }}>ผู้ถูกหักภาษี ณ ที่จ่าย : -</div>
                                            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                                <span style={{ fontWeight: 'bold' }}>เลขประจำตัวผู้เสียภาษีอากร (13 หลัก)*</span>
                                                {renderIDBoxes(taxData.employee)}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', marginBottom: '4px', alignItems: 'flex-end' }}>
                                            <div style={{ width: '40px', fontWeight: 'bold' }}>ชื่อ</div>
                                            <div style={{ flex: 1, borderBottom: '1px dotted #000', paddingLeft: '5px' }}>{taxData.employee.first_name} {taxData.employee.last_name}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <div style={{ width: '40px', fontWeight: 'bold' }}>ที่อยู่</div>
                                            <div style={{ flex: 1, borderBottom: '1px dotted #000', paddingLeft: '5px' }}>-</div>
                                        </div>
                                    </div>

                                    <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '11px' }}>
                                        <thead style={{ borderBottom: '1px solid #000' }}>
                                            <tr>
                                                <th style={{ borderRight: '1px solid #000', padding: '5px', textAlign: 'center', width: '55%', fontWeight: 'bold' }}>ประเภทเงินได้พึงประเมินที่จ่าย</th>
                                                <th style={{ borderRight: '1px solid #000', padding: '5px', textAlign: 'center', width: '15%', fontWeight: 'bold' }}>วัน เดือน<br />หรือปีภาษี ที่จ่าย</th>
                                                <th style={{ borderRight: '1px solid #000', padding: '5px', textAlign: 'center', width: '15%', fontWeight: 'bold' }}>จำนวนเงินที่จ่าย</th>
                                                <th style={{ padding: '5px', textAlign: 'center', width: '15%', fontWeight: 'bold' }}>ภาษีที่หัก<br />และนำส่งไว้</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={{ borderRight: '1px solid #000', padding: '2px 5px', verticalAlign: 'top' }}>1. เงินเดือน ค่าจ้าง เบี้ยเลี้ยง โบนัส ฯลฯ ตามมาตรา 40 (1)</td>
                                                <td style={{ borderRight: '1px solid #000', padding: '2px 5px', textAlign: 'center', verticalAlign: 'top' }}>31 ธ.ค. {year + 543}</td>
                                                <td style={{ borderRight: '1px solid #000', padding: '2px 5px', textAlign: 'right', verticalAlign: 'top' }}>{fmt(taxData.totalIncome)}</td>
                                                <td style={{ padding: '2px 5px', textAlign: 'right', verticalAlign: 'top' }}>{fmt(taxData.totalTax)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={2} style={{ borderTop: '1px solid #000', borderRight: '1px solid #000', padding: '5px 10px', textAlign: 'right', fontWeight: 'bold' }}>รวมเงินที่จ่ายและภาษีที่หักนำส่ง</td>
                                                <td style={{ borderTop: '1px solid #000', borderRight: '1px solid #000', padding: '5px 10px', textAlign: 'right', fontWeight: 'bold' }}>{fmt(taxData.totalIncome)}</td>
                                                <td style={{ borderTop: '1px solid #000', padding: '5px 10px', textAlign: 'right', fontWeight: 'bold' }}>{fmt(taxData.totalTax)}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ borderTop: '1px solid #000', borderRight: '1px solid #000', padding: '5px 10px', fontWeight: 'bold' }}>รวมเงินภาษีที่หักนำส่ง (ตัวอักษร)</td>
                                                <td colSpan={3} style={{ borderTop: '1px solid #000', padding: '5px 10px', backgroundColor: '#f3f4f6', textAlign: 'center' }}>{convertToThaiBahtText(taxData.totalTax)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div style={{ borderTop: '1px solid #000', padding: '5px' }}>
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '11px' }}>
                                            <div style={{ fontWeight: 'bold' }}>กองทุนประกันสังคม <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', width: '60px', textAlign: 'center' }}> {fmt(taxData.totalSS)} </span> บาท</div>
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid #000', display: 'flex' }}>
                                        <div style={{ width: '38%', borderRight: '1px solid #000', padding: '10px', fontSize: '10px', lineHeight: '1.4' }}>
                                            <span style={{ fontWeight: 'bold' }}>คำเตือน</span> ผู้มีหน้าที่ออกหนังสือรับรองการหักภาษี ณ ที่จ่าย ฝ่าฝืนไม่ปฏิบัติตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร ต้องรับโทษทางอาญาตามมาตรา 35 แห่งประมวลรัษฎากร
                                        </div>
                                        <div style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: '11px' }}>
                                            <p style={{ margin: '0 0 10px 0' }}>ขอรับรองว่าข้อความและตัวเลขดังกล่าวข้างต้นถูกต้องตรงกับความจริงทุกประการ</p>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '5px', marginTop: '15px' }}>
                                                <span>ลงชื่อ</span>
                                                <span style={{ borderBottom: '1px dotted #000', width: '180px', display: 'inline-block' }}></span>
                                                <span>ผู้จ่ายเงิน</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!taxData && (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-300 shadow-sm text-slate-500">
                    <FileText size={80} strokeWidth={1} className="mb-4 opacity-10" />
                    <p className="font-bold tracking-tight">{t.taxDocSelectHint || 'เลือกพนักงานแล้วกด "สร้างเอกสาร" เพื่อออกใบ 50 ทวิ'}</p>
                </div>
            )}

        </div>
    );
};

export default TaxDocPage;
