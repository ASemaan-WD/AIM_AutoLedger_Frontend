"use client"

import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators"

interface CardProgressProps {
  value: number
  show?: boolean
}

export function CardProgress({ value, show = true }: CardProgressProps) {
  if (!show) return null
  
  return (
    <div className="mt-3">
      <ProgressBar 
        value={value} 
        labelPosition="right"
        className="h-2"
      />
    </div>
  )
}







