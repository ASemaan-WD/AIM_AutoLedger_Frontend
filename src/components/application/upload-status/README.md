# Upload Status Card Component

A reusable card component for displaying various upload and processing states, built entirely with Untitled UI components.

## Usage

```tsx
import { UploadStatusCard } from "@/components/application/upload-status/upload-status-card"

// Uploading state
<UploadStatusCard
  filename="invoice-march-2024.pdf"
  status="uploading"
/>

// Processing state
<UploadStatusCard
  filename="invoice-march-2024.pdf"
  status="processing"
  pageCount={4}
  invoiceInfo={{
    vendor: "Acme Corporation",
    date: "Mar 15, 2024",
    daysAgo: 5,
    amount: "$2,450.00",
    description: "Office supplies and equipment"
  }}
/>

// Analyzing state
<UploadStatusCard
  filename="invoice-march-2024.pdf"
  status="connecting"
  invoiceInfo={{
    vendor: "Acme Corporation",
    date: "Mar 15, 2024",
    daysAgo: 5,
    amount: "$2,450.00",
    description: "Office supplies and equipment"
  }}
/>

// Success state
<UploadStatusCard
  filename="invoice-march-2024.pdf"
  status="success"
  invoiceInfo={{
    vendor: "Acme Corporation",
    date: "Mar 15, 2024",
    daysAgo: 5,
    amount: "$2,450.00",
    description: "Office supplies and equipment"
  }}
/>

// Success with caveats
<UploadStatusCard
  filename="invoice-march-2024.pdf"
  status="success-with-caveats"
  invoiceInfo={{
    vendor: "Acme Corporation",
    date: "Mar 15, 2024",
    daysAgo: 5,
    amount: "$2,450.00",
    description: "Office supplies and equipment"
  }}
  caveats={[
    "This invoice is 45 days old",
    "No matching PO found in the system"
  ]}
/>

// Error state
<UploadStatusCard
  filename="invoice-march-2024.pdf"
  status="error"
  errorMessage="Unable to extract text from this document."
/>
```

## Props

### UploadStatusCardProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `filename` | `string` | Yes | The name of the uploaded file |
| `status` | `UploadStatus` | Yes | Current status: `"uploading"`, `"processing"`, `"connecting"`, `"success"`, `"success-with-caveats"`, or `"error"` |
| `pageCount` | `number` | No | Number of pages in document (shown during processing) |
| `invoiceInfo` | `InvoiceInfo` | No | Invoice details to display |
| `caveats` | `string[]` | No | List of warnings for success-with-caveats state |
| `errorMessage` | `string` | No | Error message for error state |

### InvoiceInfo

| Prop | Type | Description |
|------|------|-------------|
| `vendor` | `string` | Vendor/company name |
| `date` | `string` | Invoice date (formatted) |
| `daysAgo` | `number` | Days since invoice date |
| `amount` | `string` | Invoice amount (formatted) |
| `description` | `string` | Invoice description |

## States

### 1. Uploading
Shows upload progress with a progress bar and percentage. Includes a cancel button.

### 2. Processing
Shows processing progress with page count information. Includes a cancel button.

### 3. Connecting/Analyzing
Shows invoice details while connecting to AIM. Includes a link to the original file and a cancel button.

### 4. Success
Shows success message with action buttons (Export, Cancel) and link to original file.

### 5. Success with Caveats
Shows success message with warnings/caveats listed. Includes action buttons and link to original file.

### 6. Error
Shows error message with action buttons (Remove, Get Help) and link to original file.

## Components Used

This component reuses these Untitled UI components:
- `Badge` - For status indicators
- `Button` - For action buttons
- `ProgressBar` - For upload/processing progress
- `FeaturedIcon` - For state icons
- Icons from `@untitledui/icons`

## Demo

View all states at `/upload-status-demo`

## Fixtures

The component uses a centralized fixtures system for easy testing and development. See [FIXTURES_GUIDE.md](./FIXTURES_GUIDE.md) for details on how to use fixtures.

Quick example:
```tsx
import { uploadStatusFixtures } from "@/components/application/upload-status/fixtures"

<UploadStatusCard {...uploadStatusFixtures.success} />
```

## Documentation

- **[FIXTURES_GUIDE.md](./FIXTURES_GUIDE.md)** - How to use fixtures for testing and development
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Technical reference and quick start guide
- **[COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md)** - Detailed component architecture and sub-components














