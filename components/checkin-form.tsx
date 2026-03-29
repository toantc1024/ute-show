"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, UserCheck, Search, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSupabase } from "@/components/supabase-provider"
import { useEvent } from "@/components/event-context"
import { cn } from "@/lib/utils"

type Candidate = {
  name: string
  chuc_vu: string
  don_vi: string
  student_id?: string
  isCheckedIn?: boolean
}

const EMPTY_FORM: Candidate = {
  name: "",
  chuc_vu: "",
  don_vi: "",
  student_id: "",
}

export function CheckinForm() {
  const { supabase } = useSupabase()
  const { selectedEventId } = useEvent()
  const [form, setForm] = useState<Candidate>(EMPTY_FORM)
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) {
        setCandidates([])
        return
      }
      setIsSearching(true)
      const q = searchQuery.toLowerCase()

      let guestQuery = supabase
        .from("guests")
        .select("name, chuc_vu, don_vi, student_id")
        .or(`name.ilike.%${q}%,chuc_vu.ilike.%${q}%,don_vi.ilike.%${q}%,student_id.ilike.%${q}%`)

      if (selectedEventId) {
        guestQuery = guestQuery.eq("event_id", selectedEventId)
      }

      const { data: guestData, error: guestError } = await guestQuery.limit(8)

      if (!guestError && guestData) {
        let checkinQuery = supabase
          .from("checkins")
          .select("name")
          .order("created_at", { ascending: false })

        if (selectedEventId) {
          checkinQuery = checkinQuery.eq("event_id", selectedEventId)
        }

        const { data: checkinData } = await checkinQuery.limit(1000)
        const checkedInSet = new Set((checkinData as { name: string }[] || []).map(c => c.name.trim().toLowerCase()))

        setCandidates((guestData as Candidate[]).map(g => ({
          ...g,
          isCheckedIn: checkedInSet.has(g.name.trim().toLowerCase())
        })))
      }
      setIsSearching(false)
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, supabase, selectedEventId])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const selectCandidate = (c: Candidate) => {
    setForm({
      name: c.name,
      chuc_vu: c.chuc_vu,
      don_vi: c.don_vi,
      student_id: c.student_id || ""
    })
    setSearchQuery(c.name)
    setShowDropdown(false)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus("saving")
    setError(null)

    const trimmed = {
      name: form.name.trim(),
      chuc_vu: form.chuc_vu.trim(),
      don_vi: form.don_vi.trim(),
      student_id: form.student_id?.trim() || null,
      event_id: selectedEventId
    }

    if (!trimmed.name || !trimmed.chuc_vu || !trimmed.don_vi) {
      setError("Vui lòng điền đầy đủ thông tin.")
      setStatus("error")
      return
    }

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trimmed),
      })
      if (!res.ok) {
        const result = await res.json()
        setError(result.error || "Lỗi.")
        setStatus("error")
      } else {
        setStatus("success")
        setForm(EMPTY_FORM)
        setSearchQuery("")
        setTimeout(() => setStatus("idle"), 2000)
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative group">
          <Input
            placeholder="Tìm theo tên, MSSV..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            className="h-14 bg-surface-container-low border-none rounded-xl px-12 font-bold focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-sm"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          {isSearching && <Loader2 className="h-4 w-4 animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-primary" />}
        </div>

        <AnimatePresence>
          {showDropdown && candidates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 z-[100] mt-2 max-h-80 overflow-y-auto rounded-xl bg-white shadow-2xl border border-outline-variant/10 p-2"
            >
              {candidates.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectCandidate(c)}
                  className="flex w-full items-center justify-between p-4 rounded-xl transition-all hover:bg-surface-container-lowest hover:shadow-sm group text-left mb-1 last:mb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold", c.isCheckedIn ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary")}>
                      {c.name.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-on-surface uppercase tracking-normal text-sm">{c.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal leading-none mt-1">
                        {c.student_id ? `${c.student_id} • ` : ""}{c.chuc_vu}
                      </p>
                    </div>
                  </div>
                  {c.isCheckedIn && (
                     <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black tracking-normal">
                       OK
                     </div>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Check-in Form Card */}
      <Card className="border-none shadow-xl shadow-blue-900/5 bg-white rounded-xl overflow-hidden">
        <div className="px-8 py-6 bg-surface-container-low/50 border-b border-outline-variant/5">
          <h3 className="text-sm font-black text-primary uppercase tracking-normal flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">how_to_reg</span>
            Xác nhận thông tin
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-normal text-slate-400 pl-1">Họ và tên</Label>
              <Input 
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="h-12 bg-surface-container-lowest border-none font-bold rounded-xl px-4 focus:ring-2 focus:ring-primary/20 shadow-inner"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-normal text-slate-400 pl-1">MSSV</Label>
                <Input value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))} className="h-12 bg-surface-container-lowest border-none font-bold rounded-xl shadow-inner" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-normal text-slate-400 pl-1">Chức vụ</Label>
                <Input value={form.chuc_vu} onChange={e => setForm(f => ({ ...f, chuc_vu: e.target.value }))} className="h-12 bg-surface-container-lowest border-none font-bold rounded-xl shadow-inner" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-normal text-slate-400 pl-1">Đơn vị / Đào tạo</Label>
              <Input value={form.don_vi} onChange={e => setForm(f => ({ ...f, don_vi: e.target.value }))} className="h-12 bg-surface-container-lowest border-none font-bold rounded-xl shadow-inner" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-black uppercase tracking-normal border border-red-100 italic">
                {error}
              </motion.div>
            )}
            {status === "success" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-600 text-white p-6 rounded-xl flex flex-col items-center gap-2 shadow-xl shadow-green-500/20 text-center">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="font-black uppercase tracking-normal text-sm">Check-in thành công!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" disabled={status === "saving" || status === "success"} className="w-full h-14 bg-primary hover:bg-primary-container text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 rounded-xl transition-all active:scale-95 disabled:opacity-50">
            {status === "saving" ? <Loader2 className="animate-spin h-6 w-6" /> : "Xác nhận vào"}
          </Button>
        </form>
      </Card>
      
      <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-normal px-8 leading-relaxed opacity-60">
        Hãy đảm bảo thông tin đại biểu trùng khớp với danh sách chính thức trước khi xác nhận.
      </p>
    </div>
  )
}
