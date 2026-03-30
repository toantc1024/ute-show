"use client"

import { useState, useRef, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useEvent } from "@/components/event-context"
import { Input } from "@/components/ui/input"
import { Loader2, QrCode } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function QuickScanTab() {
  const { supabase } = useSupabase()
  const { selectedEventId } = useEvent()
  
  const [barcode, setBarcode] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "warning">("idle")
  const [message, setMessage] = useState<{title: string, desc: string} | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep focus on input
  useEffect(() => {
    const focusInput = () => {
      // Don't steal focus if they are typing in another input (like search box in TopBar)
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        inputRef.current?.focus()
      }
    }
    
    document.addEventListener("click", focusInput)
    focusInput() // Initial focus
    
    return () => document.removeEventListener("click", focusInput)
  }, [])

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const code = barcode.trim()
    if (!code) return
    if (!selectedEventId) {
      setStatus("error")
      setMessage({ title: "Lỗi", desc: "Vui lòng chọn chương trình phía trên để điểm danh" })
      return
    }

    setBarcode("")
    setStatus("loading")
    setMessage(null)

    // Lookup guest
    const { data: guests, error: lookupError } = await supabase
      .from("guests")
      .select("*")
      .eq("student_id", code)
      .eq("event_id", selectedEventId)
      
    if (lookupError || !guests || guests.length === 0) {
      setStatus("error")
      setMessage({ title: "Không tìm thấy", desc: `Mã ${code} không có trong danh sách` })
      setTimeout(() => setStatus("idle"), 3000)
      return
    }

    const guest = guests[0] as any

    // check if already checked in
    const { data: exist } = await supabase.from("checkins").select("id").eq("student_id", code).eq("event_id", selectedEventId)
    if (exist && exist.length > 0) {
      setStatus("warning")
      setMessage({ title: "Đã Check-in", desc: `${guest.name} đã được điểm danh trước đó` })
      setTimeout(() => setStatus("idle"), 3000)
      return
    }

    // Call API
    try {
      const payload = {
        name: guest.name,
        chuc_vu: guest.chuc_vu,
        don_vi: guest.don_vi,
        student_id: guest.student_id,
        event_id: selectedEventId
      }

      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        throw new Error("API Error")
      }
      
      // Update guests table (is_checked_in = true)
      await (supabase.from("guests") as any).update({ is_checked_in: true }).eq("id", guest.id);

      setStatus("success")
      setMessage({ title: "Thành công", desc: `Điểm danh thành công cho ${guest.name}` })
      
    } catch {
      setStatus("error")
      setMessage({ title: "Lỗi hệ thống", desc: "Không thể lưu vào hệ thống. Vui lòng thử lại" })
    }
    
    setTimeout(() => {
       if (status !== "idle") setStatus("idle")
    }, 3000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in py-10">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,50,0.1)] p-12 text-center border border-slate-100 relative overflow-hidden">
        {/* Animated Background Details */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent z-0 pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-50/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 text-primary shadow-inner rotate-3">
             <QrCode size={48} strokeWidth={1.5} className="-rotate-3" />
          </div>
          
          <h2 className="text-3xl font-black uppercase tracking-normal text-slate-800 mb-3">Quét mã vạch</h2>
          <p className="text-slate-500 font-medium mb-10 max-w-sm">
            Sử dụng máy quét mã vạch hoặc nhập MSSV thủ công rồi ấn Enter để xác nhận nhanh.
          </p>

          <form onSubmit={handleScan} className="w-full relative max-w-md mx-auto mb-10 z-20">
             <Input 
                ref={inputRef}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Ví dụ: 21110000"
                className="h-16 text-center text-xl font-black uppercase tracking-widest bg-slate-50/50 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                autoFocus
             />
             
             {status === "loading" && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <Loader2 className="animate-spin text-primary" />
                </div>
             )}
          </form>

          <div className="h-24 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              {status !== "idle" && message && (
                <motion.div 
                  key={status + barcode} 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className={`px-8 py-5 rounded-2xl flex items-center gap-4 w-full shadow-lg ${
                    status === 'success' ? 'bg-green-500 text-white shadow-green-500/20' :
                    status === 'warning' ? 'bg-orange-500 text-white shadow-orange-500/20' :
                    'bg-red-500 text-white shadow-red-500/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {status === 'success' ? 'check_circle' : status === 'warning' ? 'info' : 'error'}
                  </span>
                  <div className="text-left flex-1">
                    <p className="font-black uppercase text-sm tracking-widest opacity-90">{message.title}</p>
                    <p className="text-base font-bold">{message.desc}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
