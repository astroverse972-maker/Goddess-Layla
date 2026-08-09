import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const getSupabaseServerClient = (): SupabaseClient | null => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false }
  });
};




