"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Loader2,
  CheckCircle2,
  UserCheck,
  RotateCcw,
  Search,
  UserPlus,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import initCandidates from "@/data/init-candidates.json"

type Candidate = {
  name: string
  chuc_vu: string
  don_vi: string
}

const EMPTY_FORM: Candidate = {
  name: "",
  chuc_vu: "",
  don_vi: "",
}

export function CheckinForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  )
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [resetting, setResetting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter candidates by search query
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return (initCandidates as Candidate[])
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.chuc_vu.toLowerCase().includes(q) ||
          c.don_vi.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [searchQuery])

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
    setForm(c)
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

    const trimmed: Candidate = {
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

  // Reset: delete all checkins
  const handleReset = async () => {
    if (
      !confirm("Bạn có chắc chắn muốn xoá toàn bộ danh sách check-in hiện tại?")
    )
      return
    setResetting(true)
    try {
      const res = await fetch("/api/checkin/reset", { method: "POST" })
      const result = await res.json()
      if (!res.ok) {
        alert("Lỗi khi reset: " + result.error)
      }
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search from init data */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-slate-800">
            <Search className="h-4 w-4 text-blue-600" />
            Tìm đại biểu
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="relative" ref={dropdownRef}>
            <Input
              placeholder="Gõ tên, chức vụ hoặc đơn vị..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              className="border-slate-300 bg-white focus:border-blue-500"
            />

            {/* Dropdown results */}
            <AnimatePresence>
              {showDropdown && filteredCandidates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg"
                >
                  {filteredCandidates.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectCandidate(c)}
                      className="flex w-full flex-col items-start gap-0.5 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-blue-50"
                    >
                      <span className="font-semibold text-slate-800">
                        {c.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {c.chuc_vu} — {c.don_vi}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Manual entry / Form */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-slate-800">
            <UserPlus className="h-4 w-4 text-blue-600" />
            Check-in đại biểu
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-semibold tracking-wider text-slate-600 uppercase"
              >
                Họ và tên
              </Label>
              <Input
                id="name"
                placeholder="Nguyễn Văn An"
                value={form.name}
                onChange={handleChange("name")}
                className="border-slate-300 bg-white focus:border-blue-500"
                disabled={status === "saving"}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="chuc_vu"
                  className="text-xs font-semibold tracking-wider text-slate-600 uppercase"
                >
                  Chức vụ
                </Label>
                <Input
                  id="chuc_vu"
                  placeholder="Bí thư"
                  value={form.chuc_vu}
                  onChange={handleChange("chuc_vu")}
                  className="border-slate-300 bg-white focus:border-blue-500"
                  disabled={status === "saving"}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="don_vi"
                  className="text-xs font-semibold tracking-wider text-slate-600 uppercase"
                >
                  Đơn vị
                </Label>
                <Input
                  id="don_vi"
                  placeholder="Khoa CNTT"
                  value={form.don_vi}
                  onChange={handleChange("don_vi")}
                  className="border-slate-300 bg-white focus:border-blue-500"
                  disabled={status === "saving"}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600"
                >
                  {error}
                </motion.div>
              )}
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-3 text-sm font-semibold text-green-600"
                >
                  <CheckCircle2 size={16} />
                  Check-in thành công!
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full bg-blue-600 py-5 font-semibold text-white hover:bg-blue-700"
              disabled={status === "saving"}
            >
              {status === "saving" ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-5 w-5" />
                  XÁC NHẬN CHECK-IN
                </>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>

      {/* Reset data button */}
      <Button
        variant="outline"
        className="w-full border-orange-200 font-semibold text-orange-600 hover:bg-orange-50 hover:text-orange-700"
        onClick={handleReset}
        disabled={resetting}
      >
        {resetting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang reset...
          </>
        ) : (
          <>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset dữ liệu gốc
          </>
        )}
      </Button>
    </div>
  )
}
