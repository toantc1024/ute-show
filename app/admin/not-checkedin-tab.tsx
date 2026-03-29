"use client"

import React from "react"
import { useEvent } from "@/components/event-context"
import { StatCard } from "@/components/stat-card"
import { ChevronRight, Calendar, Filter, Download, CheckCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotCheckedInTabProps {
  stats: any
  onRefresh: () => void
  onExportVang: () => void
}

export function NotCheckedInTab({ stats, onRefresh, onExportVang }: NotCheckedInTabProps) {
  const isComplete = (stats?.totalGuests || 0) > 0 && stats?.checkinCount === stats?.totalGuests
  const vắngCount = (stats?.totalGuests || 0) - (stats?.checkinCount || 0)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Summary Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={cn(
          "md:col-span-2 p-8 rounded-lg relative overflow-hidden shadow-xl transition-all duration-700",
          isComplete ? "bg-gradient-to-br from-green-600 to-green-400 text-white shadow-green-900/20" : "bg-gradient-to-br from-primary to-primary-container text-on-primary-container shadow-blue-900/20"
        )}>
          <div className="relative z-10">
            <p className="text-sm font-bold opacity-80 uppercase tracking-normal mb-2 uppercase">Trạng thái hiện tại</p>
            <h3 className="text-4xl font-black mb-1">{isComplete ? "Hoàn tất 100%" : `${Math.round((stats?.checkinCount || 0) / (stats?.totalGuests || 1) * 100)}% Hoàn thành`}</h3>
            <p className="text-sm opacity-90 font-medium">{isComplete ? "Tất cả đại biểu đã có mặt tại hội trường." : `Đang tiến hành check-in cho ${stats?.totalGuests || 0} đại biểu.`}</p>
          </div>
          <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-9xl opacity-10 rotate-12">{isComplete ? "task_alt" : "query_stats"}</span>
        </div>

        <StatCard 
          label="Vắng mặt" 
          value={vắngCount} 
          icon="person_off" 
          trendColor="secondary" 
        />
        
        <StatCard 
          label="Đã Check-in" 
          value={stats?.checkinCount || 0} 
          icon="how_to_reg" 
          trendColor="primary" 
        />
      </div>

      {/* Filters Area */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface-container-low rounded-lg shadow-inner">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-full px-4 py-2 shadow-sm border border-outline-variant/10">
            <Calendar size={16} className="text-slate-400 mr-2" />
            <select className="bg-transparent border-none text-xs font-black uppercase focus:ring-0 cursor-pointer outline-none">
              <option>Hôm nay, {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'long' })}</option>
            </select>
          </div>
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-full px-4 py-2 shadow-sm border border-outline-variant/10">
            <Filter size={16} className="text-slate-400 mr-2" />
            <span className="text-xs font-black uppercase">Lọc theo: Tất cả</span>
          </div>
        </div>
        <button 
          onClick={onExportVang}
          className="flex items-center gap-2 text-primary font-black text-xs uppercase px-4 py-2 hover:bg-primary/5 rounded-full transition-colors tracking-normal"
        >
          <Download size={16} />
          Xuất danh sách vắng
        </button>
      </div>

      {/* Large Empty State Area (The Pulse) or List */}
      {vắngCount === 0 ? (
        <div className="relative bg-surface-container-lowest rounded-xl p-16 flex flex-col items-center justify-center text-center shadow-sm border border-outline-variant/5 min-h-[500px] overflow-hidden">
          {/* Background decorative pulses */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <div className="w-[500px] h-[500px] border-4 border-primary rounded-full animate-pulse"></div>
            <div className="absolute w-[300px] h-[300px] border-4 border-secondary rounded-full"></div>
            <div className="absolute w-[700px] h-[700px] border border-primary/40 rounded-full animate-ping"></div>
          </div>
          
          <div className="relative z-10 space-y-8 max-w-md animate-in zoom-in duration-1000">
            <div className="w-32 h-32 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/20 ring-4 ring-green-100/50">
              <span className="material-symbols-outlined text-6xl text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-on-surface mb-3 tracking-normal uppercase">Tất cả đại biểu đã check-in! 🎉</h3>
              <p className="text-on-surface-variant font-medium leading-relaxed opacity-80 px-4">
                Hiện tại không có đại biểu nào trong danh sách chờ. Mọi người đều đã hoàn tất thủ tục điểm danh thành công.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 pt-4">
              <button className="bg-primary text-on-primary px-10 py-4 rounded-full font-black text-xs uppercase shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
                Xem Dashboard
              </button>
              <button 
                onClick={onRefresh}
                className="text-primary font-black px-8 py-4 rounded-full hover:bg-primary/5 transition-all text-xs uppercase flex items-center gap-2"
              >
                <RefreshCw size={14} className="animate-spin-slow" />
                Làm mới dữ liệu
              </button>
            </div>
          </div>
          
          {/* Subtle Decorative Glass Elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-secondary/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary/10 blur-3xl rounded-full"></div>
        </div>
      ) : (
         <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/5 min-h-[500px]">
           <p className="text-center py-20 text-slate-400 italic font-black uppercase tracking-normal opacity-50">Danh sách vắng mặt đang được xử lý...</p>
         </div>
      )}

      {/* Meta info */}
      <div className="flex items-center justify-between text-on-surface-variant/40 text-[10px] font-black tracking-normal uppercase px-4 pt-4">
        <p>Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}</p>
        <p className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Hệ thống hoạt động bình thường
        </p>
      </div>
    </div>
  )
}
