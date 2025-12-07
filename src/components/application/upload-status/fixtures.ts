/**
 * Upload Status Card Fixtures
 * 
 * Centralized mock data for all upload status card states.
 * Used in both the component library demo and actual implementations.
 * Update these fixtures to see changes reflected across all usages.
 */

import type { UploadStatusCardProps, DetailedIssue } from "./upload-status-card"

// =============================================================================
// MOCK INVOICE DATA
// These 3 invoices are used consistently across all card states
// =============================================================================

/**
 * Invoice 1: Acme Corporation - Standard fastener order
 * Used for: uploading, processing, connecting, success, exported states
 */
export const mockInvoiceAcme = {
  recordId: "recAcme001",
  vendor: "Acme Corporation",
  date: "Mar 15, 2024",
  daysAgo: 5,
  amount: "$2,450.00",
  description: "Fastener nuts assortment including SPAC HGLF Os, Lt, and SPL types",
  invoiceNumber: "INV-2024-0315",
}

/**
 * Invoice 2: RB&W Corporation - Large order with issues
 * Used for: success-with-caveats state (has variance and detailed issues)
 */
export const mockInvoiceRBW = {
  recordId: "recRBW002",
  vendor: "RB&W Corporation of Canada",
  date: "Oct 2, 2025",
  daysAgo: 65,
  amount: "$31,371.22",
  description: "Various nuts and bolts shipped to LTC Roll",
  invoiceNumber: "INV-2025-1002",
}

/**
 * Invoice 3: Global Supplies - Duplicate/error scenario
 * Used for: error, duplicate, no-match states
 */
export const mockInvoiceGlobal = {
  recordId: "recGlobal003",
  vendor: "Global Industrial Supplies",
  date: "Nov 28, 2024",
  daysAgo: 12,
  amount: "$847.50",
  description: "Miscellaneous hardware and mounting brackets",
  invoiceNumber: "INV-2024-1128",
}

// =============================================================================
// MOCK ISSUE DATA
// =============================================================================

/** Legacy issues format (simple string array) */
export const sampleIssues = [
  "This invoice is 45 days old",
  "No matching PO found in the system",
  "Vendor address differs from records",
]

/** Detailed issues for success-with-caveats state */
export const sampleDetailedIssues: DetailedIssue[] = [
  {
    type: 'price-variance',
    severity: 'warning',
    lineNumber: 3,
    lineReference: 'EACR55932',
    description: 'Unit price mismatch.',
    impact: '+22.7%',
    dollarImpact: '+$354.12',
    details: {
      invoiceValue: '$0.09813',
      poValue: '$0.08000',
    },
  },
  {
    type: 'unmatched-item',
    severity: 'error',
    lineNumber: 4,
    lineReference: '51-2C-072C-90',
    description: 'Item not found on original PO.',
    impact: '$460.20',
    dollarImpact: '+$460.20',
    details: {
      itemDescription: 'M8X1.25X1.80 SPAC SPL Nut',
      quantity: 1950,
    },
  },
]

/** Analysis summary text */
export const sampleAnalysisSummary = "Invoice line 3 (EACR55932) matched to receipt EACR559234 with price discrepancy: invoice $0.09813 vs PO $0.08000 (22.7% higher). Invoice line 4 (51 2C 072C 90 / M8X1.25X1.80 SPAC SPL Nut, qty 1950, $460.20) has no matching PO receipt."

/** Variance info for success-with-caveats */
export const sampleVarianceInfo = {
  amount: '$2,956.70',
  direction: 'over' as const,
}

/** Duplicate file info */
export const sampleDuplicateInfo = {
  originalFilename: "invoice-march-2024-original.pdf",
  uploadedDate: "Mar 10, 2024",
}

// =============================================================================
// FIXTURE CONFIGURATIONS
// Each state uses one of the 3 mock invoices consistently
// =============================================================================

export const uploadStatusFixtures: Record<string, Omit<UploadStatusCardProps, 'onCancel' | 'onExport' | 'onRemove' | 'onGetHelp' | 'onViewFile' | 'onReprocess' | 'onContactVendor'>> = {
  // Uses mockInvoiceAcme
  uploading: {
    filename: "invoice-march-2024.pdf",
    status: "uploading",
    fileSize: 2456789,
  },
  
  // Uses mockInvoiceAcme
  processing: {
    filename: "invoice-march-2024.pdf",
    status: "processing",
    pageCount: 4,
    invoices: [mockInvoiceAcme],
  },
  
  // Uses mockInvoiceAcme
  connecting: {
    filename: "invoice-march-2024.pdf",
    status: "connecting",
    invoices: [mockInvoiceAcme],
  },
  
  // Uses mockInvoiceAcme
  success: {
    filename: "invoice-march-2024.pdf",
    status: "success",
    invoices: [mockInvoiceAcme],
  },
  
  // Uses mockInvoiceRBW (has issues)
  successWithCaveats: {
    filename: "Scan___20251020_1436.pdf",
    status: "success-with-caveats",
    invoices: [mockInvoiceRBW],
    issues: sampleIssues,
    detailedIssues: sampleDetailedIssues,
    analysisSummary: sampleAnalysisSummary,
    varianceInfo: sampleVarianceInfo,
  },
  
  // Uses mockInvoiceAcme
  exported: {
    filename: "invoice-march-2024.pdf",
    status: "exported",
    invoices: [mockInvoiceAcme],
  },
  
  // Uses mockInvoiceGlobal (error scenario)
  error: {
    filename: "invoice-november-2024.pdf",
    status: "error",
    errorMessage: "Unable to extract text from this document. The file may be corrupted or in an unsupported format.",
  },
  
  // Uses no invoice (pre-OCR error)
  processingError: {
    filename: "corrupted-file.pdf",
    status: "processing-error",
    errorMessage: "Unable to extract text from this document. The file may be corrupted or in an unsupported format.",
  },
  
  // Uses mockInvoiceGlobal
  duplicate: {
    filename: "invoice-november-2024.pdf",
    status: "duplicate",
    invoices: [mockInvoiceGlobal],
    duplicateInfo: sampleDuplicateInfo,
  },
  
  // Uses mockInvoiceGlobal
  noMatch: {
    filename: "invoice-november-2024.pdf",
    status: "no-match",
    invoices: [mockInvoiceGlobal],
  },
}

// =============================================================================
// STATE DESCRIPTIONS (for documentation and demo page)
// =============================================================================

export const stateDescriptions = {
  uploading: {
    title: "1. Uploading",
    description: "File is being uploaded to the server",
  },
  processing: {
    title: "2. Processing",
    description: "Extracting text and data from the document",
  },
  connecting: {
    title: "3. Matching",
    description: "Checking invoice with AIM Vision and validating data",
  },
  success: {
    title: "4. Complete",
    description: "Processing complete with no issues - ready for export",
  },
  successWithCaveats: {
    title: "5. Needs Review",
    description: "Processing complete but has warnings that need attention",
  },
  exported: {
    title: "6. Exported",
    description: "Successfully exported to AIM",
  },
  error: {
    title: "7. Error",
    description: "Processing failed with an error",
  },
  processingError: {
    title: "8. Processing Error",
    description: "Failed to process file before OCR (no data extracted)",
  },
  duplicate: {
    title: "9. Duplicate",
    description: "File is a duplicate of an already uploaded invoice",
  },
  noMatch: {
    title: "10. No Match",
    description: "Could not match invoice to any PO in AIM",
  },
}
