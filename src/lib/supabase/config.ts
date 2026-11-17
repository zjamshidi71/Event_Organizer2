// Reads the Supabase connection settings from environment variables.
// Locally: put them in .env.local (see .env.example).
// On Vercel: Project → Settings → Environment Variables.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

// Supabase now calls the public key the "publishable key"; older projects call it the "anon key".
// Either one works.
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ' +
        '(or NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local or in your Vercel environment variables.',
    )
  }
}
