import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedUrl: string | null = null;
let cachedKey: string | null = null;
let supabaseClient: SupabaseClient | null = null;

const DEFAULT_SUPABASE_URL = 'https://pnpmpwkdlbbmsxqwwnjc.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucG1wd2tkbGJibXN4cXd3bmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzMxODIsImV4cCI6MjEwMTYwOTE4Mn0.ue5tC9i3dhLBIR6CPzsJUYvVn41V5OGOTcrcJ0QPrYY';

export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!supabaseClient || cachedUrl !== url || cachedKey !== key) {
    cachedUrl = url;
    cachedKey = key;
    supabaseClient = createClient(url, key);
  }

  return supabaseClient;
}


