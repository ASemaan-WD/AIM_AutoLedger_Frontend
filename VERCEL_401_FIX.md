# Vercel 401 Error Fix - OCR Upload Issues

## Problem
Getting a 401 error when uploading PDFs on Vercel, but uploads work fine locally:
```
📡 OCR API response status: 401
❌ OCR API error response: {}
❌ OCR processing failed: Error: OCR API responded with 401: Unknown error
```

## Root Cause
The 401 error is coming from the **OpenAI API**, not from your application code. This happens when:

1. The `OPENAI_API_KEY` environment variable is not set on Vercel
2. The `OPENAI_API_KEY` is set but has an incorrect value
3. The API key was read at module initialization time instead of at runtime (fixed in this commit)

## Fixes Applied

### 1. Fixed Environment Variable Loading
**File**: `src/lib/ocr2/orchestrator-clean.ts`

**Issue**: The OpenAI API key was being read at module initialization time:
```typescript
const config = {
  openaiApiKey: process.env.OPENAI_API_KEY!, // ❌ Read at import time
  // ...
}
```

**Fix**: Changed to read the environment variable lazily when the OpenAI client is first used:
```typescript
function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY; // ✅ Read at runtime
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    if (!apiKey.startsWith('sk-')) {
      throw new Error('OPENAI_API_KEY has invalid format (should start with sk-)');
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}
```

This ensures the environment variable is read at runtime, not at build time.

### 2. Added Environment Diagnostic Endpoint
**File**: `src/app/api/debug/env-check/route.ts`

A new endpoint to help diagnose environment variable issues on Vercel:
```bash
GET /api/debug/env-check
```

This endpoint:
- Checks if all required environment variables are set
- Validates the format of the OpenAI API key (should start with `sk-`)
- Tests the OpenAI API key by making an actual API call
- Shows the deployment environment and region
- Does NOT expose the actual API key values (only shows previews)

**⚠️ IMPORTANT**: Remove or protect this endpoint before going to production!

## How to Verify the Fix on Vercel

### Step 1: Check Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Verify these variables are set for **Production**:
   - `OPENAI_API_KEY` - Should start with `sk-`
   - `AIRTABLE_BASE_ID` - Your Airtable base ID
   - `AIRTABLE_PAT` - Your Airtable Personal Access Token
   - `BLOB_READ_WRITE_TOKEN` - Your Vercel Blob token

### Step 2: Deploy the Fix
```bash
git add .
git commit -m "Fix: Load OpenAI API key at runtime instead of module init"
git push
```

Vercel will automatically deploy the changes.

### Step 3: Test the Diagnostic Endpoint
After deployment, visit:
```
https://your-vercel-app.vercel.app/api/debug/env-check
```

Look for:
- `"status": "healthy"` - All environment variables are configured correctly
- `"openai_test": { "status": "success" }` - OpenAI API key is valid

If you see issues, the response will tell you exactly what's wrong.

### Step 4: Test File Upload
Try uploading a PDF file through your application. The OCR processing should now work correctly.

## Common Issues and Solutions

### Issue 1: API Key Format Error
**Symptom**: `OPENAI_API_KEY has invalid format (should start with sk-)`

**Solution**: 
1. Check that your OpenAI API key starts with `sk-`
2. Make sure there are no extra spaces or quotes around the key
3. Regenerate the API key from OpenAI dashboard if needed

### Issue 2: 401 Unauthorized
**Symptom**: `401 Unauthorized - API key is invalid or expired`

**Solution**:
1. Verify the API key is correct in the OpenAI dashboard
2. Check if the API key has been revoked or expired
3. Generate a new API key and update it in Vercel

### Issue 3: Environment Variable Not Found
**Symptom**: `OPENAI_API_KEY environment variable is not set`

**Solution**:
1. Add the environment variable in Vercel project settings
2. Make sure it's set for the correct environment (Production/Preview/Development)
3. Redeploy the application after adding the variable

### Issue 4: Works After Deploy, Fails Later
**Symptom**: Upload works right after deployment but fails later

**Possible Causes**:
1. OpenAI API rate limits exceeded
2. Vercel function timeout (default 10s on Hobby plan, 60s on Pro)
3. OpenAI API key quota exhausted

**Solution**:
- Check your OpenAI usage dashboard
- Consider upgrading your Vercel plan for longer function timeouts
- Add better error handling and retry logic

## Environment Variables Reference

Required variables for OCR processing:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key for OCR | `sk-...` | ✅ Yes |
| `AIRTABLE_BASE_ID` | Airtable base ID | `appXXXXXXXXXXXXXX` | ✅ Yes |
| `AIRTABLE_PAT` | Airtable Personal Access Token | `pat...` | ✅ Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token | `vercel_blob_...` | ✅ Yes |
| `OPENAI_MODEL_NAME` | OpenAI model to use | `gpt-4o` | ❌ No (default: gpt-4o) |
| `MAX_PARALLEL_VISION_CALLS` | Concurrent OCR requests | `5` | ❌ No (default: 5) |
| `PDF_DPI` | PDF rendering resolution | `300` | ❌ No (default: 300) |
| `MAX_PAGES_PER_DOC` | Maximum pages to process | `50` | ❌ No (default: 50) |

## Testing Locally

To test the fix locally before deploying:

```bash
# Make sure your .env.local has all required variables
cat .env.local

# Run the development server
npm run dev

# Test the diagnostic endpoint
curl http://localhost:3000/api/debug/env-check

# Test file upload
# Upload a PDF through your application
```

## Monitoring

After deploying, monitor:

1. **Vercel Function Logs**: Check for any errors in the deployment logs
2. **OpenAI Usage Dashboard**: Monitor API usage and costs
3. **Airtable API Usage**: Ensure you're not hitting rate limits
4. **Vercel Blob Storage**: Monitor storage usage

## Cleanup

After confirming everything works:

1. **Remove or protect the diagnostic endpoint**:
   - Delete `/src/app/api/debug/env-check/route.ts`
   - Or add authentication middleware to protect it

2. **Remove debug logging** (optional):
   - The upload route has extensive console.log statements
   - Consider reducing verbosity for production

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Function Logs](https://vercel.com/docs/concepts/functions/serverless-functions#viewing-logs)
- [Airtable API Documentation](https://airtable.com/developers/web/api/introduction)

