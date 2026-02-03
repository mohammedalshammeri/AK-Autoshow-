import { createClient } from '@supabase/supabase-js'

// Read the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if the variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and/or Anon Key are not defined in .env.local')
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
