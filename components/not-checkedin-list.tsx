"use client"

import { useSupabase } from "@/components/supabase-provider"
import { useEffect, useMemo, useState } from "react"
import type { Database } from "@/lib/database.types"
import { XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type GuestRow = Database["public"]["Tables"]["guests"]["Row"]

export function NotCheckedInList() {
  const { supabase } = useSupabase()
  const [guests, setGuests] = useState<GuestRow[]>([])
  const [checkedInNames, setCheckedInNames] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all guests
      const { data: guestData } = await supabase
        .from("guests")
        .select("*")
        .order("name", { ascending: true })

      // Fetch all checked-in names
      const { data: checkinData } = await supabase
        .from("checkins")
        .select("name")

      const checkedNames = new Set(
        ((checkinData || []) as { name: string }[]).map((c) => c.name.trim().toLowerCase())
      )

      setGuests(guestData || [])
      setCheckedInNames(checkedNames)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Subscribe to real-time changes on both tables
    const guestSub = supabase
      .channel("not_checkedin_guests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guests" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkins" },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(guestSub)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  const notCheckedIn = useMemo(() => {
    return guests.filter(
      (g) => !checkedInNames.has(g.name.trim().toLowerCase())
    )
  }, [guests, checkedInNames])

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return notCheckedIn
    const term = searchTerm.toLowerCase()
    return notCheckedIn.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.chuc_vu.toLowerCase().includes(term) ||
        g.don_vi.toLowerCase().includes(term)
    )
  }, [notCheckedIn, searchTerm])

  if (loading) {
    return (
      <div className="animate-pulse p-8 text-center font-medium text-slate-400">
        Đang tải...
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm đại biểu chưa check-in..."
            className="block w-full rounded-lg border border-red-200 bg-red-50/30 py-2 pl-10 pr-3 text-sm focus:border-red-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-400 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-200">
          <XCircle className="h-3.5 w-3.5" />
          Chưa check-in: {filtered.length} / {notCheckedIn.length}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {searchTerm ? (
            <p className="font-medium text-slate-500 italic">Không tìm thấy kết quả phù hợp.</p>
          ) : (
            <>
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-green-700">Tất cả đại biểu đã check-in! 🎉</p>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 rounded-xl border border-red-200 bg-red-50/20">
          <AnimatePresence mode="popLayout">
            {filtered.map((guest) => (
              <motion.div
                key={guest.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-3 border-b border-red-100 px-4 py-3 last:border-0 hover:bg-red-50/60 transition-colors"
              >
                {/* Red X Icon */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <XCircle className="h-5 w-5" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-red-700 leading-tight">
                    {guest.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium text-red-400">
                    {guest.chuc_vu} — {guest.don_vi}
                  </p>
                </div>

                {/* Badge */}
                <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 ring-1 ring-red-200">
                  Chưa đến
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
