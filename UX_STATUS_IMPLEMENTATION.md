# UX-Status Field Implementation

## Overview

The `UX-Status` field is a formula field in Airtable's Invoices table that maps the technical Status field values to user-friendly labels for display in the UI.

## Airtable Schema

### Formula Field: UX-Status

**Field ID**: `fldRbgpOfqRF1lis6`

**Formula**:
```
SWITCH(
  {Status},
  "Pending", "Processing",
  "Matched", "Processed",
  "Error", "Attention",
  "Exported", "Exported",
  "Queued", "Processing"
)
```

### Status Mapping

| Airtable Status | UX-Status (User-Friendly) | Description |
|----------------|---------------------------|-------------|
| Pending | Processing | Invoice is being processed after upload |
| Matched | Processed | Invoice has been matched with PO data |
| Error | Attention | Invoice has errors that need attention |
| Exported | Exported | Invoice has been exported to AIM Vision |
| Queued | Processing | Invoice is queued for export |

## UI Color Scheme

The UX-Status values are displayed with specific colors in the UI:

| UX-Status | Color | Badge Color Constant |
|-----------|-------|---------------------|
| Processing | Blue | `blue` |
| Processed | Green | `success` |
| Exported | Purple | `brand` |
| Attention | Red | `error` |

## Implementation Details

### Schema Types

Constants are defined in `src/lib/airtable/schema-types.ts`:

```typescript
// UX-Status mapping (user-friendly labels)
export const UX_STATUS_MAP = {
  'Pending': 'Processing',
  'Matched': 'Processed',
  'Error': 'Attention',
  'Exported': 'Exported',
  'Queued': 'Processing',
} as const;

// UX-Status types
export type UXStatus = 'Processing' | 'Processed' | 'Attention' | 'Exported';

// Status color mapping for UX
export const UX_STATUS_COLORS = {
  'Processing': 'blue',
  'Processed': 'success',
  'Exported': 'brand',
  'Attention': 'error',
} as const;
```

### TypeScript Types

The `Invoice` interface in `src/types/documents.ts` includes the uxStatus field:

```typescript
export interface Invoice extends BaseDocument {
    // ... other fields
    uxStatus?: 'Processing' | 'Processed' | 'Attention' | 'Exported';
}
```

### Transform Functions

The `transformAirtableToInvoiceEntity` function in `src/lib/airtable/transforms.ts` reads the UX-Status field from Airtable:

```typescript
// Read UX-Status formula field (user-friendly status)
const uxStatus = fields[INVOICE_ENTITY_FIELDS.UX_STATUS] as 'Processing' | 'Processed' | 'Attention' | 'Exported' | undefined;

return {
  // ... other fields
  uxStatus, // User-friendly status from Airtable formula
  // ...
};
```

### UI Components

#### Invoice List (Left Panel)

In `src/components/documents/compact-invoice-list.tsx`:

```typescript
// Get UX-friendly status (use uxStatus from Airtable if available, otherwise map from status)
const getUXStatus = (): UXStatus => {
    if (value.uxStatus) {
        return value.uxStatus;
    }
    // Fallback to mapping from status field
    return UX_STATUS_MAP[value.status] || 'Processing';
};

const getStatusColor = (uxStatus: UXStatus) => {
    return UX_STATUS_COLORS[uxStatus] || 'gray';
};

const uxStatus = getUXStatus();

// Display in badge
<Badge size="sm" color={getStatusColor(uxStatus)} type="color">
    {uxStatus}
</Badge>
```

#### Document Details Panel (Right Panel)

In `src/components/documents/document-details-panel.tsx`:

```typescript
// Get UX-friendly status
const getUXStatus = (invoice: Invoice): UXStatus => {
    if (invoice.uxStatus) {
        return invoice.uxStatus;
    }
    // Fallback to mapping from status field
    return UX_STATUS_MAP[invoice.status] || 'Processing';
};

const getStatusColor = (uxStatus: UXStatus) => {
    return UX_STATUS_COLORS[uxStatus] || 'gray';
};

// Display in badge
<Badge 
    size="sm" 
    color={getStatusColor(getUXStatus(currentDoc as Invoice))}
    type="color"
>
    {getUXStatus(currentDoc as Invoice)}
</Badge>
```

## Fallback Behavior

The UI components implement a fallback mechanism to ensure compatibility:

1. **Primary**: Use `invoice.uxStatus` if available from Airtable
2. **Fallback**: If `uxStatus` is not present, map the `status` field using `UX_STATUS_MAP`
3. **Default**: If no mapping exists, default to `'Processing'`

This ensures that the UI works correctly even if:
- The UX-Status formula field is not yet populated
- Old records don't have the formula field
- There are data sync issues

## Testing

To test the UX-Status implementation:

1. **Navigate to the invoices page**
2. **Verify status badges**:
   - Check left panel (invoice list) shows UX-Status labels
   - Check right panel (document details) shows UX-Status labels
3. **Verify colors**:
   - Processing invoices show blue badge
   - Processed invoices show green badge
   - Exported invoices show purple badge
   - Attention invoices show red badge
4. **Test different statuses**:
   - Create/upload invoices (should show "Processing")
   - Match invoices (should show "Processed")
   - Export invoices (should show "Exported")
   - Create error invoices (should show "Attention")

## Migration Notes

- The `Status` field in Airtable remains unchanged and continues to store technical status values
- The `UX-Status` field is read-only (formula) and automatically computed
- No data migration needed - the formula field auto-populates for all records
- Backward compatibility maintained through fallback mapping

## Future Considerations

- The UX-Status field could be extended to support additional statuses as the workflow evolves
- Consider syncing the formula with UI constants to ensure consistency
- May want to add tooltips to explain what each status means to users


















