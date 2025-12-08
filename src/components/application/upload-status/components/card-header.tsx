"use client"

import { Badge } from "@/components/base/badges/badges"
import { Button } from "@/components/base/buttons/button"
import { Trash01, XClose } from "@untitledui/icons"

type BadgeColor = "gray-blue" | "success" | "warning" | "error"

interface CardHeaderProps {
  title: string
  badgeText: string
  badgeColor: BadgeColor
  helperText?: string
  showCancelButton?: boolean
  showDeleteButton?: boolean
  onCancel?: () => void
  onDelete?: () => void
}

export function CardHeader({
  title,
  badgeText,
  badgeColor,
  helperText,
  showCancelButton = false,
  showDeleteButton = false,
  onCancel,
  onDelete,
}: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="text-md font-semibold text-primary truncate">{title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Badge size="sm" color={badgeColor} type="color">
            {badgeText}
          </Badge>
          {helperText && (
            <span className="text-sm text-tertiary">{helperText}</span>
          )}
        </div>
      </div>
      {showCancelButton && onCancel && (
        <Button 
          size="sm"
          color="tertiary"
          iconLeading={Trash01}
          className="flex-shrink-0 -mt-1 -mr-2"
          aria-label="Cancel"
          onClick={onCancel}
        />
      )}
      {showDeleteButton && onDelete && (
        <Button 
          size="sm"
          color="tertiary"
          iconLeading={XClose}
          className="flex-shrink-0 -mt-1 -mr-2"
          aria-label="Clear"
          onClick={onDelete}
        />
      )}
    </div>
  )
}

