/**
 * Upload Status Card Fixtures
 * 
 * Centralized mock data for all upload status card states.
 * Used in both the component library demo and actual implementations.
 * Update these fixtures to see changes reflected across all usages.
 */

import type { UploadStatusCardProps } from "./upload-status-card"

// Sample invoice data (converted to array format for multiple invoice support)
export const sampleInvoices = [{
  recordId: "recSample123",
  vendor: "Acme Corporation",
  date: "Mar 15, 2024",
  daysAgo: 5,
  amount: "$2,450.00",
  description: "Fastener nuts assortment including SPAC HGLF Os, Lt, and SPL types"
}]

// Sample invoice data for success-with-caveats state
export const sampleCaveatsInvoices = [{
  recordId: "recCaveats456",
  vendor: "RB&W Corporation of Canada",
  date: "Oct 2, 2025",
  daysAgo: 65,
  amount: "$31,371.22",
  description: "Various nuts and bolts shipped to LTC Roll",
  invoiceNumber: "INV-2025-1002"
}]

// Sample issues for success-with-caveats state (legacy format)
export const sampleIssues = [
  "This invoice is 45 days old",
  "No matching PO found in the system",
  "Vendor address differs from records"
]

// Detailed issues for success-with-caveats state (new format)
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

export const sampleDetailedIssues: DetailedIssue[] = [
  {
    type: 'price-variance',
    severity: 'warning',
    lineNumber: 3,
    lineReference: 'EACR55932',
    description: 'Unit price mismatch.',
    impact: '+22.7%',
    details: {
      invoiceValue: '0.09813',
      poValue: '0.08'
    }
  },
  {
    type: 'unmatched-item',
    severity: 'error',
    lineNumber: 4,
    description: 'Item not found on original PO.',
    impact: '$460.20',
    details: {
      itemDescription: 'M8X1.25X1.80 SPAC SPL Nut'
    }
  }
]

// Analysis summary for success-with-caveats state
export const sampleAnalysisSummary = "Invoice line 3 (EACR55932) matched to receipt EACR559234 with price discrepancy: invoice $0.09813 vs PO $0.08000 (22.7% higher). Invoice line 4 (51 2C 072C 90 / M8X1.25X1.80 SPAC SPL Nut, qty 1950, $460.20) has no matching PO receipt."

// Variance info for success-with-caveats state
export const sampleVarianceInfo = {
  amount: '$2,956.70',
  direction: 'over' as const
}

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
    invoices: sampleInvoices,
  },
  
  connecting: {
    filename: "invoice-march-2024.pdf",
    status: "connecting",
    invoices: sampleInvoices,
  },
  
  success: {
    filename: "invoice-march-2024.pdf",
    status: "success",
    invoices: sampleInvoices,
  },
  
  successWithCaveats: {
    filename: "Scan___20251020_1436.pdf",
    status: "success-with-caveats",
    invoices: sampleCaveatsInvoices,
    issues: sampleIssues,
    detailedIssues: sampleDetailedIssues,
    analysisSummary: sampleAnalysisSummary,
    varianceInfo: sampleVarianceInfo,
  },
  
  exported: {
    filename: "invoice-march-2024.pdf",
    status: "exported",
    invoices: sampleInvoices,
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
    invoices: sampleInvoices,
    duplicateInfo: sampleDuplicateInfo,
  },
  
  noMatch: {
    filename: "invoice-march-2024.pdf",
    status: "no-match",
    invoices: sampleInvoices,
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

