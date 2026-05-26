import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isConfigured = Boolean(
  url && key && !url.includes('your-project') && !key.includes('your-anon')
);

const supabaseUrl = url || 'https://placeholder.supabase.co';
const supabaseKey = key || 'placeholder';

// Browser singleton — safe to import in 'use client' components
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Factory for server components (new instance per request, anon key)
export function createServerClient() {
  return createClient(supabaseUrl, supabaseKey);
}

// Factory for API routes / cron jobs that need to bypass RLS (service role key)
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY env var is not set');
  }
  return createClient(supabaseUrl, serviceKey);
}

// Auth helpers
export async function signInWithMagicLink(email: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });
}

export async function signInWithGoogle() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
