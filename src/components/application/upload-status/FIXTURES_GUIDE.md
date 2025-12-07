# Upload Status Card - Fixtures Guide

## Overview

The Upload Status Card uses a centralized fixtures system with **3 consistent mock invoices** that are reused across all states. This ensures visual consistency and makes it easy to preview all states with realistic data.

## Mock Invoice Data

The fixtures system uses 3 mock invoices that represent different scenarios:

### Invoice 1: Acme Corporation (Standard Flow)
```typescript
mockInvoiceAcme = {
  recordId: "recAcme001",
  vendor: "Acme Corporation",
  date: "Mar 15, 2024",
  daysAgo: 5,
  amount: "$2,450.00",
  description: "Fastener nuts assortment including SPAC HGLF Os, Lt, and SPL types",
  invoiceNumber: "INV-2024-0315",
}
```
**Used for:** uploading, processing, connecting, success, exported

### Invoice 2: RB&W Corporation (Issues/Caveats)
```typescript
mockInvoiceRBW = {
  recordId: "recRBW002",
  vendor: "RB&W Corporation of Canada",
  date: "Oct 2, 2025",
  daysAgo: 65,
  amount: "$31,371.22",
  description: "Various nuts and bolts shipped to LTC Roll",
  invoiceNumber: "INV-2025-1002",
}
```
**Used for:** success-with-caveats (has variance info and detailed issues)

### Invoice 3: Global Industrial (Error Scenarios)
```typescript
mockInvoiceGlobal = {
  recordId: "recGlobal003",
  vendor: "Global Industrial Supplies",
  date: "Nov 28, 2024",
  daysAgo: 12,
  amount: "$847.50",
  description: "Miscellaneous hardware and mounting brackets",
  invoiceNumber: "INV-2024-1128",
}
```
**Used for:** error, duplicate, no-match

## Fixture Configurations

Each state has a fixture configuration in `uploadStatusFixtures`:

| State | Invoice Used | Additional Data |
|-------|--------------|-----------------|
| `uploading` | None (filename only) | fileSize |
| `processing` | mockInvoiceAcme | pageCount |
| `connecting` | mockInvoiceAcme | - |
| `success` | mockInvoiceAcme | - |
| `successWithCaveats` | mockInvoiceRBW | issues, detailedIssues, analysisSummary, varianceInfo |
| `exported` | mockInvoiceAcme | - |
| `error` | None (filename only) | errorMessage |
| `processingError` | None (filename only) | errorMessage |
| `duplicate` | mockInvoiceGlobal | duplicateInfo |
| `noMatch` | mockInvoiceGlobal | - |

## Using Fixtures

### Import Fixtures
```typescript
import { 
  uploadStatusFixtures,
  stateDescriptions,
  mockInvoiceAcme,
  mockInvoiceRBW,
  mockInvoiceGlobal,
} from "@/components/application/upload-status/fixtures"
```

### Use in Components
```tsx
<UploadStatusCard
  {...uploadStatusFixtures.success}
  onExport={handleExport}
  onCancel={handleCancel}
/>
```

### Use Individual Mock Invoices
```tsx
<UploadStatusCard
  filename="custom-invoice.pdf"
  status="success"
  invoices={[mockInvoiceAcme]}
  onExport={handleExport}
/>
```

## Demo Page

The demo page (`/upload-status-demo`) displays all states with their fixtures:

```typescript
import { uploadStatusFixtures, stateDescriptions } from "@/components/application/upload-status/fixtures"

// Each state uses its fixture
<UploadStatusCard {...uploadStatusFixtures.success} onExport={handleExport} />
<UploadStatusCard {...uploadStatusFixtures.error} onRemove={handleRemove} />
```

## Modifying Fixtures

### To change mock invoice data:

1. Edit the mock invoice in `fixtures.ts`:
```typescript
export const mockInvoiceAcme = {
  vendor: "New Vendor Name",  // ← Change here
  amount: "$3,000.00",        // ← Change here
  // ...
}
```

2. Changes automatically reflect in:
   - Demo page (`/upload-status-demo`)
   - All fixtures using that invoice
   - Any component using `mockInvoiceAcme`

### To add a new state:

1. Add status to `UploadStatus` type in `upload-status-card.tsx`
2. Add fixture configuration:
```typescript
export const uploadStatusFixtures = {
  // ...existing states
  newState: {
    filename: "invoice.pdf",
    status: "new-state",
    invoices: [mockInvoiceAcme],
    // additional props
  },
}
```
3. Add state description:
```typescript
export const stateDescriptions = {
  // ...existing descriptions
  newState: {
    title: "11. New State",
    description: "Description of the new state"
  },
}
```
4. Implement render logic in `upload-status-card.tsx`
5. Add to demo page

## Issue Data

### Simple Issues (string array)
```typescript
export const sampleIssues = [
  "This invoice is 45 days old",
  "No matching PO found in the system",
  "Vendor address differs from records",
]
```

### Detailed Issues (structured data)
```typescript
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
  // ... more issues
]
```

## State Descriptions

Each state has a title and description for documentation:

```typescript
export const stateDescriptions = {
  uploading: {
    title: "1. Uploading",
    description: "File is being uploaded to the server",
  },
  processing: {
    title: "2. Processing",
    description: "Extracting text and data from the document",
  },
  // ... etc
}
```

## Testing with Fixtures

```typescript
import { uploadStatusFixtures } from "@/components/application/upload-status/fixtures"

test('renders success state correctly', () => {
  render(
    <UploadStatusCard 
      {...uploadStatusFixtures.success} 
      onExport={jest.fn()}
    />
  )
  expect(screen.getByText('Complete')).toBeInTheDocument()
  expect(screen.getByText('Acme Corporation')).toBeInTheDocument()
})
```

## Best Practices

1. **Always use mock invoices** - Don't create new mock data inline
2. **Consistent filenames** - Use descriptive filenames matching the scenario
3. **Keep fixtures updated** - Update fixtures when adding new features
4. **Test with fixtures** - Use fixtures in unit tests for consistency
5. **Document changes** - Update this guide when modifying fixture structure

## Resources

- **Fixtures File:** `src/components/application/upload-status/fixtures.ts`
- **Component Architecture:** `COMPONENT_ARCHITECTURE.md`
- **Quick Reference:** `QUICK_REFERENCE.md`
- **Demo Page:** `/upload-status-demo`
