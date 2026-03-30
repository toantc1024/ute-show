"use client"

import React, { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useEvent } from "@/components/event-context"
import { motion, AnimatePresence } from "framer-motion"
import { Search, UserCheck, XCircle, Clock, ShieldCheck, ChevronLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function CheckStatusPage() {
  const { supabase } = useSupabase()
  const { activeEvent, selectedEventId } = useEvent()
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim() || !supabase) return

    setIsSearching(true)
    setHasSearched(true)
    setResult(null)

    try {
      let q = supabase
        .from("checkins")
        .select("*")
        .or(`student_id.ilike.%${query}%,name.ilike.%${query}%`)
        .order("created_at", { ascending: false })
      
      if (selectedEventId) {
        q = q.eq("event_id", selectedEventId)
      }

      const { data, error } = await q.limit(1)

      if (data && data.length > 0) {
        setResult(data[0])
      } else {
        setResult("NOT_FOUND")
      }
    } catch (err) {

      console.error("Search error:", err)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] text-on-surface font-sans p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-8 hover:gap-3 transition-all">
            <ChevronLeft size={16} /> Quay lại trang chủ
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-4 [text-shadow:0_2px_10px_rgba(0,0,0,0.05)]">
            Kiểm tra trạng thái <span className="text-primary">Check-in</span>
          </h1>
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm inline-flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
               SỰ KIỆN: <span className="text-on-surface">{activeEvent?.title || "Đang tải..."}</span>
             </p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative mb-12">
          <input 
            type="text" 
            placeholder="Nhập MSSV hoặc Tên của bạn..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-20 bg-white rounded-3xl px-8 pr-24 text-lg font-bold border-2 border-transparent focus:border-primary shadow-2xl shadow-blue-900/5 transition-all outline-none"
          />
          <button 
            type="submit"
            disabled={isSearching}
            className="absolute right-3 top-3 bottom-3 w-14 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50"
          >
            {isSearching ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
          </button>
        </form>

        {/* Results */}
        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {result === "NOT_FOUND" ? (
                <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-100 shadow-xl">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-black uppercase text-on-surface mb-3">Chưa tìm thấy dữ liệu</h3>
                  <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
                    Hệ thống chưa ghi nhận lượt check-in nào với thông tin của bạn. Vui lòng kiểm tra lại MSSV/Họ tên hoặc liên hệ BTC tại quầy hỗ trợ.
                  </p>
                  <button 
                    onClick={() => setHasSearched(false)}
                    className="mt-8 px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Thử lại
                  </button>
                </div>
              ) : result ? (
                <div className="bg-white rounded-[2.5rem] p-10 border border-green-100 shadow-2xl shadow-green-900/10 relative overflow-hidden group">
                  {/* Decorative background */}
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                      <ShieldCheck size={200} className="text-green-500" />
                   </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                        <UserCheck size={32} />
                      </div>
                      <div>
                        <div className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-lg uppercase tracking-widest mb-1 inline-block">
                           Check-in thành công
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tight">Xác nhận điểm danh</h3>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HỌ VÀ TÊN</span>
                        <span className="text-2xl font-black uppercase text-on-surface">{result.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MSSV</span>
                          <span className="text-xl font-bold text-on-surface">{result.student_id || "N/A"}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">THỜI GIAN</span>
                          <div className="flex items-center gap-2 text-primary font-black text-lg">
                            <Clock size={16} />
                            {new Date(result.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="pt-8 border-t border-slate-50">
                        <div className="p-6 rounded-2xl bg-slate-50 flex items-center justify-between">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ĐƠN VỊ CÔNG TÁC</span>
                          <span className="text-sm font-black text-primary uppercase">{result.don_vi}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 flex flex-col items-center gap-4">
                       <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-green-500"
                          />
                       </div>
                       <p className="text-[10px] font-black text-green-600/60 uppercase tracking-widest italic animate-pulse">
                         Cảm ơn bạn đã tham dự chương trình!
                       </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Placeholder before search */}
        {!hasSearched && (
           <div className="py-20 text-center opacity-30 select-none pointer-events-none">
              <Search size={120} className="mx-auto mb-8 text-slate-200" />
              <p className="text-lg font-black uppercase tracking-[0.3em] text-slate-300">Nhập thông tin để tra cứu</p>
           </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-8 left-0 right-0 text-center pointer-events-none">
         <span className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em]">UTE CHECK-IN 2026 SYSTEM</span>
      </div>
    </div>
  )
}
