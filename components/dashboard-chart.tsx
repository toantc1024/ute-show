import React from "react"
import { useState, useEffect } from "react"
import { useSupabase } from "./supabase-provider"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"

export function DashboardChart() {
  const { supabase } = useSupabase()
  const [data, setData] = useState<{ time: string; "Số lượng": number }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChartData = async (isInitial = false) => {
    if (isInitial) setLoading(true)
    const { data: checkins, error } = await supabase
      .from("checkins")
      .select("created_at")
      .order("created_at", { ascending: true })

    if (!error && checkins) {
      const intervals: Record<string, number> = {}
      checkins.forEach((checkin: { created_at: string }) => {
        const date = new Date(checkin.created_at)
        const timeKey = format(date, "HH:mm")
        intervals[timeKey] = (intervals[timeKey] || 0) + 1
      })

      const formattedData = Object.entries(intervals).map(([time, count]) => ({
        time,
        "Số lượng": count,
      }))
      setData(formattedData)
    }
    if (isInitial) setLoading(false)
  }

  useEffect(() => {
    fetchChartData(true)

    const sub = supabase
      .channel("chart_realtime_v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, () => fetchChartData())
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  if (loading && data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black tracking-normal text-slate-400 uppercase">
            Xác nhận check-in theo thời gian
          </h3>
          <p className="text-xs text-slate-400 font-medium italic">Biểu đồ thể hiện tốc độ đại biểu vào chương trình</p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '8px 12px'
              }}
              labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="Số lượng" 
              stroke="#2563eb" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCount)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
