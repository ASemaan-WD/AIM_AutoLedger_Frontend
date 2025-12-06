"use client"

import type { FC, ReactNode } from "react"
import { Upload02, Trash01, HelpCircle } from "@untitledui/icons"
import { Button } from "@/components/base/buttons/button"

type ActionType = "success" | "error" | "warning"

// Wrapper to render icons at smaller size (16px instead of default 20px)
const SmallIcon = ({ Icon }: { Icon: FC<{ className?: string }> }): ReactNode => (
  <Icon data-icon className="!size-4" />
)

interface SecondaryButton {
  label: string
  onClick: () => void
  icon?: FC<{ className?: string }>
}

interface CardActionsProps {
  type: ActionType
  show?: boolean
  isLoading?: boolean
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
  primaryLabel?: string
  secondaryLabel?: string
  /** Icon for the primary button */
  primaryIcon?: FC<{ className?: string }>
  /** Icon for the secondary button */
  secondaryIcon?: FC<{ className?: string }>
  /** Additional secondary buttons to display */
  additionalButtons?: SecondaryButton[]
}

export function CardActions({ 
  type, 
  show = true,
  isLoading = false,
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel,
  secondaryLabel,
  primaryIcon,
  secondaryIcon,
  additionalButtons,
}: CardActionsProps) {
  if (!show) return null
  
  const getPrimaryConfig = () => {
    if (type === "error") {
      return {
        color: "primary-destructive" as const,
        label: primaryLabel || "Remove",
        Icon: primaryIcon ?? Trash01,
      }
    }
    return {
      color: "primary" as const,
      label: primaryLabel || "Export to AIM",
      Icon: primaryIcon ?? Upload02,
    }
  }
  
  const getSecondaryConfig = () => {
    if (type === "error") {
      return {
        label: secondaryLabel || "Get help",
        Icon: secondaryIcon ?? HelpCircle,
      }
    }
    return {
      label: secondaryLabel || "Cancel",
      Icon: secondaryIcon,
    }
  }
  
  const primary = getPrimaryConfig()
  const secondary = getSecondaryConfig()
  
  return (
    <div className="flex flex-wrap gap-3 mt-5">
      <Button 
        size="md" 
        color={primary.color}
        onClick={onPrimaryAction}
        isLoading={isLoading}
        iconLeading={primary.Icon ? <SmallIcon Icon={primary.Icon} /> : undefined}
      >
        {primary.label}
      </Button>
      {onSecondaryAction && (
        <Button 
          size="md" 
          color="secondary"
          onClick={onSecondaryAction}
          iconLeading={secondary.Icon ? <SmallIcon Icon={secondary.Icon} /> : undefined}
        >
          {secondary.label}
        </Button>
      )}
      {additionalButtons?.map((button, index) => (
        <Button 
          key={index}
          size="md" 
          color="secondary"
          onClick={button.onClick}
          iconLeading={button.icon ? <SmallIcon Icon={button.icon} /> : undefined}
        >
          {button.label}
        </Button>
      ))}
    </div>
  )
}

