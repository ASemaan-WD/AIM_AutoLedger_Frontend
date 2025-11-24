/**
 * Upload Status Card Fixtures
 * 
 * Centralized mock data for all upload status card states.
 * Used in both the component library demo and actual implementations.
 * Update these fixtures to see changes reflected across all usages.
 */

import type { UploadStatusCardProps } from "./upload-status-card"

// Sample invoice data
export const sampleInvoiceInfo = {
  vendor: "Acme Corporation",
  date: "Mar 15, 2024",
  daysAgo: 5,
  amount: "$2,450.00",
  description: "Fastener nuts assortment including SPAC HGLF Os, Lt, and SPL types"
}

// Sample caveats for warning states (deprecated - use sampleIssues)
export const sampleCaveats = [
  "This invoice is 45 days old",
  "No matching PO found in the system",
  "Vendor address differs from records"
]

// Sample issues for success-with-caveats state
export const sampleIssues = [
  "This invoice is 45 days old",
  "No matching PO found in the system",
  "Vendor address differs from records"
]

// Sample duplicate info
export const sampleDuplicateInfo = {
  originalFilename: "invoice-march-2024-original.pdf",
  uploadedDate: "Mar 10, 2024"
}

// Fixture configurations for each state
export const uploadStatusFixtures: Record<string, Omit<UploadStatusCardProps, 'onCancel' | 'onExport' | 'onRemove' | 'onGetHelp' | 'onViewFile'>> = {
  uploading: {
    filename: "invoice-march-2024.pdf",
    status: "uploading",
    fileSize: 2456789,
  },
  
  processing: {
    filename: "invoice-march-2024.pdf",
    status: "processing",
    pageCount: 4,
    invoiceInfo: sampleInvoiceInfo,
  },
  
  connecting: {
    filename: "invoice-march-2024.pdf",
    status: "connecting",
    invoiceInfo: sampleInvoiceInfo,
  },
  
  success: {
    filename: "invoice-march-2024.pdf",
    status: "success",
    invoiceInfo: sampleInvoiceInfo,
  },
  
  successWithCaveats: {
    filename: "invoice-march-2024.pdf",
    status: "success-with-caveats",
    invoiceInfo: sampleInvoiceInfo,
    issues: sampleIssues,
  },
  
  exported: {
    filename: "invoice-march-2024.pdf",
    status: "exported",
    invoiceInfo: sampleInvoiceInfo,
  },
  
  error: {
    filename: "invoice-march-2024.pdf",
    status: "error",
    errorMessage: "Unable to extract text from this document. The file may be corrupted or in an unsupported format.",
  },
  
  processingError: {
    filename: "corrupted-file.pdf",
    status: "processing-error",
    errorMessage: "Unable to extract text from this document. The file may be corrupted or in an unsupported format.",
  },
  
  duplicate: {
    filename: "invoice-march-2024.pdf",
    status: "duplicate",
    invoiceInfo: sampleInvoiceInfo,
    duplicateInfo: sampleDuplicateInfo,
  },
  
  noMatch: {
    filename: "invoice-march-2024.pdf",
    status: "no-match",
    invoiceInfo: sampleInvoiceInfo,
  },
}

// State descriptions for documentation
export const stateDescriptions = {
  uploading: {
    title: "1. Uploading",
    description: "File is being uploaded to the server"
  },
  processing: {
    title: "2. Processing",
    description: "Extracting text and data from the document"
  },
  connecting: {
    title: "3. Analyzing",
    description: "Connecting invoice to AIM and validating data"
  },
  success: {
    title: "4. Success",
    description: "Processing complete with no issues"
  },
  successWithCaveats: {
    title: "5. Success with Caveats",
    description: "Processing complete but with warnings or notes"
  },
  exported: {
    title: "6. Exported",
    description: "Successfully exported to AIM"
  },
  error: {
    title: "7. Error (Generic)",
    description: "Processing failed with an error"
  },
  processingError: {
    title: "8. Processing Error",
    description: "Failed to process file before OCR (no data extracted)"
  },
  duplicate: {
    title: "9. Duplicate",
    description: "File is a duplicate of an already uploaded invoice"
  },
  noMatch: {
    title: "10. No Match",
    description: "Could not match invoice to any PO in AIM"
  },
}

