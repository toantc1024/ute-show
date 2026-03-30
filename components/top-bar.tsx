"use client"

import React from "react"
import { useEvent } from "./event-context"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { HeaderStepProgress } from "./header-step-progress"

interface TopBarProps {
  title: string
  contextStats?: string
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filterDate: string
  onFilterDateChange: (value: string) => void
}

export function TopBar({ 
  title, 
  contextStats, 
  searchPlaceholder = "Tìm kiếm dữ liệu...",
  searchValue,
  onSearchChange,
  filterDate,
  onFilterDateChange
}: TopBarProps) {
  const { events, selectedEventId, setSelectedEventId } = useEvent()

  const filteredEvents = events.filter(event => {
    if (!filterDate) return true;
    if (!event.event_date) return false;
    const d = new Date(event.event_date).toISOString().split('T')[0];
    return d === filterDate;
  });

  return (
    <header className="sticky top-0 w-full z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm shadow-blue-900/5 px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
      <div className="flex items-center gap-4 shrink-0">
        <h2 className="text-lg font-bold text-on-surface uppercase tracking-normal whitespace-nowrap">{title}</h2>
        {title === "Dashboard Overview" && <HeaderStepProgress />}
        {contextStats && (
          <div className="px-3 py-1 bg-primary/10 rounded-lg animate-in fade-in slide-in-from-left-2 grow-0 hidden sm:block">
            <span className="text-xs font-bold text-primary tracking-normal uppercase">{contextStats}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center md:justify-end gap-3 flex-wrap">
        {/* Date Selector */}
        <div className="flex items-center bg-surface-container-low rounded-lg px-4 py-1.5 shadow-sm border border-outline-variant/5">
          <span className="material-symbols-outlined text-slate-400 mr-2 text-lg">calendar_month</span>
          <input 
            type="date"
            className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase text-slate-600 cursor-pointer outline-none"
            value={filterDate}
            onChange={(e) => onFilterDateChange(e.target.value)}
          />
          {filterDate && (
             <button onClick={() => onFilterDateChange("")} className="ml-2 text-slate-400 hover:text-slate-600">
               <span className="material-symbols-outlined text-sm">close</span>
             </button>
          )}
        </div>

        {/* Program Selector */}
        <div className="flex items-center bg-surface-container-low rounded-lg px-4 py-1.5 shadow-sm border border-outline-variant/5 max-w-[200px] lg:max-w-xs overflow-hidden">
          <span className="material-symbols-outlined text-slate-400 mr-2 text-lg">event</span>
          <select 
            className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase text-slate-600 cursor-pointer outline-none w-full truncate pr-4"
            value={selectedEventId || ""}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="" disabled>CHỌN CHƯƠNG TRÌNH</option>
            {filteredEvents.map(event => (
              <option key={event.id} value={event.id}>
                {event.event_date ? `[${format(new Date(event.event_date), "dd/MM")}] ` : ""}{event.title}
              </option>
            ))}
            {filteredEvents.length === 0 && <option disabled>KHÔNG CÓ DỮ LIỆU</option>}
          </select>
        </div>

        <div className="relative flex items-center bg-surface-container-low rounded-lg px-4 py-2 w-48 lg:w-64 group focus-within:ring-2 ring-primary/20 transition-all">
          <span className="material-symbols-outlined text-slate-400 mr-2 text-xl">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase w-full outline-none placeholder:text-slate-400" 
            placeholder={searchPlaceholder} 
            type="text" 
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          
          <div className="h-9 w-9 rounded-full overflow-hidden border border-primary-container shadow-sm ml-1 ring-2 ring-white ring-offset-1 ring-offset-slate-100">
            <img 
              alt="User" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuApIlYK9mfKe81TnuGaxaPDtezT5kvwMOaQhMx3dfMCkBvgGcpWwBgwQ5D2vlSmYyuKpigukARNPMY66pOJ6eoXn_VXHAz-7Cen_121fpNyQC2TXEEDkLqDx3ivJlvVPS7hASCxSAX8y2Mb72SjU0Q-BiOiCPm5_ItmuXlwEcqT9rSIQrs32bOC_K8aq5yLb3Dk29ljageE9dGcp8-_Ot2L-RiUqZSlOfTThWOU0qP5AL4XG5pF5yyBbXzim_xpokZwTEBjhFF1ikg"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
