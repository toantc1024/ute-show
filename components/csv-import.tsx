"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react"

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
    // Skip header row
    if (
      line.toLowerCase().startsWith("name,") ||
      line.toLowerCase().startsWith("name\t")
    )
      continue

    // Support both comma and tab delimiters
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setCsvText(text)
      const candidates = parseCSV(text)
      setParsed(candidates)
      setStatus("preview")
    }
    reader.readAsText(file, "utf-8")
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
      const res = await fetch("/api/checkin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates: parsed }),
      })
      const result = await res.json()
      if (!res.ok) {
        alert("Lỗi: " + result.error)
        setStatus("preview")
      } else {
        setStatus("success")
        setTimeout(() => {
          setStatus("idle")
          setCsvText("")
          setParsed([])
        }, 2000)
      }
    } catch {
      alert("Lỗi kết nối")
      setStatus("preview")
    }
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-slate-800">
          <FileText className="h-4 w-4 text-blue-600" />
          Nhập CSV danh sách đại biểu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-slate-500">
          Định dạng:{" "}
          <code className="rounded bg-slate-100 px-1">
            name, chuc_vu, don_vi
          </code>{" "}
          — mỗi dòng một đại biểu.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={handleFileUpload}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="border-slate-300"
        >
          <Upload className="mr-2 h-4 w-4" />
          Chọn file CSV
        </Button>

        <Textarea
          placeholder={`Nguyễn Văn A, Bí thư Đoàn trường, Đoàn trường\nTrần Thị B, Phó Bí thư, Khoa CNTT`}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={5}
          className="border-slate-300 bg-white font-mono text-sm focus:border-blue-500"
        />

        {status === "idle" && csvText.trim() && (
          <Button size="sm" variant="secondary" onClick={handleParse}>
            Xem trước
          </Button>
        )}

        {status === "preview" && parsed.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Tìm thấy {parsed.length} đại biểu:
            </p>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
              {parsed.map((c, i) => (
                <div
                  key={i}
                  className="border-b border-slate-100 py-1 last:border-0"
                >
                  <span className="font-semibold text-slate-800">{c.name}</span>
                  <span className="text-slate-400"> — </span>
                  <span className="text-slate-600">{c.chuc_vu}</span>
                  <span className="text-slate-400"> — </span>
                  <span className="text-slate-600">{c.don_vi}</span>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSave}
            >
              Nhập {parsed.length} đại biểu vào check-in
            </Button>
          </div>
        )}

        {status === "preview" && parsed.length === 0 && (
          <p className="text-sm text-red-500">
            Không tìm thấy dữ liệu hợp lệ. Kiểm tra lại định dạng CSV.
          </p>
        )}

        {status === "saving" && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang nhập dữ liệu...
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Nhập thành công!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
