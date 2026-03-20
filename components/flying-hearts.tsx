"use client"

import { useEffect, useState, useCallback } from "react"

interface Heart {
  id: number
  left: number
  duration: number
  size: number
  color: string
  sway: number
}

const HEART_COLORS = [
  "#ff9bb5",
  "#ffa4be",
  "#ffb3c6",
  "#ffc2d1",
  "#ff8fa3",
  "#ffadc6",
  "#ff7eb3",
  "#ffccd5",
]

const LANE_COUNT = 8

export function FlyingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([])

  const spawnHeart = useCallback((idCounter: number) => {
    const lane = idCounter % LANE_COUNT
    const laneWidth = 100 / LANE_COUNT
    const left = lane * laneWidth + Math.random() * laneWidth * 0.6 + laneWidth * 0.2

    return {
      id: idCounter,
      left,
      duration: 6 + Math.random() * 4,
      size: 12 + Math.random() * 16,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      sway: -40 + Math.random() * 80,
    }
  }, [])

  useEffect(() => {
    let idCounter = 0
    const interval = setInterval(() => {
      const heart = spawnHeart(idCounter++)
      setHearts((prev) => [...prev, heart])

      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== heart.id))
      }, heart.duration * 1000)
    }, 700)

    return () => clearInterval(interval)
  }, [spawnHeart])

  return (
    <>
      <style>{`
        @keyframes heartFlyUp {
          0% {
            transform: translateY(0) translateX(0) scale(0.3);
            opacity: 0;
          }
          3% {
            opacity: 0.85;
          }
          15% {
            transform: translateY(-15vh) translateX(calc(var(--heart-sway) * 0.4)) scale(0.7);
            opacity: 0.9;
          }
          35% {
            transform: translateY(-35vh) translateX(calc(var(--heart-sway) * -0.3)) scale(0.9);
            opacity: 0.85;
          }
          55% {
            transform: translateY(-55vh) translateX(calc(var(--heart-sway) * 0.6)) scale(1);
            opacity: 0.7;
          }
          75% {
            transform: translateY(-75vh) translateX(calc(var(--heart-sway) * -0.2)) scale(1.02);
            opacity: 0.4;
          }
          90% {
            opacity: 0.15;
          }
          100% {
            transform: translateY(-105vh) translateX(calc(var(--heart-sway) * 0.3)) scale(1.05);
            opacity: 0;
          }
        }

        .flying-heart {
          position: absolute;
          bottom: -30px;
          animation: heartFlyUp var(--heart-dur) ease-in-out forwards;
          will-change: transform, opacity;
        }

        .css-heart {
          display: block;
          position: relative;
          width: var(--heart-w);
          height: var(--heart-w);
        }

        .css-heart::before,
        .css-heart::after {
          content: "";
          position: absolute;
          top: 0;
          width: calc(var(--heart-w) * 0.52);
          height: calc(var(--heart-w) * 0.82);
          border-radius: calc(var(--heart-w) * 0.52) calc(var(--heart-w) * 0.52) 0 0;
          background: var(--heart-c);
        }

        .css-heart::before {
          left: calc(var(--heart-w) * 0.48);
          transform: rotate(-45deg);
          transform-origin: 0% 100%;
        }

        .css-heart::after {
          left: 0;
          transform: rotate(45deg);
          transform-origin: 100% 100%;
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" style={{ width: "100vw", height: "100vh" }}>
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="flying-heart"
            style={{
              left: `${heart.left}%`,
              "--heart-dur": `${heart.duration}s`,
              "--heart-sway": `${heart.sway}px`,
            } as React.CSSProperties}
          >
            <div
              className="css-heart"
              style={{
                "--heart-w": `${heart.size}px`,
                "--heart-c": heart.color,
                filter: `drop-shadow(0 0 6px ${heart.color}80)`,
              } as React.CSSProperties}
            />
          </div>
        ))}
      </div>
    </>
  )
}
