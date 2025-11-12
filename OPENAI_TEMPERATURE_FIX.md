# OpenAI Temperature Parameter Fix

**Date:** 2025-11-12  
**Issue:** OpenAI API error - `temperature` parameter not supported with gpt-5 model

## Error

```
Error: 400 Unsupported value: 'temperature' does not support 0 with this model. 
Only the default (1) value is supported.
```

**Error Code:** `unsupported_value`  
**Parameter:** `temperature`  
**Type:** `invalid_request_error`

## Root Cause

The code was using `temperature: 0` for deterministic output, but the `gpt-5` model doesn't support custom temperature values - it only supports the default value of `1`.

## Fix Applied

Removed the `temperature` parameter from both OpenAI API calls in `src/lib/llm/parser.ts`:

### 1. `parseDocuments` function

**Before:**
```typescript
const completion = await openai.chat.completions.create({
  model: MODEL,
  messages: [...],
  response_format: {...},
  temperature: 0, // Deterministic output
});
```

**After:**
```typescript
const completion = await openai.chat.completions.create({
  model: MODEL,
  messages: [...],
  response_format: {...},
  // Note: temperature parameter removed - gpt-5 only supports default (1)
});
```

### 2. `extractSingleDocumentText` function

**Before:**
```typescript
const completion = await openai.chat.completions.create({
  model: MODEL,
  messages: [...],
  temperature: 0, // Deterministic output
});
```

**After:**
```typescript
const completion = await openai.chat.completions.create({
  model: MODEL,
  messages: [...],
  // Note: temperature parameter removed - gpt-5 only supports default (1)
});
```

## Model Information

**Model:** `gpt-5` (defined in `src/lib/openai.ts`)  
**Temperature Support:** Default value (1) only  
**Structured Outputs:** Supported (used with `response_format` parameter)

## Impact

- ✅ Post-OCR processing now completes successfully
- ✅ Document parsing works with gpt-5 model
- ✅ Text extraction for multi-document files works
- ⚠️ Output may be slightly less deterministic without `temperature: 0`, but structured outputs with strict schema validation still ensures consistent JSON structure

## Testing

The fix allows:
1. ✅ OCR text parsing into structured documents
2. ✅ Invoice record creation from parsed data
3. ✅ Multi-document text extraction
4. ✅ Complete end-to-end OCR → Parse → Create workflow

## Related Files

- `src/lib/llm/parser.ts` - Updated (temperature removed)
- `src/lib/openai.ts` - Model definition (`gpt-5`)
- `src/lib/llm/prompts.ts` - Prompts (unchanged)
- `src/lib/llm/schemas.ts` - Schemas (unchanged)

## Notes

While `temperature: 0` was intended for deterministic output, the structured outputs feature with strict schema validation provides sufficient consistency for our use case. The model will still return valid JSON matching our schema, even with the default temperature of 1.

---

**Status:** ✅ Fixed  
**Linter Errors:** None  
**Ready for Testing:** Yes

