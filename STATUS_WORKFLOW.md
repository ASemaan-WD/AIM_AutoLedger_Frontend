# Invoice Status Workflow

## Status Definitions

### Pending
- **Airtable Value:** `Pending`
- **Internal Value:** `pending`
- **Description:** Invoice has missing fields that need to be updated
- **Edit Permissions:** ❌ No edits allowed
- **Next Status:** Matched

### Matched  
- **Airtable Value:** `Matched`
- **Internal Value:** `reviewed`
- **Description:** Invoice is matched to a PO and ready for review/editing
- **Edit Permissions:** ✅ Edits allowed
- **Next Status:** Reviewed

### Reviewed
- **Airtable Value:** `Reviewed`
- **Internal Value:** `approved`
- **Description:** Invoice has been reviewed and marked ready for export
- **Edit Permissions:** ❌ No edits allowed (locked)
- **Next Status:** Exported

### Exported
- **Airtable Value:** `Exported`
- **Internal Value:** `exported`
- **Description:** Invoice has been exported to the ERP system
- **Edit Permissions:** ❌ No edits allowed (locked)
- **Next Status:** None (final state)

### Error
- **Airtable Value:** `Error`
- **Internal Value:** `rejected`
- **Description:** Invoice has errors that need to be resolved
- **Edit Permissions:** ❌ No edits allowed
- **Next Status:** Can be moved back to Pending after fixing

---

## Status Flow

```
Pending → Matched → Reviewed → Exported
   ↓         ↓
  Error ────┘
```

---

## Implementation Notes

1. **Edit Permissions Logic:**
   - Only `Matched` status allows editing
   - All other statuses are read-only

2. **Status Transitions:**
   - User can move from `Matched` to `Reviewed` by clicking "Mark as Reviewed"
   - System moves from `Reviewed` to `Exported` during export process
   - Errors can occur at any stage, moving to `Error` status

3. **UI Display:**
   - `Pending`: Gray badge, "Missing Fields" indicator
   - `Matched`: Blue badge, "Edit" button enabled
   - `Reviewed`: Green badge, "Ready for Export" indicator
   - `Exported`: Dark green badge, "Exported" indicator
   - `Error`: Red badge, "Error" indicator

---

## Code References

- Status mapping: `src/lib/airtable/transforms.ts`
- Status constants: `src/lib/airtable/schema-types.ts`
- Edit logic: `src/components/documents/document-details-panel.tsx`

