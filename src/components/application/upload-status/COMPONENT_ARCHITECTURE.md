# Upload Status Card - Component Architecture

## Overview

The `UploadStatusCard` has been refactored into a modular, component-based architecture for better maintainability, reusability, and flexibility. Each part of the card is now its own component that can be composed together based on the state and available data.

## Component Structure

```
upload-status/
├── components/
│   ├── card-header.tsx          # Icon, title, badge, helper text, cancel button
│   ├── card-progress.tsx        # Progress bar for in-progress states
│   ├── invoice-details.tsx      # Invoice description, date, and amount
│   ├── original-file-link.tsx   # Link to view the original file
│   ├── attention-list.tsx       # Warning/caveat list for attention states
│   ├── card-actions.tsx         # Action buttons (Export/Cancel or Remove/Get Help)
│   └── index.tsx                # Barrel export
├── upload-status-card.tsx       # Main orchestrator component
└── README.md                    # Usage documentation
```

## Individual Components

### 1. CardHeader

**Purpose:** Displays the icon, title, badge, helper text, and optional cancel button.

**Props:**
```typescript
interface CardHeaderProps {
  icon: ComponentType<{ className?: string }>  // Icon component (File04, File06, CheckCircle, etc.)
  iconColor: "brand" | "success" | "warning" | "error"  // Icon/FeaturedIcon color
  title: string                                 // File name or "Invoice by [Vendor]"
  badgeText: string                            // Badge label (Uploading, Processing, etc.)
  badgeColor: "gray-blue" | "success" | "warning" | "error"  // Badge color
  helperText?: string                          // Optional helper text (file size, status message)
  showCancelButton?: boolean                   // Whether to show cancel/trash button
  onCancel?: () => void                        // Cancel button click handler
}
```

**Usage:**
```tsx
<CardHeader
  icon={File04}
  iconColor="brand"
  title="invoice-march-2024.pdf"
  badgeText="Uploading"
  badgeColor="gray-blue"
  helperText="2 MB"
  showCancelButton
  onCancel={() => console.log('Cancelled')}
/>
```

---

### 2. CardProgress

**Purpose:** Displays a progress bar for operations in progress.

**Props:**
```typescript
interface CardProgressProps {
  value: number      // Progress percentage (0-100)
  show?: boolean     // Whether to show the progress bar (default: true)
}
```

**Usage:**
```tsx
<CardProgress value={75} />
<CardProgress value={90} show={isProcessing} />
```

---

### 3. InvoiceDetails

**Purpose:** Displays invoice description, date, and amount.

**Props:**
```typescript
interface InvoiceDetailsProps {
  description: string  // Invoice description
  date: string        // Invoice date
  amount: string      // Invoice amount
  show?: boolean      // Whether to show this section (default: true)
}
```

**Usage:**
```tsx
<InvoiceDetails
  description="Fastener nuts assortment including SPAC HGLF Os, Lt, and SPL types"
  date="Mar 15, 2024"
  amount="$2,450.00"
/>

<InvoiceDetails
  description={invoiceInfo?.description || ""}
  date={invoiceInfo?.date || ""}
  amount={invoiceInfo?.amount || ""}
  show={!!invoiceInfo}
/>
```

---

### 4. OriginalFileLink

**Purpose:** Displays a clickable link to view the original file.

**Props:**
```typescript
interface OriginalFileLinkProps {
  filename: string      // Original filename
  show?: boolean        // Whether to show this section (default: true)
  onClick?: () => void  // Click handler
}
```

**Usage:**
```tsx
<OriginalFileLink
  filename="invoice-march-2024.pdf"
  onClick={() => window.open('/files/invoice-march-2024.pdf')}
/>
```

---

### 5. AttentionList

**Purpose:** Displays a list of warnings or caveats with warning icons.

**Props:**
```typescript
interface AttentionListProps {
  items: string[]    // Array of warning/caveat messages
  show?: boolean     // Whether to show this section (default: true)
}
```

**Usage:**
```tsx
<AttentionList
  items={[
    "This invoice is 45 days old",
    "No matching PO found in the system",
    "Vendor address differs from records"
  ]}
/>
```

---

### 6. CardActions

**Purpose:** Displays action buttons appropriate for the card state.

**Props:**
```typescript
interface CardActionsProps {
  type: "success" | "error"           // Determines button styling and defaults
  show?: boolean                      // Whether to show buttons (default: true)
  onPrimaryAction?: () => void        // Primary button click handler
  onSecondaryAction?: () => void      // Secondary button click handler
  primaryLabel?: string               // Custom primary button label
  secondaryLabel?: string             // Custom secondary button label
}
```

**Defaults by Type:**
- **success**: Primary = "Export" (primary color), Secondary = "Cancel" (secondary color)
- **error**: Primary = "Remove" (destructive color), Secondary = "Get Help" (secondary color)

**Usage:**
```tsx
<CardActions
  type="success"
  onPrimaryAction={handleExport}
  onSecondaryAction={handleCancel}
/>

<CardActions
  type="error"
  onPrimaryAction={handleRemove}
  onSecondaryAction={handleGetHelp}
  primaryLabel="Delete"
  secondaryLabel="Contact Support"
/>
```

---

## Main Component: UploadStatusCard

The main `UploadStatusCard` component orchestrates these sub-components based on the current status.

### Props

```typescript
interface UploadStatusCardProps {
  filename: string
  status: "uploading" | "processing" | "connecting" | "success" | "success-with-caveats" | "error"
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
  errorMessage?: string
  onCancel?: () => void
  onExport?: () => void
  onRemove?: () => void
  onGetHelp?: () => void
  onViewFile?: () => void
}
```

### State Compositions

Each state uses a different combination of components:

#### Uploading State
- ✅ CardHeader (File04 icon, brand color, cancel button)
- ✅ CardProgress (50%)

#### Processing State
- ✅ CardHeader (File04 icon, brand color, cancel button)
- ✅ CardProgress (75%)

#### Connecting State
- ✅ CardHeader (File06 icon, brand color, cancel button)
- ✅ InvoiceDetails
- ✅ OriginalFileLink
- ✅ CardProgress (90%)

#### Success State
- ✅ CardHeader (CheckCircle icon, success color)
- ✅ InvoiceDetails (conditional)
- ✅ OriginalFileLink
- ✅ CardActions (success type)

#### Success with Caveats State
- ✅ CardHeader (AlertTriangle icon, warning color)
- ✅ AttentionList
- ✅ InvoiceDetails (conditional)
- ✅ OriginalFileLink
- ✅ CardActions (success type)

#### Error State
- ✅ CardHeader (XCircle icon, error color)
- ✅ OriginalFileLink
- ✅ CardActions (error type)

---

## Benefits of This Architecture

### 1. **Modularity**
Each component has a single responsibility and can be tested independently.

### 2. **Reusability**
Components can be used in other contexts beyond the UploadStatusCard.

### 3. **Maintainability**
Changes to a specific section only require editing one component file.

### 4. **Flexibility**
Easy to add new states or modify existing ones by composing components differently.

### 5. **Type Safety**
Each component has well-defined TypeScript interfaces.

### 6. **Conditional Rendering**
Components have `show` props for easy conditional display without cluttering the parent.

---

## Example: Creating a Custom State

```tsx
// Custom "Validating" state
if (status === "validating") {
  return (
    <div className="bg-primary ring-1 ring-inset ring-secondary rounded-xl px-4 py-5 shadow-xs sm:p-6">
      <CardHeader
        icon={File06}
        iconColor="brand"
        title={`Invoice by ${invoiceInfo.vendor}`}
        badgeText="Validating"
        badgeColor="gray-blue"
        helperText="Running validation checks..."
      />
      
      <InvoiceDetails
        description={invoiceInfo.description}
        date={invoiceInfo.date}
        amount={invoiceInfo.amount}
      />
      
      <CardProgress value={60} />
    </div>
  )
}
```

---

## Testing Strategy

Each component can be tested independently:

```tsx
// Example: Testing CardHeader
describe('CardHeader', () => {
  it('renders with all props', () => {
    render(
      <CardHeader
        icon={File04}
        iconColor="brand"
        title="test.pdf"
        badgeText="Uploading"
        badgeColor="gray-blue"
        helperText="2 MB"
        showCancelButton
        onCancel={mockCancel}
      />
    )
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument()
    expect(screen.getByText('Uploading')).toBeInTheDocument()
    expect(screen.getByText('2 MB')).toBeInTheDocument()
  })
})
```

---

## Migration Notes

The refactored component maintains the same external API as the original monolithic version, so existing usage remains unchanged:

```tsx
// This still works exactly the same
<UploadStatusCard
  filename="invoice-march-2024.pdf"
  status="success"
  invoiceInfo={{
    vendor: "Acme Corporation",
    date: "Mar 15, 2024",
    daysAgo: 5,
    amount: "$2,450.00",
    description: "Office supplies"
  }}
/>
```

The only difference is the internal implementation is now modular and maintainable.







