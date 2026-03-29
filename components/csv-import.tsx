"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Loader2, CheckCircle2, Users, Zap, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import * as XLSX from "xlsx"
import { useEvent } from "@/components/event-context"
import { cn } from "@/lib/utils"

type Candidate = {
  name: string
  chuc_vu: string
  don_vi: string
  student_id: string
}

export function CSVImport() {
  const { selectedEventId } = useEvent()
  const [csvText, setCsvText] = useState("")
  const [parsed, setParsed] = useState<Candidate[]>([])
  const [status, setStatus] = useState<"idle" | "preview" | "saving" | "success">("idle")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<"checkins" | "guests">("checkins")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
        const candidates: Candidate[] = []
        for (const row of rows) {
          if (!row || row.length < 1) continue
          const firstVal = String(row[0]).toLowerCase()
          if (["name", "tên", "họ tên"].includes(firstVal)) continue
          const name = String(row[0] || "").trim()
          if (name) {
            candidates.push({ 
              name, 
              chuc_vu: String(row[1] || "").trim(), 
              don_vi: String(row[2] || "").trim(), 
              student_id: String(row[3] || "").trim() 
            })
          }
        }
        setParsed(candidates)
        setStatus("preview")
      } catch (err) { alert("Lỗi: " + err) }
    }
    reader.readAsBinaryString(file)
  }

  const handleSave = async () => {
    if (parsed.length === 0) return
    setStatus("saving")
    try {
      const endpoint = mode === "checkins" ? "/api/checkin/import" : "/api/guests/import"
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsed, event_id: selectedEventId }),
      })
      if (res.ok) {
        setStatus("success")
        setTimeout(() => { setStatus("idle"); setParsed([]); setCsvText(""); }, 2000)
      } else { setStatus("preview"); alert("Lỗi nạp dữ liệu."); }
    } catch { setStatus("preview"); }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface-container-low/50 rounded-xl p-6 border border-outline-variant/10 shadow-inner">
        <h3 className="text-xl font-black text-on-surface tracking-normal uppercase mb-2">Nhập dữ liệu Excel</h3>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-normal opacity-60">
          Hỗ trợ định dạng .xlsx, .xls, .csv để nạp danh sách đại biểu hàng loạt.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setMode("guests")}
          className={cn(
            "p-6 rounded-xl border transition-all flex flex-col items-center gap-3 text-center group",
            mode === "guests" ? "bg-white border-primary shadow-xl shadow-primary/10" : "bg-surface-container-low border-transparent hover:bg-white"
          )}
        >
          <div className={cn("p-3 rounded-lg transition-all group-hover:scale-110", mode === "guests" ? "bg-primary text-white" : "bg-white text-slate-400Shadow-sm")}>
            <Users size={24} />
          </div>
          <div>
            <p className={cn("text-xs font-black uppercase tracking-normal", mode === "guests" ? "text-primary" : "text-slate-500")}>Danh sách chờ</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-normal">Nạp vào danh bạ đại biểu</p>
          </div>
        </button>

        <button 
          onClick={() => setMode("checkins")}
          className={cn(
            "p-6 rounded-xl border transition-all flex flex-col items-center gap-3 text-center group",
            mode === "checkins" ? "bg-white border-secondary shadow-xl shadow-secondary/10" : "bg-surface-container-low border-transparent hover:bg-white"
          )}
        >
          <div className={cn("p-3 rounded-lg transition-all group-hover:scale-110", mode === "checkins" ? "bg-secondary text-white" : "bg-white text-slate-400 shadow-sm")}>
            <Zap size={24} />
          </div>
          <div>
            <p className={cn("text-xs font-black uppercase tracking-normal", mode === "checkins" ? "text-secondary" : "text-slate-500")}>Xác nhận ngay</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-normal">Nạp và hiển thị màn hình</p>
          </div>
        </button>
      </div>

      <Card className="border-none shadow-xl shadow-blue-900/5 bg-white rounded-xl overflow-hidden p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-4xl text-primary font-light">cloud_upload</span>
              <div>
                <p className="font-black text-on-surface uppercase tracking-normal text-lg">Tải tệp lên</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal leading-none mt-1">Chọn file Excel từ máy tính của bạn</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="h-12 px-6 border-outline-variant/20 rounded-xl font-black text-[10px] uppercase tracking-normal hover:bg-primary/5 transition-all"
            >
              Chọn tệp
            </Button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
          </div>

          <AnimatePresence mode="wait">
            {status === "preview" && parsed.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-low/50 rounded-xl p-6 border border-primary/20 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-primary uppercase tracking-normal flex items-center gap-2">
                    <CheckCircle2 size={16} /> Sẵn sàng nạp {parsed.length} đại biểu
                  </p>
                  <button onClick={() => setParsed([])} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-normal underline">Hủy bỏ</button>
                </div>
                <div className="bg-white rounded-xl p-4 max-h-40 overflow-y-auto border border-outline-variant/5 shadow-inner">
                  {parsed.slice(0, 5).map((p, i) => (
                    <div key={i} className="py-2 border-b border-slate-50 last:border-0 flex justify-between items-center">
                      <span className="text-xs font-black text-on-surface uppercase tracking-normal">{p.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">{p.student_id}</span>
                    </div>
                  ))}
                  {parsed.length > 5 && <p className="text-center pt-2 text-[10px] font-bold text-slate-300 uppercase italic">... và {parsed.length - 5} người khác</p>}
                </div>
                <Button onClick={handleSave} className="w-full h-14 bg-primary hover:bg-primary-container text-white font-black text-sm uppercase tracking-normal shadow-xl shadow-primary/10 rounded-xl transition-all">
                  Nạp vào hệ thống
                </Button>
              </motion.div>
            )}

            {status === "saving" && (
              <div className="py-10 flex flex-col items-center gap-4 text-primary animate-pulse">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="font-black uppercase tracking-normal text-[10px]">Đang ghi dữ liệu...</p>
              </div>
            )}

            {status === "success" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-10 flex flex-col items-center gap-4 text-green-600">
                <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <p className="font-black uppercase tracking-normal text-[10px]">Hoàn tất nạp dữ liệu!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <div className="flex gap-4">
        <button 
          onClick={async () => {
             if (confirm("DANGEROUS: Xóa Master List?")) {
               await fetch("/api/guests/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
               window.location.reload();
             }
          }}
          className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-all font-black text-[10px] uppercase tracking-normal"
        >
          <Trash2 size={14} /> Xóa Master List
        </button>
        <button 
          onClick={async () => {
            if (confirm("DANGEROUS: Xóa Check-in List?")) {
              await fetch("/api/checkin/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
              window.location.reload();
            }
          }}
          className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-all font-black text-[10px] uppercase tracking-normal"
        >
          <Trash2 size={14} /> Reset Check-in
        </button>
      </div>
    </div>
  )
}
