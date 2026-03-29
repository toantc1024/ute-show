"use client"

import React from "react"
import { StatCard } from "@/components/stat-card"
import { useEvent } from "@/components/event-context"
import { Download, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardTabProps {
  stats: any
  recentCheckins: any[]
  onExport: () => void
}

export function DashboardTab({ stats, recentCheckins, onExport }: DashboardTabProps) {
  const { activeEvent } = useEvent()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Wrapped Banner */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-secondary p-12 text-white shadow-2xl shadow-primary/20 group">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-normal uppercase mb-4">Annual Statistics</span>
          <h2 className="text-6xl font-black tracking-normal leading-tight mb-4 uppercase">
            {activeEvent?.title || "UTE"} WRAPPED 2026
          </h2>
          <p className="text-lg text-white/80 font-medium">
            Nhìn lại hành trình kết nối và chuyển đổi số tại hệ thống điểm danh thông minh UTE.
          </p>
        </div>
        {/* Abstract Decorative Shapes */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute right-40 -bottom-10 w-60 h-60 bg-secondary/30 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
      </section>

      {/* Summary Cards Bento */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Tổng đại biểu" 
          value={stats?.totalGuests || 0} 
          icon="groups" 
          trend="+12%" 
          trendColor="primary" 
        />
        <StatCard 
          label="Đã Check-in" 
          value={stats?.checkinCount || 0} 
          icon="check_circle" 
          trend={`${Math.round((stats?.checkinCount || 0) / (stats?.totalGuests || 1) * 100)}%`}
          trendColor="success" 
        />
        <StatCard 
          label="Chưa Check-in" 
          value={(stats?.totalGuests || 0) - (stats?.checkinCount || 0)} 
          icon="pending" 
          trend={`${Math.round(((stats?.totalGuests || 0) - (stats?.checkinCount || 0)) / (stats?.totalGuests || 1) * 100)}%`}
          trendColor="secondary" 
        />
        <StatCard 
          label="Đại biểu mới" 
          value={stats?.newGuestsToday || 0} 
          icon="person_add" 
          trend="+5" 
          trendColor="primary" 
        />
      </section>

      {/* Main Data Section */}
      <section className="bg-surface-container-low rounded-lg p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-black text-on-surface tracking-normal mb-2 uppercase flex items-center gap-3">
              Dữ liệu tổng quan
              {activeEvent && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-normal animate-in fade-in zoom-in duration-500">
                  {activeEvent.title}
                </span>
              )}
            </h3>
            <p className="text-on-surface-variant text-sm font-medium">
              Bạn đang xem dữ liệu ngày: <span className="text-primary font-black uppercase tracking-normal">
                {activeEvent?.event_date ? new Date(activeEvent.event_date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) : "Chưa chọn ngày"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-container-highest rounded-full p-1 shadow-inner">
              <button className="px-6 py-2 rounded-full text-sm font-bold bg-white shadow-sm text-primary">Giờ</button>
              <button className="px-6 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:bg-white/50 transition-colors">Ngày</button>
              <button className="px-6 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:bg-white/50 transition-colors">Tháng</button>
            </div>
            <button 
              onClick={onExport}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        {/* Chart Placeholder (Simulated) */}
        <div className="relative bg-surface-container-lowest rounded-lg h-[450px] overflow-hidden flex flex-col border border-outline-variant/10 shadow-inner">
          <div className="p-6 flex items-center justify-between border-b border-outline-variant/10">
            <h4 className="font-bold text-on-surface uppercase text-sm tracking-wide">XÁC NHẬN CHECK-IN THEO THỜI GIAN</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-xs font-medium text-on-surface-variant">Check-in</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary-container"></span>
                <span className="text-xs font-medium text-on-surface-variant">Check-out</span>
              </div>
            </div>
          </div>
          <div className="flex-1 p-8 flex items-end justify-between gap-4 bg-slate-50/30">
            {[30, 45, 65, 85, 60, 40, 35, 55, 75, 40].map((h, i) => (
              <div key={i} className="w-full bg-primary-fixed/20 rounded-t-lg relative group transition-all hover:bg-primary-fixed/40" style={{ height: `${h}%` }}>
                <div className="absolute inset-x-2 bottom-0 bg-primary rounded-t-lg transition-all duration-700" style={{ height: `${h + 10}%` }}></div>
                {i === 3 && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">Peak: 420</div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 px-8 flex justify-between border-t border-outline-variant/10 bg-white">
            {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map(t => (
              <span key={t} className="text-[10px] font-bold text-slate-400">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Activity and Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-lg p-8 shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-black text-on-surface tracking-normal uppercase">HOẠT ĐỘNG GẦN ĐÂY</h4>
            <button className="text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-normal">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            {recentCheckins.length === 0 ? (
              <p className="text-center py-10 text-slate-400 italic">Chưa có hoạt động nào.</p>
            ) : (
              recentCheckins.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold">
                      {item.title ? item.title.substring(0, 2).toUpperCase() : "..."}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{item.title}</p>
                      <p className="text-xs text-on-surface-variant font-medium opacity-70">
                        {item.unit || "N/A"} - MSSV: {item.student_id || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">{item.checkin_time && new Date(item.checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[10px] font-bold text-green-600 px-2 py-0.5 bg-green-50 rounded-full inline-block tracking-normal uppercase">SUCCESS</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-8 flex flex-col items-center justify-between text-center shadow-sm border border-outline-variant/10">
          <h4 className="text-lg font-black text-on-surface tracking-normal mb-6 w-full text-left uppercase">PHÂN BỔ ĐẠI BIỂU</h4>
          <div className="relative w-48 h-48 mb-6 animate-in zoom-in duration-700">
            <div className="absolute inset-0 rounded-full border-[12px] border-primary border-r-transparent border-b-transparent rotate-45"></div>
            <div className="absolute inset-2 rounded-full border-[12px] border-secondary-container border-l-transparent border-t-transparent -rotate-12"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-on-surface">{stats?.totalGuests || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">TOTAL</span>
            </div>
          </div>
          <div className="space-y-4 w-full px-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-normal">
                <span className="text-on-surface-variant">Sinh viên</span>
                <span className="text-primary">85%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[85%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-normal">
                <span className="text-on-surface-variant">Giảng viên / VIP</span>
                <span className="text-secondary">15%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-secondary-container w-[15%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
