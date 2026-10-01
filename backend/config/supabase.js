/**
 * Supabase Client Configuration
 * ─────────────────────────────
 * CRITICAL SECURITY RULES:
 * 1. supabaseAdmin (service role) — BACKEND ONLY. Never expose to frontend.
 * 2. supabaseAnon (anon key) — Safe for frontend reads with RLS enforced.
 */

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ickofuqtxsexxyjenmac.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  if (process.env.NODE_ENV !== "test") {
    console.warn("⚠️ [Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Supabase features will be unavailable.");
  }
}

/**
 * Server-side admin client — full access, bypasses RLS.
 * USE ONLY IN: controllers, migration scripts, admin routes.
 * NEVER expose to browser/frontend.
 */
const supabaseAdmin = SUPABASE_URL && SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Check whether Supabase is configured.
 */
const isSupabaseConfigured = () => !!(SUPABASE_URL && SERVICE_ROLE_KEY);

module.exports = { supabaseAdmin, isSupabaseConfigured };
