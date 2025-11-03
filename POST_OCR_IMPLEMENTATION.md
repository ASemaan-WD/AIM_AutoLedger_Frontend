# Post-OCR Processing Implementation

## Overview

This implementation adds automatic document parsing and Airtable record creation after OCR completion. When a PDF file is processed with OCR, the system now:

1. **Parses** the raw OCR text using GPT-4o to identify documents
2. **Extracts** structured data (vendor, invoice number, amount, date, etc.)
3. **Creates** Airtable records in the appropriate table (Invoices, Delivery Tickets, or Store Receivers)
4. **Links** the created documents back to the source file

## Architecture

```
File Upload → OCR Processing → Raw Text Extraction
                                      ↓
                              Post-OCR Processing
                                      ↓
                    LLM Parsing (GPT-4o with Structured Outputs)
                                      ↓
                         Document Extraction
                        (Single vs Multiple)
                                      ↓
                        Airtable Record Creation
                        (Invoices/Tickets/Receivers)
                                      ↓
                         Link Back to File
```

## File Structure

```
src/
├── lib/
│   ├── openai.ts                    # OpenAI client configuration
│   ├── llm/
│   │   ├── schemas.ts               # JSON schemas for structured outputs
│   │   ├── prompts.ts               # LLM prompts for parsing
│   │   └── parser.ts                # Document parsing functions
│   └── post-ocr/
│       ├── processor.ts             # Main post-OCR workflow
│       └── airtable-helpers.ts      # Airtable integration functions
└── app/
    └── api/
        ├── post-ocr/
        │   └── process/
        │       └── route.ts         # Test/manual trigger endpoint
        └── ocr2/
            └── process/
                └── route.ts         # Modified to trigger post-OCR
```

## Key Features

### 1. Structured LLM Outputs

Uses OpenAI's structured output feature with JSON schema validation to ensure reliable parsing:

```typescript
{
  document_type: "invoice" | "store_receiver" | "delivery_ticket",
  vendor_name: string | null,
  invoice_number: string | null,
  invoice_date: string | null,  // YYYY-MM-DD format
  amount: string | null,
  team: string | null,  // Store number
  document_name: string | null,  // 5-word summary
  door_number: string | null
}
```

### 2. Single vs Multiple Document Handling

- **Single Document**: Uses the full file raw text as the document raw text
- **Multiple Documents**: Re-invokes LLM to extract text for each individual document

### 3. Team Assignment

Automatically looks up teams by name/store number and links documents to the correct team in Airtable.

### 4. Automatic Workflow Integration

Post-OCR processing triggers automatically after successful OCR completion. No manual intervention required.

### 5. Comprehensive Logging

Detailed console logging at each step for easy debugging:
- File fetch
- LLM parsing
- Document extraction
- Record creation
- Linking

## Environment Variables

Add to your `.env.local`:

```bash
# OpenAI Configuration (Required)
OPENAI_API_KEY=sk-...

# Airtable Configuration (Already configured)
AIRTABLE_PERSONAL_ACCESS_TOKEN=...
AIRTABLE_BASE_ID=...
NEXT_PUBLIC_AIRTABLE_BASE_ID=...
```

## Testing Guide

### Step 1: Test the API Endpoint

First, verify the endpoint is working:

```bash
# Health check
curl http://localhost:3000/api/post-ocr/process

# Should return API documentation
```

### Step 2: Manual Test with a File Record

Find a file record that has been OCR'd (check your Airtable Files table for records with status "Processed" and raw text populated).

```bash
curl -X POST http://localhost:3000/api/post-ocr/process \
  -H "Content-Type: application/json" \
  -d '{"file_record_id": "recXXXXXXXXXXXXXX"}'
```

**Expected Response:**
```json
{
  "success": true,
  "fileRecordId": "recXXXXXXXXXXXXXX",
  "documentsCreated": 1,
  "documentIds": [
    {
      "type": "invoice",
      "id": "recYYYYYYYYYYYYYY"
    }
  ],
  "details": {
    "documents": [
      {
        "index": 1,
        "type": "invoice",
        "vendor": "Sysco Corporation",
        "invoiceNumber": "INV-2024-001",
        "amount": "1234.56",
        "recordId": "recYYYYYYYYYYYYYY"
      }
    ]
  }
}
```

### Step 3: Verify in Airtable

1. Open your Airtable base
2. Check the appropriate table (Invoices, Delivery Tickets, or Store Receivers)
3. Verify the new record was created with:
   - ✅ Vendor name
   - ✅ Invoice number
   - ✅ Amount
   - ✅ Date
   - ✅ Document raw text
   - ✅ Link to source file
   - ✅ Team assignment (if applicable)

### Step 4: Test Full Workflow

Upload a new PDF through the UI:

1. Go to `/upload`
2. Drop a PDF invoice
3. Wait for OCR to complete
4. Post-OCR processing should trigger automatically
5. Check console logs for processing details
6. Verify document records were created in Airtable

### Step 5: Test with Multiple Documents

If you have a PDF with multiple invoices/documents:

1. Upload the file
2. The LLM will identify all documents
3. Individual text will be extracted for each
4. Multiple records will be created
5. All will be linked back to the source file

## Debugging

### Enable Detailed Logging

Check your terminal/console for detailed logs:

```
🚀 Starting post-OCR processing for file: recXXX...
📂 Step 1: Fetching file record from Airtable...
✅ File record fetched. Raw text length: 5432 chars

🤖 Step 2: Parsing OCR text with LLM...
🤖 Calling OpenAI to parse OCR text (5432 chars)
📦 Received response from OpenAI: {"documents":[...
✅ Successfully parsed 2 document(s)

Document 1: { type: 'invoice', vendor: 'Sysco', ... }
Document 2: { type: 'delivery_ticket', vendor: 'US Foods', ... }

📄 Multiple documents detected - will extract individual text for each

💾 Step 3: Creating Airtable records...
  Processing document 1/2...
  🔍 Extracting text for individual document...
  ✅ Extracted 2341 chars
  📤 Creating invoice record in Invoices:
  ✅ Created invoice record: recYYY...
  
  Processing document 2/2...
  🔍 Extracting text for individual document...
  ✅ Extracted 3091 chars
  📤 Creating delivery_ticket record in Delivery Tickets:
  ✅ Created delivery_ticket record: recZZZ...

✅ Created 2 Airtable record(s)

🔗 Step 4: Linking documents to file record...
✅ Documents linked to file

✅ Post-OCR processing completed successfully!
```

### Common Issues

#### Issue: "OpenAI API key not set"
**Solution**: Add `OPENAI_API_KEY` to your `.env.local`

#### Issue: "Failed to fetch file record"
**Solution**: Verify the file record ID exists and has completed OCR processing

#### Issue: "No text extracted"
**Solution**: Check that the file record has raw text populated (OCR completed successfully)

#### Issue: "Team not found"
**Solution**: Ensure the team name/store number in the document matches a record in the Teams table

#### Issue: LLM returns empty documents array
**Solution**: The OCR text may be too corrupted or unclear. Check the raw text quality.

## Manual Testing Commands

### Test LLM Parsing Only

Create a test file to parse sample text:

```typescript
// test-parser.ts
import { parseDocuments } from './src/lib/llm/parser';

const sampleText = `
SYSCO CORPORATION
INVOICE
Invoice Number: 12345
Date: 2024-01-15
Amount Due: $1,234.56
Store #: 123
`;

parseDocuments(sampleText)
  .then(docs => console.log('Parsed:', JSON.stringify(docs, null, 2)))
  .catch(err => console.error('Error:', err));
```

Run with: `npx tsx test-parser.ts`

### Test Airtable Record Creation

Use the API endpoint with different file records to test:
- Single invoice
- Multiple invoices
- Delivery tickets
- Store receivers
- Mixed document types

### Test Team Lookup

```bash
# Create a test endpoint or modify processor.ts temporarily:
import { findTeamByName } from './airtable-helpers';

console.log(await findTeamByName("123"));  // Should return team record ID
console.log(await findTeamByName("Store 456"));  // Should return team record ID
console.log(await findTeamByName("NonExistent"));  // Should return null
```

## Error Handling

The system is designed to be fault-tolerant:

1. **LLM Parsing Errors**: Logged but don't crash the system
2. **Missing Fields**: Fields are left null/empty - Airtable will handle downstream
3. **Team Not Found**: Document is still created, just without team link
4. **Partial Failures**: If some documents fail to create, others still proceed

## Performance Considerations

- **LLM Calls**: ~2-5 seconds per parse operation
- **Multiple Documents**: Additional LLM call per document for text extraction
- **Airtable API**: Rate limited to 5 requests/second
- **Total Time**: ~5-15 seconds for typical invoices

## Next Steps

1. ✅ Test with real invoice PDFs
2. ✅ Verify all document types work (invoice, delivery_ticket, store_receiver)
3. ✅ Test multi-document PDFs
4. ✅ Monitor LLM parsing accuracy
5. ✅ Adjust prompts if needed for better extraction
6. Consider adding retry logic for failed LLM calls
7. Consider adding validation for extracted dates/amounts

## Monitoring

Key metrics to track:
- Success rate of document parsing
- Number of documents per file (distribution)
- LLM API costs
- Average processing time
- Team assignment success rate

Check logs regularly for:
- `❌` errors
- `⚠️` warnings (e.g., team not found)
- Success counts

## Future Enhancements

- [ ] Add confidence scores from LLM
- [ ] Support for additional document types
- [ ] Batch processing for multiple files
- [ ] Web UI for manual review/correction
- [ ] Analytics dashboard for parsing accuracy
- [ ] Custom field extraction rules per client

---

**Implementation Date**: 2025-10-02  
**Status**: ✅ Ready for Testing  
**Version**: 1.0.0





