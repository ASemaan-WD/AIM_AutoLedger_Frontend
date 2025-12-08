# Upload Status Card - Component Architecture

## Overview

The `UploadStatusCard` is a modular, component-based system for displaying invoice upload and processing states. It uses shared components for maximum reusability and consistency across all states.

## Directory Structure

```
upload-status/
├── components/
│   ├── shared.tsx              # Shared UI components (NEW)
│   ├── card-layout.tsx         # Legacy layout component
│   ├── card-header.tsx         # Legacy header component
│   ├── card-progress.tsx       # Progress bar
│   ├── invoice-details.tsx     # Legacy invoice details
│   ├── original-file-link.tsx  # Legacy file link
│   ├── attention-list.tsx      # Warning/issue list
│   ├── card-actions.tsx        # Legacy action buttons
│   ├── issue-details-table.tsx # Detailed issues table
│   └── index.tsx               # Barrel exports
├── modals/
│   ├── contact-vendor-modal.tsx
│   ├── delete-file-modal.tsx
│   ├── export-with-issues-modal.tsx
│   └── index.tsx
├── fixtures.ts                 # Mock data & state configurations
├── upload-status-card.tsx      # Main component
├── COMPONENT_ARCHITECTURE.md   # This file
├── FIXTURES_GUIDE.md           # Fixtures documentation
├── QUICK_REFERENCE.md          # Quick reference
└── README.md                   # Usage documentation
```

## Shared Components (components/shared.tsx)

These components ensure visual consistency across all card states:

### CardContainer

Wrapper for all card states with consistent styling.

```tsx
<CardContainer>
  {/* Card content */}
</CardContainer>
```

### CardHeaderSection

Container for the header content area.

```tsx
<CardHeaderSection>
  <StatusBadge color="success">Complete</StatusBadge>
  <InvoiceHeader ... />
</CardHeaderSection>
```

### StatusBadge

Badge displayed at the top of each card.

```tsx
<StatusBadge color="gray-blue">Processing</StatusBadge>
<StatusBadge color="brand">Complete</StatusBadge>
<StatusBadge color="success">Exported</StatusBadge>
<StatusBadge color="warning">Needs Review</StatusBadge>
<StatusBadge color="error">Error Occurred</StatusBadge>
```

### InvoiceHeader

Displays vendor name, date, description, and amount.

```tsx
<InvoiceHeader 
  title="Acme Corporation" 
  subtitle="Mar 15, 2024"
  description="Fastener nuts assortment"
  amount="$2,450.00"
  varianceInfo={{ amount: '$100.00', direction: 'over' }}
/>
```

### StatusMessage

Message displayed below invoice header.

```tsx
<StatusMessage>Processing...</StatusMessage>
<StatusMessage variant="success">✓ Everything checks out</StatusMessage>
<StatusMessage variant="error">Unable to process this file</StatusMessage>
<StatusMessage variant="brand">✓ Everything checks out</StatusMessage>
```

### CardFooter

Footer container for file link and action buttons.

```tsx
<CardFooter>
  <FileLink filename="invoice.pdf" onClick={handleViewFile} />
  <ActionButtons>{/* buttons */}</ActionButtons>
</CardFooter>
```

### FileLink

Clickable link to view the original file.

```tsx
<FileLink filename="invoice-march-2024.pdf" onClick={handleViewFile} />
```

### ActionButtons

Container for action buttons.

```tsx
<ActionButtons>
  <Button>Cancel</Button>
  <Button>Export</Button>
</ActionButtons>
```

## State Compositions

Each state uses shared components consistently:

### Uploading
- `StatusBadge` (gray-blue): "Uploading"
- `InvoiceHeader`: filename, file size
- `CardProgress`: 0%
- Footer: Cancel button only

### Processing
- `StatusBadge` (gray-blue): "Processing"
- `InvoiceHeader`: vendor, date, description, amount
- `StatusMessage`: processing status
- `CardProgress`: dynamic %
- Footer: file link + Cancel button

### Connecting/Matching
- `StatusBadge` (gray-blue): "Matching"
- `InvoiceHeader`: vendor, date, description, amount
- `StatusMessage`: "Checking with AIM Vision..."
- `CardProgress`: dynamic %
- Footer: file link + Cancel button

### Success (Complete)
- `StatusBadge` (brand/blue): "Complete"
- `InvoiceHeader`: vendor, date, description, amount
- `StatusMessage` (brand): "✓ Everything checks out"
- Footer: file link + Cancel/Export buttons

### Success with Caveats (Needs Review)
- `StatusBadge` (warning): "Needs Review"
- `InvoiceHeader`: vendor, date, description, amount + variance
- Analysis Summary (optional)
- `IssueDetailsTable` or `AttentionList`
- Footer: file link + Dropdown menu + Contact Vendor + Export

### Exported
- `StatusBadge` (success): "Exported"
- `InvoiceHeader`: vendor, date, description, amount
- `StatusMessage` (success): "✓ Successfully exported to AIM"
- Footer: file link only

### Error States (error, processing-error, duplicate, no-match)
- `StatusBadge` (error): varies by state
- `InvoiceHeader`: vendor/filename, date, description, amount
- `StatusMessage` (error): error message
- Footer: file link + Get Help + Remove buttons

## Mock Data System

The component uses 3 consistent mock invoices across all states:

| Invoice | Vendor | Amount | Used For |
|---------|--------|--------|----------|
| 1 | Acme Corporation | $2,450.00 | Standard flow (uploading → exported) |
| 2 | RB&W Corporation of Canada | $31,371.22 | Success with caveats (has issues) |
| 3 | Global Industrial Supplies | $847.50 | Error states |

See `fixtures.ts` for full mock data definitions.

## Benefits

### 1. **Consistency**
All states use the same shared components, ensuring visual uniformity.

### 2. **Reusability**
Shared components can be used independently or in new states.

### 3. **Maintainability**
Changes to a shared component automatically update all states.

### 4. **Type Safety**
All components have TypeScript interfaces.

### 5. **Easy Testing**
Shared components can be tested in isolation.

## Adding a New State

1. Add status type to `UploadStatus` union
2. Add fixture data to `fixtures.ts`
3. Add state description to `stateDescriptions`
4. Implement render logic using shared components:

```tsx
if (status === "new-state") {
  return (
    <CardContainer>
      <CardHeaderSection>
        <StatusBadge color="brand">New State</StatusBadge>
        <InvoiceHeader 
          title={invoice?.vendor || getCardTitle()} 
          subtitle={invoice?.date}
          description={invoice?.description}
          amount={invoice?.amount}
        />
        <StatusMessage>Status message here</StatusMessage>
      </CardHeaderSection>
      <CardFooter>
        <FileLink filename={filename} onClick={handleViewFile} />
        <ActionButtons>
          {/* Action buttons */}
        </ActionButtons>
      </CardFooter>
    </CardContainer>
  )
}
```

## Migration Notes

The refactored component maintains backward compatibility. Existing usage remains unchanged:

```tsx
<UploadStatusCard
  filename="invoice.pdf"
  status="success"
  invoices={[{
    vendor: "Acme Corporation",
    date: "Mar 15, 2024",
    daysAgo: 5,
    amount: "$2,450.00",
    description: "Office supplies"
  }]}
  onExport={handleExport}
/>
```
