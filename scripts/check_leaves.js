import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkLeaveData() {
    console.log('--- checking leave requests ---');
    const { data, error } = await supabase.from('leave_requests').select('*');
    if (error) {
        console.error(error);
    } else {
        console.table(data);
    }
}
checkLeaveData();
