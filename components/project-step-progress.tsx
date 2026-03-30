"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useEvent } from "@/components/event-context"
import { cn } from "@/lib/utils"
import { Check, Loader2, Hourglass, Database as LucideDatabase, UserCheck, Mail } from "lucide-react"
import type { Database } from "@/lib/database.types"

type CheckinRow = Database["public"]["Tables"]["checkins"]["Row"]

type StepStatus = "pending" | "ongoing" | "completed"

interface StepData {
  id: number
  label: string
  status: StepStatus
  icon: any
}

export function ProjectStepProgress() {
  const { supabase } = useSupabase()
  const { selectedEventId, activeEvent } = useEvent()
  
  const [counts, setCounts] = useState({
    guests: 0,
    sent: 0,
    unsent: 0,
    totalCheckins: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchStatusData = async () => {
    if (!selectedEventId) return
    
    try {
      // 1. Count guests (Step 1)
      const { count: guestsCount } = await supabase
        .from("guests")
        .select("*", { count: "exact", head: true })
        .eq("event_id", selectedEventId)

      // 2. Count checkins and email status
      const { data: checkinData } = await supabase
        .from("checkins")
        .select("student_id, email_sent")
        .eq("event_id", selectedEventId)

      if (checkinData) {
        const checkins = (checkinData as any) as CheckinRow[]
        const total = checkins.length
        const emailsToBeSent = checkins.filter(c => c.student_id && c.student_id.trim().length >= 8)
        const sent = emailsToBeSent.filter(c => c.email_sent === true).length
        const unsent = emailsToBeSent.length - sent
        
        setCounts({
          guests: guestsCount || 0,
          sent,
          unsent,
          totalCheckins: total
        })
      }
    } catch (error) {
      console.error("Error fetching status data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatusData()
    
    const channel = supabase
      .channel("project_progress_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, () => fetchStatusData())
      .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, () => fetchStatusData())
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => fetchStatusData())
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [supabase, selectedEventId])

  if (!selectedEventId || !activeEvent) return null

  const now = new Date()
  const checkinStart = activeEvent.checkin_start ? new Date(activeEvent.checkin_start) : null
  const checkinEnd = activeEvent.checkin_end ? new Date(activeEvent.checkin_end) : null

  const getStep1Status = (): StepStatus => {
    if (counts.guests > 0) return "completed"
    if (checkinStart && now < checkinStart) return "ongoing"
    return "pending"
  }

  const getStep2Status = (): StepStatus => {
    if (checkinEnd && now > checkinEnd) return "completed"
    if (checkinStart && checkinEnd && now >= checkinStart && now <= checkinEnd) return "ongoing"
    return "pending"
  }

  const getStep3Status = (): StepStatus => {
    if (checkinEnd && now > checkinEnd) {
      // If after checkin, check email counts
      const totalEmails = counts.sent + counts.unsent
      if (totalEmails > 0 && counts.unsent === 0) return "completed"
      return "ongoing"
    }
    return "pending"
  }

  const steps: StepData[] = [
    { id: 1, label: "Nhập dữ liệu", status: getStep1Status(), icon: LucideDatabase },
    { id: 2, label: "Check-in", status: getStep2Status(), icon: UserCheck },
    { id: 3, label: "Gửi Email", status: getStep3Status(), icon: Mail },
  ]

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex flex-col gap-5">
        {steps.map((step, idx) => {
          const Icon = step.icon
          return (
            <div key={step.id} className="relative flex items-start gap-4">
              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div 
                  className={cn(
                    "absolute left-[18px] top-10 w-[2px] h-8 -z-10",
                    step.status === "completed" ? "bg-green-500" : "bg-slate-200 dark:bg-slate-800"
                  )} 
                />
              )}
              
              {/* Step Circle */}
              <div className={cn(
                "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10",
                step.status === "completed" && "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20",
                step.status === "ongoing" && "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 animate-pulse",
                step.status === "pending" && "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
              )}>
                {step.status === "completed" ? (
                  <Check size={18} strokeWidth={3} />
                ) : step.status === "ongoing" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <span className="text-xs font-black">{step.id}</span>
                )}
              </div>

              <div className="flex flex-col">
                <span className={cn(
                  "text-[11px] font-black uppercase tracking-widest",
                  step.status === "completed" && "text-green-600",
                  step.status === "ongoing" && "text-amber-600",
                  step.status === "pending" && "text-slate-400"
                )}>
                  Bước {step.id}
                </span>
                <span className={cn(
                  "text-sm font-bold",
                  step.status === "completed" && "text-slate-900 dark:text-white",
                  step.status === "ongoing" && "text-slate-900 dark:text-white",
                  step.status === "pending" && "text-slate-400"
                )}>
                  {step.label}
                </span>
                
                {/* Micro info */}
                {step.id === 1 && step.status === "completed" && (
                  <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                    Đã nhập {counts.guests} đại biểu
                  </span>
                )}
                {step.id === 2 && step.status === "ongoing" && (
                  <span className="text-[10px] font-medium text-amber-500 mt-0.5">
                    {counts.totalCheckins} đã điểm danh
                  </span>
                )}
                {step.id === 3 && step.status === "ongoing" && (
                  <span className="text-[10px] font-medium text-amber-500 mt-0.5">
                    Còn {counts.unsent} email chưa gửi
                  </span>
                )}
                {step.id === 3 && step.status === "completed" && (
                  <span className="text-[10px] font-medium text-green-600 mt-0.5">
                    Đã gửi {counts.sent} email
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
