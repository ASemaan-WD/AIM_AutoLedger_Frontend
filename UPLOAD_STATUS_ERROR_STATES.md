# Upload Status Card - New Error States Implementation

## Overview

Added four new error states to the Upload Status Card system, providing more granular error handling and better user feedback.

## New Error States

### 1. Processing Error (`processing-error`)
**When to use**: File failed before OCR processing (no invoice data extracted)
- **Icon**: `XCircle` (error)
- **Badge**: "Error" (red)
- **Shows**: Filename and error message
- **Does NOT show**: Invoice details (data not available)
- **Actions**: Remove, Get Help

```typescript
<UploadStatusCard
  status="processing-error"
  filename="corrupted.pdf"
  errorMessage="Unable to extract text from this document"
  onRemove={() => {}}
  onGetHelp={() => {}}
/>
```

### 2. Duplicate File (`duplicate`)
**When to use**: File has already been uploaded
- **Icon**: `Copy01` (duplicate icon)
- **Badge**: "Duplicate" (red)
- **Shows**: 
  - Invoice details (if available from duplicate)
  - Original filename and upload date
- **Actions**: Remove, Get Help

```typescript
<UploadStatusCard
  status="duplicate"
  filename="invoice.pdf"
  invoiceInfo={{ vendor: "Acme Corp", ... }}
  duplicateInfo={{
    originalFilename: "invoice-original.pdf",
    uploadedDate: "Mar 10, 2024"
  }}
  onRemove={() => {}}
  onGetHelp={() => {}}
/>
```

### 3. No Match (`no-match`)
**When to use**: Could not match invoice to any PO in AIM
- **Icon**: `LinkBroken01` (broken link)
- **Badge**: "No Match" (red)
- **Shows**: Invoice details (OCR succeeded, matching failed)
- **Actions**: Remove, Get Help

```typescript
<UploadStatusCard
  status="no-match"
  filename="invoice.pdf"
  invoiceInfo={{ vendor: "Acme Corp", ... }}
  onRemove={() => {}}
  onGetHelp={() => {}}
/>
```

### 4. Generic Error (`error`)
**When to use**: Backward compatibility or unspecified errors
- **Icon**: `XCircle` (error)
- **Badge**: "Error" (red)
- **Shows**: Filename and error message
- **Actions**: Remove, Get Help

## Success with Issues Update

The `success-with-caveats` state now uses `issues` prop instead of `caveats`:

```typescript
<UploadStatusCard
  status="success-with-caveats"
  invoiceInfo={{ vendor: "Acme", ... }}
  issues={[
    "This invoice is 45 days old",
    "Vendor address differs from records"
  ]}
/>
```

**Note**: The `issues` array can contain one or many items, and they'll all be displayed.

## New Props

### `issues?: string[]`
Array of warning messages for `success-with-caveats` state (replaces `caveats`)

### `duplicateInfo?: object`
Information about the duplicate file:
```typescript
duplicateInfo: {
  originalFilename: string
  uploadedDate: string
}
```

## Error State Decision Tree

```
File Upload Failed
├─ Before OCR Processing? → processing-error (no invoice data)
└─ After OCR?
   ├─ Duplicate file? → duplicate (show invoice data + duplicate info)
   ├─ No PO match? → no-match (show invoice data)
   └─ Other error? → error (generic, backward compatible)
```

## Files Modified

### Core Component
- `src/components/application/upload-status/upload-status-card.tsx`
  - Added new status types to `UploadStatus` union
  - Added `issues` and `duplicateInfo` props
  - Implemented rendering logic for all three new error states
  - Renamed `caveats` to `issues` in success-with-caveats

### Fixtures
- `src/components/application/upload-status/fixtures.ts`
  - Added `sampleIssues` and `sampleDuplicateInfo`
  - Added fixtures for: `processingError`, `duplicate`, `noMatch`
  - Updated state descriptions

### Demo Page
- `src/app/(app)/upload-status-demo/page.tsx`
  - Added demo sections for all three new error states

### Documentation
- `src/components/application/upload-status/QUICK_REFERENCE.md`
  - Added "Available States" section with categorized states
  - Added usage examples for all new error states

## Testing

View all states in the component library demo:
```
http://localhost:3000/upload-status-demo
```

The demo page now shows:
1. Uploading
2. Processing
3. Analyzing
4. Success
5. Success with Caveats (using issues)
6. Error (Generic)
7. Processing Error ← NEW
8. Duplicate ← NEW
9. No Match ← NEW

## Backward Compatibility

- Generic `error` state remains unchanged
- `caveats` prop deprecated in favor of `issues` (but same functionality)
- All existing implementations continue to work

## Usage in Production

To use these states in your application:

1. Import the component:
```typescript
import { UploadStatusCard } from "@/components/application/upload-status/upload-status-card"
import type { UploadStatus } from "@/components/application/upload-status/upload-status-card"
```

2. Determine the appropriate state based on the error:
```typescript
const getUploadStatus = (error: ProcessingError): UploadStatus => {
  if (error.type === 'duplicate') return 'duplicate'
  if (error.type === 'no-match') return 'no-match'
  if (error.stage === 'pre-ocr') return 'processing-error'
  return 'error'
}
```

3. Render with appropriate props:
```typescript
<UploadStatusCard
  status={getUploadStatus(error)}
  filename={file.name}
  invoiceInfo={error.invoiceData || undefined}
  duplicateInfo={error.duplicateInfo || undefined}
  errorMessage={error.message}
  onRemove={handleRemove}
  onGetHelp={handleGetHelp}
/>
```

## Icon Reference

All icons are from `@untitledui/icons`:
- `File04` - Uploading/Processing
- `File06` - Analyzing
- `CheckCircle` - Success
- `AlertTriangle` - Success with Caveats
- `XCircle` - Generic Error / Processing Error
- `Copy01` - Duplicate ← NEW
- `LinkBroken01` - No Match ← NEW

## Summary

✅ Added 3 new granular error states  
✅ Updated success-with-caveats to use `issues` array  
✅ Added to demo page for testing  
✅ Updated documentation  
✅ Maintained backward compatibility  
✅ Zero linter errors







