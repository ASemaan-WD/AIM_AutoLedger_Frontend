"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle, XCircle, AlertTriangle, File04, File06, Copy01, LinkBroken01, RefreshCw05, Mail01, ArrowRight } from "@untitledui/icons"
import { Button } from "@/components/base/buttons/button"
import { Badge } from "@/components/base/badges/badges"
import { 
  CardLayout,
  CardHeader, 
  CardProgress, 
  InvoiceDetails, 
  OriginalFileLink, 
  AttentionList, 
  CardActions,
  IssueDetailsTable
} from "./components"
import { DeleteFileModal, ExportWithIssuesModal, ContactVendorModal } from "./modals"
import { getProcessingStatusText, getProcessingProgress } from "@/lib/status-mapper"
import { createAirtableClient } from "@/lib/airtable/client"
import { openCrispChat } from "@/utils/crisp"

export type UploadStatus = 
  | "uploading" 
  | "queued"              // NEW: File uploaded, waiting for processing to start
  | "processing" 
  | "connecting" 
  | "success" 
  | "success-with-caveats"  // TODO: Review usage
  | "exported"
  | "error"
  | "duplicate"
  | "no-match"              // TODO: Review usage
  | "processing-error"      // TODO: Review usage

export interface DetailedIssue {
  type: 'price-variance' | 'unmatched-item' | 'quantity-mismatch' | 'missing-po'
  severity: 'warning' | 'error'
  lineNumber?: number
  lineReference?: string
  description: string
  impact: string
  details?: {
    invoiceValue?: string
    poValue?: string
    itemDescription?: string
    quantity?: number
  }
}

export interface UploadStatusCardProps {
  filename: string
  status: UploadStatus
  processingStatus?: 'UPL' | 'DETINV' | 'PARSE' | 'RELINV' | 'MATCHING' | 'MATCHED' | 'ERROR' // New prop
  errorCode?: string
  pageCount?: number
  fileSize?: number
  invoices?: Array<{
    vendor: string
    date: string
    daysAgo: number
    amount: string
    description: string
    invoiceNumber?: string
    recordId?: string // Airtable record ID for updating status
  }>
  issues?: string[]
  detailedIssues?: DetailedIssue[]
  analysisSummary?: string
  varianceInfo?: {
    amount: string
    direction: 'over' | 'under'
  }
  errorMessage?: string
  duplicateInfo?: {
    originalFilename: string
    uploadedDate: string
  }
  isExporting?: boolean
  onCancel?: () => void
  onExport?: () => void
  onRemove?: () => void
  onGetHelp?: () => void
  onViewFile?: () => void
  onReprocess?: () => void
  onContactVendor?: () => void
}

// Helper function to format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "0 KB"
  
  const suffixes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return Math.floor(bytes / Math.pow(1024, i)) + " " + suffixes[i]
}

export function UploadStatusCard({
  filename,
  status,
  processingStatus,
  errorCode,
  pageCount,
  fileSize,
  invoices,
  issues,
  detailedIssues,
  analysisSummary,
  varianceInfo,
  errorMessage,
  duplicateInfo,
  isExporting = false,
  onCancel,
  onExport,
  onRemove,
  onGetHelp,
  onViewFile,
  onReprocess,
  onContactVendor,
}: UploadStatusCardProps) {
  // Helper to get display title
  const getCardTitle = () => {
    if (!invoices || invoices.length === 0) return filename;
    if (invoices.length === 1) return `Invoice by ${invoices[0].vendor}`;
    return `${invoices.length} Invoices`;
  };
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showContactVendorModal, setShowContactVendorModal] = useState(false)
  
  // Export state management
  const [exportState, setExportState] = useState<'idle' | 'queued' | 'exported' | 'error'>('idle')
  const [exportError, setExportError] = useState<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [])

  const handleRemoveClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    onRemove?.()
  }

  const handleExportClick = async () => {
    if (status === "success-with-caveats" && issues && issues.length > 0) {
      setShowExportModal(true)
    } else {
      await initiateExport()
    }
  }

  const handleExportConfirm = async () => {
    await initiateExport()
  }

  const initiateExport = async () => {
    // Set invoice status to "Queued" for export
    await setInvoiceStatusToQueued()
    
    // Set export state to queued and start polling
    setExportState('queued')
    setExportError(null)
    startExportPolling()
    
    onExport?.()
  }

  const setInvoiceStatusToQueued = async () => {
    if (!invoices || invoices.length === 0) {
      console.warn('⚠️ No invoices to export')
      return
    }

    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID
    if (!baseId) {
      console.error('VITE_AIRTABLE_BASE_ID not configured')
      return
    }

    try {
      const client = createAirtableClient(baseId)
      
      // Update all invoices to "Queued" status for export
      const updates = invoices
        .filter(invoice => invoice.recordId) // Only update if we have recordId
        .map(invoice => ({
          id: invoice.recordId!,
          fields: {
            'Status': 'Queued'
          }
        }))

      if (updates.length > 0) {
        await client.updateRecords('Invoices', { records: updates })
        console.log(`✅ Set ${updates.length} invoice(s) to Queued status`)
      } else {
        console.warn('⚠️ No invoice record IDs available for status update')
      }
    } catch (error) {
      console.error('❌ Failed to set invoice status to Queued:', error)
    }
  }

  const startExportPolling = () => {
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID
    if (!baseId) {
      console.error('VITE_AIRTABLE_BASE_ID not configured')
      return
    }

    const pollInvoiceStatus = async () => {
      if (!invoices || invoices.length === 0) return

      try {
        const client = createAirtableClient(baseId)
        let allExported = true
        let hasError = false
        let errorCode: string | null = null

        // Check status of all invoices
        for (const invoice of invoices) {
          if (!invoice.recordId) continue

          const record = await client.getRecord('Invoices', invoice.recordId)
          if (record && record.fields) {
            const invoiceStatus = record.fields['Status'] as string
            const invoiceErrorCode = record.fields['ErrorCode'] as string

            console.log(`📊 [Export Polling] Invoice ${invoice.recordId}: ${invoiceStatus}`)

            if (invoiceStatus === 'Error') {
              hasError = true
              errorCode = invoiceErrorCode || 'Unknown error'
              allExported = false
            } else if (invoiceStatus !== 'Exported') {
              allExported = false
            }
          }
        }

        // Update export state based on results
        if (hasError) {
          setExportState('error')
          setExportError(errorCode)
          stopExportPolling()
          console.log('❌ [Export Polling] Export failed with error:', errorCode)
        } else if (allExported) {
          setExportState('exported')
          stopExportPolling()
          console.log('✅ [Export Polling] All invoices exported successfully')
        }
      } catch (error) {
        console.error('❌ [Export Polling] Error checking invoice status:', error)
      }
    }

    // Poll immediately, then every 3 seconds
    pollInvoiceStatus()
    const interval = setInterval(pollInvoiceStatus, 3000)
    pollingIntervalRef.current = interval
  }

  const stopExportPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      console.log('🛑 [Export Polling] Stopped polling')
    }
  }


  const handleViewFile = () => {
    if (onViewFile) {
      onViewFile()
    } else {
      // Open empty tab for now
      window.open("", "_blank")
    }
  }

  // Render modals at the end of the component
  const renderModals = () => (
    <>
      {showDeleteModal && (
        <DeleteFileModal
          isOpen={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          filename={filename}
          onConfirm={handleDeleteConfirm}
        />
      )}
      
      {showExportModal && issues && (
        <ExportWithIssuesModal
          isOpen={showExportModal}
          onOpenChange={setShowExportModal}
          issues={issues}
          onConfirm={handleExportConfirm}
        />
      )}

      {showContactVendorModal && invoices && invoices.length > 0 && (
        <ContactVendorModal
          isOpen={showContactVendorModal}
          onOpenChange={setShowContactVendorModal}
          vendorName={invoices[0].vendor}
          issues={issues || []}
          invoiceInfo={{
            invoiceNumber: invoices[0].invoiceNumber,
            date: invoices[0].date,
            amount: invoices[0].amount,
          }}
        />
      )}
    </>
  )
  // Uploading State
  if (status === "uploading") {
    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
        <CardLayout icon={File04} iconColor="brand">
          <CardHeader
            title={filename}
            badgeText="Uploading"
            badgeColor="gray-blue"
            helperText={formatFileSize(fileSize)}
            showCancelButton
            onCancel={onCancel}
          />
          <CardProgress value={0} />
        </CardLayout>
      </div>
    )
  }

  // Queued State - File uploaded, waiting for processing to start
  if (status === "queued") {
    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
        <CardLayout icon={File04} iconColor="brand">
          <CardHeader
            title={filename}
            badgeText="Processing"
            badgeColor="gray-blue"
            helperText={`Attempting to extract text from ${pageCount || '...'} pages...`}
            showCancelButton
            onCancel={onCancel}
          />
          <CardProgress value={getProcessingProgress(processingStatus)} />
        </CardLayout>
      </div>
    )
  }

  // Processing State
  if (status === "processing") {
    const helperText = processingStatus 
      ? getProcessingStatusText(processingStatus)
      : pageCount 
        ? `Extracting text from ${pageCount} pages...`
        : 'Processing...';
    
    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
        <CardLayout icon={File04} iconColor="brand">
          <CardHeader
            title={getCardTitle()}
            badgeText="Processing"
            badgeColor="gray-blue"
            helperText={helperText}
            showCancelButton
            onCancel={onCancel}
          />
          
          {/* Show all invoice details if available during processing */}
          {invoices && invoices.map((invoice, index) => (
            <div key={index} className={index > 0 ? "mt-4" : ""}>
              <InvoiceDetails
                description={invoice.description}
                date={invoice.date}
                amount={invoice.amount}
              />
            </div>
          ))}
          
          <CardProgress value={getProcessingProgress(processingStatus)} />
        </CardLayout>
        
        {/* Show original file link if we have invoices */}
        {invoices && invoices.length > 0 && (
          <OriginalFileLink
            filename={filename}
            onClick={onViewFile}
          />
        )}
      </div>
    )
  }

  // Connecting/Analyzing State
  if (status === "connecting") {
    const invoice = invoices?.[0]
    
    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl shadow-xs overflow-hidden">
        {/* Header Section */}
        <div className="px-4 py-5 sm:p-6">
          {/* Status Badge - Prominent at top */}
          <div className="mb-4">
            <Badge size="md" color="gray-blue" type="color">
              Matching
            </Badge>
          </div>
          
          {/* Top Row: Vendor + Amount */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-primary">
                {invoice?.vendor || getCardTitle()}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-tertiary">
                <span>{invoice?.date}</span>
                {invoice?.description && (
                  <>
                    <span className="text-quaternary">|</span>
                    <span className="truncate">{invoice.description}</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Amount */}
            <div className="text-right flex-shrink-0">
              <div className="text-xl font-semibold text-primary">
                {invoice?.amount}
              </div>
            </div>
          </div>
          
          {/* Processing Status */}
          <div className="mt-4 pt-4 border-t border-secondary">
            <p className="text-sm text-tertiary">
              {getProcessingStatusText(processingStatus) || "Connecting to AIM to match POs..."}
            </p>
          </div>
          
          <CardProgress value={getProcessingProgress(processingStatus)} />
        </div>
        
        {/* Footer Section */}
        <div className="border-t border-secondary px-4 py-4 sm:px-6 flex items-center justify-between gap-4">
          {/* File Link */}
          <button 
            className="flex items-center gap-2 text-sm text-tertiary hover:text-secondary transition-colors min-w-0"
            onClick={onViewFile}
          >
            <File04 className="size-4 text-quaternary flex-shrink-0" />
            <span className="truncate">{filename}</span>
          </button>
          
          {/* Cancel Button */}
          <Button 
            size="md" 
            color="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  // Success State
  if (status === "success") {
    const invoice = invoices?.[0]
    
    return (
      <>
        <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl shadow-xs overflow-hidden">
          {/* Header Section */}
          <div className="px-4 py-5 sm:p-6">
            {/* Status Badge - Prominent at top */}
            <div className="mb-4">
              <Badge size="md" color="success" type="color">
                Complete
              </Badge>
            </div>
            
            {/* Top Row: Vendor + Amount */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-primary">
                  {invoice?.vendor || getCardTitle()}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-tertiary">
                  <span>{invoice?.date}</span>
                  {invoice?.description && (
                    <>
                      <span className="text-quaternary">|</span>
                      <span className="truncate">{invoice.description}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <div className="text-xl font-semibold text-primary">
                  {invoice?.amount}
                </div>
              </div>
            </div>
            
            {/* Success Message */}
            <div className="mt-4 pt-4 border-t border-secondary">
              <p className="text-sm text-success-600 font-medium">
                ✓ Everything checks out
              </p>
            </div>
          </div>
          
          {/* Footer Section */}
          <div className="border-t border-secondary px-4 py-4 sm:px-6 flex items-center justify-between gap-4">
            {/* File Link */}
            <button 
              className="flex items-center gap-2 text-sm text-tertiary hover:text-secondary transition-colors min-w-0"
              onClick={handleViewFile}
            >
              <File04 className="size-4 text-quaternary flex-shrink-0" />
              <span className="truncate">{filename}</span>
            </button>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {exportState === 'idle' && (
                <Button 
                  size="md" 
                  color="primary"
                  iconTrailing={ArrowRight}
                  onClick={handleExportClick}
                  isLoading={isExporting}
                >
                  Export
                </Button>
              )}
              
              {exportState === 'queued' && (
                <Button 
                  size="md" 
                  color="secondary"
                  isDisabled
                  iconLeading={RefreshCw05}
                >
                  Queued
                </Button>
              )}
              
              {exportState === 'exported' && (
                <div className="flex items-center gap-2 text-success-primary">
                  <CheckCircle className="size-5" />
                  <span className="text-sm font-semibold">Export Successful</span>
                </div>
              )}
              
              {exportState === 'error' && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-error-primary">
                    <AlertTriangle className="size-5" />
                    <span className="text-sm font-medium">{exportError || 'Export failed'}</span>
                  </div>
                  <Button
                    size="md"
                    color="secondary-destructive"
                    onClick={handleExportClick}
                  >
                    Retry Export
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        {renderModals()}
      </>
    )
  }

  // Success with Caveats State
  // TODO: Review usage - may need to be updated for new backend flow
  if (status === "success-with-caveats" && (issues || detailedIssues)) {
    const invoice = invoices?.[0]
    
    return (
      <>
        <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl shadow-xs overflow-hidden">
          {/* Header Section */}
          <div className="px-4 py-5 sm:p-6">
            {/* Status Badge - Prominent at top */}
            <div className="mb-4">
              <Badge size="md" color="warning" type="color">
                Needs Review
              </Badge>
            </div>
            
            {/* Top Row: Vendor + Amount */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-primary">
                  {invoice?.vendor || getCardTitle()}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-tertiary">
                  <span>{invoice?.date}</span>
                  {invoice?.description && (
                    <>
                      <span className="text-quaternary">|</span>
                      <span className="truncate">{invoice.description}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Amount + Variance */}
              <div className="text-right flex-shrink-0">
                <div className="text-xl font-semibold text-primary">
                  {invoice?.amount}
                </div>
                {varianceInfo && (
                  <div className={`text-sm font-medium ${
                    varianceInfo.direction === 'over' ? 'text-utility-warning-700' : 'text-success-600'
                  }`}>
                    {varianceInfo.direction === 'over' ? '+' : '-'}{varianceInfo.amount} {varianceInfo.direction} PO
                  </div>
                )}
              </div>
            </div>
            
            {/* Analysis Summary */}
            {analysisSummary && (
              <div className="mt-5 border-l-4 border-utility-warning-500 bg-utility-warning-50 rounded-r-lg px-4 py-3">
                <div className="text-xs font-semibold text-utility-warning-700 uppercase tracking-wider mb-1.5">
                  Analysis Summary
                </div>
                <p className="text-sm text-secondary leading-relaxed">
                  {analysisSummary}
                </p>
              </div>
            )}
            
            {/* Issue Details Table */}
            {detailedIssues && detailedIssues.length > 0 ? (
              <IssueDetailsTable issues={detailedIssues} />
            ) : issues && (
              <AttentionList items={issues} />
            )}
          </div>
          
          {/* Footer Section */}
          <div className="border-t border-secondary px-4 py-4 sm:px-6 flex items-center justify-between gap-4">
            {/* File Link */}
            <button 
              className="flex items-center gap-2 text-sm text-tertiary hover:text-secondary transition-colors min-w-0"
              onClick={handleViewFile}
            >
              <File04 className="size-4 text-quaternary flex-shrink-0" />
              <span className="truncate">{filename}</span>
            </button>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {exportState === 'idle' && (
                <>
                  <Button 
                    size="md" 
                    color="secondary"
                    iconLeading={Mail01}
                    onClick={() => setShowContactVendorModal(true)}
                  >
                    Contact
                  </Button>
                  <Button 
                    size="md" 
                    color="secondary"
                    iconLeading={RefreshCw05}
                    onClick={() => openCrispChat(`I'd like to request a reprocess for file "${filename}". The problem is [enter details here]`)}
                  >
                    Reprocess
                  </Button>
                  <Button 
                    size="md" 
                    color="primary"
                    iconTrailing={ArrowRight}
                    onClick={handleExportClick}
                    isLoading={isExporting}
                  >
                    Export
                  </Button>
                </>
              )}
              
              {exportState === 'queued' && (
                <Button 
                  size="md" 
                  color="secondary"
                  isDisabled
                  iconLeading={RefreshCw05}
                >
                  Queued
                </Button>
              )}
              
              {exportState === 'exported' && (
                <div className="flex items-center gap-2 text-success-primary">
                  <CheckCircle className="size-5" />
                  <span className="text-sm font-semibold">Export Successful</span>
                </div>
              )}
              
              {exportState === 'error' && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-error-primary">
                    <AlertTriangle className="size-5" />
                    <span className="text-sm font-medium">{exportError || 'Export failed'}</span>
                  </div>
                  <Button
                    size="md"
                    color="secondary-destructive"
                    onClick={initiateExport}
                  >
                    Retry Export
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        {renderModals()}
      </>
    )
  }

  // Exported State
  if (status === "exported") {
    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
        <CardLayout icon={CheckCircle} iconColor="success">
          <CardHeader
            title={getCardTitle()}
            badgeText="Exported"
            badgeColor="success"
            helperText="Successfully exported to AIM"
          />
          
          {/* Show all invoice details */}
          {invoices && invoices.map((invoice, index) => (
            <div key={index} className={index > 0 ? "mt-4" : ""}>
              <InvoiceDetails
                description={invoice.description}
                date={invoice.date}
                amount={invoice.amount}
              />
            </div>
          ))}
        </CardLayout>
        
        <OriginalFileLink
          filename={filename}
          onClick={handleViewFile}
        />
      </div>
    )
  }

  // Processing Error State (prior to OCR - no data available)
  // TODO: Review usage - may need to be updated or removed for new backend flow
  if (status === "processing-error") {
    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
        <CardLayout icon={XCircle} iconColor="error">
          <CardHeader
            title={filename}
            badgeText="Error Occurred"
            badgeColor="error"
            helperText={errorMessage || "Unable to process this file"}
          />
        </CardLayout>
        
        <OriginalFileLink
          filename={filename}
          onClick={handleViewFile}
        />
        
        <CardActions
          type="error"
          onPrimaryAction={onRemove}
          onSecondaryAction={onGetHelp}
        />
      </div>
    )
  }

  // Duplicate File State
  if (status === "duplicate") {
    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
        <CardLayout icon={Copy01} iconColor="error">
          <CardHeader
            title={getCardTitle()}
            badgeText="Duplicate"
            badgeColor="error"
            helperText={
              duplicateInfo
                ? `Already uploaded as "${duplicateInfo.originalFilename}" on ${duplicateInfo.uploadedDate}`
                : "This file has already been uploaded"
            }
          />
          
          {/* Show all invoice details */}
          {invoices && invoices.map((invoice, index) => (
            <div key={index} className={index > 0 ? "mt-4" : ""}>
              <InvoiceDetails
                description={invoice.description}
                date={invoice.date}
                amount={invoice.amount}
              />
            </div>
          ))}
        </CardLayout>
        
        <OriginalFileLink
          filename={filename}
          onClick={handleViewFile}
        />
        
        <CardActions
          type="error"
          onPrimaryAction={onRemove}
          onSecondaryAction={onGetHelp}
        />
      </div>
    )
  }

  // Could Not Match State
  // TODO: Review usage - backend now handles matching automatically, may need different handling
  if (status === "no-match") {
    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
        <CardLayout icon={LinkBroken01} iconColor="error">
          <CardHeader
            title={getCardTitle()}
            badgeText="No Match"
            badgeColor="error"
            helperText="Could not find matching PO in AIM"
          />
          
          {/* Show all invoice details */}
          {invoices && invoices.map((invoice, index) => (
            <div key={index} className={index > 0 ? "mt-4" : ""}>
              <InvoiceDetails
                description={invoice.description}
                date={invoice.date}
                amount={invoice.amount}
              />
            </div>
          ))}
        </CardLayout>
        
        <OriginalFileLink
          filename={filename}
          onClick={handleViewFile}
        />
        
        <CardActions
          type="error"
          onPrimaryAction={onRemove}
          onSecondaryAction={onGetHelp}
        />
      </div>
    )
  }

  // Generic Error State (kept for backward compatibility)
  if (status === "error") {
    // Special handling for Attention/Error case
    if (processingStatus === 'ERROR' && errorCode) {
      return (
        <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
          <CardLayout icon={XCircle} iconColor="error">
            <CardHeader
              title={filename}
              badgeText={errorCode}
              badgeColor="error"
              helperText={errorMessage || "An error occurred during processing"}
            />
          </CardLayout>
          
          <OriginalFileLink
            filename={filename}
            onClick={handleViewFile}
          />
          
          <CardActions
            type="error"
            onPrimaryAction={onRemove}
            onSecondaryAction={onGetHelp}
          />
        </div>
      )
    }

    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
        <CardLayout icon={XCircle} iconColor="error">
          <CardHeader
            title={filename}
            badgeText="Error Occurred"
            badgeColor="error"
            helperText={errorMessage}
          />
        </CardLayout>
        
        <OriginalFileLink
          filename={filename}
          onClick={handleViewFile}
        />
        
        <CardActions
          type="error"
          onPrimaryAction={onRemove}
          onSecondaryAction={onGetHelp}
        />
      </div>
    )
  }

  return null
}
