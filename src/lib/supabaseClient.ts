import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedUrl: string | null = null;
let cachedKey: string | null = null;
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.SUPABASE_URL || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL : undefined);
  const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY : undefined);

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

