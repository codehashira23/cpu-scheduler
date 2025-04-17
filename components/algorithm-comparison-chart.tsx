"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Process, SchedulingResult } from "@/lib/types"
import { runSchedulingAlgorithm } from "@/lib/scheduler"

const ALGORITHMS = [
  { 
    id: "fcfs", 
    name: "First Come First Serve (FCFS)",
    description: "Simple, non-preemptive algorithm that executes processes in order of arrival. Best for batch systems where execution order isn't critical.",
    pros: "Simple to implement, fair to processes that arrive first",
    cons: "Can lead to convoy effect where short processes wait behind long ones, high average waiting time"
  },
  { 
    id: "sjf", 
    name: "Shortest Job First (SJF)",
    description: "Non-preemptive algorithm that selects the process with the smallest burst time. Optimal for minimizing average waiting time.",
    pros: "Minimizes average waiting time, good for systems where job lengths are known",
    cons: "Potential starvation of longer processes, requires knowing burst time in advance"
  },
  { 
    id: "srtf", 
    name: " Shortest Remaining Time First (SRTF)",
    description: "Preemptive version of SJF. Process with shortest remaining time is always executed first.",
    pros: "Optimal average waiting time, responsive to short processes",
    cons: "High overhead due to frequent context switching, requires continuous monitoring"
  },
  { 
    id: "roundRobin", 
    name: "Round Robin (RR)",
    description: "Time-sharing algorithm where each process gets a small unit of CPU time (time quantum), then is preempted.",
    pros: "Fair allocation, good for time-sharing systems, prevents starvation",
    cons: "Performance depends on time quantum selection, higher average waiting time than SJF"
  },
  { 
    id: "priorityNonPreemptive", 
    name: "Priority (Non-Preemptive)",
    description: "Processes are executed based on priority. Once started, a process runs to completion.",
    pros: "Important processes get CPU first, good for systems with clear process importance",
    cons: "Potential starvation of low-priority processes, priority inversion problems"
  },
  { 
    id: "priorityPreemptive", 
    name: "Priority (Preemptive)",
    description: "Higher priority processes can interrupt currently running lower priority processes.",
    pros: "Responsive to high-priority processes, good for real-time systems",
    cons: "Complex implementation, potential starvation, overhead from context switching"
  },
]

interface AlgorithmComparisonChartProps {
  processes: Process[]
  timeQuantum: number
}

export default function AlgorithmComparisonChart({
  processes,
  timeQuantum,
}: AlgorithmComparisonChartProps) {
  const [results, setResults] = useState<Record<string, SchedulingResult>>({})
  const [chartData, setChartData] = useState<any[]>([])
  const [processChartData, setProcessChartData] = useState<any[]>([])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null)

  useEffect(() => {
    if (processes.length === 0) return

    // Run all algorithms and collect results
    const allResults: Record<string, SchedulingResult> = {}
    
    ALGORITHMS.forEach((algorithm) => {
      allResults[algorithm.id] = runSchedulingAlgorithm(
        algorithm.id,
        processes,
        timeQuantum
      )
    })

    setResults(allResults)

    // Prepare data for algorithm comparison chart
    const comparisonData = ALGORITHMS.map((algorithm) => {
      const result = allResults[algorithm.id]
      return {
        name: algorithm.name,
        waitingTime: result.averageWaitingTime,
        turnaroundTime: result.averageTurnaroundTime,
        algorithmId: algorithm.id,
      }
    })

    setChartData(comparisonData)

    // Prepare data for process-level comparison
    const processData = processes.map((process) => {
      const data: any = {
        name: process.name,
      }

      ALGORITHMS.forEach((algorithm) => {
        const result = allResults[algorithm.id]
        const processResult = result.processes.find((p) => p.id === process.id)
        
        if (processResult) {
          data[`${algorithm.id}_waiting`] = processResult.waitingTime
          data[`${algorithm.id}_turnaround`] = processResult.turnaroundTime
        }
      })

      return data
    })

    setProcessChartData(processData)
  }, [processes, timeQuantum])

  // Helper function to get color for algorithm
  const getAlgorithmColor = (index: number) => {
    const colors = [
      "#3b82f6", // blue
      "#10b981", // green
      "#f59e0b", // amber
      "#ef4444", // red
      "#8b5cf6", // violet
      "#ec4899", // pink
    ];
    return colors[index % colors.length];
  };

  // Find the maximum value for scaling the bars
  const waitingTimes = Object.values(results).map((result) => result.averageWaitingTime);
  const maxWaitingTime = Math.max(...waitingTimes, 1);
  const minWaitingTime = Math.min(...waitingTimes, 0);
  
  const turnaroundTimes = Object.values(results).map((result) => result.averageTurnaroundTime);
  const maxTurnaroundTime = Math.max(...turnaroundTimes, 1);
  const minTurnaroundTime = Math.min(...turnaroundTimes, 0);

  // Calculate the maximum value for process-level metrics
  const maxProcessWaitingTime = Math.max(
    ...Object.values(results).flatMap((result) =>
      result.processes.map((p) => p.waitingTime)
    ), 1
  );
  const maxProcessTurnaroundTime = Math.max(
    ...Object.values(results).flatMap((result) =>
      result.processes.map((p) => p.turnaroundTime)
    ), 1
  );

  return (
    <Card className="border-blue-500/20 bg-card/80 backdrop-blur-sm shadow-lg shadow-blue-500/5">
      <CardHeader className="border-b border-blue-500/20 pb-3">
        <CardTitle className="text-blue-400 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18"></path>
            <path d="m19 9-5 5-4-4-3 3"></path>
          </svg>
          Algo Comparison
        </CardTitle>
        <CardDescription className="text-blue-300/70">
          Performance comparison of all CPU scheduling algorithms
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="averages" className="w-full">
          <TabsList className="grid w-full max-w-full sm:max-w-md mx-auto grid-cols-3 bg-blue-950/50 border border-blue-500/20 text-xs sm:text-sm">
            <TabsTrigger
              value="averages"
              className="data-[state=active]:bg-blue-600"
            >
              Average Metrics
            </TabsTrigger>
            <TabsTrigger
              value="perProcess"
              className="data-[state=active]:bg-blue-600"
            >
              Per Process
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="data-[state=active]:bg-blue-600"
            >
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="averages" className="mt-6">
            <div className="space-y-8">
              {/* Average Waiting Time Chart */}
              <div>
                <h3 className="text-base sm:text-lg font-medium text-blue-400 mb-2">Average Waiting Time</h3>
                <div className="bg-blue-950/30 p-6 rounded-lg relative">
                  {/* Grid lines only */}
                  <div className="absolute left-0 top-4 w-full border-t border-blue-500/10"></div>
                  <div className="absolute left-0 top-1/2 w-full border-t border-blue-500/10"></div>
                  <div className="absolute left-0 bottom-4 w-full border-t border-blue-500/10"></div>
                  <div className="flex items-end h-48 sm:h-64 gap-1 sm:gap-4">
                    {ALGORITHMS.map((algorithm, index) => {
                      const result = results[algorithm.id];
                      if (!result) return null;
                      
                      // Use a non-linear scale to make small differences more visible
                      // Start from 10% minimum height and scale the rest between 10% and 100%
                      const percentage = 10 + ((result.averageWaitingTime - minWaitingTime) / (maxWaitingTime - minWaitingTime || 1)) * 90;
                      return (
                        <div 
                          key={algorithm.id} 
                          className="flex flex-col items-center flex-1 cursor-pointer"
                          onClick={() => setSelectedAlgorithm(selectedAlgorithm === algorithm.id ? null : algorithm.id)}
                        >
                          <div className="w-full flex justify-center mb-2">
                            <div 
                              className={`w-full rounded-t-sm transition-all duration-300 hover:brightness-125 ${selectedAlgorithm && selectedAlgorithm !== algorithm.id ? 'opacity-40' : ''}`}
                              style={{
                                height: `${percentage}%`,
                                backgroundColor: getAlgorithmColor(index),
                                minHeight: '4px',
                              }}
                            />
                          </div>
                          <div className="text-[10px] sm:text-xs text-blue-300 text-center font-semibold">
                            {result.averageWaitingTime.toFixed(2)}
                          </div>
                          <div className="text-[10px] sm:text-xs text-blue-300/70 mt-1 sm:mt-2 text-center max-w-16 sm:max-w-24 truncate font-medium" title={algorithm.name}>
                            {algorithm.name.split(' ')[0]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Average Turnaround Time Chart */}
              <div>
                <h3 className="text-base sm:text-lg font-medium text-blue-400 mb-2">Average Turnaround Time</h3>
                <div className="bg-blue-950/30 p-6 rounded-lg relative">
                  {/* Grid lines only */}
                  <div className="absolute left-0 top-4 w-full border-t border-blue-500/10"></div>
                  <div className="absolute left-0 top-1/2 w-full border-t border-blue-500/10"></div>
                  <div className="absolute left-0 bottom-4 w-full border-t border-blue-500/10"></div>
                  <div className="flex items-end h-48 sm:h-64 gap-1 sm:gap-4">
                    {ALGORITHMS.map((algorithm, index) => {
                      const result = results[algorithm.id];
                      if (!result) return null;
                      
                      // Use a non-linear scale to make small differences more visible
                      // Start from 10% minimum height and scale the rest between 10% and 100%
                      const percentage = 10 + ((result.averageTurnaroundTime - minTurnaroundTime) / (maxTurnaroundTime - minTurnaroundTime || 1)) * 90;
                      return (
                        <div 
                          key={algorithm.id} 
                          className="flex flex-col items-center flex-1 cursor-pointer"
                          onClick={() => setSelectedAlgorithm(selectedAlgorithm === algorithm.id ? null : algorithm.id)}
                        >
                          <div className="w-full flex justify-center mb-2">
                            <div 
                              className={`w-full rounded-t-sm transition-all duration-300 hover:brightness-125 ${selectedAlgorithm && selectedAlgorithm !== algorithm.id ? 'opacity-40' : ''}`}
                              style={{
                                height: `${percentage}%`,
                                backgroundColor: getAlgorithmColor(index),
                                minHeight: '4px',
                              }}
                            />
                          </div>
                          <div className="text-[10px] sm:text-xs text-blue-300 text-center font-semibold">
                            {result.averageTurnaroundTime.toFixed(2)}
                          </div>
                          <div className="text-[10px] sm:text-xs text-blue-300/70 mt-1 sm:mt-2 text-center max-w-16 sm:max-w-24 truncate font-medium" title={algorithm.name}>
                            {algorithm.name.split(' ')[0]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Comparison Table */}
              <div>
                <h3 className="text-base sm:text-lg font-medium text-blue-400 mb-2">Metrics Comparison Table</h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-blue-500/20">
                        <th className="text-left py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm">Algorithm</th>
                        <th className="text-right py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm">Avg. Waiting Time</th>
                        <th className="text-right py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm">Avg. Turnaround Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ALGORITHMS.map((algorithm, index) => {
                        const result = results[algorithm.id];
                        if (!result) return null;
                        
                        return (
                          <tr 
                            key={algorithm.id} 
                            className={`border-b border-blue-500/10 hover:bg-blue-950/30 cursor-pointer ${selectedAlgorithm === algorithm.id ? 'bg-blue-900/20' : ''}`}
                            onClick={() => setSelectedAlgorithm(selectedAlgorithm === algorithm.id ? null : algorithm.id)}
                          >
                            <td className="py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: getAlgorithmColor(index) }}
                                />
                                {algorithm.name}
                              </div>
                            </td>
                            <td className="text-right py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm">
                              {result.averageWaitingTime.toFixed(2)}
                            </td>
                            <td className="text-right py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm">
                              {result.averageTurnaroundTime.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="perProcess" className="mt-6">
            <div className="space-y-8">
              {/* Process-level Waiting Time */}
              <div>
                <h3 className="text-base sm:text-lg font-medium text-blue-400 mb-2">Waiting Time Per Process</h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-blue-500/20">
                        <th className="text-left py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm">Process</th>
                        {ALGORITHMS.map((algorithm, index) => (
                          <th 
                            key={algorithm.id} 
                            className={`text-right py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm cursor-pointer ${selectedAlgorithm === algorithm.id ? 'bg-blue-900/20' : ''}`}
                            onClick={() => setSelectedAlgorithm(selectedAlgorithm === algorithm.id ? null : algorithm.id)}
                          >
                            <div className="flex items-center justify-end gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: getAlgorithmColor(index) }}
                              />
                              {algorithm.name.split(' ')[0]}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {processes.map((process) => (
                        <tr key={process.id} className="border-b border-blue-500/10 hover:bg-blue-950/30">
                          <td className="py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm">{process.name}</td>
                          {ALGORITHMS.map((algorithm, index) => {
                            const result = results[algorithm.id];
                            if (!result) return <td key={algorithm.id} className="text-right py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm">-</td>;
                            
                            const processResult = result.processes.find(p => p.id === process.id);
                            return (
                              <td 
                                key={algorithm.id} 
                                className={`text-right py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm ${selectedAlgorithm && selectedAlgorithm !== algorithm.id ? 'opacity-40' : ''}`}
                              >
                                {processResult ? processResult.waitingTime.toFixed(2) : '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Process-level Turnaround Time */}
              <div>
                <h3 className="text-base sm:text-lg font-medium text-blue-400 mb-2">Turnaround Time Per Process</h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-blue-500/20">
                        <th className="text-left py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm">Process</th>
                        {ALGORITHMS.map((algorithm, index) => (
                          <th 
                            key={algorithm.id} 
                            className={`text-right py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm cursor-pointer ${selectedAlgorithm === algorithm.id ? 'bg-blue-900/20' : ''}`}
                            onClick={() => setSelectedAlgorithm(selectedAlgorithm === algorithm.id ? null : algorithm.id)}
                          >
                            <div className="flex items-center justify-end gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: getAlgorithmColor(index) }}
                              />
                              {algorithm.name.split(' ')[0]}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {processes.map((process) => (
                        <tr key={process.id} className="border-b border-blue-500/10 hover:bg-blue-950/30">
                          <td className="py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm">{process.name}</td>
                          {ALGORITHMS.map((algorithm, index) => {
                            const result = results[algorithm.id];
                            if (!result) return <td key={algorithm.id} className="text-right py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm">-</td>;
                            
                            const processResult = result.processes.find(p => p.id === process.id);
                            return (
                              <td 
                                key={algorithm.id} 
                                className={`text-right py-1 sm:py-2 px-2 sm:px-4 text-blue-300 text-xs sm:text-sm ${selectedAlgorithm && selectedAlgorithm !== algorithm.id ? 'opacity-40' : ''}`}
                              >
                                {processResult ? processResult.turnaroundTime.toFixed(2) : '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <div className="space-y-8">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-blue-400 mb-2">Algorithm Recommendations</h3>
                <p className="text-blue-300/70 mb-4">
                  Select the most appropriate scheduling algorithm based on your system requirements:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ALGORITHMS.map((algorithm, index) => (
                    <Card 
                      key={algorithm.id} 
                      className={`border-blue-500/20 bg-card/80 backdrop-blur-sm shadow-lg shadow-blue-500/5 hover:border-blue-500/40 transition-all cursor-pointer ${selectedAlgorithm === algorithm.id ? 'border-blue-500/60 bg-blue-900/20' : ''}`}
                      onClick={() => setSelectedAlgorithm(selectedAlgorithm === algorithm.id ? null : algorithm.id)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getAlgorithmColor(index) }}
                          />
                          {algorithm.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-blue-300/80 mb-2">{algorithm.description}</p>
                        <div className="mt-2 space-y-2">
                          <div>
                            <h4 className="text-xs text-blue-400 font-medium">Best Used When:</h4>
                            <ul className="list-disc list-inside text-xs text-blue-300/70 mt-1">
                              {algorithm.id === "fcfs" && (
                                <>
                                  <li>Simplicity is more important than efficiency</li>
                                  <li>Processes arrive in a predictable order</li>
                                  <li>All processes have similar burst times</li>
                                </>
                              )}
                              {algorithm.id === "sjf" && (
                                <>
                                  <li>Process burst times are known in advance</li>
                                  <li>Minimizing average waiting time is critical</li>
                                  <li>Batch processing environments</li>
                                </>
                              )}
                              {algorithm.id === "srtf" && (
                                <>
                                  <li>Process burst times are known or can be estimated</li>
                                  <li>System needs to be responsive to short processes</li>
                                  <li>Preemption overhead is acceptable</li>
                                </>
                              )}
                              {algorithm.id === "roundRobin" && (
                                <>
                                  <li>Time-sharing systems are needed</li>
                                  <li>Fair CPU distribution is required</li>
                                  <li>Interactive systems with many users</li>
                                </>
                              )}
                              {algorithm.id === "priorityNonPreemptive" && (
                                <>
                                  <li>Processes have clear priority differences</li>
                                  <li>Important tasks need to be completed first</li>
                                  <li>Context switching should be minimized</li>
                                </>
                              )}
                              {algorithm.id === "priorityPreemptive" && (
                                <>
                                  <li>Real-time systems with critical tasks</li>
                                  <li>High-priority processes need immediate attention</li>
                                  <li>System can handle frequent context switching</li>
                                </>
                              )}
                            </ul>
                          </div>
                          <div className="flex gap-4 text-xs">
                            <div className="flex-1">
                              <h4 className="text-green-400 font-medium">Pros:</h4>
                              <p className="text-green-300/70">{algorithm.pros}</p>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-red-400 font-medium">Cons:</h4>
                              <p className="text-red-300/70">{algorithm.cons}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-medium text-blue-400 mb-2">Performance Analysis</h3>
                <div className="bg-blue-950/30 p-4 rounded-lg">
                  <p className="text-blue-300/80 text-xs sm:text-sm mb-2 sm:mb-4">
                    Based on the current set of processes, here's the recommended algorithm:
                  </p>
                  
                  {Object.keys(results).length > 0 && (
                    <div className="space-y-4">
                      {/* Find best algorithm for waiting time */}
                      {(() => {
                        const bestWaitingAlgo = ALGORITHMS.reduce((best, current) => {
                          const currentResult = results[current.id];
                          const bestResult = results[best.id];
                          return currentResult.averageWaitingTime < bestResult.averageWaitingTime ? current : best;
                        }, ALGORITHMS[0]);
                        
                        const bestTurnaroundAlgo = ALGORITHMS.reduce((best, current) => {
                          const currentResult = results[current.id];
                          const bestResult = results[best.id];
                          return currentResult.averageTurnaroundTime < bestResult.averageTurnaroundTime ? current : best;
                        }, ALGORITHMS[0]);
                        
                        return (
                          <>
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-900/20 rounded-lg">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: getAlgorithmColor(ALGORITHMS.findIndex(a => a.id === bestWaitingAlgo.id)) }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6 9 17l-5-5"></path>
                                  </svg>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-blue-300 font-medium text-sm sm:text-base">{bestWaitingAlgo.name}</h4>
                                <p className="text-blue-300/70 text-[10px] sm:text-xs">Best for minimizing waiting time ({results[bestWaitingAlgo.id].averageWaitingTime.toFixed(2)})</p>
                              </div>
                            </div>
                            
                            {bestTurnaroundAlgo.id !== bestWaitingAlgo.id && (
                              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-900/20 rounded-lg">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: getAlgorithmColor(ALGORITHMS.findIndex(a => a.id === bestTurnaroundAlgo.id)) }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 6 9 17l-5-5"></path>
                                    </svg>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-blue-300 font-medium text-sm sm:text-base">{bestTurnaroundAlgo.name}</h4>
                                  <p className="text-blue-300/70 text-[10px] sm:text-xs">Best for minimizing turnaround time ({results[bestTurnaroundAlgo.id].averageTurnaroundTime.toFixed(2)})</p>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
