# Coding Tab Restored ✅

## Summary
The "Coding" tab has been successfully restored to the document details panel!

## Changes Made

### 1. Added Coding Tab
**File**: `src/components/documents/document-details-panel.tsx`

- **Import**: Added `InvoiceCodingInterface` component
- **Tab List**: Added "Coding" tab between "Header" and "Raw"
  ```typescript
  const tabs = keyboardNav?.tabs || [
      { id: "extracted", label: "Header" },
      { id: "coding", label: "Coding" },      // ← NEW
      { id: "raw", label: "Raw" },
      { id: "links", label: "Links" }
  ];
  ```

- **TabPanel**: Added coding panel content that:
  - Only shows for invoice documents
  - Uses the existing `InvoiceCodingInterface` component
  - Respects edit permissions (disabled when status is not "Matched")
  - Updates the invoice when GL Account is changed
  - Passes keyboard navigation props

### 2. Enhanced Coding Interface
**File**: `src/components/documents/invoice-coding-interface.tsx`

- Added informational notice about upcoming line items functionality
- Currently shows GL Account field at invoice level
- Ready to be extended with InvoiceDetails line items

## Current Features

✅ **Coding Tab Available**
- Shows up between "Header" and "Raw" tabs
- Only visible for invoices (not delivery tickets or other doc types)

✅ **GL Account Field**
- Dropdown with preset GL accounts
- Editable only when invoice status is "Matched"
- Updates invoice record when changed

✅ **Ready for Line Items**
- Notice explains that line item coding is coming
- Infrastructure in place to add InvoiceDetails integration

## Testing

Test the restored coding tab:
- [ ] Open an invoice with "Matched" status
- [ ] Navigate to "Coding" tab (should appear between Header and Raw)
- [ ] Verify GL Account dropdown is editable
- [ ] Change GL Account and save - verify it persists
- [ ] Open invoice with "Pending" or "Reviewed" status
- [ ] Verify Coding tab fields are disabled (read-only)

## Next Steps for Full Line Items Support

To complete the InvoiceDetails integration in the Coding tab, we would need to:

1. **Create API endpoint** for fetching/updating InvoiceDetails records
2. **Add `lines` array** to `Invoice` type with line item fields
3. **Fetch line items** when invoice is selected
4. **Build line items UI** in the coding interface with:
   - Table/grid showing all lines
   - Editable fields per line (GL Account, Item Description, Amount, etc.)
   - Add/Remove line buttons
5. **Save line changes** back to InvoiceDetails table

For now, the Coding tab is functional with invoice-level GL Account, and users can see that line items are planned!

