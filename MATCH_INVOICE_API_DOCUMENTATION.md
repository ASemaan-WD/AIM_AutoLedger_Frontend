# Match Invoice API - Complete Documentation

**Generated:** November 18, 2025  
**Purpose:** Documentation for refactoring Match Invoice API after Airtable schema changes  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [API Endpoint](#api-endpoint)
3. [Architecture & File Structure](#architecture--file-structure)
4. [Data Flow](#data-flow)
5. [Implementation Details](#implementation-details)
6. [Airtable Schema Dependencies](#airtable-schema-dependencies)
7. [OpenAI Integration](#openai-integration)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Environment Variables](#environment-variables)

---

## Overview

The Match Invoice API is a critical component that:
1. Takes an Invoice record from Airtable
2. Matches invoice line items to Purchase Order (PO) receipts using AI
3. Creates structured POInvoiceHeader and POInvoiceDetail records
4. Updates the Invoice status based on matching results

**Key Technologies:**
- Next.js API Routes
- OpenAI GPT-4o with Structured Outputs
- Airtable REST API
- TypeScript

---

## API Endpoint

### POST /api/match-invoice

**Location:** `src/app/api/match-invoice/route.ts`

**Request:**
```json
{
  "invoiceId": "recXXXXXXXXXXXXXX"
}
```

**Validation:**
- `invoiceId` must be present and a string
- `invoiceId` must start with "rec" (Airtable record ID format)

**Success Response (200):**
```json
{
  "success": true,
  "headers": {
    "ids": ["recHeader1", "recHeader2"],
    "count": 2
  },
  "details": {
    "ids": ["recDetail1", "recDetail2", "recDetail3"],
    "count": 3
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "headers": { "ids": [], "count": 0 },
  "details": { "ids": [], "count": 0 },
  "error": "Error message"
}
```

### GET /api/match-invoice (Health Check)

Returns API documentation and environment status.

---

## Architecture & File Structure

```
src/
├── app/api/match-invoice/
│   └── route.ts                    # API endpoint handlers (POST & GET)
│
├── lib/
│   ├── po-matching/
│   │   ├── processor.ts            # Main orchestrator
│   │   ├── openai-matcher.ts       # OpenAI integration
│   │   ├── airtable-creator.ts     # Airtable record creation
│   │   └── __tests__/
│   │       ├── processor.test.ts   # Unit tests
│   │       └── mocks.ts            # Mock data for testing
│   │
│   ├── types/
│   │   └── po-matching.ts          # TypeScript interfaces and JSON schema
│   │
│   └── airtable/
│       └── schema-types.ts         # Airtable schema constants
```

### Key Files to Review

1. **`route.ts`** - Entry point, handles HTTP requests
2. **`processor.ts`** - Core business logic
3. **`openai-matcher.ts`** - AI matching logic
4. **`airtable-creator.ts`** - Database operations
5. **`po-matching.ts`** - Type definitions
6. **`schema-types.ts`** - Schema constants

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. API Request Received                       │
│                    POST /api/match-invoice                       │
│                    { invoiceId: "recXXX..." }                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              2. Fetch Invoice from Airtable                      │
│              GET /api/airtable/Invoices/{invoiceId}              │
│                                                                  │
│  Response:                                                       │
│  {                                                               │
│    "id": "recXXX...",                                           │
│    "fields": {                                                   │
│      "Invoice-Number": "INV-001",                               │
│      "Vendor-Name": "Acme Corp",                                │
│      "Amount": 1500.00,                                         │
│      "MatchPayloadJSON": "{...}",                               │
│      ...                                                         │
│    }                                                             │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              3. Filter Non-Null Fields                           │
│              Remove fields with null/undefined/empty values      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│          4. Extract & Parse MatchPayloadJSON                     │
│                                                                  │
│  MatchPayload Structure:                                         │
│  {                                                               │
│    "vendor": {                                                   │
│      "vendorId": "VEND001",                                     │
│      "ppvVoucheredAcct": "5000",                                │
│      "ppvVoucheredSubAcct": "100"                               │
│    },                                                            │
│    "matchingReceipts": [                                        │
│      {                                                           │
│        "itemNo": "ITEM-001",                                    │
│        "itemDescription": "Widget A",                           │
│        "quantityReceived": 100,                                 │
│        "purchasePrice": 10.00,                                  │
│        "expAcct": "6000",                                       │
│        ...                                                       │
│      }                                                           │
│    ]                                                             │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│            5. Call OpenAI GPT-4o (Structured Output)             │
│            POST https://api.openai.com/v1/chat/completions       │
│                                                                  │
│  Prompt: Invoice data + PO matching rules + JSON schema         │
│                                                                  │
│  Response:                                                       │
│  {                                                               │
│    "headers": [                                                  │
│      {                                                           │
│        "Company-Code": "001",                                   │
│        "VendId": "VEND001",                                     │
│        "PO-Number": "PO-12345",                                 │
│        "details": [                                             │
│          [                                                       │
│            {                                                     │
│              "match_object": 0,                                 │
│              "invoice_price": 10.00,                            │
│              "invoice_quantity": 100,                           │
│              "invoice_amount": 1000.00                          │
│            }                                                     │
│          ]                                                       │
│        ]                                                         │
│      }                                                           │
│    ],                                                            │
│    "error": ""                                                   │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              6. Create POInvoiceHeader Records                   │
│              POST /api/airtable/POInvoiceHeaders                 │
│                                                                  │
│  For each header in GPT response:                               │
│  {                                                               │
│    "fields": {                                                   │
│      "Invoice": ["recXXX..."],  // Link to Invoice              │
│      "Company-Code": "001",                                     │
│      "VendId": "VEND001",                                       │
│      "PO-Number": "PO-12345",                                   │
│      "User-Id": "test-user",                                    │
│      ...                                                         │
│    }                                                             │
│  }                                                               │
│                                                                  │
│  Response: { "id": "recHeaderXXX..." }                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│            7. Create POInvoiceDetail Records                     │
│            POST /api/airtable/POInvoiceDetails                   │
│                                                                  │
│  For each match object in header.details:                       │
│  {                                                               │
│    "fields": {                                                   │
│      "POInvoiceHeaders": ["recHeaderXXX..."],  // Link          │
│      "Item-No": "ITEM-001",                                     │
│      "Invoice-Price": 10.00,                                    │
│      "Quantity-Invoiced": 100,                                  │
│      "Line-Amount": 1000.00,                                    │
│      // Copy from matchingReceipts[match_object]:              │
│      "Date-Received": "2025-11-20",                             │
│      "Purchase-Price": 10.00,                                   │
│      "ExpAcct": "6000",                                         │
│      ...                                                         │
│    }                                                             │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              8. Update Invoice Record Status                     │
│              PATCH /api/airtable/Invoices                        │
│                                                                  │
│  Logic:                                                          │
│  - If detailIds.length > 0: Status = "Matched"                 │
│  - If detailIds.length === 0: Status = "Error"                 │
│                                ErrorCode = "NO_MATCH"           │
│  - If gptResponse.error: add Error-Description                  │
│  - If vendor.vendorId: add VendId                               │
│                                                                  │
│  Update: { "Status": "Matched", "VendId": "VEND001", ... }     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    9. Return Success Response                    │
│                    { success, headers, details }                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Main API Handler (`route.ts`)

**File:** `src/app/api/match-invoice/route.ts`

**Key Functions:**
- `POST(request)` - Main endpoint handler
- `fetchInvoice(invoiceId)` - Fetches invoice from Airtable
- `createRecords(tableName, records)` - Creates records in Airtable
- `updateInvoice(invoiceId, fields)` - Updates invoice status
- `GET()` - Health check/documentation endpoint

**Environment Configuration:**
- Runtime: `nodejs`
- Dynamic: `force-dynamic`
- Max Duration: `120` seconds

### 2. Main Processor (`processor.ts`)

**File:** `src/lib/po-matching/processor.ts`

**Function:** `processPOMatching(invoiceId, fetchInvoiceFn, createRecordsFn, updateInvoiceFn)`

**Steps:**
1. Fetch invoice record
2. Filter non-null fields
3. Extract & parse MatchPayloadJSON
4. Call OpenAI to generate matches
5. Create POInvoiceHeaders
6. Create POInvoiceDetails (nested)
7. Update Invoice status, VendId, errors
8. Return summary

**Input Parameters:**
- `invoiceId` - Airtable record ID
- `fetchInvoiceFn` - Injected function to fetch invoice (for testability)
- `createRecordsFn` - Injected function to create records
- `updateInvoiceFn` - Optional function to update invoice

**Output:**
```typescript
{
  headerIds: string[],
  detailIds: string[],
  headerCount: number,
  detailCount: number
}
```

### 3. OpenAI Matcher (`openai-matcher.ts`)

**File:** `src/lib/po-matching/openai-matcher.ts`

**Function:** `generatePOMatches(invoiceData, matchPayload)`

**OpenAI Configuration:**
- Model: `gpt-4o-2024-08-06`
- Mode: Structured Outputs (JSON Schema)
- Schema: `POMatchingJSONSchema` (defined in types)
- Temperature: Default (GPT-5 only supports default)
- Strict Mode: `true`

**Matching Rules in Prompt:**
- Match each invoice line to exactly one `matchingReceipts` entry
- Primary key: exact item number equality (`invoice.itemNo == receipt.itemNo`)
- Variations in format (hyphens, spaces) are acceptable
- Item description can be used if item number matching is vague
- Quantities, unit pricing, and total pricing should be close
- Date invoiced should be prior to date received
- Never split one invoice line across multiple receipts
- If any line fails to match, add concise message to `error` field
- Still return matches for other lines if any

**Output Structure:**
```typescript
{
  headers: GPTPOInvoiceHeader[],
  error: string
}
```

### 4. Airtable Creator (`airtable-creator.ts`)

**File:** `src/lib/po-matching/airtable-creator.ts`

**Function:** `createPOInvoiceHeadersAndDetails(headersData, invoiceId, matchPayload, createRecordsFn)`

**Process:**

**For each header:**
1. Build headerFields object
2. Add Invoice link: `{ "Invoice": [invoiceId] }`
3. Add all non-null header fields from GPT
4. Hard-code User-Id to "test-user"
5. Create header record in Airtable
6. Get header ID from response

**For each header's details:**
1. Flatten details array (array of arrays → flat array)
2. For each match object:
   - Link to header: `{ "POInvoiceHeaders": [headerId] }`
   - Add invoice pricing from match object
   - Lookup receipt using `match_object` index
   - Add all receipt fields from `matchingReceipts[match_object]`
   - Add PPV accounts from `matchPayload.vendor`
3. Batch create all detail records
4. Collect detail IDs

**Writable Header Fields:**
```javascript
[
  'Company-Code', 'VendId', 'TermsId', 'TermsDaysInt',
  'APAcct', 'APSub',
  'Freight-Account', 'Freight-Subaccount',
  'Misc-Charge-Account', 'Misc-Charge-Subaccount',
  'PO-Number-Seq-Type', 'PO-Number', 'PO-Vendor',
  'CuryId', 'CuryRate', 'CuryRateType',
  'Job-Project-Number'
]
```

**Note:** `CuryMultDiv` is intentionally omitted

**Detail Fields Mapping:**

| Source | Field | Target Table Field |
|--------|-------|-------------------|
| Match Object | invoice_price | Invoice-Price |
| Match Object | invoice_quantity | Quantity-Invoiced |
| Match Object | invoice_amount | Line-Amount |
| Receipt | itemNo | Item-No |
| Receipt | itemDescription | Item-Description |
| Receipt | step | Step |
| Receipt | poReleaseNumber | PO-Release-Number |
| Receipt | poLineNumber | PO-Line-Number |
| Receipt | vendorShipNumber | Vendor-Ship-Number |
| Receipt | dateReceived | Date-Received |
| Receipt | quantityReceived | Quantity-Received |
| Receipt | quantityAccepted | Quantity-Accepted |
| Receipt | purchasePrice | Purchase-Price |
| Receipt | pricingQuantity | Pricing-Quantity |
| Receipt | expAcct | ExpAcct |
| Receipt | expSub | ExpSub |
| Receipt | standardCost | Standard-Cost |
| Receipt | surcharge | Surcharge |
| Receipt | uom | PO-UOM |
| Vendor | ppvVoucheredAcct | PPV-Vouchered-Acct |
| Vendor | ppvVoucheredSubAcct | PPV-Vouchered-SubAcct |

### 5. Type Definitions (`po-matching.ts`)

**File:** `src/lib/types/po-matching.ts`

**Key Types:**

```typescript
// API Request/Response
export interface POMatchingRequest {
  invoiceId: string;
}

export interface POMatchingResponse {
  success: boolean;
  headers: {
    ids: string[];
    count: number;
  };
  details: {
    ids: string[];
    count: number;
  };
  error?: string;
}

// Match object linking invoice line to PO receipt
export interface GPTMatchObject {
  match_object: number;       // Index into matchingReceipts array
  invoice_price: number;      // Unit price from invoice
  invoice_quantity: number;   // Quantity from invoice
  invoice_amount: number;     // Line total from invoice
}

// Single POInvoiceHeader data from GPT
export interface GPTPOInvoiceHeader {
  'Company-Code'?: string;
  VendId?: string;
  TermsId?: string;
  TermsDaysInt?: number;
  APAcct?: string;
  APSub?: string;
  // ... (see file for complete list)
  
  // Nested details - array of arrays of match objects
  details: GPTMatchObject[][];
}

// Complete GPT response structure
export interface GPTMatchingResponse {
  headers: GPTPOInvoiceHeader[];
  error: string;
}

// Summary of created records
export interface CreatedRecordsSummary {
  headerIds: string[];
  detailIds: string[];
  headerCount: number;
  detailCount: number;
}
```

**JSON Schema for OpenAI:**
- Complete schema definition in `POMatchingJSONSchema`
- Used for OpenAI structured outputs
- Ensures 100% schema adherence
- Prevents hallucinated fields

---

## Airtable Schema Dependencies

### Table Names
```typescript
TABLE_NAMES = {
  INVOICES: "Invoices",
  POINVOICEHEADERS: "POInvoiceHeaders",
  POINVOICEDETAILS: "POInvoiceDetails"
}
```

### Field Names Used

**Invoices Table:**
```typescript
FIELD_NAMES.INVOICES = {
  STATUS: "Status",
  ERRORCODE: "ErrorCode",
  ERROR_DESCRIPTION: "Error-Description",
  VENDID: "VendId",
  MATCH_PAYLOAD_JSON: "MatchPayloadJSON"
}
```

**POInvoiceHeaders Table:**
- See "Writable Header Fields" in Implementation Details section
- All field names use kebab-case format

**POInvoiceDetails Table:**
- See "Detail Fields Mapping" table in Implementation Details section
- All field names use kebab-case format

### Record Relationships

```
Invoices (1) ──→ (Many) POInvoiceHeaders
                            │
                            └──→ (Many) POInvoiceDetails
```

**Linking:**
- POInvoiceHeaders.Invoice → Invoices record
- POInvoiceDetails.POInvoiceHeaders → POInvoiceHeaders record

### Status Values

**Invoice Status:**
- `"Pending"` - Initial state after parsing
- `"Matched"` - At least one PO match found
- `"Error"` - No matches found or processing error

**Invoice ErrorCode:**
- `"NO_MATCH"` - No PO matches found for invoice line items

---

## OpenAI Integration

### Model Configuration
- **Model:** `gpt-4o-2024-08-06`
- **Feature:** Structured Outputs (JSON Schema Mode)
- **Strict Mode:** Enabled
- **Temperature:** Default (GPT-5 constraint)

### Structured Outputs Benefits
1. **100% Schema Adherence** - No hallucinated fields
2. **Type Safety** - Guaranteed field types
3. **Validation** - Built-in schema validation
4. **Refusal Handling** - Detects safety triggers

### Prompt Structure

**System Message:**
```
You are an expert at matching invoices to purchase orders and generating 
structured ERP import data.
```

**User Message:**
```
You match supplier invoices to PO receipt lines. Use only the provided JSON. 
Do not invent data. Output valid JSON matching the exact schema below. 
No extra text.

## INVOICE DATA
{invoiceData as JSON}

## PO MATCH CANDIDATES
{matchPayload as JSON}

# RULES
- Match each invoice line to exactly one matchingReceipts entry
- Primary key: exact item number equality (invoice.itemNo == receipt.itemNo)
- Variations in format (hyphens, spaces) are acceptable
- Item description can be used if item number matching is vague
- Quantities, unit pricing, and total pricing should be close
- Date invoiced should be prior to date received
- Never split one invoice line across multiple receipts
- If any line fails, add concise message to error field
- Still return matches for other lines if any

# Output formatting
- JSON only. No comments. No trailing commas.
- Keep numbers as numbers, not strings.

{schema example}
```

### Response Processing

1. Parse JSON content from `message.content`
2. Validate structure (headers array, error string)
3. Check for refusal
4. Extract headers and error message
5. Pass to Airtable creator

### Error Handling

- API failures throw errors
- Refusals throw errors with refusal message
- Invalid structure throws validation error
- Network errors propagate with details

---

## Error Handling

### Validation Errors (400)

**Missing invoiceId:**
```json
{
  "success": false,
  "error": "Missing or invalid invoiceId"
}
```

**Invalid invoiceId format:**
```json
{
  "success": false,
  "error": "invoiceId must be an Airtable record ID (starts with \"rec\")"
}
```

### Processing Errors (500)

**General error:**
```json
{
  "success": false,
  "headers": { "ids": [], "count": 0 },
  "details": { "ids": [], "count": 0 },
  "error": "Error message"
}
```

### Status Update Logic

**If no matches found:**
```javascript
{
  "Status": "Error",
  "ErrorCode": "NO_MATCH"
}
```

**If matches found (even with partial errors):**
```javascript
{
  "Status": "Matched",
  "Error-Description": "optional error message if present"
}
```

**VendId update:**
```javascript
{
  "VendId": "{matchPayload.vendor.vendorId}"
}
```

### Logging

Console logs use emoji prefixes for easy scanning:
- 🚀 - Process start
- 📥 - Fetching data
- 🔍 - Filtering/processing
- 📦 - Extracting data
- 🤖 - OpenAI operations
- 📝 - Creating records
- ✅ - Success
- ⚠️ - Warning
- ❌ - Error

---

## Testing

### Unit Tests

**File:** `src/lib/po-matching/__tests__/processor.test.ts`

**Coverage:**
- Invoice fetching
- Field filtering
- MatchPayloadJSON parsing
- GPT response processing
- Header creation
- Detail creation
- Error scenarios

### Mock Data

**File:** `src/lib/po-matching/__tests__/mocks.ts`

**Includes:**
- Mock invoice records (normal, minimal, invalid)
- Mock GPT responses
- Mock Airtable responses
- Helper functions for creating mocks

### Manual Test Script

**File:** `test-po-matching.js`

**Run:**
```bash
node test-po-matching.js
```

**Tests:**
- Mock data validation
- Field filtering
- GPT response structure
- Airtable record creation
- API response structure

### Integration Testing

**Test with cURL:**
```bash
curl -X POST http://localhost:3000/api/match-invoice \
  -H "Content-Type: application/json" \
  -d '{"invoiceId":"recXXXXXXXXXXXXXX"}'
```

**Verify in Airtable:**
1. Check POInvoiceHeaders table for new records
2. Check POInvoiceDetails table for new records
3. Verify links: Invoice → Headers → Details
4. Verify formula fields calculate correctly
5. Check Invoice status updated to "Matched"

---

## Environment Variables

### Required

```bash
# OpenAI API
OPENAI_API_KEY=sk-...

# Airtable Configuration
AIRTABLE_PAT=pat...
NEXT_PUBLIC_AIRTABLE_BASE_ID=app...
# OR
AIRTABLE_BASE_ID=app...
```

### Optional (for base URL)

```bash
# For deployed environments
VERCEL_URL=your-app.vercel.app

# For local development
NEXTAUTH_URL=http://localhost:3000
```

### Base URL Logic

```javascript
const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : (process.env.NEXTAUTH_URL || 'http://localhost:3000');
```

---

## Refactoring Checklist

When refactoring for new Airtable schema:

### 1. Schema Updates
- [ ] Update `FIELD_IDS` in `schema-types.ts`
- [ ] Update `FIELD_NAMES` in `schema-types.ts`
- [ ] Update `TABLE_NAMES` if table names changed
- [ ] Verify field name formats (kebab-case vs camelCase)

### 2. Type Updates
- [ ] Review `GPTPOInvoiceHeader` interface
- [ ] Review `GPTMatchObject` interface
- [ ] Update `POMatchingJSONSchema` if fields changed
- [ ] Check for new required/optional fields

### 3. OpenAI Prompt
- [ ] Update field descriptions in prompt
- [ ] Add new fields to schema example
- [ ] Update matching rules if business logic changed
- [ ] Test prompt with sample data

### 4. Airtable Creator
- [ ] Update writable header fields list
- [ ] Update detail fields mapping
- [ ] Add new field mappings
- [ ] Remove deprecated fields

### 5. Testing
- [ ] Update mock data with new schema
- [ ] Run unit tests
- [ ] Run manual test script
- [ ] Test with real Airtable data
- [ ] Verify OpenAI integration
- [ ] Check status updates
- [ ] Verify record linking

### 6. Documentation
- [ ] Update API documentation
- [ ] Update field mapping tables
- [ ] Update example requests/responses
- [ ] Document new error codes

---

## Common Issues & Solutions

### Issue: GPT returns unexpected fields

**Solution:** Check `POMatchingJSONSchema` - structured outputs guarantee schema adherence. If GPT returns unexpected fields, the schema may need updating.

### Issue: Airtable rejects record creation

**Solution:** 
1. Check field names match schema exactly (kebab-case)
2. Verify field types (string vs number)
3. Check for required fields
4. Verify record ID format for links

### Issue: No matches found

**Solution:**
1. Check `MatchPayloadJSON` format
2. Verify `matchingReceipts` array is populated
3. Review matching rules in prompt
4. Check item number formats match
5. Inspect GPT `error` field for details

### Issue: Status not updating

**Solution:**
1. `updateInvoiceFn` is optional - check if it's passed
2. Verify `FIELD_NAMES.INVOICES.STATUS` is correct
3. Check Airtable permissions
4. Review error logs

### Issue: Details not linking to headers

**Solution:**
1. Verify header creation succeeded
2. Check header ID is captured correctly
3. Verify `POInvoiceHeaders` field name in details
4. Check Airtable relationship configuration

---

## Performance Considerations

### Timeouts
- Function timeout: 120 seconds
- Sufficient for most invoices
- Complex matches may take 30-60 seconds

### Rate Limits
- **OpenAI:** Subject to tier-based limits
- **Airtable:** 5 requests per second per base
- Consider retry logic for production

### Batch Operations
- Details created in batches per header
- Reduces API calls
- Improves performance

### Optimization Tips
1. Filter invoice fields before sending to GPT
2. Batch detail creation where possible
3. Use structured outputs (faster than text parsing)
4. Cache Airtable schema if making multiple calls

---

## Contact & Support

For questions about this implementation:
1. Review the inline code comments
2. Check the test files for usage examples
3. Review the existing documentation files:
   - `PO_MATCHING_IMPLEMENTATION.md`
   - `AZURE_FUNCTIONS_API_FLOWS.md`
   - `PO_MATCHING_SCHEMA_UPDATE.md`

---

## Version History

- **v1.0.0** (2025-11-09) - Initial implementation
- **v1.0.1** (Current) - Updated for schema changes

---

## Appendix: Full File Listings

### A. Complete File Paths

```
/Users/thirdoculus/Files/Valsoft/ACOM AIM FE/
├── src/
│   ├── app/api/match-invoice/
│   │   └── route.ts                         [246 lines]
│   └── lib/
│       ├── po-matching/
│       │   ├── processor.ts                 [216 lines]
│       │   ├── openai-matcher.ts            [164 lines]
│       │   ├── airtable-creator.ts          [189 lines]
│       │   └── __tests__/
│       │       ├── processor.test.ts
│       │       └── mocks.ts
│       ├── types/
│       │   └── po-matching.ts               [183 lines]
│       └── airtable/
│           └── schema-types.ts              [800+ lines]
```

### B. Related Documentation Files

```
- AZURE_FUNCTIONS_API_FLOWS.md           [Complete API flow documentation]
- PO_MATCHING_IMPLEMENTATION.md          [Implementation summary]
- PO_MATCHING_SCHEMA_UPDATE.md           [Schema update notes]
- GPT_MATCHING_TEST_COMPLETE.md          [Test results]
```

---

**End of Documentation**

*Generated: November 18, 2025*  
*For: Schema refactoring project*  
*Status: Ready for developer review*







