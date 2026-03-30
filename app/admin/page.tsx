"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminProvider, AdminAuthGate, useAdmin } from "@/components/admin-auth"
import { useSupabase } from "@/components/supabase-provider"
import { useEvent } from "@/components/event-context"
import { Sidebar, TabType } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { DashboardTab } from "./dashboard-tab"
import { ProgramsTab } from "./programs-tab"
import { NotCheckedInTab } from "./not-checkedin-tab"
import { QuickScanTab } from "./quick-scan-tab"
import { CheckinForm } from "@/components/checkin-form"
import { CheckinList } from "@/components/checkin-list"
import { NotCheckedInList } from "@/components/not-checkedin-list"
import { CSVImport } from "@/components/csv-import"
import * as XLSX from "xlsx"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  )
}

function AdminContent() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const { isAdmin, logout } = useAdmin()
  const { supabase } = useSupabase()
  const { activeEvent, selectedEventId, setSelectedEventId } = useEvent()
  
  const [stats, setStats] = useState({
    totalGuests: 0,
    checkinCount: 0,
    newGuestsToday: 0
  })
  const [recentCheckins, setRecentCheckins] = useState<any[]>([])
  const [chartData, setChartData] = useState<{ counts: number[], labels: string[] }>({ counts: [], labels: [] })

  const fetchStats = useCallback(async () => {
    if (!selectedEventId) return
    
    // Total guests
    const { count: total } = await supabase
      .from("guests")
      .select("*", { count: "exact", head: true })
      .eq("event_id", selectedEventId)
    
    // Checked-in count
    const { count: checkedIn } = await supabase
      .from("guests")
      .select("*", { count: "exact", head: true })
      .eq("event_id", selectedEventId)
      .eq("is_checked_in", true)
    
    // Recent activity
    const { data: recent } = (await supabase
      .from("checkins")
      .select("name, chuc_vu, don_vi, student_id, created_at")
      .eq("event_id", selectedEventId)
      .order("created_at", { ascending: false })
      .limit(5)) as any

    // Chart data (Group by hour)
    const { data: allCheckins } = (await supabase
      .from("checkins")
      .select("created_at")
      .eq("event_id", selectedEventId)) as any

    if (allCheckins && allCheckins.length > 0) {
      const timeMap: Record<string, number> = {}
      
      allCheckins.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      
      allCheckins.forEach((c: any) => {
        const d = new Date(c.created_at)
        const label = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
        timeMap[label] = (timeMap[label] || 0) + 1
      })
      
      const labels = Object.keys(timeMap)
      const counts = Object.values(timeMap)
      
      // If there are too many unique seconds, cap the display array (e.g. latest 100) to explicitly prevent UI crushing
      if (labels.length > 100) {
        setChartData({ 
           counts: counts.slice(-100), 
           labels: labels.slice(-100) 
        })
      } else {
        setChartData({ counts, labels })
      }
    } else {
      setChartData({ counts: [], labels: [] })
    }

    setStats({
      totalGuests: total || 0,
      checkinCount: checkedIn || 0,
      newGuestsToday: 0
    })
    
    if (recent) {
      setRecentCheckins(recent.map((r: any) => ({
        title: r.name,
        unit: r.don_vi,
        student_id: r.student_id,
        checkin_time: r.created_at
      })))
    }
  }, [supabase, selectedEventId])

  useEffect(() => {
    fetchStats()
    const channel = supabase
      .channel("admin-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, () => fetchStats())
      .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, () => fetchStats())
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [fetchStats, supabase])

  const handleExport = async () => {
    if (!selectedEventId) return;
    const { data } = (await supabase
      .from("checkins")
      .select("name, chuc_vu, don_vi, student_id, created_at")
      .eq("event_id", selectedEventId)
      .order("created_at", { ascending: true })) as any;

    if (!data || data.length === 0) {
      alert("Không có dữ liệu để xuất");
      return;
    }

    const exportData = (data as any[]).map((item: any) => ({
      "Họ tên": item.name,
      "MSSV": item.student_id || "",
      "Chức vụ": item.chuc_vu,
      "Đơn vị": item.don_vi,
      "Thời gian": format(new Date(item.created_at), "HH:mm:ss dd/MM/yyyy")
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Checkins");
    XLSX.writeFile(wb, `Checkin_${activeEvent?.title || "Data"}.xlsx`);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboard Overview"
      case "programs": return "Quản lý chương trình"
      case "checkin": return "Hệ thống Check-in"
      case "not-checkedin": return "Chưa Check-in"
      case "import": return "Nhập dữ liệu"
      default: return "Admin Panel"
    }
  }

  const getContextStats = () => {
    if (activeTab === "not-checkedin") {
      return `${stats.totalGuests - stats.checkinCount} / ${stats.totalGuests} ĐẠI BIỂU VẮNG`
    }
    if (activeTab === "checkin") {
      return `${stats.checkinCount} / ${stats.totalGuests} ĐÃ CÓ MẶT`
    }
    return activeEvent?.title?.toUpperCase()
  }

  return (
    <AdminAuthGate>
      <div className="flex bg-surface min-h-screen">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onLogout={logout} 
        />
        
        <main className={cn(
          "flex-1 ml-64 min-h-screen relative transition-all duration-300",
          activeTab === "not-checkedin" ? "bg-surface" : "bg-white/50"
        )}>
          <TopBar 
            title={getPageTitle()}
            contextStats={getContextStats()}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={activeTab === "programs" ? "Tìm kiếm chương trình..." : "Tìm kiếm đại biểu..."}
            filterDate={filterDate}
            onFilterDateChange={setFilterDate}
          />

          <div className="p-8 max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <DashboardTab 
                stats={stats} 
                recentCheckins={recentCheckins} 
                chartData={chartData}
                onExport={handleExport} 
              />
            )}
            
            {activeTab === "programs" && <ProgramsTab />}
            
            {activeTab === "checkin" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-4">
                  <div className="sticky top-24">
                    <CheckinForm />
                  </div>
                </div>
                <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
                  <CheckinList showDelete maxItems={100} query={searchQuery} />
                </div>
              </div>
            )}
            
            {activeTab === "not-checkedin" && (
              <NotCheckedInTab 
                stats={stats} 
                onRefresh={fetchStats} 
                onExportVang={handleExport} 
              />
            )}
            
            {activeTab === "import" && (
              <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CSVImport />
              </div>
            )}
            
            {activeTab === "quick-scan" && (
              <QuickScanTab />
            )}
          </div>
        </main>
      </div>
    </AdminAuthGate>
  )
}
