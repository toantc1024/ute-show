"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useEvent } from "@/components/event-context"
import { Users, CheckCircle2, XCircle, UserPlus } from "lucide-react"

interface Stats {
  total: number
  checkedIn: number
  notCheckedIn: number
  newGuests: number
}

export function StatsBar() {
  const { supabase } = useSupabase()
  const { selectedEventId } = useEvent()
  const [stats, setStats] = useState<Stats>({ total: 0, checkedIn: 0, notCheckedIn: 0, newGuests: 0 })
  const [loading, setLoading] = useState(true)

  const fetchStats = async (isInitial = false) => {
    if (isInitial) setLoading(true)
    
    // Fetch events globally or by event_id
    let guestsQuery = supabase.from("guests").select("name")
    let checkinsQuery = supabase.from("checkins").select("name")

    if (selectedEventId) {
      guestsQuery = guestsQuery.eq("event_id", selectedEventId)
      checkinsQuery = checkinsQuery.eq("event_id", selectedEventId)
    }
    
    const [{ data: guestData }, { data: checkinData }] = await Promise.all([
      guestsQuery,
      checkinsQuery
    ])

    const guestNames = new Set(
      (guestData || []).map((g: { name: string }) => g.name.trim().toLowerCase())
    )
    const checkinNamesSet = new Set(
      (checkinData || []).map((c: { name: string }) => c.name.trim().toLowerCase())
    )

    // Đã check-in: trong guests VÀ đã check-in
    const checkedIn = [...checkinNamesSet].filter((n) => guestNames.has(n)).length

    // Chưa check-in: trong guests NHƯNG chưa check-in
    const notCheckedIn = [...guestNames].filter((n) => !checkinNamesSet.has(n)).length

    // Thêm mới: check-in NHƯNG không có trong guests
    const newGuests = [...checkinNamesSet].filter((n) => !guestNames.has(n)).length

    // Tổng = checkedIn + notCheckedIn + newGuests
    const total = checkedIn + notCheckedIn + newGuests

    setStats({ total, checkedIn, notCheckedIn, newGuests })
    if (isInitial) setLoading(false)
  }

  useEffect(() => {
    // Initial fetch
    fetchStats(true)

    // Subscribe to real-time changes
    const channel = supabase
      .channel("stats_chan")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, () => fetchStats())
      .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, () => fetchStats())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, selectedEventId])

  const cards = [
    {
      label: "Tổng số đại biểu",
      value: stats.total,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/5",
      border: "border-primary/10",
      iconBg: "bg-primary/10",
    },
    {
      label: "Đã check-in",
      value: stats.checkedIn,
      icon: CheckCircle2,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
      iconBg: "bg-green-100",
    },
    {
      label: "Chưa check-in",
      value: stats.notCheckedIn,
      icon: XCircle,
      color: "text-secondary",
      bg: "bg-secondary/5",
      border: "border-secondary/10",
      iconBg: "bg-secondary/10",
    },
    {
      label: "Đại biểu thêm mới",
      value: stats.newGuests,
      icon: UserPlus,
      color: "text-primary-container",
      bg: "bg-primary-fixed",
      border: "border-blue-100",
      iconBg: "bg-primary/20",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`group relative overflow-hidden rounded-[32px] bg-white p-6 shadow-sm transition-all hover:shadow-md`}
          >
            {/* Background Accent Blur */}
            <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-3xl ${card.iconBg}`} />
            
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105 ${card.iconBg} ${card.color}`}>
                <Icon className="h-7 w-7" />
              </div>
              <div className={`mt-2 text-3xl font-black tracking-normal text-slate-900`}>
                {loading ? (
                  <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-100" />
                ) : (
                  card.value.toLocaleString()
                )}
              </div>
              <div className="text-[13px] font-bold text-slate-400">
                {card.label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
