import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://pnpmpwkdlbbmsxqwwnjc.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucG1wd2tkbGJibXN4cXd3bmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzMxODIsImV4cCI6MjEwMTYwOTE4Mn0.ue5tC9i3dhLBIR6CPzsJUYvVn41V5OGOTcrcJ0QPrYY';

let cachedUrl: string | null = null;
let cachedKey: string | null = null;
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.SUPABASE_ANON_KEY;
  
  const url = envUrl || DEFAULT_SUPABASE_URL;
  const key = envKey || DEFAULT_SUPABASE_ANON_KEY;

  if (!supabaseClient || cachedUrl !== url || cachedKey !== key) {
    cachedUrl = url;
    cachedKey = key;
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

