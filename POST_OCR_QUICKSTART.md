# Post-OCR Processing - Quick Start Guide

## ✅ What's Been Implemented

Your system now automatically:
1. ✅ Parses OCR text with GPT-4o after OCR completes
2. ✅ Identifies documents (invoices, delivery tickets, store receivers)
3. ✅ Extracts structured data (vendor, amount, date, etc.)
4. ✅ Creates Airtable records in the correct tables
5. ✅ Links documents back to source files
6. ✅ Assigns teams automatically

## 🚀 Quick Setup (2 minutes)

### Step 1: Add OpenAI API Key

Add to `.env.local`:

```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### Step 2: Restart Dev Server

```bash
npm run dev
```

That's it! The system is now ready.

## 🧪 Testing (3 Methods)

### Method 1: Upload a New PDF (Full Workflow Test)

The easiest way to test:

1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/upload
3. Upload a PDF invoice/ticket
4. Wait for OCR to complete (~10-30 seconds)
5. Post-OCR processing triggers automatically
6. Check your Airtable to see the created record!

**Watch the console logs** - you'll see detailed step-by-step output.

### Method 2: Test Existing File (Manual Trigger)

Test with a file that's already been OCR'd:

1. Find a file record ID from Airtable:
   - Open your **Files** table
   - Find a record with Status = "Processed" and Raw Text populated
   - Copy the record ID (looks like `recXXXXXXXXXXXXXX`)

2. Run the test script:
   ```bash
   node test-post-ocr.js recXXXXXXXXXXXXXX
   ```

3. Watch the output - it will show you exactly what happened!

**Example output:**
```
╔═══════════════════════════════════════════════════════════╗
║        POST-OCR PROCESSING TEST SUITE                    ║
╚═══════════════════════════════════════════════════════════╝

🏥 Step 1: Health Check
✅ Endpoint is available
📊 Configuration:
   openai: ✅ Configured
   airtable: ✅ Configured

🚀 Step 2: Process File recXXXXXXXXXXXXXX
⏳ Sending request...
⏱️  Processing took 4.23 seconds

✅ SUCCESS!

📋 Results:
   File Record: recXXXXXXXXXXXXXX
   Documents Created: 1

📄 Documents:
   1. INVOICE
      Vendor: Sysco Corporation
      Invoice #: INV-2024-001
      Amount: 1234.56
      Record ID: recYYYYYYYYYYYYYY
```

### Method 3: API Call (Developer Testing)

Use curl or Postman:

```bash
curl -X POST http://localhost:3000/api/post-ocr/process \
  -H "Content-Type: application/json" \
  -d '{"file_record_id": "recXXXXXXXXXXXXXX"}'
```

## 📊 What to Check in Airtable

After processing, verify in Airtable:

### In the Files Table:
- ✅ File should have links to created documents
- ✅ Check Invoices/Delivery Tickets/Store Receivers columns

### In the Documents Table (Invoices/Tickets/Receivers):
- ✅ New record(s) created
- ✅ Vendor Name populated
- ✅ Invoice Number populated
- ✅ Amount populated
- ✅ Date populated
- ✅ Document Raw Text populated
- ✅ Files column links back to source file
- ✅ Team assigned (if store number was detected)
- ✅ Status set to "open"

## 🐛 Troubleshooting

### Issue: "OPENAI_API_KEY is not set"
**Fix**: Add your OpenAI API key to `.env.local` and restart the server

### Issue: "No text extracted"
**Fix**: The file hasn't completed OCR yet. Upload a new file or wait for OCR to finish.

### Issue: "Team not found"
**Fix**: The store number doesn't match a team in your Teams table. The document will still be created, just without a team link.

### Issue: Nothing happens after upload
**Fix**: 
1. Check server console logs for errors
2. Verify OPENAI_API_KEY is valid
3. Check Airtable credentials
4. Make sure the file is a PDF (only PDFs trigger OCR)

### Issue: LLM returns wrong document type
**Fix**: The prompts may need adjustment. Check `src/lib/llm/prompts.ts` and refine the document type identification rules.

## 📝 Console Logs to Watch

You'll see detailed logs like:

```
🚀 Starting post-OCR processing for file: recXXX...
📂 Step 1: Fetching file record from Airtable...
✅ File record fetched. Raw text length: 5432 chars

🤖 Step 2: Parsing OCR text with LLM...
🤖 Calling OpenAI to parse OCR text (5432 chars)
✅ Successfully parsed 1 document(s)

Document 1: {
  type: 'invoice',
  vendor: 'Sysco Corporation',
  invoiceNumber: 'INV-2024-001',
  amount: '1234.56',
  team: '123'
}

📄 Single document detected - using full raw text

💾 Step 3: Creating Airtable records...
  Processing document 1/1...
  ✅ Using full file text (5432 chars)
  ✅ Linked to team: 123 (recTEAMXXXXXXXXXX)
  📤 Creating invoice record in Invoices:
  ✅ Created invoice record: recINVXXXXXXXXXX

✅ Created 1 Airtable record(s)

🔗 Step 4: Linking documents to file record...
✅ Documents linked to file

✅ Post-OCR processing completed successfully!
```

## 🎯 Testing Scenarios

Test with different types of documents:

1. **Single Invoice**: Should create 1 invoice record
2. **Multiple Invoices**: Should create multiple invoice records, each with extracted text
3. **Delivery Ticket**: Should create in Delivery Tickets table
4. **Store Receiver**: Should create in Store Receivers table
5. **Mixed Document**: Should create records in appropriate tables

## 📈 Success Criteria

✅ **You know it's working when:**
- Upload a PDF → OCR completes → Document records appear in Airtable
- Console shows detailed processing logs
- Document fields are populated correctly
- Documents link back to source file
- Teams are assigned automatically
- Test script returns "ALL TESTS PASSED"

## 🔧 Advanced Testing

### Test Individual Components

**Test LLM parsing only:**
```typescript
// Create test-llm.ts
import { parseDocuments } from './src/lib/llm/parser';

const sampleText = `
SYSCO CORPORATION
INVOICE #12345
Date: 2024-01-15
Total: $1,234.56
`;

parseDocuments(sampleText).then(console.log);
```

Run: `npx tsx test-llm.ts`

**Test team lookup:**
```typescript
import { findTeamByName } from './src/lib/post-ocr/airtable-helpers';

findTeamByName("123").then(id => {
  console.log("Team ID:", id);
});
```

## 📚 Files to Review

If you want to understand or modify the implementation:

- `src/lib/llm/prompts.ts` - Adjust LLM instructions
- `src/lib/llm/schemas.ts` - Change extracted fields
- `src/lib/post-ocr/processor.ts` - Main workflow logic
- `src/lib/post-ocr/airtable-helpers.ts` - Airtable integration
- `src/app/api/post-ocr/process/route.ts` - Test endpoint

## 🎉 Next Steps

Once basic testing works:

1. Test with real production invoices
2. Monitor LLM parsing accuracy
3. Adjust prompts if needed
4. Set up monitoring/alerts
5. Consider adding validation rules
6. Add confidence scoring

## 💰 Cost Estimates

**OpenAI API Costs (GPT-4o):**
- Single document: ~$0.01 - $0.03 per file
- Multiple documents: ~$0.03 - $0.08 per file

**Typical invoice (5000 chars):**
- Input tokens: ~1,250 tokens = $0.00625
- Output tokens: ~200 tokens = $0.003
- **Total: ~$0.01 per document**

For 1000 files/month: ~$10-30/month

## ❓ Need Help?

Check these files for more details:
- `POST_OCR_IMPLEMENTATION.md` - Full technical documentation
- Console logs - Detailed step-by-step progress
- Test script output - Specific error messages

Happy testing! 🚀






