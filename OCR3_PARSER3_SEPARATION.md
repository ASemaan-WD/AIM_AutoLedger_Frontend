# OCR3 and Parser3 Separation

## Overview
OCR3 no longer triggers parser3 directly. Airtable automations handle the parser3 trigger when the Raw-Text field is updated.

## Flow

### 1. OCR3 Process (API Route)
```
User uploads file → OCR3 triggered
↓
1. Set File Status to "Processing"
2. Extract text from PDF using OpenAI
3. Update "Raw-Text" field in Airtable
4. Status remains "Processing"
5. Return success
```

### 2. Airtable Automation
```
Raw-Text field updated → Airtable automation triggered
↓
1. Automation calls parser3 endpoint
2. parser3 creates Invoice record
3. parser3 updates File Status to "Processed"
```

## What Changed

### Before
- OCR3 called parser3 directly (double calling risk)
- OCR3 could change status to "Processed"

### After
- OCR3 only updates Raw-Text field
- OCR3 never changes status from "Processing"
- Airtable automation is the ONLY trigger for parser3
- parser3 is responsible for updating status to "Processed"

## File Status Flow

| Step | Status | Updated By |
|------|--------|------------|
| Initial upload | (no status) | Upload process |
| OCR starts | "Processing" | OCR3 |
| OCR completes | "Processing" | (unchanged) |
| Raw-Text updated | "Processing" | (unchanged) |
| Airtable automation triggers | "Processing" | (unchanged) |
| parser3 creates invoice | "Processed" | parser3 |

## Benefits

1. **No double calling** - parser3 is only called once via Airtable automation
2. **Clear separation** - OCR3 does OCR, parser3 does parsing
3. **Airtable-driven** - Automation controls the workflow
4. **Status integrity** - Only parser3 marks files as "Processed"

## Code Changes

### `/src/app/api/ocr3/route.ts`
- Removed lines 255-291 (parser3 call)
- Status remains "Processing" after OCR completion
- Added log message indicating Airtable automation will handle parser3

### Status Updates by Route
- `ocr3`: Sets status to "Processing" (start only)
- `parser3`: Sets status to "Processed" (completion only)
- Airtable automation: Triggers parser3 when Raw-Text is updated

## Testing Checklist

- [ ] Upload a PDF file
- [ ] Verify status changes to "Processing"
- [ ] Wait for OCR to complete
- [ ] Verify Raw-Text field is populated
- [ ] Verify status is still "Processing"
- [ ] Verify Airtable automation triggers parser3
- [ ] Verify Invoice is created
- [ ] Verify File status changes to "Processed"
- [ ] Verify parser3 is only called once (check logs)

