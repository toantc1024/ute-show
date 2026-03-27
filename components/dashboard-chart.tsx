"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { Loader2, Calendar } from "lucide-react"

export function DashboardChart() {
  const { supabase } = useSupabase()
  const [data, setData] = useState<{ time: string; "Số lượng": number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data: checkins } = await supabase
        .from("checkins")
        .select("created_at")
        .order("created_at", { ascending: true })

      if (checkins) {
        const grouping: Record<string, number> = {}
        // Group by minute
        checkins.forEach((c: { created_at: string }) => {
          const time = new Date(c.created_at).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })
          grouping[time] = (grouping[time] || 0) + 1
        })

        const chartData = Object.entries(grouping).map(([time, count]) => ({
          time,
          "Số lượng": count,
        }))
        setData(chartData)
      }
      setLoading(false)
    }

    fetchData()

    // Realtime updates
    const subscription = supabase
      .channel("checkins_dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkins" },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [supabase])

  if (loading && data.length === 0) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-xl border border-slate-200 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  // To match the UI in the screenshot, we create the full layout within this component
  return (
    <div className="w-full">
      {/* Header outside */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Thống kê check-in</h2>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">
              Phân tích chi tiết cho sự kiện
            </span>
            <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
              /ute-show
            </span>
          </div>
        </div>
      </div>

      {/* Inner Card representing the chart panel */}
      <div className="flex h-[450px] w-full flex-col rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Lượt check-in (Hôm nay)
          </h3>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              7 ngày
            </button>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              14 ngày
            </button>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              30 ngày
            </button>
            <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              {new Date().toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={true}
                horizontal={true}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickMargin={8}
                minTickGap={30}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickMargin={8}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#0f172a", fontWeight: "bold" }}
              />
              <Area
                type="monotone"
                dataKey="Số lượng"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
                activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
