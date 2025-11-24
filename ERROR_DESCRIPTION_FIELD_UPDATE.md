# Error Description Field Update

**Date:** 2025-11-11  
**Status:** ✅ Complete

## Overview

Added `error_description` field to GPT response schema and functionality to populate the "Error Description" field in the Invoices table with any errors, warnings, or matching issues encountered during PO matching.

## Changes Made

### 1. Updated TypeScript Types (`src/lib/types/po-matching.ts`)

- Added `error_description?: string` to `GPTMatchingResponse` interface
- Added `error_description` property to `POMatchingJSONSchema` with description

```typescript
export interface GPTMatchingResponse {
  'Invoice Line Items': InvoiceLineItem[];
  headers: GPTPOInvoiceHeader[];
  error_description?: string; // Optional - any errors or matching issues
}
```

### 2. Updated JSON Schema (`gpt-output-schema.json`)

- Added `error_description` property to the schema
- Marked as optional (not in required array)

```json
{
  "error_description": {
    "type": "string",
    "description": "Optional field for describing any errors, warnings, or matching issues encountered during processing. Leave empty if no issues."
  }
}
```

### 3. Updated GPT Prompt (`src/lib/po-matching/openai-matcher.ts`)

- Added instructions for GPT to populate `error_description` when issues are encountered
- Examples include: missing PO matches, unclear line items, data inconsistencies, partial matches

```typescript
**Error Description:**
- If you encounter any issues, warnings, or problems during matching, describe them in the "error_description" field
- Examples: missing PO matches, unclear line items, data inconsistencies, partial matches, etc.
- Leave error_description empty if there are no issues
- Be descriptive and specific about what the issue is and which line items or POs are affected
```

### 4. Updated Processor (`src/lib/po-matching/processor.ts`)

- Modified Step 6 to also update Error Description field
- Combined Line Items and Error Description updates into single operation
- Only updates if `error_description` is provided

```typescript
// Step 6: Update Invoice record with Line Items JSON and Error Description
if (updateInvoiceFn) {
  const updateFields: Record<string, any> = {};
  
  // Add Line Items if available
  if (gptResponse['Invoice Line Items'] && gptResponse['Invoice Line Items'].length > 0) {
    updateFields['Line-Items'] = JSON.stringify(gptResponse['Invoice Line Items']);
  }
  
  // Add Error Description if provided
  if (gptResponse.error_description) {
    updateFields['Error-Description'] = gptResponse.error_description;
  }
  
  if (Object.keys(updateFields).length > 0) {
    await updateInvoiceFn(invoiceId, updateFields);
  }
}
```

### 5. Updated Test Script (`test-gpt-matching.ts`)

- Updated to handle `error_description` from GPT response
- Displays error description in console output if present

## Field Details

**GPT Field Name:** `error_description` (snake_case)  
**Airtable Field Name:** `Error-Description` (kebab-case)  
**Field Type:** String (Long text)  
**Table:** Invoices  
**Required:** No (optional)

### Example Error Descriptions

GPT might populate this field with descriptions like:

- "Unable to match invoice line item 'ITEM-ACME-500' to any PO receipt. No matching item number found in PO candidates."
- "Partial match: Invoice line item 'ITEM-ACME-100' matches PO receipt but quantities differ (Invoice: 500, PO: 450)."
- "Multiple PO receipts found for same item number 'ITEM-ACME-200'. Using most recent receipt date."
- "Missing required field 'Job-Project-Number' in PO receipt for line item 'ITEM-ACME-300'."
- "Data inconsistency: Invoice shows unit price $0.85 but PO receipt shows $0.80. Using invoice price."

## Benefits

1. **Transparency:** Users can see what issues GPT encountered during matching
2. **Debugging:** Helps identify problematic invoices or matching scenarios
3. **Quality Control:** Allows review of edge cases and data inconsistencies
4. **Audit Trail:** Complete record of matching process and any warnings

## Usage

The field is automatically populated when:
- GPT encounters issues during matching
- PO matches are incomplete or unclear
- Data inconsistencies are detected
- Required fields are missing

If no issues are encountered, the field remains empty (not populated).

## Testing

Run the test script to verify:

```bash
npx tsx test-gpt-matching.ts recEeIsdseafu6Kr2
```

Expected output (if error_description is present):
```
📝 Updating Invoice with Line Items and Error Description...
======================================================================
✅ Updated Invoice recEeIsdseafu6Kr2
   - Line Items: 1 items
   - Error Description: Unable to match invoice line item...
```

## Related Files

- `src/lib/types/po-matching.ts` - Type definitions
- `src/lib/po-matching/openai-matcher.ts` - GPT prompt
- `src/lib/po-matching/processor.ts` - Processor logic
- `src/app/api/match-invoice/route.ts` - API endpoint
- `test-gpt-matching.ts` - Test script
- `gpt-output-schema.json` - JSON schema reference


















