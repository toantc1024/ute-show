"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  createClient,
  type SupabaseClient,
  type Session,
  type User,
} from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// NOTE: In a real production app with Next.js App Router,
// you should use @supabase/ssr for better server/client handling.
// For this specific request, we'll stick to the client-side singleton pattern
// consistent with the existing dependencies to keep it simple and working.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY)

type SupabaseContextValue = {
  supabase: SupabaseClient<Database>
  session: Session | null
  user: User | null
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(
  undefined
)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <SupabaseContext.Provider value={{ supabase, session, user }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    // throw new Error("useSupabase must be used inside SupabaseProvider")
    return { supabase, session: null, user: null }
  }
  return context
}
