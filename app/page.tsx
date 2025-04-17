"use client"

import { useState } from "react"
import AlgorithmSelector from "@/components/algorithm-selector"
import ProcessForm from "@/components/process-form"
import GanttChart from "@/components/gantt-chart"
import ResultsTable from "@/components/results-table"
import AnimationControls from "@/components/animation-controls"
import type { Process, SchedulingResult } from "@/lib/types"
import { runSchedulingAlgorithm } from "@/lib/scheduler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [algorithm, setAlgorithm] = useState("fcfs")
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, name: "P1", arrivalTime: 0, burstTime: 5, priority: 1 },
    { id: 2, name: "P2", arrivalTime: 1, burstTime: 3, priority: 2 },
    { id: 3, name: "P3", arrivalTime: 2, burstTime: 8, priority: 3 },
  ])
  const [timeQuantum, setTimeQuantum] = useState(2)
  const [result, setResult] = useState<SchedulingResult | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1)

  const runSimulation = () => {
    const simulationResult = runSchedulingAlgorithm(algorithm, processes, timeQuantum)
    setResult(simulationResult)
    setCurrentTime(0)
  }

  const handleAlgorithmChange = (newAlgorithm: string) => {
    setAlgorithm(newAlgorithm)
    setResult(null)
    setCurrentTime(0)
    setIsAnimating(false)
  }

  const handleProcessChange = (updatedProcesses: Process[]) => {
    setProcesses(updatedProcesses)
    setResult(null)
    setCurrentTime(0)
    setIsAnimating(false)
  }

  const handleTimeQuantumChange = (newTimeQuantum: number) => {
    setTimeQuantum(newTimeQuantum)
    if (algorithm === "roundRobin") {
      setResult(null)
      setCurrentTime(0)
      setIsAnimating(false)
    }
  }

  const toggleAnimation = () => {
    if (!result) return

    if (!isAnimating) {
      setIsAnimating(true)
      const maxTime = Math.max(...result.timeline.map((t) => t.endTime))

      if (currentTime >= maxTime) {
        setCurrentTime(0)
      }

      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1
          if (next > maxTime) {
            clearInterval(interval)
            setIsAnimating(false)
            return maxTime
          }
          return next
        })
      }, 1000 / animationSpeed)

      return () => clearInterval(interval)
    } else {
      setIsAnimating(false)
    }
  }

  const resetAnimation = () => {
    setCurrentTime(0)
    setIsAnimating(false)
  }

  return (
    <main className="container mx-auto py-6 px-4 min-h-screen technical-grid">
      <div className="max-w-7xl mx-auto">
        <div className="border-b border-blue-500/30 pb-4 mb-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-blue-400">CPU Scheduling Algorithm Visualizer</h1>
          <p className="text-center text-blue-300/70 text-sm">
            <code className="bg-blue-950/30 px-1 py-0.5 rounded">v1.0.0</code> | Technical visualization of process scheduling algorithms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1 border-blue-500/20 bg-card/80 backdrop-blur-sm shadow-lg shadow-blue-500/5">
            <CardHeader className="border-b border-blue-500/20 pb-3">
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Algorithm Settings
              </CardTitle>
              <CardDescription className="text-blue-300/70">Select scheduling algorithm and parameters</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <AlgorithmSelector
                selectedAlgorithm={algorithm}
                onAlgorithmChange={handleAlgorithmChange}
                timeQuantum={timeQuantum}
                onTimeQuantumChange={handleTimeQuantumChange}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-blue-500/20 bg-card/80 backdrop-blur-sm shadow-lg shadow-blue-500/5">
            <CardHeader className="border-b border-blue-500/20 pb-3">
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cpu">
                  <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                  <rect x="9" y="9" width="6" height="6"></rect>
                  <path d="M15 2v2"></path>
                  <path d="M15 20v2"></path>
                  <path d="M2 15h2"></path>
                  <path d="M2 9h2"></path>
                  <path d="M20 15h2"></path>
                  <path d="M20 9h2"></path>
                  <path d="M9 2v2"></path>
                  <path d="M9 20v2"></path>
                </svg>
                Process Configuration
              </CardTitle>
              <CardDescription className="text-blue-300/70">Define processes for scheduling simulation</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ProcessForm processes={processes} onProcessesChange={handleProcessChange} algorithm={algorithm} />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={runSimulation}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md transition-colors flex items-center gap-2 border border-blue-500/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Run Simulation
          </button>
        </div>

        {result && (
          <Tabs defaultValue="gantt" className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-blue-950/50 border border-blue-500/20">
              <TabsTrigger value="gantt" className="data-[state=active]:bg-blue-600">Gantt Chart</TabsTrigger>
              <TabsTrigger value="metrics" className="data-[state=active]:bg-blue-600">Process Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="gantt" className="mt-6">
              <Card className="border-blue-500/20 bg-card/80 backdrop-blur-sm shadow-lg shadow-blue-500/5">
                <CardHeader className="border-b border-blue-500/20 pb-3">
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart">
                      <line x1="12" x2="12" y1="20" y2="10"></line>
                      <line x1="18" x2="18" y1="20" y2="4"></line>
                      <line x1="6" x2="6" y1="20" y2="16"></line>
                    </svg>
                    Gantt Chart Visualization
                  </CardTitle>
                  <CardDescription className="text-blue-300/70">
                    Visual representation of process execution timeline
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <GanttChart timeline={result.timeline} processes={processes} currentTime={currentTime} />

                  <div className="mt-6 border-t border-blue-500/20 pt-4">
                    <AnimationControls
                      isAnimating={isAnimating}
                      onToggleAnimation={toggleAnimation}
                      onReset={resetAnimation}
                      currentTime={currentTime}
                      maxTime={Math.max(...result.timeline.map((t) => t.endTime))}
                      animationSpeed={animationSpeed}
                      onSpeedChange={setAnimationSpeed}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="mt-6">
              <Card className="border-blue-500/20 bg-card/80 backdrop-blur-sm shadow-lg shadow-blue-500/5">
                <CardHeader className="border-b border-blue-500/20 pb-3">
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-table">
                      <path d="M12 3v18"></path>
                      <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                      <path d="M3 9h18"></path>
                      <path d="M3 15h18"></path>
                    </svg>
                    Process Metrics
                  </CardTitle>
                  <CardDescription className="text-blue-300/70 flex flex-col sm:flex-row sm:gap-4">
                    <span>Average Waiting Time: <code className="bg-blue-950/30 px-1 py-0.5 rounded">{result.averageWaitingTime.toFixed(2)}</code></span>
                    <span>Average Turnaround Time: <code className="bg-blue-950/30 px-1 py-0.5 rounded">{result.averageTurnaroundTime.toFixed(2)}</code></span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ResultsTable processes={result.processes} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
        
        <footer className="text-center text-blue-300/50 text-xs mt-12 border-t border-blue-500/20 pt-4">
          <p>CPU Scheduler Visualizer | Technical Implementation</p>
        </footer>
      </div>
    </main>
  )
}
