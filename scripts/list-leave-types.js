
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kvpbajnxaolurahjwnhu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cGJham54YW9sdXJhaGp3bmh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI5NDE4MywiZXhwIjoyMDg2ODcwMTgzfQ.Pc_r8EwECOFUe0KG72SsR6SSUBHd2eOOKnNDZE7tRZE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('leave_types').select('*');
    if (error) console.error(error);
    else console.log(data);
}

check();
