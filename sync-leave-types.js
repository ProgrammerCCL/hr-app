
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kvpbajnxaolurahjwnhu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cGJham54YW9sdXJhaGp3bmh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI5NDE4MywiZXhwIjoyMDg2ODcwMTgzfQ.Pc_r8EwECOFUe0KG72SsR6SSUBHd2eOOKnNDZE7tRZE';
const supabase = createClient(supabaseUrl, supabaseKey);

const defaults = [
    { name: 'sick', label: 'ลาป่วย', quota_per_year: 30, is_paid: true, min_days_advance: 0, max_days_backdated: 2, sort_order: 1, is_active: true },
    { name: 'personal', label: 'ลากิจ', quota_per_year: 3, is_paid: true, min_days_advance: 3, max_days_backdated: 0, sort_order: 2, is_active: true },
    { name: 'unpaid_personal', label: 'ลากิจไม่รับค่าจ้าง', quota_per_year: 999, is_paid: false, min_days_advance: 3, max_days_backdated: 0, sort_order: 3, is_active: true },
    { name: 'annual', label: 'ลาพักร้อน', quota_per_year: 6, is_paid: true, min_days_advance: 3, max_days_backdated: 0, sort_order: 4, is_active: true },
    { name: 'ordination', label: 'ลาบวช', quota_per_year: 30, is_paid: true, min_days_advance: 30, max_days_backdated: 0, sort_order: 5, is_active: true },
    { name: 'maternity', label: 'ลาคลอดบุตร', quota_per_year: 30, is_paid: true, min_days_advance: 30, max_days_backdated: 0, sort_order: 6, is_active: true },
    { name: 'funeral_parents', label: 'ลาชาปณกิจ พ่อ แม่', quota_per_year: 7, is_paid: true, min_days_advance: 0, max_days_backdated: 3, sort_order: 7, is_active: true },
    { name: 'funeral_relatives', label: 'ลาชาปณกิจ ญาติพี่น้อง', quota_per_year: 3, is_paid: true, min_days_advance: 0, max_days_backdated: 3, sort_order: 8, is_active: true },
    { name: 'holiday_swap', label: 'ลาสลับวันหยุดแทนที่ทำงานในวันหยุด', quota_per_year: 999, is_paid: true, min_days_advance: 1, max_days_backdated: 0, sort_order: 9, is_active: true },
    { name: 'sterilization', label: 'ลาทำหมัน', quota_per_year: 7, is_paid: true, min_days_advance: 1, max_days_backdated: 0, sort_order: 10, is_active: true }
];

async function sync() {
    console.log('Syncing leave types...');
    for (const item of defaults) {
        const { data, error } = await supabase
            .from('leave_types')
            .upsert(item, { onConflict: 'name' });

        if (error) {
            console.error(`Error syncing ${item.name}:`, error.message);
        } else {
            console.log(`Synced ${item.name}`);
        }
    }
    console.log('Done!');
}

sync();
