"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Users, CheckCircle2, XCircle, UserPlus } from "lucide-react"

interface Stats {
  total: number
  checkedIn: number
  notCheckedIn: number
  newGuests: number
}

export function StatsBar() {
  const { supabase } = useSupabase()
  const [stats, setStats] = useState<Stats>({ total: 0, checkedIn: 0, notCheckedIn: 0, newGuests: 0 })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    // Fetch all guests and checkins
    const [{ data: guestData }, { data: checkinData }] = await Promise.all([
      supabase.from("guests").select("name"),
      supabase.from("checkins").select("name"),
    ])

    const guestNames = new Set(
      (guestData || []).map((g: { name: string }) => g.name.trim().toLowerCase())
    )
    const checkinNames = new Set(
      (checkinData || []).map((c: { name: string }) => c.name.trim().toLowerCase())
    )

    // Đã check-in: trong guests VÀ đã check-in
    const checkedIn = [...checkinNames].filter((n) => guestNames.has(n)).length

    // Chưa check-in: trong guests NHƯNG chưa check-in
    const notCheckedIn = [...guestNames].filter((n) => !checkinNames.has(n)).length

    // Thêm mới: check-in NHƯNG không có trong guests (thêm ngoài danh sách)
    const newGuests = [...checkinNames].filter((n) => !guestNames.has(n)).length

    // Tổng = checkedIn + notCheckedIn + newGuests
    const total = checkedIn + notCheckedIn + newGuests

    setStats({ total, checkedIn, notCheckedIn, newGuests })
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()

    const sub = supabase
      .channel("stats_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, fetchStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, fetchStats)
      .subscribe()

    return () => { supabase.removeChannel(sub) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  const cards = [
    {
      label: "Tổng số đại biểu",
      value: stats.total,
      icon: Users,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
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
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      iconBg: "bg-red-100",
    },
    {
      label: "Đại biểu thêm mới",
      value: stats.newGuests,
      icon: UserPlus,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`flex items-center gap-3 rounded-xl border ${card.border} ${card.bg} px-4 py-3 shadow-sm transition-all`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${card.iconBg}`}>
              <Icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <div className={`text-2xl font-extrabold leading-none ${card.color}`}>
                {loading ? (
                  <span className="inline-block h-6 w-10 animate-pulse rounded bg-current opacity-20" />
                ) : (
                  card.value
                )}
              </div>
              <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 truncate">
                {card.label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
