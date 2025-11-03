# Invoice Status Mapping - CORRECTED

## Status Mapping (Airtable ↔ Frontend)

| Airtable Status | Internal Status | Display Name | Edit Allowed? | Color |
|-----------------|-----------------|--------------|---------------|-------|
| **Pending** | `pending` | Pending | ❌ No | Warning (Yellow) |
| **Matched** | `open` | Matched | ✅ **Yes** | Blue-light |
| **Reviewed** | `reviewed` | Reviewed | ❌ No | Success (Green) |
| **Exported** | `exported` | Exported | ❌ No | Brand (Purple) |
| **Error** | `rejected` | Error | ❌ No | Error (Red) |

## Key Points

1. **Display Names Match Airtable Exactly**
   - What you see in Airtable is what you see in the UI
   - No more confusing mappings!

2. **Only "Matched" Status Allows Editing**
   - Maps to internal `open` status
   - Shows "Save" and "Mark as Reviewed" buttons
   - All other statuses are read-only

3. **Status Flow**
   ```
   Pending → Matched → Reviewed → Exported
      ↓         ↓
     Error ────┘
   ```

4. **When Saving**
   - Frontend `pending` → Airtable `Pending`
   - Frontend `open` → Airtable `Matched`
   - Frontend `reviewed` → Airtable `Reviewed`
   - Frontend `approved` → Airtable `Reviewed`
   - Frontend `exported` → Airtable `Exported`
   - Frontend `rejected` → Airtable `Error`

## Code Changes Made

1. **transforms.ts**: Updated bidirectional status mapping
2. **document-details-panel.tsx**: Updated display names and colors
3. **Edit logic**: Already uses `'open'` status for edit buttons (Matched state)

## Testing

- [ ] Create invoice with "Pending" status - should be read-only
- [ ] Change to "Matched" status - should show edit buttons
- [ ] Make edits and save - should work
- [ ] Change to "Reviewed" - should be locked again
- [ ] Verify status names match Airtable exactly

