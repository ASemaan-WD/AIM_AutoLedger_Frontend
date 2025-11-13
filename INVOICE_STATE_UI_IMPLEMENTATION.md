# Invoice State-Based UI Implementation

## Overview

This document describes the implementation of state-based invoice detail UI that displays appropriate visual indicators, CTAs, and field states based on the invoice's current status (Pending, Matched, Reviewed/Queued, Exported, Error).

## Implementation Date

November 6, 2025

## Files Modified

### 1. Type Definitions
- **File**: `src/types/documents.ts`
- **Changes**: 
  - Added `balance`, `balanceExplanation`, `errorCode`, `errorMessage` fields to `Invoice` interface
  - Added `isMultilineCoding` and `lines` fields for multi-line invoice support
  - Created new `InvoiceLine` interface for line item structure

### 2. State Indicator Components
- **File**: `src/components/documents/invoice-state-indicators.tsx` (NEW)
- **Components Created**:
  - `PendingStateIndicator` - Blue info box with spinner for processing state
  - `BalanceAlert` - Warning box showing balance discrepancies with explanation
  - `QueuedIndicator` - Success box indicating invoice is ready for export
  - `ErrorAlert` - Error box displaying error code and message
  - `ExportedIndicator` - Brand-colored box confirming successful export

### 3. Document Details Panel
- **File**: `src/components/documents/document-details-panel.tsx`
- **Changes**:
  - Imported new state indicator components
  - Updated `CompletenessChecker` to not show for Pending state
  - Added `renderStateIndicator()` function to display appropriate indicators per state
  - Completely rewrote `renderActionButtons()` to handle all states with proper CTAs
  - Updated `canEdit` logic to use `INVOICE_STATUS.OPEN` constant
  - Removed deprecated `RejectionReasonBanner` (replaced by `ErrorAlert`)

### 4. Invoice Coding Interface
- **File**: `src/components/documents/invoice-coding-interface.tsx`
- **Changes**:
  - Updated line item navigation to remain enabled in all states (not disabled by `disabled` prop)
  - Added comment clarifying navigation is always available for read-only states

## State-Specific Behaviors

### Pending State
**Visual Indicators:**
- Blue information box with animated spinner
- Message: "We're processing this invoice. Most fields are read-only until processing is complete."
- No completeness checker shown

**CTAs:**
- Delete button (optional)

**Field States:**
- All fields read-only
- Line item navigation enabled

**Status Badge:** Warning color (yellow/orange)

---

### Matched State (Open)
**Visual Indicators:**
- Balance alert box (if balance exists) showing:
  - Balance amount (positive or negative)
  - Explanation text
  - Warning styling
- Completeness checker (if missing fields)

**CTAs:**
- **Export** button (primary) - Saves and marks as reviewed
  - Disabled if validation fails
  - Icon: FileDownload02
- **Save** button (secondary)
  - Disabled if no changes (not dirty)
- **Delete** button (secondary, full width)

**Field States:**
- All fields editable
- Line item navigation enabled

**Status Badge:** Blue-light color

---

### Reviewed/Queued State
**Visual Indicators:**
- Green success box with clock icon
- Message: "This invoice has been reviewed and is queued for export. All fields are locked."

**CTAs:**
- None (no action buttons)

**Field States:**
- All fields read-only
- Line item navigation enabled

**Status Badge:** Success color (green)

---

### Exported State
**Visual Indicators:**
- Brand-colored success box with checkmark
- Message: "This invoice has been exported to AIM Vision. All fields are read-only."

**CTAs:**
- **View in AIM Vision** button (primary)
  - Icon: LinkExternal01
  - Opens invoice in external system

**Field States:**
- All fields read-only
- Line item navigation enabled

**Status Badge:** Brand color (blue/purple)

---

### Error State (Rejected)
**Visual Indicators:**
- Red error alert box showing:
  - Error code (if available)
  - Error message
  - Error styling

**CTAs:**
- **Delete** button (secondary)
- **Need Help** button (secondary)
  - Opens support email link
  - Icon: HelpCircle

**Field States:**
- All fields read-only
- Line item navigation enabled

**Status Badge:** Error color (red)

---

## Status Constants Mapping

From `src/lib/airtable/schema-types.ts`:

```typescript
export const INVOICE_STATUS = {
  PENDING: 'pending',
  OPEN: 'open',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPORTED: 'exported',
} as const;
```

**Display Names:**
- `pending` → "Pending"
- `open` → "Matched"
- `reviewed` → "Reviewed"
- `approved` → "Reviewed"
- `rejected` → "Error"
- `exported` → "Exported"

## Key Features

### 1. State-Specific Visual Feedback
Each state has distinct visual indicators that clearly communicate the invoice's current status and what actions are available.

### 2. Balance Discrepancy Handling
When an invoice has a balance (difference between invoice amount and PO amount), a warning alert is displayed with:
- The balance amount (formatted as positive/negative)
- Optional explanation text from the backend
- Clear visual distinction using warning colors

### 3. Always-Available Line Navigation
Line item sliders remain functional in all states, allowing users to navigate through invoice lines even when fields are read-only. This supports review and audit scenarios.

### 4. Export = Save + Mark as Reviewed
The Export button in Matched state automatically saves any pending changes before marking the invoice as reviewed, streamlining the workflow.

### 5. Context-Aware Help
The "Need Help" button in Error state opens a pre-filled support email with the invoice error context.

## Component Architecture

### Reusable State Indicators
All state indicators are extracted into separate, reusable components in `invoice-state-indicators.tsx`. This promotes:
- Code reusability
- Consistent styling across states
- Easy maintenance and updates
- Clear separation of concerns

### Conditional Rendering
The `renderStateIndicator()` function uses a switch statement to determine which indicator to show based on the current status, making the logic clear and maintainable.

### Props-Based Configuration
Each indicator component accepts relevant props (e.g., balance amount, error message) allowing for flexible, data-driven rendering.

## Testing Scenarios

### Scenario 1: Pending State UI
```gherkin
Given an invoice is in "PENDING" state
When the user opens the invoice details view
Then a spinner or processing indicator should be visible
And the main fields should be read-only
And no "missing required fields" error box should appear
```
✅ **Implemented**: PendingStateIndicator shows spinner, CompletenessChecker hidden for pending state

### Scenario 2: Matched State UI with Balance
```gherkin
Given an invoice is in "MATCHED" state
And the invoice has a non-zero balance
When the user opens the invoice details view
Then an alert or attention box should display the balance discrepancy
And the explanation text should be visible
And "Export" and "Save" buttons should be visible
```
✅ **Implemented**: BalanceAlert component displays when balance exists, Export and Save buttons shown

### Scenario 3: Reviewed/Queued State UI
```gherkin
Given an invoice is in "REVIEWED_QUEUED" state
When the user opens the invoice details view
Then a spinner or queued indicator should be visible
And no primary action buttons (Export or Save) should be available
```
✅ **Implemented**: QueuedIndicator shown, renderActionButtons returns null for reviewed/approved states

### Scenario 4: Exported State UI
```gherkin
Given an invoice is in "EXPORTED" state
When the user opens the invoice details view
Then a "View in AIM Vision" link or button should be visible
And invoice fields should be read-only
And the line item slider should remain usable
```
✅ **Implemented**: ExportedIndicator shown, "View in AIM Vision" button displayed, line navigation always enabled

### Scenario 5: Error State UI
```gherkin
Given an invoice is in "ERROR" state
When the user opens the invoice details view
Then an alert box should display the error message
And "Delete" and "Need help" buttons should be visible
```
✅ **Implemented**: ErrorAlert component displays error details, Delete and Need Help buttons shown

## Future Enhancements

### 1. Enhanced Error Handling
- Add error code lookup for more detailed error explanations
- Implement inline error resolution suggestions
- Add retry mechanisms for transient errors

### 2. Audit Trail
- Display state transition history
- Show who performed each action and when
- Add notes/comments for state changes

### 3. Bulk Actions
- Support for bulk state transitions
- Batch export functionality
- Multi-select with state-aware actions

### 4. Customizable Help Links
- Make support email configurable via environment variables
- Add in-app help documentation links
- Integrate with ticketing system

### 5. Animation Improvements
- Add smooth transitions between states
- Implement loading states for async operations
- Add success/error toast notifications

## Related Documentation

- [Status Workflow](./STATUS_WORKFLOW.md) - Detailed status definitions and transitions
- [Invoice Details Implementation](./INVOICE_DETAILS_IMPLEMENTATION.md) - Overall invoice details feature
- [Airtable Schema](./AIRTABLE_SCHEMA.md) - Database schema and field definitions

## Notes for Designers

### Color Palette Used
- **Pending**: Blue (info) - `border-blue-200`, `bg-blue-50`, `text-blue-700`
- **Warning/Balance**: Warning - `border-warning`, `bg-warning-25`, `text-warning-700`
- **Queued**: Success - `border-success`, `bg-success-25`, `text-success-700`
- **Exported**: Brand - `border-brand`, `bg-brand-25`, `text-brand-700`
- **Error**: Error - `border-error`, `bg-error-25`, `text-error-700`

### Icons Used
- Spinner: Custom animated div with border animation
- Clock: `Clock` from @untitledui/icons
- Check: `CheckCircle` from @untitledui/icons
- Warning: `AlertTriangle` from @untitledui/icons
- Error: `AlertCircle` from @untitledui/icons
- Help: `HelpCircle` from @untitledui/icons
- Export: `FileDownload02` from @untitledui/icons
- External Link: `LinkExternal01` from @untitledui/icons

### Spacing and Layout
- Alert boxes: `p-3 mb-4` (12px padding, 16px bottom margin)
- Border radius: `rounded-lg` (8px)
- Icon size: `w-4 h-4` (16px)
- Text sizes: `text-sm` (14px) for headings, `text-xs` (12px) for body

## Conclusion

This implementation provides a comprehensive, state-aware UI for invoice details that clearly communicates the invoice's current status and available actions to users. The modular component architecture ensures maintainability and consistency across the application.







