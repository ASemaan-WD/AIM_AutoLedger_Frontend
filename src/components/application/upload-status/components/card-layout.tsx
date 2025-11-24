"use client"

import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon"
import type { ComponentType, ReactNode } from "react"

type IconColor = "brand" | "success" | "warning" | "error"

interface CardLayoutProps {
  icon: ComponentType<{ className?: string }>
  iconColor: IconColor
  children: ReactNode
}

export function CardLayout({ icon, iconColor, children }: CardLayoutProps) {
  return (
    <div className="flex items-start gap-4">
      <FeaturedIcon 
        icon={icon}
        size="md"
        color={iconColor}
        theme="light"
        className="flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0 flex flex-col">
        {children}
      </div>
    </div>
  )
}







