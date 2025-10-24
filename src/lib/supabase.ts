import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}

export const POPULAR_LANGUAGES = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript',
  'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
  'HTML', 'CSS', 'SQL', 'Bash', 'PowerShell',
  'Skript', 'Lua', 'Perl', 'R', 'Scala', 'Haskell'
];
