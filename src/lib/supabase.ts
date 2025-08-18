import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      items: {
        Row: {
          id: string
          user_id: string
          type: 'todo' | 'memo' | 'link' | 'list' | 'date'
          title: string
          content?: string
          done: boolean
          href?: string
          list?: string[]
          date?: { selectedDate: string; note: string }
          tags: string[]
          color?: { base?: string; shadow?: string; highlight?: string }
          created_at: string
          updated_at: string
          deleted_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'todo' | 'memo' | 'link' | 'list' | 'date'
          title: string
          content?: string
          done?: boolean
          href?: string
          list?: string[]
          date?: { selectedDate: string; note: string }
          tags?: string[]
          color?: { base?: string; shadow?: string; highlight?: string }
          created_at?: string
          updated_at?: string
          deleted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'todo' | 'memo' | 'link' | 'list' | 'date'
          title?: string
          content?: string
          done?: boolean
          href?: string
          list?: string[]
          date?: { selectedDate: string; note: string }
          tags?: string[]
          color?: { base?: string; shadow?: string; highlight?: string }
          created_at?: string
          updated_at?: string
          deleted_at?: string
        }
      }
    }
  }
}
