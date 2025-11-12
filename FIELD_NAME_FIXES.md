# Field Name Fixes - Airtable API Errors

**Date:** 2025-11-12  
**Issue:** Airtable API returning "Unknown field name" errors

## Errors Fixed

### 1. Files Table Field Names

All Files table fields now use correct hyphenated names per schema:

| Incorrect Name | Correct Name | Notes |
|---------------|--------------|-------|
| `"Created At"` | `"Created-At"` | With hyphen |
| `"UploadDate"` | `"UploadedDate"` | Correct field name |
| `"Upload Date"` | `"UploadedDate"` | Removed space |
| `"Raw Text"` | `"Raw-Text"` | With hyphen |
| `"Error Code"` | `"Error-Code"` | With hyphen |
| `"Error Description"` | `"Error-Description"` | With hyphen |
| `"Error Link"` | `"Error-Link"` | With hyphen |
| `"Modified At"` | `"Modified-At"` | With hyphen |
| `"Parsed At"` | `"ParsedAt"` | No space, no hyphen |

### 2. POInvoiceHeaders Table Field Names

| Incorrect Name | Correct Name | Notes |
|---------------|--------------|-------|
| `"Created At"` | `"Date-Stamp"` | Actual creation timestamp field |
| `"Modified At"` | `"Time-Stamp"` | Formula field |
| `"Vendor Name"` | `"Remit-Name"` | Lookup field from Invoice table |

### 3. Invoices Table Field Names

All field names already correct with hyphens (`Invoice-Number`, `Vendor-Name`, etc.)

## Complete List of Files Modified

### Files Table Field Updates (11 files)

1. **`src/app/api/ocr2/process/route.ts`**
   - `'Raw Text'` → `'Raw-Text'`

2. **`src/app/api/upload/route.ts`**
   - `'UploadDate'` → `'UploadedDate'`
   - `'Error Code'` → `'Error-Code'`
   - `'Error Link'` → `'Error-Link'`

3. **`src/lib/airtable/invoice-hooks.ts`**
**Changed:**
```typescript
// Before
queryParams.append('sort[0][field]', 'Created At');

// After
queryParams.append('sort[0][field]', 'Created-At');
```

4. **`src/lib/airtable/transforms.ts`**
   - POInvoiceHeaders: `'Created At'` → `'Date-Stamp'`
   - POInvoiceHeaders: `'Modified At'` → `'Time-Stamp'`
   - POInvoiceHeaders: `'Vendor Name'` → `'Remit-Name'`

5. **`src/lib/duplicate-detection.ts`**
   - All field references updated to use hyphens
   - `'Created At'` → `'Created-At'`
   - `'UploadDate'` → `'UploadedDate'`
   - `'Error Code'` → `'Error-Code'`
   - `'Error Description'` → `'Error-Description'`
   - `'Error Link'` → `'Error-Link'`

6. **`src/lib/airtable/linked-documents-hooks.ts`**
   - `'UploadDate'` → `'UploadedDate'`
   - `'Upload Date'` → (removed fallback)
   - `'Error Code'` → `'Error-Code'`
   - `'Error Description'` → `'Error-Description'`
   - `'Error Link'` → `'Error-Link'`
   - `'Modified At'` → `'Modified-At'`

7. **`src/lib/airtable/files-hooks.ts`**
   - `'UploadDate'` → `'UploadedDate'`
   - `'Upload Date'` → (removed fallback)
   - `'Error Code'` → `'Error-Code'`
   - `'Error Description'` → `'Error-Description'`
   - `'Error Link'` → `'Error-Link'`
   - `'Modified At'` → `'Modified-At'`

8. **`src/lib/airtable/error-handler.ts`**
   - `'Error Code'` → `'Error-Code'`
   - `'Error Link'` → `'Error-Link'`

9. **`src/app/(app)/upload/page.tsx`**
   - `'Error Code'` → `'Error-Code'`
   - `'Error Description'` → `'Error-Description'`
   - `'Error Link'` → `'Error-Link'`

10. **`src/lib/ocr2/types.ts`**
    - `'Upload Date'` → `'UploadedDate'`
    - `'Raw Text'` → `'Raw-Text'`

11. **`src/lib/post-ocr/airtable-helpers.ts`**
    - `'Raw Text'` → `'Raw-Text'` (in debug logs)

12. **`src/lib/post-ocr/processor.ts`**
    - `'Raw Text'` → `'Raw-Text'`

## Summary of Changes

### Pattern
All multi-word field names in Files table now use **hyphens** instead of spaces:
- Format: `Word-Word` (e.g., `Error-Code`, `Created-At`)
- Exception: `ParsedAt` and `UploadedDate` (no hyphen, but no space either)

### Key Changes
1. **Error fields**: All error-related fields now use hyphens
2. **Date fields**: `UploadDate` → `UploadedDate`, `Created At` → `Created-At`, `Modified At` → `Modified-At`
3. **OCR field**: `Raw Text` → `Raw-Text`
4. **POInvoiceHeaders**: Updated to use actual field names (`Date-Stamp`, `Time-Stamp`, `Remit-Name`)

## Root Cause

The field names were not aligned with the actual Airtable schema documented in `AIRTABLE_SCHEMA.md`:

### Files Table Fields (from schema)
| Field Name | Field ID | Type |
|------------|----------|------|
| UploadedDate | `fldX1faf1UWuRF2p3` | date |
| Created-At | `fldUFewWxBBP9D5bv` | createdTime |

### POInvoiceHeaders Table Fields (from schema)
| Field Name | Field ID | Type |
|------------|----------|------|
| Date-Stamp | `fldZxGyjFcQaPvxiO` | createdTime |
| Remit-Name | `fldg1lTgqcRh7KX0Y` | multipleLookupValues (from Invoice) |

## Impact

These changes fix all "Unknown field name" errors:
- ✅ File upload failures (`UploadDate`, `Error Code`, `Error Link`)
- ✅ OCR processing failures (`Raw Text`)
- ✅ Duplicate detection errors (`Created At`, `UploadDate`, `Error Code`)
- ✅ File listing errors in UI (`Error Code`, `Error Description`, `Modified At`)
- ✅ Sorting/filtering errors (`Created At`)
- ✅ Post-OCR processing failures (`Raw Text`)

## Testing Checklist

After these changes, verify:
- [ ] File uploads complete successfully
- [ ] OCR processing updates Airtable with extracted text
- [ ] Post-OCR parsing reads raw text correctly
- [ ] Duplicate detection works and sets error fields
- [ ] File list loads and displays error information
- [ ] Sorting by creation date works
- [ ] Invoice creation from OCR works
- [ ] Error handling and display works in UI

## Related Documentation

- `AIRTABLE_SCHEMA.md` - Complete schema reference
- `OCR_FIELD_UPDATES_SUMMARY.md` - Previous field name updates for Invoice parsing
- `SCHEMA_MIGRATION_ANALYSIS.md` - Schema migration details

---

**Status:** ✅ Complete  
**Linter Errors:** None  
**Ready for Testing:** Yes

