"use client"

import { motion } from "framer-motion"

export function MagicGlow({ className }: { className?: string }) {
  return (
    <motion.div
      className={"pointer-events-none absolute inset-0 " + (className ?? "")}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.2, 0.6, 0.2] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      style={{
        background:
          "radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.45), transparent 55%), radial-gradient(circle at 80% 40%, rgba(16, 185, 129, 0.35), transparent 55%), radial-gradient(circle at 50% 80%, rgba(248, 113, 113, 0.25), transparent 60%)",
        mixBlendMode: "screen",
      }}
    />
  )
}
