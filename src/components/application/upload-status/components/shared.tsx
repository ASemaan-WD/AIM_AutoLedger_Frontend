"use client"

import type { ReactNode } from "react"
import { Badge } from "@/components/base/badges/badges"
import { LinkExternal01 } from "@untitledui/icons"

// =============================================================================
// TYPES
// =============================================================================

type BadgeColor = "gray-blue" | "brand" | "success" | "warning" | "error"

export interface Invoice {
  vendor: string
  date: string
  daysAgo: number
  amount: string
  description: string
  invoiceNumber?: string
  recordId?: string
}

// =============================================================================
// CARD CONTAINER
// Wrapper component for all card states
// =============================================================================

interface CardContainerProps {
  children: ReactNode
  /** Enable animated gradient border for active/processing states */
  animated?: boolean
}

export function CardContainer({ children, animated = false }: CardContainerProps) {
  return (
    <div 
      className={`bg-primary rounded-xl shadow-xs overflow-hidden ${
        animated 
          ? 'animated-gradient-border' 
          : 'ring-1 ring-inset ring-secondary'
      }`}
    >
      {children}
    </div>
  )
}

// =============================================================================
// CARD HEADER SECTION
// Contains badge and content area
// =============================================================================

interface CardHeaderSectionProps {
  children: ReactNode
}

export function CardHeaderSection({ children }: CardHeaderSectionProps) {
  return (
    <div className="px-4 py-5 sm:p-6">
      {children}
    </div>
  )
}

// =============================================================================
// STATUS BADGE
// Badge displayed at top of card
// =============================================================================

interface StatusBadgeProps {
  color: BadgeColor
  children: ReactNode
}

export function StatusBadge({ color, children }: StatusBadgeProps) {
  return (
    <div className="mb-4">
      <Badge size="md" color={color} type="color">
        {children}
      </Badge>
    </div>
  )
}

// =============================================================================
// INVOICE HEADER
// Displays vendor name, date, description, and amount
// =============================================================================

interface InvoiceHeaderProps {
  title: string
  /** Invoice number to display next to the title */
  invoiceNumber?: string
  subtitle?: string
  description?: string
  amount?: string
  /** File metadata to display under the title (e.g., file size and page count) */
  fileMetadata?: {
    fileSize?: string
    pageCount?: number
  }
  varianceInfo?: {
    amount: string
    direction: 'over' | 'under'
  }
}

export function InvoiceHeader({ title, invoiceNumber, subtitle, description, amount, fileMetadata, varianceInfo }: InvoiceHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-primary">
            {title}
          </h3>
          {invoiceNumber && (
            <span className="text-sm font-medium text-tertiary bg-secondary px-2 py-0.5 rounded">
              {invoiceNumber}
            </span>
          )}
        </div>
        {/* File metadata: file size and page count */}
        {fileMetadata && (fileMetadata.fileSize || fileMetadata.pageCount) && (
          <p className="mt-1 text-sm text-tertiary">
            {fileMetadata.fileSize}
            {fileMetadata.fileSize && fileMetadata.pageCount && ' • '}
            {fileMetadata.pageCount && `${fileMetadata.pageCount} ${fileMetadata.pageCount === 1 ? 'page' : 'pages'}`}
          </p>
        )}
        {/* Subtitle and description (for invoice context) */}
        {(subtitle || description) && (
          <div className="flex items-center gap-2 mt-1 text-sm text-tertiary flex-nowrap">
            {subtitle && <span className="whitespace-nowrap flex-shrink-0">{subtitle}</span>}
            {subtitle && description && <span className="text-quaternary flex-shrink-0"> • </span>}
            {description && <span className="truncate min-w-0">{description}</span>}
          </div>
        )}
      </div>
      
      {amount && (
        <div className="text-right flex-shrink-0">
          <div className="text-xl font-semibold text-primary">
            {amount}
          </div>
          {varianceInfo && (
            <div className={`text-sm font-medium ${
              varianceInfo.direction === 'over' ? 'text-utility-warning-700' : 'text-success-600'
            }`}>
              {varianceInfo.direction === 'over' ? '+' : '-'}{varianceInfo.amount} {varianceInfo.direction} PO
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// STATUS MESSAGE
// Message displayed below invoice header (processing status, success message, error)
// =============================================================================

interface StatusMessageProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'error' | 'brand'
}

export function StatusMessage({ children, variant = 'default' }: StatusMessageProps) {
  const colorClasses = {
    default: 'text-tertiary',
    success: 'text-success-600 font-medium',
    error: 'text-error-600',
    brand: 'text-brand-600 font-medium',
  }
  
  return (
    <div className="mt-4 pt-4 border-t border-secondary">
      <p className={`text-sm ${colorClasses[variant]}`}>
        {children}
      </p>
    </div>
  )
}

// =============================================================================
// CARD FOOTER
// Footer container for file link and action buttons
// =============================================================================

interface CardFooterProps {
  children: ReactNode
}

export function CardFooter({ children }: CardFooterProps) {
  return (
    <div className="border-t border-secondary px-4 py-4 sm:px-6 flex items-center justify-between gap-4">
      {children}
    </div>
  )
}

// =============================================================================
// FILE LINK
// Clickable link to view the original file
// =============================================================================

interface FileLinkProps {
  filename: string
  onClick?: () => void
}

export function FileLink({ filename, onClick }: FileLinkProps) {
  return (
    <button 
      className="flex items-center gap-1.5 text-xs text-tertiary hover:text-secondary transition-colors min-w-0 group"
      onClick={onClick}
    >
      <span className="truncate">{filename}</span>
      <LinkExternal01 className="size-3.5 text-quaternary flex-shrink-0 group-hover:text-tertiary transition-colors" />
    </button>
  )
}

// =============================================================================
// ACTION BUTTONS CONTAINER
// Container for action buttons in footer
// =============================================================================

interface ActionButtonsProps {
  children: ReactNode
}

export function ActionButtons({ children }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      {children}
    </div>
  )
}

