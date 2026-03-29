"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface TopBarProps {
  title: string
  contextStats?: string
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
}

export function TopBar({ 
  title, 
  contextStats, 
  searchPlaceholder = "Tìm kiếm dữ liệu...",
  searchValue,
  onSearchChange
}: TopBarProps) {
  return (
    <header className="sticky top-0 w-full z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm shadow-blue-900/5 px-8 py-4 flex items-center justify-between transition-all">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-on-surface uppercase tracking-tight">{title}</h2>
        {contextStats && (
          <div className="px-3 py-1 bg-primary/10 rounded-full animate-in fade-in slide-in-from-left-2 grow-0">
            <span className="text-xs font-bold text-primary tracking-wider uppercase">{contextStats}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex items-center bg-surface-container-low rounded-full px-4 py-2 w-64 group focus-within:ring-2 ring-primary/20 transition-all">
          <span className="material-symbols-outlined text-slate-400 mr-2 text-xl">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none placeholder:text-slate-400 font-medium" 
            placeholder={searchPlaceholder} 
            type="text" 
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
          <button className="p-2 text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined">settings</span>
          </button>
          
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-container shadow-sm ml-2 ring-2 ring-white ring-offset-1 ring-offset-slate-100">
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
