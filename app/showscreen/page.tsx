"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useEvent } from "@/components/event-context"
import { motion, AnimatePresence } from "framer-motion"
import { UserCheck, Clock, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ShowScreenPage() {
  const { supabase } = useSupabase()
  const { activeEvent } = useEvent()
  const [checkins, setCheckins] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    checkinCount: 0
  })

  // Fetch stats and checkins
  const fetchData = async () => {
    if (!supabase) return

    // Fetch stats
    const { count: totalCount } = await supabase
      .from("guests")
      .select("*", { count: "exact", head: true })
    
    const { count: checkinCount } = await supabase
      .from("checkins")
      .select("*", { count: "exact", head: true })

    setStats({
      total: totalCount || 0,
      checkinCount: checkinCount || 0
    })

    // Fetch recent checkins
    const { data } = await supabase
      .from("checkins")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)

    if (data) {
      setCheckins(data)
    }
  }

  useEffect(() => {
    fetchData()
    // Subscribe to real-time changes
    const channel = supabase
      .channel("showscreen_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, () => fetchData())
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const marqueeText = activeEvent?.title || "Hệ thống điểm danh thông minh - Chào mừng quý đại biểu về tham dự chương trình"

  return (
    <div className="w-screen h-screen bg-[#f8fbff] flex flex-col overflow-hidden font-sans">
      {/* 1. Marquee Section: Program name scrolling left to right */}
      <div className="h-16 bg-primary overflow-hidden flex items-center relative z-20 shadow-lg">
        <div className="whitespace-nowrap flex animate-marquee-reverse">
          <span className="text-2xl font-black text-white uppercase tracking-widest px-8">
            {marqueeText} • {marqueeText} • {marqueeText} • {marqueeText}
          </span>
          <span className="text-2xl font-black text-white uppercase tracking-widest px-8">
            {marqueeText} • {marqueeText} • {marqueeText} • {marqueeText}
          </span>
        </div>
      </div>

      {/* Main Container constrained to 1920x1080 if screen allows, else responsive */}
      <div className="flex-1 flex flex-col max-w-[1920px] mx-auto w-full p-8 gap-8 overflow-hidden">
        {/* 2. Dashboard Tab Section (Banner) */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-12 text-white shadow-2xl shadow-primary/20 group flex items-center justify-between gap-12 shrink-0">
          <div className="absolute right-[10%] -top-10 opacity-10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-all duration-[5000ms] ease-in-out">
            <UserCheck className="w-[600px] h-[600px] text-white" strokeWidth={0.2} />
          </div>

          <div className="relative z-10 max-w-3xl">
            <span className="inline-block px-6 py-2 rounded-xl bg-white/20 backdrop-blur-xl text-xs font-black tracking-[0.3em] uppercase mb-8 border border-white/10 animate-pulse">
              UTE CHECK-IN LIVE DASHBOARD
            </span>
            <div className="mb-8">
              <span className="text-sm font-black tracking-[0.2em] uppercase block mb-3 text-white/70">
                CHƯƠNG TRÌNH ĐANG DIỄN RA
              </span>
              <h2 className="text-5xl font-black tracking-tight uppercase leading-[1.1] [text-shadow:0_4px_12px_rgba(0,0,0,0.2)]">
                {activeEvent?.title || "SỰ KIỆN CHƯA BẮT ĐẦU"}
              </h2>
            </div>
            <div className="flex items-center gap-10">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">ĐỊA ĐIỂM</span>
                  <span className="text-lg font-bold">Hội trường A - HCMUTE</span>
               </div>
               <div className="w-px h-10 bg-white/20"></div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">THỜI GIAN</span>
                  <span className="text-lg font-bold">{new Date().toLocaleDateString('vi-VN')}</span>
               </div>
            </div>
          </div>

          {/* Real-time stats */}
          <div className="relative z-10 flex gap-8">
            <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 min-w-[200px] shadow-2xl">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">ĐÃ CHECK-IN</span>
              <div className="text-7xl font-black tabular-nums">{stats.checkinCount}</div>
              <div className="mt-4 px-4 py-1.5 rounded-full bg-white text-primary text-[10px] font-black uppercase tracking-wider">
                {stats.total ? Math.round((stats.checkinCount / stats.total) * 100) : 0}% COMPLETION
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/5 min-w-[200px]">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">DỰ KIẾN</span>
              <div className="text-6xl font-black text-white/60 tabular-nums">{stats.total}</div>
              <div className="mt-4 px-4 py-1.5 rounded-full bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-wider">
                TOTAL GUESTS
              </div>
            </div>
          </div>
        </section>

        {/* 3. Real-time Check-in List Section */}
        <section className="flex-1 min-h-0 flex flex-col bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-3xl font-black text-on-surface uppercase tracking-tight">
                DANH SÁCH CHECK-IN MỚI NHẤT
              </h3>
            </div>
            <div className="flex items-center gap-3 bg-green-50 px-6 py-3 rounded-2xl border border-green-100">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              <span className="text-sm font-black text-green-700 uppercase tracking-widest">REAL-TIME SYNC ACTIVE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-10 py-6 scrollbar-hide bg-gradient-to-b from-white via-white to-slate-50/50">
            <div className="max-w-5xl mx-auto space-y-6">
              <AnimatePresence mode="popLayout" initial={false}>
                {checkins.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200, delay: index < 5 ? index * 0.1 : 0 }}
                    className={cn(
                      "flex items-center justify-between p-8 rounded-[1.5rem] border transition-all",
                      index === 0 
                        ? "bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 shadow-xl shadow-primary/5 ring-1 ring-primary/20 scale-[1.02]" 
                        : "bg-white border-slate-100 shadow-sm hover:shadow-md"
                    )}
                  >
                    <div className="flex items-center gap-8 flex-1">
                       <div className={cn(
                         "w-16 h-16 rounded-full flex items-center justify-center text-xl font-black uppercase shadow-inner shrink-0",
                         index === 0 ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                       )}>
                         {item.name.substring(0, 2)}
                       </div>
                       <div className="flex-1 flex items-center justify-between">
                         <div className="flex items-baseline gap-4">
                            <h4 className="text-3xl font-black text-on-surface uppercase tracking-tight">{item.name}</h4>
                            <span className="text-2xl text-slate-300 font-light">/</span>
                            <p className="text-2xl font-bold text-slate-400 uppercase tracking-widest">
                               {item.student_id ? `MSSV: ${item.student_id}` : "KHÁCH MỜI"}
                            </p>
                         </div>
                         
                         <div className="flex items-center gap-6">
                            {index === 0 && (
                              <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-[0.2em] animate-pulse border border-primary/20">
                                NEW CHECK-IN
                              </span>
                            )}
                            <div className="flex items-center gap-3 text-primary font-black text-3xl tabular-nums">
                               <Clock size={24} className="opacity-40" />
                               {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                         </div>
                       </div>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
              
              {checkins.length === 0 && (
                <div className="py-40 text-center">
                  <div className="inline-block p-10 bg-slate-50 rounded-full mb-6">
                    <UserCheck size={60} className="text-slate-200" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-300 uppercase tracking-[0.3em]">Đang chờ đại biểu đầu tiên...</h4>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer visual */}
          <div className="h-4 bg-gradient-to-r from-primary via-secondary to-primary opacity-50"></div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes marquee-reverse {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 30s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
