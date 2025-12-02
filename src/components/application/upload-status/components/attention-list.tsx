"use client"

import { AlertTriangle } from "@untitledui/icons"

interface AttentionListProps {
  items: string[]
  show?: boolean
}

export function AttentionList({ items, show = true }: AttentionListProps) {
  if (!show || items.length === 0) return null
  
  return (
    <ul className="mt-5 flex flex-col gap-4">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <AlertTriangle aria-hidden="true" className="size-6 shrink-0 text-fg-warning-primary" />
          <div className="flex flex-col gap-0.5">
            <p className="text-md text-tertiary whitespace-pre-line">{item}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}







