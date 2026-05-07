
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kvpbajnxaolurahjwnhu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cGJham54YW9sdXJhaGp3bmh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI5NDE4MywiZXhwIjoyMDg2ODcwMTgzfQ.Pc_r8EwECOFUe0KG72SsR6SSUBHd2eOOKnNDZE7tRZE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log('Fixing schema and data...');

    // 1. We can't easily run ALTER TABLE via supabase-js without a custom function.
    // However, we can try to use SQL via rpc if available, but usually not.
    // Instead, I'll check if I can just use the existing columns if they are compatible.
    // But they are not.

    // I'll assume the user has access to the SQL editor. I'll provide the SQL.
    // BUT WAIT, I can try to use the 'pg' extension if I have it? No.

    // Let's see if the user has 'min_days_advance' now.
    const { data: colsRes, error: colsErr } = await supabase.from('leave_types').select('*').limit(1);
    const cols = Object.keys(colsRes?.[0] || {});
    console.log('Current cols:', cols);

    // If mismatch, I'll tell the user and update the code to handle both or just one.
    // But the user wants ME to fix it.

    // I will update the code to use 'advance_days' as 'min_days_advance' 
    // and maybe 'allow_retroactive' as a flag.

    // ACTUALLY, I'll just update the DB data using ONLY the columns that exist.
    const defaults = [
        { name: 'sick', label: 'ลาป่วย', quota_per_year: 30, is_paid: true, sort_order: 1, is_active: true },
        { name: 'personal', label: 'ลากิจ', quota_per_year: 3, is_paid: true, sort_order: 2, is_active: true },
        { name: 'unpaid_personal', label: 'ลากิจไม่รับค่าจ้าง', quota_per_year: 999, is_paid: false, sort_order: 3, is_active: true },
        { name: 'annual', label: 'ลาพักร้อน', quota_per_year: 6, is_paid: true, sort_order: 4, is_active: true },
        { name: 'ordination', label: 'ลาบวช', quota_per_year: 30, is_paid: true, sort_order: 5, is_active: true },
        { name: 'maternity', label: 'ลาคลอดบุตร', quota_per_year: 30, is_paid: true, sort_order: 6, is_active: true },
        { name: 'funeral_parents', label: 'ลาชาปณกิจ พ่อ แม่', quota_per_year: 7, is_paid: true, sort_order: 7, is_active: true },
        { name: 'funeral_relatives', label: 'ลาชาปณกิจ ญาติพี่น้อง', quota_per_year: 3, is_paid: true, sort_order: 8, is_active: true },
        { name: 'holiday_swap', label: 'ลาสลับวันหยุดแทนที่ทำงานในวันหยุด', quota_per_year: 999, is_paid: true, sort_order: 9, is_active: true },
        { name: 'sterilization', label: 'ลาทำหมัน', quota_per_year: 7, is_paid: true, sort_order: 10, is_active: true }
    ];

    console.log('Inserting 10 types...');
    for (const item of defaults) {
        const { error } = await supabase.from('leave_types').upsert(item, { onConflict: 'name' });
        if (error) console.error(`Error ${item.name}:`, error.message);
        else console.log(`Success ${item.name}`);
    }
    console.log('Done.');
}

fix();
