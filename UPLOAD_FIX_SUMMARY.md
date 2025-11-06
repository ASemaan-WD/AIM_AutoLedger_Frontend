# Upload Fix Summary

## Problem Identified

The file upload functionality was failing because you duplicated the project and changed to a new Airtable database. The code was still using **old field names** from the original database that don't exist in the new database schema.

## Root Cause

When creating records in the Files table, the code was using field names that no longer exist:

### Field Name Changes:
| Old Field Name | New Field Name | Status |
|---------------|----------------|--------|
| `Name` | `FileName` | ✅ Renamed |
| `Source` | *(removed)* | ❌ Field deleted |
| `File Hash` | `FileHash` | ✅ Renamed (space removed) |
| `Upload Date` | `UploadDate` | ✅ Renamed (space removed) |

## Files Fixed

### 1. `/src/app/api/upload/route.ts`
**Problem:** Using old field names when creating Airtable records
**Fix:** Updated to use new field names:
- `'Name'` → `'FileName'`
- Removed `'Source': 'Upload'` (field doesn't exist)
- `'File Hash'` → `'FileHash'`
- Added `'UploadDate'` field

### 2. `/src/lib/duplicate-detection.ts`
**Problem:** Using old field names in Airtable queries
**Fix:** Updated all Airtable queries:
- `{File Hash}` → `{FileHash}` in filter formulas
- `'Name'` → `'FileName'` in field lists
- `'Upload Date'` → `'UploadDate'` in field lists
- Removed `'Source'` from field queries

### 3. `/src/lib/airtable/files-hooks.ts`
**Problem:** Trying to update Source field that doesn't exist
**Fix:** Commented out Source field update since it was removed in new schema

## Testing Instructions

1. **Start the dev server:**
```bash
npm run dev
```

2. **Test file upload:**
   - Navigate to `/upload` page
   - Drop or select a PDF file
   - Watch the upload progress
   - Check console logs for any errors

3. **Verify in Airtable:**
   - Go to your Files table in Airtable
   - Confirm new record was created with:
     - ✅ FileName populated
     - ✅ FileHash populated
     - ✅ UploadDate populated
     - ✅ Status = "Queued"
     - ✅ Attachments array with file

4. **Test duplicate detection:**
   - Try uploading the same file twice
   - Second upload should show Status = "Attention"
   - Error Code should be "DUPLICATE_FILE"

## What Should Work Now

✅ **File Upload** - Files should upload to Vercel Blob and create Airtable records
✅ **Duplicate Detection** - Duplicate files should be detected and marked
✅ **OCR Processing** - PDF files should trigger OCR processing
✅ **Status Updates** - File status should update correctly in Airtable

## Common Issues to Watch For

### Issue: "Field not found" error
**Cause:** Still using old field name somewhere
**Fix:** Check the field name matches the new schema exactly (case-sensitive)

### Issue: Upload succeeds but no Airtable record
**Cause:** Missing or incorrect `AIRTABLE_BASE_ID` in `.env.local`
**Fix:** Verify your `.env.local` has the correct base ID for your new database

### Issue: Duplicate detection not working
**Cause:** FileHash field not being set
**Fix:** Verify file hash generation is working (check console logs)

## Environment Variables Required

Make sure your `.env.local` has:
```bash
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX  # Your new base ID
AIRTABLE_PAT=your_personal_access_token
BLOB_READ_WRITE_TOKEN=vercel_blob_token
OPENAI_API_KEY=sk-your-api-key  # For OCR
```

## Next Steps

If uploads are still not working after these fixes:

1. **Check server logs** - Look for specific error messages
2. **Verify schema** - Run `npm run fetch-schema` to confirm field names
3. **Test Airtable connection** - Try `/api/ocr2/test` endpoint
4. **Check permissions** - Verify your Airtable PAT has write access

## Schema Reference

See these files for complete schema documentation:
- `latest_schema.json` - Raw Airtable schema
- `AIRTABLE_MIGRATION_MAPPING.md` - Old → New field mappings
- `src/lib/airtable/schema-types.ts` - TypeScript type definitions

---

**Last Updated:** November 3, 2025
**Status:** ✅ Fixed - Ready for testing





