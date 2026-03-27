import { useState } from "react"
import { AdminProvider, AdminAuthGate, useAdmin } from "@/components/admin-auth"
import { CheckinForm } from "@/components/checkin-form"
import { CheckinList } from "@/components/checkin-list"
import { CSVImport } from "@/components/csv-import"
import { DashboardChart } from "@/components/dashboard-chart"
import { LayoutDashboard, UserCheck, ShieldCheck, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

import { GridPattern } from "@/components/ui/grid-pattern"
import { DotPattern } from "@/components/ui/dot-pattern"
import { cn } from "@/lib/utils"

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  )
}

function AdminContent() {
  const [activeTab, setActiveTab] = useState<"checkin" | "dashboard">("checkin")
  const { isAdmin, logout } = useAdmin()

  return (
    <main className="relative min-h-screen bg-slate-50 pb-10 text-slate-900">
        {/* Subtle modern pattern */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-white">
          <DotPattern
            width={24}
            height={24}
            cx={1}
            cy={1}
            cr={1}
            className={cn(
              "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] opacity-40"
            )}
          />
          <GridPattern
            width={40}
            height={40}
            x={-1}
            y={-1}
            strokeDasharray={"4 4"}
            className={cn(
              "[mask-image:radial-gradient(900px_circle_at_top_right,white,transparent)] opacity-40"
            )}
          />
        </div>

        {/* Integrated Header & Navigation */}
        <header className="relative sticky top-0 z-50 border-b border-slate-200 bg-white/80 transition-all backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            {/* Left: Branding */}
            <h1 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shadow-sm transition-transform hover:scale-105">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="hidden sm:inline">Trang Quản Trị</span>
            </h1>

            {/* Middle: Integrated Tabs (Visible when logged in) */}
            {isAdmin && (
              <div className="absolute left-1/2 flex -translate-x-1/2 rounded-lg bg-slate-100/80 p-1">
                <button
                  onClick={() => setActiveTab("checkin")}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-bold transition-all",
                    activeTab === "checkin"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                  )}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Check-in
                </button>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-bold transition-all",
                    activeTab === "dashboard"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                  )}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </button>
              </div>
            )}

            {/* Right: Status & Exit */}
            <div className="flex items-center gap-3">
              <div className="hidden text-right lg:block">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Ute Check-In
                </div>
              </div>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="group h-8 rounded-lg px-2.5 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  Thoát
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <AdminAuthGate>
            {/* Tab Content */}
            {activeTab === "checkin" && (
              <div className="grid gap-8 lg:grid-cols-12">
                {/* Sidebar Left: Input Form + Search */}
                <div className="space-y-4 lg:col-span-4">
                  <CheckinForm />
                  <CSVImport />
                </div>

                {/* Main Area Right: Live List */}
                <div className="lg:col-span-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold tracking-wide text-slate-700 uppercase">
                      Danh sách hiện tại
                    </h2>
                  </div>

                  <div className="min-h-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-full p-4">
                      <CheckinList showDelete maxItems={50} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "dashboard" && (
              <div className="mx-auto max-w-5xl">
                <DashboardChart />
              </div>
            )}
          </AdminAuthGate>
        </div>
      </main>
  )
}
