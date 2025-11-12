# PO Matching Changes - Quick Reference

## Overview
Updates to the PO matching system to handle User-Id, CuryMultDiv, PPV fields, and status management.

---

## 1. POInvoiceHeader: User-Id Hard-Coded

**File:** `src/lib/po-matching/airtable-creator.ts` (line 73)

```typescript
// Hard-code User-Id to "test-user" for now
headerFields['User-Id'] = 'test-user';
```

**Result:** Every POInvoiceHeader will have `User-Id = "test-user"`

---

## 2. POInvoiceHeader: CuryMultDiv Removed

**Files Modified:**
- `src/lib/po-matching/airtable-creator.ts` (line 61 - removed from array)
- `src/lib/po-matching/openai-matcher.ts` (line 143 - removed from prompt)
- `src/lib/types/po-matching.ts` (lines 63, 97, 114 - removed from schema)

**Result:** CuryMultDiv field will always be empty/null in POInvoiceHeaders

---

## 3. POInvoiceDetail: PPV Fields Added

**File:** `src/lib/po-matching/airtable-creator.ts` (lines 36-37, 134-135)

```typescript
// Extract from matchPayload
const vendorPPVAcct = matchPayload?.vendor?.ppvVoucheredAcct;
const vendorPPVSubAcct = matchPayload?.vendor?.ppvVoucheredSubAcct;

// Populate in detail records
if (vendorPPVAcct) detailFields['PPV-Vouchered-Acct'] = vendorPPVAcct;
if (vendorPPVSubAcct) detailFields['PPV-Vouchered-SubAcct'] = vendorPPVSubAcct;
```

**Source Data:**
- `matchPayload.vendor.ppvVoucheredAcct` → `PPV-Vouchered-Acct`
- `matchPayload.vendor.ppvVoucheredSubAcct` → `PPV-Vouchered-SubAcct`

**Result:** All POInvoiceDetails will have PPV account fields populated from vendor data

---

## 4. Invoice: Status Management

**File:** `src/lib/po-matching/processor.ts` (lines 94-135)

### Status Logic

| Condition | Status | ErrorCode | Error Description |
|-----------|--------|-----------|-------------------|
| No matches at all | `"Error"` | `"NO_MATCH"` | Not set |
| At least 1 match, no errors | `"Matched"` | Not set | Not set |
| At least 1 match, with errors | `"Matched"` | Not set | Populated with error text |

### Key Points
- **Status = "Matched"** takes precedence if ANY detail records are created
- **Status = "Error"** only when zero detail records are created
- **Error Description** can be present even when Status = "Matched"
- **ErrorCode = "NO_MATCH"** only set when Status = "Error" and no matches found

### Code Flow
```typescript
const hasMatches = detailIds.length > 0;
const hasError = gptResponse.error && gptResponse.error.trim() !== '';

if (!hasMatches) {
  updateFields['Status'] = 'Error';
  updateFields['ErrorCode'] = 'NO_MATCH';
} else {
  updateFields['Status'] = 'Matched';
}

if (hasError) {
  updateFields['Error Description'] = gptResponse.error;
}
```

---

## Example Scenarios

### Scenario 1: Perfect Match
- Invoice has 3 line items
- All 3 match PO receipts
- **Result:**
  - Status: `"Matched"`
  - POInvoiceDetails: 3 records created
  - Error Description: empty
  - User-Id: `"test-user"`
  - CuryMultDiv: empty
  - PPV fields: populated from vendor

### Scenario 2: No Matches
- Invoice has 3 line items
- None match any PO receipts
- **Result:**
  - Status: `"Error"`
  - ErrorCode: `"NO_MATCH"`
  - POInvoiceDetails: 0 records created
  - Error Description: "No matches found for any invoice line items"

### Scenario 3: Partial Match
- Invoice has 3 line items
- 2 match PO receipts, 1 doesn't match
- **Result:**
  - Status: `"Matched"` (because 2 matches exist)
  - POInvoiceDetails: 2 records created
  - Error Description: "Line item 3 (ITEM-999) could not be matched to any PO receipt"
  - User-Id: `"test-user"`
  - CuryMultDiv: empty
  - PPV fields: populated from vendor

---

## Testing Checklist

- [ ] Verify User-Id is always "test-user" in POInvoiceHeaders
- [ ] Verify CuryMultDiv is always empty in POInvoiceHeaders
- [ ] Verify PPV-Vouchered-Acct is populated in POInvoiceDetails
- [ ] Verify PPV-Vouchered-SubAcct is populated in POInvoiceDetails
- [ ] Test Status = "Matched" when all lines match
- [ ] Test Status = "Matched" when some lines match
- [ ] Test Status = "Error" with ErrorCode = "NO_MATCH" when no lines match
- [ ] Verify Error Description is populated for partial matches
- [ ] Check that OpenAI no longer tries to populate CuryMultDiv

---

## API Usage

```bash
# Test the matcher
curl -X POST http://localhost:3000/api/match-invoice \
  -H "Content-Type: application/json" \
  -d '{"invoiceId": "recXXXXXXXXXXXXXX"}'
```

**Expected Response:**
```json
{
  "success": true,
  "headers": {
    "ids": ["recHeaderID1"],
    "count": 1
  },
  "details": {
    "ids": ["recDetailID1", "recDetailID2"],
    "count": 2
  }
}
```

After running, check the Invoice record:
- `Status` field should be "Matched" or "Error"
- `ErrorCode` field should be "NO_MATCH" if no matches
- `Error Description` field may contain partial match errors

---

## Files Modified Summary

1. ✅ `src/lib/po-matching/airtable-creator.ts` - Header User-Id, removed CuryMultDiv, added PPV fields
2. ✅ `src/lib/po-matching/processor.ts` - Status management logic
3. ✅ `src/lib/po-matching/openai-matcher.ts` - Removed CuryMultDiv from prompt
4. ✅ `src/lib/types/po-matching.ts` - Removed CuryMultDiv from schema

**Linting Status:** ✅ All files pass with no errors

