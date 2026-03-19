"use client"

import { useEffect, useState } from "react"

export function FlyingHearts() {
  const [hearts, setHearts] = useState<
    { id: number; left: number; duration: number; size: number }[]
  >([])

  useEffect(() => {
    let idCounter = 0
    const interval = setInterval(() => {
      const newHeart = {
        id: idCounter++,
        left: Math.random() * 100,
        duration: 3 + Math.random() * 4,
        size: 15 + Math.random() * 25,
      }

      setHearts((prev) => [...prev, newHeart])

      // Remove the heart after its animation finishes
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== newHeart.id))
      }, newHeart.duration * 1000)
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 h-screen w-screen overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute bottom-0"
          style={{
            left: `${heart.left}%`,
            fontSize: `${heart.size}px`,
            animation: `flyUp ${heart.duration}s linear forwards`,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  )
}
