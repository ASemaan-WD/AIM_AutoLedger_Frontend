# Airtable Schema Management Scripts

These scripts help you keep your frontend code in sync with your Airtable base schema.

## Prerequisites

```bash
# Install dependencies (if not already installed)
npm install dotenv  # optional, for .env file support
```

Make sure you have these environment variables set in your `.env` file:
```env
VITE_AIRTABLE_PAT=your_personal_access_token
VITE_AIRTABLE_BASE_ID=your_base_id
```

## Usage

### Step 1: Fetch Schema from Airtable

```bash
node scripts/fetch-airtable-schema.js
```

This will:
- Connect to Airtable API
- Fetch complete schema (tables, fields, types)
- Save to `airtable-schema.json`
- Display summary of your base structure

**Output:** `airtable-schema.json` in the project root

### Step 2: Generate TypeScript Types

```bash
node scripts/generate-schema-types.js
```

This will:
- Read `airtable-schema.json`
- Generate TypeScript constants
- Update `src/lib/airtable/schema-types.ts`
- Create backup of old file

**Output:** Updated `src/lib/airtable/schema-types.ts`

## Quick Start (Run Both)

```bash
# Fetch and generate in one go
node scripts/fetch-airtable-schema.js && node scripts/generate-schema-types.js
```

## What Gets Generated

The `schema-types.ts` file includes:

### 1. **FIELD_IDS** - Field IDs for API calls
```typescript
export const FIELD_IDS = {
  FILES: {
    FILEID: 'fld4aUSAm9rH0gPYt',
    FILENAME: 'fld7E1dvgRISwW0Pt',
    STATUS: 'fldV1n0WIjvaQVFjz',
    PROCESSING_STATUS: 'fldXXXXXXXXXXXXXX', // If exists in Airtable
    // ... more fields
  },
  INVOICES: {
    // ... invoice fields
  },
  // ... more tables
}
```

### 2. **TABLE_IDS** - Table IDs
```typescript
export const TABLE_IDS = {
  FILES: 'tblXXXXXXXXXXXXXX',
  INVOICES: 'tblYYYYYYYYYYYYYY',
  // ... more tables
}
```

### 3. **TABLE_NAMES** - Human-readable names
```typescript
export const TABLE_NAMES = {
  FILES: 'Files',
  INVOICES: 'Invoices',
  // ... more tables
}
```

### 4. **FIELD_NAMES** - Human-readable field names
```typescript
export const FIELD_NAMES = {
  FILES: {
    FILEID: 'FileID',
    FILENAME: 'FileName',
    STATUS: 'Status',
    PROCESSING_STATUS: 'Processing-Status',
    // ... more fields
  },
  // ... more tables
}
```

## Important Notes

### ⚠️ Manual Review Required

After running the scripts:

1. **Review the generated file** - Check for any unexpected changes
2. **Check for new fields** - You may need to add them to your TypeScript interfaces
3. **Check for removed fields** - Update your code if fields were deleted
4. **Test your app** - Ensure everything still works

### 🔄 When to Run These Scripts

Run these scripts when:
- You add new fields to Airtable
- You rename fields in Airtable
- You add new tables
- You delete or modify field types
- Starting work on the project (to ensure sync)

### 📁 Files Created/Modified

- `airtable-schema.json` - Raw schema data (gitignored, generated)
- `src/lib/airtable/schema-types.ts` - TypeScript constants (committed to git)
- `src/lib/airtable/schema-types.backup-TIMESTAMP.ts` - Backup files (gitignored)

### 🚨 Common Issues

**"VITE_AIRTABLE_PAT not found"**
- Make sure your `.env` file exists
- Check that the variable is named correctly
- Try passing as command line argument: `node scripts/fetch-airtable-schema.js YOUR_PAT YOUR_BASE_ID`

**"Processing-Status field not found"**
- You need to manually add this field to your Airtable Files table
- Field type: Single select
- Options: UPL, DETINV, PARSE, RELINV, MATCHING, MATCHED, ERROR
- See FLOW_CHANGES_SUMMARY.md for details

**Generated file breaks TypeScript**
- Check the backup file created before generation
- The script preserves your custom status constants
- You may need to manually update TypeScript interfaces if field types changed

## Alternative: Manual Update

If you prefer not to use scripts, you can manually update the schema:

1. Open Airtable base
2. Go to "Automations" → "Data API" → "Base schema"
3. Copy field IDs and update `src/lib/airtable/schema-types.ts`

## Add to package.json (Optional)

```json
{
  "scripts": {
    "schema:fetch": "node scripts/fetch-airtable-schema.js",
    "schema:generate": "node scripts/generate-schema-types.js",
    "schema:update": "node scripts/fetch-airtable-schema.js && node scripts/generate-schema-types.js"
  }
}
```

Then run: `npm run schema:update`

