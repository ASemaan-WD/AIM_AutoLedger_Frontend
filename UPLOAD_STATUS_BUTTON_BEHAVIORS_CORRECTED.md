# Upload Status Card - Button Behaviors (CORRECTED)

## Quick Summary

### Success States
- ✅ Delete icon in header → Opens confirmation modal
- ✅ Export button → Direct (success) or Modal first (caveats)
- ✅ Shows spinner during export

### Error States  
- 🗑️ Remove button → **Direct delete (NO MODAL)**
- ❓ Get help button → Placeholder (does nothing)

### All States
- 🔗 Original file link → Opens new tab (empty for now)

## Detailed Behaviors

### Success (`status="success"`)
**Header**: Delete icon (trash) → Opens delete confirmation modal  
**Button**: "Export to AIM" → Calls `onExport()` directly, shows spinner if `isExporting={true}`

### Success with Caveats (`status="success-with-caveats"`)
**Header**: Delete icon (trash) → Opens delete confirmation modal  
**Button**: "Export to AIM" → Opens warning modal first, then exports with spinner

### Exported (`status="exported"`)
**No buttons** - Final state

### All Error States (`processing-error`, `duplicate`, `no-match`, `error`)
**Buttons**:
- "Remove" → Calls `onRemove()` **DIRECTLY** (no modal)
- "Get help" → Does nothing (placeholder)

## Why Error States Don't Show Modals

Error states represent files that **should not be in the system**:
- Processing failed
- Duplicate detected
- No PO match found

These should be removed quickly without extra confirmation. The user already knows something is wrong from the error state.

## Original File Link

All states (except uploading/processing) show:
```
📄 Original file: filename.pdf 🔗
```

**Behavior**: Opens new tab via `window.open("", "_blank")` (empty tab for now, will be PDF URL later)

## Modal Reference

### Delete File Modal
**Used by**: Success states only (via delete icon in header)

```
🗑️ Delete file

Are you sure you want to delete "filename.pdf"?
This action cannot be undone.

[Cancel] [Delete]
```

### Export with Issues Modal
**Used by**: Success-with-caveats state only

```
⚠️ Export with issues

We found X issue(s) with this invoice.
You can fix them in AIM after export.

[Cancel] [Export to AIM]
```

## Code Usage

### Success State (with delete modal)
```typescript
<UploadStatusCard
  status="success"
  filename="invoice.pdf"
  onRemove={() => console.log('User confirmed delete')}
  onExport={() => console.log('Exporting...')}
  isExporting={isExporting}
/>
```

### Error State (no modal)
```typescript
<UploadStatusCard
  status="processing-error"
  filename="invoice.pdf"
  onRemove={() => console.log('Removed directly!')}
  onGetHelp={() => {}} // placeholder
/>
```

## Summary Table

| State | Header Icon | Primary Action | Has Modal? |
|-------|-------------|----------------|------------|
| `success` | Delete → Modal | Export (spinner) | ✅ Delete modal |
| `success-with-caveats` | Delete → Modal | Export (warning + spinner) | ✅ Both modals |
| `exported` | None | None | ❌ No actions |
| `processing-error` | None | Remove (direct) | ❌ No modal |
| `duplicate` | None | Remove (direct) | ❌ No modal |
| `no-match` | None | Remove (direct) | ❌ No modal |
| `error` | None | Remove (direct) | ❌ No modal |

## Testing Checklist

In `/upload-status-demo`:

- ✅ Click delete icon (success) → Modal appears
- ✅ Click delete icon (caveats) → Modal appears
- ✅ Click Remove (errors) → No modal, direct action
- ✅ Click Export (success) → Spinner shows
- ✅ Click Export (caveats) → Warning modal → Spinner shows
- ✅ Click original file link → New tab opens
- ✅ Get help button → Does nothing

All behaviors work consistently across demo page, home2 page, and any other usage!







