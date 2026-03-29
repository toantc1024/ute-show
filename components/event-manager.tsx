"use client"

import React, { useState } from "react"
import { useSupabase } from "./supabase-provider"
import { useEvent } from "./event-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, Clock, Check, Trash2, Loader2, PlayCircle, Settings, Pencil, X } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

type EventRow = any; // Will use real types from context

export function EventManager() {
  const { supabase } = useSupabase()
  const { events, selectedEventId, setSelectedEventId, refreshEvents } = useEvent()
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [title, setTitle] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [checkinStart, setCheckinStart] = useState("")
  const [checkinEnd, setCheckinEnd] = useState("")

  const [editingId, setEditingId] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !title.trim()) {
      alert("Vui lòng nhập tên chương trình")
      return
    }
    
    setLoading(true)
    try {
      const payload = {
        title: title.trim(),
        event_date: eventDate || null,
        checkin_start: checkinStart || null,
        checkin_end: checkinEnd || null
      }
      
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const result = await res.json()

      if (res.ok) {
        setTitle("")
        setEventDate("")
        setCheckinStart("")
        setCheckinEnd("")
        setIsAdding(false)
        await refreshEvents()
        alert("Tạo chương trình thành công!")
      } else {
        const errorMessage = result.error || "Không xác định"
        const details = result.details ? `\nChi tiết: ${JSON.stringify(result.details)}` : ""
        alert(`Lỗi từ hệ thống: ${errorMessage}${details}`)
        console.error("Event creation error details:", result)
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message)
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa chương trình này? Toàn bộ dữ liệu check-in đính kèm cũng sẽ bị xóa.")) return
    
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" })
      if (res.ok) {
        if (selectedEventId === id) setSelectedEventId(null)
        await refreshEvents()
      } else {
        const err = await res.json()
        alert("Lỗi khi xóa: " + err.error)
      }
    } catch (err) {
      alert("Lỗi kết nối khi xóa.")
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !current })
      })

      if (res.ok) {
        await refreshEvents()
      } else {
        const err = await res.json()
        alert("Lỗi khi thay đổi trạng thái: " + err.error)
      }
    } catch (err) {
      alert("Lỗi kết nối.")
    }
  }

  const startEdit = (event: any) => {
    setEditingId(event.id)
    setTitle(event.title)
    setEventDate(event.event_date ? format(new Date(event.event_date), "yyyy-MM-dd'T'HH:mm") : "")
    setCheckinStart(event.checkin_start ? format(new Date(event.checkin_start), "yyyy-MM-dd'T'HH:mm") : "")
    setCheckinEnd(event.checkin_end ? format(new Date(event.checkin_end), "yyyy-MM-dd'T'HH:mm") : "")
    setIsAdding(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    setLoading(true)
    try {
      const payload = {
        title: title.trim(),
        event_date: eventDate || null,
        checkin_start: checkinStart || null,
        checkin_end: checkinEnd || null
      }
      
      const res = await fetch(`/api/events/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setEditingId(null)
        setTitle("")
        setEventDate("")
        setCheckinStart("")
        setCheckinEnd("")
        setIsAdding(false)
        await refreshEvents()
        alert("Cập nhật chương trình thành công!")
      } else {
        const result = await res.json()
        alert("Lỗi khi cập nhật: " + result.error)
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-normal flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          QUẢN LÝ CHƯƠNG TRÌNH
        </h2>
        <Button 
          onClick={() => {
            if (isAdding) {
              setEditingId(null)
              setTitle("")
              setEventDate("")
              setCheckinStart("")
              setCheckinEnd("")
            }
            setIsAdding(!isAdding)
          }}
          variant={isAdding ? "ghost" : "default"}
          className={cn("font-bold transition-all", isAdding ? "text-red-500 hover:bg-red-50" : "bg-primary")}
        >
          {isAdding ? "Hủy" : <><Plus className="mr-2 h-4 w-4" /> Thêm mới</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-blue-200 bg-blue-50/30 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader className="pb-3 border-b border-blue-100">
            <CardTitle className="text-sm font-bold text-blue-800 uppercase flex items-center justify-between">
              {editingId ? "Chỉnh sửa chương trình" : "Thêm chương trình mới"}
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Tên chương trình</Label>
                <Input 
                  placeholder="Ví dụ: Đại hội Đại biểu Đoàn trường..." 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="bg-white border-blue-200 focus:ring-primary font-medium"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Ngày tổ chức</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="datetime-local" 
                      value={eventDate}
                      onChange={e => setEventDate(e.target.value)}
                      className="pl-10 bg-white border-blue-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Giờ bắt đầu check-in</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="datetime-local" 
                      value={checkinStart}
                      onChange={e => setCheckinStart(e.target.value)}
                      className="pl-10 bg-white border-blue-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Giờ kết thúc check-in</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="datetime-local" 
                      value={checkinEnd}
                      onChange={e => setCheckinEnd(e.target.value)}
                      className="pl-10 bg-white border-blue-200"
                    />
                  </div>
                </div>
              </div>
              
              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary font-bold py-5 mt-2 shadow-md shadow-blue-200">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (editingId ? "CẬP NHẬT THÔNG TIN" : "XÁC NHẬN TẠO")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {events.length === 0 ? (
          <div className="text-center py-10 text-slate-400 italic">Chưa có chương trình nào được tạo.</div>
        ) : (
          events.map(event => (
            <Card key={event.id} className={cn(
              "group overflow-hidden transition-all duration-300 border shadow-sm",
              selectedEventId === event.id ? "border-primary bg-blue-50/40 ring-1 ring-primary/50 scale-[1.01]" : "border-slate-200 hover:border-blue-200 hover:bg-slate-50/50"
            )}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                <div className="flex-1 min-w-0" onClick={() => setSelectedEventId(event.id)}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn("text-base font-bold truncate", selectedEventId === event.id ? "text-primary" : "text-slate-800 hover:text-primary transition-colors cursor-pointer")}>
                      {event.title}
                    </h3>
                    {event.is_active && (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 ring-1 ring-green-200 uppercase tracking-normal">
                        <PlayCircle className="h-3 w-3" /> Đang chạy
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    {event.event_date && (
                      <span className="inline-flex items-center text-[11px] font-semibold text-slate-500">
                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                        {format(new Date(event.event_date), "HH:mm, dd/MM/yyyy", { locale: vi })}
                      </span>
                    )}
                    {(event.checkin_start || event.checkin_end) && (
                      <span className="inline-flex items-center text-[11px] font-semibold text-slate-500">
                        <Clock className="mr-1.5 h-3.5 w-3.5" />
                        Checkin: {event.checkin_start ? format(new Date(event.checkin_start), "HH:mm") : "??:??"} - {event.checkin_end ? format(new Date(event.checkin_end), "HH:mm") : "??:??"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant={event.is_active ? "default" : "outline"}
                    className={cn("h-8 text-xs font-bold transition-all", event.is_active ? "bg-green-600 hover:bg-green-700" : "text-green-600 border-green-200 hover:bg-green-50")}
                    onClick={() => toggleActive(event.id, event.is_active)}
                  >
                    {event.is_active ? <><Check className="mr-1.5 h-3.5 w-3.5" /> Active</> : "Kích hoạt"}
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-primary hover:bg-blue-50 hover:text-primary transition-colors"
                    onClick={() => startEdit(event)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
