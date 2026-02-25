import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDemoAccount() {
  console.log('Creating demo account...');

  const demoEmail = 'demo@example.com';
  const demoPassword = 'password123';
  const demoEmployeeCode = 'DEMO001';

  // 1. Create a user in auth.users
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: demoEmail,
    password: demoPassword,
    email_confirm: true,
    user_metadata: {
      first_name: 'Demo',
      last_name: 'User',
      employee_code: demoEmployeeCode,
    }
  });

  if (userError) {
    if (userError.message.includes('already been registered') || userError.message.includes('User already registered')) {
      console.log('Demo user already exists in auth.users.');
    } else {
      console.error('Error creating user:', userError);
      return;
    }
  } else {
    console.log(`User created successfully with ID: ${userData.user.id}`);
    
    // Check if the user is in public.profiles (due to trigger).
    // The profile might have been auto-created by a trigger on auth.users, let's update it.
    console.log('Updating profile with demo details...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: 'Demo',
        last_name: 'User',
        employee_code: demoEmployeeCode,
        role: 'admin',
        department: 'Management',
        position: 'Demo Admin',
      })
      .eq('id', userData.user.id);
      
    if (profileError) {
      console.error('Error updating profile:', profileError);
    } else {
      console.log('Profile updated successfully.');
    }
  }

  console.log('\n--- DEMO ACCOUNT DETAILS ---');
  console.log(`Email: ${demoEmail}`);
  console.log(`Password: ${demoPassword}`);
  console.log(`Employee Code: ${demoEmployeeCode}`);
  console.log('----------------------------\n');
}

createDemoAccount();
