# Processed State CTA Update

## Summary

Successfully implemented the requested updates to the Call-to-Action (CTA) buttons for invoices in the "Processed" state (INVOICE_STATUS.OPEN / Matched).

## Changes Made

### 1. Component Updates (`src/components/documents/document-details-panel.tsx`)

#### Added Imports
```typescript
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { RefreshCcw01 } from "@untitledui/icons";
```

#### Updated Button Layout
Modified the `renderActionButtons()` function for `INVOICE_STATUS.OPEN` to implement the new button layout:

**New Layout:**
- **Export** button: Primary action button (full width)
- **Save** button: Tertiary action button (full width)
- **Ellipsis (⋯) button**: Opens dropdown menu with:
  - **Reprocess** option (with RefreshCcw01 icon)
  - **Delete** option (with Trash01 icon)

### 2. Implementation Details

The buttons follow the requested specifications:
- Export button remains primary and full-width
- Save button is now tertiary style and full-width
- Dropdown button with ellipsis icon provides access to secondary actions
- Dropdown menu contains Reprocess and Delete options with appropriate icons

### 3. Code Structure

```typescript
case INVOICE_STATUS.OPEN: // Matched/Processed - editable
    return (
        <div className="flex items-center gap-2">
            <Button 
                size="sm" 
                color="primary"
                className="flex-1"
                onClick={() => {
                    // Export = Save + Export
                    if (isDirty) {
                        handleSave();
                    }
                    onSendForApproval?.(currentDoc);
                }}
                isDisabled={!validation.canMarkAsReviewed}
            >
                Export
            </Button>
            <Button 
                size="sm" 
                color="tertiary"
                className="flex-1"
                onClick={handleSave}
                isDisabled={!isDirty || isSaving}
                isLoading={isSaving}
            >
                Save
            </Button>
            <Dropdown.Root>
                <Dropdown.DotsButton 
                    aria-label="More actions"
                />
                <Dropdown.Popover>
                    <Dropdown.Menu>
                        <Dropdown.Item
                            label="Reprocess"
                            icon={RefreshCcw01}
                            onAction={() => {
                                // TODO: Implement reprocess logic
                                console.log('Reprocess invoice:', currentDoc.id);
                            }}
                        />
                        <Dropdown.Item
                            label="Delete"
                            icon={Trash01}
                            onAction={() => onDelete?.(currentDoc)}
                        />
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown.Root>
        </div>
    );
```

## Components Used

- `Button` component with "tertiary" color variant
- `Dropdown` component from `@/components/base/dropdown/dropdown`
- `RefreshCcw01` icon from `@untitledui/icons`
- `Trash01` icon (already imported)

## Status

✅ Code implementation complete
✅ All components exist and are properly imported
⚠️ TODO: Implement the actual reprocess logic (currently logs to console)

## Next Steps

1. Implement the reprocess logic in the dropdown item's onAction handler
2. Test the UI in the browser to verify the visual appearance
3. Ensure all functionality works as expected

## Notes

- The "tertiary" color variant exists in the Button component
- The RefreshCcw01 icon is available in @untitledui/icons
- The implementation maintains consistency with the existing codebase patterns
