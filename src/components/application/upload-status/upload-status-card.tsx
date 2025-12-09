"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle, XCircle, AlertTriangle, File04, File06, Copy01, LinkBroken01, RefreshCw05, Mail01, ArrowRight, LinkExternal01, DotsVertical, Trash01, HelpCircle, XClose } from "@untitledui/icons"
import { Button } from "@/components/base/buttons/button"
import { Badge } from "@/components/base/badges/badges"
import { 
  CardProgress, 
  AttentionList, 
  IssueDetailsTable,
  CardContainer,
  CardHeaderSection,
  StatusBadge,
  InvoiceHeader,
  StatusMessage,
  CardFooter,
  FileLink,
  ActionButtons
} from "./components"
import { DeleteFileModal, ExportWithIssuesModal, ContactVendorModal, CancelFileModal } from "./modals"
import { Dropdown } from "@/components/base/dropdown/dropdown"
import { getProcessingStatusText, getProcessingProgress, getResultStatusText } from "@/lib/status-mapper"
import { createAirtableClient } from "@/lib/airtable/client"
import { openCrispChat } from "@/utils/crisp"

// =============================================================================
// TYPES
// =============================================================================

export type UploadStatus = 
  | "uploading" 
  | "queued"
  | "processing" 
  | "connecting" 
  | "success" 
  | "success-with-caveats"
  | "exported"
  | "error"
  | "duplicate"
  | "no-match"
  | "processing-error"

export interface DetailedIssue {
  type: 'price-variance' | 'unmatched-item' | 'quantity-mismatch' | 'missing-po'
  severity: 'warning' | 'error'
  lineNumber?: number
  lineReference?: string
  itemNumber?: string
  description: string
  impact: string
  dollarImpact?: string
  details?: {
    invoiceValue?: string
    poValue?: string
    itemDescription?: string
    quantity?: number
    /** Unit price for quantity mismatch issues (to show alongside quantity comparison) */
    unitPrice?: string
  }
}

export interface UploadStatusCardProps {
  filename: string
  status: UploadStatus
  processingStatus?: 'UPL' | 'DETINV' | 'PARSE' | 'RELINV' | 'MATCHING' | 'MATCHED' | 'ERROR'
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
    recordId?: string
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

// =============================================================================
// HELPERS
// =============================================================================

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "0 KB"
  const suffixes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.floor(bytes / Math.pow(1024, i)) + " " + suffixes[i]
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

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
  
  // Get first invoice for display
  const invoice = invoices?.[0]
  
  // Helper to get display title
  const getCardTitle = () => {
    if (!invoices || invoices.length === 0) return filename
    if (invoices.length === 1) return invoices[0].vendor
    return `${invoices.length} Invoices`
  }

  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showContactVendorModal, setShowContactVendorModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [exportState, setExportState] = useState<'idle' | 'queued' | 'exported' | 'error'>('idle')
  const [exportError, setExportError] = useState<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [])

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleViewFile = () => {
    if (onViewFile) {
      onViewFile()
    } else {
      window.open("", "_blank")
    }
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
    await setInvoiceStatusToQueued()
    setExportState('queued')
    setExportError(null)
    startExportPolling()
    onExport?.()
  }

  const setInvoiceStatusToQueued = async () => {
    if (!invoices || invoices.length === 0) return

    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID
    if (!baseId) return

    try {
      const client = createAirtableClient(baseId)
      const updates = invoices
        .filter(inv => inv.recordId)
        .map(inv => ({ id: inv.recordId!, fields: { 'Status': 'Queued' } }))

      if (updates.length > 0) {
        await client.updateRecords('Invoices', { records: updates })
      }
    } catch (error) {
      console.error('Failed to set invoice status:', error)
    }
  }

  const startExportPolling = () => {
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID
    if (!baseId || !invoices?.length) return

    const pollInvoiceStatus = async () => {
      try {
        const client = createAirtableClient(baseId)
        let allExported = true
        let hasError = false
        let errorCode: string | null = null

        for (const inv of invoices) {
          if (!inv.recordId) continue
          const record = await client.getRecord('Invoices', inv.recordId)
          if (record?.fields) {
            const invStatus = record.fields['Status'] as string
            if (invStatus === 'Error') {
              hasError = true
              errorCode = (record.fields['ErrorCode'] as string) || 'Unknown error'
            } else if (invStatus !== 'Exported') {
              allExported = false
            }
          }
        }

        if (hasError) {
          setExportState('error')
          setExportError(errorCode)
          stopExportPolling()
        } else if (allExported) {
          setExportState('exported')
          stopExportPolling()
        }
      } catch (error) {
        console.error('Export polling error:', error)
      }
    }

    pollInvoiceStatus()
    pollingIntervalRef.current = setInterval(pollInvoiceStatus, 3000)
  }

  const stopExportPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  // =============================================================================
  // SHARED RENDER HELPERS
  // =============================================================================

  // Determine if we have invoice data (for modal text)
  const hasInvoiceData = invoices && invoices.length > 0

  const renderModals = () => (
    <>
      {showDeleteModal && (
        <DeleteFileModal
          isOpen={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          filename={filename}
          onConfirm={() => onRemove?.()}
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
      {showContactVendorModal && invoice && (
        <ContactVendorModal
          isOpen={showContactVendorModal}
          onOpenChange={setShowContactVendorModal}
          vendorName={invoice.vendor}
          issues={issues || []}
          invoiceInfo={{
            invoiceNumber: invoice.invoiceNumber,
            date: invoice.date,
            amount: invoice.amount,
          }}
        />
      )}
      {showCancelModal && (
        <CancelFileModal
          isOpen={showCancelModal}
          onOpenChange={setShowCancelModal}
          filename={invoice?.vendor || filename}
          isInvoice={hasInvoiceData}
          onConfirm={() => onCancel?.()}
        />
      )}
    </>
  )

  /** Renders export-related action buttons */
  const renderExportActions = (showContactVendor = false) => (
    <>
      {exportState === 'idle' && (
        <>
          {showContactVendor && (
            <>
              {/* <Button 
                size="md" 
                color="secondary"
                iconLeading={Mail01}
                onClick={() => setShowContactVendorModal(true)}
              >
                Contact Vendor
              </Button> */}

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
                color="secondary"
                iconLeading={Trash01}
                onClick={() => setShowCancelModal(true)}
              >
                Remove
              </Button>
            </>
          )}
          {!showContactVendor && (
            <Button size="md" color="secondary" iconLeading={Trash01} onClick={() => setShowDeleteModal(true)}>
              Remove
            </Button>
          )}
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
        <Button size="md" color="secondary" isDisabled iconLeading={RefreshCw05}>
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
          <Button size="md" color="secondary-destructive" iconLeading={RefreshCw05} onClick={handleExportClick}>
            Retry Export
          </Button>
        </div>
      )}
    </>
  )

  /** Renders error action buttons (Get Help + Remove) */
  const renderErrorActions = () => (
    <>
      <Button 
        size="md" 
        color="secondary"
        iconLeading={HelpCircle}
        onClick={() => openCrispChat(`I'm having an issue with "${filename}"`)}
      >
        Get Help
      </Button>
      <Button 
        size="md" 
        color="secondary-destructive"
        iconLeading={Trash01}
        onClick={() => setShowDeleteModal(true)}
      >
        Remove
      </Button>
    </>
  )

  // =============================================================================
  // UPLOADING STATE
  // =============================================================================
  
  if (status === "uploading") {
    return (
      <>
        <CardContainer animated>
          <CardHeaderSection>
            <StatusBadge color="gray-blue">Uploading</StatusBadge>
            <InvoiceHeader 
              title={filename} 
              fileMetadata={{ fileSize: formatFileSize(fileSize), pageCount }}
            />
            <CardProgress value={0} />
          </CardHeaderSection>
          <CardFooter>
            <div />
            <ActionButtons>
              <Button size="md" color="secondary" iconLeading={XClose} onClick={() => setShowCancelModal(true)}>
                Cancel
              </Button>
            </ActionButtons>
          </CardFooter>
        </CardContainer>
        {renderModals()}
      </>
    )
  }

  // =============================================================================
  // QUEUED STATE (UPL - file uploaded, waiting to process)
  // =============================================================================
  
  if (status === "queued") {
    return (
      <>
        <CardContainer animated>
          <CardHeaderSection>
            <StatusBadge color="gray-blue">Uploading</StatusBadge>
            <InvoiceHeader 
              title={filename} 
              fileMetadata={{ fileSize: formatFileSize(fileSize), pageCount }}
            />
            <StatusMessage>
              {getProcessingStatusText(processingStatus)}
            </StatusMessage>
            <CardProgress value={getProcessingProgress(processingStatus)} />
          </CardHeaderSection>
          <CardFooter>
            <FileLink filename={filename} onClick={onViewFile} />
            <ActionButtons>
              <Button size="md" color="secondary" iconLeading={XClose} onClick={() => setShowCancelModal(true)}>
                Cancel
              </Button>
            </ActionButtons>
          </CardFooter>
        </CardContainer>
        {renderModals()}
      </>
    )
  }

  // =============================================================================
  // PROCESSING STATE
  // =============================================================================
  
  if (status === "processing") {
    const helperText = getProcessingStatusText(processingStatus)
    
    return (
      <>
        <CardContainer animated>
          <CardHeaderSection>
            <StatusBadge color="gray-blue">Processing</StatusBadge>
            <InvoiceHeader 
              title={invoice?.vendor || getCardTitle()} 
              invoiceNumber={invoice?.invoiceNumber}
              subtitle={invoice?.date}
              description={invoice?.description}
              amount={invoice?.amount}
            />
            <StatusMessage>{helperText}</StatusMessage>
            <CardProgress value={getProcessingProgress(processingStatus)} />
          </CardHeaderSection>
          <CardFooter>
            <FileLink filename={filename} onClick={onViewFile} />
            <ActionButtons>
              <Button size="md" color="secondary" iconLeading={XClose} onClick={() => setShowCancelModal(true)}>
                Cancel
              </Button>
            </ActionButtons>
          </CardFooter>
        </CardContainer>
        {renderModals()}
      </>
    )
  }

  // =============================================================================
  // CONNECTING/MATCHING STATE
  // =============================================================================
  
  if (status === "connecting") {
    return (
      <>
        <CardContainer animated>
          <CardHeaderSection>
            <StatusBadge color="gray-blue">Matching</StatusBadge>
            <InvoiceHeader 
              title={invoice?.vendor || getCardTitle()} 
              invoiceNumber={invoice?.invoiceNumber}
              subtitle={invoice?.date}
              description={invoice?.description}
              amount={invoice?.amount}
            />
            <StatusMessage>
              {getProcessingStatusText(processingStatus)}
            </StatusMessage>
            <CardProgress value={getProcessingProgress(processingStatus)} />
          </CardHeaderSection>
          <CardFooter>
            <FileLink filename={filename} onClick={onViewFile} />
            <ActionButtons>
              <Button size="md" color="secondary" iconLeading={XClose} onClick={() => setShowCancelModal(true)}>
                Cancel
              </Button>
            </ActionButtons>
          </CardFooter>
        </CardContainer>
        {renderModals()}
      </>
    )
  }

  // =============================================================================
  // SUCCESS STATE
  // =============================================================================
  
  if (status === "success") {
    return (
      <>
        <CardContainer>
          <CardHeaderSection>
            <StatusBadge color="brand">Complete</StatusBadge>
            <InvoiceHeader 
              title={invoice?.vendor || getCardTitle()} 
              invoiceNumber={invoice?.invoiceNumber}
              subtitle={invoice?.date}
              description={invoice?.description}
              amount={invoice?.amount}
            />
            <StatusMessage variant="brand">{getResultStatusText('success')}</StatusMessage>
          </CardHeaderSection>
          <CardFooter>
            <FileLink filename={filename} onClick={handleViewFile} />
            <ActionButtons>{renderExportActions()}</ActionButtons>
          </CardFooter>
        </CardContainer>
        {renderModals()}
      </>
    )
  }

  // =============================================================================
  // SUCCESS WITH CAVEATS STATE
  // =============================================================================
  
  if (status === "success-with-caveats" && (issues || detailedIssues)) {
    return (
      <>
        <CardContainer>
          <CardHeaderSection>
            <StatusBadge color="warning">Needs Review</StatusBadge>
            <InvoiceHeader 
              title={invoice?.vendor || getCardTitle()} 
              invoiceNumber={invoice?.invoiceNumber}
              subtitle={invoice?.date}
              description={invoice?.description}
              amount={invoice?.amount}
              varianceInfo={varianceInfo}
            />
            
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
            
            {detailedIssues && detailedIssues.length > 0 ? (
              <IssueDetailsTable issues={detailedIssues} />
            ) : issues && (
              <AttentionList items={issues} />
            )}
          </CardHeaderSection>
          <CardFooter>
            <FileLink filename={filename} onClick={handleViewFile} />
            <ActionButtons>{renderExportActions(true)}</ActionButtons>
          </CardFooter>
        </CardContainer>
        {renderModals()}
      </>
    )
  }

  // =============================================================================
  // EXPORTED STATE
  // =============================================================================
  
  if (status === "exported") {
    return (
      <CardContainer>
        <CardHeaderSection>
          <StatusBadge color="success">Exported</StatusBadge>
          <InvoiceHeader 
            title={invoice?.vendor || getCardTitle()} 
            invoiceNumber={invoice?.invoiceNumber}
            subtitle={invoice?.date}
            description={invoice?.description}
            amount={invoice?.amount}
          />
          <StatusMessage variant="success">{getResultStatusText('exported')}</StatusMessage>
        </CardHeaderSection>
        <CardFooter>
          <FileLink filename={filename} onClick={handleViewFile} />
          <div />
        </CardFooter>
      </CardContainer>
    )
  }

  // =============================================================================
  // PROCESSING ERROR STATE
  // =============================================================================
  
  if (status === "processing-error") {
    return (
      <>
        <CardContainer>
          <CardHeaderSection>
            <StatusBadge color="error">Error Occurred</StatusBadge>
            <InvoiceHeader 
              title={filename} 
              fileMetadata={{ fileSize: formatFileSize(fileSize), pageCount }}
            />
            <StatusMessage variant="error">
              {errorMessage || getResultStatusText('processingError')}
            </StatusMessage>
          </CardHeaderSection>
          <CardFooter>
            <FileLink filename={filename} onClick={handleViewFile} />
            <ActionButtons>{renderErrorActions()}</ActionButtons>
          </CardFooter>
        </CardContainer>
        {renderModals()}
      </>
    )
  }

  // =============================================================================
  // DUPLICATE STATE
  // =============================================================================
  
  if (status === "duplicate") {
    return (
      <>
        <CardContainer>
          <CardHeaderSection>
            <StatusBadge color="error">Duplicate</StatusBadge>
            <InvoiceHeader 
              title={invoice?.vendor || getCardTitle()} 
              invoiceNumber={invoice?.invoiceNumber}
              subtitle={invoice?.date}
              description={invoice?.description}
              amount={invoice?.amount}
            />
            <StatusMessage variant="error">
              {duplicateInfo
                ? `Already uploaded as "${duplicateInfo.originalFilename}" on ${duplicateInfo.uploadedDate}`
                : getResultStatusText('duplicate')}
            </StatusMessage>
          </CardHeaderSection>
          <CardFooter>
            <FileLink filename={filename} onClick={handleViewFile} />
            <ActionButtons>{renderErrorActions()}</ActionButtons>
          </CardFooter>
        </CardContainer>
        {renderModals()}
      </>
    )
  }

  // =============================================================================
  // NO MATCH STATE
  // =============================================================================
  
  if (status === "no-match") {
    return (
      <>
        <CardContainer>
          <CardHeaderSection>
            <StatusBadge color="error">No Match</StatusBadge>
            <InvoiceHeader 
              title={invoice?.vendor || getCardTitle()} 
              invoiceNumber={invoice?.invoiceNumber}
              subtitle={invoice?.date}
              description={invoice?.description}
              amount={invoice?.amount}
            />
            <StatusMessage variant="error">
              {getResultStatusText('noMatch')}
            </StatusMessage>
          </CardHeaderSection>
          <CardFooter>
            <FileLink filename={filename} onClick={handleViewFile} />
            <ActionButtons>{renderErrorActions()}</ActionButtons>
          </CardFooter>
        </CardContainer>
        {renderModals()}
      </>
    )
  }

  // =============================================================================
  // GENERIC ERROR STATE
  // =============================================================================
  
  if (status === "error") {
    const badgeText = (processingStatus === 'ERROR' && errorCode) ? errorCode : "Error Occurred"
    
    return (
      <>
        <CardContainer>
          <CardHeaderSection>
            <StatusBadge color="error">{badgeText}</StatusBadge>
            <InvoiceHeader 
              title={filename} 
              fileMetadata={{ fileSize: formatFileSize(fileSize), pageCount }}
            />
            <StatusMessage variant="error">
              {errorMessage || getResultStatusText('error')}
            </StatusMessage>
          </CardHeaderSection>
          <CardFooter>
            <FileLink filename={filename} onClick={handleViewFile} />
            <ActionButtons>{renderErrorActions()}</ActionButtons>
          </CardFooter>
        </CardContainer>
        {renderModals()}
      </>
    )
  }

  return null
}
