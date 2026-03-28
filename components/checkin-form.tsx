"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, RotateCcw, Search, UserCheck, UserPlus, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSupabase } from "@/components/supabase-provider"
import { cn } from "@/lib/utils"

type Candidate = {
  name: string
  chuc_vu: string
  don_vi: string
  isCheckedIn?: boolean
}

const EMPTY_FORM: Candidate = {
  name: "",
  chuc_vu: "",
  don_vi: "",
}

export function CheckinForm() {
  const { supabase } = useSupabase()
  const [form, setForm] = useState<Candidate>(EMPTY_FORM)
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  )
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Search from guests table globally
  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) {
        setCandidates([])
        return
      }
      setIsSearching(true)
      const q = searchQuery.toLowerCase()

      // 1. Get potential guests
      const { data: guestData, error: guestError } = await supabase
        .from("guests")
        .select("name, chuc_vu, don_vi")
        .or(`name.ilike.%${q}%,chuc_vu.ilike.%${q}%,don_vi.ilike.%${q}%`)
        .limit(8)

      if (!guestError && guestData) {
        // 2. Fetch recent checkins
        const { data: checkinData } = await supabase
          .from("checkins")
          .select("name")
          .order("created_at", { ascending: false })
          .limit(1000)

        const checkedInSet = new Set(
          (checkinData as { name: string }[] || []).map(c => c.name.trim().toLowerCase())
        )

        const guestList = guestData as Candidate[]
        const results = guestList.map(g => ({
          ...g,
          isCheckedIn: checkedInSet.has(g.name.trim().toLowerCase())
        }))

        setCandidates(results)
      }
      setIsSearching(false)
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, supabase])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
      don_vi: c.don_vi
    })
    setSearchQuery(c.name)
    setShowDropdown(false)
  }

  const handleChange =
    (field: keyof Candidate) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }))
        if (status !== "idle") setStatus("idle")
      }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus("saving")
    setError(null)

    const trimmed = {
      name: form.name.trim(),
      chuc_vu: form.chuc_vu.trim(),
      don_vi: form.don_vi.trim(),
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
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || "Không thể lưu check-in.")
        setStatus("error")
      } else {
        setStatus("success")
        setForm(EMPTY_FORM)
        setSearchQuery("")
        setTimeout(() => setStatus("idle"), 2000)
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.")
      setStatus("error")
    }
  }

  const handleReset = async () => {
    if (!confirm("Bạn có chắc chắn muốn xoá toàn bộ danh sách check-in?")) return
    setResetting(true)
    try {
      const res = await fetch("/api/checkin/reset", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}) 
      })
      if (res.ok) {
        alert("Đã xóa sạch danh sách check-in.")
      }
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-visible">
        <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100 mb-4">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Search className="h-4 w-4 text-blue-600" />
            TÌM ĐẠI BIỂU
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Input
                placeholder="Gõ tên, chức vụ hoặc đơn vị..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                className="border-slate-300 bg-white pr-10 focus:border-blue-500 font-medium"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <Search className="h-4 w-4 text-slate-300" />}
              </div>
            </div>

            <AnimatePresence>
              {showDropdown && candidates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 z-[100] mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
                >
                  {candidates.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectCandidate(c)}
                      className={cn(
                        "flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left transition-all last:border-0 hover:bg-blue-50",
                        c.isCheckedIn ? "bg-green-50/30" : "bg-white"
                      )}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-bold truncate",
                            c.isCheckedIn ? "text-green-700" : "text-slate-800"
                          )}>
                            {c.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                          {c.chuc_vu} — {c.don_vi}
                        </span>
                      </div>

                      {c.isCheckedIn && (
                        <div className="flex items-center gap-1 ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-black text-green-700 whitespace-nowrap">
                          <CheckCircle2 className="h-3 w-3" /> ĐÃ XÁC NHẬN
                        </div>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100 mb-4">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <UserCheck className="h-4 w-4 text-blue-600" />
            CHECK-IN ĐẠI BIỂU
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Họ và tên</Label>
              <Input id="name" value={form.name} onChange={handleChange("name")} className="border-slate-300 font-bold" disabled={status === "saving"} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="chuc_vu" className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Chức vụ</Label>
                <Input id="chuc_vu" value={form.chuc_vu} onChange={handleChange("chuc_vu")} className="border-slate-300 font-bold" disabled={status === "saving"} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="don_vi" className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Đơn vị</Label>
                <Input id="don_vi" value={form.don_vi} onChange={handleChange("don_vi")} className="border-slate-300 font-bold" disabled={status === "saving"} />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-red-50 p-3 text-xs font-bold text-red-600">
                  {error}
                </motion.div>
              )}
              {status === "success" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs font-bold text-green-600">
                  <CheckCircle2 size={14} /> XÁC NHẬN THÀNH CÔNG!
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full bg-blue-600 font-black h-11 text-sm shadow-lg shadow-blue-200" disabled={status === "saving"}>
              {status === "saving" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserCheck className="mr-2 h-5 w-5" />}
              {status === "saving" ? "ĐANG XỬ LÝ..." : "XÁC NHẬN VÀO HỘI TRƯỜNG"}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Button variant="ghost" className="w-full text-red-400 hover:text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase tracking-widest h-8" onClick={handleReset} disabled={resetting}>
        <RotateCcw className="mr-2 h-3 w-3" /> {resetting ? "Đang xóa..." : "Xóa sạch dữ liệu Check-in"}
      </Button>
    </div>
  )
}
