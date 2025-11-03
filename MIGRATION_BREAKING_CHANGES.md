# Airtable Migration - Breaking Changes & Fixes

## Overview
This document tracks all the breaking changes found during the Airtable schema migration and their resolutions.

---

## 1. Schema Updates

### ✅ FIXED: Table Names
| Old Name | New Name | Status |
|----------|----------|---------|
| `Invoices` | `InvoiceHeaders` | ✅ Updated |
| `Delivery Tickets` | (removed) | ✅ Deprecated |
| `Store Receivers` | (removed) | ✅ Deprecated |
| `Teams` | (removed) | ✅ Deprecated |
| `Files` | `Files` | ✅ No change |
| - | `InvoiceDetails` | ✅ New table added |

### ✅ FIXED: Field Name Changes (InvoiceHeaders)
| Old Field | New Field | Status |
|-----------|-----------|---------|
| `Invoice Number` | `AP-Invoice-Number` | ✅ Updated |
| `Vendor Code` | `VendId` | ✅ Updated |
| `Date` | `Invoice-Date` | ✅ Updated |
| `Amount` | `Total-Invoice-Amount` | ✅ Updated |
| `Rejection Code` | `ErrorCode` | ✅ Updated |
| `Rejection Reason` | `Error Reason` | ✅ Updated |
| `Updated At` | `Modified At` | ✅ Updated |
| `GL Account` | (moved to InvoiceDetails) | ✅ Updated |
| `Team` | (removed) | ✅ Deprecated |

### ✅ FIXED: Status Values Changed
| Old Value | New Value | Mapping |
|-----------|-----------|----------|
| `open` | `Pending` | ✅ Mapped |
| `reviewed` | `Reviewed` | ✅ Mapped |
| `exported` | `Exported` | ✅ Mapped |
| - | `Matched` | ✅ Mapped to `reviewed` |
| - | `Error` | ✅ Mapped to `rejected` |

### ✅ FIXED: Files Table Field Changes
| Old Field | New Field | Status |
|-----------|-----------|---------|
| `Name` | `FileName` | ✅ Updated |
| `Upload Date` | `UploadDate` | ✅ Updated |
| `File Hash` | `FileHash` | ✅ Updated |
| `Invoices` | `InvoiceHeaderID` | ✅ Updated |
| `Delivery Tickets` | (removed) | ✅ Removed |
| `Store Receivers` | (removed) | ✅ Removed |
| `Source` | (removed) | ✅ Handled |

---

## 2. Code Updates Made

### ✅ Schema & Types
- [x] `src/lib/airtable/schema-types.ts` - Auto-generated from new schema
- [x] `src/lib/airtable/transforms.ts` - Updated field mappings and status handling
- [x] `src/lib/airtable/index.ts` - Removed deprecated exports

### ✅ Hooks
- [x] `src/lib/airtable/invoice-hooks.ts` - Updated to use InvoiceHeaders table
- [x] `src/lib/airtable/files-hooks.ts` - Updated field names
- [x] `src/lib/airtable/delivery-ticket-hooks.ts` - Moved to quarantine
- [x] `src/lib/airtable/teams-hooks.ts` - Moved to quarantine

### ✅ API & Processing
- [x] `src/lib/post-ocr/airtable-helpers.ts` - Updated for new schema
  - Changed table references to InvoiceHeaders
  - Updated field names
  - Deprecated team lookups
  - All document types now route to InvoiceHeaders

### ✅ Pages & Components
- [x] `src/app/(app)/delivery-tickets/` - Moved to quarantine

---

## 3. Potential Breaking Points

### ⚠️ API Routes Need Checking
The following API routes may need updates:
- `src/app/api/airtable/[table]/route.ts` - Needs to handle "InvoiceHeaders" table name
- Check if any hardcoded "Invoices" table references exist

### ⚠️ Component References
Components that display invoice data may need field name updates:
- `src/components/documents/compact-invoice-list.tsx`
- `src/components/documents/invoice-coding-interface.tsx`
- `src/components/documents/document-details-panel.tsx`
- `src/app/(app)/invoices/page.tsx`
- `src/app/(app)/invoices/coding-demo/page.tsx`

### ⚠️ Type Definitions
- `src/types/documents.ts` - May need updates to reflect new field structure
- DeliveryTicket and StoreReceiver types are still defined but unused

### ⚠️ Navigation & Routing
- Check if navigation menus reference delivery-tickets route
- Update any breadcrumbs or route guards

---

## 4. InvoiceDetails Integration (Pending)

The new `InvoiceDetails` table is available but not yet integrated. This table contains:
- Line items for invoices
- GL account coding (moved from header)
- PO matching information
- Quantity and pricing details

**TODO for user:**
- Decide where/how to display line items in the UI
- Implement line item editing interface
- Update OCR processing to extract line items

---

## 5. Known Issues & Workarounds

### Issue 1: Missing Source Field in Files Table
**Problem:** The `Source` field was removed from the Files schema  
**Impact:** Cannot determine if file was from Email or Upload  
**Workaround:** Currently uses 'Upload' as default
**Solution:** User needs to add `Source` field back to Airtable if needed

### Issue 2: Team Assignment Deprecated
**Problem:** Teams table no longer exists  
**Impact:** Cannot assign invoices to teams/stores  
**Workaround:** Team field is ignored during processing  
**Solution:** User may need to use a different field in InvoiceHeaders (e.g., Company-Code or Store field)

### Issue 3: GL Account Moved to Line Items
**Problem:** GL Account was in Invoices, now in InvoiceDetails  
**Impact:** Single GL account per invoice is no longer supported  
**Workaround:** Leaving glAccount field empty in Invoice interface  
**Solution:** Implement line-level GL coding in future update

---

## 6. Testing Checklist

### High Priority - Test These First
- [ ] **Invoice list page** (`/invoices`) - displays invoices correctly
- [ ] **File upload** - creates Files and links to InvoiceHeaders
- [ ] **OCR processing** - creates InvoiceHeaders records with correct field names
- [ ] **Status filtering** - handles new capitalized status values
- [ ] **API routes** - accept "InvoiceHeaders" as table name

### Medium Priority
- [ ] **Search/filtering** - uses correct field names
- [ ] **Exports** - generates correct field mappings
- [ ] **Invoice coding** - can update invoice fields
- [ ] **File details panel** - shows linked invoices correctly

### Low Priority
- [ ] **Statistics/counts** - calculate correctly with new status values
- [ ] **Validation** - checks correct required fields
- [ ] **Error handling** - graceful degradation for missing fields

---

## 7. Migration Steps for Deployment

1. **Before deploying:**
   - [ ] Backup current database
   - [ ] Test all critical flows in development
   - [ ] Update any environment-specific configs

2. **Deploy:**
   - [ ] Update .env with new `AIRTABLE_BASE_ID`
   - [ ] Deploy code changes
   - [ ] Verify API routes respond correctly

3. **After deploying:**
   - [ ] Monitor for errors in logs
   - [ ] Check that file uploads work
   - [ ] Verify invoice list loads
   - [ ] Test OCR processing on a sample file

---

## 8. Future Enhancements

### InvoiceDetails Table Integration
- [ ] Add line items display in invoice detail view
- [ ] Implement line item CRUD operations
- [ ] Update OCR to extract line items
- [ ] Add bulk line item editing

### Field Additions (if needed)
- [ ] Add Store/Location field to InvoiceHeaders
- [ ] Re-add Source field to Files table
- [ ] Consider adding Tags or Categories field

---

## Notes
- All deprecated code has been moved to `quarantine/` folder
- Mapping document available at `AIRTABLE_MIGRATION_MAPPING.md`
- Schema auto-generated from Airtable API at `latest_schema.json`
- Full schema with field IDs in `src/lib/airtable/schema-types.ts`

