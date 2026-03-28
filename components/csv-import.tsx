import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Loader2, CheckCircle2, Users, Zap } from "lucide-react"
import * as XLSX from "xlsx"
import { cn } from "@/lib/utils"

type Candidate = {
  name: string
  chuc_vu: string
  don_vi: string
}

function parseCSV(text: string): Candidate[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

  const results: Candidate[] = []

  for (const line of lines) {
    if (
      line.toLowerCase().startsWith("name,") ||
      line.toLowerCase().startsWith("name\t")
    )
      continue

    const parts = line.includes("\t") ? line.split("\t") : line.split(",")

    if (parts.length >= 3) {
      const name = parts[0].trim()
      const chuc_vu = parts[1].trim()
      const don_vi = parts[2].trim()
      if (name && chuc_vu && don_vi) {
        results.push({ name, chuc_vu, don_vi })
      }
    }
  }

  return results
}

export function CSVImport() {
  const [csvText, setCsvText] = useState("")
  const [parsed, setParsed] = useState<Candidate[]>([])
  const [status, setStatus] = useState<
    "idle" | "preview" | "saving" | "success"
  >("idle")
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
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
        
        const candidates: Candidate[] = []
        for (const row of rows) {
          if (!row || row.length < 1) continue
          
          const firstVal = String(row[0]).toLowerCase()
          if (firstVal === "name" || firstVal === "tên" || firstVal === "họ tên") continue
          
          const name = String(row[0] || "").trim()
          const chuc_vu = String(row[1] || "").trim()
          const don_vi = String(row[2] || "").trim()
          
          if (name) {
            candidates.push({ name, chuc_vu, don_vi })
          }
        }
        
        setParsed(candidates)
        setCsvText(candidates.map(c => `${c.name}, ${c.chuc_vu}, ${c.don_vi}`).join("\n"))
        setStatus("preview")
      } catch (err) {
        alert("Lỗi đọc file: " + err)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleParse = () => {
    const candidates = parseCSV(csvText)
    setParsed(candidates)
    setStatus("preview")
  }

  const handleSave = async () => {
    if (parsed.length === 0) return
    setStatus("saving")

    try {
      const endpoint = mode === "checkins" ? "/api/checkin/import" : "/api/guests/import"
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsed }),
      })
      
      if (res.ok) {
        setStatus("success")
        setTimeout(() => {
          setStatus("idle")
          setCsvText("")
          setParsed([])
        }, 2000)
      } else {
        const result = await res.json()
        alert("Lỗi: " + result.error)
        setStatus("preview")
      }
    } catch {
      alert("Lỗi kết nối")
      setStatus("preview")
    }
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-bold text-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-green-600" />
            Nhập danh sách (Excel/XLSX)
          </div>
          {parsed.length > 0 && (
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {parsed.length} người
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Destination Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            ĐÍCH ĐẾN:
          </label>
          <div className="flex gap-2 p-1 rounded-xl bg-slate-100/50 border border-slate-100">
            <button
              onClick={() => setMode("guests")}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 rounded-lg py-2 transition-all",
                mode === "guests"
                  ? "bg-white text-green-700 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Users className={cn("h-4 w-4", mode === "guests" ? "text-green-600" : "text-slate-400")} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Hàng chờ</span>
            </button>
            <button
              onClick={() => setMode("checkins")}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 rounded-lg py-2 transition-all",
                mode === "checkins"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Zap className={cn("h-4 w-4", mode === "checkins" ? "text-blue-600" : "text-slate-400")} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Màn hình</span>
            </button>
          </div>
        </div>

        {mode === "guests" && (
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <p className="text-[10px] leading-tight text-slate-500 italic">
              Nạp danh sách để tìm đại biểu nhanh.
            </p>
            <Button
              variant="ghost"
              className="h-6 px-2 text-[10px] text-red-500 hover:bg-red-50 hover:text-red-700 font-bold underline"
              onClick={async () => {
                if (confirm("XÓA SẠCH toàn bộ danh sách khách mời?")) {
                  await fetch("/api/guests/reset", { 
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({})
                  });
                  alert("Đã xóa sạch.");
                }
              }}
            >
              Xóa Master List
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              DỮ LIỆU ĐẦU VÀO:
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-6 px-2 text-[10px] border-slate-300 font-bold"
            >
              <FileText className="mr-1 h-3 w-3" />
              Tải File Excel
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
          />
          
          <Textarea
            placeholder={`Nguyễn Văn A, Bí thư, Khoa CNTT...`}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={3}
            className="border-slate-300 bg-white font-mono text-xs focus:border-blue-500 shadow-inner"
          />
        </div>

        {status === "idle" && csvText.trim() && (
          <Button size="sm" variant="secondary" className="w-full text-xs h-8" onClick={handleParse}>
            Xử lý dữ liệu
          </Button>
        )}

        {status === "preview" && parsed.length > 0 && (
          <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-blue-800">
                Sẵn sàng nạp {parsed.length} người:
              </p>
              <button onClick={() => setParsed([])} className="text-[10px] text-slate-400 hover:text-slate-600 underline">Hủy</button>
            </div>
            <div className="max-h-24 overflow-y-auto rounded border border-blue-200 bg-white p-2 text-[10px]">
              {parsed.slice(0, 10).map((c, i) => (
                <div key={i} className="border-b border-slate-50 py-0.5 last:border-0 truncate">
                  <span className="font-bold">{c.name}</span> <span className="text-slate-300">|</span> {c.chuc_vu}
                </div>
              ))}
              {parsed.length > 10 && <div className="text-center pt-1 text-slate-400">...và {parsed.length - 10} người khác</div>}
            </div>
            <Button
              size="sm"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 h-9 font-bold shadow-md shadow-blue-200"
              onClick={handleSave}
            >
              BẮT ĐẦU NẠP DỮ LIỆU
            </Button>
          </div>
        )}

        {status === "saving" && (
          <div className="flex items-center justify-center py-4 gap-2 text-xs font-bold text-blue-600 animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" />
            ĐANG XỬ LÝ...
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center justify-center py-4 gap-2 text-xs font-bold text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            HOÀN TẤT THÀNH CÔNG!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
