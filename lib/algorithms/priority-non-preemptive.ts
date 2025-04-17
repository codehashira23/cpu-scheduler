import type { Process, SchedulingResult, TimelineEvent } from "../types"
import { calculateMetrics } from "../scheduler"

export function priorityNonPreemptive(processes: Process[]): SchedulingResult {
  // Sort processes by arrival time initially
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime)

  const timeline: TimelineEvent[] = []
  let currentTime = 0
  const remainingProcesses = [...processes]

  while (remainingProcesses.length > 0) {
    // Find all processes that have arrived by the current time
    const availableProcesses = remainingProcesses.filter((p) => p.arrivalTime <= currentTime)

    if (availableProcesses.length === 0) {
      // If no processes are available, jump to the next arrival time
      currentTime = Math.min(...remainingProcesses.map((p) => p.arrivalTime))
      continue
    }

    // Find the process with the highest priority (lowest priority number)
    const highestPriorityProcess = availableProcesses.reduce((prev, current) =>
      prev.priority < current.priority ? prev : current,
    )

    // Add the process to the timeline
    timeline.push({
      processId: highestPriorityProcess.id,
      startTime: currentTime,
      endTime: currentTime + highestPriorityProcess.burstTime,
    })

    // Update the current time
    currentTime += highestPriorityProcess.burstTime

    // Remove the processed job from the remaining processes
    const index = remainingProcesses.findIndex((p) => p.id === highestPriorityProcess.id)
    remainingProcesses.splice(index, 1)
  }

  return calculateMetrics(processes, timeline)
}
