import { createClient } from '@supabase/supabase-js';

// Check if we're running on the client side
const isBrowser = typeof window !== 'undefined';

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (isBrowser) {
    console.error('Missing Supabase credentials. Please check your .env.local file.');
  }
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
