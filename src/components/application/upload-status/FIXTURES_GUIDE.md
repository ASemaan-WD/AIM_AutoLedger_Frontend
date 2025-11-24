# Upload Status Card - Fixtures Guide

## Overview

The Upload Status Card uses a centralized fixtures system that serves as a "component library" for easy viewing and updating of all states. This guide explains how to use fixtures effectively.

## Component Library Workflow

### Central Fixtures File

The `fixtures.ts` file serves as the single source of truth for all component states:

```typescript
// src/components/application/upload-status/fixtures.ts

export const uploadStatusFixtures = {
  uploading: { /* fixture data */ },
  processing: { /* fixture data */ },
  connecting: { /* fixture data */ },
  success: { /* fixture data */ },
  successWithCaveats: { /* fixture data */ },
  error: { /* fixture data */ },
}

export const stateDescriptions = {
  uploading: { title: "...", description: "..." },
  // ... other states
}
```

### Demo Page (Component Library)

The `/upload-status-demo` page imports and displays all fixtures:

```typescript
import { uploadStatusFixtures, stateDescriptions } from "@/components/application/upload-status/fixtures"

<UploadStatusCard {...uploadStatusFixtures.uploading} />
<UploadStatusCard {...uploadStatusFixtures.processing} />
// ... etc
```

**Benefits:**
- View all states in one place
- Update `fixtures.ts` to see changes reflected immediately
- Serves as living documentation
- Easy to share with designers/stakeholders

### Implementation Pages

Pages like `home2` use the same component but with real data:

```typescript
import { UploadStatusCard } from "@/components/application/upload-status/upload-status-card"
import type { UploadStatus } from "@/components/application/upload-status/upload-status-card"

<UploadStatusCard
  filename={file.name}
  status={file.status}
  invoiceInfo={file.invoiceInfo}
  onExport={() => handleExport(file.id)}
  // ... other props
/>
```

## How to Use Fixtures

### To modify a state's appearance:

1. **Edit fixtures.ts**
   ```typescript
   export const uploadStatusFixtures = {
     success: {
       filename: "invoice-march-2024.pdf",
       status: "success",
       invoiceInfo: {
         vendor: "Updated Vendor Name", // ← Change here
         // ...
       }
     }
   }
   ```

2. **View changes in `/upload-status-demo`**
   - Navigate to the demo page
   - See the updated state immediately

3. **Changes automatically reflect in all implementations**
   - Any page using the component will use the same structure
   - Only data differs between demo and production

### To add a new state:

1. Add state to `UploadStatus` type in `upload-status-card.tsx`
2. Add fixture to `fixtures.ts`
3. Add state description to `stateDescriptions`
4. Implement state logic in `upload-status-card.tsx`
5. Add to demo page

## Available Fixtures

All fixtures are exported from `fixtures.ts`:

- `uploadStatusFixtures` - Object containing fixture data for each state
- `stateDescriptions` - Object containing titles and descriptions for each state
- `sampleInvoiceInfo` - Sample invoice data for use in fixtures
- `sampleIssues` - Sample issues array for success-with-caveats state
- `sampleDuplicateInfo` - Sample duplicate information

## Fixture Structure

Each fixture in `uploadStatusFixtures` follows the `UploadStatusCardProps` interface (minus callback functions):

```typescript
{
  filename: string
  status: UploadStatus
  pageCount?: number
  fileSize?: number
  invoiceInfo?: InvoiceInfo
  issues?: string[]
  errorMessage?: string
  duplicateInfo?: DuplicateInfo
  // Note: Callbacks (onCancel, onExport, etc.) are omitted from fixtures
}
```

## Pages Using Fixtures

### 1. `/upload-status-demo` - Component Library
- **Purpose**: Visual reference for all upload status card states
- **Usage**: Design review, documentation, component testing
- **Data Source**: `fixtures.ts`
- **Update Process**: Edit `fixtures.ts` → changes reflect immediately

### 2. `/home2` - New Upload Experience
- **Purpose**: Production-ready upload page with new status cards
- **Features**:
  - File upload with drag & drop
  - Real-time status transitions (uploading → processing → connecting → success/error)
  - Simulated workflow for demonstration
  - Full action handlers (cancel, export, remove, get help, view file)

## Benefits of Fixtures System

### 1. **Single Source of Truth**
- Fixtures file defines all states
- Easy to update and maintain
- Consistent across all usages

### 2. **Component Library**
- Demo page serves as living documentation
- Designers can review all states
- Stakeholders can see progress
- Easy to test edge cases

### 3. **Rapid Development**
- Update fixtures to see changes immediately
- No need to trigger real workflows
- Test all states in one place

## Testing with Fixtures

### Component Library Testing
```bash
# Navigate to demo page
http://localhost:3000/upload-status-demo

# Verify all states render correctly
# Test interactions (buttons, links)
# Review with design team
```

### Using Fixtures in Tests
```typescript
import { uploadStatusFixtures } from "@/components/application/upload-status/fixtures"

test('renders success state correctly', () => {
  render(<UploadStatusCard {...uploadStatusFixtures.success} />)
  // ... assertions
})
```

## Resources

- **Fixtures File**: `src/components/application/upload-status/fixtures.ts`
- **Component Documentation**: `src/components/application/upload-status/COMPONENT_ARCHITECTURE.md`
- **Quick Reference**: `src/components/application/upload-status/QUICK_REFERENCE.md`
- **Demo Page**: `/upload-status-demo`
- **Implementation**: `/home2`

