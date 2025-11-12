# OCR Debugging Guide for Vercel 401 Errors

## Quick Reference: Finding the 401 Error Source

When you see a 401 error on Vercel, follow these steps:

### Step 1: Find the Entry Point
Search Vercel logs for: `[OCR-API] ===== NEW OCR REQUEST`

This shows:
- Request ID (for tracking)
- Environment confirmation
- Configuration status
- Which record is being processed

### Step 2: Check Configuration
Look for: `[OCR-API] Configuration loaded:`

**Expected output:**
```
openaiKeyPresent: yes
openaiKeyPrefix: sk-proj-ab...
model: gpt-4o
airtableBaseId: appXXXXXXXXXXXXXX
```

**If you see:**
- `openaiKeyPresent: no` → OPENAI_API_KEY not set in Vercel
- Wrong model or baseId → Environment variables misconfigured

### Step 3: Track the Processing Steps
Look for these in order:

#### Step 1: PDF Download
Search for: `[OCR-DOWNLOAD]`

**Success looks like:**
```
📥 [OCR-DOWNLOAD] Loading PDF from: https://...
📥 [OCR-DOWNLOAD] Response status: 200 OK
✅ [OCR-DOWNLOAD] PDF downloaded (XXX KB)
✅ [OCR-DOWNLOAD] PDF validation successful
```

**401 Error here means:**
- Vercel Blob URL authentication issue
- Look for the exact error response body in logs
- Check if the blob URL is accessible from Vercel's region

#### Step 2: PDF Conversion
Search for: `[OCR-CONVERT]`

**Success looks like:**
```
🖼️  [OCR-CONVERT] Converting PDF to images...
🖼️  [OCR-CONVERT] pdftoppm version: XXX
✅ [OCR-CONVERT] Page 1: XXX KB
✅ [OCR-CONVERT] PDF conversion completed: N pages
```

**Failure here means:**
- `pdftoppm not found` → Tool not available on Vercel (MOST LIKELY ISSUE)
- Need to switch to pure Node.js solution

#### Step 3: Vision API
Search for: `[OCR-VISION]`

**Success looks like:**
```
🔍 [OCR-VISION] [p1c1] Processing with Vision API...
🔍 [OCR-VISION] [p1c1] API Key present: yes
✅ [OCR-VISION] [p1c1] Received response from OpenAI
✅ [OCR-VISION] [p1c1] Extracted XXX characters
```

**401 Error here means:**
- OpenAI API key invalid or expired
- Check API key prefix matches your OpenAI dashboard
- Look for error message containing "invalid_api_key" or "authentication"

## Common 401 Error Scenarios

### Scenario 1: PDF Download Fails (401)
**Logs show:**
```
❌ [OCR-DOWNLOAD] HTTP error: 401
❌ [OCR-DOWNLOAD] Error body: Unauthorized
```

**Cause:** Vercel Blob storage requires authentication that we're not providing

**Solution:** 
1. Check if blob URL is public
2. Add authentication headers when downloading
3. Verify BLOB_READ_WRITE_TOKEN is set

### Scenario 2: OpenAI API Fails (401)
**Logs show:**
```
❌ [OCR-VISION] [p1c1] OpenAI API error
❌ [OCR-VISION] [p1c1] Status code: 401
❌ [OCR-VISION] [p1c1] Error message: Invalid authentication
```

**Cause:** OpenAI API key invalid or not set

**Solution:**
1. Go to Vercel dashboard → Project → Settings → Environment Variables
2. Verify OPENAI_API_KEY is set and matches OpenAI dashboard
3. Redeploy after updating

### Scenario 3: pdftoppm Missing (Not 401, but likely culprit)
**Logs show:**
```
❌ [OCR-CONVERT] pdftoppm execution failed
❌ [OCR-CONVERT] Stderr: pdftoppm: command not found
```

**Cause:** pdftoppm not available in Vercel's runtime

**Solution:**
1. Switch to pure Node.js PDF processing
2. Use pdf-poppler or sharp for PDF to image conversion
3. Update orchestrator to use alternative method

## How to Access Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click on "Logs" tab
4. Filter by:
   - Functions: Select the OCR function
   - Time range: When you triggered upload
5. Search for the log tags mentioned above

## Log Tags Quick Reference

| Tag | Component | What It Tracks |
|-----|-----------|----------------|
| `[OCR-API]` | API Route | Request handling, configuration |
| `[UPLOAD-OCR]` | Upload Route | OCR trigger from upload |
| `[OCR-DOWNLOAD]` | PDF Download | Fetching PDF from URL |
| `[OCR-CONVERT]` | PDF Conversion | Converting PDF to images |
| `[OCR-VISION]` | OpenAI Vision | Extracting text from images |
| `[OCR-MAIN]` | Orchestrator | Overall process coordination |

## Expected Flow (Success)

```
🎯 [OCR-API] NEW OCR REQUEST
  → ✅ Configuration loaded
  → 📥 [OCR-DOWNLOAD] Downloading PDF
    → ✅ PDF downloaded
  → 🖼️ [OCR-CONVERT] Converting to images
    → ✅ Conversion completed
  → 🔍 [OCR-VISION] Processing chunks
    → ✅ All chunks processed
  → 📋 [OCR-MAIN] Reassembling results
🎉 [OCR-MAIN] OCR PROCESSING COMPLETED
```

## If You Can't Find Logs

Some reasons logs might not appear:
1. Function timed out before logging
2. Wrong function selected in Vercel logs filter
3. Deployment not yet active
4. Logs not yet propagated (wait 30s)

## Testing Locally vs Vercel

**Local test:**
```bash
curl -X POST http://localhost:3000/api/ocr2/process \
  -H "Content-Type: application/json" \
  -d '{"record_id":"recXXX","file_url":"https://..."}'
```

**Vercel test:**
```bash
curl -X POST https://your-app.vercel.app/api/ocr2/process \
  -H "Content-Type: application/json" \
  -d '{"record_id":"recXXX","file_url":"https://..."}'
```

Compare the logs between local and Vercel to spot differences.

## Need More Logging?

If you need even more detail, add logs to:
- `/src/lib/ocr2/image-chunker.ts` - Image chunking logic
- `/src/lib/airtable/client.ts` - Airtable operations
- `/src/lib/openai.ts` - OpenAI client initialization










