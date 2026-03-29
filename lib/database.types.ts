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
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string | null
          checkin_start: string | null
          checkin_end: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date?: string | null
          checkin_start?: string | null
          checkin_end?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string | null
          checkin_start?: string | null
          checkin_end?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      guests: {
        Row: {
          id: string
          name: string
          chuc_vu: string
          don_vi: string
          event_id: string | null
          student_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          chuc_vu: string
          don_vi: string
          event_id?: string | null
          student_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          chuc_vu?: string
          don_vi?: string
          event_id?: string | null
          student_id?: string | null
          created_at?: string
        }
      }
      checkins: {
        Row: {
          id: string
          name: string
          chuc_vu: string
          don_vi: string
          event_id: string | null
          student_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          chuc_vu: string
          don_vi: string
          event_id?: string | null
          student_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          chuc_vu?: string
          don_vi?: string
          event_id?: string | null
          student_id?: string | null
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
