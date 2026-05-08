'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Calendar, PieChart, LogOut, CheckCircle, XCircle, MapPin, Clock, FileText, Settings, Building2, Edit3, Save, X, Plus, Trash2, Search, DollarSign, BarChart3, Receipt, FileCheck, Briefcase, UserPlus, Bell, ClipboardEdit, TrendingUp, PlusCircle, Menu, CalendarDays, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, supabaseUrl, supabaseKey } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';
import type { Profile, AttendanceLog, LeaveRequest, Department, CompanySettings, LeaveType, WorkShift, AppNotification } from '@/types';
import { useApp } from '@/context/AppContext';
import MonthlyReport from './admin/MonthlyReport';
import PayrollPage from './admin/PayrollPage';
import PayslipPage from './admin/PayslipPage';
import KPIPage from './admin/KPIPage';
import TaxDocPage from './admin/TaxDocPage';
import AttendanceManagePage from './admin/AttendanceManagePage';
import ExecDashboard from './admin/ExecDashboard';
import * as XLSX from 'xlsx';
import { SettingsToolbar } from '@/components/SettingsToolbar';

// ===== EMPLOYEE EDIT MODAL =====
const EmployeeEditModal = ({ employee, departments, shifts, allEmployees, onSave, onClose }: { employee: Profile; departments: Department[]; shifts: WorkShift[]; allEmployees: Profile[]; onSave: (u: Partial<Profile>) => void; onClose: () => void }) => {
    const { t, showConfirm, showToast } = useApp();
    const [resetting, setResetting] = useState(false);
    const [form, setForm] = useState({
        first_name: employee.first_name || '', last_name: employee.last_name || '',
        email: employee.email || '',
        role: employee.role || 'employee' as Profile['role'],
        employee_type: employee.employee_type || 'full-time',
        department: employee.department || '',
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto animate-fadeIn">
            <div className="bg-white w-full max-w-4xl p-8 space-y-6 border border-slate-200 rounded-3xl shadow-2xl my-auto animate-scaleIn">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-slate-800">{t.editEmployee}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={28} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden shadow-inner"><img src={employee.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.email}`} alt="" className="w-full h-full object-cover" /></div>
                            <div>
                                <p className="font-bold text-slate-800">{employee.email}</p>
                                <p className="text-xs font-bold text-slate-500 mt-0.5">{t.idHeader}: <span className="text-indigo-600">{employee.employee_code || '-'}</span> | ID: {String(employee?.id || '').slice(0, 8).toUpperCase()}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">🔑 {t.employeeId}</label>
                            <input value={form.employee_code} onChange={e => setForm({ ...form, employee_code: e.target.value.toUpperCase() })} placeholder="เช่น EMP001" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">📧 Email</label>
                            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.firstName}</label>
                                <input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.lastName}</label>
                                <input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Role</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Profile['role'] })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all">
                                    <option value="employee">Employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="hr">HR</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.employeeType}</label>
                                <select value={form.employee_type} onChange={e => setForm({ ...form, employee_type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all">
                                    <option value="full-time">{t.fullTime}</option>
                                    <option value="daily">{t.daily}</option>
                                    <option value="probation">{t.probation}</option>
                                    <option value="resigned">{t.resigned}</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.manager_level_1}</label>
                                <select value={form.manager_id} onChange={e => setForm({ ...form, manager_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all">
                                    <option value="">-- {t.notSpecified} --</option>
                                    {allEmployees.filter(e => e.id !== employee.id).map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name || ''}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.department}</label>
                                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all">
                                    <option value="">--</option>
                                    {departments.filter(d => d.is_active).map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.position}</label>
                            <input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.phoneLabel}</label>
                                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">⏰ {t.workShifts}</label>
                                <select value={form.shift_id} onChange={e => setForm({ ...form, shift_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all">
                                    <option value="">-- {t.notSpecified} --</option>
                                    {shifts.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">💰 {t.salary} ({t.baht})</label>
                                <input type="number" value={form.base_salary} onChange={e => setForm({ ...form, base_salary: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 flex items-center gap-1">📅 {t.hireDate}</label>
                                <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">🏦 {t.bankName}</label>
                                <input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="กสิกร" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.bankAccount}</label>
                                <input value={form.bank_account} onChange={e => setForm({ ...form, bank_account: e.target.value })} placeholder="0123456789" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">เลขบัตรปชช. / Social Security</label>
                            <input value={form.social_security_id || ''} onChange={e => setForm({ ...form, social_security_id: e.target.value })} placeholder="เลขบัตรประชาชน 13 หลัก" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                        </div>
                        <div className="flex items-center gap-3 py-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 transition-all" />
                                <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{t.active}</span>
                            </label>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 pt-4">
                            <button onClick={async () => {
                                if (!(await showConfirm({ 
                                    title: 'ยืนยันการรีเซ็ต',
                                    message: 'ยืนยันรีเซ็ตรหัสผ่านเป็น "123456" สำหรับพนักงานนี้?',
                                    type: 'warning'
                                }))) return;
                                const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
                                if (!serviceKey) return showToast('❌ ไม่สามารถรีเซ็ตรหัสผ่านได้เนื่องจากไม่ได้ตั้งค่า NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY', 'error');

                                setResetting(true);
                                try {
                                    const adminClient = createClient(supabaseUrl || '', serviceKey || '', { auth: { autoRefreshToken: false, persistSession: false } });
                                    const { error } = await adminClient.auth.admin.updateUserById(employee.id, { password: '123456' });
                                    if (error) throw error;
                                    showToast('✅ รีเซ็ตรหัสผ่านเป็น "123456" สำเร็จแล้ว', 'success');
                                } catch (error: any) {
                                    showToast('❌ เกิดข้อผิดพลาด: ' + error.message, 'error');
                                } finally {
                                    setResetting(false);
                                }
                            }} disabled={resetting} className="px-5 py-3.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all disabled:opacity-50 text-sm font-bold flex items-center gap-2 shadow-sm">
                                <span className={resetting ? "animate-pulse" : ""}>🔑 รีเซ็ตรหัสผ่าน</span>
                            </button>
                            <button onClick={onClose} className="px-6 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all">{t.cancel}</button>
                            <button onClick={() => onSave(form)} className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"><Save size={20} /> {t.save}</button>
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-md p-6 space-y-4 border border-slate-200 rounded-3xl shadow-2xl animate-scaleIn">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">{department ? t.editDepartment : t.addDepartment}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.deptName}</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" autoFocus />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.deptDesc}</label>
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all">{t.cancel}</button>
                    <button onClick={() => { if (name.trim()) onSave({ name: name.trim(), description: desc }); }} className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-200">
                        {department ? t.save : t.create}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ===== MAIN ADMIN DASHBOARD =====
const AdminDashboard = ({ onNavigate }: { onNavigate: (view: any) => void }) => {
    const { user, signOut, loading: authLoading } = useAuth();
    const { t, lang, showToast, showConfirm } = useApp();
    const [activeTab, setActiveTab] = useState('overview');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Role-based tab protection
    useEffect(() => {
        if (userRole === 'manager') {
            const allowedTabs = ['overview', 'employees', 'attendance', 'leaves', 'report'];
            if (!allowedTabs.includes(activeTab)) {
                setActiveTab('overview');
            }
        }
    }, [userRole, activeTab]);

    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [showNotifPanel, setShowNotifPanel] = useState(false);

    const [stats, setStats] = useState({ employees: 0, present: 0, onLeave: 0, pending: 0 });
    const [employees, setEmployees] = useState<Profile[]>([]);
    const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [allLeaveRequests, setAllLeaveRequests] = useState<LeaveRequest[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [settings, setSettings] = useState<CompanySettings>({ company_name: 'My Company', company_address: '', company_tax_id: '', work_start_time: '08:30', work_end_time: '17:30', annual_leave_quota: '6', sick_leave_quota: '30', personal_leave_quota: '3', late_threshold_minutes: '15', late_deduction_per_time: '50', absent_deduction_per_day: '0', ot_rate_multiplier: '1.5', social_security_rate: '5', social_security_max: '750', working_days_per_month: '30' });
    const [loadingData, setLoading] = useState(true);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const [newEmp, setNewEmp] = useState({
        email: '', password: '123456', first_name: '', last_name: '', employee_code: '',
        role: 'employee', employee_type: 'full-time', department: '', position: '', phone: '',
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
    const [roleFilter, setRoleFilter] = useState('all');
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
        showToast(`✅ ${t.downloaded}: ${t.distance}_${selectedDate}.xlsx`, 'success');
    };

    // === Export Monthly Distance to Excel ===
    const exportMonthlyExcel = async () => {
        const [year, month] = (selectedDate || '').split('-').map(Number);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${endDay}`;

        showToast(`📊 ${t.loadingData} ${month}/${year}...\n${t.pleaseWaitPreparingData}`, 'info');

        // Fetch all logs for the month
        const { data: monthLogs, error } = await supabase
            .from('attendance_logs')
            .select('*, profiles(first_name, last_name, employee_code)')
            .gte('timestamp', `${startDate}T00:00:00`)
            .lte('timestamp', `${endDate}T23:59:59`)
            .order('timestamp', { ascending: true });

        if (error || !monthLogs) {
            showToast(`❌ ${t.error}: ` + (error?.message || 'unknown'), 'error');
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
            const day = (log.timestamp || '').split('T')[0];
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
        showToast(`✅ ดาวน์โหลดแล้ว: ${fileName}\n\n📊 สรุป:\n- พนักงาน: ${Object.keys(userData).length} คน\n- ระยะทางรวม: ${grandTotal.toFixed(1)} กม.\n- จำนวน logs: ${monthLogs.length} รายการ`, 'success');
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
            setUserRole(currProfile?.role || 'employee');

            let pendingQuery = supabase.from('leave_requests').select('*, requester:profiles!leave_requests_user_id_fkey(first_name, last_name, avatar_url)');
            if (isManager) {
                pendingQuery = pendingQuery.eq('status', 'pending_manager').eq('approver_id', currentUser?.id).order('created_at', { ascending: false });
            } else {
                // Admin/HR should see both their own queue (pending) and also managers' queues if they want to bypass/oversee
                pendingQuery = pendingQuery.in('status', ['pending', 'pending_manager']).order('created_at', { ascending: false });
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
        if (!newShift.name || !newShift.label) { showToast('กรุณากรอกชื่อกะ', 'error'); return; }
        const maxOrder = shifts.length > 0 ? Math.max(...shifts.map(s => s.sort_order)) + 1 : 1;
        const { error } = await supabase.from('work_shifts').insert([{ ...newShift, sort_order: maxOrder, is_active: true }]);
        if (error) { showToast('Error: ' + error.message, 'error'); return; }
        setNewShift({ name: '', label: '', start_time: '08:30', end_time: '17:30', is_overnight: false, late_threshold_minutes: 15 });
        fetchAllData();
    };

    const handleDeleteShift = async (id: string) => {
        if (!(await showConfirm({
            message: 'ลบกะนี้?',
            type: 'danger'
        }))) return;
        // Check if any employee uses this shift
        const usingCount = employees.filter(e => e.shift_id === id).length;
        if (usingCount > 0) { showToast(`ไม่สามารถลบได้ ยังมีพนักงาน ${usingCount} คนใช้กะนี้อยู่`, 'error'); return; }
        await supabase.from('work_shifts').delete().eq('id', id);
        fetchAllData();
    };

    const handleToggleShift = async (id: string, active: boolean) => {
        await supabase.from('work_shifts').update({ is_active: active }).eq('id', id);
        fetchAllData();
    };

    const handleLeaveAction = async (id: string, status: 'approved' | 'rejected') => {
        if (!(await showConfirm({
            message: `${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}ใบลานี้?`,
            type: status === 'approved' ? 'info' : 'danger'
        }))) return;

        // Get leave request details first
        const leaveReq = [...leaveRequests, ...allLeaveRequests].find(r => r.id === id);

        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const { data: currProfile } = await supabase.from('profiles').select('role').eq('id', currentUser?.id).single();

        let nextStatus: string = status;
        let isFinalApproval = true;

        if (status === 'approved' && leaveReq?.status === 'pending_manager') {
            if (currProfile?.role === 'admin' || currProfile?.role === 'hr') {
                // Admin/HR approving a pending_manager request directly -> goes straight to approved!
                nextStatus = 'approved';
                isFinalApproval = true;
            } else {
                // Manager approving -> goes to pending (HR queue)
                nextStatus = 'pending';
                isFinalApproval = false;
            }
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
        showToast(`${status === 'approved' ? '✅ อนุมัติ' : '❌ ปฏิเสธ'}ใบลาแล้ว! (แจ้งเตือนพนักงานแล้ว)`, 'success');
    };
    const handleSaveEmployee = async (updated: Partial<Profile>) => {
        if (!editingEmployee) return;
        // Sanitize: convert empty strings to null for UUID/numeric/optional fields
        const sanitized: any = { ...updated };
        const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
        const nullIfEmpty = ['shift_id', 'manager_id', 'employee_code', 'department', 'position', 'phone', 'tax_id', 'social_security_id', 'bank_name', 'bank_account'];
        nullIfEmpty.forEach(key => {
            if (sanitized[key] === '') sanitized[key] = null;
        });
        if (sanitized.base_salary === '' || sanitized.base_salary === 0) sanitized.base_salary = 0;

        // Handle email change separately (requires Admin API)
        const newEmail = sanitized.email;
        const emailChanged = newEmail && newEmail !== editingEmployee.email;
        delete sanitized.email;

        // SANITIZE DATA: Ensure numeric and UUID fields are not empty strings
        if (sanitized.base_salary === '') sanitized.base_salary = 0;
        else if (sanitized.base_salary) sanitized.base_salary = Number(sanitized.base_salary);
        
        // CLEAN DATA: Remove any nested objects or fields that don't exist in the profiles table
        // to prevent 400 Bad Request
        const profileFields = [
            'employee_code', 'first_name', 'last_name', 'role', 'department', 
            'position', 'phone', 'employee_type', 'start_date', 'manager_id', 
            'shift_id', 'base_salary', 'bank_name', 'bank_account', 'tax_id', 
            'social_security_id', 'is_active', 'avatar_url', 'updated_at'
        ];
        
        const finalData: any = {};
        profileFields.forEach(field => {
            if (sanitized[field] !== undefined) {
                finalData[field] = sanitized[field];
            }
        });

        console.log('[Admin] Updating Profile ID:', editingEmployee.id);
        console.log('[Admin] Sanitized Data:', finalData);

        // Update profile data
        const { error, count } = await supabase.from('profiles').update(finalData, { count: 'exact' }).eq('id', editingEmployee.id);
        if (error) { 
            console.error('[Admin] Update Error:', error);
            showToast('Error: ' + error.message, 'error'); 
            return; 
        }
        if (count === 0) {
            showToast('⚠️ ไม่สามารถบันทึกได้!\n\nสาเหตุ: บัญชีของคุณอาจไม่มีสิทธิ์ Admin\nกรุณาตรวจสอบ role ของบัญชีที่ login อยู่ ต้องเป็น "admin" หรือ "hr"', 'error');
            return;
        }

        // Update email if changed
        if (emailChanged) {
            const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
            if (!serviceKey) {
                // Fallback: update email in profiles table only
                await supabase.from('profiles').update({ email: newEmail }).eq('id', editingEmployee.id);
                showToast('✅ บันทึกข้อมูลสำเร็จ!\n\n⚠️ อีเมลถูกเปลี่ยนในระบบแล้ว แต่ไม่ได้เปลี่ยน email สำหรับ login\nเพราะยังไม่ได้ตั้งค่า Service Role Key\n\nกรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ใน .env', 'success');
            } else {
                try {
                    // Use Admin API to change auth email
                    const adminClient = createClient(supabaseUrl || '', serviceKey || '', {
                        auth: { autoRefreshToken: false, persistSession: false }
                    });
                    const { error: authError } = await adminClient.auth.admin.updateUserById(editingEmployee.id, {
                        email: newEmail,
                        email_confirm: true
                    });

                    if (authError) {
                        // Still update profile email
                        await supabase.from('profiles').update({ email: newEmail }).eq('id', editingEmployee.id);
                        showToast(`✅ บันทึกสำเร็จ แต่เปลี่ยน email login ไม่ได้:\n${authError.message}\n\nอีเมลในระบบถูกเปลี่ยนแล้ว แต่ email สำหรับ login ยังเป็นอันเดิม`, 'success');
                    } else {
                        // Update profile email too
                        await supabase.from('profiles').update({ email: newEmail }).eq('id', editingEmployee.id);
                        showToast(`✅ บันทึกสำเร็จ!\n\n📧 อีเมลเปลี่ยนเป็น: ${newEmail}\n(ทั้ง login และโปรไฟล์)`, 'success');
                    }
                } catch (err: any) {
                    await supabase.from('profiles').update({ email: newEmail }).eq('id', editingEmployee.id);
                    showToast('✅ บันทึกโปรไฟล์สำเร็จ\n⚠️ แต่เปลี่ยน email login ไม่ได้: ' + err.message, 'success');
                }
            }
        } else {
            showToast('✅ บันทึกสำเร็จ!', 'success');
        }

        setEditingEmployee(null); fetchAllData();
    };
    const handleDeleteEmployee = async (emp: Profile) => {
        // Prevent deleting yourself
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === emp.id) {
            showToast('⚠️ ไม่สามารถลบบัญชีตัวเองได้!', 'error');
            return;
        }
        const confirmMsg = `🗑️ ลบพนักงาน "${emp.first_name} ${emp.last_name || ''}"?\n\nEmail: ${emp.email}\nรหัส: ${emp.employee_code || '-'}\n\n⚠️ ข้อมูลการเข้างานและใบลาทั้งหมดจะถูกลบด้วย!`;
        if (!(await showConfirm({
            title: 'ยืนยันการลบพนักงาน',
            message: confirmMsg,
            type: 'danger',
            confirmText: 'ลบพนักงาน'
        }))) return;
        
        if (!(await showConfirm({
            message: 'ยืนยันอีกครั้ง: ต้องการลบพนักงานนี้จริงๆ?',
            type: 'danger',
            confirmText: 'ยืนยันลบถาวร'
        }))) return;
        try {
            // Delete related data first
            await supabase.from('attendance_logs').delete().eq('user_id', emp.id);
            await supabase.from('leave_requests').delete().eq('user_id', emp.id);
            await supabase.from('notifications').delete().eq('user_id', emp.id);
            // Delete profile
            const { error } = await supabase.from('profiles').delete().eq('id', emp.id);
            if (error) { showToast('Error: ' + error.message, 'error'); return; }
            showToast(`✅ ลบพนักงาน ${emp.first_name} สำเร็จ!\n\nหมายเหตุ: บัญชี Auth (login) ยังอยู่ใน Supabase\nหากต้องการลบบัญชี login ด้วย ให้ไปลบที่ Supabase Dashboard > Authentication > Users`, 'success');
            fetchAllData();
        } catch (err: any) {
            showToast('Error: ' + err.message, 'error');
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
            showToast('บันทึกแผนกสำเร็จ!', 'success');
        } catch (err: any) {
            showToast('Error บันทึกแผนก: ' + err.message, 'error');
        }
    };
    const handleDeleteDepartment = async (id: string) => {
        if (!(await showConfirm({
            message: 'ลบแผนกนี้?',
            type: 'danger'
        }))) return;
        const { error } = await supabase.from('departments').delete().eq('id', id);
        if (error) { showToast('Error ลบแผนก: ' + error.message, 'error'); return; }
        fetchAllData();
    };
    const handleSaveSettings = async () => {
        setSettingsSaving(true);
        for (const [key, value] of Object.entries(settings)) { await supabase.from('company_settings').upsert({ key, value, updated_at: new Date().toISOString() }); }
        setSettingsSaving(false); showToast('บันทึกสำเร็จ!', 'success');
    };

    const handleAddEmployee = async () => {
        if (!newEmp.first_name) { showToast('กรุณากรอกชื่อพนักงาน', 'error'); return; }
        if (newEmp.password.length < 6) { showToast('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'error'); return; }

        // Auto-generate temp email if not provided
        let finalEmail = newEmp.email.trim();
        if (!finalEmail) {
            const code = newEmp.employee_code?.trim() || newEmp.first_name.toLowerCase().replace(/\s/g, '');
            finalEmail = `${code}@temp.hrms.local`;
        }

        setAddingEmp(true);
        try {
            const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
            const useAdmin = !!serviceKey;
            
            // Create a separate client so we don't lose admin session
            const tempClient = createClient(
                supabaseUrl || '',
                useAdmin ? serviceKey : (supabaseKey || ''),
                { auth: { persistSession: false } }
            );

            let authData: any;
            let authError: any;

            if (useAdmin) {
                // Use Admin API to bypass rate limits and email confirmation
                const { data, error } = await tempClient.auth.admin.createUser({
                    email: finalEmail,
                    password: newEmp.password,
                    email_confirm: true,
                    user_metadata: {
                        role: newEmp.role,
                        first_name: newEmp.first_name,
                        last_name: newEmp.last_name || '',
                        employee_code: newEmp.employee_code?.toUpperCase() || '',
                        department: newEmp.department || '',
                        position: newEmp.position || '',
                    }
                });
                authData = data;
                authError = error;
            } else {
                // Fallback to normal signUp (will hit rate limits)
                const { data, error } = await tempClient.auth.signUp({
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
                authData = data;
                authError = error;
            }

            if (authError) throw authError;
            if (authData.user) {
                // Wait for trigger to create profile
                await new Promise(r => setTimeout(r, 2000));

                const updateData = {
                    first_name: newEmp.first_name,
                    last_name: newEmp.last_name,
                    employee_code: newEmp.employee_code ? newEmp.employee_code.toUpperCase() : null,
                    role: newEmp.role,
                    employee_type: newEmp.employee_type || 'full-time',
                    department: newEmp.department || null,
                    position: newEmp.position || null,
                    start_date: newEmp.start_date || null,
                    phone: newEmp.phone || null,
                    manager_id: newEmp.manager_id || null,
                    shift_id: newEmp.shift_id || null,
                    base_salary: Number(newEmp.base_salary) || 0,
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
                showToast(`✅ สร้างพนักงาน ${newEmp.first_name} สำเร็จ!\nEmail: ${finalEmail}${isTemp ? ' (ชั่วคราว)' : ''}\nรหัสผ่าน: ${newEmp.password}\nRole: ${newEmp.role}\nรหัสพนักงาน: ${newEmp.employee_code || 'ไม่ตั้ง'}${roleWarning}${isTemp ? '\n\n💡 Email เป็นชั่วคราว สามารถแก้ไขภายหลังได้' : ''}`, 'success');
            }
            setShowAddEmployee(false);
            setNewEmp({
                email: '', password: '123456', first_name: '', last_name: '', employee_code: '',
                role: 'employee', employee_type: 'full-time', department: '', position: '', phone: '',
                manager_id: '', shift_id: '', base_salary: 0, bank_name: '',
                bank_account: '', tax_id: '', social_security_id: '',
                start_date: new Date().toISOString().split('T')[0]
            });
            fetchAllData();
        } catch (err: any) {
            showToast('Error: ' + err.message, 'error');
        }
        setAddingEmp(false);
    };

    const handleUpdateShiftField = async (id: string, field: string, value: any) => {
        await supabase.from('work_shifts').update({ [field]: value }).eq('id', id);
        fetchAllData();
    };

    const handleAddLeaveType = async () => {
        if (!newLeaveType.name || !newLeaveType.label) { showToast('กรุณากรอกชื่อประเภทลา', 'error'); return; }
        const maxOrder = leaveTypes.length > 0 ? Math.max(...leaveTypes.map(t => t.sort_order)) + 1 : 1;
        const { error } = await supabase.from('leave_types').insert([{ ...newLeaveType, sort_order: maxOrder, is_active: true }]);
        if (error) { showToast('Error: ' + error.message, 'error'); return; }
        setNewLeaveType({ name: '', label: '', quota_per_year: 0, is_paid: true, advance_days: 0, allow_retroactive: false });
        fetchAllData();
    };

    const handleDeleteLeaveType = async (id: string) => {
        if (!(await showConfirm({
            message: 'ลบประเภทลานี้?',
            type: 'danger'
        }))) return;
        await supabase.from('leave_types').delete().eq('id', id);
        fetchAllData();
    };

    const handleToggleLeaveType = async (id: string, active: boolean) => {
        await supabase.from('leave_types').update({ is_active: active }).eq('id', id);
        fetchAllData();
    };

    const handleUpdateLeaveTypeField = async (id: string, field: string, value: any) => {
        // Map UI field names to DB column names if necessary
        const fieldMap: Record<string, string> = {
            'min_days_advance': 'advance_days',
            'max_days_backdated': 'allow_retroactive' // Keep mapping for backward compatibility if DB has these names
        };
        const dbField = fieldMap[field] || field;

        // Ensure numeric values are numbers
        let dbValue = value;
        if (['quota_per_year', 'advance_days', 'min_days_advance', 'max_days_backdated', 'sort_order'].includes(dbField)) {
            dbValue = Number(value);
        }

        const { error } = await supabase.from('leave_types').update({ [dbField]: dbValue }).eq('id', id);
        if (error) {
            console.error('Error updating leave type:', error);
            showToast('ไม่สามารถอัปเดตได้: ' + error.message, 'error');
        }
        fetchAllData();
    };

    const handleInitializeDefaultLeaveTypes = async () => {
        if (!(await showConfirm({
            message: 'ต้องการเพิ่ม/รีเซ็ตประเภทการลามาตรฐาน 10 ประเภทใช่หรือไม่? (ข้อมูลเดิมจะไม่ถูกลบ แต่จะมีการเพิ่มตัวที่ขาดไป)',
            type: 'info'
        }))) return;

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
        showToast('✅ อัปเดตประเภทการลามาตรฐานเรียบร้อยครับ', 'success');
        fetchAllData();
    };

    const displayedLeaves = leaveFilter === 'pending' ? leaveRequests : allLeaveRequests;
    const filteredEmployees = employees.filter(emp => { 
        if (roleFilter !== 'all' && emp.role !== roleFilter) return false;
        if (!searchQuery) return true; 
        const q = searchQuery.toLowerCase(); 
        return emp.first_name?.toLowerCase().includes(q) || emp.last_name?.toLowerCase().includes(q) || emp.email?.toLowerCase().includes(q) || emp.department?.toLowerCase().includes(q) || emp.employee_code?.toLowerCase().includes(q); 
    });

    const navGroups = [
        {
            label: t.navMain, items: [
                { id: 'overview', icon: PieChart, label: t.overview },
                { id: 'employees', icon: Users, label: t.employees },
                ...(userRole && userRole !== 'manager' ? [{ id: 'departments', icon: Building2, label: t.departments }] : []),
            ]
        },
        {
            label: t.navTime, items: [
                { id: 'attendance', icon: Calendar, label: t.attendance },
                ...(userRole && userRole !== 'manager' ? [{ id: 'att_manage', icon: ClipboardEdit, label: t.attendanceManage }] : []),
                { id: 'leaves', icon: FileText, label: t.leaves, badge: stats.pending },
                { id: 'report', icon: BarChart3, label: t.monthlyReport },
            ]
        },
        ...(userRole && userRole !== 'manager' ? [
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
            }
        ] : []),
    ];

    const tabLabels: Record<string, string> = { overview: t.overview, employees: t.employees, departments: t.departments, attendance: t.attendance, att_manage: t.attendanceManage, leaves: t.leaves, report: t.monthlyReport, payroll: t.payroll, payslip: t.payslipAdmin, tax: t.taxDoc, kpi: t.kpi, executive: t.executive, settings: t.settings };

    if (authLoading || loadingData || !userRole || !user) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Initializing System...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white overflow-hidden font-sans">
            {editingEmployee && <EmployeeEditModal employee={editingEmployee} departments={departments} shifts={shifts} allEmployees={employees} onSave={handleSaveEmployee} onClose={() => setEditingEmployee(null)} />}
            {showDeptModal && <DepartmentModal department={editingDepartment} onSave={handleSaveDepartment} onClose={() => { setShowDeptModal(false); setEditingDepartment(undefined); }} />}

            {/* ADD EMPLOYEE MODAL */}
            {showAddEmployee && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto animate-fadeIn">
                    <div className="bg-white w-full max-w-4xl p-8 space-y-6 border border-slate-200 rounded-3xl shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold flex items-center gap-3 text-slate-800"><UserPlus size={28} className="text-indigo-600" /> เพิ่มพนักงานใหม่</h3>
                            <button onClick={() => setShowAddEmployee(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={28} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">🔑 รหัสพนักงาน</label>
                                        <input value={newEmp.employee_code} onChange={e => setNewEmp({ ...newEmp, employee_code: e.target.value.toUpperCase() })} placeholder="เช่น EMP001" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">🔒 รหัสผ่าน *</label>
                                        <input type="password" value={newEmp.password} onChange={e => setNewEmp({ ...newEmp, password: e.target.value })} placeholder="รหัสผ่าน" className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-slate-800 text-sm font-bold focus:outline-none transition-all ${newEmp.password && newEmp.password.length < 6 ? 'border-red-400 focus:ring-red-500/10' : 'border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'}`} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">📧 Email <span className="text-slate-400">(เว้นว่างเพื่อสร้างออโต้)</span></label>
                                    <input value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} placeholder="email@company.com" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.firstName} *</label>
                                        <input value={newEmp.first_name} onChange={e => setNewEmp({ ...newEmp, first_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.lastName}</label>
                                        <input value={newEmp.last_name} onChange={e => setNewEmp({ ...newEmp, last_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.roleHeader}</label>
                                        <select value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all">
                                            <option value="employee">Employee</option>
                                            <option value="manager">Manager</option>
                                            <option value="hr">HR</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.employeeType}</label>
                                        <select value={newEmp.employee_type} onChange={e => setNewEmp({ ...newEmp, employee_type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all">
                                            <option value="full-time">{t.fullTime}</option>
                                            <option value="daily">{t.daily}</option>
                                            <option value="probation">{t.probation}</option>
                                            <option value="resigned">{t.resigned}</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.manager_level_1}</label>
                                    <select value={newEmp.manager_id} onChange={e => setNewEmp({ ...newEmp, manager_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all">
                                        <option value="">-- {t.notSpecified} --</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name || ''}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.department}</label>
                                        <select value={newEmp.department} onChange={e => setNewEmp({ ...newEmp, department: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all">
                                            <option value="">--</option>
                                            {departments.filter(d => d.is_active).map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.position}</label>
                                        <input value={newEmp.position} onChange={e => setNewEmp({ ...newEmp, position: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.phoneLabel}</label>
                                        <input value={newEmp.phone} onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">⏰ {t.workShifts}</label>
                                        <select value={newEmp.shift_id} onChange={e => setNewEmp({ ...newEmp, shift_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all">
                                            <option value="">-- {t.notSpecified} --</option>
                                            {shifts.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">💰 {t.salary} ({t.baht})</label>
                                        <input type="number" value={newEmp.base_salary} onChange={e => setNewEmp({ ...newEmp, base_salary: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">📅 {t.hireDate}</label>
                                        <input type="date" value={newEmp.start_date} onChange={e => setNewEmp({ ...newEmp, start_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">🏦 {t.bankName}</label>
                                        <input value={newEmp.bank_name} onChange={e => setNewEmp({ ...newEmp, bank_name: e.target.value })} placeholder="กสิกร" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.bankAccount}</label>
                                        <input value={newEmp.bank_account} onChange={e => setNewEmp({ ...newEmp, bank_account: e.target.value })} placeholder="0123456789" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.socialSecurityId}</label>
                                    <input value={newEmp.social_security_id} onChange={e => setNewEmp({ ...newEmp, social_security_id: e.target.value })} placeholder="เลขบัตรประชาชน 13 หลัก" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => {
                                        setShowAddEmployee(false);
                                        setNewEmp({
                                            email: '', password: '123456', first_name: '', last_name: '', employee_code: '',
                                            role: 'employee', employee_type: 'full-time', department: '', position: '', phone: '',
                                            manager_id: '', shift_id: '', base_salary: 0, bank_name: '',
                                            bank_account: '', tax_id: '', social_security_id: '',
                                            start_date: new Date().toISOString().split('T')[0]
                                        });
                                    }} className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95">ยกเลิก</button>
                                    <button onClick={handleAddEmployee} disabled={addingEmp} className="flex-[1.5] py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50">
                                        <UserPlus size={20} strokeWidth={2.5} /> {addingEmp ? 'กำลังสร้าง...' : 'สร้างพนักงาน'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-[100] transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:z-10 transition duration-200 ease-in-out w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto scrollbar-hide shadow-xl md:shadow-none`}>
                <div className="flex items-center gap-3 mb-8 px-5 pt-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
                        <CalendarDays size={20} />
                    </div>
                    <div>
                        <h1 className="font-black text-xl tracking-tight text-slate-800 dark:text-white leading-none">LeaveFlow</h1>
                        <p className="text-[10px] font-bold text-slate-400">{t.adminPanel}</p>
                    </div>
                </div>

                <div className="px-3">
                    {navGroups.map(group => (
                        <div key={group.label} className="mb-5">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 px-3 mb-2.5">{group.label}</p>
                            <div className="space-y-1">
                            {group.items.map(item => (
                                <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                    className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-black transition-all relative
                                        ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600'}`}>
                                    <item.icon size={18} strokeWidth={activeTab === item.id ? 3 : 2.5} />
                                    <span className="truncate">{item.label}</span>
                                    {'badge' in item && (item as any).badge > 0 && <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === item.id ? 'bg-white text-indigo-600' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}`}>{(item as any).badge}</span>}
                                </button>
                            ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto border-t border-slate-100 dark:border-white/10 p-4 space-y-1 bg-slate-50/50">
                    <button onClick={() => onNavigate('employee-dashboard')} className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-black text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/50 hover:text-indigo-600 transition-all text-left">
                        <Briefcase size={18} strokeWidth={2.5} />
                        <span className="truncate">{t.myDashboard}</span>
                    </button>
                    <button onClick={() => signOut()} className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-black text-rose-600 hover:bg-rose-50 transition-all text-left">
                        <LogOut size={18} strokeWidth={2.5} />
                        <span>{t.signOut}</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-[#e0f2fe] via-[#f0f9ff] to-[#e0f2fe] dark:from-slate-900 dark:to-slate-800 relative z-20">
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-cyan-500/5 dark:bg-purple-500/10 rounded-full blur-[120px]"></div>
                </div>

                <header className="sticky top-0 z-20 border-b border-slate-200/50 dark:border-white/5 py-3 backdrop-blur-xl bg-white/50 dark:bg-[#0f172a]/80 shadow-sm">
                    <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition rounded-lg hover:bg-white dark:hover:bg-white/10">
                                <Menu size={24} />
                            </button>
                            <div>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-gray-300 mb-0.5">
                                    <span>{t.nav_home}</span>
                                    <span className="text-slate-300 dark:text-gray-600">›</span>
                                    <span className="text-blue-600 dark:text-indigo-400 font-black">{tabLabels[activeTab] || activeTab}</span>
                                </div>
                                <h2 className="text-xl font-black truncate text-slate-800 dark:text-white tracking-tight">{tabLabels[activeTab] || activeTab}</h2>
                            </div>
                        </div>
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
                                    <div className="absolute right-0 top-12 w-80 sm:w-96 glass-panel border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
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
                    </div>
                </header>

                <div className="p-4 md:p-8 relative z-10 max-w-[1600px] mx-auto w-full">
                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { label: t.totalEmployees, value: stats.employees, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', tab: 'employees' },
                                    { label: t.presentToday, value: stats.present, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', tab: 'attendance' },
                                    { label: t.onLeaveToday, value: stats.onLeave, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', tab: 'leaves' },
                                    { label: t.pendingApproval, value: stats.pending, icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50', tab: 'leaves' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-800/80 p-6 rounded-[2rem] flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-200 dark:border-slate-700/50 hover:-translate-y-1 transition-all cursor-pointer group" onClick={() => setActiveTab(s.tab)}>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-600 dark:text-slate-300 text-sm font-black uppercase tracking-wide mb-1.5">{s.label}</p>
                                            <h3 className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{s.value}</h3>
                                        </div>
                                        <div className={`w-14 h-14 rounded-2xl ${s.bg} dark:bg-slate-900 ${s.color} flex items-center justify-center border border-current/10 group-hover:border-current/30 transition-colors shadow-sm ml-3 shrink-0`}><s.icon size={28} strokeWidth={2.5} /></div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-7 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                    <div className="flex justify-between items-center mb-6 px-1">
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{t.recentAttendance}</h3>
                                        <button onClick={() => setActiveTab('attendance')} className="text-sm font-bold text-indigo-600 hover:underline">{t.viewAll}</button>
                                    </div>
                                    <div className="space-y-3">
                                        {attendanceLogs.slice(0, 5).map(log => (
                                            <div key={log.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/30 hover:border-indigo-200 transition-colors">
                                                <div className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden shrink-0">
                                                    <img src={log.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user_id}`} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-base font-black text-slate-800 dark:text-white truncate leading-none mb-1">{log.profiles?.first_name} {log.profiles?.last_name}</p>
                                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 capitalize">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${log.type.includes('in') ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                        {(t as any)[log.type || ''] || (log.type || '').replace('_', ' ')} • {new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {attendanceLogs.length === 0 && (
                                            <div className="text-center py-12">
                                                <p className="text-slate-400 font-bold">{t.noData}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-7 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                    <div className="flex justify-between items-center mb-6 px-1">
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{t.pendingLeaves}</h3>
                                        <button onClick={() => setActiveTab('leaves')} className="text-sm font-bold text-indigo-600 hover:underline">{t.viewAll}</button>
                                    </div>
                                    <div className="space-y-3">
                                        {leaveRequests.slice(0, 5).map(req => (
                                            <div key={req.id} className="p-4 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden shrink-0">
                                                        <img src={(req as any).requester?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user_id}`} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-black text-slate-800 dark:text-white truncate leading-none mb-1">{req.profiles?.first_name} {req.profiles?.last_name}</p>
                                                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-black bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 capitalize whitespace-nowrap">
                                                            {(t as any)[req.leave_type] || req.leave_type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button onClick={() => handleLeaveAction(req.id, 'approved')} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-sm font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"><Check size={18} strokeWidth={3} /> {t.approve}</button>
                                                    <button onClick={() => handleLeaveAction(req.id, 'rejected')} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-black active:scale-95 transition-all flex items-center justify-center gap-2"><X size={18} strokeWidth={3} /> {t.reject}</button>
                                                </div>
                                            </div>
                                        ))}
                                        {leaveRequests.length === 0 && (
                                            <div className="text-center py-12">
                                                <p className="text-slate-400 font-bold">{t.noPendingLeaves}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* EMPLOYEES */}
                    {activeTab === 'employees' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white dark:bg-slate-800/80 p-6 rounded-[2.5rem] border border-slate-300 dark:border-slate-700/50 shadow-sm">
                                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3">
                                    <div className="relative flex-1">
                                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-slate-800 dark:text-white text-sm font-bold focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all outline-none" />
                                    </div>
                                    <div className="w-full sm:w-1/3">
                                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 dark:text-white text-sm font-bold focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all outline-none">
                                            <option value="all">- {t.allRoles} -</option>
                                            <option value="admin">{t.roleAdmin}</option>
                                            <option value="manager">{t.roleManager}</option>
                                            <option value="hr">{t.roleHR}</option>
                                            <option value="employee">{t.roleEmployee}</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    {userRole !== 'manager' && (
                                        <button onClick={() => setShowAddEmployee(true)} className="px-7 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-500 transition-all flex items-center justify-center gap-2.5 active:scale-95 shadow-lg w-full sm:w-auto">
                                            <Plus size={18} strokeWidth={3} /> {t.addEmployee}
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* MOBILE CARD VIEW */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-6">
                                {filteredEmployees.map(emp => {
                                    const manager = employees.find(e => e.id === emp.manager_id);
                                    return (
                                    <div key={emp.id} className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-7 border border-slate-100 dark:border-slate-700/50 shadow-sm hover:-translate-y-1.5 transition-all group">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="relative mb-5">
                                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 rotate-[5deg] group-hover:rotate-0 transition-transform duration-300 flex items-center justify-center">
                                                    {emp.avatar_url ? <img src={emp.avatar_url} alt="" className="w-full h-full rounded-[1.8rem] border-4 border-white dark:border-slate-800 object-cover bg-slate-100" /> : <div className="w-full h-full rounded-[1.8rem] border-4 border-white bg-slate-100 flex items-center justify-center font-black text-indigo-500 text-2xl">{emp.email?.substring(0,2).toUpperCase()}</div>}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-white dark:border-slate-800 shadow-sm ${emp.is_active !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                            </div>
                                            
                                            <h4 className="text-xl font-black text-slate-800 dark:text-white leading-tight mb-1 flex items-center gap-2 justify-center">
                                                {emp.first_name} {emp.last_name}
                                                {emp.role === 'admin' && <div className="w-4 h-4 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-black" title="Admin">H</div>}
                                            </h4>
                                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">{emp.position || '—'}</p>
                                            
                                            <div className="flex gap-2 flex-wrap justify-center mb-6">
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${emp.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' : emp.role === 'hr' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' : emp.role === 'manager' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                    {emp.role === 'admin' ? t.roleAdmin : emp.role === 'hr' ? t.roleHR : emp.role === 'manager' ? t.roleManager : t.roleEmployee}
                                                </span>
                                            </div>
                                            
                                            <div className="w-full space-y-3 pt-5 border-t border-slate-50 dark:border-slate-700/50 mb-6">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-black text-slate-400 uppercase tracking-tighter">{t.employeeId}</span>
                                                    <span className="font-mono font-black text-indigo-600 dark:text-cyan-400">{emp.employee_code || '—'}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-black text-slate-400 uppercase tracking-tighter">{t.department}</span>
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{emp.department || '—'}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-black text-slate-400 uppercase tracking-tighter">{t.manager_level_1}</span>
                                                    <span className="font-black text-slate-800 dark:text-white">{manager ? `${manager.first_name} ${manager.last_name}` : '—'}</span>
                                                </div>
                                            </div>
                                            
                                            {userRole !== 'manager' && (
                                                <div className="flex gap-2 w-full">
                                                    <button onClick={() => setEditingEmployee(emp)} className="flex-1 py-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-2xl text-xs font-black border border-slate-100 dark:border-slate-700/50 transition-all flex items-center justify-center gap-1.5"><Edit3 size={14} /> {t.edit}</button>
                                                    <button onClick={() => handleDeleteEmployee(emp)} className="px-4 py-3 bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl border border-rose-100 dark:border-rose-500/20 transition-all flex items-center justify-center"><Trash2 size={16} /></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )})}
                            </div>

                            {/* DESKTOP TABLE VIEW */}
                            <div className="hidden lg:block bg-white dark:bg-slate-800/80 rounded-[2.5rem] border border-slate-300 dark:border-slate-700/50 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse min-w-[1000px]">
                                        <thead>
                                            <tr className="bg-slate-100/80 dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-base font-black uppercase">
                                                <th className="px-6 py-4">{t.idHeader}</th>
                                                <th className="px-6 py-4">{t.name}</th>
                                                <th className="px-6 py-4">{t.deptHeader}/{t.position}</th>
                                                <th className="px-6 py-4 text-center">{t.roleHeader}</th>
                                                <th className="px-6 py-4">{t.manager_level_1}</th>
                                                <th className="px-6 py-4 text-center">{t.statusHeader}</th>
                                                {userRole !== 'manager' && <th className="px-6 py-4 text-center">{t.manageHeader}</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                            {filteredEmployees.map(emp => {
                                                const manager = employees.find(e => e.id === emp.manager_id);
                                                return (
                                                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono font-black text-slate-700 dark:text-slate-300">{emp.employee_code || '-'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm shrink-0 flex items-center justify-center font-black text-white bg-gradient-to-br from-indigo-500 to-purple-500">
                                                                {emp.avatar_url ? <img src={emp.avatar_url} alt="" className="w-full h-full object-cover" /> : emp.email?.substring(0,2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                                                                    {emp.first_name} {emp.last_name}
                                                                </div>
                                                                <div className="text-xs font-bold text-slate-500">@{emp.email?.split('@')[0]} · {emp.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-black text-slate-700 dark:text-slate-300">{emp.department || '-'}</div>
                                                        <div className="text-xs font-bold text-slate-500">{emp.position || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-sm font-black px-5 py-2 rounded-full uppercase whitespace-nowrap border ${emp.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' : emp.role === 'hr' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' : emp.role === 'manager' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                            {emp.role === 'admin' ? t.roleAdmin : emp.role === 'hr' ? t.roleHR : emp.role === 'manager' ? t.roleManager : t.roleEmployee}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{manager ? `${manager.first_name} ${manager.last_name}` : '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {emp.is_active !== false ? (
                                                            <span className="text-sm font-black px-5 py-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap">{t.statusActive}</span>
                                                        ) : (
                                                            <span className="text-sm font-black px-5 py-2 rounded-full bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">{t.statusInactive}</span>
                                                        )}
                                                    </td>
                                                    {userRole !== 'manager' && (
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-center gap-2">
                                                                <button onClick={() => setEditingEmployee(emp)} className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 flex items-center justify-center transition-all shadow-sm"><Edit3 size={14} strokeWidth={2.5} /></button>
                                                                <button onClick={() => handleDeleteEmployee(emp)} className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 flex items-center justify-center transition-all shadow-sm"><Trash2 size={14} strokeWidth={2.5} /></button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            )})}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ATTENDANCE */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-slate-800/80 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 shadow-sm">
                                <div className="flex gap-4 items-center w-full sm:w-auto">
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-slate-800 dark:text-white text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner w-full sm:w-auto" />
                                    </div>
                                    <span className="text-sm font-black text-slate-500 dark:text-slate-400 hidden sm:inline-block">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={exportDailyExcel}
                                        disabled={attendanceLogs.length === 0}
                                        className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 text-sm font-black transition-all flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        📥 Excel วันนี้
                                    </button>
                                    <button
                                        onClick={exportMonthlyExcel}
                                        className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 text-sm font-black transition-all flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-500/20 shadow-sm"
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
                                    <div className="space-y-6">
                                        {/* Team total */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 p-6 flex items-center gap-5 shadow-sm">
                                                <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-2xl shadow-inner border border-indigo-100 dark:border-indigo-500/20 shrink-0">🚗</div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t.totalDistanceTeam || 'ระยะทางรวมทีม'}</p>
                                                    <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{totalTeamDistance.toFixed(1)} <span className="text-sm font-bold text-slate-400 ml-1">{t.km || 'กม.'}</span></p>
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 p-6 flex items-center gap-5 shadow-sm">
                                                <div className="w-14 h-14 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl shadow-inner border border-emerald-100 dark:border-emerald-500/20 shrink-0">👥</div>
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">{t.present_today_count}</p>
                                                    <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{userDistances.length} <span className="text-sm font-bold text-slate-400 ml-1">{t.persons}</span></p>
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 p-6 flex items-center gap-5 shadow-sm">
                                                <div className="w-14 h-14 rounded-[1.5rem] bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 text-2xl shadow-inner border border-rose-100 dark:border-rose-500/20 shrink-0">📍</div>
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">{t.total_records_count}</p>
                                                    <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{attendanceLogs.length} <span className="text-sm font-bold text-slate-400 ml-1">{t.records}</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Per-employee distance */}
                                        <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 p-7 shadow-sm">
                                            <h3 className="text-sm font-black text-slate-800 dark:text-white mb-5 flex items-center gap-2">🗺️ {t.individual_distance}</h3>
                                            <div className="space-y-3">
                                                {userDistances.sort((a, b) => b.distance - a.distance).map(u => (
                                                    <div key={u.userId} className="flex flex-wrap sm:flex-nowrap items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] p-4 border border-slate-100 dark:border-slate-800 gap-4">
                                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.userId}`} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-slate-800 dark:text-white">{u.name}</div>
                                                                <div className="text-[11px] font-bold text-slate-500">({u.logCount} logs)</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                                                            <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2 shadow-inner">
                                                                <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${Math.min(100, (u.distance / Math.max(totalTeamDistance, 1)) * 100)}%` }} />
                                                            </div>
                                                            <span className="text-sm font-mono font-black text-indigo-600 dark:text-indigo-400 min-w-[70px] text-right">{u.distance.toFixed(1)} <span className="text-xs font-bold text-slate-400">{t.km || 'กม.'}</span></span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : null;
                            })()}

                            {/* Attendance Log Table */}
                            <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead>
                                            <tr className="bg-slate-100/80 dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-base font-black uppercase">
                                                <th className="p-6">{t.employee}</th>
                                                <th className="p-6">{t.time}</th>
                                                <th className="p-6">{t.type}</th>
                                                <th className="p-6">{t.location}</th>
                                                <th className="p-6 text-center">GPS</th>
                                                <th className="p-6 text-center">{t.photo}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                            {attendanceLogs.map(log => (
                                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                                                <img src={log.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user_id}`} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className="text-sm font-black text-slate-800 dark:text-white">{log.profiles?.first_name} {log.profiles?.last_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-sm font-mono font-black text-slate-700 dark:text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-5 py-2 rounded-full text-sm font-black uppercase whitespace-nowrap border ${log.type === 'check_in' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : log.type === 'check_out' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                            {log.type === 'check_in' ? t.checkIn : log.type === 'check_out' ? t.checkOut : log.type === 'site_in' ? t.siteCheckIn : t.siteCheckOut}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-sm font-bold text-slate-600 dark:text-slate-300">
                                                        <div className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" />{log.location_name}</div>
                                                    </td>
                                                    <td className="p-6 text-center">
                                                        {log.location_lat && log.location_lng ? (
                                                            <a href={`https://www.google.com/maps?q=${log.location_lat},${log.location_lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-mono font-black text-indigo-600 hover:text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg transition-colors">
                                                                📍 {log.location_lat.toFixed(4)}, {log.location_lng.toFixed(4)}
                                                            </a>
                                                        ) : <span className="text-xs font-bold text-slate-400">-</span>}
                                                    </td>
                                                    <td className="p-6 text-center">
                                                        {log.photo_url ? (
                                                            <button onClick={() => { const w = window.open('', '_blank'); if (w) w.document.write(`<img src="${log.photo_url}" style="max-width:100%;height:auto;" />`); }} className="text-[11px] font-black text-indigo-600 hover:text-indigo-500 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition-colors">
                                                                ดูรูป
                                                            </button>
                                                        ) : <span className="text-xs font-bold text-slate-400">-</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                            {attendanceLogs.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-slate-500 font-bold">{t.noData}</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LEAVES */}
                    {activeTab === 'leaves' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">{leaveFilter === 'pending' ? 'ใบลารออนุมัติ' : 'ประวัติใบลาทั้งหมด'}</h2>
                                <p className="text-slate-500 font-medium text-sm mt-1">
                                    {leaveFilter === 'pending' ? `มี ${displayedLeaves.length} ใบลาที่รอการพิจารณา` : `พบทั้งหมด ${displayedLeaves.length} รายการ`}
                                </p>
                            </div>
                            
                            <div className="flex gap-2">
                                <button onClick={() => setLeaveFilter('pending')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${leaveFilter === 'pending' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                    {t.pending}
                                    {stats.pending > 0 && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">{stats.pending}</span>}
                                </button>
                                <button onClick={() => setLeaveFilter('all')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${leaveFilter === 'all' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{t.allLeaves}</button>
                            </div>

                            {displayedLeaves.length === 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 p-12 text-center shadow-sm">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText size={24} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-slate-700 dark:text-white font-bold">{t.noLeaves || 'ไม่มีข้อมูลใบลา'}</h3>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                                    {displayedLeaves.map(req => (
                                        <div key={req.id} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                            {/* Status Badge */}
                                            <div className="absolute top-5 right-5">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                                                    req.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : 
                                                    req.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 
                                                    'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
                                                }`}>
                                                    {req.status === 'approved' ? <CheckCircle size={14} /> : req.status === 'rejected' ? <XCircle size={14} /> : <Clock size={14} />}
                                                    {req.status === 'approved' ? t.approved : req.status === 'rejected' ? t.rejected : req.status === 'pending_manager' ? t.pendingManager : t.pendingHR}
                                                </span>
                                            </div>

                                            {/* User Header */}
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
                                                    <img src={(req as any).requester?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user_id}`} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 dark:text-white text-[15px]">{(req as any).requester?.first_name} {(req as any).requester?.last_name}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">{(req as any).requester?.department || '-'} • {(req as any).requester?.position || '-'}</p>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-[100px_1fr] gap-y-2 mb-5">
                                                <div className="text-slate-500 dark:text-gray-400 text-sm font-medium">เลขที่:</div>
                                                <div className="text-slate-800 dark:text-white text-sm font-bold font-mono">LV-{new Date(req.created_at).getFullYear().toString().slice(2)}-{String(req?.id || '').slice(0,4).toUpperCase()}</div>
                                                
                                                <div className="text-slate-500 dark:text-gray-400 text-sm font-medium">ประเภท:</div>
                                                <div className="text-slate-800 dark:text-white text-sm font-bold flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                    <span className="capitalize">{req.leave_type}</span>
                                                </div>
                                                
                                                <div className="text-slate-500 dark:text-gray-400 text-sm font-medium">วันที่:</div>
                                                <div className="text-slate-800 dark:text-white text-sm font-medium">{new Date(req.start_date).toLocaleDateString('th-TH', {day:'numeric', month:'short', year:'numeric'})} - {new Date(req.end_date).toLocaleDateString('th-TH', {day:'numeric', month:'short', year:'numeric'})}</div>
                                                
                                                <div className="text-slate-500 dark:text-gray-400 text-sm font-medium">จำนวน:</div>
                                                <div className="text-slate-800 dark:text-white text-sm font-medium">{Math.ceil((new Date(req.end_date).getTime() - new Date(req.start_date).getTime()) / (1000 * 3600 * 24)) + 1} วัน</div>
                                                
                                                <div className="text-slate-500 dark:text-gray-400 text-sm font-medium">ยื่นเมื่อ:</div>
                                                <div className="text-slate-800 dark:text-white text-sm font-medium">
                                                    {Math.floor((new Date().getTime() - new Date(req.created_at).getTime()) / (1000 * 3600)) > 24 
                                                        ? `${Math.floor((new Date().getTime() - new Date(req.created_at).getTime()) / (1000 * 3600 * 24))} ${t.daysAgo || 'วันที่แล้ว'}` 
                                                        : `${Math.floor((new Date().getTime() - new Date(req.created_at).getTime()) / (1000 * 3600))} ${t.hoursAgo || 'ชั่วโมงที่แล้ว'}`}
                                                </div>
                                            </div>

                                            {/* Reason block */}
                                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 mb-5 border border-slate-100 dark:border-slate-700/50">
                                                <p className="text-sm font-medium text-slate-700 dark:text-gray-300">
                                                    <span className="font-bold text-slate-800 dark:text-white mr-1">{t.reason}:</span> 
                                                    {req.reason}
                                                </p>
                                            </div>

                                            {/* Action Buttons */}
                                            {((req.status === 'pending' && userRole?.toLowerCase() !== 'manager') || (req.status === 'pending_manager' && (userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'hr' || req.approver_id === user?.id))) ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleLeaveAction(req.id, 'approved')} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 active:scale-95 transition-all">
                                                        {t.approve}
                                                    </button>
                                                    <button onClick={() => handleLeaveAction(req.id, 'rejected')} className="px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold active:scale-95 transition-all border border-red-100 dark:border-red-500/20">
                                                        {t.reject}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="h-[46px] flex items-center justify-center text-sm font-bold text-slate-400 dark:text-gray-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                                    {t.processed || 'ดำเนินการแล้ว'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* DEPARTMENTS */}
                    {activeTab === 'departments' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex justify-between items-center bg-white dark:bg-slate-800/80 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{t.all_departments_title}</h3>
                                    <p className="text-sm font-bold text-slate-500">{departments.length} {t.departments}</p>
                                </div>
                                <button onClick={() => { setEditingDepartment(undefined); setShowDeptModal(true); }} className="px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-base font-black hover:shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center gap-2.5 active:scale-95 shadow-lg">
                                    <Plus size={20} strokeWidth={3} /> {t.addDepartment}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {departments.map(dept => {
                                    const count = employees.filter(e => e.department === dept.name).length;
                                    return (
                                        <div key={dept.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:-translate-y-1.5 transition-all group">
                                            <div className="flex justify-between items-start mb-5">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
                                                    <Building2 size={24} strokeWidth={2.5} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setEditingDepartment(dept); setShowDeptModal(true); }} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-100"><Edit3 size={14} /></button>
                                                    <button onClick={() => handleDeleteDepartment(dept.id)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-black text-slate-800 mb-1.5">{dept.name}</h3>
                                            <p className="text-[13px] font-bold text-slate-500 mb-5 line-clamp-2 min-h-[36px]">{dept.description || 'ไม่มีคำอธิบาย'}</p>
                                            <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Users size={14} className="text-slate-300" /> {count} {t.persons}
                                                </span>
                                                <div className="flex -space-x-2">
                                                    {employees.filter(e => e.department === dept.name).slice(0, 3).map((e, i) => (
                                                        <img key={i} src={e.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.email}`} className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm bg-slate-100" alt="" />
                                                    ))}
                                                    {count > 3 && <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-500">+{count - 3}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {departments.length === 0 && (
                                    <div className="col-span-full text-center py-20 bg-slate-50 rounded-[2.5rem] border border-slate-200 border-dashed">
                                        <Building2 size={64} className="mx-auto mb-4 opacity-10 text-slate-400" />
                                        <p className="text-slate-400 font-bold">{t.noDepartments}</p>
                                    </div>
                                )}
                            </div>
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
                        <div className="space-y-6 animate-fadeIn max-w-4xl">
                            {/* SETTINGS TABS */}
                            <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1.5">
                                <button onClick={() => setSettingsTab('general')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${settingsTab === 'general' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}>ข้อมูลองค์กร</button>
                                <button onClick={() => setSettingsTab('shifts')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${settingsTab === 'shifts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}>กะการทำงาน</button>
                                <button onClick={() => setSettingsTab('leaves')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${settingsTab === 'leaves' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}>การลา</button>
                                <button onClick={() => setSettingsTab('finance')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${settingsTab === 'finance' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}>การเงิน</button>
                            </div>

                            {/* TAB CONTENT: GENERAL */}
                            {settingsTab === 'general' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                        <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-3"><Building2 size={24} className="text-indigo-600" /> {t.companyInfo}</h3>
                                        <div className="space-y-5">
                                            <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.companyName}</label><input value={settings.company_name || ''} onChange={e => setSettings({ ...settings, company_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" /></div>
                                            <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">ที่อยู่บริษัท (ใช้ในเอกสาร)</label><input value={settings.company_address || ''} onChange={e => setSettings({ ...settings, company_address: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" /></div>
                                            <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">เลขประจำตัวผู้เสียภาษี (13 หลัก)</label><input value={settings.company_tax_id || ''} onChange={e => setSettings({ ...settings, company_tax_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" maxLength={13} /></div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                        <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-3"><Clock size={24} className="text-orange-500" /> {t.workHours}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.workStart}</label><input type="time" value={settings.work_start_time} onChange={e => setSettings({ ...settings, work_start_time: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" /></div>
                                            <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.workEnd}</label><input type="time" value={settings.work_end_time} onChange={e => setSettings({ ...settings, work_end_time: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" /></div>
                                            <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.lateThreshold}</label><input type="number" value={settings.late_threshold_minutes} onChange={e => setSettings({ ...settings, late_threshold_minutes: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" /></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB CONTENT: WORK SHIFTS */}
                            {settingsTab === 'shifts' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                        <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-3"><Clock size={24} className="text-cyan-600" /> {t.workShifts}</h3>
                                        <div className="space-y-4 mb-8">
                                            {shifts.map(s => (
                                                <div key={s.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:border-indigo-200">
                                                    <div className="flex items-center gap-5">
                                                        <label className="relative inline-flex cursor-pointer items-center">
                                                            <input type="checkbox" checked={s.is_active} onChange={e => handleToggleShift(s.id, e.target.checked)} className="sr-only peer" />
                                                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                        </label>
                                                        <div>
                                                            <input
                                                                value={s.label}
                                                                onChange={e => handleUpdateShiftField(s.id, 'label', e.target.value)}
                                                                className={`bg-transparent border-none p-0 font-bold text-base focus:ring-0 focus:outline-none w-full ${s.is_active ? 'text-slate-800' : 'text-slate-400 line-through'}`}
                                                            />
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Time:</span>
                                                                    <input type="time" value={(s.start_time || '').slice(0, 5)} onChange={e => handleUpdateShiftField(s.id, 'start_time', e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-indigo-600 shadow-sm" />
                                                                    <span className="text-xs text-slate-300">-</span>
                                                                    <input type="time" value={(s.end_time || '').slice(0, 5)} onChange={e => handleUpdateShiftField(s.id, 'end_time', e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-indigo-600 shadow-sm" />
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Late:</span>
                                                                    <input type="number" value={s.late_threshold_minutes} onChange={e => handleUpdateShiftField(s.id, 'late_threshold_minutes', Number(e.target.value))} className="w-12 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-indigo-600 text-center shadow-sm" />
                                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Mins</span>
                                                                </div>
                                                                <label className="flex items-center gap-2 cursor-pointer bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                                                    <input type="checkbox" checked={s.is_overnight} onChange={e => handleUpdateShiftField(s.id, 'is_overnight', e.target.checked)} className="w-3.5 h-3.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500/20" />
                                                                    <span className="text-[10px] font-bold text-amber-700 uppercase">Overnight</span>
                                                                </label>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200 px-2 py-1 rounded-lg">Staff: {employees.filter(e => e.shift_id === s.id).length}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleDeleteShift(s.id)} className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                            {shifts.length === 0 && <p className="text-slate-400 text-sm font-bold text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">ยังไม่มีกะการทำงาน — กรุณาตั้งค่ากะใหม่</p>}
                                        </div>
                                        <div className="border-t border-slate-100 pt-8">
                                            <p className="text-sm font-black text-slate-800 mb-5 flex items-center gap-2"><PlusCircle size={18} className="text-indigo-600" /> เพิ่มกะใหม่</p>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Key (อังกฤษ)</label><input value={newShift.name} onChange={e => setNewShift({ ...newShift, name: e.target.value.toLowerCase().replace(/\s/g, '_') })} placeholder="early_morning" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" /></div>
                                                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">ชื่อแสดง</label><input value={newShift.label} onChange={e => setNewShift({ ...newShift, label: e.target.value })} placeholder="กะเช้า (06:00-15:00)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" /></div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4 mb-5">
                                                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">เริ่ม</label><input type="time" value={newShift.start_time} onChange={e => setNewShift({ ...newShift, start_time: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" /></div>
                                                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">เลิก</label><input type="time" value={newShift.end_time} onChange={e => setNewShift({ ...newShift, end_time: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" /></div>
                                                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">สาย (นาที)</label><input type="number" value={newShift.late_threshold_minutes} onChange={e => setNewShift({ ...newShift, late_threshold_minutes: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" /></div>
                                                <div className="flex items-end"><button onClick={handleAddShift} className="w-full h-[46px] bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"><Plus size={18} /> เพิ่มกะ</button></div>
                                            </div>
                                            <label className="flex items-center gap-3 cursor-pointer w-fit group">
                                                <input type="checkbox" checked={newShift.is_overnight} onChange={e => setNewShift({ ...newShift, is_overnight: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 transition-all" />
                                                <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">🌙 กะข้ามคืน (เช่น 22:00-07:00)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB CONTENT: LEAVES */}
                            {settingsTab === 'leaves' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                        <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-3"><FileText size={24} className="text-emerald-600" /> โควตาการลาพื้นฐาน (ใช้คำนวณ KPI)</h3>
                                        <div className="grid grid-cols-3 gap-6">
                                            <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">ลาพักร้อน (วัน/ปี)</label><input type="number" value={settings.annual_leave_quota || ''} onChange={e => setSettings({ ...settings, annual_leave_quota: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" placeholder="6" /></div>
                                            <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">ลาป่วย (วัน/ปี)</label><input type="number" value={settings.sick_leave_quota || ''} onChange={e => setSettings({ ...settings, sick_leave_quota: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" placeholder="30" /></div>
                                            <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">ลากิจ (วัน/ปี)</label><input type="number" value={settings.personal_leave_quota || ''} onChange={e => setSettings({ ...settings, personal_leave_quota: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all" placeholder="3" /></div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-8">
                                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3"><FileText size={24} className="text-emerald-600" /> ประเภทการลา</h3>
                                            <button
                                                onClick={handleInitializeDefaultLeaveTypes}
                                                className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-200 uppercase tracking-widest"
                                            >
                                                <PlusCircle size={18} /> ใส่ประเภทการลามาตรฐานทั้งหมด (10 อย่าง)
                                            </button>
                                        </div>
                                        <div className="space-y-4 mb-8">
                                            {leaveTypes.map(lt => (
                                                <div key={lt.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-slate-50 rounded-2xl border ${lt.is_active ? 'border-indigo-200 shadow-sm' : 'border-slate-200 opacity-60'} transition-all`}>
                                                    <div className="flex items-center gap-5 w-full">
                                                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
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
                                                                    <label className="flex items-center gap-2 shrink-0">
                                                                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">ย้อนหลัง (วัน):</span>
                                                                        <input
                                                                            type="number"
                                                                            value={lt.max_days_backdated || (typeof lt.allow_retroactive === 'number' ? lt.allow_retroactive : lt.allow_retroactive ? 30 : 0)}
                                                                            onChange={e => handleUpdateLeaveTypeField(lt.id, 'max_days_backdated', Number(e.target.value))}
                                                                            className="w-14 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-2 py-1 text-xs text-gray-700 dark:text-indigo-300 focus:outline-none focus:border-indigo-500 text-center"
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
                                        <div className="border-t border-slate-100 pt-5">
                                            <p className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                <Plus size={18} className="text-indigo-600" /> เพิ่มประเภทลาใหม่
                                            </p>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Key (อังกฤษ)</label>
                                                        <input value={newLeaveType.name} onChange={e => setNewLeaveType({ ...newLeaveType, name: e.target.value.toLowerCase().replace(/\s/g, '_') })} placeholder="wedding" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">ชื่อแสดง (ไทย)</label>
                                                        <input value={newLeaveType.label} onChange={e => setNewLeaveType({ ...newLeaveType, label: e.target.value })} placeholder="ลาแต่งงาน" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">โควตา วัน/ปี</label>
                                                        <input type="number" value={newLeaveType.quota_per_year} onChange={e => setNewLeaveType({ ...newLeaveType, quota_per_year: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">ล่วงหน้า (วัน)</label>
                                                        <input type="number" value={newLeaveType.advance_days} onChange={e => setNewLeaveType({ ...newLeaveType, advance_days: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                                    </div>
                                                    <div className="flex flex-col justify-center pb-2">
                                                        <label className="flex items-center gap-2 cursor-pointer group">
                                                            <input type="checkbox" checked={newLeaveType.allow_retroactive} onChange={e => setNewLeaveType({ ...newLeaveType, allow_retroactive: e.target.checked })} className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 transition-all" />
                                                            <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">อนุญาตย้อนหลัง</span>
                                                        </label>
                                                    </div>
                                                    <div className="flex items-end">
                                                        <button onClick={handleAddLeaveType} className="w-full px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md">
                                                            <Plus size={18} strokeWidth={2.5} /> {t.add || 'เพิ่ม'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <label className="flex items-center gap-2 cursor-pointer group">
                                                        <input type="checkbox" checked={newLeaveType.is_paid} onChange={e => setNewLeaveType({ ...newLeaveType, is_paid: e.target.checked })} className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 transition-all" />
                                                        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">ลาได้เงิน (Paid Leave)</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB CONTENT: FINANCE */}
                            {settingsTab === 'finance' && (
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 animate-fadeIn shadow-sm">
                                    <h3 className="text-lg font-black mb-5 flex items-center gap-2 text-slate-800">
                                        <DollarSign size={22} className="text-amber-500" /> การเงิน
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">ทำงาน (วัน/เดือน) สำหรับคิดฐานเงินเดือน</label>
                                            <input type="number" value={settings.working_days_per_month || '30'} onChange={e => setSettings({ ...settings, working_days_per_month: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" placeholder="30, 26, หรือ 22" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">หักสาย (บาท/ครั้ง)</label>
                                            <input type="number" value={settings.late_deduction_per_time} onChange={e => setSettings({ ...settings, late_deduction_per_time: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">หักขาดงาน (บาท/วัน) (ถ้า 0 คือหักตามฐานรายวัน)</label>
                                            <input type="number" value={settings.absent_deduction_per_day} onChange={e => setSettings({ ...settings, absent_deduction_per_day: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">OT Multiplier</label>
                                            <input type="number" step="0.1" value={settings.ot_rate_multiplier} onChange={e => setSettings({ ...settings, ot_rate_multiplier: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">ประกันสังคม (%)</label>
                                            <input type="number" value={settings.social_security_rate} onChange={e => setSettings({ ...settings, social_security_rate: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">ปกส. สูงสุด (บาท)</label>
                                            <input type="number" value={settings.social_security_max} onChange={e => setSettings({ ...settings, social_security_max: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button onClick={handleSaveSettings} disabled={settingsSaving} className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-white shadow-lg shadow-indigo-900/20 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"><Save size={20} /> {settingsSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</button>
                        </div>
                    )}


                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
