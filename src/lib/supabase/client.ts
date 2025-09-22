import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Define a function to create a Supabase client for client-side use (Auth Helpers - consistent cookies)
export const createClient = () => {
  try {
    return createClientComponentClient()
  } catch (error) {
    console.error('Supabase client creation failed:', error)
    // Return a mock client for development when env vars are missing
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
      return {
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signOut: async () => ({ error: null }),
          signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
          signUp: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
          signInWithOAuth: async () => ({ error: { message: 'Supabase not configured' } }),
          resetPasswordForEmail: async () => ({ error: { message: 'Supabase not configured' } })
        } as unknown as ReturnType<typeof createClientComponentClient>,
        from: () => ({
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  single: () => Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found' } })
                })
              })
            })
          })
        })
      }
    }
    throw error
  }
}