import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.VUE_APP_SUPABASE_URL

const supabaseKey =
  process.env.VUE_APP_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null