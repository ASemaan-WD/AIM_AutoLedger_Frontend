# Upload Status Card - Data Flow Documentation

This document explains how the `UploadStatusCard` component receives data, displays different states, and keeps up to date with backend changes.

---

## Overview

The upload status cards display the progress and state of invoice files as they move through the processing pipeline. Data flows from **Airtable** (the backend database) through **polling mechanisms** in the `HomePage` component, which then passes the data as props to `UploadStatusCard`.

---

## Data Sources

### Primary Tables in Airtable

1. **Files** - Stores uploaded file metadata and processing status
2. **Invoices** - Stores extracted invoice data linked to files
3. **Images** - Stores page images from PDF conversion (linked to Files)

---

## Card States & Their Data Requirements

### 1. `uploading`
**When:** File is being uploaded to Vercel Blob storage

| Field | Source | Description |
|-------|--------|-------------|
| `filename` | Local File object | Original filename |
| `fileSize` | Local File object | Size in bytes |

**No Airtable data yet** - file hasn't been created in the database.

---

### 2. `queued`
**When:** File uploaded, waiting for processing to start (Processing-Status = `UPL`)

| Field | Source | Description |
|-------|--------|-------------|
| `filename` | `Files.FileName` | Stored filename |
| `processingStatus` | `Files.Processing-Status` | Should be `'UPL'` |
| `pageCount` | Local (from PDF conversion) | Number of pages detected |

**Airtable Fields Used:**
- `Files.Status` = `'Queued'`
- `Files.Processing-Status` = `'UPL'`

---

### 3. `processing`
**When:** OCR/parsing in progress (Processing-Status = `DETINV`, `PARSE`, or `RELINV`)

| Field | Source | Description |
|-------|--------|-------------|
| `filename` | `Files.FileName` | Stored filename |
| `processingStatus` | `Files.Processing-Status` | Current operation |
| `pageCount` | Local | Number of pages |
| `invoices` | `Invoices` table | Partially extracted invoice data (if available) |

**Airtable Fields Used:**
- `Files.Status` = `'Processing'`
- `Files.Processing-Status` = `'DETINV'` | `'PARSE'` | `'RELINV'`
- `Files.Invoices` (linked record IDs)

**Invoice Fields (when available):**
- `Invoices.Vendor-Name`
- `Invoices.Amount`
- `Invoices.Date`
- `Invoices.Summary`
- `Invoices.Invoice-Number`
- `Invoices.Status`

---

### 4. `connecting`
**When:** Matching invoices with PO headers (Processing-Status = `MATCHING`)

| Field | Source | Description |
|-------|--------|-------------|
| `filename` | `Files.FileName` | Stored filename |
| `processingStatus` | `Files.Processing-Status` | Should be `'MATCHING'` |
| `invoices` | `Invoices` table | Invoice data with matching in progress |

**Airtable Fields Used:**
- `Files.Status` = `'Processing'`
- `Files.Processing-Status` = `'MATCHING'`

---

### 5. `success`
**When:** Processing complete with no issues (Processing-Status = `MATCHED`)

| Field | Source | Description |
|-------|--------|-------------|
| `filename` | `Files.FileName` | Stored filename |
| `invoices` | `Invoices` table | Complete invoice data |

**Airtable Fields Used:**
- `Files.Status` = `'Processed'` or `'Processing'` with `Processing-Status` = `'MATCHED'`
- All invoice fields populated

**Invoice Fields:**
```typescript
{
  vendor: string;        // Invoices['Vendor-Name']
  date: string;          // Invoices['Date'] (formatted)
  daysAgo: number;       // Calculated from date
  amount: string;        // Invoices['Amount'] (formatted as currency)
  description: string;   // Invoices['Summary']
  invoiceNumber: string; // Invoices['Invoice-Number']
  recordId: string;      // Invoices record ID (for export updates)
  status: string;        // Invoices['Status']
}
```

---

### 6. `success-with-caveats`
**When:** Processing complete but with warnings

| Field | Source | Description |
|-------|--------|-------------|
| `filename` | `Files.FileName` | Stored filename |
| `invoices` | `Invoices` table | Complete invoice data |
| `issues` | Derived from `Invoices.Warnings` and `Invoices.Balance` | List of warning messages |

**Warning Detection Logic:**
```typescript
// Invoice has warnings if:
// 1. Status is 'Matched' AND
// 2. (Warnings field is non-empty OR Balance !== 0)

const warningInvoices = invoices.filter(inv => 
  inv.status === 'Matched' && 
  ((inv.warnings && inv.warnings.length > 0) || (inv.balance !== undefined && inv.balance !== 0))
);
```

**Warning Types:**
1. **Balance mismatch** - `Invoices.Balance` (positive = over PO total, negative = under)
2. **Line item mismatch** - `Invoices.Warnings` with `Type: 'line_amount'`
3. **Missing receipts** - `Invoices.Warnings` with `Type: 'missing_receipts'`
4. **AI matching notes** - `Invoices.Warnings` with `Type: 'ai_matching'`

---

### 7. `exported`
**When:** All invoices successfully exported to AIM

| Field | Source | Description |
|-------|--------|-------------|
| `filename` | `Files.FileName` | Stored filename |
| `invoices` | `Invoices` table | Complete invoice data |

**Detection Logic:**
```typescript
const allExported = invoices.every(inv => inv.status === 'Exported');
```

---

### 8. `error`
**When:** Processing failed with an error

| Field | Source | Description |
|-------|--------|-------------|
| `filename` | `Files.FileName` | Stored filename |
| `errorCode` | `Files.Error-Code` or `Invoices.ErrorCode` | Error identifier |
| `errorMessage` | `Files.Error-Description` or `Invoices.Error-Description` | Human-readable error |

**Error Sources:**
1. **File-level errors:** `Files.Status` = `'Attention'` or `Processing-Status` = `'ERROR'`
2. **Invoice-level errors:** `Invoices.Status` = `'Error'`

---

### 9. `duplicate`
**When:** File hash matches an existing file

| Field | Source | Description |
|-------|--------|-------------|
| `filename` | Local File object | Original filename |
| `duplicateInfo` | Upload service response | Original file details |
| `invoices` | Optional | If duplicate has invoice data |

**Detection:** Happens during upload via `FileHash` comparison in upload service.

---

### 10. `no-match`
**When:** Could not find matching PO in AIM (legacy state)

| Field | Source | Description |
|-------|--------|-------------|
| `filename` | `Files.FileName` | Stored filename |
| `invoices` | `Invoices` table | Invoice data without PO match |

---

## Data Refresh Mechanism

### Polling System

The `HomePage` component implements a polling system to keep card data current:

```typescript
// Polling configuration
const POLL_INTERVAL = 5000; // 5 seconds
const EXPORT_POLL_INTERVAL = 3000; // 3 seconds for export status

// Polling is active for files in these states:
const isProcessing = file.status === 'uploading' || 
                     file.status === 'queued' || 
                     file.status === 'processing' || 
                     file.status === 'connecting';
```

### Polling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        POLLING FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. File Upload Complete                                         │
│         │                                                        │
│         ▼                                                        │
│  2. startFilePolling(uploadFileId, airtableRecordId)            │
│         │                                                        │
│         ▼                                                        │
│  3. Every 5 seconds:                                             │
│     ┌─────────────────────────────────────────┐                 │
│     │ a. Fetch Files record by ID             │                 │
│     │ b. Read Status & Processing-Status      │                 │
│     │ c. Fetch linked Invoices (if any)       │                 │
│     │ d. Check for errors/warnings            │                 │
│     │ e. Update React state                   │                 │
│     └─────────────────────────────────────────┘                 │
│         │                                                        │
│         ▼                                                        │
│  4. Stop polling when:                                           │
│     - progress >= 100%                                           │
│     - Status = 'Error'                                           │
│     - Status = 'Processed'                                       │
│     - UI status = 'exported'                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Polling Function

```typescript
const pollFile = async () => {
  const client = createAirtableClient(baseId);
  const response = await client.getRecord('Files', airtableRecordId);
  
  // Extract file fields
  const processingStatus = response.fields['Processing-Status'];
  const mainStatus = response.fields['Status'];
  const errorCode = response.fields['Error-Code'];
  const errorDescription = response.fields['Error-Description'];
  const invoiceRecordIds = response.fields['Invoices'];
  
  // Map to UI status
  let uiStatus = mapFileStatusToUI(mainStatus, processingStatus);
  
  // Fetch invoice details if linked
  if (invoiceRecordIds?.length > 0) {
    const invoices = await fetchAllInvoices(baseId, invoiceRecordIds);
    
    // Check for invoice errors (override file status)
    const errorInvoice = invoices.find(inv => inv.status === 'Error');
    if (errorInvoice) {
      uiStatus = 'error';
    }
    
    // Check for warnings (success-with-caveats)
    const warningInvoices = invoices.filter(inv => 
      inv.status === 'Matched' && 
      ((inv.warnings?.length > 0) || (inv.balance !== 0))
    );
    if (warningInvoices.length > 0) {
      uiStatus = 'success-with-caveats';
    }
    
    // Check if all exported
    if (invoices.every(inv => inv.status === 'Exported')) {
      uiStatus = 'exported';
    }
  }
  
  // Update React state
  setFiles(prev => prev.map(f => 
    f.id === uploadFileId ? { ...f, status: uiStatus, invoices, ... } : f
  ));
};
```

---

## Status Mapping

### Airtable Status → UI Status

| File Status | Processing Status | UI Status |
|-------------|-------------------|-----------|
| `Queued` | `UPL` | `queued` |
| `Processing` | `DETINV` | `processing` |
| `Processing` | `PARSE` | `processing` |
| `Processing` | `RELINV` | `processing` |
| `Processing` | `MATCHING` | `connecting` |
| `Processing` | `MATCHED` | `success` |
| `Processed` | * | `success` |
| `Attention` | * | `error` |
| * | `ERROR` | `error` |

### Processing Status → Progress Percentage

| Processing Status | Progress % |
|-------------------|------------|
| `UPL` | 10% |
| `DETINV` | 30% |
| `PARSE` | 50% |
| `RELINV` | 70% |
| `MATCHING` | 90% |
| `MATCHED` | 100% |

### Processing Status → Display Text

| Processing Status | Display Text |
|-------------------|--------------|
| `UPL` | "Uploaded, waiting to start..." |
| `DETINV` | "Detecting invoices (OCR)..." |
| `PARSE` | "Parsing invoice data..." |
| `RELINV` | "Finding related invoices..." |
| `MATCHING` | "Matching with PO headers..." |
| `MATCHED` | "Matching complete" |
| `ERROR` | "Error occurred" |

---

## Export Flow

When user clicks "Export to AIM":

```
┌─────────────────────────────────────────────────────────────────┐
│                        EXPORT FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "Export to AIM"                                  │
│         │                                                        │
│         ▼                                                        │
│  2. Set Invoice Status to 'Queued' in Airtable                  │
│     (via client.updateRecords)                                   │
│         │                                                        │
│         ▼                                                        │
│  3. Start export polling (every 3 seconds)                       │
│         │                                                        │
│         ▼                                                        │
│  4. Check Invoice Status:                                        │
│     ┌─────────────────────────────────────────┐                 │
│     │ - 'Queued' → Show spinner, keep polling │                 │
│     │ - 'Exported' → Show success, stop       │                 │
│     │ - 'Error' → Show error, stop            │                 │
│     └─────────────────────────────────────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Props Reference

```typescript
interface UploadStatusCardProps {
  // Required
  filename: string;                    // Display name
  status: UploadStatus;                // Current UI state
  
  // Processing info
  processingStatus?: ProcessingStatus; // Backend processing stage
  pageCount?: number;                  // Pages in document
  fileSize?: number;                   // File size in bytes
  
  // Invoice data (array for multi-invoice support)
  invoices?: Array<{
    vendor: string;                    // Vendor name
    date: string;                      // Formatted date
    daysAgo: number;                   // Days since invoice date
    amount: string;                    // Formatted currency
    description: string;               // Invoice summary
    invoiceNumber?: string;            // Invoice number
    recordId?: string;                 // Airtable record ID
  }>;
  
  // Issues/warnings
  issues?: string[];                   // Warning messages
  
  // Error info
  errorCode?: string;                  // Error code
  errorMessage?: string;               // Error description
  
  // Duplicate info
  duplicateInfo?: {
    originalFilename: string;
    uploadedDate: string;
  };
  
  // State flags
  isExporting?: boolean;               // Export in progress
  
  // Callbacks
  onCancel?: () => void;               // Cancel upload/processing
  onExport?: () => void;               // Export to AIM
  onRemove?: () => void;               // Remove from list
  onGetHelp?: () => void;              // Get help action
  onViewFile?: () => void;             // View original file
}
```

---

## Initial Load

On page mount, `fetchExistingFiles()` loads all files:

```typescript
useEffect(() => {
  fetchExistingFiles();
}, []);

const fetchExistingFiles = async () => {
  // 1. Fetch all Files records
  const filesRecords = await client.getAllRecords('Files', {
    sort: [{ field: 'Created-At', direction: 'desc' }]
  });
  
  // 2. Fetch all Invoices
  const invoiceRecords = await client.getAllRecords('Invoices');
  
  // 3. Create Invoice lookup map
  const invoiceMap = new Map(invoiceRecords.map(inv => [inv.id, inv]));
  
  // 4. Map to UploadedFile format
  const mappedFiles = filesRecords.map(fileRecord => {
    const invoiceIds = fileRecord.fields['Invoices'] || [];
    const fileInvoices = invoiceIds
      .map(id => invoiceMap.get(id))
      .filter(Boolean)
      .map(parseInvoiceRecord);
    
    // Determine UI status
    let uiStatus = mapFileStatusToUI(fileRecord.fields['Status'], 
                                      fileRecord.fields['Processing-Status']);
    
    // Apply invoice-level status overrides
    // (errors, warnings, exported)
    
    return { ...fileData, invoices: fileInvoices };
  });
  
  // 5. Start polling for active files
  mappedFiles.forEach(file => {
    if (isProcessingState(file.status) && file.airtableRecordId) {
      startFilePolling(file.id, file.airtableRecordId);
    }
  });
};
```

---

## Summary

1. **Data Source:** Airtable (Files + Invoices tables)
2. **Refresh Method:** Polling every 5 seconds during processing
3. **Status Mapping:** `mapFileStatusToUI()` converts Airtable statuses to UI states
4. **Invoice Override:** Invoice-level errors/warnings can override file-level status
5. **Export Tracking:** Separate polling (3 seconds) for export status
6. **Cleanup:** Polling stops on completion, error, or component unmount

