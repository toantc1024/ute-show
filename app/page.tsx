"use client"

import { CheckinList } from "@/components/checkin-list"
import { EventLogo } from "@/components/event-logo"
import { Slideshow } from "@/components/slideshow"

import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { cn } from "@/lib/utils"

export default function Page() {
  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden bg-white text-slate-900 selection:bg-blue-200">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-0 h-full w-full skew-y-12 fill-black/5 stroke-black/5"
        )}
      />

      <EventLogo />

      {/* Main Layout: Flow layout */}
      <div className="relative isolate z-10 flex h-full w-full flex-col justify-between gap-6 pt-6 pb-6 md:gap-10 md:pt-10 md:pb-10">
        {/* Centered header — glass pill */}
        <section className="flex shrink-0 justify-center px-4 md:px-8">
          <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-blue-200/50 bg-white/70 px-6 py-2.5 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:px-10 md:py-3">
            <p className="text-[10px] font-semibold tracking-widest text-balance text-blue-600 uppercase sm:text-xs">
              CHÀO MỪNG CÁN BỘ ĐOÀN HCM-UTE CÁC THỜI KỲ VỀ THAM DỰ CHƯƠNG TRÌNH
            </p>
            <h1 className="text-xl font-extrabold tracking-wide text-black uppercase sm:text-2xl md:text-3xl lg:text-4xl">
              ĐOÀN TRƯỜNG ĐẠI HỌC CÔNG NGHỆ KỸ THUẬT
            </h1>
            <p className="text-xs font-bold tracking-widest text-blue-800 uppercase sm:text-sm">
              TP. HỒ CHÍ MINH — CÁC THỜI KỲ
            </p>
          </div>
        </section>

        {/* Top: Full Width Slideshow */}
        <section className="w-full shrink-0">
          <Slideshow />
        </section>

        {/* Bottom: Real-time Check-in List */}
        <section className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 flex-col px-4 md:px-8">
          <div className="mb-4 flex shrink-0 items-center justify-center md:mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-blue-900 uppercase [text-shadow:0_1px_8px_rgba(255,255,255,0.7)] md:text-3xl lg:text-4xl">
              CÁN BỘ ĐOÀN HCM-UTE ĐÃ CHECK-IN
            </h2>
          </div>

          <div className="min-h-[160px] flex-1 overflow-visible">
            <CheckinList maxItems={100} />
          </div>
        </section>
      </div>
    </main>
  )
}
