# Upload Status Card - Button Behaviors & Interactions

## Overview

This document describes all button behaviors, modal interactions, and state transitions for the Upload Status Card component.

## Button Behaviors by State

### Success States

#### 1. Success (`status="success"`)
**Buttons:**
- ✅ **Export to AIM** (Primary, Blue) - Triggers immediate export
- 🗑️ **Delete icon** (in header) - Opens delete confirmation modal

**Behaviors:**
- Clicking "Export to AIM" calls `onExport()` directly
- Shows spinner on button while `isExporting={true}`
- Once exported, state changes to `exported`
- Delete icon always opens confirmation modal

#### 2. Success with Caveats (`status="success-with-caveats"`)
**Buttons:**
- ✅ **Export to AIM** (Primary, Blue) - Opens warning modal first
- 🗑️ **Delete icon** (in header) - Opens delete confirmation modal

**Behaviors:**
- Clicking "Export to AIM" opens "Export with Issues" modal
- Modal shows issue count and list
- Confirming modal calls `onExport()` and shows spinner
- Canceling modal closes it without action
- Delete icon always opens confirmation modal

#### 3. Exported (`status="exported"`)
**Buttons:**
- No action buttons (final state)

**Behaviors:**
- Only shows the card with success indicator
- Original file link still works

### Error States

All error states have the same button layout:

#### Buttons:
- 🗑️ **Remove** (Primary Destructive, Red) - Opens delete confirmation modal
- ❓ **Get help** (Secondary) - Placeholder (does nothing for now)

**States with this pattern:**
1. `processing-error` - Failed before OCR (no invoice data)
2. `duplicate` - File already uploaded (shows invoice data if available)
3. `no-match` - Could not match PO (shows invoice data)
4. `error` - Generic error (backward compatibility)

**Behaviors:**
- "Remove" button opens confirmation modal (doesn't delete directly)
- "Get help" button currently does nothing (placeholder for future)
- Delete modal asks for confirmation before calling `onRemove()`

## Modal Interactions

### Delete File Modal

**Triggered by:**
- Delete icon in header (success states)
- "Remove" button (error states)

**Modal Content:**
- 🗑️ Red destructive icon with circle background pattern
- Title: "Delete file"
- Message: "Are you sure you want to delete '{filename}'? This action cannot be undone."

**Buttons:**
- **Cancel** (Secondary) - Closes modal, no action
- **Delete** (Primary Destructive, Red) - Calls `onRemove()` and closes modal

**Usage:**
```typescript
<UploadStatusCard
  status="success"
  filename="invoice.pdf"
  onRemove={() => {
    // Remove file from list
    console.log('File removed')
  }}
/>
```

### Export with Issues Modal

**Triggered by:**
- "Export to AIM" button on `success-with-caveats` state

**Modal Content:**
- ⚠️ Warning icon (orange) with circle background pattern
- Title: "Export with issues"
- Message: "We found {count} issue(s) with this invoice. You can fix them in AIM after export."

**Buttons:**
- **Cancel** (Secondary) - Closes modal, no export
- **Export to AIM** (Primary, Blue) - Calls `onExport()` and closes modal

**Usage:**
```typescript
<UploadStatusCard
  status="success-with-caveats"
  filename="invoice.pdf"
  issues={[
    "This invoice is 45 days old",
    "Vendor address differs from records"
  ]}
  onExport={() => {
    // Start export process
    setIsExporting(true)
  }}
  isExporting={isExporting}
/>
```

## Original File Link

**Appears in all states** (except uploading/processing)

**Visual:**
```
📄 Original file: invoice-march-2024.pdf 🔗
```

**Behavior:**
- Clicking opens PDF in new tab
- If `onViewFile` callback provided, calls it
- If no callback, opens empty tab (placeholder: `window.open("", "_blank")`)

**Usage:**
```typescript
<UploadStatusCard
  status="success"
  filename="invoice.pdf"
  onViewFile={() => {
    // Open PDF URL in new tab
    window.open(pdfUrl, "_blank")
  }}
/>
```

## Export Loading State

### How it works:

1. User clicks "Export to AIM"
2. If `success-with-caveats`, modal appears first
3. On confirmation (or immediate if `success`), `onExport()` is called
4. Parent component sets `isExporting={true}`
5. Button shows spinner and becomes disabled
6. Spinner continues until invoice state changes
7. Once state changes to `exported`, button disappears

### Visual Behavior:
```
Before:  [Export to AIM]
Loading: [⟳ Export to AIM]  (button disabled, spinner visible)
After:   State changes to "exported"
```

### Code Example:
```typescript
const [isExporting, setIsExporting] = useState(false)

const handleExport = async () => {
  setIsExporting(true)
  try {
    await exportToAIM(invoice)
    // Backend will update status to "exported"
  } catch (error) {
    setIsExporting(false)
  }
}

<UploadStatusCard
  status={invoice.status}
  isExporting={isExporting}
  onExport={handleExport}
/>
```

## State Transitions

### Success Flow:
```
uploading → processing → connecting → success → [export] → exported
                                           ↓
                                   success-with-caveats
                                   (if issues found)
```

### Error Flow:
```
uploading → [error] → processing-error
            
processing → [OCR success] → [duplicate check] → duplicate
                          ↓
                     [PO matching] → no-match
                                 ↓
                            success/success-with-caveats
```

## Complete Props Interface

```typescript
interface UploadStatusCardProps {
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
  issues?: string[]              // For success-with-caveats
  errorMessage?: string          // For error states
  duplicateInfo?: {              // For duplicate state
    originalFilename: string
    uploadedDate: string
  }
  isExporting?: boolean          // Shows spinner on export button
  
  // Callbacks
  onCancel?: () => void          // Cancel during upload/processing
  onExport?: () => void          // Export to AIM
  onRemove?: () => void          // Remove file (after modal confirmation)
  onGetHelp?: () => void         // Get help (placeholder)
  onViewFile?: () => void        // View original PDF
}
```

## Key Implementation Details

### Modal Rendering
Modals are rendered using a `renderModals()` helper function that returns both modals, conditionally rendered based on state flags:

```typescript
const [showDeleteModal, setShowDeleteModal] = useState(false)
const [showExportModal, setShowExportModal] = useState(false)

const renderModals = () => (
  <>
    {showDeleteModal && <DeleteFileModal ... />}
    {showExportModal && issues && <ExportWithIssuesModal ... />}
  </>
)

// In each state's return:
return (
  <>
    <div>{/* Card content */}</div>
    {renderModals()}
  </>
)
```

### Button Click Handlers

#### Export Handler:
```typescript
const handleExportClick = () => {
  if (status === "success-with-caveats" && issues?.length > 0) {
    setShowExportModal(true)  // Show warning modal first
  } else {
    onExport?.()  // Direct export
  }
}
```

#### Remove Handler:
```typescript
const handleRemoveClick = () => {
  setShowDeleteModal(true)  // Always show confirmation
}
```

#### View File Handler:
```typescript
const handleViewFile = () => {
  if (onViewFile) {
    onViewFile()  // Use provided callback
  } else {
    window.open("", "_blank")  // Fallback: empty tab
  }
}
```

## Testing in Demo

Visit `/upload-status-demo` to see all states and test interactions:

1. **Success** - Click "Export to AIM", see immediate export with spinner
2. **Success with Caveats** - Click "Export to AIM", see modal, confirm to export
3. **All Error States** - Click "Remove", see confirmation modal
4. **Original File Links** - Click to open new tab

## Summary

✅ Delete button → Always shows confirmation modal  
✅ Export button (success) → Direct export with spinner  
✅ Export button (caveats) → Shows warning modal first  
✅ Remove button → Shows confirmation modal  
✅ Get help button → Placeholder (no action)  
✅ Original file link → Opens new tab  
✅ Spinner → Shows during `isExporting={true}`  
✅ Exported state → No buttons (final state)







