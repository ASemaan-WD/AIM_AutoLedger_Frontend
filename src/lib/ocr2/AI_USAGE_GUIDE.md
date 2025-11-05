# OCR2 AI Usage Guide

## ⚠️ DEPRECATED - See NATIVE_PDF_IMPLEMENTATION.md

**This guide describes the old v1.0 image-based implementation.**  
**For the new v2.0 native PDF implementation, see: `NATIVE_PDF_IMPLEMENTATION.md`**

---

## Purpose
Extract text from PDF documents using OpenAI Vision API with intelligent chunking and parallel processing.

## Core Function (DEPRECATED - Use Native Implementation)
```typescript
// ❌ OLD (deprecated, moved to quarantine)
import { processPDFFromURL } from '@/lib/ocr2/orchestrator-clean';

// ✅ NEW (recommended)
import { processPDFFromURL } from '@/lib/ocr2/orchestrator-native';

// Input: PDF URL (HTTP, data URI, or file://)
// Output: Extracted text as string
const result = await processPDFFromURL(url);
const text = result.extractedText;
```

## API Endpoints

### Health Check
```bash
GET /api/ocr2/test
# Returns: {"status": "healthy", "configuration": {...}}
```

### Process Document
```bash
POST /api/ocr2/process
Content-Type: application/json

{
  "record_id": "string",
  "file_url": "https://example.com/document.pdf"
}

# Returns: {"status": "success", "extracted_text_length": 1234, ...}
```

## What It Does
1. Downloads PDF from URL
2. Converts to images (300 DPI for optimal quality)
3. Intelligently chunks large images (2048px max, shortest side 768px, 5% overlap)
4. Processes up to 5 chunks in parallel with OpenAI Vision (high detail mode)
5. Returns complete text with page breaks

## Features
- **Multi-page support**: Handles PDFs with multiple pages
- **Smart chunking**: Splits wide/tall images automatically
- **Parallel processing**: 5x faster with concurrent API calls
- **Error recovery**: Graceful handling of failed chunks
- **Memory efficient**: Cleans up temporary files

## Configuration
Environment variables in `.env.local`:
```bash
OPENAI_API_KEY=sk-your-key-here
```

## Performance
- Typical processing: 15-30 seconds per page
- Token usage: ~1000-3000 tokens per page
- Speedup: 2-5x with parallel processing





