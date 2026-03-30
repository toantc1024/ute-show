"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useSupabase } from "./supabase-provider"
import { useEvent } from "./event-context"

export type TabType = "dashboard" | "programs" | "checkin" | "not-checkedin" | "import" | "quick-scan" | "emails"

interface SidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  onLogout: () => void
}

export function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  const { supabase } = useSupabase()
  const { activeEvent, selectedEventId } = useEvent()
  
  const [counts, setCounts] = useState({
    guests: 0,
    sent: 0,
    unsent: 0,
    totalCheckins: 0
  })

  useEffect(() => {
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
        const checkins = (checkinData as any[])
        const emailsToBeSent = checkins.filter(c => c.student_id && c.student_id.trim().length >= 8)
        const sent = emailsToBeSent.filter(c => c.email_sent === true).length
        const total = checkins.length
        
        setCounts({
          guests: guestsCount || 0,
          sent,
          unsent: emailsToBeSent.length - sent,
          totalCheckins: total
        })
      }
    }

    fetchData()
    const channel = supabase
      .channel("sidebar_stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, () => fetchData())
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [supabase, selectedEventId])

  const getStatusForStep = (step: 1 | 2 | 3): "pending" | "ongoing" | "completed" => {
    if (!activeEvent) return "pending"
    const now = new Date()
    const checkinStart = activeEvent.checkin_start ? new Date(activeEvent.checkin_start) : null
    const checkinEnd = activeEvent.checkin_end ? new Date(activeEvent.checkin_end) : null

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
        const totalEmails = counts.sent + counts.unsent
        if (totalEmails > 0 && counts.unsent === 0) return "completed"
        return "ongoing"
      }
      return "pending"
    }
    return "pending"
  }

  const navItems: { id: TabType; label: string; icon: string; step?: 1 | 2 | 3 }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "programs", label: "Chương trình", icon: "calendar_month" },
    { id: "import", label: "Nhập dữ liệu", icon: "cloud_upload", step: 1 },
    { id: "checkin", label: "Check-in", icon: "how_to_reg", step: 2 },
    { id: "not-checkedin", label: "Chưa Check-in", icon: "person_off" },
    { id: "emails", label: "Gửi Email", icon: "mail", step: 3 },
  ]

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-slate-50 dark:bg-slate-950 z-40 border-r border-outline-variant/10 shadow-premium">
      <div className="px-8 py-10">
        <h1 className="text-xl font-black tracking-normal uppercase flex items-center">
          <span className="text-blue-800 dark:text-primary">UTE</span>
          <span className="text-secondary dark:text-secondary-fixed-dim ml-1">Check-in</span>
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-normal mt-1">Precision Pulse</p>
      </div>

      <nav className="flex flex-col gap-2 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "px-6 py-3 flex items-center gap-3 rounded-lg transition-all active:translate-x-1 duration-150 group w-full text-left",
              activeTab === item.id 
                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ fontVariationSettings: `'FILL' ${activeTab === item.id ? 1 : 0}` }}
            >
              {item.icon}
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {item.step && (
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    getStatusForStep(item.step) === "completed" && "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]",
                    getStatusForStep(item.step) === "ongoing" && "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.4)]",
                    getStatusForStep(item.step) === "pending" && "bg-slate-300 dark:bg-slate-700"
                  )} />
                )}
                <span className={cn("text-sm", activeTab === item.id ? "font-bold" : "font-medium")}>
                  {item.step ? `${item.step}/ ` : ""}{item.label}
                </span>
              </div>
            </div>
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 px-2 pb-8">
        <div className="px-4 mb-2">
           <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Interfaces</span>
        </div>
        
        <a 
          href="/showscreen" 
          target="_blank"
          className="px-6 py-3 flex items-center gap-3 rounded-xl transition-all hover:bg-primary/5 text-primary group border border-transparent hover:border-primary/10"
        >
          <span className="material-symbols-outlined">tv</span>
          <span className="text-sm font-bold uppercase tracking-tight">Show Screen</span>
          <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">open_in_new</span>
        </a>

        <a 
          href="/check" 
          target="_blank"
          className="px-6 py-3 flex items-center gap-3 rounded-xl transition-all hover:bg-secondary/5 text-secondary group border border-transparent hover:border-secondary/10"
        >
          <span className="material-symbols-outlined">person_search</span>
          <span className="text-sm font-bold uppercase tracking-tight">Check Status</span>
          <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">open_in_new</span>
        </a>

        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4"></div>

        <button 
          onClick={() => onTabChange("quick-scan")}
          className={cn(
            "rounded-lg px-6 py-4 mb-4 flex items-center justify-center gap-2 shadow-lg transition-all",
            activeTab === "quick-scan" 
              ? "bg-blue-200 text-blue-900 shadow-blue-900/40 scale-[1.02] ring-2 ring-primary ring-offset-2 dark:bg-primary-container dark:text-primary" 
              : "bg-primary text-on-primary shadow-primary/20 hover:scale-[1.02] active:scale-95"
          )}
        >
          <span className="material-symbols-outlined">qr_code_scanner</span>
          <span className="font-bold uppercase tracking-normal">Quick Scan</span>
        </button>
        
        <button className="text-slate-600 dark:text-slate-400 px-6 py-2 flex items-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all text-left w-full">
          <span className="material-symbols-outlined text-sm">help</span>
          <span className="text-xs font-medium">Hỗ trợ</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="text-slate-600 dark:text-slate-400 px-6 py-2 flex items-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all text-left w-full"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          <span className="text-xs font-medium">Đăng xuất</span>
        </button>
      </div>

    </aside>
  )
}
