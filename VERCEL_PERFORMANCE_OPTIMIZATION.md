# Vercel Performance Optimization Guide

## Problem Summary

Local development is fast, but Vercel deployment is slow. Here's why and how to fix it.

## Root Causes

### 1. Cold Starts (2-5 seconds overhead)
- Serverless functions need to initialize on each request
- OpenAI SDK and dependencies load fresh each time
- No persistent connections

### 2. Network Latency (3-5 seconds total)
- Upload → OCR endpoint: 500-1000ms
- OCR → Download from Blob: 500-1000ms  
- OCR → Upload to OpenAI: 1-2s
- OCR → Post-OCR endpoint: 500-1000ms
- Post-OCR → Airtable: 500-1000ms

### 3. Geographic Distance
- Vercel region may be far from OpenAI servers
- Each hop adds latency

### 4. No Connection Pooling
- HTTP clients recreated on each cold start
- No keep-alive connections

### 5. Excessive Timeouts
- 300s timeout on internal fetch calls
- System waits too long before detecting failures

## Optimization Strategies

### Strategy 1: Reduce Internal HTTP Calls ⚡ HIGHEST IMPACT

**Current Flow:**
```
Upload API → (HTTP) → OCR API → (HTTP) → Post-OCR API
```

**Optimized Flow:**
```
Upload API → Direct function call → OCR logic → Direct function call → Post-OCR logic
```

**Implementation:**
- Import OCR processing function directly instead of HTTP fetch
- Eliminate 1-2 seconds of overhead per request

**Files to modify:**
- `src/app/api/upload/route.ts` - Call `processPDFFromURL` directly
- `src/app/api/ocr2/process/route.ts` - Export processing logic as function

### Strategy 2: Optimize OpenAI Client Configuration

**Add HTTP Keep-Alive:**
```typescript
import { Agent } from 'https';

const httpsAgent = new Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
});

const openaiClient = new OpenAI({
  apiKey: settings.openai.apiKey,
  baseURL: settings.openai.baseUrl,
  timeout: 60000, // 60s instead of 300s
  httpAgent: httpsAgent,
});
```

### Strategy 3: Reduce Timeouts

**Current timeouts are too generous:**
- OpenAI timeout: 300s → Reduce to 60s
- Internal fetch: 300s → Reduce to 90s
- PDF download: 60s → Keep at 60s

**Why:** Faster failure detection means quicker retries or user feedback

### Strategy 4: Enable Vercel Edge Functions (Advanced)

**Current:** Node.js runtime (slower cold starts)
**Alternative:** Edge runtime (faster cold starts, but limited APIs)

**Note:** OpenAI SDK works in Edge runtime, but some Node.js APIs don't

### Strategy 5: Optimize Vercel Region

**Check current region:**
```bash
vercel env ls
# Look for VERCEL_REGION
```

**Recommended regions for OpenAI:**
- `iad1` (US East - Virginia) - Closest to OpenAI
- `sfo1` (US West - San Francisco)

**Configure in vercel.json:**
```json
{
  "regions": ["iad1"]
}
```

### Strategy 6: Add Response Streaming

Instead of waiting for complete OCR, stream progress:
```typescript
// Return immediately with status
return NextResponse.json({ status: 'processing', recordId });

// Process in background
// Update Airtable when done
```

### Strategy 7: Implement Caching

**Cache OpenAI client instance:**
```typescript
// Use global variable to persist across warm starts
declare global {
  var openaiClient: OpenAI | undefined;
}

function getOpenAIClient(): OpenAI {
  if (!global.openaiClient) {
    global.openaiClient = new OpenAI({...});
  }
  return global.openaiClient;
}
```

## Recommended Implementation Order

### Phase 1: Quick Wins (30 minutes)
1. ✅ Reduce OpenAI timeout to 60s
2. ✅ Reduce internal fetch timeout to 90s
3. ✅ Add HTTP keep-alive to OpenAI client
4. ✅ Use global variable for client caching

**Expected improvement:** 2-3 seconds faster

### Phase 2: Architecture Changes (2 hours)
1. ✅ Remove HTTP call between upload and OCR
2. ✅ Call processing functions directly
3. ✅ Keep HTTP endpoints for manual testing

**Expected improvement:** 1-2 seconds faster

### Phase 3: Advanced (4+ hours)
1. ⏳ Implement response streaming
2. ⏳ Add progress updates via WebSocket
3. ⏳ Consider queue-based processing (Vercel Cron + Airtable)

**Expected improvement:** Better UX, not necessarily faster

## Performance Targets

### Current Performance (Vercel)
- Upload: 2-3s
- OCR: 26-28s
- Post-OCR: 5-6s
- **Total: 33-37s**

### Target Performance (After Optimization)
- Upload: 1-2s (-1s)
- OCR: 20-24s (-4s via keep-alive + timeout tuning)
- Post-OCR: 3-4s (-2s via direct call)
- **Total: 24-30s** ⚡

### Local Performance (Reference)
- Total: ~15-20s

**Note:** Vercel will always be slower than local due to cold starts and geographic distance. Target is to get within 5-10s of local performance.

## Monitoring

Add timing logs to track improvements:

```typescript
const timings = {
  start: Date.now(),
  blobUpload: 0,
  ocrStart: 0,
  ocrComplete: 0,
  postOcrComplete: 0,
};

// After each step:
timings.blobUpload = Date.now() - timings.start;
// ... etc

console.log('Performance timings:', timings);
```

## Testing

After each optimization:

1. Deploy to Vercel
2. Upload test PDF
3. Check Vercel logs for timing
4. Compare to baseline (33-37s)
5. Verify no errors introduced

## Environment Variables to Add

```bash
# Optimize OpenAI timeout
OPENAI_TIMEOUT_SECONDS=60

# Disable retries for faster failures
MAX_VISION_RETRIES=0

# Reduce internal fetch timeout
INTERNAL_API_TIMEOUT_MS=90000
```

## Next Steps

1. Review this document
2. Decide which optimizations to implement
3. Start with Phase 1 (quick wins)
4. Test and measure improvements
5. Proceed to Phase 2 if needed

---

**Expected Total Improvement:** 6-10 seconds faster (24-30s total)
**Effort:** Phase 1 = 30 min, Phase 2 = 2 hours
**Risk:** Low (all changes are backwards compatible)


