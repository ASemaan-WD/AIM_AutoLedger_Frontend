# Frontend Status Mapping Implementation

## Date
November 13, 2025

## Overview
Simplified status display by removing dependency on Airtable's UX-Status field. The application now maps the `Status` field directly on the frontend using a dictionary.

## Key Changes

### Removed UX-Status Field Dependency
- **Before**: Application read `uxStatus` field from Airtable (formula field)
- **After**: Application uses only the `Status` field and maps it on the frontend

### Status Mapping Dictionary

Located in `src/lib/airtable/schema-types.ts`:

```typescript
// Status display mapping - maps Airtable Status values to user-friendly display text
// This mapping is applied on the frontend only, no UX-Status field needed from Airtable
export const UX_STATUS_MAP = {
  'Pending': 'Processing',
  'Matched': 'Processed',
  'Error': 'Attention',
  'Exported': 'Exported',
  'Queued': 'Exporting',
} as const;

// Display status types (what users see in the UI)
export type UXStatus = 'Processing' | 'Processed' | 'Attention' | 'Exported' | 'Exporting';

// Status color mapping for display
export const UX_STATUS_COLORS = {
  'Processing': 'blue',
  'Processed': 'success',
  'Exported': 'brand',
  'Attention': 'error',
  'Exporting': 'warning',
} as const;
```

## Files Modified

### 1. Schema Types (`src/lib/airtable/schema-types.ts`)
- Added clear comments explaining this is frontend-only mapping
- No changes to actual mapping values

### 2. Transforms (`src/lib/airtable/transforms.ts`)
- Removed `UX_STATUS` field constant
- Removed reading of `uxStatus` field from Airtable
- Invoice transform no longer includes `uxStatus` property

**Before:**
```typescript
const uxStatus = fields[INVOICE_ENTITY_FIELDS.UX_STATUS] as 'Processing' | 'Processed' | 'Attention' | 'Exported' | undefined;

return {
  // ...
  uxStatus, // User-friendly status from Airtable formula
  // ...
};
```

**After:**
```typescript
return {
  // ...
  // uxStatus removed - using frontend mapping instead
  // ...
};
```

### 3. Invoice Type (`src/types/documents.ts`)
- Removed `uxStatus` property from `Invoice` interface

**Before:**
```typescript
export interface Invoice extends BaseDocument {
  // ...
  uxStatus?: 'Processing' | 'Processed' | 'Attention' | 'Exported';
}
```

**After:**
```typescript
export interface Invoice extends BaseDocument {
  // ...
  // uxStatus removed
}
```

### 4. Compact Invoice List (`src/components/documents/compact-invoice-list.tsx`)
- Replaced `getUXStatus()` with `getDisplayStatus()`
- Maps status directly using the dictionary

**Before:**
```typescript
const getUXStatus = (): UXStatus => {
    if (value.uxStatus) {
        return value.uxStatus;  // Check Airtable field first
    }
    return UX_STATUS_MAP[value.status] || 'Processing';
};

const uxStatus = getUXStatus();
```

**After:**
```typescript
const getDisplayStatus = (status: DocumentStatus): UXStatus => {
    // Map the Airtable Status field to display text
    const airtableStatus = status.charAt(0).toUpperCase() + status.slice(1);
    return UX_STATUS_MAP[airtableStatus] || 'Processing';
};

const displayStatus = getDisplayStatus(value.status);
```

### 5. Document Details Panel (`src/components/documents/document-details-panel.tsx`)
- Replaced `getUXStatus()` with `getDisplayStatus()`
- Same mapping logic as compact invoice list

**Before:**
```typescript
const getUXStatus = (invoice: Invoice): UXStatus => {
    if (invoice.uxStatus) {
        return invoice.uxStatus;
    }
    return UX_STATUS_MAP[invoice.status] || 'Processing';
};

<Badge>{getUXStatus(currentDoc as Invoice)}</Badge>
```

**After:**
```typescript
const getDisplayStatus = (status: DocumentStatus): UXStatus => {
    const airtableStatus = status.charAt(0).toUpperCase() + status.slice(1);
    return UX_STATUS_MAP[airtableStatus] || 'Processing';
};

<Badge>{getDisplayStatus(currentDoc.status)}</Badge>
```

## How It Works

### Status Flow
1. **Airtable stores**: `Status` field with values: `Pending`, `Matched`, `Queued`, `Exported`, `Error`
2. **Transform layer converts**: Airtable values to lowercase internal values: `pending`, `open`, `queued`, `exported`, `rejected`
3. **UI layer maps**: Internal values back to capitalized Airtable values, then uses dictionary to get display text

### Example Flow

```
Airtable: "Queued"
    ↓
Transform: "queued" (lowercase internal)
    ↓
UI Capitalize: "Queued"
    ↓
Dictionary Lookup: UX_STATUS_MAP['Queued'] = 'Exporting'
    ↓
Display: "Exporting"
```

## Benefits

1. **Simpler**: No need to maintain UX-Status formula field in Airtable
2. **Faster**: One less field to read from Airtable API
3. **Centralized**: All display logic in one place (`UX_STATUS_MAP`)
4. **Flexible**: Easy to change display text without Airtable formula updates

## Status Mapping Reference

| Airtable Status | Internal Status | Display Text | Color   |
|----------------|----------------|--------------|---------|
| Pending        | pending        | Processing   | Blue    |
| Matched        | open           | Processed    | Success |
| Queued         | queued         | Exporting    | Warning |
| Exported       | exported       | Exported     | Brand   |
| Error          | rejected       | Attention    | Error   |

## Testing Checklist

- [x] Remove uxStatus from Invoice type
- [x] Remove uxStatus from transforms
- [x] Update compact-invoice-list to use getDisplayStatus
- [x] Update document-details-panel to use getDisplayStatus
- [x] Add comments to UX_STATUS_MAP explaining it's frontend-only
- [x] No linting errors
- [x] Status badges display correctly in left panel
- [x] Status badges display correctly in right panel

## Notes

- The internal status values (lowercase) remain unchanged for control flow logic
- Only the display/badge text uses the new mapping
- The UX-Status field can be removed from Airtable (it's no longer used)
- If Airtable formula changes, only frontend dictionary needs updating

