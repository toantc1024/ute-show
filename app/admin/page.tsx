"use client"

import { useState } from "react"
import { AdminProvider, AdminAuthGate, useAdmin } from "@/components/admin-auth"
import { CheckinForm } from "@/components/checkin-form"
import { CheckinList } from "@/components/checkin-list"
import { NotCheckedInList } from "@/components/not-checkedin-list"
import { StatsBar } from "@/components/stats-bar"
import { CSVImport } from "@/components/csv-import"
import { DashboardChart } from "@/components/dashboard-chart"
import { 
  LayoutDashboard, 
  Trophy, 
  BarChart3, 
  User, 
  Bell, 
  LogOut, 
  Search,
  ChevronRight,
  TrendingUp,
  UserCheck,
  XCircle,
  Settings,
  PlusCircle,
  Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  )
}

function AdminContent() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "checkin" | "not-checkedin" | "import">("dashboard")
  const { isAdmin, logout } = useAdmin()

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "checkin", label: "Check-in", icon: UserCheck },
    { id: "not-checkedin", label: "Chưa Check-in", icon: XCircle },
    { id: "import", label: "Nhập dữ liệu", icon: Database },
  ]

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[#eef2f7] p-4 text-slate-900">
      <AdminAuthGate>
        {/* Sidebar */}
        <aside className="relative flex w-64 flex-col rounded-3xl bg-white/80 shadow-sm backdrop-blur-xl">
          {/* Logo */}
          <div className="flex items-center justify-center py-10">
             <div className="flex flex-col items-center gap-1">
                <div className="relative h-12 w-48">
                  {/* Using a placeholder text logo based on the image */}
                  <span className="text-2xl font-black italic tracking-tighter text-blue-600">
                    GO<span className="text-orange-500">YOUTH!</span>
                  </span>
                </div>
             </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all",
                  activeTab === item.id
                    ? "bg-[#00a2e8] text-white shadow-lg shadow-blue-400/30"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer Sidebar */}
          <div className="mt-auto border-t border-slate-100 p-6">
            <div className="flex items-center justify-between px-2 pb-6">
              <span className="text-xs font-semibold text-slate-400">Thông báo</span>
              <div className="relative">
                <Bell className="h-5 w-5 text-slate-400" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  3
                </span>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3 text-sm font-bold text-slate-500 transition-all hover:bg-red-50 hover:text-red-500"
            >
              <LogOut className="h-5 w-5" />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex flex-1 flex-col overflow-y-auto px-8 py-2">
          {/* Top Banner (Wrapped Style) */}
          <div className="relative mb-8 overflow-hidden rounded-[40px] bg-gradient-to-r from-[#4158D0] via-[#C850C0] to-[#FFCC70] p-10 shadow-xl shadow-purple-500/20">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/80">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20">✨</span>
                  Sự kiện đặc biệt
                </div>
                <h1 className="mb-2 text-5xl font-black tracking-tight text-white italic">
                  UTE-SHOW WRAPPED 2026
                </h1>
                <p className="text-lg font-medium text-white/90">
                  Nhìn lại hành trình rực rỡ của bạn cùng chúng tôi.
                </p>
              </div>
              
              <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform hover:scale-110">
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>
            
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 h-full w-1/2 translate-x-1/4 opacity-20">
              <div className="h-full w-full rounded-full bg-white blur-3xl" />
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-10">
            <StatsBar />
          </div>

          {/* Dynamic Content based on Active Tab */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800">
                {activeTab === "dashboard" && "Dữ liệu tổng quan"}
                {activeTab === "checkin" && "Check-in Đại biểu"}
                {activeTab === "not-checkedin" && "Chưa Check-in"}
                {activeTab === "import" && "Nhập dữ liệu Excel"}
              </h2>
              {activeTab === "dashboard" && (
                <button className="rounded-full bg-blue-50 px-5 py-2 text-sm font-bold text-blue-600 transition-all hover:bg-blue-100">
                   Xem tất cả
                </button>
              )}
            </div>

            <div className="min-h-[400px]">
              {activeTab === "dashboard" && <DashboardChart />}
              {activeTab === "checkin" && (
                <div className="grid gap-8 lg:grid-cols-12">
                   <div className="lg:col-span-4">
                      <CheckinForm />
                   </div>
                   <div className="lg:col-span-8 rounded-[32px] bg-white p-6 shadow-sm">
                      <CheckinList showDelete maxItems={50} />
                   </div>
                </div>
              )}
              {activeTab === "not-checkedin" && (
                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <NotCheckedInList />
                </div>
              )}
              {activeTab === "import" && (
                <div className="max-w-xl mx-auto">
                   <CSVImport />
                </div>
              )}
            </div>
          </div>
        </section>
      </AdminAuthGate>
    </main>
  )
}

