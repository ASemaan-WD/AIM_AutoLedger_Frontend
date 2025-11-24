# API Routes Flow Documentation for Azure Functions .NET Conversion

This document provides detailed flow documentation for three Next.js API routes that need to be converted to Azure Functions in .NET.

---

## Table of Contents

1. [OCR3 API Route](#1-ocr3-api-route)
2. [Parser3 API Route](#2-parser3-api-route)
3. [Match-Invoice API Route](#3-match-invoice-api-route)
4. [Environment Variables](#4-environment-variables)
5. [Data Flow Diagram](#5-data-flow-diagram)

---

## 1. OCR3 API Route

**Purpose**: Extract text from PDF invoices using OpenAI's native PDF processing (Responses API).

**Current Path**: `POST /api/ocr3`

**Timeout**: 300 seconds (5 minutes)

### Request

**Method**: POST

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "recordId": "recXXXXXXXXXXXXXX"
}
```

**Validation**:
- `recordId` must be present
- `recordId` must start with "rec" (Airtable record ID format)

### Processing Flow

#### Step 1: Validate Input
```
- Check recordId exists and starts with "rec"
- Return 400 if invalid
```

#### Step 2: Wait for Airtable Propagation
```
- Wait 2 seconds to allow Airtable record to fully propagate
- This prevents race conditions with record creation
```

#### Step 3: Fetch File Record from Airtable
```
URL: https://api.airtable.com/v0/{BASE_ID}/Files/{recordId}
Method: GET
Headers:
  - Authorization: Bearer {AIRTABLE_TOKEN}
  - Content-Type: application/json

Response Structure:
{
  "id": "recXXXXXXXXXXXXXX",
  "fields": {
    "Attachments": [
      {
        "id": "attXXXXXXXXXXXXXX",
        "url": "https://...",
        "filename": "invoice.pdf",
        "size": 123456,
        "type": "application/pdf"
      }
    ],
    ...other fields...
  }
}

Error Handling:
- If response is not OK (status >= 400), return error with status code
- If no attachments found, return 400 error
```

#### Step 4: Validate PDF
```
- Check if attachment type is "application/pdf"
- OR check if filename ends with ".pdf"
- Return 400 if not a PDF
```

#### Step 5: Download PDF Attachment
```
URL: {attachment.url} (from Airtable response)
Method: GET

Response: Binary PDF data (ArrayBuffer)

Error Handling:
- If download fails, return 500 error
```

#### Step 6: Update Status to "Processing"
```
URL: https://api.airtable.com/v0/{BASE_ID}/Files/{recordId}
Method: PATCH
Headers:
  - Authorization: Bearer {AIRTABLE_TOKEN}
  - Content-Type: application/json
Body:
{
  "fields": {
    "Status": "Processing"
  }
}

Note: This is not critical - log warning if fails but continue
```

#### Step 7: Call OpenAI Responses API for OCR
```
URL: https://api.openai.com/v1/responses
Method: POST
Headers:
  - Content-Type: application/json
  - Authorization: Bearer {OPENAI_API_KEY}
Body:
{
  "model": "gpt-5",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Extract all text from this PDF document. Return only the raw text content in reading order, with no additional commentary or formatting."
        },
        {
          "type": "input_file",
          "file_url": "{attachment.url}"
        }
      ]
    }
  ]
}

Response Structure:
{
  "output": [
    {
      "type": "reasoning",
      ...
    },
    {
      "type": "message",
      "content": [
        {
          "type": "output_text",
          "text": "...extracted text content..."
        }
      ]
    }
  ]
}

Parsing Logic:
- Find the output with type "message"
- Find the content with type "output_text"
- Extract the "text" field

Error Handling:
- If API returns error status, return 500 with error details
- Parse error response as JSON if possible
```

#### Step 8: Update Airtable with Extracted Text
```
URL: https://api.airtable.com/v0/{BASE_ID}/Files/{recordId}
Method: PATCH
Headers:
  - Authorization: Bearer {AIRTABLE_TOKEN}
  - Content-Type: application/json
Body:
{
  "fields": {
    "Raw-Text": "{extractedText}"
  }
}

IMPORTANT: Status remains "Processing" - NOT changed to "Processed"
This triggers an Airtable automation that calls parser3

Error Handling:
- If update fails, return 500 with error and the extracted text
```

#### Step 9: Return Success Response
```json
{
  "success": true,
  "recordId": "recXXXXXXXXXXXXXX",
  "fileName": "invoice.pdf",
  "fileType": "application/pdf",
  "fileSize": 123456,
  "textLength": 5432,
  "ocrTimeMs": 12345,
  "message": "OCR completed and record updated successfully"
}
```

### Error Responses

**400 Bad Request**:
```json
{
  "error": "Invalid record ID"
}
```

**400 Bad Request** (No attachments):
```json
{
  "error": "No attachments found in record"
}
```

**400 Bad Request** (Not a PDF):
```json
{
  "error": "Only PDF files are supported"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to download attachment"
}
```

**500 Internal Server Error** (OpenAI error):
```json
{
  "error": "OpenAI API error: 500",
  "details": { ...error details... }
}
```

**500 Internal Server Error** (Airtable update failed):
```json
{
  "error": "OCR succeeded but failed to update record: 500",
  "airtableError": { ...error details... },
  "extractedText": "...",
  "textLength": 1234
}
```

### Dependencies

**External APIs**:
- Airtable API v0 (REST)
- OpenAI Responses API (GPT-5)

**Environment Variables**:
- `NEXT_PUBLIC_AIRTABLE_BASE_ID` or `AIRTABLE_BASE_ID`
- `AIRTABLE_PAT` (Personal Access Token)
- `OPENAI_API_KEY`

### Notes for .NET Conversion

1. **Async Operations**: All HTTP calls should be async
2. **Request ID**: Generate a unique request ID for logging (currently uses `Math.random().toString(36).substring(7)`)
3. **Timeout**: Function timeout should be 300 seconds (5 minutes)
4. **Binary Handling**: Need to handle PDF download as binary data
5. **JSON Parsing**: OpenAI response has nested structure requiring careful parsing
6. **Error Handling**: Multiple failure points - should log extensively

---

## 2. Parser3 API Route

**Purpose**: Parse raw invoice text using OpenAI structured outputs and create an Invoice record in Airtable.

**Current Path**: `POST /api/parser3`

**Timeout**: Default (no explicit timeout set)

### Request

**Method**: POST

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "recordID": "recXXXXXXXXXXXXXX",
  "rawText": "INVOICE #: INV-001\nDATE: 2025-11-22\nVENDOR: Acme Corp\n..."
}
```

**Validation**:
- `recordID` must be present
- `rawText` must be present

### Processing Flow

#### Step 1: Validate Input
```
- Check recordID exists
- Check rawText exists
- Return 400 if either is missing
```

#### Step 2: Call OpenAI with Structured Output
```
URL: https://api.openai.com/v1/chat/completions
Method: POST
Headers:
  - Content-Type: application/json
  - Authorization: Bearer {OPENAI_API_KEY}
Body:
{
  "model": "gpt-4o-2024-08-06",
  "messages": [
    {
      "role": "user",
      "content": "This is an invoice. Please parse this according to the JSON schema, respond in JSON:\n\n{rawText}"
    }
  ],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "invoice_parser",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "Invoice-Number": {
            "type": ["string", "null"],
            "description": "Invoice number identifier"
          },
          "Vendor-Name": {
            "type": ["string", "null"],
            "description": "Name of the vendor"
          },
          "Amount": {
            "type": ["number", "null"],
            "description": "Total Invoice amount in dollars"
          },
          "Date": {
            "type": ["string", "null"],
            "description": "Invoice date in ISO format"
          },
          "Freight-Charge": {
            "type": ["number", "null"],
            "description": "Freight charges in dollars"
          },
          "Surcharge": {
            "type": ["number", "null"],
            "description": "Additional surcharges in dollars"
          },
          "Misc-Charge": {
            "type": ["number", "null"],
            "description": "Miscellaneous charges in dollars"
          }
        },
        "required": [
          "Invoice-Number",
          "Vendor-Name",
          "Amount",
          "Date",
          "Freight-Charge",
          "Surcharge",
          "Misc-Charge"
        ],
        "additionalProperties": false
      }
    }
  }
}

Response Structure:
{
  "choices": [
    {
      "message": {
        "content": "{\"Invoice-Number\": \"INV-001\", ...}"
      }
    }
  ]
}

Parsing Logic:
- Extract completion.choices[0].message.content
- Parse as JSON
```

#### Step 3: Build Invoice Fields
```
Initialize invoiceFields object:
{
  "Files": [recordID],  // Link to File record
  "Status": "Pending"   // Default status
}

Add parsed fields if non-null:
- If Invoice-Number exists, add to invoiceFields
- If Vendor-Name exists, add to invoiceFields
- If Amount !== null && Amount !== undefined, add to invoiceFields
- If Date exists, add to invoiceFields
- If Freight-Charge !== null && Freight-Charge !== undefined, add to invoiceFields
- If Surcharge !== null && Surcharge !== undefined, add to invoiceFields
- If Misc-Charge !== null && Misc-Charge !== undefined, add to invoiceFields

Note: Only add fields with actual values (not null/undefined/empty)
```

#### Step 4: Create Invoice Record in Airtable
```
Determine Base URL:
- If VERCEL_URL exists: https://{VERCEL_URL}
- Else if NEXTAUTH_URL exists: {NEXTAUTH_URL}
- Else: http://localhost:3000

URL: {baseUrl}/api/airtable/Invoices?baseId={BASE_ID}
Method: POST
Headers:
  - Content-Type: application/json
Body:
{
  "fields": {
    "Files": ["recXXXXXXXXXXXXXX"],
    "Invoice-Number": "INV-001",
    "Vendor-Name": "Acme Corp",
    "Amount": 1500.00,
    "Date": "2025-11-22",
    "Freight-Charge": 0,
    "Surcharge": 0,
    "Misc-Charge": 0,
    "Status": "Pending"
  }
}

Response Structure:
{
  "records": [
    {
      "id": "recYYYYYYYYYYYYYY"
    }
  ]
}
OR
{
  "id": "recYYYYYYYYYYYYYY"
}

Extract Invoice Record ID:
- Try invoiceData.records[0].id first
- Fallback to invoiceData.id

Error Handling:
- If response not OK, throw error with status and error text
```

#### Step 5: Update File Record Status to "Processed"
```
URL: {baseUrl}/api/airtable/Files?baseId={BASE_ID}
Method: PATCH
Headers:
  - Content-Type: application/json
Body:
{
  "records": [
    {
      "id": "recXXXXXXXXXXXXXX",
      "fields": {
        "Status": "Processed"
      }
    }
  ]
}

Note: This step marks the end of the OCR/parsing workflow
parser3 is the ONLY route that sets status to "Processed"

Error Handling:
- If update fails, log warning but DO NOT fail the request
- The invoice has been created successfully at this point
```

#### Step 6: Return Success Response
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

### Error Responses

**400 Bad Request**:
```json
{
  "error": "Missing recordID or rawText"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to parse invoice",
  "details": "error message"
}
```

### Dependencies

**External APIs**:
- OpenAI Chat Completions API (GPT-4o)
- Internal Airtable wrapper API (`/api/airtable/*`)

**Environment Variables**:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_AIRTABLE_BASE_ID` or `AIRTABLE_BASE_ID`
- `VERCEL_URL` or `NEXTAUTH_URL` (for base URL)

### Important Schema Constants

```typescript
TABLE_NAMES = {
  FILES: "Files",
  INVOICES: "Invoices"
}

FILE_STATUS = {
  PROCESSED: "Processed"
}
```

### Notes for .NET Conversion

1. **Structured Outputs**: OpenAI's structured outputs feature ensures JSON schema compliance
2. **Field Filtering**: Only non-null values are added to Airtable
3. **Status Transition**: This is the ONLY route that sets File status to "Processed"
4. **Separation of Concerns**: parser3 doesn't do OCR - it only parses pre-extracted text
5. **Airtable Automation**: In production, this route is triggered by Airtable automation when Raw-Text field is updated
6. **Error Handling**: Should be lenient on File status update failure (invoice creation is more critical)

---

## 3. Match-Invoice API Route

**Purpose**: Match invoice line items to purchase order receipts using OpenAI, then create POInvoiceHeader and POInvoiceDetail records in Airtable.

**Current Path**: `POST /api/match-invoice`

**Timeout**: 120 seconds (2 minutes)

### Request

**Method**: POST

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "invoiceId": "recXXXXXXXXXXXXXX"
}
```

**Validation**:
- `invoiceId` must be present and a string
- `invoiceId` must start with "rec" (Airtable record ID format)

### Processing Flow

#### Step 1: Validate Input
```
- Check invoiceId exists and is a string
- Check invoiceId starts with "rec"
- Return 400 if invalid
```

#### Step 2: Fetch Invoice Record from Airtable
```
Determine Base URL:
- If VERCEL_URL exists: https://{VERCEL_URL}
- Else if NEXTAUTH_URL exists: {NEXTAUTH_URL}
- Else: http://localhost:3000

URL: {baseUrl}/api/airtable/Invoices/{invoiceId}?baseId={BASE_ID}
Method: GET
Headers:
  - Content-Type: application/json

Response Structure:
{
  "id": "recXXXXXXXXXXXXXX",
  "fields": {
    "Invoice-Number": "INV-001",
    "Vendor-Name": "Acme Corp",
    "Amount": 1500.00,
    "MatchPayloadJSON": "{...JSON string...}",
    ...other fields...
  }
}

Error Handling:
- If response not OK, throw error with status and error text
- If record not found or has no fields, throw error
```

#### Step 3: Filter Non-Null Fields
```
Create nonNullFields object:
- Iterate over all invoice fields
- Only include fields where value !== null && value !== undefined && value !== ''

Example:
{
  "Invoice-Number": "INV-001",
  "Vendor-Name": "Acme Corp",
  "Amount": 1500.00,
  "Date": "2025-11-22",
  "MatchPayloadJSON": "{...}"
}
```

#### Step 4: Extract and Parse MatchPayloadJSON
```
Extract field:
- Try nonNullFields["MatchPayloadJSON"]
- Or try nonNullFields["Match-Payload-JSON"]

Parse:
- If string: JSON.parse(matchPayloadRaw)
- If already object: use as-is
- If missing or parse fails: use empty object {}

Remove from nonNullFields:
- Delete nonNullFields["MatchPayloadJSON"]
- Delete nonNullFields["Match-Payload-JSON"]

MatchPayload Structure:
{
  "vendor": {
    "vendorId": "VEND001",
    "ppvVoucheredAcct": "5000",
    "ppvVoucheredSubAcct": "100"
  },
  "matchingReceipts": [
    {
      "itemNo": "ITEM-001",
      "itemDescription": "Widget A",
      "step": "1",
      "poReleaseNumber": "001",
      "poLineNumber": "00010",
      "vendorShipNumber": "SHIP-123",
      "dateReceived": "2025-11-20",
      "quantityReceived": 100,
      "quantityAccepted": 100,
      "purchasePrice": 10.00,
      "pricingQuantity": 1,
      "expAcct": "6000",
      "expSub": "200",
      "standardCost": 9.50,
      "surcharge": 0,
      "uom": "EA"
    },
    ...more receipts...
  ]
}
```

#### Step 5: Call OpenAI to Generate PO Matches
```
URL: https://api.openai.com/v1/chat/completions
Method: POST
Headers:
  - Content-Type: application/json
  - Authorization: Bearer {OPENAI_API_KEY}
Body:
{
  "model": "gpt-4o-2024-08-06",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert at matching invoices to purchase orders and generating structured ERP import data."
    },
    {
      "role": "user",
      "content": "{prompt}" // See detailed prompt below
    }
  ],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "POMatchingResponse",
      "schema": {
        "type": "object",
        "properties": {
          "headers": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "Company-Code": { "type": "string" },
                "VendId": { "type": "string" },
                "TermsId": { "type": "string" },
                "TermsDaysInt": { "type": "integer" },
                "APAcct": { "type": "string" },
                "APSub": { "type": "string" },
                "Freight-Account": { "type": "string" },
                "Freight-Subaccount": { "type": "string" },
                "Misc-Charge-Account": { "type": "string" },
                "Misc-Charge-Subaccount": { "type": "string" },
                "PO-Number-Seq-Type": { "type": "string" },
                "PO-Number": { "type": "string" },
                "PO-Vendor": { "type": "string" },
                "CuryId": { "type": "string" },
                "CuryRate": { "type": "number" },
                "CuryRateType": { "type": "string" },
                "User-Id": { "type": "string" },
                "Job-Project-Number": { "type": "string" },
                "details": {
                  "type": "array",
                  "items": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "match_object": { "type": "integer" },
                        "invoice_price": { "type": "number" },
                        "invoice_quantity": { "type": "number" },
                        "invoice_amount": { "type": "number" }
                      },
                      "required": ["match_object", "invoice_price", "invoice_quantity", "invoice_amount"]
                    }
                  }
                }
              },
              "required": ["details"]
            }
          },
          "error": { "type": "string" }
        },
        "required": ["headers", "error"]
      },
      "strict": true
    }
  }
}

Prompt Template:
"""
You match supplier invoices to PO receipt lines. Use only the provided JSON. Do not invent data. Output valid JSON matching the exact schema below. No extra text.

## INVOICE DATA
{invoiceData as JSON}

## PO MATCH CANDIDATES
{matchPayload as JSON}

# RULES
- Match each invoice line to exactly one `matchingReceipts` entry.
- Primary key: exact item number equality (`invoice.itemNo == receipt.itemNo`). Some variations in format (i.e. hyphens and spaces are fine, but the item number should be the same)
- Item description can also be used for matching if item number matching is vague.
- Quantities, unit pricing, and total pricings should be close
- Matches should ensure that date invoiced (on invoice) should be prior to date received (on PO receipt)
- Never split one invoice line across multiple receipts.
- If any invoice line fails item match, add a concise message to `error`. Still return matches for other lines if any. If no matches, return an empty header.

# Output formatting
- JSON only. No comments. No trailing commas. Keep numbers as numbers, not strings.

Using the provided invoice and PO data, identify which PO(s) the invoice relates to and produce a JSON structure in this format:
{schema example}
"""

Response Structure:
{
  "choices": [
    {
      "message": {
        "content": "{\"headers\": [...], \"error\": \"...\"}"
      }
    }
  ]
}

Parsed Response Structure:
{
  "headers": [
    {
      "Company-Code": "001",
      "VendId": "VEND001",
      "TermsId": "NET30",
      "TermsDaysInt": 30,
      "APAcct": "2000",
      "APSub": "100",
      "PO-Number": "PO-12345",
      "PO-Vendor": "Acme Corp",
      "CuryId": "USD",
      "CuryRate": 1.0,
      "CuryRateType": "FIXED",
      "details": [
        [
          {
            "match_object": 0,
            "invoice_price": 10.00,
            "invoice_quantity": 100,
            "invoice_amount": 1000.00
          }
        ],
        [
          {
            "match_object": 1,
            "invoice_price": 5.00,
            "invoice_quantity": 100,
            "invoice_amount": 500.00
          }
        ]
      ]
    }
  ],
  "error": ""
}

Validation:
- Check headers is an array
- Check error is a string
- If refusal field present, throw error

Error Handling:
- If API call fails, throw error
- If response has refusal, throw error
- If response structure invalid, throw error
```

#### Step 6: Create POInvoiceHeader Records
```
For each header in headers array:

Build headerFields object:
{
  "Invoice": [invoiceId],  // Link to Invoice record
  "User-Id": "test-user"   // Hard-coded for now
}

Add all non-null header fields:
- Company-Code
- VendId
- TermsId
- TermsDaysInt
- APAcct, APSub
- Freight-Account, Freight-Subaccount
- Misc-Charge-Account, Misc-Charge-Subaccount
- PO-Number-Seq-Type, PO-Number, PO-Vendor
- CuryId, CuryRate, CuryRateType
- Job-Project-Number

Note: CuryMultDiv is intentionally omitted

Create header record:
URL: {baseUrl}/api/airtable/POInvoiceHeaders?baseId={BASE_ID}
Method: POST
Headers:
  - Content-Type: application/json
Body:
{
  "records": [
    {
      "fields": {
        "Invoice": ["recXXXXXXXXXXXXXX"],
        "Company-Code": "001",
        "VendId": "VEND001",
        ...
      }
    }
  ]
}

Response:
{
  "records": [
    {
      "id": "recHEADER1"
    }
  ]
}

Store headerId for linking to details
```

#### Step 7: Create POInvoiceDetail Records (for each header)
```
For each header:
  Flatten details array (array of arrays) into single array of match objects
  
  For each match object:
    Build detailFields object:
    {
      "POInvoiceHeaders": [headerId]  // Link to header just created
    }
    
    Get receipt from matchingReceipts using match_object index:
    receipt = matchingReceipts[match_object]
    
    Add invoice pricing fields (from match object):
    - Invoice-Price: match_object.invoice_price
    - Quantity-Invoiced: match_object.invoice_quantity
    - Line-Amount: match_object.invoice_amount
    
    Add PO receipt fields (from matchingReceipts[index]):
    - Item-No: receipt.itemNo
    - Item-Description: receipt.itemDescription
    - Step: receipt.step
    - PO-Release-Number: receipt.poReleaseNumber
    - PO-Line-Number: receipt.poLineNumber
    - Vendor-Ship-Number: receipt.vendorShipNumber
    - Date-Received: receipt.dateReceived
    - Quantity-Received: receipt.quantityReceived
    - Quantity-Accepted: receipt.quantityAccepted
    - Purchase-Price: receipt.purchasePrice
    - Pricing-Quantity: receipt.pricingQuantity
    - ExpAcct: receipt.expAcct
    - ExpSub: receipt.expSub
    - Standard-Cost: receipt.standardCost
    - Surcharge: receipt.surcharge
    - PO-UOM: receipt.uom
    
    Add PPV fields (from matchPayload.vendor):
    - PPV-Vouchered-Acct: matchPayload.vendor.ppvVoucheredAcct
    - PPV-Vouchered-SubAcct: matchPayload.vendor.ppvVoucheredSubAcct
  
  Create all detail records for this header:
  URL: {baseUrl}/api/airtable/POInvoiceDetails?baseId={BASE_ID}
  Method: POST
  Headers:
    - Content-Type: application/json
  Body:
  {
    "records": [
      {
        "fields": {
          "POInvoiceHeaders": ["recHEADER1"],
          "Item-No": "ITEM-001",
          "Invoice-Price": 10.00,
          "Quantity-Invoiced": 100,
          ...
        }
      },
      ...more detail records...
    ]
  }
  
  Response:
  {
    "records": [
      { "id": "recDETAIL1" },
      { "id": "recDETAIL2" },
      ...
    ]
  }
  
  Collect all detail IDs
```

#### Step 8: Update Invoice Record Status
```
Determine Status:
- If detailIds.length > 0: Status = "Matched" (at least one match found)
- If detailIds.length === 0: Status = "Error" (no matches found)

Build update fields:
{
  "Status": "Matched" or "Error"
}

If no matches (detailIds.length === 0):
  Add ErrorCode field:
  {
    "Status": "Error",
    "ErrorCode": "NO_MATCH"
  }

If error message exists and is not empty:
  Add Error-Description field:
  {
    "Error-Description": "{error message from GPT}"
  }

If vendor.vendorId exists in matchPayload:
  Add VendId field:
  {
    "VendId": "{vendor.vendorId}"
  }

Update Invoice:
URL: {baseUrl}/api/airtable/Invoices?baseId={BASE_ID}
Method: PATCH
Headers:
  - Content-Type: application/json
Body:
{
  "records": [
    {
      "id": "recXXXXXXXXXXXXXX",
      "fields": {
        "Status": "Matched",
        "VendId": "VEND001",
        "Error-Description": "..."
      }
    }
  ]
}

Note: This step is not critical - log warning if fails but don't throw error
```

#### Step 9: Return Success Response
```json
{
  "success": true,
  "headers": {
    "ids": ["recHEADER1", "recHEADER2"],
    "count": 2
  },
  "details": {
    "ids": ["recDETAIL1", "recDETAIL2", "recDETAIL3"],
    "count": 3
  }
}
```

### Error Responses

**400 Bad Request** (Missing invoiceId):
```json
{
  "success": false,
  "error": "Missing or invalid invoiceId"
}
```

**400 Bad Request** (Invalid invoiceId format):
```json
{
  "success": false,
  "error": "invoiceId must be an Airtable record ID (starts with \"rec\")"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "headers": { "ids": [], "count": 0 },
  "details": { "ids": [], "count": 0 },
  "error": "error message"
}
```

### GET Endpoint (Health Check)

**Method**: GET

**Response**:
```json
{
  "name": "PO Matching API",
  "version": "1.0.0",
  "description": "Generates and creates POInvoiceHeaders and POInvoiceDetails using OpenAI",
  "usage": {
    "method": "POST",
    "body": {
      "invoiceId": "string (required) - Airtable record ID of invoice"
    },
    "example": {
      "invoiceId": "recXXXXXXXXXXXXXX"
    }
  },
  "workflow": [
    "1. Fetch invoice record from Airtable",
    "2. Filter non-null fields",
    "3. Extract and parse MatchPayloadJSON",
    "4. Call OpenAI with invoice data and match payload",
    "5. Create POInvoiceHeader records",
    "6. Create POInvoiceDetail records (linked to headers)",
    "7. Return created record IDs"
  ],
  "response": {
    "success": "boolean",
    "headers": {
      "ids": "string[] - Created POInvoiceHeader record IDs",
      "count": "number - Count of created headers"
    },
    "details": {
      "ids": "string[] - Created POInvoiceDetail record IDs",
      "count": "number - Count of created details"
    },
    "error": "string (optional) - Error message if failed"
  },
  "environment": {
    "openai_configured": true,
    "airtable_configured": true,
    "base_id": "appXXX..."
  }
}
```

### Dependencies

**External APIs**:
- OpenAI Chat Completions API (GPT-4o with structured outputs)
- Internal Airtable wrapper API (`/api/airtable/*`)

**Environment Variables**:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_AIRTABLE_BASE_ID` or `AIRTABLE_BASE_ID`
- `VERCEL_URL` or `NEXTAUTH_URL` (for base URL)
- `AIRTABLE_PAT` (Personal Access Token)

### Important Schema Constants

```typescript
TABLE_NAMES = {
  INVOICES: "Invoices",
  POINVOICEHEADERS: "POInvoiceHeaders",
  POINVOICEDETAILS: "POInvoiceDetails"
}

FIELD_NAMES = {
  INVOICES: {
    STATUS: "Status",
    ERRORCODE: "ErrorCode",
    ERROR_DESCRIPTION: "Error-Description",
    VENDID: "VendId",
    MATCH_PAYLOAD_JSON: "MatchPayloadJSON"
  }
}
```

### Notes for .NET Conversion

1. **Structured Outputs**: Uses OpenAI's structured outputs feature for guaranteed schema adherence
2. **Nested Data Structure**: Headers contain nested details arrays (array of arrays of match objects)
3. **Record Linking**: POInvoiceDetails must link to POInvoiceHeaders which link to Invoices
4. **Match Object Index**: The `match_object` field is an index into the `matchingReceipts` array
5. **Status Logic**: Status is "Matched" if ANY matches found, "Error" with "NO_MATCH" code if none
6. **Error Handling**: Should be lenient on Invoice status update failure
7. **Complex Prompt**: The OpenAI prompt includes detailed matching rules and schema
8. **Temperature**: GPT-5 only supports default temperature (1), cannot be set to 0
9. **Batch Operations**: Should create all details for a header in one batch request

---

## 4. Environment Variables

All three APIs require the following environment variables:

### Required for All

```bash
# Airtable Configuration
NEXT_PUBLIC_AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
# OR
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

AIRTABLE_PAT=patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# OpenAI Configuration
OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Optional (for base URL determination)

```bash
# For deployed environments
VERCEL_URL=your-app.vercel.app

# For local development
NEXTAUTH_URL=http://localhost:3000
```

### .NET Environment Variable Mapping

In Azure Functions, these should be configured as Application Settings:

```
AirtableBaseId = appXXXXXXXXXXXXXX
AirtablePersonalAccessToken = patXXXXXXXXXXXXXX...
OpenAIApiKey = sk-XXXXXXXXXXXXXXXX...
BaseUrl = https://your-function-app.azurewebsites.net
```

---

## 5. Data Flow Diagram

### Overall System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        FILE UPLOAD                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Files      │
                    │   Record     │
                    │  (Airtable)  │
                    └──────┬───────┘
                           │
                           │ Status: (empty)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     1. OCR3 API                                  │
│  • Fetch Files record from Airtable                             │
│  • Download PDF attachment                                       │
│  • Update Status → "Processing"                                  │
│  • Call OpenAI Responses API (GPT-5)                            │
│  • Extract text from PDF                                         │
│  • Update Raw-Text field in Airtable                            │
│  • Status remains "Processing"                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Trigger: Raw-Text updated
                           │
                           ▼
                ┌──────────────────────┐
                │ Airtable Automation  │
                │ (external trigger)   │
                └──────────┬───────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     2. Parser3 API                               │
│  • Receive recordID and rawText                                 │
│  • Call OpenAI Chat Completions (GPT-4o)                        │
│  • Parse invoice with structured output                          │
│  • Create Invoice record in Airtable                            │
│  • Link Invoice to Files record                                 │
│  • Update Files Status → "Processed"                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Invoices    │
                    │   Record     │
                    │  (Airtable)  │
                    └──────┬───────┘
                           │
                           │ Status: "Pending"
                           │
                           │ Trigger: Manual or automation
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  3. Match-Invoice API                            │
│  • Fetch Invoice record from Airtable                           │
│  • Filter non-null fields                                        │
│  • Extract and parse MatchPayloadJSON                           │
│  • Call OpenAI Chat Completions (GPT-4o)                        │
│  • Generate PO matching structure                                │
│  • Create POInvoiceHeaders records                              │
│  • Create POInvoiceDetails records (linked to headers)          │
│  • Update Invoice Status → "Matched" or "Error"                 │
│  • Update Invoice VendId                                         │
│  • Add Error-Description if errors occurred                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ POInvoice    │
                    │  Headers     │
                    │ POInvoice    │
                    │  Details     │
                    │  (Airtable)  │
                    └──────────────┘
```

### Status Transitions

```
Files Table Status Flow:
(empty) → Processing → Processed

Invoices Table Status Flow:
Pending → Matched
        → Error (with ErrorCode: NO_MATCH)
```

### Record Relationships

```
Files (1) ──────→ (1) Invoices (1) ──────→ (Many) POInvoiceHeaders
                                                      │
                                                      └──────→ (Many) POInvoiceDetails
```

### API Dependencies

```
OCR3 depends on:
├── Airtable REST API (Files table)
└── OpenAI Responses API (GPT-5)

Parser3 depends on:
├── Internal Airtable API wrapper
│   ├── GET /api/airtable/Invoices
│   └── PATCH /api/airtable/Files
└── OpenAI Chat Completions API (GPT-4o)

Match-Invoice depends on:
├── Internal Airtable API wrapper
│   ├── GET /api/airtable/Invoices/{id}
│   ├── POST /api/airtable/POInvoiceHeaders
│   ├── POST /api/airtable/POInvoiceDetails
│   └── PATCH /api/airtable/Invoices
└── OpenAI Chat Completions API (GPT-4o)
```

---

## 6. Additional Implementation Notes

### Error Codes

The system uses the following error codes in the `ErrorCode` field:

- `NO_MATCH` - No PO matches found for invoice line items
- `OCR_FAILED` - OCR process failed
- `PDF_CORRUPTED` - PDF file is corrupted or invalid
- `PROCESSING_ERROR` - General processing error
- `TIMEOUT_ERROR` - Request timeout

### Logging Best Practices

All three APIs use extensive logging with emoji prefixes:

- 🔵 - Information
- ✅ - Success
- ❌ - Error
- ⚠️ - Warning
- 📋 - Data/Fields
- 📄 - File operations
- 🤖 - AI/OpenAI operations
- 📝 - Database writes
- 🚀 - Process start
- 🎯 - Important milestone

### Timeout Recommendations

- **OCR3**: 300 seconds (5 minutes) - Large PDFs can take time
- **Parser3**: 60 seconds (1 minute) - Text parsing is fast
- **Match-Invoice**: 120 seconds (2 minutes) - Complex matching logic

### Rate Limiting Considerations

- **OpenAI API**: Subject to rate limits based on tier
- **Airtable API**: 5 requests per second per base
- Implement exponential backoff for retries

### Testing Endpoints

All APIs should have health check endpoints:

- `GET /api/ocr3` - Not currently implemented
- `GET /api/parser3` - Not currently implemented
- `GET /api/match-invoice` - Returns API documentation and health status

### Airtable API Wrapper

The internal Airtable API wrapper (`/api/airtable/*`) handles:

- Authentication with Airtable PAT
- Record creation/update/retrieval
- Error handling and retries
- Field name validation

For .NET conversion, this wrapper should be replaced with direct Airtable API calls.

---

## 7. Conversion Checklist for Azure Functions .NET

### OCR3 Function

- [ ] Create HTTP trigger Azure Function
- [ ] Set timeout to 300 seconds
- [ ] Implement request ID generation
- [ ] Implement Airtable REST API client
- [ ] Implement OpenAI Responses API client
- [ ] Handle binary PDF download
- [ ] Parse nested OpenAI response structure
- [ ] Add comprehensive logging
- [ ] Handle all error scenarios
- [ ] Test with various PDF sizes

### Parser3 Function

- [ ] Create HTTP trigger Azure Function
- [ ] Implement OpenAI Chat Completions client
- [ ] Implement structured outputs schema
- [ ] Implement Airtable record creation
- [ ] Implement Airtable record update
- [ ] Handle null/undefined field filtering
- [ ] Add comprehensive logging
- [ ] Handle all error scenarios
- [ ] Test with various invoice formats

### Match-Invoice Function

- [ ] Create HTTP trigger Azure Function
- [ ] Set timeout to 120 seconds
- [ ] Implement invoice record fetch
- [ ] Implement MatchPayloadJSON parsing
- [ ] Implement OpenAI Chat Completions client
- [ ] Implement complex structured outputs schema
- [ ] Implement POInvoiceHeaders creation
- [ ] Implement POInvoiceDetails creation (nested)
- [ ] Implement invoice status update logic
- [ ] Handle match object array flattening
- [ ] Add comprehensive logging
- [ ] Handle all error scenarios
- [ ] Test with various matching scenarios

### Shared Components

- [ ] Create Airtable client library
- [ ] Create OpenAI client library
- [ ] Create configuration service (environment variables)
- [ ] Create logging service
- [ ] Create error handling middleware
- [ ] Create retry logic with exponential backoff
- [ ] Create health check endpoints
- [ ] Set up Application Insights
- [ ] Configure App Settings in Azure
- [ ] Document API endpoints

---

## 8. Testing Scenarios

### OCR3 Testing

1. Valid PDF with clear text
2. Large PDF (>10 MB)
3. Corrupted PDF
4. Non-PDF file
5. Missing attachment
6. Invalid record ID
7. Airtable API failure
8. OpenAI API failure
9. Network timeout

### Parser3 Testing

1. Well-formatted invoice text
2. Missing invoice fields
3. Invalid date formats
4. Invalid number formats
5. Very long text
6. Missing recordID
7. Missing rawText
8. Airtable create failure
9. OpenAI API failure

### Match-Invoice Testing

1. Perfect item number matches
2. Partial matches with errors
3. No matches at all
4. Multiple POs
5. Single PO with multiple lines
6. Missing MatchPayloadJSON
7. Invalid MatchPayloadJSON format
8. Empty matchingReceipts array
9. Quantity/price mismatches
10. Date validation failures
11. Airtable create failure
12. OpenAI API failure

---

This documentation should provide all the information needed to convert these three Next.js API routes to Azure Functions in .NET. Each section includes detailed request/response formats, processing steps, error handling, and important notes for implementation.
















