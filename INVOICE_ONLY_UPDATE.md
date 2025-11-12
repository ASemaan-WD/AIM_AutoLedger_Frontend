# Invoice-Only Processing Update

## Summary
Updated the OCR parsing system to focus exclusively on invoices and skip any non-invoice documents.

## Changes Made

### 1. Updated Prompts (`src/lib/llm/prompts.ts`)

#### `createParsePrompt()`
- Changed focus from generic "documents" to specifically "invoices"
- Added clear instruction: "We ONLY process invoices"
- Explained that non-invoices should be marked as `document_type: "other"` and will be skipped
- Reorganized rules to be "Rules for INVOICES"
- Clarified that multiple invoices in one file will all be processed
- Updated field descriptions to be invoice-specific

#### `createExtractDocTextPrompt()`
- Changed from "document" to "invoice" throughout
- Updated to extract invoice-specific information:
  - Invoice header information
  - All line items with details
  - Subtotals and totals
  - Charges (freight, surcharge, misc charges)
  - Purchase order numbers
  - Footer text
- Removed generic "document type" from identifying fields

### 2. Updated Processor (`src/lib/post-ocr/processor.ts`)

#### Document Filtering Logic
Added filtering to only process invoices:
```typescript
// Filter to only process invoices - skip any non-invoice documents
const invoiceDocuments = parsedDocuments.filter(doc => doc.document_type === 'invoice');
const skippedCount = parsedDocuments.length - invoiceDocuments.length;
```

#### Skip Non-Invoices
- Logs warning when non-invoice documents are skipped
- If no invoices found at all, returns success with zero invoices created
- Returns helpful message: "No invoices found in file - all documents were non-invoices"

#### Processing Loop
- Changed from processing `parsedDocuments` to processing `invoiceDocuments`
- Updated logging to reflect invoice-specific processing
- Added `miscCharge` to document logging

#### Result Details
Updated return object to include:
- `totalParsedDocuments`: How many documents LLM found
- `invoicesProcessed`: How many were actually invoices
- `nonInvoicesSkipped`: How many were skipped
- Added `miscCharge` to invoice details

### 3. Updated Airtable Helpers (`src/lib/post-ocr/airtable-helpers.ts`)

Added support for `misc_charge` field:
- Maps `doc.misc_charge` to Airtable field `'Misc-Charge'`
- Added to both `createInvoiceRecord()` and deprecated `createDocumentRecord()`

## Behavior

### Scenario 1: File with 2 invoices
- Both invoices are processed
- Both are created in Airtable
- Result: 2 invoices created

### Scenario 2: File with 1 invoice + 1 packing slip
- Invoice is processed and created
- Packing slip (marked as "other") is skipped
- Log: "⚠️ Skipping 1 non-invoice document(s)"
- Result: 1 invoice created

### Scenario 3: File with only packing slips (no invoices)
- All documents marked as "other"
- Nothing created in Airtable
- Log: "⚠️ No invoices found in the file - nothing to process"
- Result: Success with 0 invoices created

## Fields Processed for Invoices

All invoices are parsed with these fields:
1. `invoice_number` - Invoice/document reference number
2. `vendor_name` - Vendor/supplier name
3. `invoice_date` - Date in YYYY-MM-DD format
4. `amount` - Total invoice amount
5. `freight_charge` - Freight/shipping charges
6. `surcharge` - Surcharges and additional fees
7. `misc_charge` - Miscellaneous charges (**newly added**)
8. `po_numbers` - Array of purchase order numbers
9. `document_type` - Must be "invoice" to be processed

## Testing Recommendations

1. Test with single invoice file
2. Test with multiple invoices in one file
3. Test with mixed invoice + non-invoice documents
4. Test with file containing only non-invoice documents
5. Verify `misc_charge` is properly extracted and stored
6. Verify non-invoice documents are logged but skipped

## Notes

- The schema still supports `document_type: "other"` for flexibility
- Non-invoice documents are NOT created in Airtable
- The LLM is instructed to identify non-invoices so we can skip them gracefully
- This approach provides better logging and metrics vs. filtering at schema level

