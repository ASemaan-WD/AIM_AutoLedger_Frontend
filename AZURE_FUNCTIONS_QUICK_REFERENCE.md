# Azure Functions Quick Reference

Quick reference guide for the three API routes being converted to Azure Functions .NET.

---

## API Endpoints Summary

| Route | Method | Purpose | Timeout | OpenAI Model |
|-------|--------|---------|---------|--------------|
| `/api/ocr3` | POST | Extract text from PDF using OpenAI | 300s | GPT-5 (Responses API) |
| `/api/parser3` | POST | Parse invoice text and create Invoice record | 60s | GPT-4o (Structured Outputs) |
| `/api/match-invoice` | POST | Match invoice to POs and create header/detail records | 120s | GPT-4o (Structured Outputs) |

---

## 1. OCR3 - PDF Text Extraction

### Input
```json
{
  "recordId": "recXXXXXXXXXXXXXX"
}
```

### Key Steps
1. Fetch File record from Airtable
2. Download PDF from attachment URL
3. Update status to "Processing"
4. Call OpenAI Responses API with PDF URL
5. Extract text from nested response structure
6. Update Raw-Text field (triggers automation)
7. Status remains "Processing"

### Output
```json
{
  "success": true,
  "recordId": "recXXXXXXXXXXXXXX",
  "fileName": "invoice.pdf",
  "textLength": 5432,
  "ocrTimeMs": 12345
}
```

### Critical Details
- **Uses direct Airtable REST API** (not internal wrapper)
- **OpenAI Responses API** requires special response parsing
- Response structure: `output[].content[].text`
- Must handle binary PDF download
- **Does NOT set status to "Processed"** - leaves as "Processing"

### Environment Variables
- `AIRTABLE_BASE_ID` or `NEXT_PUBLIC_AIRTABLE_BASE_ID`
- `AIRTABLE_PAT`
- `OPENAI_API_KEY`

---

## 2. Parser3 - Invoice Text Parsing

### Input
```json
{
  "recordID": "recXXXXXXXXXXXXXX",
  "rawText": "INVOICE #: INV-001\n..."
}
```

### Key Steps
1. Call OpenAI Chat Completions with structured output
2. Parse invoice into schema-compliant JSON
3. Create Invoice record in Airtable
4. Link Invoice to File record
5. Update File status to "Processed"

### Output
```json
{
  "success": true,
  "fileRecordId": "recXXXXXXXXXXXXXX",
  "invoiceRecordId": "recYYYYYYYYYYYYYY",
  "parsedData": {
    "Invoice-Number": "INV-001",
    "Vendor-Name": "Acme Corp",
    "Amount": 1500.00,
    "Date": "2025-11-22",
    "Freight-Charge": 0,
    "Surcharge": 0,
    "Misc-Charge": 0
  }
}
```

### Invoice Schema
```typescript
{
  "Invoice-Number": string | null,
  "Vendor-Name": string | null,
  "Amount": number | null,
  "Date": string | null,  // ISO format
  "Freight-Charge": number | null,
  "Surcharge": number | null,
  "Misc-Charge": number | null
}
```

### Critical Details
- **Only route that sets File status to "Processed"**
- Uses **internal Airtable API wrapper** (`/api/airtable/*`)
- OpenAI structured outputs guarantee schema adherence
- Only adds non-null fields to Airtable
- Sets Invoice status to "Pending" by default
- Typically triggered by Airtable automation (when Raw-Text updates)

### Environment Variables
- `OPENAI_API_KEY`
- `AIRTABLE_BASE_ID` or `NEXT_PUBLIC_AIRTABLE_BASE_ID`
- `VERCEL_URL` or `NEXTAUTH_URL` (for base URL)

---

## 3. Match-Invoice - PO Matching

### Input
```json
{
  "invoiceId": "recXXXXXXXXXXXXXX"
}
```

### Key Steps
1. Fetch Invoice record from Airtable
2. Filter out null/empty fields
3. Extract and parse MatchPayloadJSON
4. Call OpenAI to generate PO matches
5. Create POInvoiceHeader record(s)
6. Create POInvoiceDetail record(s) linked to headers
7. Update Invoice status and VendId

### Output
```json
{
  "success": true,
  "headers": {
    "ids": ["recHEADER1"],
    "count": 1
  },
  "details": {
    "ids": ["recDETAIL1", "recDETAIL2"],
    "count": 2
  }
}
```

### Status Logic
- **If any matches found**: Status = "Matched"
- **If no matches found**: Status = "Error", ErrorCode = "NO_MATCH"
- **If GPT returns error message**: Add to Error-Description field
- **VendId**: Populated from matchPayload.vendor.vendorId

### Match Object Structure
```typescript
{
  "match_object": 0,  // Index into matchingReceipts array
  "invoice_price": 10.00,
  "invoice_quantity": 100,
  "invoice_amount": 1000.00
}
```

### Critical Details
- Uses **internal Airtable API wrapper**
- Complex nested structure: headers contain arrays of arrays of match objects
- `match_object` is an **index**, not an ID - use to lookup receipt data
- Creates records in order: Headers first, then Details (linked to headers)
- Updates Invoice with Status, VendId, ErrorCode, Error-Description
- PPV fields come from matchPayload.vendor
- User-Id is hard-coded to "test-user"
- CuryMultDiv is intentionally omitted

### Environment Variables
- `OPENAI_API_KEY`
- `AIRTABLE_BASE_ID` or `NEXT_PUBLIC_AIRTABLE_BASE_ID`
- `VERCEL_URL` or `NEXTAUTH_URL` (for base URL)
- `AIRTABLE_PAT`

---

## OpenAI API Differences

### Responses API (OCR3)
```javascript
URL: https://api.openai.com/v1/responses
Model: gpt-5
Input: Array of message objects with file_url
Output: Nested structure with reasoning + message
```

### Chat Completions API (Parser3 & Match-Invoice)
```javascript
URL: https://api.openai.com/v1/chat/completions
Model: gpt-4o-2024-08-06
Messages: System + User messages
Response Format: json_schema with strict mode
Output: JSON string in message.content
```

---

## Airtable API Patterns

### Direct REST API (OCR3 only)
```javascript
GET/PATCH: https://api.airtable.com/v0/{BASE_ID}/{TABLE}/{RECORD_ID}
Headers:
  Authorization: Bearer {AIRTABLE_PAT}
  Content-Type: application/json
```

### Internal Wrapper (Parser3 & Match-Invoice)
```javascript
GET: {baseUrl}/api/airtable/{TABLE}/{RECORD_ID}?baseId={BASE_ID}
POST: {baseUrl}/api/airtable/{TABLE}?baseId={BASE_ID}
PATCH: {baseUrl}/api/airtable/{TABLE}?baseId={BASE_ID}
Body: { records: [{ id, fields }] } or { fields }
```

**For .NET**: Replace internal wrapper with direct Airtable REST API calls

---

## Record Relationships

```
Files (1:1) → Invoices (1:many) → POInvoiceHeaders (1:many) → POInvoiceDetails
```

### Field Relationships
```
Files.Attachments[0].url → used by OCR3
Files.Raw-Text → populated by OCR3, used by Parser3
Files.Status → "Processing" (OCR3) → "Processed" (Parser3)

Invoices.Files → links back to Files record
Invoices.Status → "Pending" (Parser3) → "Matched" or "Error" (Match-Invoice)
Invoices.MatchPayloadJSON → used by Match-Invoice

POInvoiceHeaders.Invoice → links to Invoices record

POInvoiceDetails.POInvoiceHeaders → links to POInvoiceHeaders record
```

---

## Status Workflow

```
Files Table:
┌─────────────┐
│  (empty)    │  ← Initial state
└──────┬──────┘
       │ OCR3 starts
       ▼
┌─────────────┐
│ Processing  │  ← OCR3 sets this, leaves it as-is
└──────┬──────┘
       │ Parser3 triggered by automation
       ▼
┌─────────────┐
│ Processed   │  ← Parser3 ONLY route that sets this
└─────────────┘

Invoices Table:
┌─────────────┐
│  Pending    │  ← Parser3 creates with this status
└──────┬──────┘
       │ Match-Invoice called
       ▼
┌─────────────┐        ┌─────────────┐
│  Matched    │   OR   │   Error     │
│             │        │ (NO_MATCH)  │
└─────────────┘        └─────────────┘
```

---

## Error Codes

| Code | Used By | Meaning |
|------|---------|---------|
| `NO_MATCH` | Match-Invoice | No PO matches found for invoice |
| `OCR_FAILED` | OCR3 (upload route) | OCR process failed |
| `PDF_CORRUPTED` | OCR3 (upload route) | PDF file is corrupted |
| `PROCESSING_ERROR` | OCR3 (upload route) | General processing error |
| `TIMEOUT_ERROR` | OCR3 (upload route) | Request timeout |

---

## Key Differences for .NET

### 1. API Wrapper Replacement
Replace internal `/api/airtable/*` calls with direct Airtable REST API:

```csharp
// Instead of: POST {baseUrl}/api/airtable/Invoices?baseId={BASE_ID}
// Use: POST https://api.airtable.com/v0/{BASE_ID}/Invoices
// With: Authorization: Bearer {AIRTABLE_PAT}
```

### 2. Base URL Handling
No need for VERCEL_URL/NEXTAUTH_URL - use Azure Function base URL:

```csharp
string baseUrl = Environment.GetEnvironmentVariable("AZURE_FUNCTIONS_BASE_URL");
```

### 3. Request ID Generation
Replace JavaScript random string with C# equivalent:

```csharp
string requestId = Guid.NewGuid().ToString("N").Substring(0, 7);
```

### 4. Binary Data Handling
Use proper binary streams for PDF downloads:

```csharp
using var stream = await httpClient.GetStreamAsync(attachmentUrl);
using var memoryStream = new MemoryStream();
await stream.CopyToAsync(memoryStream);
byte[] pdfBytes = memoryStream.ToArray();
```

### 5. JSON Schema Definition
Define OpenAI schemas as C# classes with proper serialization:

```csharp
public class InvoiceSchema
{
    [JsonPropertyName("Invoice-Number")]
    public string? InvoiceNumber { get; set; }
    
    [JsonPropertyName("Vendor-Name")]
    public string? VendorName { get; set; }
    
    // ... etc
}
```

### 6. Timeout Configuration
Set in function.json or host.json:

```json
{
  "functionTimeout": "00:05:00"  // 5 minutes for OCR3
}
```

---

## Testing Quick Commands

### Test OCR3
```bash
curl -X POST https://your-function.azurewebsites.net/api/ocr3 \
  -H "Content-Type: application/json" \
  -d '{"recordId": "recXXXXXXXXXXXXXX"}'
```

### Test Parser3
```bash
curl -X POST https://your-function.azurewebsites.net/api/parser3 \
  -H "Content-Type: application/json" \
  -d '{
    "recordID": "recXXXXXXXXXXXXXX",
    "rawText": "INVOICE #: INV-001..."
  }'
```

### Test Match-Invoice
```bash
curl -X POST https://your-function.azurewebsites.net/api/match-invoice \
  -H "Content-Type: application/json" \
  -d '{"invoiceId": "recXXXXXXXXXXXXXX"}'
```

### Health Check
```bash
curl https://your-function.azurewebsites.net/api/match-invoice
```

---

## Common Pitfalls

1. **OCR3**: Don't set status to "Processed" - leave as "Processing"
2. **Parser3**: Must be triggered by Airtable automation in production
3. **Match-Invoice**: match_object is an array index, not a record ID
4. **All**: Only add non-null/non-empty fields to Airtable
5. **All**: Extensive logging is critical for debugging
6. **Match-Invoice**: Status is "Matched" even if there are errors (as long as some matches exist)
7. **Parser3**: Links to File record via "Files" field (array of record IDs)
8. **Match-Invoice**: Creates headers first, then details (must link details to headers)

---

## Performance Considerations

### OCR3
- Large PDFs (>10MB) can take 60+ seconds
- OpenAI Responses API is slower than Chat Completions
- Network latency for PDF download adds time

### Parser3
- Usually completes in 2-5 seconds
- Text parsing is fast with structured outputs
- Airtable record creation is typically quick

### Match-Invoice
- Can take 10-30 seconds depending on complexity
- Multiple Airtable writes (headers, details, invoice update)
- OpenAI matching logic is compute-intensive
- Large matchingReceipts arrays increase processing time

---

## Retry Logic Recommendations

### OpenAI Calls
- Retry on 500/502/503 errors
- Exponential backoff: 1s, 2s, 4s, 8s
- Max retries: 3

### Airtable Calls
- Retry on 429 (rate limit) errors
- Retry on 500+ errors
- Exponential backoff: 1s, 2s, 4s
- Max retries: 3

### PDF Downloads
- Retry on network errors
- Retry on timeout
- Max retries: 2

---

This quick reference should help during implementation. Refer to the main documentation (AZURE_FUNCTIONS_API_FLOWS.md) for complete details.
















