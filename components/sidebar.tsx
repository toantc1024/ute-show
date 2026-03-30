"use client"

import React from "react"
import { cn } from "@/lib/utils"

export type TabType = "dashboard" | "programs" | "checkin" | "not-checkedin" | "import" | "quick-scan" | "emails"

interface SidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  onLogout: () => void
}

export function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  const navItems: { id: TabType; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "programs", label: "Chương trình", icon: "calendar_month" },
    { id: "checkin", label: "Check-in", icon: "how_to_reg" },
    { id: "not-checkedin", label: "Chưa Check-in", icon: "person_off" },
    { id: "import", label: "Nhập dữ liệu", icon: "cloud_upload" },
    { id: "emails", label: "Gửi Email", icon: "mail" },
  ]

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-slate-50 dark:bg-slate-950 z-40 border-r border-outline-variant/10 shadow-premium">
      <div className="px-8 py-10">
        <h1 className="text-xl font-black tracking-normal uppercase flex items-center">
          <span className="text-blue-800 dark:text-primary">UTE</span>
          <span className="text-secondary dark:text-secondary-fixed-dim ml-1">Check-in</span>
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-normal mt-1">Precision Pulse</p>
      </div>

      <nav className="flex flex-col gap-2 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "px-6 py-3 flex items-center gap-3 rounded-lg transition-all active:translate-x-1 duration-150 group w-full text-left",
              activeTab === item.id 
                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ fontVariationSettings: `'FILL' ${activeTab === item.id ? 1 : 0}` }}
            >
              {item.icon}
            </span>
            <span className={cn("text-sm", activeTab === item.id ? "font-bold" : "font-medium")}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 px-2 pb-8">
        <button 
          onClick={() => onTabChange("quick-scan")}
          className={cn(
            "rounded-lg px-6 py-4 mb-4 flex items-center justify-center gap-2 shadow-lg transition-all",
            activeTab === "quick-scan" 
              ? "bg-blue-200 text-blue-900 shadow-blue-900/40 scale-[1.02] ring-2 ring-primary ring-offset-2 dark:bg-primary-container dark:text-primary" 
              : "bg-primary text-on-primary shadow-primary/20 hover:scale-[1.02] active:scale-95"
          )}
        >
          <span className="material-symbols-outlined">qr_code_scanner</span>
          <span className="font-bold uppercase tracking-normal">Quick Scan</span>
        </button>
        
        <button className="text-slate-600 dark:text-slate-400 px-6 py-3 flex items-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all text-left w-full">
          <span className="material-symbols-outlined">help</span>
          <span className="text-sm font-medium">Hỗ trợ</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="text-slate-600 dark:text-slate-400 px-6 py-3 flex items-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all text-left w-full"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
