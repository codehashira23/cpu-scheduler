"use client"

import { useEffect, useRef, useState } from "react"
import type { Process, TimelineEvent } from "@/lib/types"

interface GanttChartProps {
  timeline: TimelineEvent[]
  processes: Process[]
  currentTime: number
}

export default function GanttChart({ timeline, processes, currentTime }: GanttChartProps) {
  const [chartWidth, setChartWidth] = useState(800)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.clientWidth)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  if (!timeline.length) return null

  const maxTime = Math.max(...timeline.map((t) => t.endTime))
  const timeUnit = chartWidth / (maxTime + 1)
  const rowHeight = 50

  // Generate colors for processes
  const getProcessColor = (processId: number) => {
    const colors = [
      "bg-emerald-500",
      "bg-blue-500",
      "bg-purple-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-cyan-500",
      "bg-indigo-500",
      "bg-lime-500",
    ]
    return colors[(processId - 1) % colors.length]
  }

  const getProcessLightColor = (processId: number) => {
    const colors = [
      "bg-emerald-200",
      "bg-blue-200",
      "bg-purple-200",
      "bg-amber-200",
      "bg-rose-200",
      "bg-cyan-200",
      "bg-indigo-200",
      "bg-lime-200",
    ]
    return colors[(processId - 1) % colors.length]
  }

  const getProcessTextColor = (processId: number) => {
    const colors = [
      "text-emerald-700",
      "text-blue-700",
      "text-purple-700",
      "text-amber-700",
      "text-rose-700",
      "text-cyan-700",
      "text-indigo-700",
      "text-lime-700",
    ]
    return colors[(processId - 1) % colors.length]
  }

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <div className="min-w-full" style={{ height: `${rowHeight + 40}px` }}>
        {/* Time markers */}
        <div className="flex h-6 border-b">
          {Array.from({ length: maxTime + 1 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 border-r text-xs flex items-end justify-center pb-1"
              style={{ width: `${timeUnit}px` }}
            >
              {i}
            </div>
          ))}
        </div>

        {/* Gantt chart bars */}
        <div className="relative h-12 mt-2">
          {timeline.map((event, index) => {
            const width = (event.endTime - event.startTime) * timeUnit
            const left = event.startTime * timeUnit
            const processName = processes.find((p) => p.id === event.processId)?.name || `P${event.processId}`

            const isActive = currentTime >= event.startTime && currentTime < event.endTime

            return (
              <div
                key={index}
                className={`absolute h-full flex items-center justify-center text-sm font-medium text-white rounded-sm transition-all ${
                  isActive ? "ring-2 ring-offset-2 ring-black" : ""
                } ${getProcessColor(event.processId)}`}
                style={{
                  left: `${left}px`,
                  width: `${width}px`,
                  minWidth: "24px",
                }}
              >
                {width > 30 ? processName : ""}
              </div>
            )
          })}

          {/* Current time marker */}
          {currentTime > 0 && (
            <div
              className="absolute top-0 h-full border-l-2 border-red-500 z-10"
              style={{ left: `${currentTime * timeUnit}px` }}
            >
              <div className="bg-red-500 text-white text-xs px-1 rounded-sm">{currentTime}</div>
            </div>
          )}
        </div>
      </div>

      {/* Process legend */}
      <div className="mt-6 flex flex-wrap gap-3">
        {processes.map((process) => (
          <div key={process.id} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-sm ${getProcessColor(process.id)}`}></div>
            <span className={`text-sm font-medium ${getProcessTextColor(process.id)}`}>{process.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
