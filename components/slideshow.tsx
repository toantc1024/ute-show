"use client"

import { cn } from "@/lib/utils"
import { useRef } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

const IMAGES = Array.from(
  { length: 13 },
  (_, i) => `/assets/bithu/1 (${i + 1}).png`
)

export function Slideshow({ className }: { className?: string }) {
  const plugin = useRef(Autoplay({ delay: 1500, stopOnInteraction: false }))

  return (
    <div className={cn("group relative w-full overflow-hidden", className)}>
      {/* Carousel */}
      <Carousel
        plugins={[plugin.current]}
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-5">
          {IMAGES.map((src, idx) => (
            <CarouselItem
              key={idx}
              className="basis-[70%] pl-5 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <img
                src={src}
                alt="Bí thư Đoàn trường"
                className="aspect-square w-full rounded-2xl object-cover shadow-lg transition-transform duration-500 hover:scale-[1.04]"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Marquee blur edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent md:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent md:w-28" />
    </div>
  )
}
