# OCR Field Updates Summary

**Date:** 2025-11-12  
**Changes:** Updated OCR parsing to use correct Airtable field names and added flexible Line Items parsing

## Overview

Updated the OCR parsing system to:
1. Use correct hyphenated field names from the Airtable schema
2. Add flexible `Line Items` field parsing that stores comprehensive line item data as JSON
3. Ensure consistency across all field references in the codebase

## Changes Made

### 1. Schema Types (`src/lib/airtable/schema-types.ts`)

**Added Fields:**
- `LINE_ITEMS: 'fldHPkRk05SqNzF2W'` to FIELD_IDS.INVOICES
- `LINE_ITEMS: 'Line Items'` to FIELD_NAMES.INVOICES
- `ERROR_DESCRIPTION: 'fldnH8Tqrvk52I7e9'` to FIELD_IDS.INVOICES
- `ERROR_DESCRIPTION: 'Error Description'` to FIELD_NAMES.INVOICES

**Updated InvoicesRecord Interface:**
```typescript
'Line Items'?: string; // JSON string containing flexible line items data
'Error Description'?: string;
```

### 2. LLM Schema (`src/lib/llm/schemas.ts`)

**Updated Line Items Schema:**
- Changed from rigid structure with required fields to flexible structure
- Now uses `additionalProperties: true` to allow any fields
- Updated description to emphasize flexibility and comprehensiveness

**Before:**
```typescript
line_items: {
  type: "array",
  items: {
    type: "object",
    properties: {
      line_number: { ... },
      item_no: { ... },
      // ... 8 required fields with specific structure
    },
    required: [...],
    additionalProperties: false
  }
}
```

**After:**
```typescript
line_items: {
  type: "array",
  items: {
    type: "object",
    description: "Flexible line item object with comprehensive invoice line data...",
    additionalProperties: true
  }
}
```

**Updated TypeScript Type:**
```typescript
export type ParsedLineItem = Record<string, any>;
```

### 3. LLM Prompt (`src/lib/llm/prompts.ts`)

**Enhanced Line Items Instructions:**
- Added comprehensive list of common and additional fields to capture
- Emphasized flexibility: "DO NOT limit yourself to the fields listed above"
- Provided examples of field types to look for:
  - Common: line_number, item_no, item_description, quantity, price, amount, po_number, uom, etc.
  - Additional: vendor codes, batch/lot/serial numbers, cost centers, custom fields, multiple quantity/price variants
- Instructed to use descriptive snake_case field names
- Emphasized capturing ALL available line item data

### 4. Airtable Helpers (`src/lib/post-ocr/airtable-helpers.ts`)

**Updated `createInvoiceRecord` Function:**
- Changed field names to use hyphens (e.g., `Invoice-Number` instead of `Invoice Number`)
- Added Line Items storage as JSON string:
  ```typescript
  if (doc.line_items && doc.line_items.length > 0) {
    fields['Line Items'] = JSON.stringify(doc.line_items, null, 2);
  }
  ```

**Updated Field Names:**
- `Document Raw Text` → `Document-Raw-Text`
- `Invoice Number` → `Invoice-Number`
- `Vendor Name` → `Vendor-Name`
- `Freight Charge` → `Freight-Charge`

**Fixed `createPOInvoiceHeaderRecord` Function:**
- Changed `Invoices` → `Invoice` (correct field name per schema)
- Removed setting of lookup fields (AP-Invoice-Number, Remit-Name, Invoice-Date, Total-Invoice-Amount)
- These fields automatically populate via the Invoice link
- Changed `Status` → `Export-Status` (correct field name per schema)

**Updated Deprecated `createDocumentRecord` Function:**
- Updated all field names to use hyphens
- Added Line Items and PO Numbers handling
- Added Freight Charge and Surcharge handling

### 5. Transforms (`src/lib/airtable/transforms.ts`)

**Updated `INVOICE_ENTITY_FIELDS` Constant:**
```typescript
INVOICE_NUMBER: 'Invoice-Number',
VENDOR_NAME: 'Vendor-Name',
FREIGHT_CHARGE: 'Freight-Charge',
MISC_CHARGE: 'Misc-Charge',
DOCUMENT_RAW_TEXT: 'Document-Raw-Text',
CREATED_AT: 'Created-At',
UPDATED_AT: 'Modified-At',
BALANCE_EXPLANATION: 'Balance-Explanation',
FILE_RAW_TEXT: 'File-Raw-Text',
MISSING_FIELDS: 'Missing-Fields',
LINE_ITEMS: 'Line Items',
ERROR_DESCRIPTION: 'Error Description',
```

### 6. Invoice Hooks (`src/lib/airtable/invoice-hooks.ts`)

**Updated Field References:**
```typescript
// Before
!fields['Vendor Name'] || !fields['Invoice Number']

// After
!fields['Vendor-Name'] || !fields['Invoice-Number']
```

### 7. Document Details Panel (`src/components/documents/document-details-panel.tsx`)

**Updated Airtable API Call:**
```typescript
fields: {
  'Vendor-Name': editingVendorName.trim(),
  'VendId': null
}
```

## Line Items Structure

### Philosophy
The Line Items field now uses a **flexible, comprehensive structure** instead of a rigid schema. This allows the OCR system to capture ALL available data from invoice line items without being constrained by predefined fields.

### Storage Format
- **Type:** multilineText (Airtable field)
- **Content:** JSON string with pretty printing (2-space indent)
- **Structure:** Array of objects with any/all available properties

### Example Line Items JSON
```json
[
  {
    "line_number": "1",
    "item_no": "ABC-123",
    "item_description": "Widget Assembly",
    "quantity": 100,
    "quantity_invoiced": 100,
    "invoice_price": 12.50,
    "unit_price": 12.50,
    "line_amount": 1250.00,
    "uom": "EA",
    "po_number": "PO-2025-001",
    "expacct": "5000-100",
    "discount_percent": 5,
    "tax_rate": 8.25,
    "date_received": "2025-01-15",
    "warehouse": "WH-01"
  },
  {
    "line_number": "2",
    "sku": "XYZ-789",
    "description": "Gadget Component",
    "qty_ordered": 50,
    "unit_cost": 25.00,
    "extended_price": 1250.00,
    "unit_of_measure": "BOX",
    "purchase_order": "PO-2025-001",
    "gl_account": "5000-200",
    "lot_number": "LOT-2025-01",
    "notes": "Rush delivery"
  }
]
```

### Benefits
1. **Flexibility:** Can capture any field structure from any vendor's invoice
2. **Completeness:** No data is lost due to rigid schema constraints
3. **Adaptability:** New field types can be captured without schema changes
4. **Vendor-Agnostic:** Works with different invoice formats and terminologies

## Field Naming Conventions

### Airtable Field Names
Following the schema documented in `AIRTABLE_SCHEMA.md`:
- Use hyphens for multi-word fields: `Invoice-Number`, `Vendor-Name`, `Freight-Charge`
- Exceptions: Single words or special cases: `Amount`, `Date`, `Status`, `VendId`, `POs`
- Space-separated: `Line Items`, `Error Description` (special multilineText fields)

### LLM Field Names (Parsed Document)
- Use snake_case: `invoice_number`, `vendor_name`, `freight_charge`
- Arrays use plural: `po_numbers`, `line_items`
- Consistent with camelCase in TypeScript types

## Testing Recommendations

1. **Test Line Items Parsing:**
   - Upload invoices with varying line item structures
   - Verify all available fields are captured in the JSON
   - Check that numeric values are stored as numbers, not strings

2. **Test Field Name Updates:**
   - Verify Invoice records are created with correct field names
   - Check POInvoiceHeader creation with Invoice link
   - Confirm lookup fields populate automatically

3. **Test Flexible Structure:**
   - Upload invoices from different vendors
   - Verify diverse field names are captured (UOM vs unit_of_measure, qty vs quantity, etc.)
   - Confirm additional fields (lot numbers, batch codes, etc.) are included

## Migration Notes

### Breaking Changes
- Field names in Airtable API calls must use hyphens
- POInvoiceHeaders `Invoices` field → `Invoice` (singular)
- POInvoiceHeaders `Status` field → `Export-Status`

### Backward Compatibility
- Deprecated `createDocumentRecord` function updated but still available
- Existing code using old field names will need updates
- Line Items field is new - existing records won't have this data

## Related Documentation
- `AIRTABLE_SCHEMA.md` - Complete schema documentation
- `INVOICE_DETAILS_IMPLEMENTATION.md` - Original line items implementation
- `POST_OCR_IMPLEMENTATION.md` - Post-OCR processing flow
- `GPT_OUTPUT_SCHEMA.md` - GPT structured output schema

## Files Modified
1. `src/lib/airtable/schema-types.ts`
2. `src/lib/llm/schemas.ts`
3. `src/lib/llm/prompts.ts`
4. `src/lib/post-ocr/airtable-helpers.ts`
5. `src/lib/airtable/transforms.ts`
6. `src/lib/airtable/invoice-hooks.ts`
7. `src/components/documents/document-details-panel.tsx`

---

**Status:** ✅ Complete  
**Linter Errors:** None  
**Next Steps:** Test with real invoice uploads to verify field name updates and flexible line items parsing

