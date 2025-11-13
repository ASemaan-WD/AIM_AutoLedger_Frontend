# PO Matching Schema Update - Complete Implementation

## Overview

Updated the PO matching system to use a simplified schema where GPT returns match object indices instead of full detail records. This makes the prompt clearer and reduces token usage.

## Changes Made

### 1. Updated TypeScript Types (`src/lib/types/po-matching.ts`)

**New Types:**
- `GPTMatchObject` - Links invoice line to PO receipt via index
  - `match_object`: Index into matchingReceipts array
  - `invoice_price`: Unit price from invoice
  - `invoice_quantity`: Quantity from invoice
  - `invoice_amount`: Line total from invoice

**Updated Types:**
- `GPTPOInvoiceHeader`:
  - Added `TermsDaysInt` field (payment terms in days as integer)
  - Changed `details` from `GPTPOInvoiceDetail[]` to `GPTMatchObject[][]`
  
- `GPTMatchingResponse`:
  - Removed `'Invoice Line Items'` field
  - Changed `error_description` to `error`
  - Simplified to just `headers` and `error`

**Updated JSON Schema:**
- Removed Invoice Line Items schema
- Updated header schema to include `TermsDaysInt`
- Changed details schema to array of arrays of match objects
- Each match object has 4 required fields: `match_object`, `invoice_price`, `invoice_quantity`, `invoice_amount`

### 2. Updated OpenAI Matcher (`src/lib/po-matching/openai-matcher.ts`)

**New Prompt:**
- Simplified matching rules focused on exact item number equality
- Clear instructions about date validation (invoice date < receipt date)
- Explicit instruction to never split invoice lines across multiple receipts
- Concise error reporting in `error` field
- Includes example JSON structure in prompt

**Key Rules:**
- Match each invoice line to exactly one `matchingReceipts` entry
- Primary key: exact item number equality (with format variations allowed)
- Item description as secondary matching criteria
- Quantities, pricing, and dates should be validated
- Report unmatched lines in `error` field

**Updated Validation:**
- Now validates `headers` array and `error` string
- Counts match objects correctly (array of arrays)

### 3. Updated Processor (`src/lib/po-matching/processor.ts`)

**Changes:**
- Removed references to `'Invoice Line Items'`
- Changed `error_description` to `error`
- Passes `matchPayload` to airtable-creator
- Updates Invoice record with Error Description from `error` field

### 4. Updated Airtable Creator (`src/lib/po-matching/airtable-creator.ts`)

**Major Changes:**
- Now accepts `matchPayload` parameter containing `matchingReceipts` array
- Added `TermsDaysInt` to writable header fields
- Completely rewrote detail creation logic:
  - Receives `GPTMatchObject[][]` instead of full detail data
  - Flattens array of arrays to get all matches
  - For each match object:
    - Looks up receipt from `matchingReceipts` using `match_object` index
    - Merges invoice pricing data from match object
    - Merges PO receipt data from looked-up receipt
    - Creates complete POInvoiceDetail record

**Field Mapping:**
- Invoice fields (from match object): `Invoice-Price`, `Quantity-Invoiced`, `Line-Amount`
- PO fields (from receipt): All other fields like `Item-No`, `Item-Description`, `PO-Line-Number`, etc.

### 5. Created Test Scripts

#### `test-review-prompt.ts`
**Purpose:** Review the complete prompt sent to OpenAI without making the API call

**Usage:**
```bash
npx tsx test-review-prompt.ts <invoiceId>
```

**Features:**
- Fetches invoice from Airtable
- Displays complete system and user messages
- Shows prompt statistics (length, estimated tokens)
- Displays the JSON schema used for structured outputs
- Helpful for debugging and prompt optimization

#### `test-po-matching-full.ts`
**Purpose:** Test the complete PO matching flow with detailed logging

**Usage:**
```bash
npx tsx test-po-matching-full.ts <invoiceId>
```

**Features:**
- Complete end-to-end test of PO matching
- Step-by-step logging of:
  1. Invoice fetch
  2. Field filtering
  3. MatchPayloadJSON extraction
  4. OpenAI API call with timing
  5. GPT response display (full JSON)
  6. Record creation in Airtable
  7. Invoice update with Error Description
- Response summary with match counts per header
- Lists all created record IDs
- Provides Airtable URLs for quick access
- Error handling with stack traces

## New Response Format

### Example GPT Response:

```json
{
  "headers": [
    {
      "Company-Code": "ACME",
      "VendId": "VEND001",
      "TermsId": "NET30",
      "TermsDaysInt": 30,
      "APAcct": "2000",
      "APSub": "100",
      "PO-Number": "PO-12345",
      "PO-Vendor": "Test Vendor Inc",
      "CuryId": "USD",
      "details": [
        [
          {
            "match_object": 0,
            "invoice_price": 100.00,
            "invoice_quantity": 10,
            "invoice_amount": 1000.00
          }
        ],
        [
          {
            "match_object": 1,
            "invoice_price": 50.00,
            "invoice_quantity": 5,
            "invoice_amount": 250.00
          }
        ]
      ]
    }
  ],
  "error": ""
}
```

### With Errors:

```json
{
  "headers": [
    {
      "Company-Code": "ACME",
      "VendId": "VEND001",
      "TermsId": "NET30",
      "TermsDaysInt": 30,
      "PO-Number": "PO-12345",
      "details": [
        [
          {
            "match_object": 0,
            "invoice_price": 100.00,
            "invoice_quantity": 10,
            "invoice_amount": 1000.00
          }
        ]
      ]
    }
  ],
  "error": "Invoice line 2 (Item XYZ-789) could not be matched - no matching receipt found in PO data"
}
```

## How It Works

1. **GPT receives:**
   - Invoice data (filtered non-null fields)
   - MatchPayloadJSON containing `matchingReceipts` array

2. **GPT returns:**
   - Headers with match objects (not full details)
   - Each match object contains just:
     - Index into matchingReceipts
     - Invoice pricing (price, quantity, amount)
   - Error string for unmatched lines

3. **Backend processes:**
   - For each match object:
     - Looks up receipt using `match_object` index
     - Merges invoice pricing with PO receipt data
     - Creates POInvoiceDetail with complete data
   - Updates Invoice with Error Description

## Benefits

1. **Simpler prompt**: GPT doesn't need to copy all PO fields
2. **Reduced tokens**: Only indices and invoice data in response
3. **Clearer intent**: GPT just matches and provides invoice pricing
4. **Single source of truth**: PO data comes from matchingReceipts, not GPT
5. **Better error handling**: Clear separation between matches and errors
6. **TermsDaysInt**: GPT parses terms and provides integer days

## Testing

### Test Prompt Review:
```bash
npx tsx test-review-prompt.ts recXXXXXXXXXXXXXX
```

This will show you the complete prompt without calling OpenAI.

### Test Full Matching:
```bash
npx tsx test-po-matching-full.ts recXXXXXXXXXXXXXX
```

This will:
- Call OpenAI
- Display the complete GPT response
- Create records in Airtable
- Show all created record IDs
- Display any errors

## Error Description Field

The `Error-Description` field on the Invoice table is now updated with the `error` field from GPT response. This field contains:
- Empty string if all lines matched successfully
- Concise explanation of unmatched invoice lines if any matching failed

Example error messages:
- `"Invoice line 2 (Item ABC-123) - no matching PO receipt found"`
- `"Invoice line 3 quantity (100) exceeds PO receipt quantity (50)"`
- `"Invoice date (2025-01-15) is after receipt date (2025-01-10) for line 1"`

## Files Modified

1. `src/lib/types/po-matching.ts` - Updated types and JSON schema
2. `src/lib/po-matching/openai-matcher.ts` - New prompt and validation
3. `src/lib/po-matching/processor.ts` - Updated to use new response format
4. `src/lib/po-matching/airtable-creator.ts` - New detail creation logic
5. `test-review-prompt.ts` - New test script (created)
6. `test-po-matching-full.ts` - New test script (created)

## Backward Compatibility

⚠️ **Breaking Changes**: This update changes the GPT response format completely. Old responses will not work with the new code.

Existing POInvoiceHeaders and POInvoiceDetails records are not affected - this only changes how new records are created.


