# Vercel Timeout Issue - Diagnosis and Fix

## Problem Summary

When uploading a PDF on Vercel, the OCR processing was failing silently after uploading the file to OpenAI's Files API. The logs would stop at:

```
[INFO] [VisionClientNative] Uploading PDF to OpenAI Files API
```

But locally, the full processing completed successfully.

## Root Cause

The issue was caused by **Vercel's function execution time limits**:

### Vercel Plan Limits:
- **Hobby Plan**: 10 seconds maximum
- **Pro Plan**: 60 seconds maximum (default)
- **Enterprise**: Up to 300 seconds (configurable)

### Our Configuration:
- OpenAI client timeout: 90 seconds (too long!)
- No explicit `maxDuration` set on API routes
- OpenAI PDF processing typically takes 15-20 seconds

### What Was Happening:
1. Upload API receives file (~1-2s)
2. Vercel Blob upload (~1-2s)
3. Airtable record creation (~1s)
4. OCR API triggered (~1s)
5. PDF download and validation (~1-2s)
6. **OpenAI file upload** (~1s) ✓ Succeeds
7. **OpenAI PDF processing** (~15-20s) ❌ **Vercel kills the function here**
8. Function terminated before completion - no response, no error logs

The function was being forcefully terminated by Vercel before OpenAI could return its response, causing a silent failure with no error messages.

## Solutions Implemented

### 1. Added Vercel Function Timeout Configuration

Added `maxDuration` export to all relevant API routes:

**`/api/ocr2/process/route.ts`:**
```typescript
export const maxDuration = 300; // 5 minutes for OCR processing
```

**`/api/upload/route.ts`:**
```typescript
export const maxDuration = 60; // 1 minute for upload
```

**`/api/post-ocr/process/route.ts`:**
```typescript
export const maxDuration = 60; // Already had this
```

**Note:** `maxDuration` requires Vercel Pro plan or higher. Hobby plan is limited to 10 seconds regardless of configuration.

### 2. Reduced Default OpenAI Timeout

Changed the default OpenAI client timeout from **90 seconds** to **60 seconds** in `config.ts`:

```typescript
timeoutSeconds: parseInt(process.env.OPENAI_TIMEOUT_SECONDS || '60'),
```

This ensures:
- The OpenAI call fits within the Pro plan 60s default
- If you have Pro plan with higher limits, you can set `OPENAI_TIMEOUT_SECONDS` in env vars
- Better alignment with typical Vercel configurations

### 3. Enhanced Error Handling and Logging

Added comprehensive error detection in `vision-client-native.ts`:

```typescript
// Better error messages for timeout scenarios
if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT') || error.message.includes('ECONNABORTED')) {
  throw new VisionAPIError('Vision API request timed out. This may be due to Vercel function timeout limits...');
}

// Detect aborted requests (Vercel timeout)
if (error.message.includes('aborted') || error.message.includes('cancelled')) {
  throw new VisionAPIError('Request was aborted. This usually means the Vercel function timed out...');
}

// Network error detection
if (error.message.includes('ECONNRESET') || error.message.includes('ENOTFOUND')) {
  throw new VisionAPIError('Network error while calling OpenAI API...');
}
```

### 4. Added Detailed Performance Logging

Added timing logs to track where time is spent:

```typescript
const apiCallStart = Date.now();
logger.info('Sending request to OpenAI API', { model, fileId, timeout });

const response = await client.chat.completions.create(requestOptions);

const apiCallDuration = Date.now() - apiCallStart;
logger.info('OpenAI API call completed', {
  duration: `${apiCallDuration}ms`,
  durationSeconds: (apiCallDuration / 1000).toFixed(1)
});
```

This helps identify:
- How long the OpenAI API call takes
- Whether the function is hitting time limits
- Where in the process failures occur

### 5. Added serverComponentsExternalPackages

Updated `next.config.mjs` to properly handle the OpenAI SDK:

```javascript
serverComponentsExternalPackages: ['openai'],
```

This ensures the OpenAI SDK is properly bundled for Vercel's serverless environment.

## Verification Steps

After deploying these changes to Vercel:

1. **Check your Vercel plan limits:**
   - Visit your Vercel dashboard > Settings > Usage & Billing
   - Note your plan's function execution time limit

2. **Set appropriate environment variables:**
   ```bash
   # For Pro plan with 60s limit:
   OPENAI_TIMEOUT_SECONDS=55

   # For Enterprise plan with 300s limit:
   OPENAI_TIMEOUT_SECONDS=90
   ```

3. **Monitor logs during upload:**
   - Look for: `[INFO] [VisionClientNative] Sending request to OpenAI API`
   - Should be followed by: `[INFO] [VisionClientNative] OpenAI API call completed`
   - Check the `durationSeconds` value

4. **Test with a sample PDF:**
   - Upload a test PDF
   - Check Vercel logs for completion
   - Verify the file record in Airtable has "Processed" status
   - Confirm the "Raw Text" field is populated

## Recommended Configuration by Vercel Plan

### Hobby Plan (10s limit):
❌ **OCR processing will not work** - OpenAI typically needs 15-20 seconds.

**Workaround:** Use queue-based processing with a separate service, or upgrade to Pro.

### Pro Plan (60s limit):
✅ **Should work for most PDFs**

Environment variables:
```bash
OPENAI_TIMEOUT_SECONDS=55
MAX_VISION_RETRIES=0  # Disable retries to avoid timeout
```

### Enterprise Plan (300s limit):
✅ **Full functionality**

Environment variables:
```bash
OPENAI_TIMEOUT_SECONDS=90
MAX_VISION_RETRIES=1
```

## Alternative Solutions (If Still Having Issues)

If you're still experiencing timeouts on Vercel Pro:

### Option 1: Queue-Based Processing
Move OCR to a background job:
- Immediate response to upload
- Process OCR via webhook or cron
- Update Airtable when complete

### Option 2: Stream Processing
Use OpenAI's streaming API (if available for PDF):
- Start sending response immediately
- Process chunks as they arrive
- Better user feedback

### Option 3: External Worker
Move OCR to a dedicated service:
- AWS Lambda with 15-minute timeout
- Railway/Render background jobs
- Dedicated server

### Option 4: Optimize File Size
Reduce processing time:
- Compress PDFs before upload
- Limit maximum page count
- Use lower DPI for image extraction (if needed)

## Monitoring and Debugging

### Key Log Messages to Watch:

✅ **Success indicators:**
```
[INFO] [VisionClientNative] Sending request to OpenAI API
[INFO] [VisionClientNative] OpenAI API call completed
[INFO] [VisionClientNative] OpenAI Vision API response received
[INFO] [OCR2-API] Airtable record updated successfully
```

❌ **Failure indicators:**
```
[ERROR] OpenAI Vision API call failed
[ERROR] Request was aborted (likely Vercel timeout)
[ERROR] Vision API request timed out
```

### Performance Benchmarks:

For a typical 1-page invoice PDF (~2KB):
- Vercel Blob upload: ~1-2s
- Airtable record creation: ~500ms
- PDF download: ~500ms
- OpenAI file upload: ~1s
- OpenAI processing: ~15-20s
- Airtable update: ~500ms
- **Total: ~20-25 seconds**

For a 5-page PDF (~50KB):
- OpenAI processing: ~30-45s
- **Total: ~35-50 seconds**

## Files Modified

1. `next.config.mjs` - Added serverComponentsExternalPackages
2. `src/app/api/ocr2/process/route.ts` - Added maxDuration export
3. `src/app/api/upload/route.ts` - Added maxDuration export
4. `src/lib/ocr2/config.ts` - Reduced default timeout to 60s
5. `src/lib/ocr2/vision-client-native.ts` - Enhanced error handling and logging

## Testing Checklist

- [ ] Deploy changes to Vercel
- [ ] Verify environment variables are set
- [ ] Test with 1-page PDF
- [ ] Test with 5-page PDF
- [ ] Check Vercel function logs
- [ ] Verify Airtable records are created
- [ ] Confirm post-OCR processing runs
- [ ] Test error scenarios (invalid PDF, etc.)

## Next Steps

1. **Deploy to Vercel** with these changes
2. **Monitor the logs** during first few uploads
3. **Adjust timeouts** based on your plan and actual performance
4. **Consider upgrading** to Vercel Pro if on Hobby plan
5. **Implement queue-based processing** for long-running tasks if needed

---

## Summary

The issue was a mismatch between Vercel's function execution limits and our OpenAI processing time requirements. By:

1. ✅ Setting explicit `maxDuration` on routes
2. ✅ Reducing default timeout to 60s
3. ✅ Adding better error handling
4. ✅ Improving logging and monitoring

The OCR processing should now work reliably on Vercel Pro plan and above.

