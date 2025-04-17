import type { Process, SchedulingResult, TimelineEvent } from "../types"
import { calculateMetrics } from "../scheduler"

export function roundRobin(processes: Process[], timeQuantum: number): SchedulingResult {
  // Create a deep copy of processes to avoid mutating the original
  const processesCopy = JSON.parse(JSON.stringify(processes))

  // Sort processes by arrival time
  processesCopy.sort((a, b) => a.arrivalTime - b.arrivalTime)

  const timeline: TimelineEvent[] = []
  let currentTime = 0

  // Create a queue of processes
  const queue: Process[] = []

  // Track remaining burst time for each process
  const remainingBurstTime = new Map<number, number>()
  processesCopy.forEach((p) => remainingBurstTime.set(p.id, p.burstTime))

  // Track which processes have been added to the queue
  const processAdded = new Set<number>()

  // Continue until all processes are complete
  while (queue.length > 0 || processesCopy.some((p) => !processAdded.has(p.id))) {
    // Add newly arrived processes to the queue
    const newArrivals = processesCopy.filter((p) => p.arrivalTime <= currentTime && !processAdded.has(p.id))

    newArrivals.forEach((p) => {
      queue.push(p)
      processAdded.add(p.id)
    })

    if (queue.length === 0) {
      // If no processes are in the queue, jump to the next arrival time
      const nextArrival = processesCopy.find((p) => !processAdded.has(p.id))
      if (nextArrival) {
        currentTime = nextArrival.arrivalTime
      }
      continue
    }

    // Get the next process from the queue
    const currentProcess = queue.shift()!

    // Calculate how long this process will run
    const remainingTime = remainingBurstTime.get(currentProcess.id) || 0
    const runTime = Math.min(timeQuantum, remainingTime)

    // Add the process to the timeline
    timeline.push({
      processId: currentProcess.id,
      startTime: currentTime,
      endTime: currentTime + runTime,
    })

    // Update the current time
    currentTime += runTime

    // Update the remaining burst time
    remainingBurstTime.set(currentProcess.id, remainingTime - runTime)

    // Add newly arrived processes during this time quantum
    const arrivedDuringQuantum = processesCopy.filter(
      (p) => p.arrivalTime > currentTime - runTime && p.arrivalTime <= currentTime && !processAdded.has(p.id),
    )

    arrivedDuringQuantum.forEach((p) => {
      queue.push(p)
      processAdded.add(p.id)
    })

    // If the process is not complete, add it back to the queue
    if ((remainingBurstTime.get(currentProcess.id) || 0) > 0) {
      queue.push(currentProcess)
    }
  }

  return calculateMetrics(processesCopy, timeline)
}
