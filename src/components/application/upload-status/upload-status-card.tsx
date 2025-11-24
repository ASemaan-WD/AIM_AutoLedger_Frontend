"use client"

import { useState } from "react"
import { CheckCircle, XCircle, AlertTriangle, File04, File06, Copy01, LinkBroken01 } from "@untitledui/icons"
import { 
  CardLayout,
  CardHeader, 
  CardProgress, 
  InvoiceDetails, 
  OriginalFileLink, 
  AttentionList, 
  CardActions 
} from "./components"
import { DeleteFileModal, ExportWithIssuesModal } from "./modals"

export type UploadStatus = 
  | "uploading" 
  | "processing" 
  | "connecting" 
  | "success" 
  | "success-with-caveats" 
  | "exported"
  | "error"
  | "duplicate"
  | "no-match"
  | "processing-error"

export interface UploadStatusCardProps {
  filename: string
  status: UploadStatus
  pageCount?: number
  fileSize?: number
  invoiceInfo?: {
    vendor: string
    date: string
    daysAgo: number
    amount: string
    description: string
  }
  caveats?: string[]
  issues?: string[]
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
  pageCount,
  fileSize,
  invoiceInfo,
  caveats,
  issues,
  errorMessage,
  duplicateInfo,
  isExporting = false,
  onCancel,
  onExport,
  onRemove,
  onGetHelp,
  onViewFile,
}: UploadStatusCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const handleRemoveClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    onRemove?.()
  }

  const handleExportClick = () => {
    if (status === "success-with-caveats" && issues && issues.length > 0) {
      setShowExportModal(true)
    } else {
      onExport?.()
    }
  }

  const handleExportConfirm = () => {
    onExport?.()
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
          <CardProgress value={50} />
        </CardLayout>
      </div>
    )
  }

  // Processing State
  if (status === "processing") {
    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
        <CardLayout icon={File04} iconColor="brand">
          <CardHeader
            title={filename}
            badgeText="Processing"
            badgeColor="gray-blue"
            helperText={`Extracting text from ${pageCount} pages...`}
            showCancelButton
            onCancel={onCancel}
          />
          <CardProgress value={75} />
        </CardLayout>
      </div>
    )
  }

  // Connecting/Analyzing State
  if (status === "connecting" && invoiceInfo) {
    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
        <CardLayout icon={File06} iconColor="brand">
          <CardHeader
            title={`Invoice by ${invoiceInfo.vendor}`}
            badgeText="Matching"
            badgeColor="gray-blue"
            helperText="Connecting to AIM to match POs..."
            showCancelButton
            onCancel={onCancel}
          />
          
          <InvoiceDetails
            description={invoiceInfo.description}
            date={invoiceInfo.date}
            amount={invoiceInfo.amount}
          />
          
          <CardProgress value={90} />
        </CardLayout>
        
        <OriginalFileLink
          filename={filename}
          onClick={onViewFile}
        />
      </div>
    )
  }

  // Success State
  if (status === "success") {
    return (
      <>
        <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
          <CardLayout icon={CheckCircle} iconColor="success">
            <CardHeader
              title={invoiceInfo ? `Invoice by ${invoiceInfo.vendor}` : filename}
              badgeText="Complete"
              badgeColor="success"
              helperText="Everything checks out"
              showDeleteButton
              onDelete={handleRemoveClick}
            />
            
            <InvoiceDetails
              description={invoiceInfo?.description || ""}
              date={invoiceInfo?.date || ""}
              amount={invoiceInfo?.amount || ""}
              show={!!invoiceInfo}
            />
          </CardLayout>
          
          <OriginalFileLink
            filename={filename}
            onClick={handleViewFile}
          />
          
          <CardActions
            type="success"
            onPrimaryAction={handleExportClick}
            isLoading={isExporting}
          />
        </div>
        {renderModals()}
      </>
    )
  }

  // Success with Caveats State
  if (status === "success-with-caveats" && issues) {
    return (
      <>
        <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
          <CardLayout icon={AlertTriangle} iconColor="warning">
            <CardHeader
              title={invoiceInfo ? `Invoice by ${invoiceInfo.vendor}` : filename}
              badgeText="Complete"
              badgeColor="warning"
              helperText="Everything is in order, but:"
              showDeleteButton
              onDelete={handleRemoveClick}
            />
            
            <AttentionList items={issues} />
            
            <InvoiceDetails
              description={invoiceInfo?.description || ""}
              date={invoiceInfo?.date || ""}
              amount={invoiceInfo?.amount || ""}
              show={!!invoiceInfo}
            />
          </CardLayout>
          
          <OriginalFileLink
            filename={filename}
            onClick={handleViewFile}
          />
          
          <CardActions
            type="success"
            onPrimaryAction={handleExportClick}
            isLoading={isExporting}
          />
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
            title={invoiceInfo ? `Invoice by ${invoiceInfo.vendor}` : filename}
            badgeText="Exported"
            badgeColor="success"
            helperText="Successfully exported to AIM"
          />
          
          <InvoiceDetails
            description={invoiceInfo?.description || ""}
            date={invoiceInfo?.date || ""}
            amount={invoiceInfo?.amount || ""}
            show={!!invoiceInfo}
          />
        </CardLayout>
        
        <OriginalFileLink
          filename={filename}
          onClick={handleViewFile}
        />
      </div>
    )
  }

  // Processing Error State (prior to OCR - no data available)
  if (status === "processing-error") {
    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
        <CardLayout icon={XCircle} iconColor="error">
          <CardHeader
            title={filename}
            badgeText="Error"
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
            title={invoiceInfo ? `Invoice by ${invoiceInfo.vendor}` : filename}
            badgeText="Duplicate"
            badgeColor="error"
            helperText={
              duplicateInfo
                ? `Already uploaded as "${duplicateInfo.originalFilename}" on ${duplicateInfo.uploadedDate}`
                : "This file has already been uploaded"
            }
          />
          
          <InvoiceDetails
            description={invoiceInfo?.description || ""}
            date={invoiceInfo?.date || ""}
            amount={invoiceInfo?.amount || ""}
            show={!!invoiceInfo}
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

  // Could Not Match State
  if (status === "no-match") {
    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
        <CardLayout icon={LinkBroken01} iconColor="error">
          <CardHeader
            title={invoiceInfo ? `Invoice by ${invoiceInfo.vendor}` : filename}
            badgeText="No Match"
            badgeColor="error"
            helperText="Could not find matching PO in AIM"
          />
          
          <InvoiceDetails
            description={invoiceInfo?.description || ""}
            date={invoiceInfo?.date || ""}
            amount={invoiceInfo?.amount || ""}
            show={!!invoiceInfo}
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

  // Generic Error State (kept for backward compatibility)
  if (status === "error") {
    return (
      <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
        <CardLayout icon={XCircle} iconColor="error">
          <CardHeader
            title={filename}
            badgeText="Error"
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
