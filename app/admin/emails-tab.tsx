"use client"

import { useState, useEffect, useMemo } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useEvent } from "@/components/event-context"
import { Loader2, Mail, CheckCircle2, Square, CheckSquare, Search, Settings2, ChevronDown, ChevronUp, Info, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { Database } from "@/lib/database.types"

type CheckinRow = Database["public"]["Tables"]["checkins"]["Row"]

export function EmailsTab() {
  const { supabase } = useSupabase()
  const { selectedEventId, activeEvent } = useEvent()
  
  const [checkins, setCheckins] = useState<CheckinRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSending, setIsSending] = useState(false)
  const [filter, setFilter] = useState<"all" | "sent" | "unsent">("all")
  
  const [showEditor, setShowEditor] = useState(false)
  const [customSubject, setCustomSubject] = useState("")
  const [customHtml, setCustomHtml] = useState("")

  useEffect(() => {
    if (activeEvent) {
      setCustomSubject(`Thư cảm ơn: Check-in thành công "${activeEvent.title}"`)
      setCustomHtml(`
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #0c4a6e; margin: 0;">XÁC NHẬN CHECK-IN</h1>
    <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Hệ thống điểm danh YUTE</p>
  </div>
  
  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0284c7;">
    <p>Chào <strong>{{name}}</strong>,</p>
    <p>Cảm ơn bạn đã tham gia chương trình <strong>{{event_title}}</strong>.</p>
    <p>Hệ thống đã ghi nhận bạn check-in thành công vào sự kiện lúc <strong>{{checkin_time}}</strong>.</p>
  </div>
  
  <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 30px;">
    Thư này được gửi theo cấu hình tự động. Vui lòng không trả lời thư.
  </p>
</div>
      `.trim())
    }
  }, [activeEvent])

  const fetchCheckins = async () => {
    if (!supabase || !selectedEventId) {
      if (!selectedEventId) setCheckins([])
      return
    }
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("checkins")
        .select("*")
        .eq("event_id", selectedEventId)
        .not("student_id", "is", null) // Only fetch those with MSSV
        .order("created_at", { ascending: false })

      if (!error && data) {
        setCheckins(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCheckins()
    const channel = supabase
      .channel("emails_list_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, () => fetchCheckins())
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [supabase, selectedEventId])

  const filteredData = useMemo(() => {
    let result = checkins
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) || 
        (c.student_id && c.student_id.toLowerCase().includes(q))
      )
    }
    if (filter === "sent") {
      result = result.filter(c => c.email_sent === true)
    } else if (filter === "unsent") {
      result = result.filter(c => c.email_sent !== true)
    }
    return result
  }, [checkins, searchQuery, filter])

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredData.map(c => c.id)))
    }
  }

  const toggleItem = (id: string) => {
    const newPaths = new Set(selectedIds)
    if (newPaths.has(id)) newPaths.delete(id)
    else newPaths.add(id)
    setSelectedIds(newPaths)
  }

  const handleSendEmails = async (allUnsent: boolean = false) => {
    if (!selectedEventId) return
    
    let idsToSend: string[] = []
    
    if (allUnsent) {
      // Find all unsent
      idsToSend = checkins.filter(c => c.email_sent !== true).map(c => c.id)
      if (idsToSend.length === 0) {
        alert("Tất cả thành viên có MSSV trong chương trình đã được gửi thư!")
        return
      }
      if (!confirm(`Bạn có chắc muốn gửi email cho TẤT CẢ ${idsToSend.length} đại biểu chưa nhận thư?`)) return
    } else {
      idsToSend = Array.from(selectedIds)
      if (idsToSend.length === 0) {
        alert("Vui lòng chọn ít nhất 1 đại biểu để gửi thư.")
        return
      }
      if (!confirm(`Bạn có chắc muốn gửi email cho ${idsToSend.length} đại biểu đã chọn không?`)) return
    }

    setIsSending(true)
    try {
      const res = await fetch("/api/send-thankyou", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          event_id: selectedEventId,
          checkin_ids: idsToSend,
          customSubject: customSubject,
          customHtml: customHtml
        })
      })
      const data = await res.json()
      
      if (res.ok) {
        alert("Thành công: " + (data.message || "Đã xử lý xong emails."))
        setSelectedIds(new Set())
        fetchCheckins()
      } else {
        alert("Lỗi: " + (data.error || "Có lỗi xảy ra"))
      }
    } catch (e: any) {
      alert("Đã xảy ra lỗi: " + e.message)
    } finally {
      setIsSending(false)
    }
  }

  if (!selectedEventId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Mail className="w-16 h-16 text-slate-200 mb-4" />
        <h3 className="text-xl font-black uppercase text-slate-400">Chưa chọn chương trình</h3>
        <p className="text-slate-500 mt-2">Vui lòng chọn một chương trình ở Top Bar để tiếp tục.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-outline-variant/5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Mail className="text-primary" size={28} />
            Quản lý Gửi Thư Cảm Ơn
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Gửi email tự động xác nhận với những thành viên đã Check-in bằng MSSV.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => handleSendEmails(false)}
            disabled={isSending || selectedIds.size === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary text-primary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            Gửi Đã Chọn ({selectedIds.size})
          </button>
          <button 
            onClick={() => handleSendEmails(true)}
            disabled={isSending || checkins.filter(c => c.email_sent !== true).length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-container shadow-xl shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            Gửi ALL ({checkins.filter(c => c.email_sent !== true).length} unsent)
          </button>
        </div>
      </div>
      
      {/* Email Editor Section */}
      <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-outline-variant/5 overflow-hidden transition-all duration-300">
        <button 
          onClick={() => setShowEditor(!showEditor)}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
              <Settings2 size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Cấu hình nội dung thư</h3>
              <p className="text-slate-500 text-xs font-medium">Tùy chỉnh tiêu đề và nội dung Email gửi cho sinh viên.</p>
            </div>
          </div>
          {showEditor ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </button>
        
        {showEditor && (
          <div className="p-6 pt-0 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-slate-500">Tiêu đề Email</Label>
                  <Input 
                    id="subject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Nhập tiêu đề email..."
                    className="h-11 font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content" className="text-xs font-black uppercase tracking-widest text-slate-500">Nội dung (HTML)</Label>
                    <div className="group relative">
                      <Info size={14} className="text-slate-400 cursor-help" />
                      <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <p className="font-bold mb-1 underline">Biến hỗ trợ:</p>
                        <ul className="space-y-1">
                          <li><code className="bg-slate-700 px-1 rounded">{"{{name}}"}</code>: Tên sinh viên</li>
                          <li><code className="bg-slate-700 px-1 rounded">{"{{event_title}}"}</code>: Tên chương trình</li>
                          <li><code className="bg-slate-700 px-1 rounded">{"{{student_id}}"}</code>: MSSV</li>
                          <li><code className="bg-slate-700 px-1 rounded">{"{{checkin_time}}"}</code>: Thời gian check-in</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <Textarea 
                    id="content"
                    value={customHtml}
                    onChange={(e) => setCustomHtml(e.target.value)}
                    placeholder="Nhập nội dung HTML..."
                    className="min-h-[300px] font-mono text-sm leading-relaxed"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Eye size={14} /> Xem trước giao diện
                </Label>
                <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30 h-[calc(100%-2rem)] min-h-[400px]">
                  <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Preview</span>
                  </div>
                  <div className="p-4 overflow-auto max-h-[500px]">
                    <div className="text-xs font-bold text-slate-400 mb-2 pb-2 border-b border-slate-100">
                      Subject: <span className="text-slate-600">
                        {customSubject
                          .replace(/{{name}}/g, "Nguyễn Văn A")
                          .replace(/{{event_title}}/g, activeEvent?.title || "Tên Sự Kiện")
                          .replace(/{{student_id}}/g, "21110xxx")
                          .replace(/{{checkin_time}}/g, new Date().toLocaleString('vi-VN'))
                        }
                      </span>
                    </div>
                    <div 
                      className="bg-white rounded-lg shadow-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: customHtml
                          .replace(/{{name}}/g, "Nguyễn Văn A")
                          .replace(/{{event_title}}/g, activeEvent?.title || "Tên Sự Kiện")
                          .replace(/{{student_id}}/g, "21110xxx")
                          .replace(/{{checkin_time}}/g, new Date().toLocaleString('vi-VN'))
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-outline-variant/5 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Tìm MSSV, Tên..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white rounded-xl font-medium focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(["all", "sent", "unsent"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  filter === f ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {f === "all" ? "Tất cả" : f === "sent" ? "Đã Gửi" : "Chưa Gửi"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="py-20 text-center flex flex-col items-center">
                <Loader2 className="animate-spin text-primary opacity-50 w-8 h-8 mb-4" />
                <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Đang tải danh sách...</span>
             </div>
          ) : filteredData.length === 0 ? (
            <div className="py-20 text-center text-slate-400 italic font-medium uppercase tracking-normal text-xs">
              Không có dữ liệu phù hợp (lưu ý tính năng này chỉ hỗ trợ đại biểu có khai báo MSSV hợp lệ).
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-primary transition-colors">
                      {selectedIds.size === filteredData.length && filteredData.length > 0 ? (
                        <CheckSquare size={18} className="text-primary" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="p-4 border-b border-outline-variant/5">Đại biểu</th>
                  <th className="p-4 border-b border-outline-variant/5">Thông tin</th>
                  <th className="p-4 border-b border-outline-variant/5 text-center">Trạng thái Mail</th>
                  <th className="p-4 border-b border-outline-variant/5 text-right whitespace-nowrap">Thời gian check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filteredData.map(c => (
                  <tr key={c.id} className={`hover:bg-primary/5 transition-colors cursor-pointer ${selectedIds.has(c.id) ? 'bg-blue-50/30' : ''}`} onClick={() => toggleItem(c.id)}>
                    <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                       <button onClick={() => toggleItem(c.id)} className="text-slate-300 hover:text-primary transition-colors">
                        {selectedIds.has(c.id) ? (
                          <CheckSquare size={18} className="text-primary" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black uppercase text-slate-500">
                          {c.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{c.name}</p>
                          <p className="text-xs text-primary font-bold">{c.student_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500">
                      {c.chuc_vu}<br/>{c.don_vi}
                    </td>
                    <td className="p-4 text-center">
                      {c.email_sent ? (
                         <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                           <CheckCircle2 size={14} /> Gửi Xong
                         </div>
                      ) : (
                         <div className="inline-flex items-center justify-center px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                           Chưa Gửi
                         </div>
                      )}
                    </td>
                    <td className="p-4 text-right text-xs font-bold text-slate-400 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
