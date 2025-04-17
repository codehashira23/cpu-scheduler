import type { Process, ProcessResult, SchedulingResult, TimelineEvent } from "./types"
import { fcfs } from "./algorithms/fcfs"
import { sjf } from "./algorithms/sjf"
import { srtf } from "./algorithms/srtf"
import { roundRobin } from "./algorithms/round-robin"
import { priorityNonPreemptive } from "./algorithms/priority-non-preemptive"
import { priorityPreemptive } from "./algorithms/priority-preemptive"

export function runSchedulingAlgorithm(algorithm: string, processes: Process[], timeQuantum: number): SchedulingResult {
  // Create a deep copy of processes to avoid mutating the original
  const processesCopy = JSON.parse(JSON.stringify(processes))

  let result: SchedulingResult

  switch (algorithm) {
    case "fcfs":
      result = fcfs(processesCopy)
      break
    case "sjf":
      result = sjf(processesCopy)
      break
    case "srtf":
      result = srtf(processesCopy)
      break
    case "roundRobin":
      result = roundRobin(processesCopy, timeQuantum)
      break
    case "priorityNonPreemptive":
      result = priorityNonPreemptive(processesCopy)
      break
    case "priorityPreemptive":
      result = priorityPreemptive(processesCopy)
      break
    default:
      result = fcfs(processesCopy)
  }

  return result
}

export function calculateMetrics(processes: Process[], timeline: TimelineEvent[]): SchedulingResult {
  const processResults: ProcessResult[] = processes.map((process) => {
    // Find all timeline events for this process
    const processEvents = timeline.filter((event) => event.processId === process.id)

    // Calculate completion time (end time of the last event)
    const completionTime = Math.max(...processEvents.map((e) => e.endTime))

    // Calculate response time (start time of the first event - arrival time)
    const responseTime = Math.min(...processEvents.map((e) => e.startTime)) - process.arrivalTime

    // Calculate turnaround time (completion time - arrival time)
    const turnaroundTime = completionTime - process.arrivalTime

    // Calculate waiting time (turnaround time - burst time)
    const waitingTime = turnaroundTime - process.burstTime

    return {
      ...process,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    }
  })

  // Calculate averages
  const averageWaitingTime = processResults.reduce((sum, p) => sum + p.waitingTime, 0) / processes.length

  const averageTurnaroundTime = processResults.reduce((sum, p) => sum + p.turnaroundTime, 0) / processes.length

  return {
    processes: processResults,
    timeline,
    averageWaitingTime,
    averageTurnaroundTime,
  }
}
