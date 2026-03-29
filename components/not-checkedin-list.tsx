"use client"

import { useSupabase } from "@/components/supabase-provider"
import { useEvent } from "@/components/event-context"
import { useEffect, useMemo, useState } from "react"
import type { Database } from "@/lib/database.types"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type GuestRow = Database["public"]["Tables"]["guests"]["Row"]

export function NotCheckedInList() {
  const { supabase } = useSupabase()
  const { selectedEventId } = useEvent()
  const [guests, setGuests] = useState<GuestRow[]>([])
  const [checkedInNames, setCheckedInNames] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (!supabase || !selectedEventId) return
    try {
      const [{ data: guestData }, { data: checkinData }] = await Promise.all([
        supabase.from("guests").select("*").eq("event_id", selectedEventId).order("name", { ascending: true }),
        supabase.from("checkins").select("name").eq("event_id", selectedEventId)
      ])

      const checkedNames = new Set(((checkinData || []) as { name: string }[]).map((c) => c.name.trim().toLowerCase()))
      setGuests(guestData || [])
      setCheckedInNames(checkedNames)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel("not_checkedin_sync_admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, () => fetchData())
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [supabase, selectedEventId])

  const notCheckedIn = useMemo(() => {
    return guests.filter((g) => !checkedInNames.has(g.name.trim().toLowerCase()))
  }, [guests, checkedInNames])

  if (loading && guests.length === 0) {
    return <div className="py-20 text-center font-bold text-slate-400 uppercase tracking-widest animate-pulse">Đang đồng bộ danh sách vắng...</div>
  }

  if (notCheckedIn.length === 0) return null // Parent component handles empty state

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-black text-on-surface tracking-widest uppercase opacity-70">Danh sách đại biểu vắng mặt</h4>
        <span className="text-[10px] font-black text-secondary bg-secondary/10 px-3 py-1 rounded-full uppercase tracking-tighter">
          {notCheckedIn.length} VẮNG MẶT
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {notCheckedIn.map((guest) => (
            <motion.div
              key={guest.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low/30 hover:bg-surface-container-low transition-all border border-outline-variant/10 group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black shadow-inner">
                  {guest.name.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-on-surface uppercase tracking-tight text-sm leading-tight">{guest.name}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 mt-1">
                    {guest.don_vi} {guest.student_id ? `• ${guest.student_id}` : ""}
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-[9px] font-black tracking-widest uppercase">
                MISSING
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
