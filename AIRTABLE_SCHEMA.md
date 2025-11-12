# Airtable Schema Documentation

**Last Updated:** 2025-01-27  
**Schema Version:** 3.0.0

This document provides comprehensive documentation of the current Airtable schema, including all tables, fields, relationships, and status values.

## 🚨 Major Changes in v3.0.0

- **NEW TABLE**: **Invoices** table added as primary entity created at file upload
- **ARCHITECTURAL CHANGE**: Invoices are now the primary entity, with POInvoiceHeaders as separate linked records
- **RELATIONSHIP UPDATES**: 
  - Files → Invoices (many-to-many)
  - Invoices → POInvoiceHeaders (one-to-many)
  - POInvoiceHeaders → POInvoiceDetails (one-to-many)
- **FIELD UPDATES**: Files table now links to Invoices via `Invoices` field (multipleRecordLinks)
- **POInvoiceHeaders UPDATES**: Now links to Invoices via `Invoices` field (multipleRecordLinks)

## Tables Overview

The database consists of **4 tables** that work together to manage invoice processing workflow:

| Table | Purpose | Primary Field | Fields | Relationships |
|-------|---------|---------------|--------|---------------|
| [Files](#files-table) | Document file management | FileID | 14 | Links to Invoices (many-to-many) |
| [Invoices](#invoices-table) 🆕 | **Primary invoice entity** | RecordID | 28 | Links to Files, POInvoiceHeaders |
| [POInvoiceHeaders](#poinvoiceheaders-table) | PO-matched invoice headers | RecordID | 68 | Links to Invoices, POInvoiceDetails |
| [POInvoiceDetails](#poinvoicedetails-table) | Line-level invoice details | RecordID | 56 | Links to POInvoiceHeaders |

## Data Relationships

### Updated Invoice Processing Flow

```
File Upload → OCR Processing → Invoice Created → POInvoiceHeader Created → POInvoiceDetails Created
     ↓              ↓                ↓                    ↓                        ↓
   Files       Raw Text         Invoices table    POInvoiceHeaders      POInvoiceDetails
                  ↓                    ↓                    ↓                        ↓
            Document Raw Text    Links to Files    Links to Invoice    Links to POInvoiceHeader
```

### Key Relationships

1. **Files ↔ Invoices**: Many-to-many
   - One file can contain multiple invoices
   - One invoice can come from multiple files
   - Files table: `Invoices` field (multipleRecordLinks)
   - Invoices table: `Files` field (multipleRecordLinks)

2. **Invoices ↔ POInvoiceHeaders**: One-to-many
   - Multiple POInvoiceHeaders can share the same AP Invoice Number
   - Each POInvoiceHeader links to exactly one Invoice
   - Invoices table: `POInvoiceHeaders` field (`fldGeieJZPW2XwQEJ`) (multipleRecordLinks)
   - POInvoiceHeaders table: `Invoice` field (`fldWTaHrIJXSx5hrr`) (multipleRecordLinks)

3. **POInvoiceHeaders ↔ POInvoiceDetails**: One-to-many
   - Each POInvoiceDetail belongs to exactly one POInvoiceHeader
   - POInvoiceHeaders table: `Details` field (`fldyMJiQO4L0Ev0cT`) (multipleRecordLinks)
   - POInvoiceDetails table: `POInvoiceHeaders` field (`fldeJpf4G5Cj0LnaR`) (multipleRecordLinks)

4. **POInvoiceHeaders ↔ PO Receipt**: One-to-one (if PO Receipt table exists)
   - Each POInvoiceHeader corresponds to exactly one PO Receipt
   - *Note: PO Receipt table not found in current schema - may need to be added*

## Files Table

**Table ID:** `tbluYB0mHO6CQWrwL`  
**Primary Field:** FileID (`fld4aUSAm9rH0gPYt`)

### Core Fields

| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| FileID | `fld4aUSAm9rH0gPYt` | autoNumber | Unique file identifier |
| FileHash | `fldAkFbKnjYLzQJqS` | singleLineText | SHA-256 hash for duplicate detection |
| FileName | `fld7E1dvgRISwW0Pt` | singleLineText | Original file name |
| UploadedDate | `fldX1faf1UWuRF2p3` | date | When file was uploaded |
| Status | `fldV1n0WIjvaQVFjz` | singleSelect | Processing status |
| ParsedAt | `fldbB5yMnHs6fITao` | date | When OCR processing completed |
| Attachments | `fldsDbtBW8gSpq9VD` | multipleAttachments | File attachments |
| Raw-Text | `fldGeuHck13u4BmDY` | multilineText | OCR extracted text content |
| Error-Code | `fldRocwOoLwBolAMv` | singleLineText | Error classification code |
| Error-Description | `fldVm4uH7SYWLVKeg` | singleLineText | Detailed error description |
| Error-Link | `fldwB1xjV6HlVPCdL` | singleLineText | Link to error details |
| Created-At | `fldUFewWxBBP9D5bv` | createdTime | File creation timestamp |
| Modified-At | `fldnSfYc4IRnK3pHQ` | lastModifiedTime | Last modification timestamp |
| **Invoices** 🆕 | `flduJO35gW8Lo6Mh9` | multipleRecordLinks | **Links to Invoices table** |

### File Status Values

| Value | Color | Description |
|-------|--------|-------------|
| **Queued** | Blue Light | Waiting for processing |
| **Processing** | Teal Light | Currently being processed |
| **Processed** | Green Light | Successfully processed |
| **Attention** | Orange Light | Needs manual review |

## Invoices Table 🆕

**Table ID:** `tblokyH2U1PBhhCE9`  
**Primary Field:** RecordID (`fldvQzw4GlIefZTPy`)

**Purpose:** Primary invoice entity created at file upload. This is the main record that represents an invoice document.

### Core Fields

| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| RecordID | `fldvQzw4GlIefZTPy` | autoNumber | Unique invoice identifier |
| Invoice-Number | `fldI9lZSSR7ucHPHC` | singleLineText | Invoice number from document |
| VendId | `fldhRQMEeBh3yLzRj` | singleLineText | Vendor ID |
| Vendor-Name | `fldJGXLYs7xaXP7xR` | singleLineText | Vendor/supplier name |
| Amount | `fldO8fN0NWv8dqDKC` | currency | Total invoice amount (USD) |
| Date | `fldEx6RyGqFl0WivA` | date | Invoice date |
| Freight-Charge | `fldYXCLntMTfENKJa` | currency | Freight charges |
| Misc-Charge | `fldX0qPQMAgKaRFX3` | currency | Miscellaneous charges |
| Surcharge | `fldIgWe2IFDOqnYO1` | currency | Surcharge amount |
| POs | `fldmoLZSY47DRFnAr` | multilineText | Purchase order numbers (text) |
| Document-Raw-Text | `fldB5FcRvWID00Tdn` | multilineText | OCR extracted text content |
| Files | `fldDzY5Ch6fCP0XHp` | multipleRecordLinks | **Links to Files table** |
| Created-At | `fldOh6DdIq2JAhGHO` | createdTime | Record creation timestamp |
| Modified-At | `fldSAyzOAxppKn8rh` | lastModifiedTime | Last modification timestamp |
| MatchPayloadJSON | `fld7nZtX7h9ykBAS2` | multilineText | JSON payload for matching |
| ErrorCode | `fldwsvCcR8BsNYQVx` | singleLineText | Error classification code |
| Status | `fld8ZH6sheroClLwL` | singleSelect | Workflow status |
| Discount-Amount | `fld0zHEhMerfgxZx1` | currency | Discount amount |
| Discount-Date | `fldyN4Sf6FTZoH9YI` | date | Discount date |
| Balance | `fldgF26E6kAcOYIEf` | formula | Calculated balance (Amount - Headers-Sum - Freight-Charge - Surcharge - Misc-Charge) |
| Balance-Explanation | `fldXH56bhzI3ieEsU` | singleLineText | Explanation of balance |
| File-Raw-Text | `fldbhuxrnxJ1Fun9u` | multipleLookupValues | Lookup from Files table (Raw-Text field) |
| Missing-Fields | `fldRkn64EhJZkKKQg` | formula | Server-side validation (formula) - lists missing required fields |
| Attachments | `fldBSFvaBJYkkbaRe` | multipleLookupValues | Lookup from Files table (Attachments field) |
| POInvoiceHeaders | `fldGeieJZPW2XwQEJ` | multipleRecordLinks | **Links to POInvoiceHeaders table** |
| Headers-Sum | `fldI5H4YHsu4VPPjg` | rollup | Sum of Total-Invoice-Amount from linked POInvoiceHeaders |
| Line Items | `fldHPkRk05SqNzF2W` | multilineText | Line items data |
| Error Description | `fldnH8Tqrvk52I7e9` | multilineText | Detailed error description |

### Invoice Status Values

| Value | Color | Description |
|-------|--------|-------------|
| **Pending** | Green Light | Initial state, ready for processing |
| **Matched** | Blue Light | Matched to PO, ready for review |
| **Queued** | Orange Light | Queued for export |
| **Exported** | Purple Bright | Exported to ERP system |
| **Error** | Red Bright | Has errors, needs attention |

## POInvoiceHeaders Table

**Table ID:** `tblgEJz0WQtZusPAT`  
**Primary Field:** RecordID (`fldhszvX1XbN0cGah`)

**Purpose:** Represents PO-matched invoice headers. Multiple POInvoiceHeaders can share the same AP Invoice Number and link to the same Invoice.

### Core Fields

| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| RecordID | `fldhszvX1XbN0cGah` | autoNumber | Unique header identifier |
| **Invoice** 🆕 | `fldWTaHrIJXSx5hrr` | multipleRecordLinks | **Links to Invoices table** |
| InvoiceRecordID | `fldsuXjbykjLkRbC2` | multipleLookupValues | Lookup of Invoice RecordID |
| Details | `fldyMJiQO4L0Ev0cT` | multipleRecordLinks | Links to POInvoiceDetails |
| Company-Code | `fldFKFB68UVpa9ANK` | singleLineText | Company code |
| VendId | `fld7tAlKGvv0LG8EI` | singleLineText | Vendor ID |
| AP-Invoice-Number | `fld6MSB6CS7j3sCiS` | multipleLookupValues | Lookup from Invoice table |
| Remit-Name | `fldg1lTgqcRh7KX0Y` | multipleLookupValues | Lookup from Invoice table (Vendor-Name) |
| Invoice-Date | `fld27xiiYfeMD3XB5` | multipleLookupValues | Lookup from Invoice table |
| TermsId | `fld6zPKOrAgFUMA1q` | singleLineText | Payment terms ID |
| Due-Date | `fldNHyjXi1MkrFvS7` | formula | Calculated due date (Invoice-Date + TermsDaysInt) |
| Discount-Date | `fldSBhnyVm2fESlds` | multipleLookupValues | Lookup from Invoice table |
| Total-Invoice-Amount | `flda0ukWjWxzyJ2Hr` | multipleLookupValues | Lookup from Invoice table (Amount) |
| Freight-Charge | `fld5UETBDzu4e0uk6` | multipleLookupValues | Lookup from Invoice table |
| Miscellaneous-Charge | `fldEDwJxYhaye4VmJ` | multipleLookupValues | Lookup from Invoice table (Misc-Charge) |
| Discount-Amount | `fldUcQK1FqpUZxxGJ` | multipleLookupValues | Lookup from Invoice table |
| Surcharge | `fldSY9GdNlijlsYdQ` | multipleLookupValues | Lookup from Invoice table |
| APAcct | `fldyi7UcDACICVIcq` | singleLineText | AP account |
| APSub | `fldrdeHuh1NVCeKSv` | singleLineText | AP subaccount |
| Freight-Account | `fld336ezRpzzEkyGh` | singleLineText | Freight account |
| Freight-Subaccount | `fldVB7LIxLqOeMmvd` | singleLineText | Freight subaccount |
| Misc-Charge-Account | `fldCGiCgdrg5GL5pY` | singleLineText | Miscellaneous charge account |
| Misc-Charge-Subaccount | `fldeFFh9n47APVWUr` | singleLineText | Miscellaneous charge subaccount |
| PO-Number-Seq-Type | `fldgqMRGrJM3BUUfQ` | singleLineText | PO number sequence type |
| PO-Number | `fld4uJuo5MBMnsZgw` | singleLineText | Purchase order number |
| PO-Vendor | `fld0qGIscEzVUgiZm` | singleLineText | PO vendor |
| CuryId | `flduhd4WL9ksJK3cW` | singleLineText | Currency ID |
| CuryMultDiv | `fldqZxGWc5TR5Tomh` | singleSelect | Currency multiply/divide (multiple, divide) |
| CuryRate | `fldtu6II85lju5kvT` | number | Currency rate |
| CuryRateType | `fldLq5lUAm5C0HSa8` | singleLineText | Currency rate type |
| Update-Batch-Number | `fld4QUJecGm4skJhh` | singleLineText | Update batch number |
| Date-Stamp | `fldZxGyjFcQaPvxiO` | createdTime | Record creation timestamp |
| Time-Stamp | `fldXVDFDDk3sud6B9` | formula | Current time stamp |
| User-Id | `fldSelF39N2dmQ3EA` | singleLineText | User ID |
| Invoice-Balance | `fldHGoxrb3gYiN2Z7` | multipleLookupValues | Lookup from Invoice table (Balance) |
| Balance-Exception-YN | `fldE38iRhlU7uIvma` | formula | Checks if Invoice-Balance is non-zero |
| Job-Project-Number | `fldg88jTL4hxHCgUG` | singleLineText | Job/project number |
| DocumentAttachment | `fldy6aT5yhZVbcs87` | formula | Document attachment reference |
| Export-Status | `fldb5mLqnscBfBzjM` | singleSelect | Export status (Pending, Matched, Queued, Exported, Error) |
| Export-Error-Code | `fld08whvyI1HaV5Dx` | singleLineText | Export error code |
| Details-Sum | `fldId0eVt84ZYF9fx` | rollup | Sum of Line-Amount from linked Details |
| TermsDaysInt | `fldGmplqb3IKIwnBW` | number | Terms days (integer) |
| TaxID00-03 | `fldrfChafGoYKQ2aJ`, `fldxnhDiN7gAcEjS4`, `fldaTI1fhJnCe3T22`, `fldLImdkt3VKPM9kD` | singleLineText | Tax IDs (4 fields) |
| TaxTot00-03 | `fldJPOml9TR5KY0XV`, `flde9AkgkL7aMmHmC`, `fldgbCFoc9oeCUvfo`, `fldAszQzhL5op3gDZ` | currency | Tax totals (4 fields) |
| txblTot00-03 | `fldmkyVeMdke8yfzm`, `fldAFeEPbIgFXZvbO`, `fldkq1ZeymtKZS8di`, `fldqioYsgvrTwWJAx` | currency | Taxable totals (4 fields) |
| Tax00-03Acct | `fldc49yqGYfycjJm7`, `fldPFOUYttpBw2HVp`, `fldrtSPsGYh0EfR8O`, `fldXQ3vJa8HyitF03` | singleLineText | Tax accounts (4 fields) |
| Tax00-03Sub | `fldR03OR5REc0uPmA`, `fldaU2IBNcOm07Vu6`, `fld14PdXAJF2iUNEV`, `fldn1f5oPJYIMqChb` | singleLineText | Tax subaccounts (4 fields) |
| Update-YN | `fldfprb6BWN7yHaiU` | checkbox | Update flag |
| Update-Audit-Number | `fldZlmKvQaAmYGzcd` | singleLineText | Update audit number |
| GL-Exception-YN | `fld8VOSGAHVwsnNdp` | checkbox | GL exception flag |
| Type | `fld9hrf3hvO78stDY` | singleLineText | Record type |
| FutureA | `fldUDB4VInuh7JPOI` | singleLineText | Future field A |
| FutureB | `fldXSWA3dr1rLL5s4` | singleLineText | Future field B |

*Note: This table has 68 fields total. See latest_schema.json or schema-types.ts for complete field list.*

### POInvoiceHeader Status Values (Export-Status)

| Value | Color | Description |
|-------|--------|-------------|
| **Pending** | - | Pending export |
| **Matched** | - | Matched to PO |
| **Queued** | - | Queued for export |
| **Exported** | - | Exported to ERP |
| **Error** | - | Has errors |

## POInvoiceDetails Table

**Table ID:** `tblajSDlRV6SsUtw8`  
**Primary Field:** RecordID (`fldsFnV2r5H0Pljoz`)

**Purpose:** Line-level invoice details linked to POInvoiceHeaders. Each detail represents a single line item.

### Core Fields

| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| RecordID | `fldsFnV2r5H0Pljoz` | autoNumber | Unique detail identifier |
| POInvoiceHeaders | `fldeJpf4G5Cj0LnaR` | multipleRecordLinks | **Links to POInvoiceHeaders table** |
| HeaderRecordID | `fldFEMHbiZkR41Dzz` | multipleLookupValues | Lookup of Header RecordID |
| Company-Code | `flduZQavGskCdu35d` | multipleLookupValues | Lookup from Header |
| VendId | `fldwYCDK6mImfRGKQ` | multipleLookupValues | Lookup from Header |
| AP-Invoice-Number | `fldbItKufSN7jJcoe` | multipleLookupValues | Lookup from Header |
| Line-Number | `fldTKJp6ebeYQ4ti8` | singleLineText | Line sequence number |
| Item-No | `fldHh1UwP2TYOq5sF` | singleLineText | Item SKU/product number |
| Item-Description | `fldwQ6IQzEw9mRONP` | multilineText | Item description |
| Step | `fldi9cVjcUubszKd1` | singleLineText | Step identifier |
| Invoice-Price | `fldUHbpqV38hAceMw` | currency | Unit price |
| Invoice-Pricing-Qty | `fldS0PBUjsKt4j4Fo` | number | Pricing quantity |
| Quantity-Invoiced | `fldcBn6GL9jFFGxbW` | number | Quantity invoiced |
| Line-Amount | `fldypCHLMTKdhCtJh` | number | Total line amount |
| PO-Number-Seq-Type | `fld6bzXTyqa3HUgsl` | multipleLookupValues | Lookup from Header |
| PO-Number | `fldb9eHuvv0NL2uAS` | multipleLookupValues | Lookup from Header |
| PO-Release-Number | `fld0iqeOix7I3E1fh` | singleLineText | PO release number |
| PO-Line-Number | `fld44aIaJT2bd0Pve` | singleLineText | PO line number |
| Vendor-Ship-Number | `fldAjiR63OdQEI0VS` | singleLineText | Vendor ship number |
| Date-Received | `fld8dUDZw2Ewki8M4` | date | Date received |
| Quantity-Received | `fldm9Pj9tmNEbTjLL` | number | Quantity received |
| Quantity-Accepted | `fldyHlGfIbwu9Tqxh` | number | Quantity accepted |
| Purchase-Price | `fldAdxuO3XMEExrAw` | currency | Purchase price |
| Pricing-Quantity | `fld8NIB8NIeQc782l` | number | Pricing quantity |
| Already-Invoiced-Qty | `fldLRcAiUUmFZspRv` | number | Already invoiced quantity |
| ExpAcct | `fldMbMltkhFFWKJUU` | singleLineText | GL expense account |
| ExpSub | `fldKerXoxiWOGVLfF` | singleLineText | GL expense subaccount |
| PPV-Vouchered-Acct | `fld8QL2nm1N6KYkhA` | singleLineText | PPV vouchered account |
| PPV-Vouchered-SubAcct | `fld7YTh4AeqWXKvuR` | singleLineText | PPV vouchered subaccount |
| PPV-Unit-Cost | `fldeYDhZU0jIqvGWr` | formula | PPV unit cost calculation |
| Standard-Cost | `fldt9ttdXAuwVZj5U` | number | Standard cost |
| SurchargeType | `fldSkOOPdSeMXpqUN` | singleSelect | Surcharge type (Dollar, Percent) |
| SurchargeRate | `fldhDd6A2cK7gSKrN` | currency | Surcharge rate |
| Surcharge | `fldrfM3P3WpqPYWsp` | currency | Surcharge amount |
| GL-Exception-YN | `fld1TXi1SH6tWh81n` | singleLineText | GL exception flag |
| Invoiced-In-Full-YN | `fldkMgmQzxYtjWStZ` | singleLineText | Invoiced in full flag |
| Update-Level-Ind | `fldTIIZxPPflYDBzH` | singleLineText | Update level indicator |
| PO-UOM | `fld5BxvxdRs5zIV2s` | singleLineText | PO unit of measure |
| Job-Project-Number | `fldkSs9wHlRvdmQBR` | multipleLookupValues | Lookup from Header |
| BoxNbr | `fldGpiLavevepWgsf` | singleLineText | Box number |
| FutureA | `fldtLtHzF4eA2Hld6` | singleLineText | Future field A |
| FutureB | `fldVUsmxKS3WERXwN` | singleLineText | Future field B |
| Line-Pricing | `fldPv8Y6IhHnpH6A3` | formula | Line pricing calculation |
| Header | `fldrzIQxcaQWlAgwh` | singleLineText | Header reference |
| TaxID00-03 | `fldtGfOf1jFI9aDbE`, `fldYfRbCVad371ks3`, `fldzDmgba9EzmBrSo`, `fldRLMSigCKD5teaB` | multipleLookupValues | Tax IDs (4 fields, lookup from Header) |
| TaxAmt00-03 | `fldKjlpEzZoNjn3ix`, `fldTIM1VFMakCgyH2`, `fld7hseBSyCKVH3qC`, `fldtBDqltau80MMr0` | currency | Tax amounts (4 fields) |
| txblAmt00-03 | `fld3EOBBG1Di5KCeB`, `fld7oN8j9FprFxOHn`, `fldYWkUBK56G895DP`, `fldeT4ChgqreD0CfD` | currency | Taxable amounts (4 fields) |

*Note: This table has 56 fields total. See latest_schema.json or schema-types.ts for complete field list.*

## Referential Integrity

### Enforced Relationships

1. **Invoice → POInvoiceHeader**
   - Multiple POInvoiceHeaders can share the same AP Invoice Number
   - Each POInvoiceHeader links to exactly one Invoice via `Invoice` field (`fldWTaHrIJXSx5hrr`)
   - Invoices table tracks all linked POInvoiceHeaders via `POInvoiceHeaders` field (`fldGeieJZPW2XwQEJ`)

2. **POInvoiceHeader → POInvoiceDetail**
   - Each POInvoiceDetail belongs to exactly one POInvoiceHeader
   - POInvoiceHeaders table tracks linked details via `Details` field (`fldyMJiQO4L0Ev0cT`)
   - POInvoiceDetails table links back via `POInvoiceHeaders` field (`fldeJpf4G5Cj0LnaR`)

3. **File → Invoice**
   - Files link to Invoices via `Invoices` field (`flduJO35gW8Lo6Mh9`) (multipleRecordLinks)
   - Invoices link to Files via `Files` field (`fldDzY5Ch6fCP0XHp`) (multipleRecordLinks)
   - Many-to-many relationship

4. **POInvoiceHeader → PO Receipt** (if PO Receipt table exists)
   - Each POInvoiceHeader corresponds to exactly one PO Receipt
   - *Note: PO Receipt table not found in current schema*

## API Usage Examples

### Create Invoice from File Upload

```typescript
import { createAirtableClient } from '@/lib/airtable';

const client = createAirtableClient('tblokyH2U1PBhhCE9');

// Create Invoice record
const invoice = await client.createRecords('Invoices', {
  records: [{
    fields: {
      'Invoice-Number': 'INV-2025-001',
      'Vendor-Name': 'Acme Corp',
      'Amount': 1000.00,
      'Date': '2025-01-15',
      'Status': 'Pending',
      'Files': ['recFileId123'], // Link to file
      'Document-Raw-Text': rawTextContent
    }
  }]
});
```

### Create POInvoiceHeader Linked to Invoice

```typescript
// Create POInvoiceHeader linked to Invoice
const poHeader = await client.createRecords('POInvoiceHeaders', {
  records: [{
    fields: {
      'Company-Code': '001',
      'VendId': 'VEND001',
      'PO-Number': 'PO-2025-001',
      'TermsId': 'NET30',
      'Export-Status': 'Queued',
      'Invoice': ['recInvoiceId123'], // Link to Invoice (singular field name)
      'Details': [] // Will be populated with POInvoiceDetails
    }
  }]
});
```

### Link Files to Invoice

```typescript
// Update File record to link to Invoice
await client.updateRecords('Files', {
  records: [{
    id: 'recFileId123',
    fields: {
      'Invoices': ['recInvoiceId123'] // Link to Invoice
    }
  }]
});
```

## Schema Validation

The TypeScript types provide runtime validation for:
- ✅ Status transitions
- ✅ Required fields per record type
- ✅ Field type validation (dates, currencies, etc.)
- ✅ Relationship integrity
- ✅ Referential integrity between tables

## Performance Considerations

### Indexing
- Primary fields are automatically indexed
- Status fields should be considered for views/filtering
- Date fields (Date, Created At) for sorting
- Link fields for relationship queries

### Rate Limits
- 5 requests per second per base
- 50 requests per second per token
- Automatic retry with exponential backoff

### Batch Operations
- Create/update up to 10 records per request
- Use pagination for large record sets
- Consider async processing for bulk operations

## Views & Filtering

### Invoice Views
- **All**: All invoices
- **Pending**: Status = Pending
- **Matched**: Status = Matched
- **Exported**: Status = Exported

### File Views  
- **Queued**: Status = Queued
- **Processing**: Status = Processing
- **Processed**: Status = Processed
- **Unlinked**: No related invoices

### POInvoiceHeader Views
- **Queued**: Status = Queued
- **Exported**: Status = Exported
- **Error**: Status = Error

---

*This documentation reflects schema version 3.0.0 with Invoices as primary entity. For migration assistance, see SCHEMA_MIGRATION_ANALYSIS.md.*

*Last schema fetch: 2025-01-27*
