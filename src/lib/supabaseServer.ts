import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://pnpmpwkdlbbmsxqwwnjc.supabase.co';
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucG1wd2tkbGJibXN4cXd3bmpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjAzMzE4MiwiZXhwIjoyMTAxNjA5MTgyfQ.tFK3aqhKFPurvJJDhkBTx38GhxIa1-fcwlWcoOyLyDE';

let supabaseClient: SupabaseClient | null = null;
let cachedUrl: string | null = null;
let cachedKey: string | null = null;

export const getSupabaseServerClient = (): SupabaseClient => {
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseClient || cachedUrl !== url || cachedKey !== key) {
    cachedUrl = url;
    cachedKey = key;
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false }
    });
  }

  return supabaseClient;
};



