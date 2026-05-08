
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  if (typeof window !== 'undefined') {
    console.error("❌ Missing Supabase Environment Variables! Please check Vercel settings.");
  }
}

export { supabaseUrl, supabaseKey };
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
