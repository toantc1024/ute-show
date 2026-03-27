export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      guests: {
        Row: {
          id: string
          name: string
          chuc_vu: string
          don_vi: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          chuc_vu: string
          don_vi: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          chuc_vu?: string
          don_vi?: string
          created_at?: string
        }
      }
      checkins: {
        Row: {
          id: string
          name: string
          chuc_vu: string
          don_vi: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          chuc_vu: string
          don_vi: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          chuc_vu?: string
          don_vi?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
