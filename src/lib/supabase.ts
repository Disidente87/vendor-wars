import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

// Only throw error in production
if (process.env.NODE_ENV === 'production' && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  // Add global fetch configuration for Node.js compatibility
  global: {
    fetch: fetch
  }
})

// Tipos para las tablas de Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          fid: number
          username: string
          display_name: string
          avatar_url: { url: string }
          battle_tokens: number
          vote_streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          fid: number
          username: string
          display_name: string
          avatar_url?: { url: string }
          battle_tokens?: number
          vote_streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          fid?: number
          username?: string
          display_name?: string
          avatar_url?: { url: string }
          battle_tokens?: number
          vote_streak?: number
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string
          category: string
          zone_id: string
          total_votes: number
          verified_votes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url: string
          category: string
          zone_id: string
          total_votes?: number
          verified_votes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string
          category?: string
          zone_id?: string
          total_votes?: number
          verified_votes?: number
          created_at?: string
          updated_at?: string
        }
      }
      zones: {
        Row: {
          id: string
          name: string
          description: string
          color: string
          coordinates: [number, number]
          current_owner_id: string | null
          heat_level: number
          total_votes: number
          active_vendors: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          color: string
          coordinates: [number, number]
          current_owner_id?: string | null
          heat_level?: number
          total_votes?: number
          active_vendors?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          color?: string
          coordinates?: [number, number]
          current_owner_id?: string | null
          heat_level?: number
          total_votes?: number
          active_vendors?: number
          created_at?: string
          updated_at?: string
        }
      }

      votes: {
        Row: {
          id: string
          voter_fid: number
          vendor_id: string
          is_verified: boolean
          token_reward: number
          multiplier: number
          vote_date: string
          created_at: string
          reason?: string
        }
        Insert: {
          id?: string
          voter_fid: number
          vendor_id: string
          is_verified?: boolean
          token_reward?: number
          multiplier?: number
          vote_date?: string
          created_at?: string
          reason?: string
        }
        Update: {
          id?: string
          voter_fid?: number
          vendor_id?: string
          is_verified?: boolean
          token_reward?: number
          multiplier?: number
          vote_date?: string
          created_at?: string
          reason?: string
        }
      }
      attestations: {
        Row: {
          id: string
          vote_id: string
          user_fid: number
          vendor_id: string
          photo_hash: string
          photo_url: string
          gps_location: [number, number]
          verification_confidence: number
          status: 'pending' | 'approved' | 'rejected'
          processing_time: number
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          vote_id: string
          user_fid: number
          vendor_id: string
          photo_hash: string
          photo_url: string
          gps_location: [number, number]
          verification_confidence?: number
          status?: 'pending' | 'approved' | 'rejected'
          processing_time?: number
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          vote_id?: string
          user_fid?: number
          vendor_id?: string
          photo_hash?: string
          photo_url?: string
          gps_location?: [number, number]
          verification_confidence?: number
          status?: 'pending' | 'approved' | 'rejected'
          processing_time?: number
          metadata?: any
          created_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 