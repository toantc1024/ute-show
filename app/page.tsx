"use client"

import { CheckinList } from "@/components/checkin-list"
import { EventLogo } from "@/components/event-logo"
import { FlyingHearts } from "@/components/flying-hearts"
import { Slideshow } from "@/components/slideshow"
import { useEvent } from "@/components/event-context"

import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { cn } from "@/lib/utils"

export default function Page() {
  const { activeEvent } = useEvent()
  
  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#f0f4f8] text-slate-900 selection:bg-blue-200">
      <FlyingHearts />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 opacity-60" />
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.05}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          "inset-0 h-full w-full skew-y-12 fill-blue-500/5 stroke-blue-500/5"
        )}
      />

      <EventLogo />

      {/* Main Layout: Flow layout */}
      <div className="relative isolate z-10 flex h-full w-full flex-col justify-between gap-6 pt-6 pb-6 md:gap-10 md:pt-10 md:pb-10">
        {/* Centered header — glass pill */}
        <section className="flex shrink-0 flex-col justify-center gap-4 px-4 text-center md:px-8">
          <div className="flex flex-col items-center gap-1.5 rounded-2xl px-6 py-2.5 text-center md:px-10 md:py-3"></div>
          <h2 className="text-xl font-black tracking-tight text-[#27aae2] uppercase [text-shadow:0_1px_8px_rgba(255,255,255,0.7)] md:text-4xl lg:text-6xl max-w-7xl mx-auto leading-tight">
            {activeEvent?.title || "BAN GIÁM ĐỐC TRUNG TÂM CÁC THỜI KỲ"}
          </h2>
        </section>

        {/* Top: Full Width Slideshow */}
        <section className="w-full shrink-0">
          <Slideshow />
        </section>

        {/* Bottom: Real-time Check-in List */}
        <section className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 flex-col px-4 md:px-8">
          <div className="border-border mb-1 flex shrink-0 items-center justify-center rounded-xl border-blue-400/70 p-2 shadow-lg shadow-blue-400/10 md:mb-1">
            <h2 className="!text-xl font-bold tracking-tight text-[#27aae2] uppercase [text-shadow:0_1px_8px_rgba(255,255,255,0.7)] md:text-3xl lg:text-4xl px-4 text-center">
              CHÀO MỪNG QUÝ ĐẠI BIỂU, ĐẠI GIA ĐÌNH MECUTE CÁC THỜI KỲ VỀ THAM DỰ CHƯƠNG TRÌNH
            </h2>
          </div>

          <div className="min-h-[100px] flex-1 overflow-visible">
            <CheckinList maxItems={100} />
          </div>
        </section>
      </div>
    </main>
  )
}
