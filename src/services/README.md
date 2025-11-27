# API Services

This directory contains all frontend API calling logic. These services will communicate with Azure Functions.

## Service Files

### `api.ts` - Base API Utilities
Core functionality for all API calls:
- `apiFetch<T>()` - Base fetch wrapper with error handling
- `ApiException` - Custom error class

### `upload-service.ts` - File Upload
```typescript
import { uploadFile } from '@/services/upload-service';

const response = await uploadFile(file);
// Returns: UploadResponse with success, url, airtableRecord, etc.
```

**Endpoint:** `POST /api/upload`

### `airtable-service.ts` - Airtable CRUD
```typescript
import {
  listRecords,
  getRecord,
  createRecords,
  updateRecords,
  deleteRecords
} from '@/services/airtable-service';

// List records
const files = await listRecords('Files', {
  baseId: 'appXXX',
  filter: 'Status = "Queued"',
  sort: [{ field: 'CreatedDate', direction: 'desc' }]
});

// Get single record
const record = await getRecord('Files', 'recXXX', 'appXXX');

// Create records
const created = await createRecords('Files', {
  records: [{ fields: { FileName: 'test.pdf' } }],
  baseId: 'appXXX'
});

// Update records
const updated = await updateRecords('Files', {
  records: [{ id: 'recXXX', fields: { Status: 'Processed' } }],
  baseId: 'appXXX'
});

// Delete records
const deleted = await deleteRecords('Files', {
  ids: ['recXXX'],
  baseId: 'appXXX'
});
```

**Endpoints:**
- `GET /api/airtable/[table]` - List records
- `GET /api/airtable/[table]/[recordId]` - Get record
- `POST /api/airtable/[table]` - Create records
- `PATCH /api/airtable/[table]` - Update records
- `DELETE /api/airtable/[table]` - Delete records

### `invoice-service.ts` - Invoice Operations
```typescript
import { matchInvoice, parseInvoice } from '@/services/invoice-service';

// Trigger PO matching
const result = await matchInvoice('recInvoiceXXX');
// Returns: POMatchingResponse with headers and details

// Parse invoice from raw text
const parsed = await parseInvoice('recFileXXX', rawText);
// Returns: ParserResponse with parsed data and invoice record ID
```

**Endpoints:**
- `POST /api/match-invoice` - PO matching
- `POST /api/parser3` - Invoice parsing

### `ocr-service.ts` - OCR Operations
```typescript
import { processOCR, processPostOCR } from '@/services/ocr-service';

// Trigger OCR processing
const ocrResult = await processOCR('recFileXXX');
// Returns: OCRResponse with extracted text info

// Trigger post-OCR processing
const postOcrResult = await processPostOCR('recFileXXX');
// Returns: PostOCRResponse
```

**Endpoints:**
- `POST /api/ocr3` - OCR processing
- `POST /api/post-ocr/process` - Post-OCR processing

## Usage Patterns

### Error Handling
```typescript
import { ApiException } from '@/services';

try {
  const result = await uploadFile(file);
} catch (error) {
  if (error instanceof ApiException) {
    console.error('API Error:', error.message, error.status);
  }
}
```

### TypeScript Support
All services are fully typed:
```typescript
import type { UploadResponse } from '@/services/upload-service';
import type { AirtableRecord } from '@/services/airtable-service';
```

## Azure Functions Implementation

Each endpoint needs to be implemented as an Azure Function that matches these interfaces.

### Example: Upload Function
```typescript
// Azure Function: POST /api/upload
export async function upload(req: HttpRequest): Promise<HttpResponseInit> {
  const formData = await req.formData();
  const file = formData.get('file');
  
  // 1. Upload to Vercel Blob
  // 2. Create Airtable record
  // 3. Return UploadResponse
  
  return {
    jsonBody: {
      success: true,
      url: blobUrl,
      airtableRecord: { id: recordId, fields: {...} }
    }
  };
}
```

## Environment Variables

Required in `.env`:
```env
VITE_API_BASE_URL=http://localhost:7071/api
VITE_AIRTABLE_BASE_ID=your_base_id
VITE_AIRTABLE_PAT=your_pat
```

## Development Proxy

In development, Vite proxies `/api/*` to Azure Functions:
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_BASE_URL || 'http://localhost:7071',
      changeOrigin: true,
    },
  },
}
```

## Testing

Test services with mock Azure Functions:
```typescript
// Mock response
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
  })
);

const result = await uploadFile(mockFile);
expect(result.success).toBe(true);
```

## Adding New Services

1. Create service file in `src/services/`
2. Define request/response types
3. Implement service functions using `apiFetch()`
4. Export from `src/services/index.ts`
5. Implement matching Azure Function

Example:
```typescript
// src/services/report-service.ts
import { apiFetch } from './api';

export interface ReportRequest {
  startDate: string;
  endDate: string;
}

export interface ReportResponse {
  data: unknown[];
}

export async function generateReport(
  request: ReportRequest
): Promise<ReportResponse> {
  return apiFetch<ReportResponse>('/reports/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
```

## Best Practices

1. **Keep services thin** - They should only handle HTTP requests
2. **Use TypeScript** - Define all request/response types
3. **Error handling** - Let `apiFetch` handle errors consistently
4. **No business logic** - Business logic belongs in hooks/utilities
5. **Document endpoints** - Add comments for Azure Functions implementers

## Support

For issues or questions about services:
1. Check the TypeScript types for expected formats
2. Review Azure Functions implementation
3. Check network tab in browser DevTools
4. Verify environment variables are set

