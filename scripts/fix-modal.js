import fs from 'fs';

let txt = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const regex = /\/\/\s+=====\s+EMPLOYEE\s+EDIT\s+MODAL\s+=====\s*[\s\S]*?(?=\/\/\s+=====\s+DEPARTMENT\s+MODAL\s+=====)/g;

const replacement = `// ===== EMPLOYEE EDIT MODAL =====
const EmployeeEditModal = ({ employee, departments, shifts, allEmployees, onSave, onClose }: { employee: Profile; departments: Department[]; shifts: WorkShift[]; allEmployees: Profile[]; onSave: (u: Partial<Profile>) => void; onClose: () => void }) => {
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
    });
    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="glass-panel w-full max-w-lg p-6 space-y-4 border border-white/10 animate-fadeIn my-8">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">แก้ไขพนักงาน</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden"><img src={employee.avatar_url || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${employee.email}\`} alt="" className="w-full h-full object-cover" /></div>
                    <div><p className="font-medium">{employee.email}</p><p className="text-xs text-gray-400">รหัส: {employee.employee_code || 'ยังไม่ตั้ง'} | ID: {employee.id.slice(0, 8).toUpperCase()}</p></div>
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
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs text-gray-400 mb-1">เบอร์โทร</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                    <div><label className="block text-xs text-gray-400 mb-1">⏰ กะการทำงาน</label><select value={form.shift_id} onChange={e => setForm({ ...form, shift_id: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm outline-none"><option value="">-- ไม่กำหนด --</option>{shifts.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs text-gray-400 mb-1">💰 เงินเดือน (บาท)</label><input type="number" value={form.base_salary} onChange={e => setForm({ ...form, base_salary: Number(e.target.value) })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                    <div><label className="block text-xs text-gray-400 mb-1">🏦 ธนาคาร</label><input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="เช่น กสิกร" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs text-gray-400 mb-1">เลขบัญชี</label><input value={form.bank_account} onChange={e => setForm({ ...form, bank_account: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                    <div><label className="block text-xs text-gray-400 mb-1">เลขประจำตัวผู้เสียภาษี</label><input value={form.tax_id} onChange={e => setForm({ ...form, tax_id: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none" /></div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-sm text-gray-300">พนักงานปัจจุบัน (Active)</span></label>
                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition">ยกเลิก</button>
                    <button onClick={() => onSave(form)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold active:scale-95 transition flex items-center justify-center gap-2"><Save size={18} /> บันทึก</button>
                </div>
            </div>
        </div>
    );
};

`;

txt = txt.replace(regex, replacement);

fs.writeFileSync('src/pages/AdminDashboard.tsx', txt, 'utf8');

console.log('Done replacement');
