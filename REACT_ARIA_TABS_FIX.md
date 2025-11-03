# React Aria Tabs Error - Final Fix

## The Error
```
Error: Attempted to access node before it was defined. 
Check if setProps wasn't called before attempting to access the node.
```

This is a React Aria Collections error that occurs when the component tries to access a collection node that hasn't been properly initialized.

## Root Cause
React Aria's `Tabs` component uses an internal collection system. When there's no `defaultSelectedKey` and the `selectedKey` prop changes before the component is fully mounted, it can try to access a node that doesn't exist yet.

## Final Fix Applied

### Updated Tabs Component Props
**File**: `src/components/documents/document-details-panel.tsx`

```typescript
<Tabs 
    key={`tabs-${document?.id || 'no-doc'}`}
    defaultSelectedKey="extracted"           // ← ADDED: Ensures valid initial state
    selectedKey={validActiveTab}
    onSelectionChange={(key) => onTabChange?.(key as string)}
    className="flex-1 flex flex-col overflow-hidden"
>
```

### Key Changes:
1. **Added `defaultSelectedKey="extracted"`** - Provides a stable initial value
2. **Kept `key` prop** - Forces remount when document changes
3. **Removed `disallowEmptySelection`** - Not needed with defaultSelectedKey

## How to Test

1. **Hard refresh browser**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Clear localStorage if needed**:
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Clear storage" on the left
   - Click "Clear site data" button
3. **Navigate to invoices page**
4. **Click on an invoice** - tabs should render without error
5. **Switch between tabs** - should work smoothly

## Why This Works

React Aria's Tabs uses a controlled component pattern. By providing `defaultSelectedKey`, we ensure:
- The component has a valid initial state on mount
- The internal collection is properly initialized
- Node references are created before being accessed
- Subsequent updates to `selectedKey` work correctly

The combination of `key` (for remounting) and `defaultSelectedKey` (for initialization) provides a stable foundation for the Tabs component.

## If Error Persists

If you still see this error after the above steps, it might be coming from a different component (like a Select dropdown). Check the browser console for the full stack trace to identify which component is causing the issue.

