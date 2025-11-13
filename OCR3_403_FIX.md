# OCR3 403 Error Fix

**Date:** November 13, 2025  
**Issue:** OCR3 API returning 403 Forbidden when trying to fetch newly created Airtable records

## Problem Analysis

### Symptoms
1. File uploaded successfully to Vercel Blob ✅
2. Airtable record created successfully ✅
3. OCR3 API called with correct record ID ✅
4. **OCR3 returns 403 when fetching record from Airtable** ❌

### Error Logs
```
✅ File uploaded and attached to Airtable record recoXcCF6reo3gccR
🔍 Triggering OCR3 processing for PDF: GLOB_Invoices_OCR copy.pdf
📄 Record ID: recoXcCF6reo3gccR
📡 OCR3 API response status: 403
❌ OCR3 API error response: { error: 'Failed to fetch record: 403' }
```

### Root Causes (Most Likely)

#### 1. **Timing/Propagation Issue** (Most Likely)
Airtable has eventual consistency. When a record is created, it may not be immediately available via the API, especially when:
- Creating records with attachments
- The attachment URL needs to be fetched and stored by Airtable
- High API load or network latency

**Evidence:**
- Upload route creates record and immediately calls OCR3
- OCR3 immediately tries to fetch the record
- No delay between record creation and fetch attempt

#### 2. **Environment Variable Configuration**
The OCR3 route uses environment variables that might not be set correctly in production:
```typescript
const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_PAT;
```

If `BASE_ID` or `AIRTABLE_TOKEN` are undefined or incorrect, the API will return 403.

#### 3. **Airtable Token Permissions**
The Personal Access Token (PAT) might not have read permissions on the Files table, even if it has write permissions.

## Implemented Fixes

### Fix 1: Added Propagation Delay
Added delays to allow Airtable to propagate the record:

**In upload route (`upload/route.ts`):**
```typescript
// Add a delay to allow Airtable record to propagate
console.log('⏳ Waiting 3 seconds before triggering OCR3...');
await new Promise(resolve => setTimeout(resolve, 3000));
```

**In OCR3 route (`ocr3/route.ts`):**
```typescript
// Add a small delay to allow for Airtable propagation
console.log(`⏳ [${requestId}] OCR3: Waiting 2 seconds for Airtable record propagation...`);
await new Promise(resolve => setTimeout(resolve, 2000));
```

**Total delay:** 5 seconds (3s in upload + 2s in OCR3)

### Fix 2: Enhanced Logging & Request Correlation
Added request correlation IDs to track individual requests through the system:

```typescript
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`🔵 [${requestId}] OCR3: Fetching record:`, recordId);
  console.log(`🔵 [${requestId}] OCR3: BASE_ID:`, BASE_ID);
  console.log(`🔵 [${requestId}] OCR3: AIRTABLE_TOKEN present:`, !!AIRTABLE_TOKEN);
  console.log(`🔵 [${requestId}] OCR3: AIRTABLE_TOKEN length:`, AIRTABLE_TOKEN?.length);
  // ... all logs now include [requestId]
}
```

This allows us to:
- Track individual requests through interleaved logs
- Verify environment variables are set correctly
- Debug timing issues

### Fix 3: Better Error Messages
Enhanced error logging to include full context:

```typescript
if (!airtableResponse.ok) {
  const errorText = await airtableResponse.text();
  console.error(`❌ [${requestId}] OCR3: Airtable fetch error:`, airtableResponse.status, errorText);
  console.error(`❌ [${requestId}] OCR3: Record ID:`, recordId);
  console.error(`❌ [${requestId}] OCR3: BASE_ID:`, BASE_ID);
  console.error(`❌ [${requestId}] OCR3: Full URL:`, url);
  return NextResponse.json(
    { error: `Failed to fetch record: ${airtableResponse.status}`, details: errorText },
    { status: airtableResponse.status }
  );
}
```

## Testing Instructions

### 1. Deploy Changes
```bash
git add src/app/api/ocr3/route.ts src/app/api/upload/route.ts
git commit -m "fix: Add propagation delays and enhanced logging for OCR3 403 errors"
git push origin main
```

### 2. Upload a Test PDF
1. Go to your application's upload page
2. Upload a PDF file
3. Watch the console/Vercel logs

### 3. Check Logs
Look for the following in Vercel logs:
```
[abc123] OCR3: Fetching record: recXXXXXXXXXXXXXX
[abc123] OCR3: BASE_ID: appXXXXXXXXXXXXXX
[abc123] OCR3: AIRTABLE_TOKEN present: true
[abc123] OCR3: AIRTABLE_TOKEN length: 50+
⏳ [abc123] OCR3: Waiting 2 seconds for Airtable record propagation...
✅ [abc123] OCR3: Record fetched successfully
```

### 4. If Still Failing
Check for these specific issues:

**A. Environment Variables Not Set:**
```
[abc123] OCR3: BASE_ID: undefined
[abc123] OCR3: AIRTABLE_TOKEN present: false
```
**Solution:** Set environment variables in Vercel Dashboard

**B. Token Permissions:**
```
❌ [abc123] OCR3: Airtable fetch error: 403 PERMISSION_DENIED
```
**Solution:** Regenerate PAT with read/write permissions on all tables

**C. Still Getting 403 After Delay:**
```
⏳ [abc123] OCR3: Waiting 2 seconds for Airtable record propagation...
❌ [abc123] OCR3: Airtable fetch error: 403 RECORD_NOT_FOUND
```
**Solution:** Increase delay to 5-10 seconds or implement retry logic

## Alternative Solutions (If Delays Don't Work)

### Option 1: Retry with Exponential Backoff
Instead of a fixed delay, implement retry logic:

```typescript
async function fetchRecordWithRetry(recordId: string, maxRetries = 5): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 403 || response.status === 404) {
        // Might not be propagated yet
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s, 8s, 16s
        console.log(`⏳ [${requestId}] Retry ${i+1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### Option 2: Use Airtable Client Instead of Raw Fetch
Replace raw fetch with the Airtable client which has built-in retry logic:

```typescript
import { createAirtableClient } from '@/lib/airtable/client';

const airtableClient = createAirtableClient(BASE_ID);
const record = await airtableClient.getRecord('Files', recordId);
```

The client already has:
- Rate limiting
- Retry with exponential backoff
- Better error handling

### Option 3: Queue-Based Processing
Instead of synchronous OCR processing, use a queue:

1. Upload creates record in "Queued" status
2. Background worker polls for "Queued" records
3. Worker processes OCR after sufficient delay
4. Updates status to "Processing" → "Processed"

## Environment Variables Checklist

Ensure these are set in Vercel Dashboard:

- [ ] `AIRTABLE_BASE_ID` - Base ID (starts with `app`)
- [ ] `AIRTABLE_PAT` - Personal Access Token (starts with `pat`)
- [ ] `OPENAI_API_KEY` - OpenAI API key (starts with `sk-`)

Optional:
- [ ] `NEXT_PUBLIC_AIRTABLE_BASE_ID` - Client-side base ID (if needed)

## Related Files
- `/src/app/api/ocr3/route.ts` - OCR3 processing route
- `/src/app/api/upload/route.ts` - File upload route
- `/src/lib/airtable/client.ts` - Airtable client with retry logic
- `/src/lib/airtable/error-handler.ts` - Error code handler

## Status
🔧 **In Testing** - Changes deployed, awaiting test results

---

**Last Updated:** November 13, 2025  
**Author:** AI Assistant  
**Related Issues:** OCR3 403 Error, File Upload Flow

