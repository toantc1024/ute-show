"use client"

import React, { useState } from "react"
import { useEvent } from "@/components/event-context"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { X, Loader2, Calendar, Clock, MapPin, Plus, Trash2, Check, Pencil, PlayCircle } from "lucide-react"

export function ProgramsTab() {
  const { events, selectedEventId, setSelectedEventId, refreshEvents } = useEvent()
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [checkinStart, setCheckinStart] = useState("")
  const [checkinEnd, setCheckinEnd] = useState("")

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/events", {
        method:editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: title.trim(), 
          event_date: eventDate || null,
          checkin_start: checkinStart || null,
          checkin_end: checkinEnd || null
        })
      })
      if (res.ok) {
        setIsAdding(false)
        setEditingId(null)
        setTitle("")
        setEventDate("")
        setCheckinStart("")
        setCheckinEnd("")
        await refreshEvents()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa?")) return
    await fetch(`/api/events/${id}`, { method: "DELETE" })
    await refreshEvents()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current })
    })
    await refreshEvents()
  }

  const startEdit = (event: any) => {
    setEditingId(event.id)
    setTitle(event.title)
    setEventDate(event.event_date ? format(new Date(event.event_date), "yyyy-MM-dd'T'HH:mm") : "")
    setCheckinStart(event.checkin_start ? format(new Date(event.checkin_start), "yyyy-MM-dd'T'HH:mm") : "")
    setCheckinEnd(event.checkin_end ? format(new Date(event.checkin_end), "yyyy-MM-dd'T'HH:mm") : "")
    setIsAdding(true)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Hero Banner */}
      <section className="relative h-64 rounded-xl overflow-hidden shadow-xl shadow-primary/10 group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-container to-secondary-container opacity-90 transition-all group-hover:opacity-80"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative h-full flex flex-col md:flex-row items-center px-12 justify-between gap-6 py-6 text-center md:text-left">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-bold mb-4 tracking-normal uppercase">REAL-TIME MONITOR</span>
            <h3 className="text-4xl font-extrabold text-white mb-2 leading-tight tracking-normal uppercase">Hoạt động đang diễn ra</h3>
            <p className="text-white/80 font-medium">Theo dõi và quản lý các sự kiện điểm danh trong khuôn viên trường đại học.</p>
          </div>
          <div className="flex gap-4 sm:gap-6">
            <div className="glass-card p-6 rounded-lg text-primary text-center min-w-[140px] shadow-lg border border-white/20">
              <p className="text-xs font-bold opacity-70 uppercase tracking-normal mb-1">Tổng sự kiện</p>
              <p className="text-4xl font-black tabular-nums">{events.length}</p>
            </div>
            <div className="glass-card p-6 rounded-lg text-secondary text-center min-w-[140px] shadow-lg border border-white/20">
              <p className="text-xs font-bold opacity-70 uppercase tracking-normal mb-1">Đang chạy</p>
              <p className="text-4xl font-black tabular-nums">{events.filter(e => e.is_active).length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xl font-bold text-on-surface uppercase tracking-normal">Danh sách sự kiện</h4>
          <p className="text-sm text-on-surface-variant font-medium">Sắp xếp theo thời gian mới nhất</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); setTitle(""); setEventDate(""); setCheckinStart(""); setCheckinEnd(""); }}
          className="bg-secondary text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-secondary/20 hover:scale-105 transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Thêm chương trình
        </button>
      </div>

      {/* Edit/Add Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAdding(false)}></div>
          <Card className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden border-none animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low">
              <h3 className="text-lg font-black tracking-normal uppercase">{editingId ? "Chỉnh sửa" : "Thêm mới"} chương trình</h3>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-normal text-on-surface-variant">Tên chương trình</Label>
                  <Input 
                    placeholder="Nhập tên sự kiện..." 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="h-12 bg-surface-container-lowest font-medium border-outline-variant/5 focus:ring-primary focus:border-primary rounded-xl px-4"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-normal text-on-surface-variant">Ngày tổ chức</Label>
                    <Input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} className="h-11 bg-slate-50 border-none rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-normal text-on-surface-variant">Bắt đầu checkin</Label>
                    <Input type="datetime-local" value={checkinStart} onChange={e => setCheckinStart(e.target.value)} className="h-11 bg-slate-50 border-none rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-normal text-on-surface-variant">Kết thúc checkin</Label>
                    <Input type="datetime-local" value={checkinEnd} onChange={e => setCheckinEnd(e.target.value)} className="h-11 bg-slate-50 border-none rounded-xl" />
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-14 bg-primary hover:bg-primary-container text-white font-black text-base shadow-xl shadow-primary/20 rounded-xl transition-all active:scale-95 uppercase tracking-normal">
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (editingId ? "Cập nhật" : "Xác nhận tạo")}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Bento Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event) => (
          <div 
            key={event.id}
            onClick={() => setSelectedEventId(event.id)}
            className={cn(
              "bg-surface-container-lowest rounded-lg p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden h-full flex flex-col border border-outline-variant/5",
              selectedEventId === event.id ? "ring-2 ring-primary border-transparent" : "",
              event.is_active ? "border-r-4 border-r-secondary" : ""
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-3 rounded-full", event.is_active ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary")}>
                <span className="material-symbols-outlined text-xl">{event.is_active ? "sensors" : "event"}</span>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-normal",
                event.is_active ? "bg-secondary-fixed text-on-secondary-fixed-variant" : "bg-primary-fixed text-on-primary-fixed-variant"
              )}>
                {event.is_active ? "Kích hoạt" : "Sắp diễn ra"}
              </span>
            </div>

            <h5 className={cn("text-lg font-bold text-on-surface mb-2 tracking-normal group-hover:text-primary transition-colors", event.is_active ? "text-secondary" : "")}>
              {event.title}
            </h5>

            <div className="space-y-3 mt-4 flex-1">
              <div className="flex items-center gap-3 text-on-surface-variant/80">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-normal">
                  {event.event_date ? format(new Date(event.event_date), "EEEE, dd/MM/yyyy", { locale: vi }) : "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant/80">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-normal">
                  {event.checkin_start ? format(new Date(event.checkin_start), "HH:mm") : "??:??"} - {event.checkin_end ? format(new Date(event.checkin_end), "HH:mm") : "??:??"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant/80">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-normal">Hội trường A (Mặc định)</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-surface-container-low flex justify-between items-center bg-transparent">
               <div className="flex items-center gap-2 px-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); startEdit(event); }}
                  className="p-2 text-primary hover:bg-primary/5 rounded-full transition-colors"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleActive(event.id, event.is_active); }}
                  className={cn("p-2 rounded-full transition-colors", event.is_active ? "text-green-600 hover:bg-green-50" : "text-slate-400 hover:bg-slate-50")}
                >
                  {event.is_active ? <Check size={18} /> : <PlayCircle size={18} />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <span className={cn("text-[10px] font-black uppercase tracking-normal", event.is_active ? "text-secondary animate-pulse" : "text-primary")}>
                {event.is_active ? "Đang check-in..." : "Sẵn sàng"}
              </span>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-normal text-sm">Chưa có chương trình nào được tạo.</p>
          </div>
        )}
      </div>

      {/* Focus Insight Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="col-span-1 md:col-span-2 glass-card rounded-lg p-8 flex items-center gap-8 shadow-sm border border-white/50">
          <div className="w-24 h-24 rounded-full border-[6px] border-secondary flex flex-col items-center justify-center bg-white shadow-inner">
            <span className="text-2xl font-black text-secondary leading-none">85%</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-normal">AVG RATE</span>
          </div>
          <div>
            <h6 className="text-lg font-bold text-primary mb-1 uppercase tracking-normal">Hiệu suất tham gia trung bình</h6>
            <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
              Tỷ lệ sinh viên check-in đúng giờ trong tháng này đã tăng 12% so với tháng trước. Hệ thống hoạt động ổn định.
            </p>
          </div>
        </div>
        <div className="bg-primary text-white rounded-lg p-8 shadow-xl shadow-primary/20 relative overflow-hidden group border border-primary-container">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-[120px]">auto_awesome</span>
          </div>
          <h6 className="text-lg font-bold mb-2 uppercase tracking-normal">Tạo báo cáo nhanh</h6>
          <p className="text-xs text-primary-fixed mb-6 font-medium leading-relaxed">Xuất dữ liệu check-in cho toàn bộ chương trình trong tuần này.</p>
          <button className="w-full bg-white text-primary font-black py-3 rounded-full text-xs uppercase tracking-normal shadow-lg active:scale-95 transition-all">
            Xuất File .CSV
          </button>
        </div>
      </section>
    </div>
  )
}
