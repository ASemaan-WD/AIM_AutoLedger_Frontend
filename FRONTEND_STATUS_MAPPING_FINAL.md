# Frontend Status Mapping - Final Implementation

## Date
November 13, 2025

## Summary
Completely removed dependency on Airtable's UX-Status field. All status display mapping is now done on the frontend using dictionaries.

## Status Flow

```
Airtable Status → Transform → Internal Status → Display Mapping → Display Text
```

### Example: Queued Invoice
```
"Queued" (Airtable) 
  → mapStatus() 
  → "queued" (internal) 
  → INTERNAL_TO_AIRTABLE_STATUS["queued"] 
  → "Queued" 
  → UX_STATUS_MAP["Queued"] 
  → "Exporting" (display)
```

## Dictionaries (`src/lib/airtable/schema-types.ts`)

### 1. UX_STATUS_MAP
Maps Airtable status values to user-friendly display text:
```typescript
export const UX_STATUS_MAP = {
  'Pending': 'Processing',
  'Matched': 'Processed',
  'Error': 'Attention',
  'Exported': 'Exported',
  'Queued': 'Exporting',
} as const;
```

### 2. INTERNAL_TO_AIRTABLE_STATUS
Maps internal status values back to Airtable status values:
```typescript
export const INTERNAL_TO_AIRTABLE_STATUS: Record<string, keyof typeof UX_STATUS_MAP> = {
  'pending': 'Pending',
  'open': 'Matched',
  'queued': 'Queued',
  'reviewed': 'Queued',
  'approved': 'Queued',
  'exported': 'Exported',
  'rejected': 'Error',
};
```

### 3. UX_STATUS_COLORS
Maps display text to badge colors:
```typescript
export const UX_STATUS_COLORS = {
  'Processing': 'blue',
  'Processed': 'success',
  'Exported': 'brand',
  'Attention': 'error',
  'Exporting': 'warning',
} as const;
```

## Component Implementation

Both `compact-invoice-list.tsx` and `document-details-panel.tsx` use the same pattern:

```typescript
const getDisplayStatus = (status: DocumentStatus): UXStatus => {
    // Convert internal status to Airtable status, then to display text
    const airtableStatus = INTERNAL_TO_AIRTABLE_STATUS[status] || 'Pending';
    return UX_STATUS_MAP[airtableStatus] || 'Processing';
};

const displayStatus = getDisplayStatus(value.status);
```

## Complete Mapping Table

| Airtable Status | Transform To | Internal Status | Maps Back To | Display Text | Color   |
|----------------|--------------|-----------------|--------------|--------------|---------|
| Pending        | →            | pending         | →            | Processing   | Blue    |
| Matched        | →            | open            | →            | Processed    | Success |
| Queued         | →            | queued          | →            | Exporting    | Warning |
| Exported       | →            | exported        | →            | Exported     | Brand   |
| Error          | →            | rejected        | →            | Attention    | Error   |

## Removed References

✅ Removed from `transforms.ts`:
- `INVOICE_ENTITY_FIELDS.UX_STATUS` constant
- Reading `uxStatus` from Airtable fields
- `uxStatus` property from Invoice transform return

✅ Removed from `documents.ts`:
- `uxStatus` property from `Invoice` interface

✅ Removed from `schema-types.ts`:
- `UX_STATUS: 'fldRbgpOfqRF1lis6'` field ID
- `uXStatus?: any;` from `InvoicesFields` interface
- `uXStatus?: any;` from `InvoicesRecord` interface

## Why This Works

1. **Internal status** is used for UI control flow (switch statements, conditional logic)
2. **Display text** is generated on-demand from internal status using the dictionaries
3. **No Airtable field** needed - saves API calls and simplifies schema
4. **Single source of truth** - all display logic in one place

## Testing

To verify correct mapping, check these scenarios:

| When Invoice Has Status | Badge Should Show |
|------------------------|-------------------|
| pending                | Processing        |
| open                   | Processed         |
| queued                 | Exporting         |
| exported               | Exported          |
| rejected               | Attention         |

All mappings are applied at render time, so changes take effect immediately on refresh.

















