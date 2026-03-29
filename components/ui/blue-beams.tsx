"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type BlueBeamsProps = {
  className?: string
}

// Beam definitions: left position, width (px), blur (px), rgb color, animation
const BEAMS = [
  { left: "6%", w: 100, blur: 50, rgb: "59,130,246", dur: 7, delay: 0 },
  { left: "18%", w: 24, blur: 18, rgb: "14,165,233", dur: 11, delay: 2 },
  { left: "32%", w: 130, blur: 65, rgb: "99,102,241", dur: 9, delay: 0.5 },
  { left: "48%", w: 42, blur: 26, rgb: "59,130,246", dur: 13, delay: 3 },
  { left: "63%", w: 90, blur: 52, rgb: "14,165,233", dur: 8, delay: 1 },
  { left: "77%", w: 30, blur: 18, rgb: "139,92,246", dur: 12, delay: 4 },
  { left: "90%", w: 65, blur: 42, rgb: "59,130,246", dur: 10, delay: 1.5 },
]

export function BlueBeams({ className }: BlueBeamsProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      {BEAMS.map((beam, idx) => (
        // Outer div owns the CSS transform so framer-motion only handles opacity
        <div
          key={idx}
          className="absolute rounded-lg"
          style={{
            left: beam.left,
            top: "50%",
            width: `${beam.w}px`,
            height: "200vh",
            transform: "translateX(-50%) translateY(-50%) rotate(-40deg)",
            filter: `blur(${beam.blur}px)`,
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, rgba(${beam.rgb},0.55) 40%, rgba(${beam.rgb},0.55) 60%, transparent 100%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{
              duration: beam.dur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: beam.delay,
            }}
          />
        </div>
      ))}
    </div>
  )
}
