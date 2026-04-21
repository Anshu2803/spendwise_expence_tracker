import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'placeholder_key';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
