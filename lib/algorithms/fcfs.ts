import type { Process, SchedulingResult, TimelineEvent } from "../types"
import { calculateMetrics } from "../scheduler"

export function fcfs(processes: Process[]): SchedulingResult {
  // Sort processes by arrival time
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime)

  const timeline: TimelineEvent[] = []
  let currentTime = 0

  for (const process of processes) {
    // If the current time is less than the arrival time, update it
    if (currentTime < process.arrivalTime) {
      currentTime = process.arrivalTime
    }

    // Add the process to the timeline
    timeline.push({
      processId: process.id,
      startTime: currentTime,
      endTime: currentTime + process.burstTime,
    })

    // Update the current time
    currentTime += process.burstTime
  }

  return calculateMetrics(processes, timeline)
}
