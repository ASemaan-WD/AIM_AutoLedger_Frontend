# Airtable Schema Migration Mapping

## Overview
This document maps the OLD Airtable schema to the NEW schema after base ID change.

---

## Tables

### ✅ Files Table
**Status:** Mostly compatible with updates needed
- **Old Name:** Files
- **New Name:** Files (unchanged)

#### Field Mapping
| Old Field Name | New Field Name | Old Field ID | New Field ID | Notes |
|----------------|----------------|--------------|--------------|-------|
| Name | FileName | fld871fmYBmxf8xYU | fldIGVTS5FNOBGa6R | Field renamed |
| Source | (removed) | fld5bJlx5WszQ4c1u | - | No longer exists |
| Status | Status | fld9ouHowI4sch0n0 | flduvY2bmQosJsn7n | Kept but different ID |
| Invoices | InvoiceHeaderID | fldkuHPgcgEa3m7rN | fldfWuCdkpNQj9Ldk | Links to InvoiceHeaders now |
| File Hash | FileHash | fldbYXg99PG8IVk0c | fld4ul9KRJUSKaUWS | Kept |
| Attachments | Attachments | fldLR6Gc6IaN2ltR5 | fld3draNU7mkLeGqI | Kept |
| Raw Text | Raw Text | fldqYhVrJ09KBnVLk | fld1lL5zRXtTbt0A3 | Kept |
| Error Code | Error Code | fldIBUz1V67JDnoqk | flddPRt8iRsl1YYZM | Kept |
| Error Description | Error Description | fldSePddKTGeqabXg | flddfs5LMqSRF4gXO | Kept |
| Error Link | Error Link | fldAKXH81jZde4kwj | fldO1mNxkXBkp9hiC | Kept |
| Created At | Created At | fldwsCB3B85GpPmLc | fldPaMbKTIR1J6gAn | Kept |
| Modified At | Modified At | fldOl0pJW9KWx7xCX | fldTqso4wgmGyPkUj | Kept |
| Delivery Tickets | (removed) | fldfHlzm4Y2llPWmI | - | No longer exists |
| Store Receivers | (removed) | fldY4KUJ2Ab1WLPkz | - | No longer exists |
| - | FileID | - | fldvv1P403ZBW5bzD | NEW: Auto number primary field |
| - | FileURL | - | fldMOyx6UwMi6bEBe | NEW: URL field |
| - | UploadDate | - | fldNiceCZo3dSbvaD | NEW: Date field |
| - | ParsedAt | - | fldtidSYAqPRmoW3e | NEW: DateTime field |
| - | InvoiceHeaders | - | fld8fYyXVZiKhNeDv | NEW: Text field (lookup?) |

---

### ✅ InvoiceHeaders Table (formerly "Invoices")
**Status:** Major changes - renamed and restructured
- **Old Name:** Invoices
- **New Name:** InvoiceHeaders

#### Field Mapping
| Old Field Name | New Field Name | Old Field ID | New Field ID | Notes |
|----------------|----------------|--------------|--------------|-------|
| (auto number) | RecordID | - | fldKuzxRLh9ebfwQ6 | Primary field |
| Invoice Number | AP-Invoice-Number | fldip2afk1iwBXqIH | fldeLVE34jFJIZ4mt | Renamed |
| Status | Status | fld7KzLACPWK7YE5S | fldQG5aLrzWuybUGl | **Values changed!** See below |
| Vendor Name | Vendor Name | fldwXyrC93rysGzrJ | fldoQDBbjtB45u8Y0 | Kept |
| Vendor Code | VendId | fldPWCklYpVUfiwAz | fldHqAuDgGiFwEbNu | Renamed |
| Date | Invoice-Date | fldFd1vxXxxThsdAk | fld965jyW6vfHSzve | Renamed |
| Amount | Total-Invoice-Amount | fldPiog487BPfs1gE | fldCm1wXZcP8By64B | Renamed |
| GL Account | (removed) | fld4VwvAkOW77XhR4 | - | May be in InvoiceDetails now |
| Document Raw Text | Document Raw Text | fldutbLwPpnXBAzlP | fldDGh2zVJXjpoTvX | Kept |
| Rejection Code | ErrorCode | fldR4mbqWDgdGS3hL | flddH7m8XIlXZLvkR | Renamed |
| Rejection Reason | Error Reason | fld6a8zvQYCVprrpl | fldCc76xkxbUe2GEY | Renamed |
| Files | Files | fldu797dxWoXqGxU0 | fldmyaFCTdFTJ1fnf | Kept (link) |
| Attachments | Attachments | fld5LeydwwVmVufs4 | fldMXV69XZLdIfE6Q | Now a lookup field |
| Team | (removed) | fldG2o6HeG4ZgsG2U | - | No longer exists |
| Missing Fields | Missing Fields | fldbrygcHSus5OnmN | fldb3JaRCNHzQ61gp | Now a formula field |
| File Raw Text | File Raw Text | fldVSJ6uKdHTbqZT6 | fldn6ThK0bCyWO8wR | Now a lookup field |
| Created At | Created At | fld2pRPhrSTtl4ANV | fldTOi6cp2tzLromy | Kept |
| Updated At | Modified At | fldoRVUbO4liVHf9b | fld7UTUCBIDIP8bw4 | Renamed |
| - | Company-Code | - | fldTxznaohx3570gT | NEW |
| - | Invoice Details | - | fldDtXpleyIIKomex | NEW: Links to InvoiceDetails table |
| - | TermsId | - | fldEfXJh4GLbPWnQ4 | NEW |
| - | Due-Date | - | fldaToVmDpqv9ONaF | NEW |
| - | Remit-Name | - | fldnqlfWxfsldK9bw | NEW |
| - | Freight-Charge | - | fldlY0X5bukPwEL8m | NEW |
| - | Miscellaneous-Charge | - | fldliitVmX1mosV3v | NEW |
| - | Discount-Amount | - | fldVMtTKXIqwZwxyp | NEW |
| - | Discount-Date | - | fldUUPq044MMnF5oJ | NEW |
| - | TaxID00-03 | - | fld99Me7yA3uT9Dlg, etc. | NEW: Tax fields |
| - | TaxTot00-03 | - | fldj76RPNLhY1tPb1, etc. | NEW: Tax totals |
| - | TxblTot00-03 | - | fldSts2L2SzKyUJ7J, etc. | NEW: Taxable totals |
| - | CuryId | - | fldc59eW74gdn78Q4 | NEW: Currency |
| - | PO-Number-Seq-Type | - | fldn5JONpJqhBHbyS | NEW |
| - | PO-Number | - | fld2DoiZs6t3sq3ru | NEW |
| - | Type | - | fld8m7237dBbsJyZp | NEW |
| - | Update-YN | - | fldsFz9XdZA7E5V2V | NEW |
| - | Balance-Exception-YN | - | fld9JKT03Uq60oBzX | NEW |
| - | APAcct | - | fldqTd1R4rlXq1zXN | NEW |
| - | APSub | - | fldAiBcZrN7C4fFS8 | NEW |
| - | curymultdiv | - | fldGZcx5ypXYPKjpS | NEW |
| - | CuryRate | - | fldPgqTjWKAb5Z9T5 | NEW |
| - | curyratetype | - | fld17OblRg1DcLGV3 | NEW |
| - | Surcharge | - | fld7hsHTZGxv2psSg | NEW |
| - | DocumentAttachment | - | flddZj4GmYKTIKa5p | NEW: URL field |
| - | MatchPayloadJSON | - | fldyFJ0B6tyrfZOHc | NEW |
| - | ExportedAt | - | fldKz7xwIQb7aWQxc | NEW |

#### Status Values Changed
**Old Values:**
- `open`
- `reviewed`
- `exported`

**New Values:**
- `Pending` (maps to old `open`)
- `Matched` (new status)
- `Reviewed` (maps to old `reviewed`)
- `Exported` (maps to old `exported`)
- `Error` (new status)

---

### ✅ InvoiceDetails Table (NEW)
**Status:** Completely new table for invoice line items
- **Old Name:** (did not exist)
- **New Name:** InvoiceDetails

#### Key Fields
| Field Name | Field ID | Type | Notes |
|------------|----------|------|-------|
| RecordID | flddeN1uf4flGhHNS | autoNumber | Primary field |
| Company-Code | fldaagXjpyrRtsy8e | singleLineText | |
| VendId | fldKjuYXhgwv8fcLs | singleLineText | |
| AP-Invoice-Number | fld4i5XGZJi4sYyDV | singleLineText | |
| Line-Number | fld3sdHL8z7RxoZTn | singleLineText | |
| Item-No | fldMeG51leLehcgNa | singleLineText | |
| Item-Description | fld7iTo1UUNAjRAK4 | singleLineText | |
| Invoice-Price | fldzRKqDHlSo168I5 | number | |
| Invoice-Pricing-Qty | fldm3JJHqefoSzkY0 | number | |
| Quantity-Invoiced | fldyMWOPBZ0VSFS6Z | number | |
| Line-Amount | fldogLboVcfjTq9M8 | number | |
| PO-Number | fldCGNWvybCS5wLh0 | singleLineText | |
| PO-Line-Number | fldaRbB9j71w8TL9S | singleLineText | |
| PO-Release-Number | fldziXj8Hn4MSPvNc | singleLineText | |
| Vendor-Ship-Number | fldlgZS1vfjADumtA | singleLineText | |
| Date-Received | fldvsBVEoR4wvpU4q | date | |
| Quantity-Received | fldhbGZ18orSgmF9X | number | |
| Quantity-Accepted | fldmC8tCkMds0r1ss | number | |
| Purchase-Price | fldOyoAVTjukUffi2 | number | |
| Pricing-Quantity | fldeEcQ2ZAupVq8h4 | number | |
| Already-Invoiced-Qty | flduobfDtNnBX1FIF | number | |
| Expacct | fldmYAfYSSYynpSf4 | singleLineText | GL expense account |
| Expsub | fldCdFXPWyEMMZtbr | singleLineText | GL expense sub |
| TaxID00 | fldqkgiosIR3wJiiM | singleLineText | |
| TaxAmt00 | fldkOB2fQTWqOL3VI | number | |
| TxblAmt00 | fldyxHWBYVhrICaED | number | |
| PO-UOM | fldtC4OeorogNCBzW | singleLineText | |
| Invoiced-In-Full-YN | fldTMFNrthWOMqwmt | checkbox | |
| GL-Exception-YN | fld3sBjJzVeqTA7p7 | checkbox | |
| State | fld3c6QiWMYO8fUrO | singleSelect | unmatched/matched/exported/error |
| InvoiceHeaders | fldS39vWDismMUvfC | multipleRecordLinks | Links to InvoiceHeaders |

---

### ❌ Delivery Tickets Table
**Status:** REMOVED - No longer exists in new schema

---

### ❌ Store Receivers Table
**Status:** REMOVED - No longer exists in new schema

---

### ❌ Teams Table
**Status:** REMOVED - No longer exists in new schema

---

## Code Impact Areas

### High Priority Updates Needed
1. **All invoice queries** - Change table name from "Invoices" to "InvoiceHeaders"
2. **Status field values** - Update from lowercase to capitalized (e.g., `open` → `Pending`)
3. **Field name changes** - Update field references (e.g., `Vendor Code` → `VendId`)
4. **Files table** - Update `Invoices` link field to `InvoiceHeaderID`
5. **Remove all references** to Delivery Tickets, Store Receivers, and Teams tables

### Files Needing Updates
Based on grep results:
- `src/lib/airtable/schema-types.ts` - Complete rewrite needed
- `src/lib/airtable/invoice-hooks.ts` - Update table name and fields
- `src/lib/airtable/delivery-ticket-hooks.ts` - Remove or archive
- `src/lib/airtable/teams-hooks.ts` - Remove or archive
- `src/lib/airtable/files-hooks.ts` - Update field references
- `src/lib/airtable/index.ts` - Update exports
- `src/lib/post-ocr/airtable-helpers.ts` - Update field mappings
- `src/app/api/post-ocr/process/route.ts` - Update field references
- `src/components/documents/*.tsx` - Update UI for removed tables
- `src/app/(app)/delivery-tickets/page.tsx` - Remove or disable
- `src/app/(app)/invoices/*.tsx` - Update field references
- `src/types/documents.ts` - Update document types
- `src/utils/invoice-validation.ts` - Update field names

### Medium Priority
1. **Invoice line items** - Add support for InvoiceDetails table
2. **New fields** - Optional: Add support for new fields like Company-Code, PO-Number, etc.

---

## Notes for Review
- Please verify that `Pending` status in new schema should map to `open` in old schema
- Confirm if `Matched` status is equivalent to old `reviewed` or if it's a new workflow step
- Review if any features depended on Teams table functionality
- Confirm if Delivery Tickets and Store Receivers should be completely removed or just hidden

---

## Next Steps
1. ✅ Schema fetched
2. ⏳ User reviews this mapping document
3. ⏳ Generate new schema types
4. ⏳ Update all code references
5. ⏳ Add InvoiceDetails support
6. ⏳ Remove deprecated table references
7. ⏳ Test all functionality

