
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

async function listEmployees() {
    console.log('--- Employee List from Supabase ---');
    const { data, error } = await supabase
        .from('profiles')
        .select('email, first_name, last_name, employee_code, role');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No profiles found in database.');
    } else {
        console.table(data);
    }
}

listEmployees();
