"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  trend?: string
  trendColor?: "primary" | "secondary" | "success"
  variant?: "gradient" | "outline" | "default"
  className?: string
}

export function StatCard({ 
  label, 
  value, 
  icon, 
  trend, 
  trendColor = "primary",
  variant = "default",
  className
}: StatCardProps) {
  if (variant === "gradient") {
    return (
      <div className={cn(
        "p-8 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary-container relative overflow-hidden shadow-xl shadow-blue-900/20",
        className
      )}>
        <div className="relative z-10">
          <p className="text-sm font-bold opacity-80 uppercase tracking-normal mb-2">{label}</p>
          <h3 className="text-4xl font-black mb-1">{value}</h3>
          {trend && <p className="text-sm opacity-90">{trend}</p>}
        </div>
        <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-9xl opacity-10 rotate-12">{icon}</span>
      </div>
    )
  }

  return (
    <div className={cn(
      "p-8 rounded-lg bg-surface-container-lowest shadow-sm border border-outline-variant/10 flex flex-col justify-between hover:shadow-md transition-shadow duration-300 group h-48",
      className
    )}>
      <div className="flex justify-between items-start">
        <div className={cn("p-3 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", {
          "bg-primary/10 text-primary": trendColor === "primary",
          "bg-secondary/10 text-secondary": trendColor === "secondary",
          "bg-green-100 text-green-700": trendColor === "success"
        })}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        {trend && (
           <span className={cn("text-xs font-bold px-2 py-1 rounded-full", {
            "bg-primary-fixed text-primary": trendColor === "primary",
            "bg-secondary-fixed text-secondary": trendColor === "secondary",
            "bg-green-50 text-green-700": trendColor === "success"
          })}>{trend}</span>
        )}
      </div>
      <div>
        <p className="text-[2.5rem] font-black text-on-surface leading-none tracking-normal">{value}</p>
        <p className="text-sm font-bold text-on-surface-variant uppercase tracking-normal mt-2 group-hover:text-primary transition-colors">{label}</p>
      </div>
    </div>
  )
}
