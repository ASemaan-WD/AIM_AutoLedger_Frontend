# Invoice Status Polling Implementation

## Summary

Implemented real-time polling system that checks Airtable every 8 seconds for invoices whose status was updated in the past 10 seconds using the new `Status-Modified-Time` field.

## Changes Made

### 1. Schema Updates
- ✅ Fetched latest schema from Airtable
- ✅ Updated `latest_schema.json` with `Status-Modified-Time` field
- ✅ Regenerated `schema-types.ts` with new field (Field ID: `fldGcJS6M2X2TPHbS`)
- ✅ Updated `AIRTABLE_SCHEMA.md` documentation
- ✅ Restored missing status constants (`FILE_STATUS`, `INVOICE_STATUS`, etc.)

### 2. New Polling Hook
**File:** `src/lib/airtable/use-invoice-polling.ts`

Features:
- Polls Airtable every 8 seconds (configurable)
- Checks for invoices with status updates in past 10 seconds (configurable)
- Uses Airtable formula: `IS_AFTER({Status-Modified-Time}, "<timestamp>")`
- Tracks recently updated invoice IDs
- Callback support for custom update handling
- Can be enabled/disabled dynamically

```typescript
const { updatedInvoiceIds, isPolling, lastPollTime } = useInvoicePolling({
    interval: 8000, // Poll every 8 seconds
    updateWindow: 10000, // Check past 10 seconds
    enabled: true,
    onUpdatesDetected: (invoices) => {
        // Handle updates
    }
});
```

### 3. Invoices Page Integration
**File:** `src/app/(app)/invoices/page.tsx`

- Integrated polling hook
- Auto-refreshes invoice list when updates detected
- Passes `updatedInvoiceIds` to child components
- Console logs when updates are detected

### 4. Visual Indicators

#### Left Panel (CompactInvoiceList)
**File:** `src/components/documents/compact-invoice-list.tsx`

- Blue ring highlight for recently updated invoices
- Pulsing blue dot indicator in top-right corner
- Light blue background tint
- Automatically updates when new data arrives

#### Right Panel (DocumentDetailsPanel)
**File:** `src/components/documents/document-details-panel.tsx`

- Added `isRecentlyUpdated` prop
- Can be used to show update indicators in the details view

## How It Works

### Polling Flow

```
Every 8 seconds:
├── Calculate timestamp (10 seconds ago)
├── Query Airtable with formula: IS_AFTER({Status-Modified-Time}, "timestamp")
├── If updates found:
│   ├── Track invoice IDs in Set
│   ├── Trigger callback with full invoice data
│   └── Parent component refreshes invoice list
└── Update lastPollTime

Client UI:
├── Left Panel: Highlights updated invoices with blue indicator
├── Center Panel: PDF viewer (no changes needed)
└── Right Panel: Receives isRecentlyUpdated flag
```

### Airtable Query Example

```typescript
const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
const formula = `IS_AFTER({Status-Modified-Time}, "${tenSecondsAgo}")`;

// Query: /api/airtable/Invoices?filterByFormula=<encoded formula>
```

## Testing

Created comprehensive test scripts:

1. **`test-status-modified-time.js`**
   - Tests basic 10-second window query
   - Verifies formula syntax

2. **`test-status-modified-time-comprehensive.js`**
   - Tests multiple time windows (10s, 1m, 1h, 24h)
   - Shows sample results
   - Provides usage examples

### Test Results
- ✅ Formula syntax validated
- ✅ 10-second window query works
- ✅ Found 5 invoices updated in past hour
- ✅ Found 9 invoices updated in past 24 hours

## Configuration Options

### Polling Interval
Change polling frequency in `invoices/page.tsx`:

```typescript
const { updatedInvoiceIds } = useInvoicePolling({
    interval: 8000, // 8 seconds (default)
});
```

### Update Window
Change how far back to check:

```typescript
const { updatedInvoiceIds } = useInvoicePolling({
    updateWindow: 10000, // 10 seconds (default)
});
```

### Disable Polling
```typescript
const { updatedInvoiceIds } = useInvoicePolling({
    enabled: false, // Disable polling
});
```

## Performance Considerations

- Polls every 8 seconds (120 requests/minute)
- Uses Airtable's filterByFormula (efficient server-side filtering)
- Only fetches invoices that changed (not entire table)
- maxRecords: 50 (reasonable limit)
- Sorted by Status-Modified-Time descending (most recent first)

## Future Enhancements

1. Add visual timestamp showing when last update occurred
2. Add sound/notification when updates detected
3. Add manual refresh button
4. Store update history
5. Add settings to configure intervals
6. Add analytics for update frequency
7. Highlight specific fields that changed

## Files Modified

1. `latest_schema.json` - Added Status-Modified-Time field
2. `src/lib/airtable/schema-types.ts` - Regenerated with new field + restored constants
3. `AIRTABLE_SCHEMA.md` - Added field documentation and usage examples
4. `src/lib/airtable/use-invoice-polling.ts` - **NEW** polling hook
5. `src/app/(app)/invoices/page.tsx` - Integrated polling
6. `src/components/documents/compact-invoice-list.tsx` - Visual indicators
7. `src/components/documents/document-details-panel.tsx` - Added isRecentlyUpdated prop
8. `test-status-modified-time.js` - **NEW** basic test script
9. `test-status-modified-time-comprehensive.js` - **NEW** comprehensive test script

## Documentation

See `AIRTABLE_SCHEMA.md` section "Status-Modified-Time Field Usage" for:
- Query examples
- React hook usage
- Formula syntax
- Best practices

















