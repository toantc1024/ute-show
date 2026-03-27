"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { Loader2 } from "lucide-react"

export function DashboardChart() {
  const { supabase, session } = useSupabase()
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

  return (
    <div className="flex h-[500px] w-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-xl font-bold text-slate-800">
        Biểu đồ sóng thống kê Check-in
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <Line
              type="monotone"
              dataKey="Số lượng"
              stroke="#2EB9ED"
              strokeWidth={3}
              dot={{ r: 4, fill: "#2EB9ED" }}
              activeDot={{ r: 6, fill: "#27aae2" }}
            />
            <CartesianGrid
              stroke="#e2e8f0"
              strokeDasharray="5 5"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickMargin={10}
              minTickGap={20}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              itemStyle={{ color: "#0f172a", fontWeight: "bold" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
