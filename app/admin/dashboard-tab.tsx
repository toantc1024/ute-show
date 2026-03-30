"use client"

import React, { useState } from "react"
import { StatCard } from "@/components/stat-card"
import { useEvent } from "@/components/event-context"
import { Download, ChevronRight, Mail, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardTabProps {
  stats: any
  recentCheckins: any[]
  chartData: { counts: number[], labels: string[] }
  onExport: () => void
}

export function DashboardTab({ stats, recentCheckins, chartData, onExport }: DashboardTabProps) {
  const { activeEvent, selectedEventId } = useEvent()
  const [isSendingMail, setIsSendingMail] = useState(false)
  
  const handleSendEmails = async () => {
    if (!selectedEventId) {
      alert("Vui lòng chọn sự kiện trước!")
      return
    }
    if (!confirm(`Bạn có chắc muốn gửi email Cảm ơn / Xác nhận đến đại biểu đã check-in không?\n\n(Chức năng này thường được thực hiện sau khi sự kiện hoặc thời gian check-in đã kết thúc)`)) {
      return
    }

    setIsSendingMail(true)
    try {
      const res = await fetch("/api/send-thankyou", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: selectedEventId })
      })
      const data = await res.json()
      
      if (res.ok) {
        alert("Thành công: " + (data.message || "Đã gửi email."))
      } else {
        alert("Lỗi: " + (data.error || "Gửi email thất bại"))
      }
    } catch (e: any) {
      alert("Đã xảy ra lỗi hệ thống: " + (e.message || ""))
    } finally {
      setIsSendingMail(false)
    }
  }

  const { counts, labels } = chartData
  const maxVal = counts.length > 0 ? Math.max(...counts, 1) : 1
  const peakIndex = counts.length > 0 ? counts.indexOf(Math.max(...counts)) : -1

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Wrapped Banner */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-secondary p-16 text-white shadow-2xl shadow-primary/20 group">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-4 py-1.5 rounded-lg bg-white/20 backdrop-blur-md text-[10px] font-black tracking-[0.2em] uppercase mb-6 animate-pulse">UTE Check-in 2026</span>
          <h2 className="text-7xl font-black tracking-normal leading-none mb-6">
            Chào mừng bạn đến với<br />
            Hệ thống điểm danh YUTE
          </h2>
          <p className="text-xl text-white/80 font-medium leading-relaxed max-w-lg">
            Hệ thống quản lý sự kiện và điểm danh thông minh dành riêng cho cộng đồng HCMUTE.
          </p>
        </div>
        {/* Abstract Decorative Shapes */}
        <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-white/10 rounded-lg blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute right-40 -bottom-10 w-[300px] h-[300px] bg-secondary/30 rounded-lg blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
      </section>

      {/* Summary Cards Bento */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          label="Tổng đại biểu" 
          value={stats?.totalGuests || 0} 
          icon="groups" 
          trend="+12%" 
          trendColor="primary" 
          accent="none"
        />
        <StatCard 
          label="Đã Check-in" 
          value={stats?.checkinCount || 0} 
          icon="check_circle" 
          trend={`${stats?.totalGuests ? Math.round((stats?.checkinCount || 0) / (stats?.totalGuests || 1) * 100) : 0}%`}
          trendColor="primary" 
          accent="left"
        />
        <StatCard 
          label="Chưa Check-in" 
          value={(stats?.totalGuests || 0) - (stats?.checkinCount || 0)} 
          icon="pending" 
          trend={`${stats?.totalGuests ? Math.round(((stats?.totalGuests || 0) - (stats?.checkinCount || 0)) / (stats?.totalGuests || 1) * 100) : 0}%`}
          trendColor="secondary" 
          accent="right"
        />
        <StatCard 
          label="Đại biểu mới" 
          value={stats?.newGuestsToday || 0} 
          icon="person_add" 
          trend="+5" 
          trendColor="primary" 
          accent="none"
        />
      </section>

      {/* Main Data Section */}
      <section className="bg-surface-container-lowest/50 backdrop-blur-xl rounded-xl p-12 shadow-xl shadow-blue-900/5 border border-outline-variant/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h3 className="text-3xl font-black text-on-surface tracking-normal uppercase">
                Xác nhận check-in
              </h3>
              {activeEvent && (
                <span className="text-[10px] font-black text-primary bg-primary/10 px-4 py-1.5 rounded-lg uppercase tracking-normal animate-in zoom-in-75">
                  {activeEvent.title}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-normal">
              TRỤC OY: SỐ LƯỢNG | TRỤC OX: THỜI GIAN THEO LƯỢT CHECK-IN THỰC TẾ
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSendEmails}
              disabled={isSendingMail}
              className="flex items-center gap-3 px-8 py-4 bg-orange-500 text-white rounded-lg font-black text-xs uppercase tracking-[0.1em] hover:bg-orange-600 transition-all active:scale-95 shadow-xl shadow-orange-500/20 disabled:opacity-50"
            >
              {isSendingMail ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              <span>Gửi Email {isSendingMail ? '...' : ''}</span>
            </button>
            <button 
              onClick={onExport}
              className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-lg font-black text-xs uppercase tracking-[0.1em] hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95 shadow-xl shadow-primary/20"
            >
              <Download size={16} />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        {/* Real Chart (Calculated from checkin times) */}
        <div className="relative bg-white rounded-xl h-[500px] overflow-hidden flex flex-col border border-outline-variant/10 shadow-2xl shadow-blue-900/5 group">
          <div className="p-8 flex items-center justify-between border-b border-outline-variant/5">
             <h4 className="font-black text-on-surface uppercase text-xs tracking-normal flex items-center gap-2">
               <span className="material-symbols-outlined text-sm text-primary">timeline</span>
               THỐNG KÊ THEO LƯỢT CHECK-IN (TỪ {labels[0] || "..."} ĐẾN {labels[labels.length-1] || "..."})
             </h4>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-lg bg-primary shadow-lg shadow-primary/30"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-normal">Thành viên</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-lg bg-secondary-container opacity-50"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-normal">Dự kiến</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 px-12 pt-16 pb-8 flex items-end justify-between gap-1 sm:gap-1.5 bg-gradient-to-b from-transparent to-slate-50/50">
            {counts.length === 0 ? (
               <div className="w-full text-center py-20 text-slate-300 italic font-black text-sm uppercase">Chưa có dữ liệu check-in để hiển thị biểu đồ.</div>
            ) : (
              counts.map((val, i) => {
                const height = maxVal > 0 ? (val / maxVal) * 80 + 5 : 5
                return (
                  <div key={i} className="flex-1 bg-primary/5 rounded-t-sm relative group transition-all hover:bg-primary/10" style={{ height: `100%` }}>
                    {/* The actual data bar */}
                    <div 
                      className="absolute inset-x-0 sm:inset-x-0.5 bottom-0 bg-gradient-to-t from-primary to-primary-container rounded-t-sm transition-all duration-1000 ease-out shadow-lg shadow-primary/10 group-hover:from-primary group-hover:to-secondary-container" 
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] font-black py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl whitespace-nowrap">
                        {val} LƯỢT ({labels[i]})
                      </div>
                    </div>
                    
                    {i === peakIndex && val > 0 && (
                       <div className="absolute top-4 left-1/2 -translate-x-1/2 border border-primary/20 bg-primary/5 px-2 py-0.5 rounded-lg text-[8px] font-black text-primary uppercase whitespace-nowrap">Peak</div>
                    )}
                  </div>
                )
              })
            )}
          </div>
          
          <div className="p-6 px-12 flex justify-between border-t border-outline-variant/5 bg-slate-50/30 overflow-x-auto">
            {labels.filter((_, idx) => idx % Math.max(1, Math.floor(labels.length / 5)) === 0).map((t, idx) => (
              <span key={idx} className="text-[10px] font-black text-slate-400 tracking-normal mx-2">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Activity and Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-16">
        <div className="lg:col-span-2 bg-white rounded-xl p-10 shadow-xl shadow-blue-900/5 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-10">
            <h4 className="text-xl font-black text-on-surface tracking-normal uppercase">Hoạt động mới nhất</h4>
            <button className="text-xs font-black text-primary hover:bg-primary/5 px-4 py-2 rounded-lg transition-all uppercase tracking-normal">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            {recentCheckins.length === 0 ? (
              <p className="text-center py-20 text-slate-300 italic font-medium uppercase tracking-normal text-xs">Chưa có hoạt động nào được ghi nhận.</p>
            ) : (
              recentCheckins.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-xl bg-surface-container-low/30 hover:bg-surface-container-low transition-all group border border-transparent hover:border-outline-variant/10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-primary-container/10 flex items-center justify-center text-primary font-black shadow-inner shadow-primary/5">
                      {item.title ? item.title.substring(0, 2).toUpperCase() : "..."}
                    </div>
                    <div>
                      <p className="font-black text-on-surface uppercase tracking-normal text-sm leading-none mb-2">{item.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal flex items-center gap-2">
                        {item.unit || "N/A"} <span className="opacity-30">•</span> MSSV: {item.student_id || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary mb-1">{item.checkin_time && new Date(item.checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[9px] font-black text-green-600 px-3 py-1 bg-green-50 rounded-lg inline-block tracking-normal uppercase shadow-sm">SUCCESS</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-10 flex flex-col items-center justify-between text-center shadow-xl shadow-blue-900/5 border border-outline-variant/10">
          <h4 className="text-xl font-black text-on-surface tracking-normal mb-8 w-full text-left uppercase">Phân bổ đại biểu</h4>
          <div className="relative w-56 h-56 mb-10 animate-in zoom-in-75 duration-1000">
             {/* Dynamic donut chart sim */}
            <div className="absolute inset-0 rounded-full border-[16px] border-primary border-r-transparent border-b-transparent rotate-[30deg] shadow-xl shadow-primary/10"></div>
            <div className="absolute inset-3 rounded-full border-[16px] border-secondary border-l-transparent border-t-transparent rotate-12 shadow-md shadow-secondary/10"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-on-surface tracking-tight">{stats?.totalGuests || 0}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">TOTAL</span>
            </div>
          </div>
          <div className="space-y-6 w-full px-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-normal">
                <span className="text-slate-500">Giảng viên / VIP</span>
                <span className="text-primary">85%</span>
              </div>
              <div className="w-full h-2 bg-slate-50 rounded-lg overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container w-[85%] rounded-lg shadow-lg shadow-primary/20"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-normal">
                <span className="text-slate-500">Khách mời / SV</span>
                <span className="text-secondary">15%</span>
              </div>
              <div className="w-full h-2 bg-slate-50 rounded-lg overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-secondary to-secondary-container w-[15%] rounded-lg shadow-lg shadow-secondary/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
