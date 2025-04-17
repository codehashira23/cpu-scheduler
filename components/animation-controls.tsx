"use client"

import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

interface AnimationControlsProps {
  isAnimating: boolean
  onToggleAnimation: () => void
  onReset: () => void
  currentTime: number
  maxTime: number
  animationSpeed: number
  onSpeedChange: (speed: number) => void
}

export default function AnimationControls({
  isAnimating,
  onToggleAnimation,
  onReset,
  currentTime,
  maxTime,
  animationSpeed,
  onSpeedChange,
}: AnimationControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={onToggleAnimation} className="h-8 w-8">
            {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={onReset} className="h-8 w-8">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm">
          Time: {currentTime} / {maxTime}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Speed:</span>
          <div className="flex items-center space-x-1">
            <span className="text-xs">1x</span>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[animationSpeed]}
              onValueChange={(value) => onSpeedChange(value[0])}
              className="w-24"
            />
            <span className="text-xs">5x</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-emerald-600 h-2.5 rounded-full transition-all"
          style={{ width: `${(currentTime / maxTime) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}
