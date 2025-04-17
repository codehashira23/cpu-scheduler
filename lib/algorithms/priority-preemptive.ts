import type { Process, SchedulingResult, TimelineEvent } from "../types"
import { calculateMetrics } from "../scheduler"

export function priorityPreemptive(processes: Process[]): SchedulingResult {
  // Create a deep copy of processes to avoid mutating the original
  const processesCopy = JSON.parse(JSON.stringify(processes))

  // Sort processes by arrival time
  processesCopy.sort((a, b) => a.arrivalTime - b.arrivalTime)

  const timeline: TimelineEvent[] = []
  let currentTime = 0
  const remainingProcesses = [...processesCopy]

  // Track remaining burst time for each process
  const remainingBurstTime = new Map<number, number>()
  processesCopy.forEach((p) => remainingBurstTime.set(p.id, p.burstTime))

  // Track the last process that was running
  let lastRunningProcess: number | null = null
  let lastStartTime = 0

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

    // If the process changes, add the previous process to the timeline
    if (lastRunningProcess !== null && lastRunningProcess !== highestPriorityProcess.id) {
      timeline.push({
        processId: lastRunningProcess,
        startTime: lastStartTime,
        endTime: currentTime,
      })
      lastStartTime = currentTime
    }

    // If this is the first process or a new process, update the last running process
    if (lastRunningProcess === null || lastRunningProcess !== highestPriorityProcess.id) {
      lastRunningProcess = highestPriorityProcess.id
      lastStartTime = currentTime
    }

    // Determine how long this process will run
    let runTime = remainingBurstTime.get(highestPriorityProcess.id) || 0

    // Check if another process will arrive before this one finishes
    const nextArrival = remainingProcesses
      .filter((p) => p.arrivalTime > currentTime)
      .sort((a, b) => a.arrivalTime - b.arrivalTime)[0]

    if (nextArrival && currentTime + runTime > nextArrival.arrivalTime) {
      runTime = nextArrival.arrivalTime - currentTime
    }

    // Update the remaining burst time
    remainingBurstTime.set(
      highestPriorityProcess.id,
      (remainingBurstTime.get(highestPriorityProcess.id) || 0) - runTime,
    )

    // Update the current time
    currentTime += runTime

    // If the process is complete, remove it from the remaining processes
    if ((remainingBurstTime.get(highestPriorityProcess.id) || 0) <= 0) {
      const index = remainingProcesses.findIndex((p) => p.id === highestPriorityProcess.id)
      remainingProcesses.splice(index, 1)

      // Add the final segment to the timeline
      timeline.push({
        processId: highestPriorityProcess.id,
        startTime: lastStartTime,
        endTime: currentTime,
      })

      lastRunningProcess = null
    }
  }

  return calculateMetrics(processesCopy, timeline)
}
