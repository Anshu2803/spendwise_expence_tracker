import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kdxkvpydmcozdexwdgdr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeGt2cHlkbWNvemRleHdkZ2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTg3MDQsImV4cCI6MjA5MjM3NDcwNH0.9PCFptVUI41ekHXR7KPN_IwmJQ4AB1u0EQyCqzstQpI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
