"use client"

import { cn } from "@/lib/utils"
import { useRef } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

const IMAGES = [
  "16-17-01 Medium.png", "16-17-02 Medium.png", "16-17-03 Medium.png", "16-17-04 Medium.png",
  "17-18-01 Medium.png", "17-18-02 Medium.png", "17-18-03 Medium.png", "17-18-04 Medium.png",
  "18-19-01 Medium.png", "18-19-02 Medium.png", "18-19-03 Medium.png", "18-19-04 Medium.png",
  "19-21-01 Medium.png", "19-21-02 Medium.png", "19-21-03 Medium.png", "19-21-04 Medium.png",
  "21-22-01 Medium.png", "21-22-02 Medium.png", "21-22-03 Medium.png", "21-22-04 Medium.png",
  "22-23-01 Medium.png", "22-23-02 Medium.png", "22-23-03 Medium.png", "22-23-04 Medium.png",
  "23-24-01 Medium.png", "23-24-02 Medium.png", "23-24-03 Medium.png", "23-24-04 Medium.png",
  "24-25-01 Medium.png", "24-25-02 Medium.png", "24-25-03 Medium.png", "24-25-04 Medium.png",
  "25-26-01 Medium.png", "25-26-02 Medium.png", "25-26-03 Medium.png", "25-26-04 Medium.png"
].map(file => `/assets/BGD/${file}`)

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
                alt="Ban Giám Đốc Trung Tâm"
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
