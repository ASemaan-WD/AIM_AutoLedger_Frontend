"use client"

import { Button } from "@/components/base/buttons/button"

type ActionType = "success" | "error"

interface CardActionsProps {
  type: ActionType
  show?: boolean
  isLoading?: boolean
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
  primaryLabel?: string
  secondaryLabel?: string
}

export function CardActions({ 
  type, 
  show = true,
  isLoading = false,
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel,
  secondaryLabel,
}: CardActionsProps) {
  if (!show) return null
  
  const getPrimaryConfig = () => {
    if (type === "error") {
      return {
        color: "primary-destructive" as const,
        label: primaryLabel || "Remove",
      }
    }
    return {
      color: "primary" as const,
      label: primaryLabel || "Export to AIM",
    }
  }
  
  const getSecondaryConfig = () => {
    if (type === "error") {
      return {
        label: secondaryLabel || "Get help",
      }
    }
    return {
      label: secondaryLabel || "Cancel",
    }
  }
  
  const primary = getPrimaryConfig()
  const secondary = getSecondaryConfig()
  
  return (
    <div className="flex gap-3 mt-5">
      <Button 
        size="md" 
        color={primary.color}
        onClick={onPrimaryAction}
        isLoading={isLoading}
      >
        {primary.label}
      </Button>
      {onSecondaryAction && (
        <Button 
          size="md" 
          color="secondary"
          onClick={onSecondaryAction}
        >
          {secondary.label}
        </Button>
      )}
    </div>
  )
}

