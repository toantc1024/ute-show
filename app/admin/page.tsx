"use client"

import { useState } from "react"
import { AdminProvider, AdminAuthGate } from "@/components/admin-auth"
import { CheckinForm } from "@/components/checkin-form"
import { CheckinList } from "@/components/checkin-list"
import { CSVImport } from "@/components/csv-import"
import { DashboardChart } from "@/components/dashboard-chart"
import { LayoutDashboard, UserCheck, ShieldCheck } from "lucide-react"

import { GridPattern } from "@/components/ui/grid-pattern"
import { DotPattern } from "@/components/ui/dot-pattern"
import { cn } from "@/lib/utils"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"checkin" | "dashboard">("checkin")

  return (
    <AdminProvider>
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

        {/* Header */}
        <header className="relative sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/80 text-blue-600 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              Trang Quản Trị
            </h1>
            <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              UTE Check-in System
            </div>
          </div>
        </header>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <AdminAuthGate>
            {/* Tabs Navigation */}
            <div className="mb-8 flex justify-center">
              <div className="flex rounded-lg bg-slate-200 p-1 shadow-inner">
                <button
                  onClick={() => setActiveTab("checkin")}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-6 py-2 text-sm font-semibold transition-all",
                    activeTab === "checkin"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <UserCheck className="h-4 w-4" />
                  Check-in
                </button>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-6 py-2 text-sm font-semibold transition-all",
                    activeTab === "dashboard"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
              </div>
            </div>

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
    </AdminProvider>
  )
}
