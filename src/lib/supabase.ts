import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing')

// Create a mock client if environment variables are missing
let supabase: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using mock client.')
  console.warn('Please check your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  // Create a mock client that returns empty data
  supabase = {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Mock client - no real data' } })
          })
        })
      })
    })
  }
} else {
  console.log('Creating Supabase client with real credentials')
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
