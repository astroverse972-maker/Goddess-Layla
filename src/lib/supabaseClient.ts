import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pnpmpwkdlbbmsxqwwnjc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucG1wd2tkbGJibXN4cXd3bmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzMxODIsImV4cCI6MjEwMTYwOTE4Mn0.ue5tC9i3dhLBIR6CPzsJUYvVn41V5OGOTcrcJ0QPrYY';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL || SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}
