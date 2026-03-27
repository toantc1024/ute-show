import { useSupabase } from "@/components/supabase-provider"
import { useEvent } from "@/components/event-context"
import { useEffect, useMemo, useState, useRef } from "react"
import type { Database } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AnimatePresence, motion } from "framer-motion"
import { Trash2, CheckCircle2 } from "lucide-react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

export type CheckinRow = Database["public"]["Tables"]["checkins"]["Row"]

interface CheckinListProps {
  showDelete?: boolean
  maxItems?: number
}

export function CheckinList({ showDelete, maxItems = 50 }: CheckinListProps) {
  const { supabase, session } = useSupabase()
  const { selectedEventId } = useEvent()
  const [checkins, setCheckins] = useState<CheckinRow[]>([])
  const [loading, setLoading] = useState(true)
  const autoplayPlugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  )

  const isAdmin = useMemo(() => !!session?.user, [session])

  useEffect(() => {
    async function fetchCheckins() {
      if (!selectedEventId) {
        setCheckins([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("checkins")
          .select("*")
          .eq("event_id", selectedEventId)
          .order("created_at", { ascending: false })
          .limit(maxItems)

        if (!error && data) {
          setCheckins(data)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCheckins()

    if (!selectedEventId) return

    const subscription = supabase
      .channel("checkins_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkins", filter: `event_id=eq.${selectedEventId}` },
        () => fetchCheckins()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [supabase, maxItems, selectedEventId])

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khách mời này?")) {
      await fetch("/api/checkin/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
    }
  }

  const containerClass = "bg-transparent border-none w-full"
  const textSubClass = "text-slate-600 font-medium"
  const itemBgClass =
    "bg-white/80 backdrop-blur-lg border border-slate-200 text-slate-800 rounded-xl"
  const badgeClass = "bg-blue-100 text-blue-800 ring-blue-200"

  const [searchTerm, setSearchTerm] = useState("")

  const filteredCheckins = useMemo(() => {
    if (!searchTerm.trim()) return checkins
    const term = searchTerm.toLowerCase()
    return checkins.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.chuc_vu.toLowerCase().includes(term) ||
        item.don_vi.toLowerCase().includes(term)
    )
  }, [checkins, searchTerm])

  if (loading && checkins.length === 0) {
    return (
      <div className="animate-pulse p-8 text-center font-medium text-slate-500">
        Đang tải dữ liệu...
      </div>
    )
  }

  return (
    <div className={`flex h-full w-full flex-col ${containerClass}`}>
      {/* Search Header */}
      <div className="mb-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
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
            placeholder="Tìm kiếm khách mời đã Check-in..."
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          Tổng cộng: {filteredCheckins.length} / {checkins.length}
        </div>
      </div>

      <div className="relative flex w-full flex-1 items-center justify-center">
        {filteredCheckins.length === 0 ? (
          <div className="py-10 text-center font-medium text-slate-500 italic">
            {searchTerm ? "Không tìm thấy kết quả phù hợp." : "Chưa có ai check-in."}
          </div>
        ) : (
          <Carousel
            plugins={[autoplayPlugin.current]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="group w-full pb-2"
          >
            <CarouselContent className="-ml-4 pb-2">
              <AnimatePresence mode="popLayout">
                {filteredCheckins.map((item) => (
                  <CarouselItem
                    key={item.id}
                    className="basis-full pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                  >
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`relative flex h-full flex-col justify-between gap-1 p-4 transition-all ${itemBgClass}`}
                    >
                      <div className="relative z-10 w-full">
                        <div>
                          <div className="mb-3 flex items-center gap-2.5">
                            <img src="/assets/LOGO.png" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
                            <h3 className="line-clamp-2 text-lg leading-tight font-bold tracking-tight text-green-700 flex items-center gap-1.5">
                              {item.name}
                              <CheckCircle2 className="h-5 w-5 shrink-0" />
                            </h3>
                          </div>
                          <div className="mt-2 flex flex-col gap-2">
                            <span
                              className={`inline-flex w-fit items-center rounded-sm px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase ring-1 ring-inset ${badgeClass}`}
                            >
                              {item.chuc_vu}
                            </span>
                            <span className="line-clamp-1 text-sm font-medium text-slate-600">
                              {item.don_vi}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                          <div className="font-mono text-xs font-semibold text-slate-500">
                            {new Date(item.created_at).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                          {showDelete && isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleDelete(item.id)}
                              title="Xóa khách mời này"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </AnimatePresence>
            </CarouselContent>
          </Carousel>
        )}
      </div>
    </div>
  )
}
