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

async function testQuery() {
    console.log('--- Testing query ---');
    const { data, error } = await supabase.from('leave_requests').select('*, requester:profiles!leave_requests_user_id_fkey(first_name, last_name, avatar_url)');
    if (error) {
        console.error('Error fetching leave_requests:', error);
    } else {
        console.log('Success!', data.length, 'records.');
    }
}

testQuery();
