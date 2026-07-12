import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite environment variables (.env file in root)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
