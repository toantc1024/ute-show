"use client"

import { useSupabase } from "@/components/supabase-provider"
import { useEvent } from "@/components/event-context"
import { useEffect, useMemo, useState } from "react"
import type { Database } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { AnimatePresence, motion } from "framer-motion"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type CheckinRow = Database["public"]["Tables"]["checkins"]["Row"]

interface CheckinListProps {
  showDelete?: boolean
  maxItems?: number
  query?: string
}

export function CheckinList({ showDelete, maxItems = 100, query = "" }: CheckinListProps) {
  const { supabase, session } = useSupabase()
  const { selectedEventId } = useEvent()
  const [checkins, setCheckins] = useState<CheckinRow[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = useMemo(() => !!session?.user, [session])

  const fetchCheckins = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      let q = supabase
        .from("checkins")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(maxItems)

      if (selectedEventId) {
        q = q.eq("event_id", selectedEventId)
      }

      const { data, error } = await q
      if (!error && data) {
        setCheckins(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCheckins()
    const channel = supabase
      .channel("checkin_list_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, () => fetchCheckins())
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [supabase, selectedEventId, maxItems])

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa?")) return
    await fetch("/api/checkin/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchCheckins()
  }

  const filteredCheckins = useMemo(() => {
    if (!query.trim()) return checkins
    const term = query.toLowerCase()
    return checkins.filter(c => 
      c.name.toLowerCase().includes(term) || 
      (c.student_id && c.student_id.toLowerCase().includes(term)) ||
      c.don_vi.toLowerCase().includes(term)
    )
  }, [checkins, query])

  if (loading && checkins.length === 0) {
    return <div className="py-20 text-center font-bold text-slate-400 uppercase tracking-normal animate-pulse">Đang đồng bộ dữ liệu...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-black text-on-surface tracking-normal uppercase opacity-70">Danh sách đã Check-in</h4>
        <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-lg uppercase tracking-normal">
          {filteredCheckins.length} ĐẠI BIỂU
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredCheckins.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-slate-400 italic font-medium uppercase tracking-normal text-xs">
              {query ? "Không tìm thấy đại biểu phù hợp." : "Chưa có đại biểu nào check-in."}
            </motion.div>
          ) : (
            filteredCheckins.map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id} 
                className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-all group border border-transparent hover:border-outline-variant/10 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-black uppercase shadow-inner">
                    {item.name.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-black text-on-surface uppercase tracking-normal text-sm">{item.name}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-normal opacity-60 leading-none mt-1">
                      {item.don_vi} {item.student_id ? `• MSSV: ${item.student_id}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-black text-primary tracking-normal">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[9px] font-black text-green-600 px-2 py-0.5 bg-green-50 rounded-lg inline-block tracking-normal uppercase shadow-sm">SUCCESS</p>
                  </div>
                  {showDelete && isAdmin && (
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
