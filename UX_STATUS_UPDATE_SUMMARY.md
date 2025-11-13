# UX-Status Update Summary

## Date
November 13, 2025

## Overview
Updated the application to correctly use UX-Status from Airtable for displaying invoice statuses. Fixed the "Queued" status mapping from "Processing" to "Exporting" to match the updated Airtable formula.

## Changes Made

### 1. Airtable Schema Refresh
**Command:**
```bash
node scripts/fetch-airtable-schema.js
```

**Updated Schema:**
The UX-Status formula in Airtable (field `fldRbgpOfqRF1lis6`) maps as follows:
```
SWITCH(
  {Status},
  "Pending", "Processing",
  "Matched", "Processed",
  "Error", "Attention",
  "Exported", "Exported",
  "Queued", "Exporting"
)
```

### 2. Schema Types Updated (`src/lib/airtable/schema-types.ts`)

**Before:**
```typescript
export const UX_STATUS_MAP = {
  'Pending': 'Processing',
  'Matched': 'Processed',
  'Error': 'Attention',
  'Exported': 'Exported',
  'Queued': 'Processing',  // ❌ Wrong
} as const;

export type UXStatus = 'Processing' | 'Processed' | 'Attention' | 'Exported';

export const UX_STATUS_COLORS = {
  'Processing': 'blue',
  'Processed': 'success',
  'Exported': 'brand',
  'Attention': 'error',
} as const;
```

**After:**
```typescript
export const UX_STATUS_MAP = {
  'Pending': 'Processing',
  'Matched': 'Processed',
  'Error': 'Attention',
  'Exported': 'Exported',
  'Queued': 'Exporting',  // ✅ Correct
} as const;

export type UXStatus = 'Processing' | 'Processed' | 'Attention' | 'Exported' | 'Exporting';

export const UX_STATUS_COLORS = {
  'Processing': 'blue',
  'Processed': 'success',
  'Exported': 'brand',
  'Attention': 'error',
  'Exporting': 'warning',  // ✅ Added
} as const;
```

### 3. QueuedIndicator Component Updated (`src/components/documents/invoice-state-indicators.tsx`)

**Before:**
```tsx
export const QueuedIndicator = ({ className }: QueuedIndicatorProps) => {
    return (
        <div className={cx(
            "rounded-lg border p-3",
            "border-success bg-success-25 text-success-700",  // Green
            className
        )}>
            <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-success-primary" />
                <span className="text-sm font-medium">
                    Ready for Export  // ❌ Wrong text
                </span>
            </div>
            <p className="text-xs">
                This invoice is queued for export. All fields are locked.  // ❌ Wrong text
            </p>
        </div>
    );
};
```

**After:**
```tsx
export const QueuedIndicator = ({ className }: QueuedIndicatorProps) => {
    return (
        <div className={cx(
            "rounded-lg border p-3",
            "border-warning bg-warning-25 text-warning-700",  // ✅ Warning/Orange
            className
        )}>
            <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-warning-primary" />
                <span className="text-sm font-medium">
                    Exporting  // ✅ Correct text
                </span>
            </div>
            <p className="text-xs">
                This invoice is being exported. All fields are locked.  // ✅ Correct text
            </p>
        </div>
    );
};
```

## Status Workflow

### Internal Status Flow (Airtable)
```
Pending → Matched → Queued → Exported
                  ↓
                Error
```

### UX-Status Display (What Users See)
```
Processing → Processed → Exporting → Exported
                      ↓
                  Attention
```

### Status to UX-Status Mapping Table

| Internal Status | UX-Status    | Color/Badge | Indicator Component  |
|----------------|--------------|-------------|---------------------|
| `Pending`      | Processing   | Blue        | PendingStateIndicator |
| `Matched`      | Processed    | Success     | BalanceAlert (if balance) or none |
| `Queued`       | **Exporting** | **Warning** | **QueuedIndicator** |
| `Exported`     | Exported     | Brand       | ExportedIndicator |
| `Error`        | Attention    | Error       | ErrorAlert |

## Components Already Using UX-Status Correctly

### 1. Compact Invoice List (`src/components/documents/compact-invoice-list.tsx`)
- Uses `getUXStatus()` helper function
- Displays UX-Status in badge: `<Badge>{uxStatus}</Badge>`
- ✅ Already correct

### 2. Document Details Panel (`src/components/documents/document-details-panel.tsx`)
- Uses `getUXStatus()` helper function
- Displays UX-Status in badge: `<Badge>{getUXStatus(currentDoc as Invoice)}</Badge>`
- Internal status checks (`status === 'pending'`, `status === 'open'`, etc.) remain for UI logic
- ✅ Already correct

## How It Works

### Badge Display Logic
Both the compact invoice list and document details panel use the same pattern:

```typescript
// Get UX-friendly status (use uxStatus from Airtable if available, otherwise map from status)
const getUXStatus = (invoice: Invoice): UXStatus => {
    if (invoice.uxStatus) {
        return invoice.uxStatus;  // Preferred: Use value from Airtable formula
    }
    // Fallback to mapping from status field
    return UX_STATUS_MAP[invoice.status] || 'Processing';
};

const getStatusColor = (uxStatus: UXStatus) => {
    return UX_STATUS_COLORS[uxStatus] || 'gray';
};

// Display:
<Badge color={getStatusColor(uxStatus)} type="color">
    {uxStatus}
</Badge>
```

### State Indicator Logic
The `renderStateIndicator()` function uses **internal status** for control flow:

```typescript
const renderStateIndicator = () => {
    const status = currentDoc.status;  // Internal status for logic
    
    switch (status) {
        case 'pending':
            return <PendingStateIndicator />;
        case 'open':
            return balance ? <BalanceAlert /> : null;
        case 'queued':  // Internal status
            return <QueuedIndicator />;  // Shows "Exporting" to user
        case 'exported':
            return <ExportedIndicator />;
        case 'rejected':
            return <ErrorAlert />;
    }
};
```

## Testing Checklist

- [x] Schema fetched from Airtable
- [x] UX_STATUS_MAP updated with 'Queued' → 'Exporting'
- [x] UXStatus type includes 'Exporting'
- [x] UX_STATUS_COLORS includes 'Exporting' with 'warning' color
- [x] QueuedIndicator text changed from "Ready for Export" to "Exporting"
- [x] QueuedIndicator text changed from "queued for export" to "being exported"
- [x] QueuedIndicator styling changed from success (green) to warning (orange)
- [x] No linting errors

## Visual Changes

### Before
- Queued invoices showed: "Ready for Export" in **green** box
- Badge showed: "Processing" (incorrect)

### After
- Queued invoices show: "Exporting" in **orange/warning** box
- Badge shows: "Exporting" (correct)

## Notes

1. **Internal status vs UX-Status**: The codebase uses lowercase internal status values (`'pending'`, `'open'`, `'queued'`, etc.) for control flow, but displays the UX-Status from Airtable to users.

2. **Airtable UX-Status field**: The `uxStatus` field comes from a formula field in Airtable (`UX-Status`). It's the source of truth for display.

3. **Fallback logic**: If `uxStatus` is not available from Airtable, the code falls back to `UX_STATUS_MAP` to determine the display status.

4. **Color consistency**: The "Exporting" status uses warning color (orange/yellow) to indicate active processing, distinct from:
   - Blue (Processing - initial processing)
   - Green (Success - processed/exported)
   - Red (Error/Attention)

## Files Modified

1. `src/lib/airtable/schema-types.ts` - Updated UX status mapping and colors
2. `src/components/documents/invoice-state-indicators.tsx` - Updated QueuedIndicator text and styling
3. `latest_schema.json` - Refreshed from Airtable

## Files Already Correct (No Changes Needed)

1. `src/components/documents/compact-invoice-list.tsx` - Already uses UX-Status
2. `src/components/documents/document-details-panel.tsx` - Already uses UX-Status for badges

