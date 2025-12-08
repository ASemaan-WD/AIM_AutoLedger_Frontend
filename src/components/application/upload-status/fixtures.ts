/**
 * Upload Status Card Fixtures
 * 
 * Mock data that mirrors Airtable structure for easy integration.
 * Uses the same field names and data types as the real backend.
 * 
 * See DATA_FLOW.md for detailed field documentation.
 */

import type { UploadStatusCardProps, DetailedIssue } from "./upload-status-card"

// =============================================================================
// AIRTABLE-LIKE TYPES
// These mirror the actual Airtable schema for easy integration
// =============================================================================

/** Warning types from Invoices.Warnings field */
export interface InvoiceWarning {
  Type: 'balance' | 'line_amount' | 'missing_receipts'// | 'ai_matching'
  Message?: string
  Items?: Array<{
    LineNo: string
    DocQty?: number
    RecQty?: number
    DocPrice?: number
    RecPrice?: number
  }>
  ItemLineNumbers?: string
}

/** Mock invoice record matching Airtable Invoices table structure */
export interface MockInvoiceRecord {
  id: string // Airtable record ID
  fields: {
    'Invoice-Number'?: string
    'Vendor-Name'?: string
    'Amount'?: number
    'Date'?: string // ISO date string
    'Summary'?: string
    'Status'?: 'Pending' | 'Matching' | 'Matched' | 'Queued' | 'Exported' | 'Error'
    'ErrorCode'?: string
    'Error-Description'?: string
    'Warnings'?: InvoiceWarning[] | string // Can be JSON string or parsed array
    'Balance'?: number // Positive = over PO, negative = under PO
  }
}

/** Mock file record matching Airtable Files table structure */
export interface MockFileRecord {
  id: string // Airtable record ID
  fields: {
    'FileName': string
    'FileURL'?: string
    'Status': 'Queued' | 'Processing' | 'Processed' | 'Attention'
    'Processing-Status'?: 'UPL' | 'DETINV' | 'PARSE' | 'RELINV' | 'MATCHING' | 'MATCHED' | 'ERROR'
    'Error-Code'?: string
    'Error-Description'?: string
    'Invoices'?: string[] // Linked invoice record IDs
  }
  // UI-specific additions (not from Airtable)
  _ui?: {
    fileSize?: number
    pageCount?: number
    createdAt?: Date
  }
}

// =============================================================================
// TRANSFORM FUNCTIONS
// Same logic as HomePage.tsx - use these for consistency
// =============================================================================

/**
 * Parse an invoice record from Airtable format to UI format
 * This is the same logic used in HomePage.tsx
 */
export function parseInvoiceRecord(record: MockInvoiceRecord) {
  const fields = record.fields
  
  const vendorName = fields['Vendor-Name']
  const amount = fields['Amount']
  const date = fields['Date']
  const summary = fields['Summary']
  const invoiceNumber = fields['Invoice-Number']
  const status = fields['Status']
  const errorCode = fields['ErrorCode']
  const errorDescription = fields['Error-Description']
  const warningsRaw = fields['Warnings']
  const balance = fields['Balance']

  // Parse warnings
  let warnings: InvoiceWarning[] = []
  if (warningsRaw) {
    if (typeof warningsRaw === 'string') {
      try {
        warnings = JSON.parse(warningsRaw)
      } catch {
        warnings = []
      }
    } else if (Array.isArray(warningsRaw)) {
      warnings = warningsRaw
    }
  }

  // Format date and calculate daysAgo
  const invoiceDate = date ? new Date(date) : new Date()
  const daysAgo = Math.floor((Date.now() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24))
  const formattedDate = invoiceDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
  
  // Format amount as currency
  const formattedAmount = amount != null
    ? `$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
    : '$0.00'

  return {
    vendor: vendorName || 'Unknown Vendor',
    date: formattedDate,
    daysAgo,
    amount: formattedAmount,
    description: summary || 'Invoice details',
    invoiceNumber: invoiceNumber || undefined,
    recordId: record.id,
    // Extended fields for internal use
    status,
    errorCode,
    errorDescription,
    warnings,
    balance,
  }
}

/**
 * Format a warning object into a display string
 * Same logic as HomePage.tsx
 */
export function formatInvoiceWarning(warning: InvoiceWarning): string | null {
  if (warning.Type === 'line_amount' && warning.Items?.length) {
    const details = warning.Items.map(item => {
      const qtyMismatch = item.DocQty != null
      const priceMismatch = item.DocPrice != null

      if (qtyMismatch && priceMismatch) {
        return `Line ${item.LineNo} – quantity and unit price mismatch (Invoice: ${item.DocQty} @ $${item.DocPrice}, PO: ${item.RecQty} @ $${item.RecPrice}).`
      } else if (qtyMismatch) {
        return `Line ${item.LineNo} – quantity mismatch (Invoice: ${item.DocQty}, PO: ${item.RecQty}).`
      } else if (priceMismatch) {
        return `Line ${item.LineNo} – unit price mismatch (Invoice: $${item.DocPrice}, PO: $${item.RecPrice}).`
      }
      return `Line ${item.LineNo} – mismatch detected.`
    }).join('\n')
    return `Line item mismatch(es) detected:\n${details}`
  }

  if (warning.Type === 'missing_receipts' && warning.ItemLineNumbers) {
    return `Line(s) ${warning.ItemLineNumbers} – item(s) not on PO.`
  }

  // if (warning.Type === 'ai_matching' && warning.Message) {
  //   return warning.Message
  // }

  return null
}

/**
 * Derive issues array from invoice warnings and balance
 * Same logic as HomePage.tsx polling
 */
export function deriveIssuesFromInvoice(invoice: ReturnType<typeof parseInvoiceRecord>): string[] {
  const issues: string[] = []
  
  // Balance check
  if (invoice.balance !== undefined && invoice.balance !== 0) {
    const absBalance = Math.abs(invoice.balance)
    if (invoice.balance > 0) {
      issues.push(`Invoice subtotal is $${absBalance.toFixed(2)} more than PO total.`)
    } else {
      issues.push(`Invoice subtotal is $${absBalance.toFixed(2)} less than PO total.`)
    }
  }
  
  // Other warnings (exclude balance type)
  if (invoice.warnings?.length) {
    issues.push(...invoice.warnings
      .filter(w => w.Type !== 'balance')
      .map(formatInvoiceWarning)
      .filter((w): w is string => w !== null)
    )
  }
  
  return issues
}

/**
 * Derive varianceInfo from invoice balance
 */
export function deriveVarianceInfo(balance?: number): { amount: string; direction: 'over' | 'under' } | undefined {
  if (balance === undefined || balance === 0) return undefined
  return {
    amount: `$${Math.abs(balance).toFixed(2)}`,
    direction: balance > 0 ? 'over' : 'under'
  }
}

// =============================================================================
// MOCK INVOICE RECORDS (Airtable format)
// =============================================================================

export const mockInvoiceRecords: Record<string, MockInvoiceRecord> = {
  /** Invoice 1: Acme Corporation - Clean invoice, no issues */
  acme: {
    id: 'recAcme001',
    fields: {
      'Invoice-Number': 'INV-2024-0315',
      'Vendor-Name': 'Acme Corporation',
      'Amount': 2450.00,
      'Date': '2024-03-15',
      'Summary': 'Fastener nuts assortment including SPAC HGLF Os, Lt, and SPL types',
      'Status': 'Matched',
      'Balance': 0,
    }
  },

  /** Invoice 2: RB&W Corporation - Has warnings and balance variance */
  rbw: {
    id: 'recRBW002',
    fields: {
      'Invoice-Number': 'INV-2025-1002',
      'Vendor-Name': 'RB&W Corporation of Canada',
      'Amount': 31371.22,
      'Date': '2025-10-02',
      'Summary': 'Various nuts and bolts shipped to LTC Roll',
      'Status': 'Matched',
      // Balance = price variance ($2,483.81) + unmatched item ($460.20) = $2,944.01
      'Balance': 2944.01,
      'Warnings': [
        {
          Type: 'line_amount',
          Items: [
            // 137,000 units × ($0.09813 - $0.08000) = $2,483.81 over
            { LineNo: '3', DocQty: 137000, RecQty: 137000, DocPrice: 0.09813, RecPrice: 0.08000 }
          ]
        },
        {
          Type: 'missing_receipts',
          ItemLineNumbers: '4'
        }
      ]
    }
  },

  /** Invoice 3: Global Supplies - For error/duplicate scenarios */
  global: {
    id: 'recGlobal003',
    fields: {
      'Invoice-Number': 'INV-2024-1128',
      'Vendor-Name': 'Global Industrial Supplies',
      'Amount': 847.50,
      'Date': '2024-11-28',
      'Summary': 'Miscellaneous hardware and mounting brackets',
      'Status': 'Matched',
      'Balance': 0,
    }
  },

  /** Invoice 4: With error status */
  errorInvoice: {
    id: 'recError004',
    fields: {
      'Invoice-Number': 'INV-2024-0920',
      'Vendor-Name': 'Faulty Vendor Inc.',
      'Amount': 1250.00,
      'Date': '2024-09-20',
      'Summary': 'Parts order',
      'Status': 'Error',
      'ErrorCode': '[INV_PARSE] Missing required fields',
      'Error-Description': 'Unable to extract vendor ID from invoice. The document may be missing key information.',
    }
  },

  /** Invoice 5: Exported invoice */
  exported: {
    id: 'recExported005',
    fields: {
      'Invoice-Number': 'INV-2024-0228',
      'Vendor-Name': 'Premier Parts Co.',
      'Amount': 5890.00,
      'Date': '2024-02-28',
      'Summary': 'Monthly parts delivery - fasteners and fittings',
      'Status': 'Exported',
      'Balance': 0,
    }
  },

  /** Invoice 6: Quantity variance - invoice has MORE than PO */
  quantityOver: {
    id: 'recQtyOver006',
    fields: {
      'Invoice-Number': 'INV-2025-0412',
      'Vendor-Name': 'Midwest Steel Supply',
      'Amount': 18750.00,
      'Date': '2025-04-12',
      'Summary': 'Steel plates and structural beams for warehouse expansion',
      'Status': 'Matched',
      // Balance = quantity over ($1,250.00) + price variance ($312.50) = $1,562.50
      'Balance': 1562.50,
      'Warnings': [
        {
          Type: 'line_amount',
          Items: [
            // 500 units invoiced vs 400 units on PO, at $12.50/unit = $1,250.00 over
            { LineNo: '2', DocQty: 500, RecQty: 400, DocPrice: 12.50, RecPrice: 12.50 }
          ]
        },
        {
          Type: 'line_amount',
          Items: [
            // 250 units at $26.25 vs $25.00 = $312.50 over
            { LineNo: '5', DocQty: 250, RecQty: 250, DocPrice: 26.25, RecPrice: 25.00 }
          ]
        }
      ]
    }
  },

  /** Invoice 7: Quantity variance - invoice has LESS than PO */
  quantityUnder: {
    id: 'recQtyUnder007',
    fields: {
      'Invoice-Number': 'INV-2025-0503',
      'Vendor-Name': 'Pacific Hardware Distributors',
      'Amount': 4280.00,
      'Date': '2025-05-03',
      'Summary': 'Assorted hardware and mounting brackets for assembly line',
      'Status': 'Matched',
      // Balance = quantity under (-$720.00) - total under PO
      'Balance': -720.00,
      'Warnings': [
        {
          Type: 'line_amount',
          Items: [
            // 180 units invoiced vs 240 units on PO, at $12.00/unit = -$720.00 under
            { LineNo: '3', DocQty: 180, RecQty: 240, DocPrice: 12.00, RecPrice: 12.00 }
          ]
        }
      ]
    }
  }
}

// =============================================================================
// MOCK FILE RECORDS (Airtable format)
// =============================================================================

const now = new Date()
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60 * 1000)
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000)
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

export const mockFileRecords: MockFileRecord[] = [
  // === ACTIVE/PROCESSING STATES ===
  {
    id: 'recFile001',
    fields: {
      'FileName': 'invoice-march-2024.pdf',
      'Status': 'Queued',
      'Processing-Status': 'UPL',
    },
    _ui: { fileSize: 2456789, pageCount: 6, createdAt: minutesAgo(1) }
  },
  {
    id: 'recFile002',
    fields: {
      'FileName': 'acme-order-q1.pdf',
      'Status': 'Processing',
      'Processing-Status': 'PARSE',
      'Invoices': ['recAcme001'],
    },
    _ui: { pageCount: 4, createdAt: minutesAgo(5) }
  },
  {
    id: 'recFile003',
    fields: {
      'FileName': 'supplier-invoice-march.pdf',
      'Status': 'Processing',
      'Processing-Status': 'MATCHING',
      'Invoices': ['recAcme001'],
    },
    _ui: { pageCount: 2, createdAt: minutesAgo(8) }
  },

  // === NEEDS REVIEW (success-with-caveats) ===
  {
    id: 'recFile004',
    fields: {
      'FileName': 'Scan___20251020_1436.pdf',
      'Status': 'Processed',
      'Processing-Status': 'MATCHED',
      'Invoices': ['recRBW002'],
    },
    _ui: { pageCount: 3, createdAt: minutesAgo(15) }
  },

  // === READY TO EXPORT (success) ===
  {
    id: 'recFile005',
    fields: {
      'FileName': 'acme-final-invoice.pdf',
      'Status': 'Processed',
      'Processing-Status': 'MATCHED',
      'Invoices': ['recAcme001'],
    },
    _ui: { pageCount: 2, createdAt: hoursAgo(1) }
  },

  // === ERROR STATES ===
  {
    id: 'recFile006',
    fields: {
      'FileName': 'corrupted-file.pdf',
      'Status': 'Attention',
      'Processing-Status': 'ERROR',
      'Error-Code': 'OCR_FAILED',
      'Error-Description': 'Unable to extract text from this document. The file may be corrupted or in an unsupported format.',
    },
    _ui: { fileSize: 1234567, createdAt: hoursAgo(3) }
  },
  {
    id: 'recFile007',
    fields: {
      'FileName': 'duplicate-invoice.pdf',
      'Status': 'Attention',
      'Processing-Status': 'ERROR',
      'Error-Code': 'DUPLICATE_FILE',
      'Error-Description': 'This file has already been uploaded.',
      'Invoices': ['recGlobal003'],
    },
    _ui: { pageCount: 1, createdAt: hoursAgo(5) }
  },
  {
    id: 'recFile008',
    fields: {
      'FileName': 'no-po-match.pdf',
      'Status': 'Attention',
      'Processing-Status': 'ERROR',
      'Error-Code': 'NO_PO_MATCH',
      'Error-Description': 'Could not find matching PO in AIM.',
      'Invoices': ['recGlobal003'],
    },
    _ui: { pageCount: 2, createdAt: hoursAgo(6) }
  },
  {
    id: 'recFile009',
    fields: {
      'FileName': 'invoice-parse-error.pdf',
      'Status': 'Attention',
      'Processing-Status': 'ERROR',
      'Error-Code': 'INV_PARSE',
      'Error-Description': 'Failed to parse invoice data.',
      'Invoices': ['recError004'],
    },
    _ui: { pageCount: 4, createdAt: hoursAgo(8) }
  },

  // === EXPORTED ===
  {
    id: 'recFile010',
    fields: {
      'FileName': 'premier-feb-invoice.pdf',
      'Status': 'Processed',
      'Processing-Status': 'MATCHED',
      'Invoices': ['recExported005'],
    },
    _ui: { pageCount: 2, createdAt: daysAgo(1) }
  },

  // === QUANTITY VARIANCE STATES ===
  {
    id: 'recFile011',
    fields: {
      'FileName': 'midwest-steel-april.pdf',
      'Status': 'Processed',
      'Processing-Status': 'MATCHED',
      'Invoices': ['recQtyOver006'],
    },
    _ui: { pageCount: 4, createdAt: minutesAgo(30) }
  },
  {
    id: 'recFile012',
    fields: {
      'FileName': 'pacific-hardware-may.pdf',
      'Status': 'Processed',
      'Processing-Status': 'MATCHED',
      'Invoices': ['recQtyUnder007'],
    },
    _ui: { pageCount: 2, createdAt: minutesAgo(45) }
  },
]

// =============================================================================
// DETAILED ISSUES FOR UI (used for success-with-caveats state)
// These are derived from Warnings but formatted for the IssueDetailsTable
// =============================================================================

export const sampleDetailedIssues: DetailedIssue[] = [
  {
    type: 'price-variance',
    severity: 'warning',
    lineNumber: 3,
    lineReference: 'EACR55932',
    description: 'Unit price mismatch.',
    impact: '+22.7%',
    // 137,000 units × ($0.09813 - $0.08000) = $2,483.81
    dollarImpact: '+$2,483.81',
    details: {
      invoiceValue: '$0.09813',
      poValue: '$0.08000',
      quantity: 137000,
    },
  },
  {
    type: 'unmatched-item',
    severity: 'error',
    lineNumber: 4,
    lineReference: '51-2C-072C-90',
    description: 'Item not found on original PO.',
    // 1,950 units × $0.236 per unit = $460.20
    impact: '+$460.20',
    dollarImpact: '+$460.20',
    details: {
      itemDescription: 'M8X1.25X1.80 SPAC SPL Nut',
      quantity: 1950,
    },
  },
]

export const sampleAnalysisSummary = "Invoice line 3 (EACR55932) matched to receipt EACR559234 with price discrepancy: invoice $0.09813 vs PO $0.08000 (22.7% higher, +$2,483.81) for 137,000 units. Invoice line 4 (51 2C 072C 90 / M8X1.25X1.80 SPAC SPL Nut, qty 1950, +$460.20) has no matching PO receipt."

/** Detailed issues for quantity over variance case */
export const quantityOverDetailedIssues: DetailedIssue[] = [
  {
    type: 'quantity-mismatch',
    severity: 'warning',
    lineNumber: 2,
    lineReference: 'STL-PLT-4X8',
    description: 'Quantity exceeds PO.',
    // 500 units invoiced vs 400 on PO = 100 extra units × $12.50 = $1,250.00
    impact: '+25%',
    dollarImpact: '+$1,250.00',
    details: {
      invoiceValue: '500 units',
      poValue: '400 units',
      quantity: 500,
      unitPrice: '$12.50',
    },
  },
  {
    type: 'price-variance',
    severity: 'warning',
    lineNumber: 5,
    lineReference: 'BM-W12X26',
    description: 'Unit price mismatch.',
    // 250 units × ($26.25 - $25.00) = $312.50
    impact: '+5%',
    dollarImpact: '+$312.50',
    details: {
      invoiceValue: '$26.25',
      poValue: '$25.00',
      quantity: 250,
    },
  },
]

export const quantityOverAnalysisSummary = "Invoice line 2 (STL-PLT-4X8 / Steel Plate 4x8) shows quantity of 500 units vs PO quantity of 400 units (+25%, +$1,250.00). Invoice line 5 (BM-W12X26 / W12x26 Structural Beam) has price discrepancy: invoice $26.25 vs PO $25.00 (+5%, +$312.50) for 250 units."

/** Detailed issues for quantity under variance case */
export const quantityUnderDetailedIssues: DetailedIssue[] = [
  {
    type: 'quantity-mismatch',
    severity: 'warning',
    lineNumber: 3,
    lineReference: 'HW-BRK-M6',
    description: 'Quantity below PO.',
    // 180 units invoiced vs 240 on PO = 60 fewer units × $12.00 = -$720.00
    impact: '-25%',
    dollarImpact: '-$720.00',
    details: {
      invoiceValue: '180 units',
      poValue: '240 units',
      quantity: 180,
      unitPrice: '$12.00',
    },
  },
]

export const quantityUnderAnalysisSummary = "Invoice line 3 (HW-BRK-M6 / M6 Mounting Bracket) shows quantity of 180 units vs PO quantity of 240 units (-25%, -$720.00). This may indicate a partial shipment or backorder situation."

// =============================================================================
// DUPLICATE INFO (for duplicate state)
// =============================================================================

export const sampleDuplicateInfo = {
  originalFilename: "invoice-march-2024-original.pdf",
  uploadedDate: "Mar 10, 2024",
}

// =============================================================================
// TRANSFORM MOCK DATA TO UI FORMAT
// This function mirrors what HomePage.tsx does with real data
// =============================================================================

export interface TransformedMockFile {
  id: string
  filename: string
  status: UploadStatusCardProps['status']
  processingStatus?: UploadStatusCardProps['processingStatus']
  errorCode?: string
  errorMessage?: string
  fileSize?: number
  pageCount?: number
  createdAt?: Date
  invoices?: UploadStatusCardProps['invoices']
  issues?: string[]
  detailedIssues?: DetailedIssue[]
  analysisSummary?: string
  varianceInfo?: UploadStatusCardProps['varianceInfo']
  duplicateInfo?: UploadStatusCardProps['duplicateInfo']
}

/**
 * Map Airtable file status to UI status
 * Same logic as status-mapper.ts
 */
function mapFileStatusToUI(
  status: string,
  processingStatus?: string,
  invoices?: ReturnType<typeof parseInvoiceRecord>[]
): UploadStatusCardProps['status'] {
  // Check for error states first
  if (status === 'Attention' || processingStatus === 'ERROR') {
    return 'error'
  }

  // Check invoice-level status overrides
  if (invoices?.length) {
    // All exported?
    if (invoices.every(inv => inv.status === 'Exported')) {
      return 'exported'
    }
    
    // Any errors?
    if (invoices.some(inv => inv.status === 'Error')) {
      return 'error'
    }
    
    // Any warnings or balance issues? (only for Matched status)
    const hasWarnings = invoices.some(inv => 
      inv.status === 'Matched' && 
      ((inv.warnings?.length ?? 0) > 0 || (inv.balance !== undefined && inv.balance !== 0))
    )
    if (hasWarnings) {
      return 'success-with-caveats'
    }
  }

  // Map based on file status
  if (status === 'Queued') {
    return processingStatus === 'UPL' ? 'queued' : 'queued'
  }

  if (status === 'Processing') {
    switch (processingStatus) {
      case 'DETINV':
      case 'PARSE':
      case 'RELINV':
        return 'processing'
      case 'MATCHING':
        return 'connecting'
      case 'MATCHED':
        return 'success'
      default:
        return 'processing'
    }
  }

  if (status === 'Processed') {
    return 'success'
  }

  return 'processing'
}

/**
 * Get detailed issues and analysis summary for an invoice based on its record ID
 */
function getDetailedIssuesForInvoice(invoiceRecordId: string): { 
  detailedIssues: DetailedIssue[], 
  analysisSummary: string 
} {
  // Map invoice record IDs to their specific detailed issues
  switch (invoiceRecordId) {
    case 'recRBW002':
      return { detailedIssues: sampleDetailedIssues, analysisSummary: sampleAnalysisSummary }
    case 'recQtyOver006':
      return { detailedIssues: quantityOverDetailedIssues, analysisSummary: quantityOverAnalysisSummary }
    case 'recQtyUnder007':
      return { detailedIssues: quantityUnderDetailedIssues, analysisSummary: quantityUnderAnalysisSummary }
    default:
      return { detailedIssues: sampleDetailedIssues, analysisSummary: sampleAnalysisSummary }
  }
}

/**
 * Transform mock file records to UI format
 * This is the main function for generating mock data
 */
export function transformMockFilesToUI(): TransformedMockFile[] {
  return mockFileRecords.map(fileRecord => {
    const fields = fileRecord.fields
    
    // Get linked invoices
    const invoiceIds = fields['Invoices'] || []
    const invoices = invoiceIds
      .map(id => {
        const record = Object.values(mockInvoiceRecords).find(r => r.id === id)
        return record ? parseInvoiceRecord(record) : null
      })
      .filter((inv): inv is NonNullable<typeof inv> => inv !== null)

    // Determine UI status
    const uiStatus = mapFileStatusToUI(
      fields['Status'],
      fields['Processing-Status'],
      invoices
    )

    // Derive issues from invoices
    let issues: string[] | undefined
    let varianceInfo: TransformedMockFile['varianceInfo']
    let detailedIssues: DetailedIssue[] | undefined
    let analysisSummary: string | undefined
    
    if (uiStatus === 'success-with-caveats' && invoices.length > 0) {
      issues = invoices.flatMap(deriveIssuesFromInvoice)
      // Get variance from first invoice with balance
      const invWithBalance = invoices.find(inv => inv.balance !== undefined && inv.balance !== 0)
      varianceInfo = deriveVarianceInfo(invWithBalance?.balance)
      
      // Get detailed issues based on the first invoice's record ID
      const firstInvoiceId = invoiceIds[0]
      if (firstInvoiceId) {
        const issueData = getDetailedIssuesForInvoice(firstInvoiceId)
        detailedIssues = issueData.detailedIssues
        analysisSummary = issueData.analysisSummary
      }
    }

    // Handle special error cases
    let finalStatus = uiStatus
    let duplicateInfo: TransformedMockFile['duplicateInfo']
    
    if (fields['Error-Code'] === 'DUPLICATE_FILE') {
      finalStatus = 'duplicate'
      duplicateInfo = sampleDuplicateInfo
    } else if (fields['Error-Code'] === 'NO_PO_MATCH') {
      finalStatus = 'no-match'
    } else if (fields['Error-Code'] === 'OCR_FAILED' && invoices.length === 0) {
      finalStatus = 'processing-error'
    }

    return {
      id: fileRecord.id,
      filename: fields['FileName'],
      status: finalStatus,
      processingStatus: fields['Processing-Status'],
      errorCode: fields['Error-Code'],
      errorMessage: fields['Error-Description'],
      fileSize: fileRecord._ui?.fileSize,
      pageCount: fileRecord._ui?.pageCount,
      createdAt: fileRecord._ui?.createdAt,
      invoices: invoices.length > 0 ? invoices.map(inv => ({
        vendor: inv.vendor,
        date: inv.date,
        daysAgo: inv.daysAgo,
        amount: inv.amount,
        description: inv.description,
        invoiceNumber: inv.invoiceNumber,
        recordId: inv.recordId,
      })) : undefined,
      issues,
      detailedIssues,
      analysisSummary,
      varianceInfo,
      duplicateInfo,
    }
  })
}

// =============================================================================
// LEGACY EXPORTS (for backward compatibility)
// =============================================================================

/** @deprecated Use transformMockFilesToUI() instead */
export const uploadStatusFixtures: Record<string, Omit<UploadStatusCardProps, 'onCancel' | 'onExport' | 'onRemove' | 'onGetHelp' | 'onViewFile' | 'onReprocess' | 'onContactVendor'>> = (() => {
  const files = transformMockFilesToUI()
  
  // Create fixture lookup by status for backward compatibility
  const uploading = files.find(f => f.status === 'queued' && f.processingStatus === 'UPL')
  const processing = files.find(f => f.status === 'processing')
  const connecting = files.find(f => f.status === 'connecting')
  const success = files.find(f => f.status === 'success')
  const successWithCaveats = files.find(f => f.status === 'success-with-caveats')
  const exported = files.find(f => f.status === 'exported')
  const error = files.find(f => f.status === 'error' && !f.invoices?.length)
  const processingError = files.find(f => f.status === 'processing-error')
  const duplicate = files.find(f => f.status === 'duplicate')
  const noMatch = files.find(f => f.status === 'no-match')
  
  // Quantity variance cases
  const quantityOver = files.find(f => f.id === 'recFile011')
  const quantityUnder = files.find(f => f.id === 'recFile012')

  return {
    uploading: {
      filename: uploading?.filename || 'invoice-march-2024.pdf',
      status: 'uploading',
      fileSize: uploading?.fileSize || 2456789,
    },
    processing: {
      filename: processing?.filename || 'invoice-march-2024.pdf',
      status: 'processing',
      processingStatus: processing?.processingStatus,
      pageCount: processing?.pageCount || 4,
      invoices: processing?.invoices,
    },
    connecting: {
      filename: connecting?.filename || 'invoice-march-2024.pdf',
      status: 'connecting',
      processingStatus: connecting?.processingStatus,
      invoices: connecting?.invoices,
    },
    success: {
      filename: success?.filename || 'invoice-march-2024.pdf',
      status: 'success',
      invoices: success?.invoices,
    },
    successWithCaveats: {
      filename: successWithCaveats?.filename || 'Scan___20251020_1436.pdf',
      status: 'success-with-caveats',
      invoices: successWithCaveats?.invoices,
      issues: successWithCaveats?.issues,
      detailedIssues: successWithCaveats?.detailedIssues,
      analysisSummary: successWithCaveats?.analysisSummary,
      varianceInfo: successWithCaveats?.varianceInfo,
    },
    /** Quantity variance: invoice has MORE than PO */
    quantityOver: {
      filename: quantityOver?.filename || 'midwest-steel-april.pdf',
      status: 'success-with-caveats',
      invoices: quantityOver?.invoices,
      issues: quantityOver?.issues,
      detailedIssues: quantityOver?.detailedIssues,
      analysisSummary: quantityOver?.analysisSummary,
      varianceInfo: quantityOver?.varianceInfo,
    },
    /** Quantity variance: invoice has LESS than PO */
    quantityUnder: {
      filename: quantityUnder?.filename || 'pacific-hardware-may.pdf',
      status: 'success-with-caveats',
      invoices: quantityUnder?.invoices,
      issues: quantityUnder?.issues,
      detailedIssues: quantityUnder?.detailedIssues,
      analysisSummary: quantityUnder?.analysisSummary,
      varianceInfo: quantityUnder?.varianceInfo,
    },
    exported: {
      filename: exported?.filename || 'invoice-march-2024.pdf',
      status: 'exported',
      invoices: exported?.invoices,
    },
    error: {
      filename: error?.filename || 'invoice-november-2024.pdf',
      status: 'error',
      errorMessage: error?.errorMessage || 'Unable to extract text from this document.',
    },
    processingError: {
      filename: processingError?.filename || 'corrupted-file.pdf',
      status: 'processing-error',
      errorMessage: processingError?.errorMessage || 'Unable to extract text from this document.',
    },
    duplicate: {
      filename: duplicate?.filename || 'invoice-november-2024.pdf',
      status: 'duplicate',
      invoices: duplicate?.invoices,
      duplicateInfo: duplicate?.duplicateInfo || sampleDuplicateInfo,
    },
    noMatch: {
      filename: noMatch?.filename || 'invoice-november-2024.pdf',
      status: 'no-match',
      invoices: noMatch?.invoices,
    },
  }
})()

// =============================================================================
// BACKWARD-COMPATIBLE INDIVIDUAL INVOICE EXPORTS
// =============================================================================

/** @deprecated Use mockInvoiceRecords.acme instead */
export const mockInvoiceAcme = parseInvoiceRecord(mockInvoiceRecords.acme)

/** @deprecated Use mockInvoiceRecords.rbw instead */
export const mockInvoiceRBW = parseInvoiceRecord(mockInvoiceRecords.rbw)

/** @deprecated Use mockInvoiceRecords.global instead */
export const mockInvoiceGlobal = parseInvoiceRecord(mockInvoiceRecords.global)

// =============================================================================
// STATE DESCRIPTIONS (for documentation)
// =============================================================================

export const stateDescriptions = {
  uploading: {
    title: "1. Uploading",
    description: "File is being uploaded to the server",
  },
  queued: {
    title: "2. Queued",
    description: "File uploaded, waiting for processing to start (UPL status)",
  },
  processing: {
    title: "3. Processing",
    description: "Extracting text and data from the document (DETINV/PARSE/RELINV)",
  },
  connecting: {
    title: "4. Matching",
    description: "Checking invoice with AIM Vision and matching POs (MATCHING)",
  },
  success: {
    title: "5. Complete",
    description: "Processing complete with no issues - ready for export (MATCHED)",
  },
  successWithCaveats: {
    title: "6. Needs Review",
    description: "Processing complete but has warnings from Warnings field or Balance ≠ 0",
  },
  quantityOver: {
    title: "6a. Needs Review (Quantity Over)",
    description: "Invoice quantity exceeds PO quantity - Balance > 0 with quantity mismatch",
  },
  quantityUnder: {
    title: "6b. Needs Review (Quantity Under)",
    description: "Invoice quantity below PO quantity - Balance < 0 with quantity mismatch",
  },
  exported: {
    title: "7. Exported",
    description: "All linked invoices have Status = 'Exported'",
  },
  error: {
    title: "8. Error",
    description: "File Status = 'Attention' or Processing-Status = 'ERROR'",
  },
  processingError: {
    title: "9. Processing Error",
    description: "OCR/extraction failed before invoice data available",
  },
  duplicate: {
    title: "10. Duplicate",
    description: "Error-Code = 'DUPLICATE_FILE'",
  },
  noMatch: {
    title: "11. No Match",
    description: "Error-Code = 'NO_PO_MATCH'",
  },
}
