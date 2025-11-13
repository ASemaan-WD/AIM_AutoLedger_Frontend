# Parser3 API Documentation

## Overview

The `parser3` API route is an invoice parsing service that uses OpenAI's structured output to extract invoice data from raw text and automatically create Invoice records in Airtable.

## Endpoint

```
POST /api/parser3
```

## Purpose

- Parse invoice text using OpenAI's structured output
- Create an Invoice record in Airtable with parsed data
- Link the Invoice to the source File record
- Update the File record status to "Processed"

## Request

### Headers

```
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recordID` | string | Yes | The Airtable File record ID (e.g., `recjU6CziTupqKJeH`) |
| `rawText` | string | Yes | The raw invoice text to parse |

### Example Request

```json
{
  "recordID": "recjU6CziTupqKJeH",
  "rawText": "GLOBAL MANUFACTURING CORP — INV-GLOB-001\n\nINVOICE #: INV-GLOB-001\nDATE: 11/22/2025\n..."
}
```

### cURL Example

```bash
curl -X POST https://your-domain.vercel.app/api/parser3 \
  -H "Content-Type: application/json" \
  -d '{
    "recordID": "recjU6CziTupqKJeH",
    "rawText": "INVOICE #: INV-001\nDATE: 2025-11-22\n..."
  }'
```

### JavaScript/TypeScript Example

```javascript
const response = await fetch('/api/parser3', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    recordID: 'recjU6CziTupqKJeH',
    rawText: invoiceRawText
  })
});

const data = await response.json();
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "fileRecordId": "recjU6CziTupqKJeH",
  "invoiceRecordId": "rec1X6Oc9yRA6PpZb",
  "parsedData": {
    "Invoice-Number": "INV-GLOB-001",
    "Vendor-Name": "GLOBAL MANUFACTURING CORP",
    "Amount": 8025,
    "Date": "2025-11-22",
    "Freight-Charge": 0,
    "Surcharge": 0,
    "Misc-Charge": 0
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "error": "Missing recordID or rawText"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "error": "Failed to parse invoice",
  "details": "Error message details"
}
```

## Parsed Fields

The API extracts the following fields from the invoice text:

| Field | Type | Description | Nullable |
|-------|------|-------------|----------|
| `Invoice-Number` | string | Invoice number identifier | Yes |
| `Vendor-Name` | string | Name of the vendor | Yes |
| `Amount` | number | Total Invoice amount in dollars | Yes |
| `Date` | string | Invoice date (ISO format: YYYY-MM-DD) | Yes |
| `Freight-Charge` | number | Freight charges in dollars | Yes |
| `Surcharge` | number | Additional surcharges in dollars | Yes |
| `Misc-Charge` | number | Miscellaneous charges in dollars | Yes |

**Note:** All fields can be `null` if the information cannot be found in the invoice text.

## What Happens When You Call This API

1. **Parsing**: The raw text is sent to OpenAI with a structured output schema
2. **Invoice Creation**: A new Invoice record is created in Airtable with the parsed data
3. **Linking**: The Invoice is linked to the File record via the `Files` field
4. **Status Update**: The File record's status is updated to "Processed"

## Airtable Integration

### Invoice Record

- Created in the `Invoices` table
- Fields populated from parsed data
- Status set to "Pending" by default
- Linked to the File record via `Files` field

### File Record

- Status updated to "Processed"
- Linked to the created Invoice record via `Invoices` field

## Example Invoice Text

```
GLOBAL MANUFACTURING CORP — INV-GLOB-001

GLOBAL MANUFACTURING CORP
AP DEPARTMENT • TAX ID: TAX-GLOB-002

INVOICE #: INV-GLOB-001
DATE: 11/22/2025
TERMS: 2/10NET30
CURRENCY: USD

GRAND TOTAL: $8,025.00
FREIGHT: 0.00
MISC: 0.00
```

## Testing

### Using the Test Script

A test script is provided at `test-parser3-real.js`:

```bash
node test-parser3-real.js
```

**Note:** Update the `fileRecordId` in the test script with a valid File record ID from your Airtable base.

### Manual Testing

1. Ensure you have a File record in Airtable
2. Get the File record ID (starts with `rec`)
3. Prepare your invoice raw text
4. Make a POST request to `/api/parser3` with the recordID and rawText
5. Check Airtable to verify:
   - New Invoice record was created
   - Invoice is linked to the File record
   - File status is "Processed"

## Error Handling

### Common Errors

1. **Missing Parameters**
   - Ensure both `recordID` and `rawText` are provided
   - Response: 400 Bad Request

2. **Invalid File Record ID**
   - Ensure the `recordID` exists in your Airtable Files table
   - Response: 500 Internal Server Error

3. **OpenAI API Errors**
   - Check that `OPENAI_API_KEY` environment variable is set
   - Response: 500 Internal Server Error

4. **Airtable API Errors**
   - Check that `AIRTABLE_PAT` and `AIRTABLE_BASE_ID` environment variables are set
   - Response: 500 Internal Server Error

## Environment Variables Required

- `OPENAI_API_KEY` - OpenAI API key for structured output parsing
- `AIRTABLE_PAT` - Airtable Personal Access Token
- `AIRTABLE_BASE_ID` or `NEXT_PUBLIC_AIRTABLE_BASE_ID` - Airtable Base ID

## Notes

- The parser uses OpenAI's `gpt-4o-2024-08-06` model with structured output
- Fields that cannot be found will be set to `null` in the parsed data
- The File status update failure will not cause the entire request to fail (logged as warning)
- Date fields should be in ISO format (YYYY-MM-DD)
- Amount fields are stored as numbers (not strings)

## Related Files

- API Route: `src/app/api/parser3/route.ts`
- Test Script: `test-parser3-real.js`
- Schema Types: `src/lib/airtable/schema-types.ts`

