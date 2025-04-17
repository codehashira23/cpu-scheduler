"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface AlgorithmSelectorProps {
  selectedAlgorithm: string
  onAlgorithmChange: (algorithm: string) => void
  timeQuantum: number
  onTimeQuantumChange: (timeQuantum: number) => void
}

export default function AlgorithmSelector({
  selectedAlgorithm,
  onAlgorithmChange,
  timeQuantum,
  onTimeQuantumChange,
}: AlgorithmSelectorProps) {
  return (
    <div className="space-y-6">
      <RadioGroup value={selectedAlgorithm} onValueChange={onAlgorithmChange} className="space-y-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="fcfs" id="fcfs" />
          <Label htmlFor="fcfs" className="font-medium">
            First Come First Serve (FCFS)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sjf" id="sjf" />
          <Label htmlFor="sjf" className="font-medium">
            Shortest Job First (SJF)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="srtf" id="srtf" />
          <Label htmlFor="srtf" className="font-medium">
            Shortest Remaining Time First (SRTF)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="roundRobin" id="roundRobin" />
          <Label htmlFor="roundRobin" className="font-medium">
            Round Robin
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="priorityNonPreemptive" id="priorityNonPreemptive" />
          <Label htmlFor="priorityNonPreemptive" className="font-medium">
            Priority (Non-Preemptive)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="priorityPreemptive" id="priorityPreemptive" />
          <Label htmlFor="priorityPreemptive" className="font-medium">
            Priority (Preemptive)
          </Label>
        </div>
      </RadioGroup>

      {selectedAlgorithm === "roundRobin" && (
        <div className="space-y-3 pt-3 border-t">
          <Label htmlFor="timeQuantum" className="font-medium">
            Time Quantum: {timeQuantum}
          </Label>
          <div className="flex items-center space-x-4">
            <span>1</span>
            <Slider
              id="timeQuantum"
              min={1}
              max={10}
              step={1}
              value={[timeQuantum]}
              onValueChange={(value) => onTimeQuantumChange(value[0])}
              className="flex-1"
            />
            <span>10</span>
          </div>
        </div>
      )}
    </div>
  )
}
