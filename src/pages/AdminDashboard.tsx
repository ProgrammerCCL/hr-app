
import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Calendar, PieChart, LogOut, CheckCircle, XCircle, MapPin, Clock, FileText, Settings, Building2, Edit3, Save, X, Plus, Trash2, Search, DollarSign, BarChart3, Receipt, FileCheck, Briefcase, UserPlus, Bell, ClipboardEdit, TrendingUp, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, supabaseUrl, supabaseKey } from '../lib/supabase/client';
import { createClient } from '@supabase/supabase-js';
import type { Profile, AttendanceLog, LeaveRequest, Department, CompanySettings, LeaveType, WorkShift, AppNotification } from '../types';
import { useApp } from '../context/AppContext';
import MonthlyReport from './admin/MonthlyReport';
import PayrollPage from './admin/PayrollPage';
import PayslipPage from './admin/PayslipPage';
import KPIPage from './admin/KPIPage';
import TaxDocPage from './admin/TaxDocPage';
import AttendanceManagePage from './admin/AttendanceManagePage';
import ExecDashboard from './admin/ExecDashboard';
import * as XLSX from 'xlsx';
import { SettingsToolbar } from '../components/SettingsToolbar';

// ===== EMPLOYEE EDIT MODAL =====
const EmployeeEditModal = ({ employee, departments, shifts, allEmployees, onSave, onClose }: { employee: Profile; departments: Department[]; shifts: WorkShift[]; allEmployees: Profile[]; onSave: (u: Partial<Profile>) => void; onClose: () => void }) => {
    const { t } = useApp();
    const [form, setForm] = useState({
        first_name: employee.first_name || '', last_name: employee.last_name || '',
        email: employee.email || '',
        role: employee.role || 'employee' as Profile['role'], department: employee.department || '',
        position: employee.position || '', phone: employee.phone || '',
        is_active: employee.is_active !== false,
        base_salary: employee.base_salary || 0,
        bank_name: employee.bank_name || '', bank_account: employee.bank_account || '',
        tax_id: employee.tax_id || '', social_security_id: employee.social_security_id || '',
        employee_code: employee.employee_code || '',
        shift_id: employee.shift_id || '',
        manager_id: employee.manager_id || '',
        start_date: employee.start_date || new Date().toISOString().split('T')[0],
    });
    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="glass-panel w-full max-w-4xl p-6 space-y-4 border border-white/10 animate-fadeIn my-auto">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">{t.editEmployee}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden"><img src={employee.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.email}`} alt="" className="w-full h-full object-cover" /></div>
                            <div><p className="font-medium">{employee.email}</p><p className="text-xs text-gray-400">{t.idHeader}: {employee.employee_code || '-'} | ID: {employee.id.slice(0, 8).toUpperCase()}</p></div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">📧 Email</label>
                            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div><label className="block text-xs text-gray-400 mb-1">🔑 รหัสพนักงาน</label><input value={form.employee_code} onChange={e => setForm({ ...form, employee_code: e.target.value.toUpperCase() })} placeholder="เช่น EMP001" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs text-gray-400 mb-1">ชื่อ</label><input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                            <div><label className="block text-xs text-gray-400 mb-1">นามสกุล</label><input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs text-gray-400 mb-1">Role</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Profile['role'] })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm outline-none"><option value="employee">Employee</option><option value="manager">Manager</option><option value="hr">HR</option><option value="admin">Admin</option></select></div>
                            <div><label className="block text-xs text-gray-400 mb-1">หัวหน้างาน (ผู้อนุมัติขั้น 1)</label><select value={form.manager_id} onChange={e => setForm({ ...form, manager_id: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm outline-none"><option value="">-- ไม่มี --</option>{allEmployees.filter(e => e.id !== employee.id).map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name || ''}</option>)}</select></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs text-gray-400 mb-1">แผนก</label><select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm outline-none"><option value="">--</option>{departments.filter(d => d.is_active).map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</select></div>
                            <div><label className="block text-xs text-gray-400 mb-1">ตำแหน่ง</label><input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs text-gray-400 mb-1">เบอร์โทร</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                            <div><label className="block text-xs text-gray-400 mb-1">⏰ กะการทำงาน</label><select value={form.shift_id} onChange={e => setForm({ ...form, shift_id: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm outline-none"><option value="">-- ไม่กำหนด --</option>{shifts.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs text-gray-400 mb-1">💰 เงินเดือน (บาท)</label><input type="number" value={form.base_salary} onChange={e => setForm({ ...form, base_salary: Number(e.target.value) })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                            <div><label className="block text-xs text-gray-400 mb-1">🏦 ธนาคาร</label><input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="เช่น กสิกร" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">📅 {t.hireDate}</label><input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                            <div><label className="block text-xs text-gray-400 mb-1">เลขบัตรปชช. / Social Security</label><input value={form.social_security_id || ''} onChange={e => setForm({ ...form, social_security_id: e.target.value })} placeholder="เลขบัตรประชาชน 13 หลัก" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">✅ {t.statusHeader}</label><label className="flex items-center gap-2 cursor-pointer h-9"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-sm text-gray-300">{t.active}</span></label></div>
                        </div>
                        <div className="flex gap-3 pt-6">
                            <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition">{t.cancel}</button>
                            <button onClick={() => onSave(form)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold active:scale-95 transition flex items-center justify-center gap-2"><Save size={18} /> {t.save}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===== DEPARTMENT MODAL =====
const DepartmentModal = ({ department, onSave, onClose }: { department?: Department; onSave: (d: { name: string; description: string }) => void; onClose: () => void }) => {
    const { t } = useApp();
    const [name, setName] = useState(department?.name || '');
    const [desc, setDesc] = useState(department?.description || '');
    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md p-6 space-y-4 border border-white/10 animate-fadeIn">
                <div className="flex justify-between items-center"><h3 className="text-xl font-bold">{department ? t.editDepartment : t.addDepartment}</h3><button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button></div>
                <div><label className="block text-xs text-gray-400 mb-1">{t.deptName}</label><input value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none" autoFocus /></div>
                <div><label className="block text-xs text-gray-400 mb-1">{t.deptDesc}</label><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none" /></div>
                <div className="flex gap-3"><button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300">{t.cancel}</button><button onClick={() => { if (name.trim()) onSave({ name: name.trim(), description: desc }); }} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold active:scale-95 transition">{department ? t.save : t.create}</button></div>
            </div>
        </div>
    );
};

// ===== MAIN ADMIN DASHBOARD =====
const AdminDashboard = ({ onNavigate }: { onNavigate: (view: any) => void }) => {
    const { signOut } = useAuth();
    const { t, lang } = useApp();
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminDashboardTab') || 'overview');

    // Save tab to local storage
    useEffect(() => {
        localStorage.setItem('adminDashboardTab', activeTab);
    }, [activeTab]);

    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [showNotifPanel, setShowNotifPanel] = useState(false);

    const [stats, setStats] = useState({ employees: 0, present: 0, onLeave: 0, pending: 0 });
    const [employees, setEmployees] = useState<Profile[]>([]);
    const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [allLeaveRequests, setAllLeaveRequests] = useState<LeaveRequest[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [settings, setSettings] = useState<CompanySettings>({ company_name: 'My Company', work_start_time: '08:30', work_end_time: '17:30', annual_leave_quota: '6', sick_leave_quota: '30', personal_leave_quota: '3', late_threshold_minutes: '15', late_deduction_per_time: '50', absent_deduction_per_day: '0', ot_rate_multiplier: '1.5', social_security_rate: '5', social_security_max: '750' });
    const [, setLoading] = useState(true);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const [newEmp, setNewEmp] = useState({
        email: '', password: '123456', first_name: '', last_name: '', employee_code: '',
        role: 'employee', department: '', position: '', phone: '',
        manager_id: '', shift_id: '', base_salary: 0, bank_name: '',
        bank_account: '', tax_id: '', social_security_id: '',
        start_date: new Date().toISOString().split('T')[0]
    });
    const [addingEmp, setAddingEmp] = useState(false);
    const [newLeaveType, setNewLeaveType] = useState({ name: '', label: '', quota_per_year: 0, is_paid: true, advance_days: 0, allow_retroactive: false });
    const [shifts, setShifts] = useState<WorkShift[]>([]);
    const [newShift, setNewShift] = useState({ name: '', label: '', start_time: '08:30', end_time: '17:30', is_overnight: false, late_threshold_minutes: 15 });

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [leaveFilter, setLeaveFilter] = useState<'pending' | 'all'>('pending');
    const [editingEmployee, setEditingEmployee] = useState<Profile | null>(null);
    const [editingDepartment, setEditingDepartment] = useState<Department | undefined>(undefined);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settingsTab, setSettingsTab] = useState<'general' | 'shifts' | 'leaves' | 'finance'>('general');

    useEffect(() => { fetchAllData(); }, [selectedDate]);

    // === Haversine formula ===
    const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // === Export Daily Distance to Excel ===
    const exportDailyExcel = () => {
        const userLogs: Record<string, AttendanceLog[]> = {};
        attendanceLogs.forEach(log => {
            if (!userLogs[log.user_id]) userLogs[log.user_id] = [];
            userLogs[log.user_id].push(log);
        });

        const rows: any[] = [];
        Object.entries(userLogs).forEach(([userId, logs]) => {
            const sorted = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            const emp = employees.find(e => e.id === userId);
            const empName = emp ? `${emp.first_name} ${emp.last_name || ''}`.trim() : userId;
            let totalDist = 0;

            sorted.forEach((log, idx) => {
                let dist = 0;
                if (idx > 0 && sorted[idx - 1].location_lat && sorted[idx - 1].location_lng && log.location_lat && log.location_lng) {
                    dist = haversine(sorted[idx - 1].location_lat!, sorted[idx - 1].location_lng!, log.location_lat!, log.location_lng!);
                }
                totalDist += dist;
                rows.push({
                    [t.employee]: empName,
                    [t.employeeCode]: emp?.employee_code || '-',
                    [t.time]: new Date(log.timestamp).toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US'),
                    [t.type]: t[log.type as keyof typeof t] || log.type,
                    [t.location]: log.location_name || '-',
                    [t.latitude]: log.location_lat || '-',
                    [t.longitude]: log.location_lng || '-',
                    [t.distPrevPoint]: dist > 0 ? Number(dist.toFixed(2)) : 0,
                });
            });
            // Summary per person
            rows.push({
                [t.employee]: `📊 ${t.summary}: ${empName}`,
                [t.employeeCode]: '',
                [t.time]: '',
                [t.type]: `${sorted.length} ${t.records}`,
                [t.location]: '',
                [t.latitude]: '',
                [t.longitude]: '',
                [t.distPrevPoint]: Number(totalDist.toFixed(2)),
            });
            rows.push({}); // empty row separator
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `${t.distance} ${selectedDate}`);

        // Auto column width
        ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 20 }];

        XLSX.writeFile(wb, `${t.distance}_${selectedDate}.xlsx`);
        alert(`✅ ${t.downloaded}: ${t.distance}_${selectedDate}.xlsx`);
    };

    // === Export Monthly Distance to Excel ===
    const exportMonthlyExcel = async () => {
        const [year, month] = selectedDate.split('-').map(Number);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${endDay}`;

        alert(`📊 ${t.loadingData} ${month}/${year}...\n${t.pleaseWaitPreparingData}`);

        // Fetch all logs for the month
        const { data: monthLogs, error } = await supabase
            .from('attendance_logs')
            .select('*, profiles(first_name, last_name, employee_code)')
            .gte('timestamp', `${startDate}T00:00:00`)
            .lte('timestamp', `${endDate}T23:59:59`)
            .order('timestamp', { ascending: true });

        if (error || !monthLogs) {
            alert(`❌ ${t.error}: ` + (error?.message || 'unknown'));
            return;
        }

        // Group by user, then by date
        const userData: Record<string, { name: string; code: string; dailyLogs: Record<string, AttendanceLog[]> }> = {};
        monthLogs.forEach((log: any) => {
            const uid = log.user_id;
            if (!userData[uid]) {
                userData[uid] = {
                    name: log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name || ''}`.trim() : uid,
                    code: log.profiles?.employee_code || '-',
                    dailyLogs: {}
                };
            }
            const day = log.timestamp.split('T')[0];
            if (!userData[uid].dailyLogs[day]) userData[uid].dailyLogs[day] = [];
            userData[uid].dailyLogs[day].push(log);
        });

        // === Sheet 1: Monthly Summary ===
        const summaryRows: any[] = [];
        let grandTotal = 0;

        Object.entries(userData).forEach(([, user]) => {
            let monthlyTotal = 0;
            const dailyDistances: Record<string, number> = {};

            Object.entries(user.dailyLogs).forEach(([date, logs]) => {
                const sorted = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                let dayDist = 0;
                for (let i = 1; i < sorted.length; i++) {
                    const prev = sorted[i - 1];
                    const curr = sorted[i];
                    if (prev.location_lat && prev.location_lng && curr.location_lat && curr.location_lng) {
                        dayDist += haversine(prev.location_lat, prev.location_lng, curr.location_lat, curr.location_lng);
                    }
                }
                dailyDistances[date] = dayDist;
                monthlyTotal += dayDist;
            });

            // Build row with each day as a column
            const row: any = {
                'พนักงาน': user.name,
                'รหัสพนักงาน': user.code,
            };
            for (let d = 1; d <= endDay; d++) {
                const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                row[`${d}`] = dailyDistances[dateKey] ? Number(dailyDistances[dateKey].toFixed(1)) : '';
            }
            row['รวมทั้งเดือน (กม.)'] = Number(monthlyTotal.toFixed(2));
            row['จำนวนวันทำงาน'] = Object.keys(user.dailyLogs).length;
            summaryRows.push(row);
            grandTotal += monthlyTotal;
        });

        // Add grand total row
        summaryRows.push({});
        const totalRow: any = { 'พนักงาน': '🏢 รวมทั้งทีม', 'รหัสพนักงาน': '' };
        totalRow['รวมทั้งเดือน (กม.)'] = Number(grandTotal.toFixed(2));
        summaryRows.push(totalRow);

        // === Sheet 2: รายละเอียดทั้งหมด ===
        const detailRows: any[] = [];
        Object.entries(userData).forEach(([, user]) => {
            Object.entries(user.dailyLogs).sort().forEach(([date, logs]) => {
                const sorted = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                sorted.forEach((log, idx) => {
                    let dist = 0;
                    if (idx > 0 && sorted[idx - 1].location_lat && sorted[idx - 1].location_lng && log.location_lat && log.location_lng) {
                        dist = haversine(sorted[idx - 1].location_lat!, sorted[idx - 1].location_lng!, log.location_lat!, log.location_lng!);
                    }
                    detailRows.push({
                        'วันที่': date,
                        'พนักงาน': user.name,
                        'รหัส': user.code,
                        'เวลา': new Date(log.timestamp).toLocaleTimeString('th-TH'),
                        'ประเภท': log.type === 'check_in' ? 'เข้างาน' : log.type === 'check_out' ? 'ออกงาน' : log.type === 'site_in' ? 'เข้าไซต์' : 'ออกไซต์',
                        'สถานที่': log.location_name || '-',
                        'ละติจูด': log.location_lat || '',
                        'ลองจิจูด': log.location_lng || '',
                        'ระยะทาง (กม.)': dist > 0 ? Number(dist.toFixed(2)) : 0,
                    });
                });
            });
        });

        // Create workbook
        const wb = XLSX.utils.book_new();

        const ws1 = XLSX.utils.json_to_sheet(summaryRows);
        ws1['!cols'] = [{ wch: 25 }, { wch: 12 }, ...Array(endDay).fill({ wch: 5 }), { wch: 18 }, { wch: 14 }];
        XLSX.utils.book_append_sheet(wb, ws1, 'สรุปรายเดือน');

        const ws2 = XLSX.utils.json_to_sheet(detailRows);
        ws2['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, ws2, 'รายละเอียด');

        const monthNames = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const fileName = `ระยะทาง_${monthNames[month]}${year}.xlsx`;
        XLSX.writeFile(wb, fileName);
        alert(`✅ ดาวน์โหลดแล้ว: ${fileName}\n\n📊 สรุป:\n- พนักงาน: ${Object.keys(userData).length} คน\n- ระยะทางรวม: ${grandTotal.toFixed(1)} กม.\n- จำนวน logs: ${monthLogs.length} รายการ`);
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Try profiles with work_shifts join, fallback to basic
            let empRes = await supabase.from('profiles').select('*, work_shifts(*)');
            if (empRes.error) {
                console.warn('[Admin] work_shifts join failed, using basic query:', empRes.error.message);
                empRes = await supabase.from('profiles').select('*');
            }

            const { data: { user: currentUser } } = await supabase.auth.getUser();
            const { data: currProfile } = await supabase.from('profiles').select('role').eq('id', currentUser?.id).single();
            const isManager = currProfile?.role === 'manager';

            let pendingQuery = supabase.from('leave_requests').select('*, requester:profiles!leave_requests_user_id_fkey(first_name, last_name, avatar_url)');
            if (isManager) {
                pendingQuery = pendingQuery.eq('status', 'pending_manager').eq('approver_id', currentUser?.id).order('created_at', { ascending: false });
            } else {
                pendingQuery = pendingQuery.eq('status', 'pending').order('created_at', { ascending: false });
            }

            const [logRes, leaveRes, allLeaveRes, deptRes, settingsRes, approvedRes, ltRes, shiftRes] = await Promise.all([
                supabase.from('attendance_logs').select('*, profiles(first_name, last_name, avatar_url)').gte('timestamp', `${selectedDate}T00:00:00`).lt('timestamp', `${selectedDate}T23:59:59`).order('timestamp', { ascending: false }),
                pendingQuery,
                supabase.from('leave_requests').select('*, requester:profiles!leave_requests_user_id_fkey(first_name, last_name, avatar_url)').order('created_at', { ascending: false }).limit(100),
                supabase.from('departments').select('*').order('name'),
                supabase.from('company_settings').select('*'),
                supabase.from('leave_requests').select('user_id').eq('status', 'approved').lte('start_date', selectedDate).gte('end_date', selectedDate),
                supabase.from('leave_types').select('*').order('sort_order'),
                supabase.from('work_shifts').select('*').order('sort_order'),
            ]);
            setEmployees(empRes.data || []);
            setAttendanceLogs((logRes.data || []) as AttendanceLog[]);
            setLeaveRequests((leaveRes.data || []) as LeaveRequest[]);
            setAllLeaveRequests((allLeaveRes.data || []) as LeaveRequest[]);
            setDepartments((deptRes.data || []) as Department[]);
            setLeaveTypes((ltRes.data || []) as LeaveType[]);
            setShifts((shiftRes.data || []) as WorkShift[]);

            // === DEBUG: Leave requests ===
            if (leaveRes.error) console.error('[Admin] Leave fetch error:', leaveRes.error);

            if (settingsRes.data && settingsRes.data.length > 0) { const s: any = {}; settingsRes.data.forEach((row: any) => { s[row.key] = row.value; }); setSettings(prev => ({ ...prev, ...s })); }
            const onLeave = approvedRes.data ? new Set(approvedRes.data.map((l: any) => l.user_id)).size : 0;
            const present = new Set(logRes.data?.map(l => l.user_id)).size;
            setStats({ employees: empRes.data?.length || 0, present, onLeave, pending: leaveRes.data?.length || 0 });
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleAddShift = async () => {
        if (!newShift.name || !newShift.label) { alert('กรุณากรอกชื่อกะ'); return; }
        const maxOrder = shifts.length > 0 ? Math.max(...shifts.map(s => s.sort_order)) + 1 : 1;
        const { error } = await supabase.from('work_shifts').insert([{ ...newShift, sort_order: maxOrder, is_active: true }]);
        if (error) { alert('Error: ' + error.message); return; }
        setNewShift({ name: '', label: '', start_time: '08:30', end_time: '17:30', is_overnight: false, late_threshold_minutes: 15 });
        fetchAllData();
    };

    const handleDeleteShift = async (id: string) => {
        if (!confirm('ลบกะนี้?')) return;
        // Check if any employee uses this shift
        const usingCount = employees.filter(e => e.shift_id === id).length;
        if (usingCount > 0) { alert(`ไม่สามารถลบได้ ยังมีพนักงาน ${usingCount} คนใช้กะนี้อยู่`); return; }
        await supabase.from('work_shifts').delete().eq('id', id);
        fetchAllData();
    };

    const handleToggleShift = async (id: string, active: boolean) => {
        await supabase.from('work_shifts').update({ is_active: active }).eq('id', id);
        fetchAllData();
    };

    const handleLeaveAction = async (id: string, status: 'approved' | 'rejected') => {
        if (!confirm(`${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}ใบลานี้?`)) return;

        // Get leave request details first
        const leaveReq = [...leaveRequests, ...allLeaveRequests].find(r => r.id === id);

        const { data: { user: currentUser } } = await supabase.auth.getUser();

        let nextStatus: string = status;
        let isFinalApproval = true;

        if (status === 'approved' && leaveReq?.status === 'pending_manager') {
            nextStatus = 'pending'; // Switch to HR pending
            isFinalApproval = false;
        }

        await supabase.from('leave_requests').update({
            status: nextStatus as any,
            approver_id: currentUser?.id || null
        }).eq('id', id);

        // === Send notification back to employee or HR ===
        if (leaveReq) {
            const { data: approverProfile } = await supabase.from('profiles').select('first_name, last_name').eq('id', currentUser!.id).single();
            const approverName = approverProfile ? `${approverProfile.first_name} ${approverProfile.last_name || ''}`.trim() : 'ผู้อนุมัติ';
            const leaveLabel = leaveReq.leave_type;
            const dateRange = `${new Date(leaveReq.start_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - ${new Date(leaveReq.end_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}`;
            const days = leaveReq.total_days || Math.ceil((new Date(leaveReq.end_date).getTime() - new Date(leaveReq.start_date).getTime()) / 86400000) + 1;

            if (isFinalApproval) {
                await supabase.from('notifications').insert([{
                    user_id: leaveReq.user_id,
                    type: 'leave_response',
                    title: status === 'approved'
                        ? `✅ ใบลาได้รับอนุมัติแล้ว!`
                        : `❌ ใบลาไม่ได้รับอนุมัติ`,
                    message: status === 'approved'
                        ? `${approverName} อนุมัติ${leaveLabel} ${dateRange} (${days} วัน) แล้ว`
                        : `${approverName} ไม่อนุมัติ${leaveLabel} ${dateRange} (${days} วัน)`,
                    related_id: id,
                    created_by: currentUser!.id,
                }]);
            } else {
                // If it was just manager approval, notify HR instead + maybe employee
                await supabase.from('notifications').insert([{
                    user_id: leaveReq.user_id,
                    type: 'leave_response',
                    title: `⏳ ใบลาผ่านการอนุมัติขั้นแรก`,
                    message: `${approverName} อนุมัติเบื้องต้นแล้ว รอ HR อนุมัติในขั้นต่อไป`,
                    related_id: id,
                    created_by: currentUser!.id,
                }]);

                const { data: admins } = await supabase.from('profiles').select('id').in('role', ['admin', 'hr', 'Admin', 'HR']);
                if (admins && admins.length > 0) {
                    const hrNotifications = admins.map((a: any) => ({
                        user_id: a.id,
                        type: 'leave_request',
                        title: `📋 ใบลาผ่านขั้น 1: ${(leaveReq as any).requester?.first_name || 'พนักงาน'}`,
                        message: `${approverName} อนุมัติขั้นแรกแล้ว รอการพิจารณาขั้นสุดท้ายสำหรับใบลา ${dateRange}`,
                        related_id: id,
                        created_by: currentUser!.id,
                    }));
                    await supabase.from('notifications').insert(hrNotifications);
                }
            }
        }

        fetchAllData();
        alert(`${status === 'approved' ? '✅ อนุมัติ' : '❌ ปฏิเสธ'}ใบลาแล้ว! (แจ้งเตือนพนักงานแล้ว)`);
    };
    const handleSaveEmployee = async (updated: Partial<Profile>) => {
        if (!editingEmployee) return;
        // Sanitize: convert empty strings to null for UUID/numeric/optional fields
        const sanitized: any = { ...updated };
        const nullIfEmpty = ['shift_id', 'manager_id', 'employee_code', 'department', 'position', 'phone', 'tax_id', 'social_security_id', 'bank_name', 'bank_account'];
        nullIfEmpty.forEach(key => {
            if (sanitized[key] === '') sanitized[key] = null;
        });
        if (sanitized.base_salary === '' || sanitized.base_salary === 0) sanitized.base_salary = 0;

        // Handle email change separately (requires Admin API)
        const newEmail = sanitized.email;
        const emailChanged = newEmail && newEmail !== editingEmployee.email;
        delete sanitized.email; // Remove from profile update (handle separately)

        // Update profile data
        const { error, count } = await supabase.from('profiles').update(sanitized, { count: 'exact' }).eq('id', editingEmployee.id);
        if (error) { alert('Error: ' + error.message); return; }
        if (count === 0) {
            alert('⚠️ ไม่สามารถบันทึกได้!\n\nสาเหตุ: บัญชีของคุณอาจไม่มีสิทธิ์ Admin\nกรุณาตรวจสอบ role ของบัญชีที่ login อยู่ ต้องเป็น "admin" หรือ "hr"');
            return;
        }

        // Update email if changed
        if (emailChanged) {
            const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
            if (!serviceKey) {
                // Fallback: update email in profiles table only
                await supabase.from('profiles').update({ email: newEmail }).eq('id', editingEmployee.id);
                alert('✅ บันทึกข้อมูลสำเร็จ!\n\n⚠️ อีเมลถูกเปลี่ยนในระบบแล้ว แต่ไม่ได้เปลี่ยน email สำหรับ login\nเพราะยังไม่ได้ตั้งค่า Service Role Key\n\nกรุณาเพิ่ม VITE_SUPABASE_SERVICE_ROLE_KEY ใน .env');
            } else {
                try {
                    // Use Admin API to change auth email
                    const adminClient = createClient(supabaseUrl, serviceKey, {
                        auth: { autoRefreshToken: false, persistSession: false }
                    });
                    const { error: authError } = await adminClient.auth.admin.updateUserById(editingEmployee.id, {
                        email: newEmail,
                        email_confirm: true
                    });

                    if (authError) {
                        // Still update profile email
                        await supabase.from('profiles').update({ email: newEmail }).eq('id', editingEmployee.id);
                        alert(`✅ บันทึกสำเร็จ แต่เปลี่ยน email login ไม่ได้:\n${authError.message}\n\nอีเมลในระบบถูกเปลี่ยนแล้ว แต่ email สำหรับ login ยังเป็นอันเดิม`);
                    } else {
                        // Update profile email too
                        await supabase.from('profiles').update({ email: newEmail }).eq('id', editingEmployee.id);
                        alert(`✅ บันทึกสำเร็จ!\n\n📧 อีเมลเปลี่ยนเป็น: ${newEmail}\n(ทั้ง login และโปรไฟล์)`);
                    }
                } catch (err: any) {
                    await supabase.from('profiles').update({ email: newEmail }).eq('id', editingEmployee.id);
                    alert('✅ บันทึกโปรไฟล์สำเร็จ\n⚠️ แต่เปลี่ยน email login ไม่ได้: ' + err.message);
                }
            }
        } else {
            alert('✅ บันทึกสำเร็จ!');
        }

        setEditingEmployee(null); fetchAllData();
    };
    const handleDeleteEmployee = async (emp: Profile) => {
        // Prevent deleting yourself
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === emp.id) {
            alert('⚠️ ไม่สามารถลบบัญชีตัวเองได้!');
            return;
        }
        const confirmMsg = `🗑️ ลบพนักงาน "${emp.first_name} ${emp.last_name || ''}"?\n\nEmail: ${emp.email}\nรหัส: ${emp.employee_code || '-'}\n\n⚠️ ข้อมูลการเข้างานและใบลาทั้งหมดจะถูกลบด้วย!\nการดำเนินการนี้ไม่สามารถย้อนกลับได้!`;
        if (!confirm(confirmMsg)) return;
        // Double confirm for safety
        if (!confirm('ยืนยันอีกครั้ง: ต้องการลบพนักงานนี้จริงๆ?')) return;
        try {
            // Delete related data first
            await supabase.from('attendance_logs').delete().eq('user_id', emp.id);
            await supabase.from('leave_requests').delete().eq('user_id', emp.id);
            await supabase.from('notifications').delete().eq('user_id', emp.id);
            // Delete profile
            const { error } = await supabase.from('profiles').delete().eq('id', emp.id);
            if (error) { alert('Error: ' + error.message); return; }
            alert(`✅ ลบพนักงาน ${emp.first_name} สำเร็จ!\n\nหมายเหตุ: บัญชี Auth (login) ยังอยู่ใน Supabase\nหากต้องการลบบัญชี login ด้วย ให้ไปลบที่ Supabase Dashboard > Authentication > Users`);
            fetchAllData();
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    };
    const handleSaveDepartment = async (data: { name: string; description: string }) => {
        try {
            let error;
            if (editingDepartment) {
                ({ error } = await supabase.from('departments').update(data).eq('id', editingDepartment.id));
            } else {
                ({ error } = await supabase.from('departments').insert([{ ...data, is_active: true }]));
            }
            if (error) throw error;
            setShowDeptModal(false); setEditingDepartment(undefined); fetchAllData();
            alert('บันทึกแผนกสำเร็จ!');
        } catch (err: any) {
            alert('Error บันทึกแผนก: ' + err.message);
        }
    };
    const handleDeleteDepartment = async (id: string) => {
        if (!confirm('ลบแผนกนี้?')) return;
        const { error } = await supabase.from('departments').delete().eq('id', id);
        if (error) { alert('Error ลบแผนก: ' + error.message); return; }
        fetchAllData();
    };
    const handleSaveSettings = async () => {
        setSettingsSaving(true);
        for (const [key, value] of Object.entries(settings)) { await supabase.from('company_settings').upsert({ key, value, updated_at: new Date().toISOString() }); }
        setSettingsSaving(false); alert('บันทึกสำเร็จ!');
    };

    const handleAddEmployee = async () => {
        if (!newEmp.first_name) { alert('กรุณากรอกชื่อพนักงาน'); return; }
        if (newEmp.password.length < 6) { alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }

        // Auto-generate temp email if not provided
        let finalEmail = newEmp.email.trim();
        if (!finalEmail) {
            const code = newEmp.employee_code?.trim() || newEmp.first_name.toLowerCase().replace(/\s/g, '');
            finalEmail = `${code}@temp.hrms.local`;
        }

        setAddingEmp(true);
        try {
            // Create a separate client so we don't lose admin session
            const tempClient = createClient(
                supabaseUrl,
                supabaseKey
            );
            const { data: authData, error: authError } = await tempClient.auth.signUp({
                email: finalEmail,
                password: newEmp.password,
                options: {
                    data: {
                        role: newEmp.role,
                        first_name: newEmp.first_name,
                        last_name: newEmp.last_name || '',
                        employee_code: newEmp.employee_code?.toUpperCase() || '',
                        department: newEmp.department || '',
                        position: newEmp.position || '',
                    }
                }
            });
            if (authError) throw authError;
            if (authData.user) {
                // Wait for trigger to create profile
                await new Promise(r => setTimeout(r, 2000));

                const updateData = {
                    first_name: newEmp.first_name,
                    last_name: newEmp.last_name,
                    employee_code: newEmp.employee_code.toUpperCase() || null,
                    role: newEmp.role,
                    department: newEmp.department || null,
                    position: newEmp.position || null,
                    start_date: newEmp.start_date || null,
                    phone: newEmp.phone || null,
                    manager_id: newEmp.manager_id || null,
                    shift_id: newEmp.shift_id || null,
                    base_salary: newEmp.base_salary || 0,
                    bank_name: newEmp.bank_name || null,
                    bank_account: newEmp.bank_account || null,
                    tax_id: newEmp.tax_id || null,
                    social_security_id: newEmp.social_security_id || null,
                };

                // Try update with admin client
                const { error: updateError, count } = await supabase
                    .from('profiles')
                    .update(updateData, { count: 'exact' })
                    .eq('id', authData.user.id);

                let roleWarning = '';
                if (updateError) {
                    console.error('[Admin] Profile update error:', updateError.message);
                    roleWarning = `\n\n⚠️ ไม่สามารถอัพเดทข้อมูลได้: ${updateError.message}`;
                } else if (count === 0) {
                    console.warn('[Admin] Profile update: 0 rows affected (RLS blocked?)');
                    roleWarning = `\n\n⚠️ Role อาจไม่ได้เปลี่ยนเป็น "${newEmp.role}"\nกรุณาไปแก้ไข Role ที่หน้ารายชื่อพนักงาน หรือรัน SQL:\nUPDATE profiles SET role = '${newEmp.role}' WHERE id = '${authData.user.id}';`;
                }

                const isTemp = finalEmail.includes('@temp.hrms');
                alert(`✅ สร้างพนักงาน ${newEmp.first_name} สำเร็จ!\nEmail: ${finalEmail}${isTemp ? ' (ชั่วคราว)' : ''}\nรหัสผ่าน: ${newEmp.password}\nRole: ${newEmp.role}\nรหัสพนักงาน: ${newEmp.employee_code || 'ไม่ตั้ง'}${roleWarning}${isTemp ? '\n\n💡 Email เป็นชั่วคราว สามารถแก้ไขภายหลังได้' : ''}`);
            }
            setShowAddEmployee(false);
            setNewEmp({
                email: '', password: '123456', first_name: '', last_name: '', employee_code: '',
                role: 'employee', department: '', position: '', phone: '',
                manager_id: '', shift_id: '', base_salary: 0, bank_name: '',
                bank_account: '', tax_id: '', social_security_id: '',
                start_date: new Date().toISOString().split('T')[0]
            });
            fetchAllData();
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
        setAddingEmp(false);
    };

    const handleUpdateShiftField = async (id: string, field: string, value: any) => {
        await supabase.from('work_shifts').update({ [field]: value }).eq('id', id);
        fetchAllData();
    };

    const handleAddLeaveType = async () => {
        if (!newLeaveType.name || !newLeaveType.label) { alert('กรุณากรอกชื่อประเภทลา'); return; }
        const maxOrder = leaveTypes.length > 0 ? Math.max(...leaveTypes.map(t => t.sort_order)) + 1 : 1;
        const { error } = await supabase.from('leave_types').insert([{ ...newLeaveType, sort_order: maxOrder, is_active: true }]);
        if (error) { alert('Error: ' + error.message); return; }
        setNewLeaveType({ name: '', label: '', quota_per_year: 0, is_paid: true, advance_days: 0, allow_retroactive: false });
        fetchAllData();
    };

    const handleDeleteLeaveType = async (id: string) => {
        if (!confirm('ลบประเภทลานี้?')) return;
        await supabase.from('leave_types').delete().eq('id', id);
        fetchAllData();
    };

    const handleToggleLeaveType = async (id: string, active: boolean) => {
        await supabase.from('leave_types').update({ is_active: active }).eq('id', id);
        fetchAllData();
    };

    const handleUpdateLeaveTypeField = async (id: string, field: string, value: any) => {
        // Handle field mapping to match existing DB columns
        const fieldMap: Record<string, string> = {
            'min_days_advance': 'advance_days',
            'max_days_backdated': 'allow_retroactive' // Temporary hack: treating max backdated as retroactive flag
        };
        const dbField = fieldMap[field] || field;

        // If it's allow_retroactive, convert number to boolean for now
        let dbValue = value;
        if (dbField === 'allow_retroactive') dbValue = Number(value) > 0;

        await supabase.from('leave_types').update({ [dbField]: dbValue }).eq('id', id);
        fetchAllData();
    };

    const handleInitializeDefaultLeaveTypes = async () => {
        if (!confirm('ต้องการเพิ่ม/รีเซ็ตประเภทการลามาตรฐาน 10 ประเภทใช่หรือไม่? (ข้อมูลเดิมจะไม่ถูกลบ แต่จะมีการเพิ่มตัวที่ขาดไป)')) return;

        const defaults = [
            { name: 'sick', label: 'ลาป่วย', quota_per_year: 30, is_paid: true, min_days_advance: 0, max_days_backdated: 2, sort_order: 1 },
            { name: 'personal', label: 'ลากิจ', quota_per_year: 3, is_paid: true, min_days_advance: 3, max_days_backdated: 0, sort_order: 2 },
            { name: 'unpaid_personal', label: 'ลากิจไม่รับค่าจ้าง', quota_per_year: 999, is_paid: false, min_days_advance: 3, max_days_backdated: 0, sort_order: 3 },
            { name: 'annual', label: 'ลาพักร้อน', quota_per_year: 6, is_paid: true, min_days_advance: 3, max_days_backdated: 0, sort_order: 4 },
            { name: 'ordination', label: 'ลาบวช', quota_per_year: 30, is_paid: true, min_days_advance: 30, max_days_backdated: 0, sort_order: 5 },
            { name: 'maternity', label: 'ลาคลอดบุตร', quota_per_year: 30, is_paid: true, min_days_advance: 30, max_days_backdated: 0, sort_order: 6 },
            { name: 'funeral_parents', label: 'ลาชาปณกิจ พ่อ แม่', quota_per_year: 7, is_paid: true, min_days_advance: 0, max_days_backdated: 3, sort_order: 7 },
            { name: 'funeral_relatives', label: 'ลาชาปณกิจ ญาติพี่น้อง', quota_per_year: 3, is_paid: true, min_days_advance: 0, max_days_backdated: 3, sort_order: 8 },
            { name: 'holiday_swap', label: 'ลาสลับวันหยุดแทนที่ทำงานในวันหยุด', quota_per_year: 999, is_paid: true, min_days_advance: 1, max_days_backdated: 0, sort_order: 9 },
            { name: 'sterilization', label: 'ลาทำหมัน', quota_per_year: 7, is_paid: true, min_days_advance: 1, max_days_backdated: 0, sort_order: 10 }
        ];

        for (const item of defaults) {
            await supabase.from('leave_types').upsert(item, { onConflict: 'name' });
        }
        alert('✅ อัปเดตประเภทการลามาตรฐานเรียบร้อยครับ');
        fetchAllData();
    };

    const displayedLeaves = leaveFilter === 'pending' ? leaveRequests : allLeaveRequests;
    const filteredEmployees = employees.filter(emp => { if (!searchQuery) return true; const q = searchQuery.toLowerCase(); return emp.first_name?.toLowerCase().includes(q) || emp.last_name?.toLowerCase().includes(q) || emp.email?.toLowerCase().includes(q) || emp.department?.toLowerCase().includes(q); });

    const navGroups = [
        {
            label: t.navMain, items: [
                { id: 'overview', icon: PieChart, label: t.overview },
                { id: 'employees', icon: Users, label: t.employees },
                { id: 'departments', icon: Building2, label: t.departments },
            ]
        },
        {
            label: t.navTime, items: [
                { id: 'attendance', icon: Calendar, label: t.attendance },
                { id: 'att_manage', icon: ClipboardEdit, label: t.attendanceManage },
                { id: 'leaves', icon: FileText, label: t.leaves, badge: stats.pending },
                { id: 'report', icon: BarChart3, label: t.monthlyReport },
            ]
        },
        {
            label: t.navFinance, items: [
                { id: 'payroll', icon: DollarSign, label: t.payroll },
                { id: 'payslip', icon: Receipt, label: t.payslipAdmin },
                { id: 'tax', icon: FileCheck, label: t.taxDoc },
            ]
        },
        {
            label: t.navPerformance, items: [
                { id: 'kpi', icon: BarChart3, label: t.kpi },
                { id: 'executive', icon: TrendingUp, label: t.executive },
            ]
        },
        {
            label: t.navSettings, items: [
                { id: 'settings', icon: Settings, label: t.settings },
            ]
        },
    ];

    const tabLabels: Record<string, string> = { overview: t.overview, employees: t.employees, departments: t.departments, attendance: t.attendance, att_manage: t.attendanceManage, leaves: t.leaves, report: t.monthlyReport, payroll: t.payroll, payslip: t.payslipAdmin, tax: t.taxDoc, kpi: t.kpi, executive: t.executive, settings: t.settings };

    return (
        <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden font-sans">
            {editingEmployee && <EmployeeEditModal employee={editingEmployee} departments={departments} shifts={shifts} allEmployees={employees} onSave={handleSaveEmployee} onClose={() => setEditingEmployee(null)} />}
            {showDeptModal && <DepartmentModal department={editingDepartment} onSave={handleSaveDepartment} onClose={() => { setShowDeptModal(false); setEditingDepartment(undefined); }} />}

            {/* Sidebar */}
            <aside className="w-60 bg-[#0f172a] border-r border-white/5 p-3 flex flex-col z-30 overflow-y-auto scrollbar-hide">
                <div className="flex items-center gap-3 mb-6 px-2 pt-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30">
                        <LayoutDashboard size={18} />
                    </div>
                    <h1 className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">HR Admin</h1>
                </div>

                {navGroups.map(group => (
                    <div key={group.label} className="mb-4">
                        <p className="text-xs uppercase tracking-wider text-gray-600 px-3 mb-1">{group.label}</p>
                        {group.items.map(item => (
                            <button key={item.id} onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-start gap-2.5 px-3 py-2 rounded-lg text-sm transition-all relative
                                    ${activeTab === item.id ? 'bg-indigo-500/15 text-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full"></div>}
                                <item.icon size={16} />
                                <span className="truncate">{item.label}</span>
                                {'badge' in item && (item as any).badge > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{(item as any).badge}</span>}
                            </button>
                        ))}
                    </div>
                ))}

                <div className="mt-auto border-t border-white/10 pt-3 space-y-1">
                    <button onClick={() => onNavigate('employee-dashboard')} className="w-full flex items-center justify-start gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition text-left"><Briefcase size={16} /><span className="text-left truncate">{t.myDashboard}</span></button>
                    <button onClick={() => signOut()} className="w-full flex items-center justify-start gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition text-left"><LogOut size={16} /><span>{t.signOut}</span></button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto bg-[#0f172a] relative">
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden"><div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]"></div></div>

                <header className="sticky top-0 z-20 border-b border-white/5 px-8 py-4 flex justify-between items-center backdrop-blur-xl bg-[#0f172a]/80">
                    <div><h2 className="text-xl font-bold">{tabLabels[activeTab] || activeTab}</h2><p className="text-xs text-gray-400">{settings.company_name}</p></div>
                    <div className="flex items-center gap-4">
                        <SettingsToolbar />
                        <div className="relative">
                            <button onClick={async () => {
                                const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
                                setNotifications((data || []) as AppNotification[]);
                                setShowNotifPanel(!showNotifPanel);
                            }} className="p-2 rounded-lg hover:bg-white/10 transition relative">
                                <Bell size={20} />
                                {notifications.filter(n => !n.is_read).length > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-xs text-white font-bold rounded-full flex items-center justify-center">{notifications.filter(n => !n.is_read).length}</span>}
                            </button>
                            {showNotifPanel && (
                                <div className="absolute right-0 top-12 w-96 glass-panel border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                                    <div className="p-3 border-b border-white/5 flex justify-between items-center"><span className="font-semibold text-sm">🔔 {t.notifications}</span>
                                        <button onClick={async () => { const unread = notifications.filter(n => !n.is_read).map(n => n.id); if (unread.length > 0) { await supabase.from('notifications').update({ is_read: true }).in('id', unread); setNotifications(prev => prev.map(n => ({ ...n, is_read: true }))); } }} className="text-xs text-indigo-400 hover:underline">{t.readAll}</button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                                        {notifications.length === 0 && <p className="p-6 text-center text-gray-500 text-sm">{t.noNotifications}</p>}
                                        {notifications.map(n => (
                                            <div key={n.id} className={`p-3 hover:bg-white/5 transition cursor-pointer ${!n.is_read ? 'bg-indigo-500/5 border-l-2 border-indigo-500' : ''}`}
                                                onClick={async () => { if (!n.is_read) { await supabase.from('notifications').update({ is_read: true }).eq('id', n.id); setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x)); } }}>
                                                <p className="text-sm font-medium">{n.title}</p>
                                                {n.message && <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>}
                                                <p className="text-xs text-gray-600 mt-1">{new Date(n.created_at).toLocaleString('th-TH')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="p-6 relative z-10">
                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: t.totalEmployees, value: stats.employees, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', tab: 'employees' },
                                    { label: t.presentToday, value: stats.present, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', tab: 'attendance' },
                                    { label: t.onLeaveToday, value: stats.onLeave, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10', tab: 'leaves' },
                                    { label: t.pendingApproval, value: stats.pending, icon: FileText, color: 'text-pink-400', bg: 'bg-pink-500/10', tab: 'leaves' },
                                ].map((s, i) => (
                                    <div key={i} className="glass-panel p-5 flex items-center justify-between hover:-translate-y-1 transition cursor-pointer" onClick={() => setActiveTab(s.tab)}>
                                        <div><p className="text-gray-400 text-xs mb-1">{s.label}</p><h3 className="text-3xl font-bold">{s.value}</h3></div>
                                        <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}><s.icon size={22} /></div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="glass-panel p-5">
                                    <div className="flex justify-between items-center mb-3"><h3 className="font-semibold">{t.recentAttendance}</h3><button onClick={() => setActiveTab('attendance')} className="text-xs text-indigo-400">{t.viewAll}</button></div>
                                    <div className="space-y-2">{attendanceLogs.slice(0, 5).map(log => (
                                        <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden"><img src={log.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user_id}`} alt="" className="w-full h-full object-cover" /></div>
                                            <div className="flex-1"><p className="text-sm font-medium">{log.profiles?.first_name} {log.profiles?.last_name}</p><p className="text-xs text-gray-400 capitalize">{(t as any)[log.type] || log.type.replace('_', ' ')} • {new Date(log.timestamp).toLocaleTimeString()}</p></div>
                                        </div>
                                    ))}{attendanceLogs.length === 0 && <p className="text-gray-500 text-sm text-center py-4">{t.noData}</p>}</div>
                                </div>
                                <div className="glass-panel p-5">
                                    <div className="flex justify-between items-center mb-3"><h3 className="font-semibold">{t.pendingLeaves}</h3><button onClick={() => setActiveTab('leaves')} className="text-xs text-indigo-400">{t.viewAll}</button></div>
                                    <div className="space-y-2">{leaveRequests.slice(0, 5).map(req => (
                                        <div key={req.id} className="p-3 rounded-lg bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden"><img src={(req as any).requester?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user_id}`} alt="" className="w-full h-full object-cover" /></div><div><p className="text-sm font-medium">{req.profiles?.first_name} {req.profiles?.last_name}</p><p className="text-xs text-gray-400 capitalize">{(t as any)[req.leave_type] || req.leave_type}</p></div></div>
                                            <div className="flex gap-2 mt-2"><button onClick={() => handleLeaveAction(req.id, 'approved')} className="flex-1 py-1.5 rounded bg-green-500/10 text-green-400 text-xs hover:bg-green-500/20 transition border border-green-500/20">{t.approve}</button><button onClick={() => handleLeaveAction(req.id, 'rejected')} className="flex-1 py-1.5 rounded bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition border border-red-500/20">{t.reject}</button></div>
                                        </div>
                                    ))}{leaveRequests.length === 0 && <p className="text-gray-500 text-sm text-center py-4">{t.noPendingLeaves}</p>}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* EMPLOYEES */}
                    {activeTab === 'employees' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex justify-between items-center gap-4"><div className="relative flex-1 max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.searchEmployees} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div><div className="flex items-center gap-3"><span className="text-sm text-gray-400">{filteredEmployees.length} {t.persons}</span>                                <button onClick={() => setShowAddEmployee(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2 active:scale-95 shadow-md">
                                <UserPlus size={18} strokeWidth={2.5} /> {t.addEmployee}
                            </button></div></div>
                            <div className="glass-panel overflow-hidden"><table className="w-full text-left border-collapse"><thead><tr className="bg-white/5 border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider"><th className="p-3">{t.name}</th><th className="p-3">{t.idHeader}</th><th className="p-3">{t.roleHeader}</th><th className="p-3">{t.deptHeader}</th><th className="p-3">{t.shiftHeader}</th><th className="p-3 text-right">{t.salaryHeader}</th><th className="p-3 text-center">{t.statusHeader}</th><th className="p-3 text-right">{t.manageHeader}</th></tr></thead>
                                <tbody className="divide-y divide-white/5">{filteredEmployees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-white/5 transition">
                                        <td className="p-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden"><img src={emp.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.email}`} alt="" className="w-full h-full object-cover" /></div><div><div className="text-sm font-medium">{emp.first_name} {emp.last_name}</div><div className="text-xs text-gray-500">{emp.email}</div></div></div></td>
                                        <td className="p-3"><span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{emp.employee_code || '-'}</span></td>
                                        <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded border capitalize ${emp.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : emp.role === 'hr' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : emp.role === 'manager' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>{emp.role}</span></td>
                                        <td className="p-3 text-sm text-gray-400">{emp.department || '-'}</td>
                                        <td className="p-3 text-xs text-gray-400">{emp.work_shifts?.label || <span className="text-gray-600">ไม่กำหนด</span>}</td>
                                        <td className="p-3 text-right text-sm font-mono">{emp.base_salary ? `฿${emp.base_salary.toLocaleString()}` : '-'}</td>
                                        <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-xs border ${emp.is_active !== false ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{emp.is_active !== false ? 'Active' : 'Inactive'}</span></td>
                                        <td className="p-3 text-right"><div className="flex items-center justify-end gap-1.5"><button onClick={() => setEditingEmployee(emp)} className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition" title="แก้ไข"><Edit3 size={14} /></button><button onClick={() => handleDeleteEmployee(emp)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition" title="ลบ"><Trash2 size={14} /></button></div></td>
                                    </tr>
                                ))}</tbody></table></div>
                        </div>
                    )}

                    {/* ATTENDANCE */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex gap-4 items-center justify-between bg-gray-900/50 p-3 rounded-xl border border-white/5">
                                <div className="flex gap-3 items-center">
                                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                                    <span className="text-sm text-gray-400">{new Date(selectedDate + 'T00:00:00').toDateString()}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={exportDailyExcel}
                                        disabled={attendanceLogs.length === 0}
                                        className="px-3 py-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 text-xs font-semibold transition flex items-center gap-1.5 border border-green-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        📥 Excel วันนี้
                                    </button>
                                    <button
                                        onClick={exportMonthlyExcel}
                                        className="px-3 py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold transition flex items-center gap-1.5 border border-blue-500/20"
                                    >
                                        📊 Excel รายเดือน
                                    </button>
                                </div>
                            </div>

                            {/* Distance Summary Cards */}
                            {(() => {
                                // Group logs by user
                                const userLogs: Record<string, AttendanceLog[]> = {};
                                attendanceLogs.forEach(log => {
                                    if (!userLogs[log.user_id]) userLogs[log.user_id] = [];
                                    userLogs[log.user_id].push(log);
                                });

                                // Calculate distance per user
                                const userDistances = Object.entries(userLogs).map(([userId, logs]) => {
                                    const sorted = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                                    let distance = 0;
                                    for (let i = 1; i < sorted.length; i++) {
                                        const prev = sorted[i - 1];
                                        const curr = sorted[i];
                                        if (prev.location_lat && prev.location_lng && curr.location_lat && curr.location_lng) {
                                            const R = 6371;
                                            const dLat = ((curr.location_lat - prev.location_lat) * Math.PI) / 180;
                                            const dLng = ((curr.location_lng - prev.location_lng) * Math.PI) / 180;
                                            const a = Math.sin(dLat / 2) ** 2 + Math.cos((prev.location_lat * Math.PI) / 180) * Math.cos((curr.location_lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
                                            distance += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                        }
                                    }
                                    const emp = employees.find(e => e.id === userId);
                                    return { userId, name: emp ? `${emp.first_name} ${emp.last_name || ''}` : userId, distance, logCount: logs.length };
                                });

                                const totalTeamDistance = userDistances.reduce((sum, u) => sum + u.distance, 0);

                                return userDistances.length > 0 ? (
                                    <div className="space-y-3">
                                        {/* Team total */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="glass-panel p-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">🚗</div>
                                                <div>
                                                    <p className="text-xs text-gray-400">ระยะทางรวมทีม</p>
                                                    <p className="text-lg font-bold text-white">{totalTeamDistance.toFixed(1)} <span className="text-xs text-gray-400">กม.</span></p>
                                                </div>
                                            </div>
                                            <div className="glass-panel p-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">👥</div>
                                                <div>
                                                    <p className="text-xs text-gray-400">พนักงานที่มาวันนี้</p>
                                                    <p className="text-lg font-bold text-white">{userDistances.length} <span className="text-xs text-gray-400">คน</span></p>
                                                </div>
                                            </div>
                                            <div className="glass-panel p-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">📍</div>
                                                <div>
                                                    <p className="text-xs text-gray-400">บันทึกทั้งหมด</p>
                                                    <p className="text-lg font-bold text-white">{attendanceLogs.length} <span className="text-xs text-gray-400">รายการ</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Per-employee distance */}
                                        <div className="glass-panel p-4">
                                            <h3 className="text-sm font-semibold text-gray-300 mb-3">🗺️ ระยะทางรายบุคคล</h3>
                                            <div className="space-y-2">
                                                {userDistances.sort((a, b) => b.distance - a.distance).map(u => (
                                                    <div key={u.userId} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-7 h-7 rounded-full bg-gray-700 overflow-hidden">
                                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.userId}`} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className="text-sm text-white">{u.name}</span>
                                                            <span className="text-xs text-gray-500">({u.logCount} logs)</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 bg-gray-700 rounded-full h-1.5">
                                                                <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${Math.min(100, (u.distance / Math.max(totalTeamDistance, 1)) * 100)}%` }} />
                                                            </div>
                                                            <span className="text-sm font-mono text-indigo-300 min-w-[60px] text-right">{u.distance.toFixed(1)} กม.</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : null;
                            })()}

                            {/* Attendance Log Table */}
                            <div className="glass-panel overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="p-3">{t.employee}</th>
                                            <th className="p-3">{t.time}</th>
                                            <th className="p-3">{t.type}</th>
                                            <th className="p-3">{t.location}</th>
                                            <th className="p-3">GPS</th>
                                            <th className="p-3">{t.photo}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">{attendanceLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-white/5 transition">
                                            <td className="p-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden"><img src={log.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user_id}`} alt="" className="w-full h-full object-cover" /></div><span className="text-sm">{log.profiles?.first_name} {log.profiles?.last_name}</span></div></td>
                                            <td className="p-3 text-sm font-mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                            <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs capitalize border ${log.type === 'check_in' ? 'bg-green-500/10 text-green-400 border-green-500/20' : log.type === 'check_out' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{log.type.replace('_', ' ')}</span></td>
                                            <td className="p-3 text-sm text-gray-300 flex items-center gap-1"><MapPin size={14} className="text-gray-500" />{log.location_name}</td>
                                            <td className="p-3">{log.location_lat && log.location_lng ? (
                                                <a href={`https://www.google.com/maps?q=${log.location_lat},${log.location_lng}`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 font-mono">
                                                    📍 {log.location_lat.toFixed(4)}, {log.location_lng.toFixed(4)}
                                                </a>
                                            ) : <span className="text-xs text-gray-600">-</span>}</td>
                                            <td className="p-3">{log.photo_url && <button onClick={() => { const w = window.open('', '_blank'); if (w) w.document.write(`<img src="${log.photo_url}" style="max-width:100%;height:auto;" />`); }} className="text-xs text-indigo-400 hover:underline">{t.viewPhoto}</button>}</td>
                                        </tr>
                                    ))}{attendanceLogs.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">{t.noData}</td></tr>}</tbody></table></div>
                        </div>
                    )}

                    {/* LEAVES */}
                    {activeTab === 'leaves' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex gap-3">
                                <button onClick={() => setLeaveFilter('pending')} className={`px-4 py-2 rounded-lg text-sm transition ${leaveFilter === 'pending' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{t.pending} ({stats.pending})</button>
                                <button onClick={() => setLeaveFilter('all')} className={`px-4 py-2 rounded-lg text-sm transition ${leaveFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{t.allLeaves}</button>
                            </div>
                            <div className="glass-panel overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="p-3">{t.employee}</th>
                                            <th className="p-3">{t.leaveType}</th>
                                            <th className="p-3">{t.date}</th>
                                            <th className="p-3">{t.reason}</th>
                                            <th className="p-3">{t.status}</th>
                                            <th className="p-3 text-right">{t.manage}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">{displayedLeaves.map(req => (
                                        <tr key={req.id} className="hover:bg-white/5 transition">
                                            <td className="p-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden"><img src={(req as any).requester?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user_id}`} alt="" className="w-full h-full object-cover" /></div><span className="text-sm">{(req as any).requester?.first_name} {(req as any).requester?.last_name}</span></div></td>
                                            <td className="p-3 text-sm capitalize">{req.leave_type}</td>
                                            <td className="p-3 text-sm text-gray-300">{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</td>
                                            <td className="p-3 text-sm text-gray-400 max-w-xs truncate">{req.reason}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-xs border capitalize ${req.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                    {req.status === 'approved' ? t.approved : req.status === 'rejected' ? t.rejected : req.status === 'pending_manager' ? t.pendingManager : t.pendingHR}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">{(req.status === 'pending' || req.status === 'pending_manager') ? <div className="flex justify-end gap-1"><button onClick={() => handleLeaveAction(req.id, 'approved')} className="p-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 transition"><CheckCircle size={16} /></button><button onClick={() => handleLeaveAction(req.id, 'rejected')} className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"><XCircle size={16} /></button></div> : '—'}</td>
                                        </tr>
                                    ))}{displayedLeaves.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">{t.noLeaves}</td></tr>}</tbody></table></div>
                        </div>
                    )}

                    {/* DEPARTMENTS */}
                    {activeTab === 'departments' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex justify-end">
                                <button onClick={() => { setEditingDepartment(undefined); setShowDeptModal(true); }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2 active:scale-95 shadow-md">
                                    <Plus size={18} strokeWidth={2.5} /> {t.addDepartment}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">{departments.map(dept => {
                                const count = employees.filter(e => e.department === dept.name).length;
                                return (<div key={dept.id} className="glass-panel p-5 group hover:bg-white/5 transition"><div className="flex justify-between items-start"><div><div className="flex items-center gap-2 mb-1"><Building2 size={18} className="text-indigo-400" /><h3 className="text-lg font-semibold">{dept.name}</h3></div><p className="text-sm text-gray-400 mb-2">{dept.description || '-'}</p><span className="text-xs text-gray-500 flex items-center gap-1"><Users size={14} /> {count} {t.persons}</span></div><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition"><button onClick={() => { setEditingDepartment(dept); setShowDeptModal(true); }} className="p-2 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"><Edit3 size={14} /></button><button onClick={() => handleDeleteDepartment(dept.id)} className="p-2 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={14} /></button></div></div></div>);
                            })}{departments.length === 0 && <div className="col-span-2 text-center py-10 text-gray-500"><Building2 size={48} className="mx-auto mb-4 opacity-20" /><p>{t.noDepartments}</p></div>}</div>
                        </div>
                    )}

                    {/* MONTHLY REPORT */}
                    {activeTab === 'report' && <MonthlyReport employees={employees} settings={settings} />}

                    {/* PAYROLL */}
                    {activeTab === 'payroll' && <PayrollPage employees={employees} settings={settings} />}

                    {/* PAYSLIP */}
                    {activeTab === 'payslip' && <PayslipPage settings={settings} />}

                    {/* KPI */}
                    {activeTab === 'kpi' && <KPIPage employees={employees} settings={settings} />}

                    {/* ATTENDANCE MANAGE */}
                    {activeTab === 'att_manage' && <AttendanceManagePage employees={employees} />}

                    {/* EXECUTIVE DASHBOARD */}
                    {activeTab === 'executive' && <ExecDashboard employees={employees} settings={settings} />}

                    {/* TAX DOCUMENT */}
                    {activeTab === 'tax' && <TaxDocPage employees={employees} settings={settings} />}

                    {/* SETTINGS */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6 animate-fadeIn max-w-3xl">
                            {/* SETTINGS TABS */}
                            <div className="flex bg-gray-900/50 p-1.5 rounded-xl border border-white/5 shadow-sm">
                                <button onClick={() => setSettingsTab('general')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${settingsTab === 'general' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>ข้อมูลองค์กร</button>
                                <button onClick={() => setSettingsTab('shifts')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${settingsTab === 'shifts' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>กะการทำงาน</button>
                                <button onClick={() => setSettingsTab('leaves')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${settingsTab === 'leaves' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>การลา</button>
                                <button onClick={() => setSettingsTab('finance')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${settingsTab === 'finance' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>การเงิน</button>
                            </div>

                            {/* TAB CONTENT: GENERAL */}
                            {settingsTab === 'general' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="glass-panel p-6"><h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Building2 size={20} className="text-indigo-400" /> {t.companyInfo}</h3>
                                        <div><label className="block text-xs text-gray-400 mb-1">{t.companyName}</label><input value={settings.company_name} onChange={e => setSettings({ ...settings, company_name: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" /></div></div>
                                    <div className="glass-panel p-6"><h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock size={20} className="text-orange-400" /> {t.workHours}</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div><label className="block text-xs text-gray-400 mb-1">{t.workStart}</label><input type="time" value={settings.work_start_time} onChange={e => setSettings({ ...settings, work_start_time: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" /></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">{t.workEnd}</label><input type="time" value={settings.work_end_time} onChange={e => setSettings({ ...settings, work_end_time: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" /></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">{t.lateThreshold}</label><input type="number" value={settings.late_threshold_minutes} onChange={e => setSettings({ ...settings, late_threshold_minutes: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" /></div>
                                        </div></div>
                                </div>
                            )}

                            {/* TAB CONTENT: WORK SHIFTS */}
                            {settingsTab === 'shifts' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="glass-panel p-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock size={20} className="text-cyan-400" /> {t.workShifts}</h3>
                                        <div className="space-y-3 mb-4">
                                            {shifts.map(s => (
                                                <div key={s.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <label className="relative inline-flex cursor-pointer">
                                                            <input type="checkbox" checked={s.is_active} onChange={e => handleToggleShift(s.id, e.target.checked)} className="sr-only peer" />
                                                            <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                                                        </label>
                                                        <div>
                                                            <input
                                                                value={s.label}
                                                                onChange={e => handleUpdateShiftField(s.id, 'label', e.target.value)}
                                                                className={`bg-transparent border-none p-0 font-medium text-sm focus:ring-0 focus:outline-none w-full ${s.is_active ? 'text-white' : 'text-gray-500 line-through'}`}
                                                            />
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-xs text-gray-500">⏰</span>
                                                                    <input type="time" value={s.start_time.slice(0, 5)} onChange={e => handleUpdateShiftField(s.id, 'start_time', e.target.value)} className="bg-black/20 border border-white/5 rounded px-1 text-xs text-cyan-300" />
                                                                    <span className="text-xs text-gray-500">-</span>
                                                                    <input type="time" value={s.end_time.slice(0, 5)} onChange={e => handleUpdateShiftField(s.id, 'end_time', e.target.value)} className="bg-black/20 border border-white/5 rounded px-1 text-xs text-cyan-300" />
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-xs text-gray-400">สาย:</span>
                                                                    <input type="number" value={s.late_threshold_minutes} onChange={e => handleUpdateShiftField(s.id, 'late_threshold_minutes', Number(e.target.value))} className="w-8 bg-black/20 border border-white/5 rounded px-1 text-xs text-cyan-300" />
                                                                    <span className="text-xs text-gray-400">นาที</span>
                                                                </div>
                                                                <label className="flex items-center gap-1 cursor-pointer">
                                                                    <input type="checkbox" checked={s.is_overnight} onChange={e => handleUpdateShiftField(s.id, 'is_overnight', e.target.checked)} className="w-3 h-3 rounded bg-black/20" />
                                                                    <span className="text-xs text-yellow-400/80">ข้ามคืน</span>
                                                                </label>
                                                                <span className="text-xs text-gray-500">| พนักงาน: {employees.filter(e => e.shift_id === s.id).length} คน</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleDeleteShift(s.id)} className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                            {shifts.length === 0 && <p className="text-gray-500 text-sm text-center py-4">ยังไม่มีกะ — กรุณา Run SQL migration v4</p>}
                                        </div>
                                        <div className="border-t border-white/10 pt-4">
                                            <p className="text-sm font-semibold mb-3">➕ เพิ่มกะใหม่</p>
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div><label className="block text-xs text-gray-400 mb-1">Key (อังกฤษ)</label><input value={newShift.name} onChange={e => setNewShift({ ...newShift, name: e.target.value.toLowerCase().replace(/\s/g, '_') })} placeholder="early_morning" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                                <div><label className="block text-xs text-gray-400 mb-1">ชื่อแสดง</label><input value={newShift.label} onChange={e => setNewShift({ ...newShift, label: e.target.value })} placeholder="กะเช้า (06:00-15:00)" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-3 mb-3">
                                                <div><label className="block text-xs text-gray-400 mb-1">เริ่ม</label><input type="time" value={newShift.start_time} onChange={e => setNewShift({ ...newShift, start_time: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                                <div><label className="block text-xs text-gray-400 mb-1">เลิก</label><input type="time" value={newShift.end_time} onChange={e => setNewShift({ ...newShift, end_time: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                                <div><label className="block text-xs text-gray-400 mb-1">สาย (นาที)</label><input type="number" value={newShift.late_threshold_minutes} onChange={e => setNewShift({ ...newShift, late_threshold_minutes: Number(e.target.value) })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                                <div className="flex items-end"><button onClick={handleAddShift} className="w-full px-4 py-2 bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 transition flex items-center justify-center gap-2"><Plus size={16} /> เพิ่มกะ</button></div>
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newShift.is_overnight} onChange={e => setNewShift({ ...newShift, is_overnight: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-xs text-gray-400">🌙 กะข้ามคืน (เช่น 22:00-07:00)</span></label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB CONTENT: LEAVES */}
                            {settingsTab === 'leaves' && (
                                <div className="glass-panel p-6 animate-fadeIn">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2"><FileText size={20} className="text-emerald-400" /> ประเภทการลา</h3>
                                        <button
                                            onClick={handleInitializeDefaultLeaveTypes}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-black rounded-xl hover:shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md uppercase tracking-wider"
                                        >
                                            <PlusCircle size={16} strokeWidth={2.5} /> ใส่ประเภทการลามาตรฐานทั้งหมด (10 อย่าง)
                                        </button>
                                    </div>
                                    <div className="space-y-3 mb-4">
                                        {leaveTypes.map(lt => (
                                            <div key={lt.id} className={`flex items-start justify-between p-4 bg-white/5 dark:bg-gray-800/40 rounded-xl border ${lt.is_active ? 'border-indigo-500/30 shadow-sm' : 'border-gray-200 dark:border-white/5 opacity-80'} transition-all`}>
                                                <div className="flex gap-4 w-full">
                                                    <label className="inline-flex items-center cursor-pointer shrink-0 mt-1">
                                                        <input type="checkbox" checked={lt.is_active} onChange={e => handleToggleLeaveType(lt.id, e.target.checked)} className="sr-only peer" />
                                                        <div className="relative w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                    </label>
                                                    <div className="flex-1 min-w-0">
                                                        <input
                                                            value={lt.label}
                                                            onChange={e => handleUpdateLeaveTypeField(lt.id, 'label', e.target.value)}
                                                            className={`bg-transparent border-none p-0 font-bold text-base focus:ring-0 focus:outline-none w-full ${lt.is_active ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 line-through'}`}
                                                            placeholder="ชื่อประเภทลา"
                                                        />
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mt-3">
                                                            <div className="flex items-center shrink-0 w-full md:w-auto md:min-w-[150px]">
                                                                <span className="text-xs text-gray-500 font-mono whitespace-nowrap">key: <span className="text-gray-700 dark:text-gray-300">{lt.name}</span></span>
                                                            </div>
                                                            <div className="flex items-center flex-wrap gap-x-4 gap-y-3 bg-gray-50/50 dark:bg-black/10 p-2 sm:p-0 sm:bg-transparent dark:sm:bg-transparent rounded-lg">
                                                                <label className="flex items-center gap-2 shrink-0">
                                                                    <span className="text-xs font-medium text-gray-500">โควตา:</span>
                                                                    <input
                                                                        type="number"
                                                                        value={lt.quota_per_year}
                                                                        onChange={e => handleUpdateLeaveTypeField(lt.id, 'quota_per_year', Number(e.target.value))}
                                                                        className="w-14 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-2 py-1 text-xs text-gray-700 dark:text-indigo-300 focus:outline-none focus:border-indigo-500 text-center"
                                                                    />
                                                                </label>
                                                                <label className="flex items-center gap-2 shrink-0">
                                                                    <span className="text-xs font-medium text-gray-500">ล่วงหน้า:</span>
                                                                    <input
                                                                        type="number"
                                                                        value={lt.advance_days || 0}
                                                                        onChange={e => handleUpdateLeaveTypeField(lt.id, 'advance_days', Number(e.target.value))}
                                                                        className="w-14 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-2 py-1 text-xs text-gray-700 dark:text-indigo-300 focus:outline-none focus:border-indigo-500 text-center"
                                                                    />
                                                                </label>
                                                                <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                                                                    <span className="text-xs font-medium text-gray-500 whitespace-nowrap">ย้อนหลัง:</span>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={lt.allow_retroactive}
                                                                        onChange={e => handleUpdateLeaveTypeField(lt.id, 'allow_retroactive', e.target.checked)}
                                                                        className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                                    />
                                                                </label>
                                                                <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={lt.is_paid}
                                                                        onChange={e => handleUpdateLeaveTypeField(lt.id, 'is_paid', e.target.checked)}
                                                                        className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                                    />
                                                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">ได้เงิน</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteLeaveType(lt.id)} className="ml-4 p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors shrink-0 outline-none"><Trash2 size={16} /></button>
                                            </div>
                                        ))}
                                        {leaveTypes.length === 0 && <p className="text-gray-500 text-sm text-center py-4">ยังไม่มีประเภทลา — กรุณา Run SQL migration v3</p>}
                                    </div>
                                    <div className="border-t border-white/10 pt-4">
                                        <p className="text-sm font-semibold mb-3">➕ เพิ่มประเภทลาใหม่</p>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div><label className="block text-xs text-gray-400 mb-1">Key (อังกฤษ)</label><input value={newLeaveType.name} onChange={e => setNewLeaveType({ ...newLeaveType, name: e.target.value.toLowerCase().replace(/\s/g, '_') })} placeholder="wedding" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                                <div><label className="block text-xs text-gray-400 mb-1">ชื่อแสดง (ไทย)</label><input value={newLeaveType.label} onChange={e => setNewLeaveType({ ...newLeaveType, label: e.target.value })} placeholder="ลาแต่งงาน" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div><label className="block text-xs text-gray-400 mb-1">โควตา วัน/ปี</label><input type="number" value={newLeaveType.quota_per_year} onChange={e => setNewLeaveType({ ...newLeaveType, quota_per_year: Number(e.target.value) })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                                <div><label className="block text-xs text-gray-400 mb-1">ล่วงหน้า (วัน)</label><input type="number" value={newLeaveType.advance_days} onChange={e => setNewLeaveType({ ...newLeaveType, advance_days: Number(e.target.value) })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                                <div className="flex flex-col justify-center">
                                                    <label className="block text-xs text-gray-400 mb-1">ย้อนหลัง</label>
                                                    <label className="flex items-center gap-2 cursor-pointer py-1 md:py-2">
                                                        <input type="checkbox" checked={newLeaveType.allow_retroactive} onChange={e => setNewLeaveType({ ...newLeaveType, allow_retroactive: e.target.checked })} className="w-4 h-4 rounded" />
                                                        <span className="text-xs text-gray-400 whitespace-nowrap">อนุญาตย้อนหลัง</span>
                                                    </label>
                                                </div>
                                                <div className="flex items-end col-span-2 sm:col-span-1"><button onClick={handleAddLeaveType} className="w-full px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"><Plus size={18} strokeWidth={2.5} /> {t.add || 'เพิ่ม'}</button></div>
                                            </div>
                                        </div>
                                        <label className="flex items-center gap-2 mt-3 cursor-pointer"><input type="checkbox" checked={newLeaveType.is_paid} onChange={e => setNewLeaveType({ ...newLeaveType, is_paid: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-xs text-gray-400">ลาได้เงิน (Paid Leave)</span></label>
                                    </div>
                                </div>
                            )}

                            {/* TAB CONTENT: FINANCE */}
                            {settingsTab === 'finance' && (
                                <div className="glass-panel p-6 animate-fadeIn"><h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><DollarSign size={20} className="text-yellow-400" /> การเงิน</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-xs text-gray-400 mb-1">หักสาย (บาท/ครั้ง)</label><input type="number" value={settings.late_deduction_per_time} onChange={e => setSettings({ ...settings, late_deduction_per_time: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" /></div>
                                        <div><label className="block text-xs text-gray-400 mb-1">OT Multiplier</label><input type="number" step="0.1" value={settings.ot_rate_multiplier} onChange={e => setSettings({ ...settings, ot_rate_multiplier: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" /></div>
                                        <div><label className="block text-xs text-gray-400 mb-1">ประกันสังคม (%)</label><input type="number" value={settings.social_security_rate} onChange={e => setSettings({ ...settings, social_security_rate: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" /></div>
                                        <div><label className="block text-xs text-gray-400 mb-1">ปกส. สูงสุด (บาท)</label><input type="number" value={settings.social_security_max} onChange={e => setSettings({ ...settings, social_security_max: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" /></div>
                                    </div></div>
                            )}
                            <button onClick={handleSaveSettings} disabled={settingsSaving} className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-white shadow-lg shadow-indigo-900/20 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"><Save size={20} /> {settingsSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</button>
                        </div>
                    )}

                    {/* ADD EMPLOYEE MODAL */}
                    {showAddEmployee && (
                        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                            <div className="glass-panel w-full max-w-4xl p-6 space-y-4 border border-white/10 animate-fadeIn my-auto">
                                <div className="flex justify-between items-center"><h3 className="text-xl font-bold flex items-center gap-2"><UserPlus size={22} className="text-indigo-400" /> เพิ่มพนักงานใหม่</h3><button onClick={() => setShowAddEmployee(false)} className="text-gray-400 hover:text-white"><X size={24} /></button></div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className="block text-xs text-gray-400 mb-1">📧 Email <span className="text-gray-600">(เว้นว่างเพื่อสร้างออโต้)</span></label><input value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} placeholder="ว่างได้" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">🔒 รหัสผ่าน *</label><input type="password" value={newEmp.password} onChange={e => setNewEmp({ ...newEmp, password: e.target.value })} placeholder="รหัสผ่าน" className={`w-full bg-gray-900/50 border rounded-lg p-2 text-white text-sm focus:outline-none ${newEmp.password && newEmp.password.length < 6 ? 'border-red-500' : 'border-gray-700 focus:border-indigo-500'}`} /></div>
                                        </div>
                                        {!newEmp.email && <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2"><p className="text-blue-300 text-xs text-center">💡 ระบบจะสร้าง Email อัตโนมัติให้</p></div>}
                                        <div><label className="block text-xs text-gray-400 mb-1">🔑 รหัสพนักงาน</label><input value={newEmp.employee_code} onChange={e => setNewEmp({ ...newEmp, employee_code: e.target.value.toUpperCase() })} placeholder="เช่น EMP001" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className="block text-xs text-gray-400 mb-1">ชื่อ *</label><input value={newEmp.first_name} onChange={e => setNewEmp({ ...newEmp, first_name: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">นามสกุล</label><input value={newEmp.last_name} onChange={e => setNewEmp({ ...newEmp, last_name: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className="block text-xs text-gray-400 mb-1">Role</label><select value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-white text-sm outline-none"><option value="employee">Employee</option><option value="manager">Manager</option><option value="hr">HR</option><option value="admin">Admin</option></select></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">หัวหน้างาน (ผู้อนุมัติขั้น 1)</label><select value={newEmp.manager_id} onChange={e => setNewEmp({ ...newEmp, manager_id: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-white text-sm outline-none"><option value="">-- ไม่มี --</option>{employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name || ''}</option>)}</select></div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className="block text-xs text-gray-400 mb-1">แผนก</label><select value={newEmp.department} onChange={e => setNewEmp({ ...newEmp, department: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-white text-sm outline-none"><option value="">--</option>{departments.filter(d => d.is_active).map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</select></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">ตำแหน่ง</label><input value={newEmp.position} onChange={e => setNewEmp({ ...newEmp, position: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className="block text-xs text-gray-400 mb-1">เบอร์โทร</label><input value={newEmp.phone} onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">⏰ กะการทำงาน</label><select value={newEmp.shift_id} onChange={e => setNewEmp({ ...newEmp, shift_id: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-white text-sm outline-none"><option value="">-- ไม่กำหนด --</option>{shifts.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className="block text-xs text-gray-400 mb-1">💰 เงินเดือน (บาท)</label><input type="number" value={newEmp.base_salary} onChange={e => setNewEmp({ ...newEmp, base_salary: Number(e.target.value) })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">🏦 ธนาคาร</label><input value={newEmp.bank_name} onChange={e => setNewEmp({ ...newEmp, bank_name: e.target.value })} placeholder="เช่น กสิกร" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className="block text-xs text-gray-400 mb-1">📅 {t.hireDate}</label><input type="date" value={newEmp.start_date} onChange={e => setNewEmp({ ...newEmp, start_date: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">Social Security ID</label><input value={newEmp.social_security_id} onChange={e => setNewEmp({ ...newEmp, social_security_id: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                                        </div>
                                        <div className="flex gap-3 pt-4">
                                            <button onClick={() => setShowAddEmployee(false)} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition">ยกเลิก</button>
                                            <button onClick={handleAddEmployee} disabled={addingEmp} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 shadow-lg">
                                                <UserPlus size={20} strokeWidth={2.5} /> {addingEmp ? 'กำลังสร้าง...' : 'สร้างพนักงาน'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
