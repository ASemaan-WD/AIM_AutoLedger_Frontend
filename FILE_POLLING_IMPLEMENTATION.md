# File Polling Implementation

## Overview

This document details the implementation of real-time polling for the Files table, mirroring the approach used for the Invoices table. The system polls Airtable every 8 seconds for files whose status was updated in the past 10 seconds using the `Status-Modified-Time` field.

## Implementation Date

November 13, 2025

## Key Components

### 1. Status-Modified-Time Field

**Field ID**: `fldacexiDeUtwmKCV`
- **Table**: Files
- **Type**: lastModifiedTime
- **Purpose**: Tracks when the Status field was last modified
- **Auto-updated**: By Airtable when Status changes

### 2. Polling Hook (`use-file-polling.ts`)

Located at: `src/lib/airtable/use-file-polling.ts`

```typescript
export function useFilePolling(options: UseFilePollingOptions = {}): UseFilePollingResult {
  const {
    interval = 8000,        // Poll every 8 seconds
    updateWindow = 10000,   // Check past 10 seconds
    enabled = true,
    onUpdatesDetected,
  } = options;

  // Polling logic...
}
```

**Features**:
- Configurable polling interval (default: 8 seconds)
- Configurable update detection window (default: 10 seconds)
- Uses Airtable formula: `IS_AFTER({Status-Modified-Time}, "${isoString}")`
- Returns updated file IDs for UI highlighting
- Transforms raw Airtable records to application entities
- Error handling and logging

### 3. Files Hooks Update

**File**: `src/lib/airtable/files-hooks.ts`

Added `updateFilesInPlace` method to support granular state updates without full page re-renders:

```typescript
const updateFilesInPlace = useCallback((updatedFiles: AirtableFile[]) => {
    setFiles(prevFiles => {
        const updatedMap = new Map(updatedFiles.map(file => [file.id, file]));
        const updated = prevFiles.map(file =>
            updatedMap.has(file.id) ? updatedMap.get(file.id)! : file
        );
        const existingIds = new Set(prevFiles.map(f => f.id));
        const newFiles = updatedFiles.filter(f => !existingIds.has(f.id));
        return [...newFiles, ...updated];
    });
}, []);
```

**Key Benefits**:
- No flicker during updates
- Only changed items re-render
- Optimistic UI updates
- Maintains scroll position

### 4. Files Page Integration

**File**: `src/app/(app)/files/page.tsx`

```typescript
function FilesPageContent() {
    const { files, loading, error, updateFile, deleteFile, archiveFile, updateFilesInPlace } = useFiles({
        autoFetch: true
    });

    // Poll for file updates every 8 seconds
    const handleUpdatesDetected = useCallback((updatedFiles: AirtableFile[]) => {
        console.log(`🔄 Detected ${updatedFiles.length} file(s) with recent status changes`);
        
        // Update files in place without re-fetching (no flicker)
        updateFilesInPlace(updatedFiles);
        
        // Log the updated file IDs for debugging
        updatedFiles.forEach(file => {
            console.log(`  - File ${file.id}: Status updated`);
        });
    }, [updateFilesInPlace]);

    const { updatedFileIds, isPolling, lastPollTime } = useFilePolling({
        interval: 8000,
        updateWindow: 10000,
        enabled: true,
        onUpdatesDetected: handleUpdatesDetected,
    });

    // ... rest of component
}
```

## Technical Details

### Polling Mechanism

1. **Timer Setup**: Uses `setInterval` to poll every 8 seconds
2. **Query Formula**: `IS_AFTER({Status-Modified-Time}, "${isoString}")`
3. **Time Window**: Checks for updates in the past 10 seconds
4. **Sorting**: Results sorted by `Status-Modified-Time` descending

### State Management

```typescript
// In-place update strategy
const updateFilesInPlace = (updatedFiles) => {
    setFiles(prevFiles => {
        // 1. Create map of updated files
        const updatedMap = new Map(updatedFiles.map(f => [f.id, f]));
        
        // 2. Update existing files
        const updated = prevFiles.map(file =>
            updatedMap.has(file.id) ? updatedMap.get(file.id)! : file
        );
        
        // 3. Add new files
        const existingIds = new Set(prevFiles.map(f => f.id));
        const newFiles = updatedFiles.filter(f => !existingIds.has(f.id));
        
        return [...newFiles, ...updated];
    });
};
```

### Data Transformation

```typescript
function transformAirtableRecord(record: AirtableRecord): AirtableFile {
    return {
        id: record.id,
        fileID: record.fields[FIELD_IDS.FILES.FILEID],
        fileHash: record.fields[FIELD_IDS.FILES.FILEHASH],
        fileName: record.fields[FIELD_IDS.FILES.FILENAME],
        uploadedDate: record.fields[FIELD_IDS.FILES.UPLOADEDDATE],
        status: record.fields[FIELD_IDS.FILES.STATUS],
        // ... other fields
        statusModifiedTime: record.fields[FIELD_IDS.FILES.STATUS_MODIFIED_TIME],
    };
}
```

## API Endpoint

**Endpoint**: `/api/airtable/Files`

**Query Parameters**:
- `baseId`: Airtable base ID
- `filterByFormula`: `IS_AFTER({Status-Modified-Time}, "${isoString}")`
- `maxRecords`: 50
- `sort[0][field]`: Status-Modified-Time
- `sort[0][direction]`: desc

**Example Request**:
```
GET /api/airtable/Files?baseId=app...&filterByFormula=IS_AFTER({Status-Modified-Time},"2025-11-13T...Z")&maxRecords=50&sort[0][field]=Status-Modified-Time&sort[0][direction]=desc
```

## Performance Considerations

### Optimization Strategies

1. **Granular Updates**: Only updated files re-render
2. **React Reconciliation**: Leverages React's efficient diffing
3. **Memoization**: Uses `useCallback` to prevent unnecessary re-renders
4. **Limited Results**: MaxRecords set to 50 per poll

### Network Efficiency

- Polling interval: 8 seconds (configurable)
- Update window: 10 seconds (configurable)
- Formula-based filtering reduces payload size
- Only fetches recently modified records

## Error Handling

```typescript
try {
    // Polling logic
    const response = await fetch(`/api/airtable/Files?${queryParams}`);
    if (!response.ok) {
        throw new Error(`Failed to poll files: ${response.status}`);
    }
    // Process updates
} catch (err) {
    console.error('File polling error:', err);
    setError(err instanceof Error ? err.message : 'Failed to poll for updates');
}
```

## Debugging

### Console Logs

```typescript
// When updates are detected
console.log(`🔄 Detected ${updatedFiles.length} file(s) with recent status changes`);

// For each updated file
updatedFiles.forEach(file => {
    console.log(`  - File ${file.id}: Status updated`);
});
```

### Polling State

The hook returns useful debugging information:
- `updatedFileIds`: Set of recently updated file IDs
- `isPolling`: Boolean indicating if a poll is in progress
- `lastPollTime`: Timestamp of the last successful poll
- `error`: Error message if polling fails

## Schema Type Updates

### Manual Constants Preserved

After schema regeneration, the following constants are manually preserved in `schema-types.ts`:

```typescript
export const FILE_STATUS = {
  UPLOADED: 'Uploaded',
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  ERROR: 'Error',
} as const;

export const INVOICE_STATUS = { ... };
export const UX_STATUS_MAP = { ... };
export const INTERNAL_TO_AIRTABLE_STATUS = { ... };
export const UX_STATUS_COLORS = { ... };
```

## Testing

### Manual Testing Steps

1. Open files page
2. Open browser console
3. In Airtable, change a file's status
4. Wait up to 8 seconds
5. Observe console logs for polling detection
6. Verify file list updates without flicker
7. Verify detail panel updates (if file is selected)

### Expected Console Output

```
🔄 Detected 1 file(s) with recent status changes
  - File recXXXXXXXX: Status updated
```

## Documentation Updates

### AIRTABLE_SCHEMA.md

- Added `Status-Modified-Time` field to Files table
- Updated query examples to include Files
- Added React hook examples for both Invoices and Files polling

## Comparison with Invoice Polling

| Aspect | Invoices | Files |
|--------|----------|-------|
| Hook | `useInvoicePolling` | `useFilePolling` |
| Table | Invoices | Files |
| Field ID | `fldGcJS6M2X2TPHbS` | `fldacexiDeUtwmKCV` |
| Interval | 8 seconds | 8 seconds |
| Window | 10 seconds | 10 seconds |
| Update Method | `updateInvoicesInPlace` | `updateFilesInPlace` |
| Visual Indicators | Removed | N/A (not implemented) |

## Future Enhancements

Potential improvements:
1. WebSocket integration for true real-time updates
2. Exponential backoff for polling on errors
3. User preference for polling interval
4. Notification system for status changes
5. Polling statistics and analytics
6. Conditional polling (only when tab is active)

## Related Files

- `src/lib/airtable/use-file-polling.ts` - Polling hook
- `src/lib/airtable/files-hooks.ts` - Files data management
- `src/app/(app)/files/page.tsx` - Files page component
- `src/lib/airtable/schema-types.ts` - Type definitions
- `latest_schema.json` - Raw Airtable schema
- `AIRTABLE_SCHEMA.md` - Schema documentation

## Changelog

### November 13, 2025
- ✅ Added `Status-Modified-Time` field to Files table
- ✅ Created `useFilePolling` hook
- ✅ Added `updateFilesInPlace` to `useFiles` hook
- ✅ Integrated polling into files page
- ✅ Updated schema types
- ✅ Updated documentation
- ✅ Removed visual indicators (clean implementation)

---

*This implementation mirrors the successful invoice polling system and provides consistent real-time updates across the application.*

















