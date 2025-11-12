# Airtable Schema Migration Mapping

## Overview
This document maps the OLD Airtable schema (v3.0.0) to the NEW schema (v4.0.0) after field naming convention changes.

**Last Updated:** 2025-11-09

---

## Tables

### ✅ Files Table
**Status:** Field naming convention updated (spaces → kebab-case)
- **Old Name:** Files
- **New Name:** Files (unchanged)
- **Table ID Changed:** `tblMNDY3eCvIwSdA8` → `tbluYB0mHO6CQWrwL`

#### Field Mapping
| Old Field Name | New Field Name | Old Field ID | New Field ID | Notes |
|----------------|----------------|--------------|--------------|-------|
| FileID | FileID | fldvv1P403ZBW5bzD | fld4aUSAm9rH0gPYt | Primary field ID changed |
| FileURL | FileURL | fldMOyx6UwMi6bEBe | fldKhjRV5N8e1r2Oc | Field ID changed |
| FileHash | FileHash | fld4ul9KRJUSKaUWS | fldAkFbKnjYLzQJqS | Field ID changed |
| FileName | FileName | fldIGVTS5FNOBGa6R | fld7E1dvgRISwW0Pt | Field ID changed |
| UploadDate | UploadedDate | fldNiceCZo3dSbvaD | fldX1faf1UWuRF2p3 | **Renamed** + ID changed |
| Status | Status | flduvY2bmQosJsn7n | fldV1n0WIjvaQVFjz | Field ID changed |
| ParsedAt | ParsedAt | fldtidSYAqPRmoW3e | fldbB5yMnHs6fITao | Field ID changed, type changed to date |
| Attachments | Attachments | fld3draNU7mkLeGqI | fldsDbtBW8gSpq9VD | Field ID changed |
| Raw Text | Raw-Text | fld1lL5zRXtTbt0A3 | fldGeuHck13u4BmDY | **Renamed** + ID changed |
| Error Code | Error-Code | flddPRt8iRsl1YYZM | fldRocwOoLwBolAMv | **Renamed** + ID changed |
| Error Description | Error-Description | flddfs5LMqSRF4gXO | fldVm4uH7SYWLVKeg | **Renamed** + ID changed |
| Error Link | Error-Link | fldO1mNxkXBkp9hiC | fldwB1xjV6HlVPCdL | **Renamed** + ID changed |
| Created At | Created-At | fldPaMbKTIR1J6gAn | fldUFewWxBBP9D5bv | **Renamed** + ID changed |
| Modified At | Modified-At | fldTqso4wgmGyPkUj | fldnSfYc4IRnK3pHQ | **Renamed** + ID changed |
| Invoices | Invoices | fldwKImJnsRbsWjHj | flduJO35gW8Lo6Mh9 | Field ID changed |
| InvoiceHeaderID | (removed) | fldfWuCdkpNQj9Ldk | - | Deprecated field removed |
| InvoiceHeaders | (removed) | fld8fYyXVZiKhNeDv | - | Deprecated field removed |

#### Status Values Changed
**Old Values:**
- `Queued` (blueLight2)
- `Processing` (cyanLight2)
- `Processed` (tealLight2)
- `Attention` (greenLight2)

**New Values:**
- `Queued` (blueLight2) - Same
- `Processing` (tealLight2) - Color changed
- `Processed` (greenLight1) - Color changed
- `Attention` (orangeLight1) - Color changed

---

### ✅ Invoices Table
**Status:** Field naming convention updated + new fields added
- **Old Name:** Invoices
- **New Name:** Invoices (unchanged)
- **Table ID Changed:** `tblNKS2pOwcisNWJJ` → `tblokyH2U1PBhhCE9`

#### Field Mapping
| Old Field Name | New Field Name | Old Field ID | New Field ID | Notes |
|----------------|----------------|--------------|--------------|-------|
| RecordID | RecordID | fldZ17knWjEOCfztq | fldvQzw4GlIefZTPy | Primary field ID changed |
| Invoice Number | Invoice-Number | fldWJIn3Sb0JSCr2a | fldI9lZSSR7ucHPHC | **Renamed** + ID changed |
| VendId | VendId | fldr9N3nkBSzTvOct | fldhRQMEeBh3yLzRj | Field ID changed |
| Vendor Name | Vendor-Name | fldgdPfsIPIu6GFrg | fldJGXLYs7xaXP7xR | **Renamed** + ID changed |
| Amount | Amount | fldWskTDGmzu3udgQ | fldO8fN0NWv8dqDKC | Field ID changed |
| Date | Date | fldp1dFsyYtFcMk63 | fldEx6RyGqFl0WivA | Field ID changed |
| Freight Charge | Freight-Charge | fldmIOZypPrjc45MR | fldYXCLntMTfENKJa | **Renamed** + ID changed |
| Surcharge | Surcharge | fld0zGVtnSUl4YWva | fldIgWe2IFDOqnYO1 | Field ID changed |
| POs | POs | fldmBwAkd2ekGDS3h | fldmoLZSY47DRFnAr | Field ID changed |
| Document Raw Text | Document-Raw-Text | fldYajj2Ql4O3ZJNl | fldB5FcRvWID00Tdn | **Renamed** + ID changed |
| Files | Files | fldvgp2k2Ro3xneyz | fldDzY5Ch6fCP0XHp | Field ID changed, prefersSingleRecordLink: true |
| Status | Status | fldbeTDRDaKibT17s | fld8ZH6sheroClLwL | Field ID changed |
| Balance | Balance | fldSjTjrW8Fso4j70 | fldgF26E6kAcOYIEf | **Now a formula** (Amount - Headers-Sum) |
| Balance Explanation | Balance-Explanation | fldySfNaohpv3gv4l | fldXH56bhzI3ieEsU | **Renamed** + ID changed |
| POInvoiceHeaders | POInvoiceHeaders | fldzGkuubdu4lLy9n | fldGeieJZPW2XwQEJ | Field ID changed |
| MatchJSONPayload | MatchPayloadJSON | fldFxQNImfvsULyL2 | fld7nZtX7h9ykBAS2 | **Renamed** + ID changed |
| Error Code | ErrorCode | fldBbD1mWcSqD5mn5 | fldwsvCcR8BsNYQVx | **Renamed** (no hyphen) + ID changed |
| File Raw Text | File-Raw-Text | fldUsIefXXVrL9ugZ | fldbhuxrnxJ1Fun9u | **Renamed** + ID changed |
| Missing Fields | Missing-Fields | fldhUobiEpFG2S8E2 | fldRkn64EhJZkKKQg | **Renamed** + ID changed |
| Created At | Created-At | fldQTWe0E9ik9t3SW | fldOh6DdIq2JAhGHO | **Renamed** + ID changed |
| Modified At | Modified-At | fldtlqLgTn2IdBbkj | fldSAyzOAxppKn8rh | **Renamed** + ID changed |
| Attachments | Attachments | fldAttachmentsLookup | fldBSFvaBJYkkbaRe | Field ID updated (now exists) |
| - | Misc-Charge | - | fldX0qPQMAgKaRFX3 | **NEW** field |
| - | Discount-Amount | - | fld0zHEhMerfgxZx1 | **NEW** field |
| - | Discount-Date | - | fldyN4Sf6FTZoH9YI | **NEW** field |
| - | Headers-Sum | - | fldI5H4YHsu4VPPjg | **NEW** rollup field |

#### Status Values Changed
**Old Values:**
- `Pending` (blueLight2)
- `Matched` (cyanLight2)
- `Queued` (tealLight2)
- `Exported` (greenLight2)
- `Error` (yellowLight2)

**New Values:**
- `Pending` (greenLight1) - Color changed
- `Matched` (blueLight2) - Color changed
- `Queued` (orangeLight1) - Color changed
- `Exported` (purpleBright) - Color changed
- `Error` (redBright) - Color changed

---

### ✅ POInvoiceHeaders Table
**Status:** Major structural changes - many fields are now lookups from Invoice
- **Old Name:** POInvoiceHeaders
- **New Name:** POInvoiceHeaders (unchanged)
- **Table ID Changed:** `tblJoCXc4S52J5h6L` → `tblgEJz0WQtZusPAT`

#### Field Mapping
| Old Field Name | New Field Name | Old Field ID | New Field ID | Notes |
|----------------|----------------|--------------|--------------|-------|
| RecordID | RecordID | fldKuzxRLh9ebfwQ6 | fldhszvX1XbN0cGah | Primary field ID changed |
| Invoices | Invoice | fldlDBkOm2QV6vSSc | fldWTaHrIJXSx5hrr | **Renamed** + now single link (prefersSingleRecordLink: true) |
| Invoice Details | Details | fldDtXpleyIIKomex | fldyMJiQO4L0Ev0cT | **Renamed** + ID changed |
| Company-Code | Company-Code | fldTxznaohx3570gT | fldFKFB68UVpa9ANK | Field ID changed |
| Status | Export-Status | fldQG5aLrzWuybUGl | fldb5mLqnscBfBzjM | **Renamed** + ID changed |
| VendId | VendId | fldHqAuDgGiFwEbNu | fld7tAlKGvv0LG8EI | Field ID changed |
| Vendor Name | Remit-Name | fldoQDBbjtB45u8Y0 | fldg1lTgqcRh7KX0Y | **Renamed** + now lookup from Invoice |
| AP-Invoice-Number | AP-Invoice-Number | fldeLVE34jFJIZ4mt | fld6MSB6CS7j3sCiS | **Now lookup** from Invoice + ID changed |
| Invoice-Date | Invoice-Date | fld965jyW6vfHSzve | fld27xiiYfeMD3XB5 | **Now lookup** from Invoice + ID changed |
| TermsId | TermsId | fldEfXJh4GLbPWnQ4 | fld6zPKOrAgFUMA1q | Field ID changed |
| Due-Date | Due-Date | fldaToVmDpqv9ONaF | fldNHyjXi1MkrFvS7 | **Now formula** (calculated) + ID changed |
| Remit-Name | Remit-Name | fldnqlfWxfsldK9bw | fldg1lTgqcRh7KX0Y | **Now lookup** from Invoice |
| Total-Invoice-Amount | Total-Invoice-Amount | fldCm1wXZcP8By64B | flda0ukWjWxzyJ2Hr | **Now lookup** from Invoice + ID changed |
| Freight-Charge | Freight-Charge | fldlY0X5bukPwEL8m | fld5UETBDzu4e0uk6 | **Now lookup** from Invoice + ID changed |
| Miscellaneous-Charge | Miscellaneous-Charge | fldliitVmX1mosV3v | fldEDwJxYhaye4VmJ | **Now lookup** from Invoice + ID changed |
| Discount-Amount | Discount-Amount | fldVMtTKXIqwZwxyp | fldUcQK1FqpUZxxGJ | **Now lookup** from Invoice + ID changed |
| Discount-Date | Discount-Date | fldUUPq044MMnF5oJ | fldSBhnyVm2fESlds | **Now lookup** from Invoice + ID changed |
| PO-Number | PO-Number | fld2DoiZs6t3sq3ru | fld4uJuo5MBMnsZgw | **Now rollup** from Details + ID changed |
| Files | (removed) | fldmyaFCTdFTJ1fnf | - | Removed (access via Invoice) |
| Document Raw Text | (removed) | fldDGh2zVJXjpoTvX | - | Removed (access via Invoice) |
| Created At | Date-Stamp | fldTOi6cp2tzLromy | fldZxGyjFcQaPvxiO | **Renamed** + ID changed |
| Modified At | (removed) | fld7UTUCBIDIP8bw4 | - | Removed |
| TaxID00-03 | TaxID00-03 | fld99Me7yA3uT9Dlg, etc. | fldrfChafGoYKQ2aJ, etc. | Field IDs changed |
| TaxTot00-03 | TaxTot00-03 | fldj76RPNLhY1tPb1, etc. | fldJPOml9TR5KY0XV, etc. | Field IDs changed |
| txblTot00-03 | txblTot00-03 | fldSts2L2SzKyUJ7J, etc. | fldmkyVeMdke8yfzm, etc. | Field IDs changed |
| - | InvoiceRecordID | - | fldsuXjbykjLkRbC2 | **NEW** lookup field |
| - | Surcharge | - | fldSY9GdNlijlsYdQ | **NEW** lookup from Invoice |
| - | PO-Number-Seq-Type | - | fldgqMRGrJM3BUUfQ | **NEW** rollup field |
| - | PO-Vendor | - | fld0qGIscEzVUgiZm | **NEW** field |
| - | CuryMultDiv | - | fldqZxGWc5TR5Tomh | **NEW** singleSelect field |
| - | CuryRate | - | fldtu6II85lju5kvT | **NEW** field (precision: 8) |
| - | CuryRateType | - | fldLq5lUAm5C0HSa8 | **NEW** field |
| - | Update-Batch-Number | - | fld4QUJecGm4skJhh | **NEW** field |
| - | Time-Stamp | - | fldXVDFDDk3sud6B9 | **NEW** formula field |
| - | User-Id | - | fldSelF39N2dmQ3EA | **NEW** field |
| - | Update-Audit-Number | - | fldZlmKvQaAmYGzcd | **NEW** field |
| - | Invoice-Balance | - | fldHGoxrb3gYiN2Z7 | **NEW** lookup from Invoice |
| - | Balance-Exception-YN | - | fldE38iRhlU7uIvma | **NEW** formula field |
| - | Type | - | fld9hrf3hvO78stDY | **NEW** singleSelect field |
| - | Job-Project-Number | - | fldg88jTL4hxHCgUG | **NEW** field |
| - | DocumentAttachment | - | fldy6aT5yhZVbcs87 | **NEW** field |
| - | Export-Error-Code | - | fld08whvyI1HaV5Dx | **NEW** field |
| - | Details-Sum | - | fldId0eVt84ZYF9fx | **NEW** rollup field |
| - | APAcct, APSub | APAcct, APSub | fldqTd1R4rlXq1zXN, etc. | fldyi7UcDACICVIcq, etc. | Field IDs changed |
| - | Freight-Account, Freight-Subaccount | - | fld336ezRpzzEkyGh, etc. | **NEW** fields |
| - | Misc-Charge-Account, Misc-Charge-Subaccount | - | fldCGiCgdrg5GL5pY, etc. | **NEW** fields |
| - | Tax00Acct-03Acct, Tax00Sub-03Sub | - | fldc49yqGYfycjJm7, etc. | **NEW** fields |

#### Status Values Changed
**Old Values:**
- `Queued` (greenLight2)
- `Exported` (blueLight2)
- `Error` (yellowLight2)

**New Values:**
- `Pending` (blueLight2) - **NEW**
- `Matched` (cyanLight2) - **NEW**
- `Queued` (tealLight2) - Color changed
- `Exported` (greenLight2) - Color changed
- `Error` (yellowLight2) - Same
- `(empty)` (orangeLight2) - **NEW**

---

### ✅ POInvoiceDetails Table
**Status:** Major structural changes - many fields are now lookups from POInvoiceHeaders
- **Old Name:** POInvoiceDetails
- **New Name:** POInvoiceDetails (unchanged)
- **Table ID Changed:** `tblRkwaiS3LcFFrZ9` → `tblajSDlRV6SsUtw8`

#### Field Mapping
| Old Field Name | New Field Name | Old Field ID | New Field ID | Notes |
|----------------|----------------|--------------|--------------|-------|
| RecordID | RecordID | flddeN1uf4flGhHNS | fldsFnV2r5H0Pljoz | Primary field ID changed |
| Company-Code | Company-Code | fldaagXjpyrRtsy8e | flduZQavGskCdu35d | **Now lookup** from POInvoiceHeader + ID changed |
| VendId | VendId | fldKjuYXhgwv8fcLs | fldwYCDK6mImfRGKQ | **Now lookup** from POInvoiceHeader + ID changed |
| AP-Invoice-Number | AP-Invoice-Number | fld4i5XGZJi4sYyDV | fldbItKufSN7jJcoe | **Now lookup** from POInvoiceHeader + ID changed |
| Line-Number | Line-Number | fld3sdHL8z7RxoZTn | fldTKJp6ebeYQ4ti8 | **Now autoNumber** + ID changed |
| Item-No | Item-No | fldMeG51leLehcgNa | fldHh1UwP2TYOq5sF | Field ID changed |
| Item-Description | Item-Description | fld7iTo1UUNAjRAK4 | fldwQ6IQzEw9mRONP | **Now multilineText** + ID changed |
| Invoice-Price | Invoice-Price | fldzRKqDHlSo168I5 | fldUHbpqV38hAceMw | Field ID changed, now currency |
| Invoice-Pricing-Qty | Invoice-Pricing-Qty | fldm3JJHqefoSzkY0 | fldS0PBUjsKt4j4Fo | Field ID changed, precision: 4 |
| Quantity-Invoiced | Quantity-Invoiced | fldyMWOPBZ0VSFS6Z | fldcBn6GL9jFFGxbW | Field ID changed, precision: 4 |
| Line-Amount | Line-Amount | fldogLboVcfjTq9M8 | fldypCHLMTKdhCtJh | Field ID changed, precision: 1 |
| PO-Number | PO-Number | fldCGNWvybCS5wLh0 | fldb9eHuvv0NL2uAS | Field ID changed |
| PO-Line-Number | PO-Line-Number | fldaRbB9j71w8TL9S | fld44aIaJT2bd0Pve | Field ID changed |
| PO-Release-Number | PO-Release-Number | fldziXj8Hn4MSPvNc | fld0iqeOix7I3E1fh | Field ID changed |
| Expacct | ExpAcct | fldmYAfYSSYynpSf4 | fldMbMltkhFFWKJUU | **Renamed** + ID changed |
| InvoiceHeaders | POInvoiceHeaders | fldS39vWDismMUvfC | fldeJpf4G5Cj0LnaR | **Renamed** + ID changed |
| Status | (removed) | fld3c6QiWMYO8fUrO | - | Removed |
| Created At | (removed) | fld17mKjXewbTA0vy | - | Removed |
| Modified At | (removed) | fldI3kD7U94DDThpi | - | Removed |
| PO-Number-Seq-Type | PO-Number-Seq-Type | fld8WcpVpCxKXXZMT | fld6bzXTyqa3HUgsl | Field ID changed |
| - | Header | - | fldrzIQxcaQWlAgwh | **NEW** field |
| - | HeaderRecordID | - | fldFEMHbiZkR41Dzz | **NEW** lookup field |
| - | Step | - | fldi9cVjcUubszKd1 | **NEW** field |
| - | TaxID00-03 | - | fldtGfOf1jFI9aDbE, etc. | **NEW** lookups from POInvoiceHeader |
| - | TaxAmt00-03 | - | fldKjlpEzZoNjn3ix, etc. | **NEW** fields |
| - | txblAmt00-03 | - | fld3EOBBG1Di5KCeB, etc. | **NEW** fields |
| - | ExpSub | - | fldKerXoxiWOGVLfF | **NEW** field |
| - | PPV-Vouchered-Acct | - | fld8QL2nm1N6KYkhA | **NEW** field |
| - | PPV-Vouchered-SubAcct | - | fld7YTh4AeqWXKvuR | **NEW** field |
| - | PPV-Unit-Cost | - | fldeYDhZU0jIqvGWr | **NEW** formula field |
| - | Standard-Cost | - | fldt9ttdXAuwVZj5U | **NEW** field (precision: 6) |
| - | SurchargeType | - | fldSkOOPdSeMXpqUN | **NEW** singleSelect field |
| - | SurchargeRate | - | fldhDd6A2cK7gSKrN | **NEW** field |
| - | Surcharge | - | fldrfM3P3WpqPYWsp | **NEW** field |
| - | GL-Exception-YN | - | fld1TXi1SH6tWh81n | **NEW** field (was checkbox, now text) |
| - | Invoiced-In-Full-YN | - | fldkMgmQzxYtjWStZ | **NEW** formula field |
| - | Update-Level-Ind | - | fldTIIZxPPflYDBzH | **NEW** field |
| - | Job-Project-Number | - | fldkSs9wHlRvdmQBR | **NEW** field |
| - | BoxNbr | - | fldGpiLavevepWgsf | **NEW** field |
| - | Notes | - | fldL1yHZm1K41hf5I | **NEW** multilineText field |
| - | Line-Pricing | - | fldPv8Y6IhHnpH6A3 | **NEW** formula field |

---

## Code Impact Areas

### High Priority Updates Needed
1. **All field name references** - Update from space-separated to kebab-case (e.g., `Invoice Number` → `Invoice-Number`)
2. **All table IDs** - Update to new table IDs
3. **All field IDs** - Update to new field IDs
4. **Status field values** - Some status colors changed
5. **Lookup fields** - Many fields in POInvoiceHeaders and POInvoiceDetails are now lookups
6. **Relationship changes** - POInvoiceHeaders now uses single link to Invoice (prefersSingleRecordLink: true)
7. **Formula fields** - Balance in Invoices is now a formula, Due-Date in POInvoiceHeaders is now a formula

### Files Needing Updates
Based on schema changes:
- `src/lib/airtable/schema-types.ts` - Complete rewrite needed with new field IDs and names
- `src/lib/airtable/invoice-hooks.ts` - Update field names and IDs
- `src/lib/airtable/files-hooks.ts` - Update field names and IDs
- `src/lib/post-ocr/airtable-helpers.ts` - Update field mappings
- `src/app/api/post-ocr/process/route.ts` - Update field references
- `src/components/documents/*.tsx` - Update UI field references
- `src/app/(app)/invoices/*.tsx` - Update field references
- `src/types/documents.ts` - Update document types
- `src/utils/invoice-validation.ts` - Update field names

### Medium Priority
1. **New fields** - Add support for new fields like Misc-Charge, Discount-Amount, etc.
2. **Lookup fields** - Understand that many fields are now lookups (read-only from API perspective)
3. **Formula fields** - Balance, Due-Date, Invoiced-In-Full-YN, etc. are now formulas

---

## Migration Checklist

- [ ] Update all field name references to use kebab-case
- [ ] Update all table IDs in code
- [ ] Update all field IDs in code
- [ ] Update status value handling (colors changed)
- [ ] Test file upload and invoice creation
- [ ] Test POInvoiceHeader creation and linking
- [ ] Test POInvoiceDetail creation and linking
- [ ] Verify lookup fields work correctly
- [ ] Update TypeScript types
- [ ] Update API route handlers
- [ ] Update React components
- [ ] Test end-to-end workflow

---

## Notes for Review

- Many fields in POInvoiceHeaders are now lookups from Invoice table - these are read-only from API
- Many fields in POInvoiceDetails are now lookups from POInvoiceHeaders - these are read-only from API
- Balance field in Invoices is now a formula (Amount - Headers-Sum) - read-only
- Due-Date in POInvoiceHeaders is now a formula - read-only
- POInvoiceHeaders now links to Invoice with prefersSingleRecordLink: true (one-to-one relationship)
- Status field in POInvoiceHeaders is now called Export-Status
- Several new accounting fields added to POInvoiceHeaders (Freight-Account, Tax00Acct, etc.)
- POInvoiceDetails no longer has Status, Created At, Modified At fields

---

## Next Steps
1. ✅ Schema fetched and documented
2. ⏳ Update schema-types.ts with new field IDs and names
3. ⏳ Update all code references to use new field names
4. ⏳ Test all functionality
5. ⏳ Update UI components
6. ⏳ Deploy and verify
