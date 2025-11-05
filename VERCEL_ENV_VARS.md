# Environment Variables for Vercel Deployment

## Required for Vercel OCR to Work

Add these to your Vercel project environment variables:

### OpenAI Configuration
```bash
# Required
OPENAI_API_KEY=sk-...

# Optional - adjust based on your Vercel plan
OPENAI_TIMEOUT_SECONDS=60  # 60s for Pro, 55s to be safe
OPENAI_MODEL_NAME=gpt-4o   # or gpt-5 if you have access
```

### Airtable Configuration
```bash
# Required
AIRTABLE_PAT=pat...
AIRTABLE_BASE_ID=app...
```

### Optional Performance Tuning
```bash
# Reduce retries to avoid timeout on slower PDFs
MAX_VISION_RETRIES=0

# Retry delay (not recommended for Vercel due to timeout constraints)
RETRY_BACKOFF_SECONDS=2

# Maximum parallel calls (not critical for single PDF processing)
MAX_PARALLEL_VISION_CALLS=1
```

## Vercel Plan Recommendations

### Hobby Plan (10s limit)
⚠️ **OCR will NOT work** - Processing takes 15-20+ seconds

**Required:** Upgrade to Pro or implement queue-based processing

### Pro Plan (60s default limit)
✅ **Works for most PDFs**

```bash
OPENAI_TIMEOUT_SECONDS=55  # Leave 5s buffer for other operations
MAX_VISION_RETRIES=0       # Disable retries to avoid timeout
```

📝 **Note:** You can increase the timeout in Vercel dashboard:
- Go to Project Settings > Functions
- Set "Function Max Duration" up to 60s

### Enterprise Plan (300s limit)
✅ **Full functionality**

```bash
OPENAI_TIMEOUT_SECONDS=90  # Or higher if needed
MAX_VISION_RETRIES=1       # Can enable retries
```

## Vercel Dashboard Configuration

1. Go to your Vercel project
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable for all environments (Production, Preview, Development)
4. Redeploy your application

## Testing Your Configuration

After deployment, test with this curl command:

```bash
# Health check
curl https://your-app.vercel.app/api/ocr2/process

# Should return:
{
  "status": "healthy",
  "service": "OCR2",
  "configuration": {
    "maxFileSize": "32MB",
    "model": "gpt-4o",
    "nativePDFSupport": true
  }
}
```

## Troubleshooting

### "Function invocation timed out"
- Check your Vercel plan limits
- Reduce `OPENAI_TIMEOUT_SECONDS`
- Set `MAX_VISION_RETRIES=0`
- Verify `maxDuration` is set in route files

### "OpenAI API timeout"
- Increase `OPENAI_TIMEOUT_SECONDS` (if within Vercel limits)
- Check if PDF is too large
- Verify OpenAI API is responding

### "Configuration error"
- Ensure all required env vars are set
- Check that `OPENAI_API_KEY` starts with "sk-"
- Verify `AIRTABLE_PAT` starts with "pat"
- Confirm `AIRTABLE_BASE_ID` starts with "app"

## Quick Reference

| Setting | Hobby | Pro | Enterprise |
|---------|-------|-----|------------|
| Max Duration | 10s ❌ | 60s ✅ | 300s ✅ |
| OPENAI_TIMEOUT_SECONDS | N/A | 55 | 90 |
| MAX_VISION_RETRIES | N/A | 0 | 1 |
| Works with OCR? | No | Yes | Yes |

---

**Last Updated:** November 2025  
**Related Docs:** [VERCEL_TIMEOUT_FIX.md](./VERCEL_TIMEOUT_FIX.md)

