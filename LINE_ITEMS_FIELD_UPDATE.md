# Line Items Field Update

**Date:** 2025-11-11  
**Status:** ✅ Complete

## Overview

Added functionality to populate the `Line-Items` field in the Invoices table with the GPT-extracted invoice line items JSON during PO matching.

## Changes Made

### 1. Updated Processor (`src/lib/po-matching/processor.ts`)

- Added optional `updateInvoiceFn` parameter to `processPOMatching()`
- Added Step 6: Update Invoice record with Line Items JSON
- Serializes `gptResponse['Invoice Line Items']` to JSON string
- Updates the Invoice record with field `Line-Items`
- Non-critical operation - logs warning if update fails but doesn't throw

```typescript
// Step 6: Update Invoice record with Line Items JSON
if (updateInvoiceFn && gptResponse['Invoice Line Items'] && gptResponse['Invoice Line Items'].length > 0) {
  console.log('\n📝 Step 6: Updating Invoice with Line Items JSON...');
  try {
    await updateInvoiceFn(invoiceId, {
      'Line-Items': JSON.stringify(gptResponse['Invoice Line Items']),
    });
    console.log(`   ✅ Updated Invoice ${invoiceId} with ${gptResponse['Invoice Line Items'].length} line items`);
  } catch (error) {
    console.warn('   ⚠️  Warning: Failed to update Invoice with Line Items:', error);
    // Don't throw - this is not critical to the matching process
  }
}
```

### 2. Updated API Route (`src/app/api/match-invoice/route.ts`)

- Added `updateInvoice()` function to update Invoice records via PATCH
- Passes `updateInvoice` function to `processPOMatching()`

```typescript
async function updateInvoice(
  invoiceId: string,
  fields: Record<string, any>
): Promise<void> {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXTAUTH_URL || 'http://localhost:3000');
  const url = `${baseUrl}/api/airtable/${TABLE_NAMES.INVOICES}?baseId=${BASE_ID}`;
  
  console.log(`   Updating invoice ${invoiceId} with fields:`, Object.keys(fields));
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{
        id: invoiceId,
        fields,
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update invoice ${invoiceId}: ${response.status} - ${errorText}`);
  }
}
```

### 3. Updated Test Script (`test-gpt-matching.ts`)

- Added `updateInvoiceInAirtable()` function
- Calls update function after creating headers/details
- Logs success/warning messages

## Field Details

**Field Name:** `Line-Items`  
**Field Type:** Long text (JSON string)  
**Table:** Invoices  
**Content:** JSON array of invoice line items extracted by GPT

### Example Content

```json
[
  {
    "line": 1,
    "description": "STEEL BOLTS 1/4-20",
    "item": "ITEM-ACME-100",
    "itemNo": "ITEM-ACME-100",
    "quantity": 500,
    "qty": 500,
    "unit_price": 0.85,
    "price": 0.85,
    "amount": 425.00,
    "total": 425.00,
    "uom": "EA",
    "account": "5000",
    "subaccount": "100"
  }
]
```

## Benefits

1. **Audit Trail:** Complete record of GPT-extracted line items stored with the invoice
2. **Debugging:** Easy to see what GPT extracted vs what was matched to POs
3. **Reprocessing:** Can reprocess or review line items without re-running OCR/GPT
4. **Transparency:** Users can see exactly what line items were found on the invoice

## Testing

Run the test script to verify:

```bash
npx tsx test-gpt-matching.ts recEeIsdseafu6Kr2
```

Expected output:
```
📝 Updating Invoice with Line Items JSON...
======================================================================
✅ Updated Invoice recEeIsdseafu6Kr2 with 1 line items
```

## Notes

- The update is **optional** and **non-critical** - if it fails, the PO matching process continues
- The field name follows Airtable's kebab-case convention: `Line-Items`
- The JSON is stored as a string (Airtable long text field)
- This is separate from the POInvoiceDetails records - those are the matched/structured records for ERP export

## Related Files

- `src/lib/po-matching/processor.ts` - Main processor logic
- `src/app/api/match-invoice/route.ts` - API endpoint
- `test-gpt-matching.ts` - Test script
- `src/lib/types/po-matching.ts` - Type definitions (GPTMatchingResponse includes 'Invoice Line Items')


