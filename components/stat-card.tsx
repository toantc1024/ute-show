"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  trend?: string
  trendColor?: "primary" | "secondary" | "success" | "error"
  variant?: "gradient" | "outline" | "default"
  className?: string
  accent?: "left" | "right" | "top" | "none"
}

export function StatCard({ 
  label, 
  value, 
  icon, 
  trend, 
  trendColor = "primary",
  variant = "default",
  className,
  accent = "left"
}: StatCardProps) {
  const accentColorMap = {
    primary: "from-primary to-primary-container shadow-primary/30",
    secondary: "from-secondary to-secondary-container shadow-secondary/30",
    success: "from-green-600 to-green-400 shadow-green-500/20",
    error: "from-red-600 to-red-400 shadow-red-500/20"
  }

  const barColor = accentColorMap[trendColor === "success" ? "success" : trendColor] || accentColorMap.primary

  if (variant === "gradient") {
    return (
      <div className={cn(
        "p-8 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary-container relative overflow-hidden shadow-2xl shadow-primary/20",
        className
      )}>
        <div className="relative z-10">
          <p className="text-xs font-black opacity-80 uppercase tracking-normal mb-2">{label}</p>
          <h3 className="text-5xl font-black mb-1 tracking-normal">{value}</h3>
          {trend && <p className="text-sm font-bold opacity-90">{trend}</p>}
        </div>
        <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-[120px] opacity-10 rotate-12">{icon}</span>
      </div>
    )
  }

  return (
    <div className={cn(
      "p-8 rounded-xl bg-white shadow-xl shadow-blue-900/5 relative overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all duration-500 group h-48 border border-outline-variant/5",
      className
    )}>
      {/* Premium Accent Bar */}
      {accent === "left" && (
        <div className={cn("absolute left-0 top-8 bottom-8 w-1.5 rounded-r-full bg-gradient-to-b shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)]", barColor)} />
      )}
      {accent === "right" && (
        <div className={cn("absolute right-0 top-8 bottom-8 w-1.5 rounded-l-full bg-gradient-to-b shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)]", barColor)} />
      )}
      {accent === "top" && (
        <div className={cn("absolute top-0 left-8 right-8 h-1.5 rounded-b-full bg-gradient-to-r shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1)]", barColor)} />
      )}

      <div className="flex justify-between items-start relative z-10">
        <div className={cn("p-4 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm", {
          "bg-primary/10 text-primary": trendColor === "primary",
          "bg-secondary/10 text-secondary": trendColor === "secondary",
          "bg-green-50 text-green-600": trendColor === "success"
        })}>
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        {trend && (
           <span className={cn("text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-normal shadow-sm", {
            "bg-primary-fixed text-primary": trendColor === "primary",
            "bg-secondary-fixed text-secondary": trendColor === "secondary",
            "bg-green-50 text-green-700": trendColor === "success"
          })}>{trend}</span>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-4xl font-black text-on-surface leading-none tracking-normal mb-2">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-normal group-hover:text-primary transition-colors leading-none">
          {label}
        </p>
      </div>

      {/* Decorative background circle */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-surface-container-low rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-0"></div>
    </div>
  )
}
