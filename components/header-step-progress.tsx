"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useEvent } from "@/components/event-context"
import { cn } from "@/lib/utils"
import { Check, Loader2 } from "lucide-react"
import type { Database } from "@/lib/database.types"

type CheckinRow = Database["public"]["Tables"]["checkins"]["Row"]
type StepStatus = "pending" | "ongoing" | "completed"

export function HeaderStepProgress() {
  const { supabase } = useSupabase()
  const { selectedEventId, activeEvent } = useEvent()
  
  const [counts, setCounts] = useState({
    sent: 0,
    unsent: 0,
    guests: 0
  })

  const fetchData = async () => {
    if (!selectedEventId) return
    
    const { count: guestsCount } = await supabase
      .from("guests")
      .select("*", { count: "exact", head: true })
      .eq("event_id", selectedEventId)

    const { data: checkinData } = await supabase
      .from("checkins")
      .select("student_id, email_sent")
      .eq("event_id", selectedEventId)

    if (checkinData) {
      const checkins = checkinData as CheckinRow[]
      const emailsToBeSent = checkins.filter(c => c.student_id && c.student_id.trim().length >= 8)
      const sent = emailsToBeSent.filter(c => c.email_sent === true).length
      
      setCounts({
        guests: guestsCount || 0,
        sent,
        unsent: emailsToBeSent.length - sent
      })
    }
  }

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel("header_stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, () => fetchData())
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [supabase, selectedEventId])

  if (!selectedEventId || !activeEvent) return null

  const now = new Date()
  const checkinStart = activeEvent.checkin_start ? new Date(activeEvent.checkin_start) : null
  const checkinEnd = activeEvent.checkin_end ? new Date(activeEvent.checkin_end) : null

  const getStatus = (step: 1 | 2 | 3): StepStatus => {
    if (step === 1) {
      if (counts.guests > 0) return "completed"
      if (checkinStart && now < checkinStart) return "ongoing"
      return "pending"
    }
    if (step === 2) {
      if (checkinEnd && now > checkinEnd) return "completed"
      if (checkinStart && checkinEnd && now >= checkinStart && now <= checkinEnd) return "ongoing"
      return "pending"
    }
    if (step === 3) {
      if (checkinEnd && now > checkinEnd) {
        if ((counts.sent + counts.unsent) > 0 && counts.unsent === 0) return "completed"
        return "ongoing"
      }
      return "pending"
    }
    return "pending"
  }

  const steps = [
    { id: 1, label: "Nhập dữ liệu", status: getStatus(1), info: `Đã nhập ${counts.guests} đại biểu` },
    { id: 2, label: "Check-in", status: getStatus(2), info: "Đang diễn ra điểm danh" },
    { id: 3, label: "Gửi Email", status: getStatus(3), info: counts.unsent > 0 ? `Còn ${counts.unsent} email` : `Đã gửi ${counts.sent} email` },
  ]

  return (
    <div className="flex items-center gap-1.5 ml-2">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-1.5 group relative">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 border-2",
            step.status === "completed" && "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20",
            step.status === "ongoing" && "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 animate-pulse",
            step.status === "pending" && "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700"
          )}>
            {step.status === "completed" ? <Check size={14} strokeWidth={3} /> : step.id}
          </div>
          
          {/* Connector line */}
          {idx < steps.length - 1 && (
            <div className={cn(
              "w-4 h-[2px]",
              step.status === "completed" ? "bg-green-500" : "bg-slate-200 dark:bg-slate-800"
            )} />
          )}

          {/* Hover Tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
            <p className="font-black uppercase tracking-widest text-primary-fixed-dim">{step.label}</p>
            <p className="font-medium text-slate-300">{step.info}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
