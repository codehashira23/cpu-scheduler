export interface Process {
  id: number
  name: string
  arrivalTime: number
  burstTime: number
  priority: number
}

export interface ProcessResult extends Process {
  completionTime: number
  turnaroundTime: number
  waitingTime: number
  responseTime: number
}

export interface TimelineEvent {
  processId: number
  startTime: number
  endTime: number
}

export interface SchedulingResult {
  processes: ProcessResult[]
  timeline: TimelineEvent[]
  averageWaitingTime: number
  averageTurnaroundTime: number
}
