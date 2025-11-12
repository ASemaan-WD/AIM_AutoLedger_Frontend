# Invoice Details Implementation

## Overview
This document describes the implementation of automatic InvoiceDetails creation when an InvoiceHeader is created through file upload.

## Changes Made

### 1. Updated LLM Schema (`src/lib/llm/schemas.ts`)
- Added `line_items` array to the `DocumentArraySchema`
- Created new `ParsedLineItem` type with fields:
  - `line_number`: Line sequence number
  - `item_no`: Item SKU or product number
  - `item_description`: Description of the item
  - `quantity_invoiced`: Quantity ordered/invoiced
  - `invoice_price`: Unit price per item
  - `line_amount`: Total line amount (quantity * price)
  - `po_number`: Purchase order number
  - `expacct`: GL expense account code

### 2. Updated LLM Prompt (`src/lib/llm/prompts.ts`)
- Enhanced `createParsePrompt()` to include instructions for extracting line items
- Added detailed guidelines for:
  - Extracting ALL line items from invoices
  - Proper field mapping for each line item
  - Handling non-invoice documents (empty array for line_items)
  - Numeric value formatting (not strings)

### 3. Created Invoice Details Helper (`src/lib/post-ocr/airtable-helpers.ts`)
- Added `createInvoiceDetails()` function that:
  - Takes a parsed document and invoice header ID
  - Creates InvoiceDetails records in Airtable for each line item
  - Maps line item fields to correct Airtable field names:
    - `InvoiceHeaders`: Links to parent invoice
    - `Line-Number`: Line sequence
    - `Item-No`: Product SKU
    - `Item-Description`: Item description
    - `Quantity-Invoiced`: Quantity
    - `Invoice-Price`: Unit price
    - `Line-Amount`: Total line amount
    - `PO-Number`: Purchase order number
    - `Expacct`: GL account code
    - `AP-Invoice-Number`: Invoice number (for reference)
    - `VendId`: Vendor ID (using vendor name as placeholder)
  - Handles errors gracefully (continues if one line item fails)
  - Returns array of created detail record IDs

### 4. Updated Post-OCR Processor (`src/lib/post-ocr/processor.ts`)
- Imported `createInvoiceDetails` helper
- Modified `ProcessFileResult` interface to include `detailsCreated` count
- Updated document processing loop to:
  1. Create InvoiceHeader record
  2. Check if document is an invoice with line items
  3. Call `createInvoiceDetails()` to create detail records
  4. Track total number of details created
- Enhanced logging to show invoice details creation progress
- Updated result object to include:
  - `detailsCreated`: Count of invoice details created
  - `lineItemsCount`: Per-document line item count

## Flow Diagram

```
Invoice Upload
    ↓
OCR Processing (Extract Raw Text)
    ↓
LLM Parsing (Extract Invoice Header + Line Items)
    ↓
Create InvoiceHeader Record in Airtable
    ↓
Create InvoiceDetails Records in Airtable
    (One record per line item, linked to header)
    ↓
Link Documents to File Record
    ↓
Complete
```

## Field Mappings

### From LLM Schema to Airtable InvoiceDetails

| LLM Field | Airtable Field | Type | Notes |
|-----------|---------------|------|-------|
| line_number | Line-Number | string | Line sequence |
| item_no | Item-No | string | Product SKU |
| item_description | Item-Description | string | Item description |
| quantity_invoiced | Quantity-Invoiced | number | Quantity ordered |
| invoice_price | Invoice-Price | number | Unit price |
| line_amount | Line-Amount | number | Total (qty × price) |
| po_number | PO-Number | string | Purchase order |
| expacct | Expacct | string | GL account code |

### Additional Fields Set

| Field | Source | Notes |
|-------|--------|-------|
| InvoiceHeaders | Record ID | Links to parent invoice |
| AP-Invoice-Number | Invoice Header | For reference |
| VendId | Vendor Name | Using name as placeholder |

## Testing

To test the implementation:

1. Upload an invoice PDF with line items
2. Check the post-OCR logs for:
   - Line items extraction in LLM parsing
   - Invoice header creation
   - Invoice details creation (one per line item)
3. Verify in Airtable:
   - InvoiceHeaders record exists
   - InvoiceDetails records exist and are linked to header
   - All line item fields are populated correctly

## Error Handling

- If LLM fails to extract line items, no details are created (graceful degradation)
- If one line item fails to create, others still proceed
- All errors are logged with details
- Function returns array of successfully created detail IDs

## Future Enhancements

1. **Vendor ID Lookup**: Replace vendor name placeholder with actual vendor ID lookup
2. **Company Code**: Add company code mapping based on store/location
3. **GL Account Validation**: Validate expense account codes against master list
4. **Line Item Matching**: Match line items with PO lines for validation
5. **Duplicate Detection**: Check for duplicate line items before creation

## Notes

- Line items are only created for documents of type `invoice`
- Non-invoice documents (store_receiver, delivery_ticket) will have empty `line_items` array
- The LLM is instructed to extract ALL line items from the invoice
- Numeric values (quantities, prices, amounts) are stored as numbers, not strings










