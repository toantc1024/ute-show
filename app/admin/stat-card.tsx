"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  trendColor: "primary" | "secondary" | "success" | "error"
  description?: string
}

export function StatCard({ label, value, icon, trendColor, description }: StatCardProps) {
  const colorMap = {
    primary: "bg-primary text-on-primary shadow-primary/20",
    secondary: "bg-secondary text-on-secondary shadow-secondary/20",
    success: "bg-green-600 text-white shadow-green-500/20",
    error: "bg-error text-on-error shadow-error/20"
  }

  const iconBgMap = {
    primary: "bg-primary-container/20 text-primary",
    secondary: "bg-secondary-container/20 text-secondary",
    success: "bg-green-100 text-green-600",
    error: "bg-red-100 text-red-600"
  }

  return (
    <div className={cn(
      "relative overflow-hidden bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 group border border-outline-variant/10",
      "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", iconBgMap[trendColor])}>
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <div className={cn("px-3 py-1 rounded-full text-[10px] font-black tracking-normal uppercase", iconBgMap[trendColor])}>
          LIVE
        </div>
      </div>
      
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-normal pl-1 mb-1">{label}</p>
        <h3 className="text-4xl font-black text-on-surface tabular-nums tracking-normal">{value}</h3>
      </div>

      {description && (
        <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-normal opacity-80 leading-relaxed italic">
          {description}
        </p>
      )}

      {/* Background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
        <span className="material-symbols-outlined text-[100px]">{icon}</span>
      </div>
    </div>
  )
}
