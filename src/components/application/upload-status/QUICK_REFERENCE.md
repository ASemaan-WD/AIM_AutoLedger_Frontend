# Upload Status Card System - Technical Reference

## Quick Start

### Using the Component
```typescript
import { UploadStatusCard } from "@/components/application/upload-status/upload-status-card"
import type { UploadStatus } from "@/components/application/upload-status/upload-status-card"

<UploadStatusCard
  filename="invoice.pdf"
  status="uploading"
  fileSize={1234567}
  onCancel={() => {}}
/>
```

## Available States

### Progress States
- `uploading` - File upload in progress
- `processing` - OCR and text extraction
- `connecting` - Matching with AIM purchase orders

### Success States
- `success` - Complete with no issues
- `success-with-caveats` - Complete with warnings (uses `issues` array)

### Error States
- `error` - Generic error (backward compatibility)
- `processing-error` - Failed before OCR (no invoice data available)
- `duplicate` - File already uploaded (shows duplicate info and invoice data if available)
- `no-match` - Could not match to any PO in AIM (shows invoice data)

## Architecture

### Component Structure
```
upload-status/
├── components/          # Modular sub-components
│   ├── card-layout.tsx  # Two-column wrapper (icon + content)
│   ├── card-*.tsx       # Individual content sections
│   └── index.tsx        # Barrel export
├── upload-status-card.tsx  # Main orchestrator (state → components)
└── fixtures.ts          # Mock data for demos
```

### Layout System
- **Row 1**: `CardLayout` wraps icon + content (two columns, aligned)
- **Row 2**: Footer elements outside `CardLayout` (full width)

## Adding a New State

### 1. Update Type Definition
```typescript
// upload-status-card.tsx
export type UploadStatus = 
  | "existing-states"
  | "your-new-state"  // ← Add here
```

### 2. Implement Rendering Logic
```typescript
// upload-status-card.tsx
if (status === "your-new-state") {
  return (
    <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
      <CardLayout icon={SomeIcon} iconColor="brand">
        <CardHeader {...} />
        <CardProgress {...} />
        {/* Other components */}
      </CardLayout>
      
      <OriginalFileLink {...} />
      <CardActions {...} />
    </div>
  )
}
```

### 3. Add to Fixtures (Optional, for demo)
```typescript
// fixtures.ts
export const uploadStatusFixtures = {
  yourNewState: { filename: "...", status: "your-new-state", ... }
}
```

**That's it.** All pages using the component can now use the new state.

## Creating a New Sub-Component

### 1. Create Component File
```typescript
// components/your-component.tsx
"use client"

interface YourComponentProps {
  data: string
  show?: boolean
}

export function YourComponent({ data, show = true }: YourComponentProps) {
  if (!show) return null
  return <div>{data}</div>
}
```

### 2. Export from Index
```typescript
// components/index.tsx
export { YourComponent } from "./your-component"
```

### 3. Use in Main Component
```typescript
// upload-status-card.tsx
import { YourComponent } from "./components"

if (status === "some-state") {
  return (
    <CardLayout icon={Icon} iconColor="brand">
      <YourComponent data={someData} />
    </CardLayout>
  )
}
```

## Key Principles

### Component Composition
- `CardLayout` handles icon + two-column structure
- Content components go **inside** `CardLayout`
- Footer components (links, buttons) go **outside** `CardLayout`
- Use `show` props for conditional rendering

### Props Interface
- Extend `UploadStatusCardProps` for new data needs
- Keep sub-component props simple and focused
- Use optional props with sensible defaults

### State Management
- State flows: Parent → `UploadStatusCard` → Sub-components
- Actions flow: Sub-components → callbacks → Parent
- No internal state in sub-components (keep them pure)

## Pages

- `/upload-status-demo` - Component library (uses `fixtures.ts`)
- `/home2` - Production implementation (uses real data)
- Both automatically get new states/components once implemented

## Testing New States/Components

1. Add state/component to main component
2. Add fixture (optional)
3. View in `/upload-status-demo`
4. Use in production pages as needed

## Common Patterns

### Conditional Sections
```typescript
<InvoiceDetails {...data} show={!!invoiceInfo} />
```

### Progress States
```typescript
<CardLayout icon={File04} iconColor="brand">
  <CardHeader {...} showCancelButton />
  <CardProgress value={50} />
</CardLayout>
```

### Success States
```typescript
<CardLayout icon={CheckCircle} iconColor="success">
  <CardHeader {...} />
  <InvoiceDetails {...} show={!!invoiceInfo} />
</CardLayout>
<OriginalFileLink {...} />
<CardActions type="success" {...} />
```

### Success with Issues (Caveats)
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

### Error States

#### Processing Error (Before OCR)
```typescript
<UploadStatusCard
  status="processing-error"
  filename="corrupted.pdf"
  errorMessage="Unable to extract text from this document"
  onRemove={() => {}}
  onGetHelp={() => {}}
/>
```

#### Duplicate File
```typescript
<UploadStatusCard
  status="duplicate"
  filename="invoice.pdf"
  invoiceInfo={{ vendor: "Acme", ... }}
  duplicateInfo={{
    originalFilename: "invoice-original.pdf",
    uploadedDate: "Mar 10, 2024"
  }}
  onRemove={() => {}}
  onGetHelp={() => {}}
/>
```

#### No Match Found
```typescript
<UploadStatusCard
  status="no-match"
  filename="invoice.pdf"
  invoiceInfo={{ vendor: "Acme", ... }}
  onRemove={() => {}}
  onGetHelp={() => {}}
/>
```

## File Locations

- Component: `src/components/application/upload-status/`
- Demo: `src/app/(app)/upload-status-demo/page.tsx`
- Implementation: `src/app/(app)/home2/page.tsx`
- Types: Exported from `upload-status-card.tsx`

