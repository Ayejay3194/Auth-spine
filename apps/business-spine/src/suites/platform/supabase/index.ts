// Supabase Suite - Supabase Integration
// Exports Supabase-related functionality

// Supabase Components
// export { default as SupabaseAuth } from './components/SupabaseAuth';
// export { default as SupabaseStorage } from './components/SupabaseStorage';
// export { default as SupabaseDatabase } from './components/SupabaseDatabase';

// Supabase Hooks
// export { default as useSupabase } from './hooks/useSupabase';
// export { default as useSupabaseAuth } from './hooks/useSupabaseAuth';
// export { default as useSupabaseStorage } from './hooks/useSupabaseStorage';

// Supabase Services
// export { default as supabaseService } from './services/supabaseService';

// Supabase Types
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
  options?: Record<string, any>;
}

export interface SupabaseUser {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupabaseFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  createdAt: Date;
}

export interface SupabaseQuery {
  table: string;
  select?: string;
  filter?: Record<string, any>;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

// Supabase Constants
export const SUPABASE_TABLES = {
  USERS: 'users',
  PROFILES: 'profiles',
  FILES: 'files',
  AUDIT: 'audit'
} as const;

export const SUPABASE_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
} as const;
