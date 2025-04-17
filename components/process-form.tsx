"use client"
import type { Process } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"

interface ProcessFormProps {
  processes: Process[]
  onProcessesChange: (processes: Process[]) => void
  algorithm: string
}

export default function ProcessForm({ processes, onProcessesChange, algorithm }: ProcessFormProps) {
  const showPriority = algorithm.includes("priority")

  const handleInputChange = (id: number, field: keyof Process, value: string) => {
    const numValue = Number.parseInt(value)
    if (isNaN(numValue) && value !== "") return

    const updatedProcesses = processes.map((process) => {
      if (process.id === id) {
        return {
          ...process,
          [field]: value === "" ? "" : numValue,
        }
      }
      return process
    })

    onProcessesChange(updatedProcesses)
  }

  const addProcess = () => {
    const newId = processes.length > 0 ? Math.max(...processes.map((p) => p.id)) + 1 : 1
    const newProcess: Process = {
      id: newId,
      name: `P${newId}`,
      arrivalTime: 0,
      burstTime: 1,
      priority: 1,
    }
    onProcessesChange([...processes, newProcess])
  }

  const removeProcess = (id: number) => {
    if (processes.length <= 1) return
    onProcessesChange(processes.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Process</TableHead>
              <TableHead>Arrival Time</TableHead>
              <TableHead>Burst Time</TableHead>
              {showPriority && <TableHead>Priority</TableHead>}
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processes.map((process) => (
              <TableRow key={process.id}>
                <TableCell>{process.name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={process.arrivalTime}
                    onChange={(e) => handleInputChange(process.id, "arrivalTime", e.target.value)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={process.burstTime}
                    onChange={(e) => handleInputChange(process.id, "burstTime", e.target.value)}
                    className="w-24"
                  />
                </TableCell>
                {showPriority && (
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={process.priority}
                      onChange={(e) => handleInputChange(process.id, "priority", e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProcess(process.id)}
                    disabled={processes.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button onClick={addProcess} className="flex items-center gap-1">
        <Plus className="h-4 w-4" /> Add Process
      </Button>

      {showPriority && (
        <p className="text-sm text-muted-foreground mt-2">Note: Lower priority number means higher priority</p>
      )}
    </div>
  )
}
