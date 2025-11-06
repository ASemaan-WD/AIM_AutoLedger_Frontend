# Invoice State UI - Quick Reference Guide

## For Developers

### Status Constants
```typescript
import { INVOICE_STATUS } from '@/lib/airtable/schema-types';

INVOICE_STATUS.PENDING    // 'pending'
INVOICE_STATUS.OPEN       // 'open' (Matched)
INVOICE_STATUS.REVIEWED   // 'reviewed'
INVOICE_STATUS.APPROVED   // 'approved' (also Reviewed)
INVOICE_STATUS.REJECTED   // 'rejected' (Error)
INVOICE_STATUS.EXPORTED   // 'exported'
```

### State Indicator Components
```typescript
import {
  PendingStateIndicator,
  BalanceAlert,
  QueuedIndicator,
  ErrorAlert,
  ExportedIndicator
} from '@/components/documents/invoice-state-indicators';

// Usage examples:
<PendingStateIndicator />
<BalanceAlert balance={50.00} explanation="Freight not in PO" />
<QueuedIndicator />
<ErrorAlert errorCode="ERR_001" errorMessage="Vendor not found" />
<ExportedIndicator />
```

### Check Invoice State
```typescript
const isPending = invoice.status === INVOICE_STATUS.PENDING;
const isMatched = invoice.status === INVOICE_STATUS.OPEN;
const isReviewed = invoice.status === INVOICE_STATUS.REVIEWED || 
                   invoice.status === INVOICE_STATUS.APPROVED;
const isExported = invoice.status === INVOICE_STATUS.EXPORTED;
const isError = invoice.status === INVOICE_STATUS.REJECTED;
```

### Check if Editable
```typescript
const canEdit = invoice.status === INVOICE_STATUS.OPEN;
```

### Invoice Type with New Fields
```typescript
interface Invoice {
  // ... existing fields ...
  balance?: number;
  balanceExplanation?: string;
  errorCode?: string;
  errorMessage?: string;
  isMultilineCoding?: boolean;
  lines?: InvoiceLine[];
}

interface InvoiceLine {
  id: string;
  description: string;
  amount: number;
  glAccount?: string;
}
```

## For QA/Testing

### Test Checklist

#### ✅ Pending State
- [ ] Blue info indicator with spinner visible
- [ ] "Processing Invoice" message displayed
- [ ] All fields are read-only
- [ ] Delete button is visible
- [ ] No completeness checker shown
- [ ] Line navigation works (◀ ▶)
- [ ] Status badge shows "Pending" in warning color

#### ✅ Matched State (No Balance)
- [ ] No balance alert shown
- [ ] Export button visible and enabled (if valid)
- [ ] Save button visible (disabled if not dirty)
- [ ] Delete button visible
- [ ] All fields are editable
- [ ] Line navigation works
- [ ] Status badge shows "Matched" in blue

#### ✅ Matched State (With Balance)
- [ ] Balance alert box visible with amount
- [ ] Balance explanation text shown (if provided)
- [ ] Export and Save buttons visible
- [ ] Warning styling on balance alert
- [ ] All other Matched state behaviors

#### ✅ Reviewed/Queued State
- [ ] Green "Ready for Export" indicator visible
- [ ] No action buttons shown
- [ ] All fields are read-only
- [ ] Line navigation works
- [ ] Status badge shows "Reviewed" in green

#### ✅ Exported State
- [ ] Brand-colored success indicator visible
- [ ] "View in AIM Vision" button visible
- [ ] All fields are read-only
- [ ] Line navigation works
- [ ] Status badge shows "Exported" in brand color
- [ ] Clicking button opens external link

#### ✅ Error State
- [ ] Red error alert box visible
- [ ] Error code displayed (if provided)
- [ ] Error message displayed
- [ ] Delete button visible
- [ ] Need Help button visible
- [ ] All fields are read-only
- [ ] Line navigation works
- [ ] Status badge shows "Error" in red
- [ ] Need Help opens email client

### Test Data Examples

```javascript
// Pending invoice
{
  id: "rec123",
  status: "pending",
  vendorName: "ACME Corp",
  invoiceNumber: "INV-001",
  invoiceDate: new Date("2025-11-06"),
  amount: 1234.56
}

// Matched with balance
{
  id: "rec456",
  status: "open",
  vendorName: "ACME Corp",
  invoiceNumber: "INV-002",
  invoiceDate: new Date("2025-11-06"),
  amount: 1284.56,
  balance: 50.00,
  balanceExplanation: "Freight charges not included in PO"
}

// Error state
{
  id: "rec789",
  status: "rejected",
  vendorName: "Unknown Vendor",
  invoiceNumber: "INV-003",
  invoiceDate: new Date("2025-11-06"),
  amount: 500.00,
  errorCode: "ERR_VENDOR_NOT_FOUND",
  errorMessage: "Vendor code does not exist in the system"
}

// Exported
{
  id: "rec999",
  status: "exported",
  vendorName: "ACME Corp",
  invoiceNumber: "INV-004",
  invoiceDate: new Date("2025-11-06"),
  amount: 2500.00
}
```

## For Product/Design

### Visual Specifications

#### Colors (Tailwind Classes)
```css
/* Pending */
border-blue-200, bg-blue-50, text-blue-700

/* Warning/Balance */
border-warning, bg-warning-25, text-warning-700

/* Success/Queued */
border-success, bg-success-25, text-success-700

/* Brand/Exported */
border-brand, bg-brand-25, text-brand-700

/* Error */
border-error, bg-error-25, text-error-700
```

#### Spacing
- Alert box padding: 12px
- Alert box margin bottom: 16px
- Border radius: 8px
- Icon size: 16px × 16px
- Gap between elements: 8px

#### Typography
- Heading: 14px (text-sm), font-medium
- Body: 12px (text-xs), font-normal
- Error code: 12px (text-xs), font-mono

#### Icons
- Spinner: Animated border (custom CSS)
- Clock: Clock icon
- Check: CheckCircle icon
- Warning: AlertTriangle icon
- Error: AlertCircle icon
- Help: HelpCircle icon
- Export: FileDownload02 icon
- External: LinkExternal01 icon
- Delete: Trash01 icon

### User Flows

#### Happy Path: Upload → Export
1. User uploads invoice → **Pending** (blue spinner)
2. System processes → **Matched** (blue badge, editable)
3. User reviews and clicks Export → **Reviewed** (green, queued)
4. System exports → **Exported** (brand color, view link)

#### Balance Discrepancy Path
1. Invoice matched with balance → **Matched** + Balance Alert (orange warning)
2. User reviews explanation
3. User clicks Export anyway → **Reviewed** → **Exported**

#### Error Recovery Path
1. Processing fails → **Error** (red alert with details)
2. User clicks Need Help → Email opens
3. Support resolves issue
4. Status updated → Back to **Pending** or **Matched**

### Copy/Messaging

All user-facing messages are defined in `invoice-state-indicators.tsx`:

- **Pending**: "We're processing this invoice. Most fields are read-only until processing is complete."
- **Balance**: "Invoice exceeds PO by $X.XX" or "Invoice is under PO by $X.XX"
- **Queued**: "This invoice has been reviewed and is queued for export. All fields are locked."
- **Exported**: "This invoice has been exported to AIM Vision. All fields are read-only."
- **Error**: "Error Processing Invoice" + error code + message

## Common Issues & Solutions

### Issue: Export button disabled
**Check**: 
- Is invoice in Matched state? (`status === 'open'`)
- Are all required fields filled?
- Does validation pass? (`validation.canMarkAsReviewed === true`)

### Issue: Fields not editable
**Check**: 
- Is invoice in Matched state? Only `status === 'open'` allows editing
- All other states are read-only by design

### Issue: Line navigation not working
**Check**: 
- Are there line items? (`invoice.invoiceDetails?.length > 0`)
- Line navigation should work in ALL states (not disabled)

### Issue: Balance alert not showing
**Check**: 
- Is invoice in Matched state?
- Does invoice have non-zero balance? (`invoice.balance !== 0`)
- Is balance field populated from backend?

### Issue: State indicator not showing
**Check**: 
- Is invoice status valid? (one of the INVOICE_STATUS constants)
- Is `renderStateIndicator()` being called?
- Check browser console for errors

## API Integration Notes

### Required Fields from Backend
```typescript
{
  id: string;
  status: 'pending' | 'open' | 'reviewed' | 'approved' | 'rejected' | 'exported';
  
  // Optional but recommended:
  balance?: number;
  balanceExplanation?: string;
  errorCode?: string;
  errorMessage?: string;
}
```

### Status Transitions (Backend)
- Upload → `pending`
- Processing complete → `open`
- User clicks Export → `reviewed`
- System exports → `exported`
- Error occurs → `rejected`

### Callbacks Required
```typescript
onSave?: (invoice: Invoice) => void;
onSendForApproval?: (invoice: Invoice) => void;  // For Export
onViewInOracle?: (invoice: Invoice) => void;     // For View in AIM Vision
onDelete?: (invoice: Invoice) => void;
```

## Performance Considerations

- State indicators are lightweight React components
- No heavy computations in render
- Line navigation uses local state (no API calls)
- Balance calculations done on backend
- Validation cached with useMemo

## Accessibility

- All buttons have proper labels
- Icons have semantic meaning
- Color + icon + text (not color alone)
- Keyboard navigation supported
- Screen reader friendly
- Focus indicators visible

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS animations supported
- No IE11 support required
- Mobile responsive (fixed width panel)

## Related Files

- Types: `src/types/documents.ts`
- Components: `src/components/documents/invoice-state-indicators.tsx`
- Panel: `src/components/documents/document-details-panel.tsx`
- Validation: `src/utils/invoice-validation.ts`
- Constants: `src/lib/airtable/schema-types.ts`

## Support

For questions or issues:
- Check implementation docs: `INVOICE_STATE_UI_IMPLEMENTATION.md`
- Review flow diagram: `INVOICE_STATE_FLOW_DIAGRAM.md`
- Contact: [Your team's contact info]

