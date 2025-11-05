# Vercel Deployment Checklist

## Pre-Deployment

### 1. Verify Vercel Plan
- [ ] Check your Vercel plan in dashboard
- [ ] Confirm function timeout limits
- [ ] **Pro or Enterprise plan required** for OCR functionality

### 2. Environment Variables
Set these in Vercel Dashboard (Settings > Environment Variables):

**Required:**
- [ ] `OPENAI_API_KEY` - Your OpenAI API key (starts with "sk-")
- [ ] `AIRTABLE_PAT` - Your Airtable Personal Access Token (starts with "pat")
- [ ] `AIRTABLE_BASE_ID` - Your Airtable base ID (starts with "app")

**Recommended for Pro Plan:**
- [ ] `OPENAI_TIMEOUT_SECONDS=55` (or 60 max)
- [ ] `MAX_VISION_RETRIES=0` (disable retries to avoid timeout)

**Optional for Enterprise Plan:**
- [ ] `OPENAI_TIMEOUT_SECONDS=90` (or higher)
- [ ] `MAX_VISION_RETRIES=1` (enable retries)
- [ ] `OPENAI_MODEL_NAME=gpt-5` (if you have access)

### 3. Code Changes Made
The following files have been updated:
- [x] `next.config.mjs` - Added OpenAI package configuration
- [x] `src/app/api/ocr2/process/route.ts` - Added maxDuration=300
- [x] `src/app/api/upload/route.ts` - Added maxDuration=60
- [x] `src/lib/ocr2/config.ts` - Reduced default timeout to 60s
- [x] `src/lib/ocr2/vision-client-native.ts` - Enhanced error handling

## Deployment Steps

### Step 1: Push Changes to Git
```bash
git add .
git commit -m "Fix: Add Vercel timeout configuration and enhanced error handling for OCR"
git push origin main
```

### Step 2: Vercel Auto-Deploy
- Vercel will automatically detect the push
- Wait for build to complete (~2-5 minutes)
- Check build logs for any errors

### Step 3: Configure Function Settings (Optional)
In Vercel Dashboard:
1. Go to Project Settings > Functions
2. Set "Function Max Duration" to your plan's maximum:
   - Pro: 60 seconds
   - Enterprise: 300 seconds

### Step 4: Test Deployment

#### 4a. Health Check
```bash
curl https://your-app.vercel.app/api/ocr2/process
```

Should return:
```json
{
  "status": "healthy",
  "service": "OCR2",
  "version": "2.0.0-native",
  "configuration": {
    "maxFileSize": "32MB",
    "model": "gpt-4o",
    "nativePDFSupport": true
  }
}
```

#### 4b. Upload Test PDF
1. Go to your app: `https://your-app.vercel.app`
2. Upload a small test PDF (1 page, <5KB)
3. Monitor Vercel logs in real-time:
   ```bash
   vercel logs --follow
   ```

#### 4c. Verify Logs
Look for these log messages in order:

✅ **Upload phase:**
```
🔍 Validating file...
✅ File validation passed
✅ Vercel Blob upload successful
✅ File uploaded and attached to Airtable record
🔍 Triggering OCR processing for PDF
```

✅ **OCR phase:**
```
[INFO] [OCR2-API] Starting OCR processing
[INFO] [OrchestratorNative] Starting native PDF processing
[INFO] [VisionClientNative] Processing PDF (attempt 1/2)
[INFO] [VisionClientNative] Uploading PDF to OpenAI Files API
[INFO] [VisionClientNative] PDF uploaded successfully
[INFO] [VisionClientNative] Sending request to OpenAI API  ← Key log
[INFO] [VisionClientNative] OpenAI API call completed      ← Should appear!
[INFO] [VisionClientNative] OpenAI Vision API response received
[INFO] [OCR2-API] Airtable record updated successfully
```

✅ **Post-OCR phase:**
```
🚀 Starting post-OCR processing
📂 Step 1: Fetching file record from Airtable...
🤖 Step 2: Parsing OCR text with LLM...
💾 Step 3: Creating Airtable records...
✅ Post-OCR processing completed successfully!
```

#### 4d. Check Airtable
1. Open your Airtable base
2. Go to the "Files" table
3. Find the uploaded file
4. Verify:
   - [ ] Status = "Processed"
   - [ ] "Raw Text" field is populated
   - [ ] Related invoice record exists

## Troubleshooting

### Issue: Logs stop at "Uploading PDF to OpenAI Files API"

**Cause:** Function timeout before OpenAI responds

**Fix:**
1. Check Vercel plan (must be Pro or higher)
2. Verify `maxDuration` is set in route files (done ✅)
3. Reduce `OPENAI_TIMEOUT_SECONDS` to 55 or less
4. Check if PDF is unusually large (>5 pages)

### Issue: "Function invocation timed out"

**Cause:** Total processing time exceeds Vercel limit

**Fix:**
1. Verify your Vercel plan:
   ```bash
   vercel whoami
   vercel teams ls
   ```
2. Check if using Hobby plan (upgrade required)
3. Set `MAX_VISION_RETRIES=0` in environment variables
4. Try with a smaller PDF

### Issue: "OpenAI API timeout"

**Cause:** OpenAI is taking longer than expected

**Fix:**
1. Check OpenAI status: https://status.openai.com
2. Increase `OPENAI_TIMEOUT_SECONDS` (if within Vercel limits)
3. Try with a different/smaller PDF
4. Check if PDF is corrupted or has complex graphics

### Issue: "Configuration error"

**Cause:** Missing or invalid environment variables

**Fix:**
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Verify all required vars are set
3. Check for typos in variable names
4. Ensure values start with correct prefixes:
   - OPENAI_API_KEY: `sk-...`
   - AIRTABLE_PAT: `pat...`
   - AIRTABLE_BASE_ID: `app...`
5. Redeploy after updating environment variables

### Issue: No logs appearing

**Cause:** Logging might be disabled or not reaching console

**Fix:**
1. Check Vercel logs directly:
   ```bash
   vercel logs
   ```
2. Enable verbose logging in Vercel dashboard
3. Try with local Vercel CLI:
   ```bash
   vercel dev
   ```

## Monitoring Best Practices

### Real-Time Monitoring
```bash
# Watch logs in real-time
vercel logs --follow

# Filter for errors only
vercel logs --follow | grep ERROR

# Filter for specific component
vercel logs --follow | grep OCR2
```

### Performance Benchmarks

Track these metrics for each upload:

| Metric | Target | Alert If |
|--------|--------|----------|
| Upload time | <5s | >10s |
| OCR API call duration | 15-20s | >45s |
| Post-OCR processing | <5s | >10s |
| Total time | <30s | >50s |

### Key Metrics to Monitor

1. **Processing Time:**
   - Look for: `duration: XXXms` in logs
   - Target: <30s for 1-page PDF

2. **Token Usage:**
   - Look for: `tokensUsed: XXX` in logs
   - Track costs at https://platform.openai.com/usage

3. **Success Rate:**
   - Monitor: `status: "success"` vs errors
   - Target: >95% success rate

4. **Error Patterns:**
   - Track error types in logs
   - Common: DUPLICATE_FILE, PDF_CORRUPTED, OCR_FAILED

## Rollback Plan

If issues persist after deployment:

### Quick Rollback
1. Go to Vercel Dashboard > Deployments
2. Find previous working deployment
3. Click "..." menu > "Promote to Production"

### Code Rollback
```bash
git revert HEAD
git push origin main
```

### Environment Variable Rollback
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Restore previous values:
   - `OPENAI_TIMEOUT_SECONDS=90`
3. Redeploy

## Post-Deployment

### Week 1: Monitor Closely
- [ ] Check logs daily
- [ ] Monitor error rates
- [ ] Track processing times
- [ ] Verify Airtable records are correct

### Week 2-4: Optimize
- [ ] Tune timeout values based on actual performance
- [ ] Adjust retry logic if needed
- [ ] Consider caching strategies
- [ ] Plan for scaling if needed

### Ongoing
- [ ] Set up alerts for failures
- [ ] Monitor OpenAI API costs
- [ ] Track user feedback
- [ ] Plan capacity increases

## Success Criteria

✅ **Deployment is successful if:**
1. Health check returns "healthy" status
2. Test PDF uploads complete successfully
3. Logs show complete processing flow
4. Airtable records are created correctly
5. No timeout errors in logs
6. Processing time <30s for 1-page PDFs

## Next Steps

After successful deployment:
1. Test with various PDF types (invoices, delivery tickets, emails)
2. Monitor costs on OpenAI dashboard
3. Collect user feedback
4. Plan for optimization and scaling
5. Document any issues and solutions

---

**Last Updated:** November 2025  
**Related Docs:**
- [VERCEL_TIMEOUT_FIX.md](./VERCEL_TIMEOUT_FIX.md) - Technical details
- [VERCEL_ENV_VARS.md](./VERCEL_ENV_VARS.md) - Environment variable reference

