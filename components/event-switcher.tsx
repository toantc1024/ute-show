"use client"

import React from "react"
import { useEvent } from "./event-context"
import { cn } from "@/lib/utils"
import { ChevronDown, Calendar, PlayCircle } from "lucide-react"

export function EventSwitcher() {
  const { events, selectedEventId, setSelectedEventId, activeEvent } = useEvent()

  if (events.length === 0) return null

  return (
    <div className="relative group mr-4">
      <button className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/50 px-3 py-1.5 transition-all hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shadow-sm shrink-0">
          <Calendar className="h-3.5 w-3.5" />
        </div>
        <div className="text-left min-w-0 max-w-[150px] sm:max-w-[250px]">
          <div className="flex items-center gap-1.5">
            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-normal leading-none">
              Chương trình
            </div>
            {activeEvent?.is_active && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 ring-4 ring-green-500/10 animate-pulse" />
            )}
          </div>
          <div className="truncate text-[13px] font-bold text-slate-800 leading-tight">
            {activeEvent?.title || "Chọn chương trình..."}
          </div>
        </div>
        <ChevronDown className="ml-1 h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-y-0.5" />
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 top-full z-50 mt-2 hidden w-72 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl group-hover:block animate-in fade-in zoom-in-95 duration-200">
        <div className="p-2 border-b border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal px-2 py-1 flex items-center gap-1.5">
            <PlayCircle className="h-3 w-3" /> Tất cả chương trình
          </span>
        </div>
        <div className="max-h-64 overflow-y-auto p-1.5">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className={cn(
                "flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-all hover:bg-slate-50",
                selectedEventId === event.id ? "bg-blue-50/50 text-blue-700 ring-1 ring-blue-100" : "text-slate-600"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="truncate font-bold text-[13px] tracking-normal">{event.title}</span>
                {event.is_active && (
                  <span className="shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-[8px] font-extrabold text-green-700 uppercase ring-1 ring-green-200">
                    Live
                  </span>
                )}
              </div>
              <span className="mt-0.5 text-[10px] font-medium text-slate-400">
                {event.event_date ? new Date(event.event_date).toLocaleDateString("vi-VN") : "---"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
