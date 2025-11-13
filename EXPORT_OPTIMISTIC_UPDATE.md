# Export Button Optimistic Update Implementation

## Overview
Implemented optimistic UI updates for the Export button in the invoices view. The button now provides instant visual feedback while waiting for the Airtable API to confirm the status change.

## Changes Made

### 1. Invoice Page Handler (`src/app/(app)/invoices/page.tsx`)
**Function**: `handleSendForApproval`

**Implementation**:
- **Validation**: Checks if invoice can be marked as reviewed before proceeding
- **Optimistic Update**: Immediately updates the UI to show "Exporting" status (queued)
- **API Call**: Sends request to Airtable to update status to 'queued'
- **Error Handling**: Reverts the optimistic update if the API call fails
- **Polling Confirmation**: The existing polling mechanism confirms the update and shows visual indicators

**Code Flow**:
```typescript
1. Validate invoice has required fields
2. Optimistically update UI: status = 'queued' → Shows "Exporting" badge
3. Call Airtable API to persist the change
4. Existing polling (8 seconds) confirms update from Airtable
5. Visual indicator shows recently updated invoices
6. If error: Revert to original status and show error message
```

### 2. Document Details Panel (`src/components/documents/document-details-panel.tsx`)

**Added State**:
- `isExporting`: Tracks export operation in progress

**Export Button Updates**:
- Shows loading spinner during export operation
- Disables button while exporting
- Handles async save + export flow properly
- Prevents multiple simultaneous exports
- Also disables Save button during export

**Benefits**:
- User gets immediate visual feedback
- Button shows loading state during operation
- No accidental double-clicks
- Proper error handling with revert

## User Experience Flow

### Success Path:
1. User clicks "Export" button
2. **Instant**: Button shows loading spinner
3. **Instant**: Invoice badge changes to "Exporting" (yellow/warning color)
4. **Instant**: Details panel shows animated spinner with "Exporting" message
5. **~100-500ms**: Airtable API confirms the update
6. **~8 seconds**: Polling detects the change and adds visual indicator
7. Invoice moves to appropriate filtered view if user has filters active

### Error Path:
1. User clicks "Export" button
2. **Instant**: Button shows loading spinner
3. **Instant**: Invoice badge changes to "Exporting"
4. **~100-500ms**: Airtable API returns error
5. **Instant**: Invoice badge reverts to "Processed"
6. **Instant**: Alert shows: "Failed to export invoice. Please try again."

## Status Mapping

| Internal Status | Airtable Status | UX Display | Badge Color |
|----------------|-----------------|------------|-------------|
| `queued` | `Queued` | Exporting | Warning (Yellow) |
| `open` | `Matched` | Processed | Success (Green) |

## Visual Feedback

### QueuedIndicator Component
The `QueuedIndicator` component displays an animated spinner to indicate active export processing:

```tsx
<div className="flex items-center gap-2 mb-2">
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-warning-600 border-t-transparent"></div>
    <span className="text-sm font-medium">
        Exporting
    </span>
</div>
```

**Features**:
- Animated spinner (matches Processing state visual language)
- Warning color scheme (orange/yellow) to indicate active operation
- Clear "Exporting" label
- Locked fields message

## Integration with Existing Features

### Polling System (`use-invoice-polling.ts`)
- Polls every 8 seconds for status changes
- Checks invoices updated in the last 10 seconds
- Adds visual indicators for recently updated invoices
- Works seamlessly with optimistic updates

### Invoice Hooks (`invoice-hooks.ts`)
- `updateInvoice()`: Performs API call to Airtable
- `updateInvoicesInPlace()`: Updates local state without refetching
- Both functions support the optimistic update pattern

## Testing Recommendations

1. **Happy Path**:
   - Click Export on a valid invoice
   - Verify instant status change to "Exporting"
   - Verify polling confirms the update within 8 seconds
   - Check visual indicator appears

2. **Validation**:
   - Try to export invoice with missing required fields
   - Verify validation alert appears
   - Verify no API call is made

3. **Error Handling**:
   - Simulate API failure (disconnect network)
   - Click Export
   - Verify status reverts to original
   - Verify error alert appears

4. **Concurrent Operations**:
   - Click Export button
   - Try to click Save while export is in progress
   - Verify both buttons are disabled during export

5. **Multiple Invoices**:
   - Export one invoice
   - Immediately select another invoice
   - Verify the first invoice shows "Exporting" status
   - Export the second invoice
   - Verify both show correct statuses

## Future Enhancements

1. **Toast Notifications**: Replace alerts with toast notifications for better UX
2. **Batch Export**: Allow selecting multiple invoices to export at once
3. **Export Progress**: Show progress bar for batch exports
4. **Undo Action**: Add ability to undo export within a few seconds
5. **Retry Logic**: Automatic retry with exponential backoff on API failures

