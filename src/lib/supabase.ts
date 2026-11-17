import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isAuthConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isAuthConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export const authSetupHint =
  "Student accounts need Supabase Auth. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the deployment environment.";
