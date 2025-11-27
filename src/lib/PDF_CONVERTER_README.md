# PDF to Images Converter

## Overview

This module converts PDF files to images using **PDF.js (pdfjs-dist)** - a pure JavaScript PDF renderer.

**Features:**
- ✅ One image per page
- ✅ High quality rendering (2x scale by default)
- ✅ PNG or JPEG output
- ✅ Works in the browser
- ✅ No external services needed
- ✅ Minimal dependencies (only pdfjs-dist)

## Installation

```bash
npm install pdfjs-dist
```

Already installed in this project! ✅

## Basic Usage

```typescript
import { convertPDFToImages } from '@/lib/pdf-converter';

// Convert PDF from URL
const pdfUrl = 'https://example.com/document.pdf';
const images = await convertPDFToImages(pdfUrl);

console.log(`Converted to ${images.length} images`);
// Each image is a File object with:
// - name: "document-page-1.png"
// - type: "image/png"
// - size: [size in bytes]
```

## Advanced Usage

### Custom Scale (Quality)

```typescript
// Higher scale = better quality but larger file size
const images = await convertPDFToImages(pdfUrl, undefined, {
  scale: 3.0  // 3x scale (very high quality)
});

// Lower scale = faster processing and smaller files
const images = await convertPDFToImages(pdfUrl, undefined, {
  scale: 1.0  // 1x scale (standard quality)
});
```

### JPEG Output (Smaller Files)

```typescript
const images = await convertPDFToImages(pdfUrl, undefined, {
  format: 'jpeg',  // Use JPEG instead of PNG
  quality: 0.85    // JPEG quality (0-1)
});
```

### With Original File Metadata

```typescript
const pdfFile = /* File object from input */;
const blobUrl = URL.createObjectURL(pdfFile);

const images = await convertPDFToImages(blobUrl, pdfFile);
// Images will be named: "original-filename-page-1.png"

URL.revokeObjectURL(blobUrl); // Clean up
```

## API Reference

### `convertPDFToImages()`

```typescript
async function convertPDFToImages(
  pdfUrl: string,
  pdfFile?: File,
  options?: {
    scale?: number;           // Default: 2.0
    format?: 'png' | 'jpeg';  // Default: 'png'
    quality?: number;         // Default: 0.95 (JPEG only)
  }
): Promise<File[]>
```

**Parameters:**
- `pdfUrl` - URL of the PDF (can be Vercel Blob URL, local blob URL, or any accessible URL)
- `pdfFile` - (Optional) Original File object for metadata
- `options` - (Optional) Conversion options

**Returns:** Array of File objects (one per page)

**Throws:** Error if conversion fails

### `isPDFConverterAvailable()`

```typescript
function isPDFConverterAvailable(): boolean
```

Check if PDF.js is loaded and available.

## Integration with Upload Flow

The converter is already integrated in `src/services/upload-service.ts`:

```typescript
// 1. Upload PDF to Vercel Blob
const blobResult = await uploadToBlob(file);

// 2. Create Airtable record
const airtableResponse = await createRecords('Files', { ... });

// 3. Convert PDF to images
const images = await convertPDFToImages(blobResult.url, file);

// 4. Trigger OCR with images
const ocrResponse = await triggerOCRWithFiles(fileId, images);
```

## Performance Considerations

### File Sizes

| Scale | Format | Typical Size per Page | Use Case |
|-------|--------|----------------------|----------|
| 1.0x  | JPEG   | ~100-200 KB          | Fast preview |
| 1.5x  | PNG    | ~300-500 KB          | Standard quality |
| 2.0x  | PNG    | ~500-1000 KB         | High quality (default) |
| 3.0x  | PNG    | ~1-2 MB              | Very high quality |

### Processing Time

Typical processing times (on modern hardware):
- 1-page PDF: ~1-2 seconds
- 5-page PDF: ~3-5 seconds
- 10-page PDF: ~6-10 seconds
- 20-page PDF: ~12-20 seconds

## Error Handling

```typescript
try {
  const images = await convertPDFToImages(pdfUrl);
  console.log(`✅ Success: ${images.length} images`);
} catch (error) {
  console.error('❌ Conversion failed:', error);
  // Handle error appropriately
}
```

Common errors:
- PDF file is corrupted
- URL is not accessible
- Browser doesn't support required features
- Memory issues with very large PDFs

## Browser Compatibility

Works in all modern browsers that support:
- ✅ Canvas API
- ✅ Blob API
- ✅ Promise API
- ✅ ES6 modules

Supported browsers:
- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+

## Memory Management

For large PDFs (20+ pages), consider:

```typescript
// Process in batches to reduce memory usage
const batchSize = 5;
for (let i = 0; i < totalPages; i += batchSize) {
  // Process batch
  await processBatch(i, Math.min(i + batchSize, totalPages));
}
```

**Note:** Currently, the converter processes all pages at once. For very large PDFs, you may need to implement batching.

## Configuration

### Worker Configuration

The PDF.js worker is loaded from CDN:

```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
```

**Why CDN?**
- ✅ No bundling issues
- ✅ Automatically matches PDF.js version
- ✅ Cached across sites
- ✅ Smaller build size

**Alternative (local worker):**
```typescript
// If you want to bundle the worker:
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
```

## Troubleshooting

### "Failed to load worker"
- Check internet connection (worker loads from CDN)
- Or use local worker (see Configuration above)

### "Cannot read property 'getContext' of null"
- Canvas API not supported
- Check browser compatibility

### "Out of memory"
- PDF too large
- Reduce scale or implement batching

### Images are blurry
- Increase scale (e.g., 2.0 → 3.0)
- Use PNG instead of JPEG

### File sizes too large
- Reduce scale
- Use JPEG with lower quality
- Compress images after conversion

## Examples

See `pdf-converter.test-example.ts` for complete examples including:
- Converting from URL
- Converting from File object
- Custom options
- Error handling
- Integration with upload flow

## Related Files

- `src/lib/pdf-converter.ts` - Main implementation
- `src/services/upload-service.ts` - Integration with upload flow
- `src/lib/pdf-converter.test-example.ts` - Usage examples

## Further Reading

- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [File API](https://developer.mozilla.org/en-US/docs/Web/API/File)

