# Upload Status Card Refactor - Component Library Approach

## Overview

The Upload Status Card has been refactored into a modular, component-based architecture with a centralized fixtures system that serves as a "component library" for easy viewing and updating of all states.

## Architecture

### 1. **Component Structure**

```
src/components/application/upload-status/
├── components/
│   ├── card-layout.tsx          # Two-column layout wrapper (icon + content)
│   ├── card-header.tsx          # Title, badge, helper text, cancel button
│   ├── card-progress.tsx        # Progress bar
│   ├── invoice-details.tsx      # Invoice description, date, amount
│   ├── original-file-link.tsx   # Link to view original file
│   ├── attention-list.tsx       # Warning/caveat list
│   ├── card-actions.tsx         # Action buttons (Export/Cancel or Remove/Get Help)
│   └── index.tsx                # Barrel export
├── upload-status-card.tsx       # Main orchestrator component
├── fixtures.ts                  # Centralized mock data for all states
└── COMPONENT_ARCHITECTURE.md    # Detailed component documentation
```

### 2. **Layout System**

The card uses a two-row layout:

**Row 1: Two-column layout** (inside `CardLayout`)
- Left column: FeaturedIcon (fixed width)
- Right column: 
  - CardHeader
  - CardProgress (when applicable)
  - InvoiceDetails (when applicable)
  - AttentionList (when applicable)

**Row 2: Full-width** (outside `CardLayout`)
- OriginalFileLink
- CardActions (buttons)

This ensures proper alignment where the main content aligns with the icon, while footer elements span the full width.

## Component Library Workflow

### Central Fixtures File

The `fixtures.ts` file serves as the single source of truth for all component states:

```typescript
// src/components/application/upload-status/fixtures.ts

export const uploadStatusFixtures = {
  uploading: { /* fixture data */ },
  processing: { /* fixture data */ },
  connecting: { /* fixture data */ },
  success: { /* fixture data */ },
  successWithCaveats: { /* fixture data */ },
  error: { /* fixture data */ },
}

export const stateDescriptions = {
  uploading: { title: "...", description: "..." },
  // ... other states
}
```

### Demo Page (Component Library)

The `/upload-status-demo` page imports and displays all fixtures:

```typescript
import { uploadStatusFixtures, stateDescriptions } from "@/components/application/upload-status/fixtures"

<UploadStatusCard {...uploadStatusFixtures.uploading} />
<UploadStatusCard {...uploadStatusFixtures.processing} />
// ... etc
```

**Benefits:**
- View all states in one place
- Update `fixtures.ts` to see changes reflected immediately
- Serves as living documentation
- Easy to share with designers/stakeholders

### Implementation Pages

Pages like `home2` use the same component but with real data:

```typescript
import { UploadStatusCard } from "@/components/application/upload-status/upload-status-card"
import type { UploadStatus } from "@/components/application/upload-status/upload-status-card"

<UploadStatusCard
  filename={file.name}
  status={file.status}
  invoiceInfo={file.invoiceInfo}
  onExport={() => handleExport(file.id)}
  // ... other props
/>
```

## Pages

### 1. `/upload-status-demo` - Component Library
- **Purpose**: Visual reference for all upload status card states
- **Usage**: Design review, documentation, component testing
- **Data Source**: `fixtures.ts`
- **Update Process**: Edit `fixtures.ts` → changes reflect immediately

### 2. `/home2` - New Upload Experience
- **Purpose**: Production-ready upload page with new status cards
- **Features**:
  - File upload with drag & drop
  - Real-time status transitions (uploading → processing → connecting → success/error)
  - Simulated workflow for demonstration
  - Full action handlers (cancel, export, remove, get help, view file)

### 3. `/home` - Original Upload Experience
- **Purpose**: Current production upload page
- **Features**: Original FileUpload component with progress bars
- **Status**: Maintained for comparison/fallback

## State Flow in home2

```
User uploads file
       ↓
   Uploading (2s)
   - Shows file size
   - Progress bar at 50%
   - Cancel button
       ↓
   Processing (2s)
   - Shows "Extracting text from X pages..."
   - Progress bar at 75%
   - Cancel button
       ↓
   Connecting (2s)
   - Shows invoice info (vendor, date, amount, description)
   - Shows "Connecting to AIM to match POs..."
   - Progress bar at 90%
   - Original file link appears
   - Cancel button
       ↓
   Success or Success with Caveats
   - Shows invoice info
   - Shows "Everything checks out" or caveats list
   - Original file link
   - Export and Cancel buttons
```

## How to Update Component States

### To modify a state's appearance:

1. **Edit fixtures.ts**
   ```typescript
   export const uploadStatusFixtures = {
     success: {
       filename: "invoice-march-2024.pdf",
       status: "success",
       invoiceInfo: {
         vendor: "Updated Vendor Name", // ← Change here
         // ...
       }
     }
   }
   ```

2. **View changes in `/upload-status-demo`**
   - Navigate to the demo page
   - See the updated state immediately

3. **Changes automatically reflect in all implementations**
   - Any page using the component will use the same structure
   - Only data differs between demo and production

### To add a new component:

1. Create component in `components/` directory
2. Export from `components/index.tsx`
3. Use in `upload-status-card.tsx` for specific states
4. Update fixtures if needed

### To add a new state:

1. Add state to `UploadStatus` type in `upload-status-card.tsx`
2. Add fixture to `fixtures.ts`
3. Add state description to `stateDescriptions`
4. Implement state logic in `upload-status-card.tsx`
5. Add to demo page

## Benefits of This Architecture

### 1. **Single Source of Truth**
- Fixtures file defines all states
- Easy to update and maintain
- Consistent across all usages

### 2. **Component Library**
- Demo page serves as living documentation
- Designers can review all states
- Stakeholders can see progress
- Easy to test edge cases

### 3. **Modularity**
- Each component has single responsibility
- Easy to test independently
- Reusable across different contexts

### 4. **Type Safety**
- Full TypeScript support
- Exported types for implementations
- Compile-time error checking

### 5. **Maintainability**
- Clear separation of concerns
- Easy to locate and fix issues
- Straightforward to extend

## Migration Path

1. **Phase 1**: Demo page (✅ Complete)
   - Component library with all states
   - Fixtures system
   - Documentation

2. **Phase 2**: home2 (✅ Complete)
   - New upload experience
   - Simulated workflow
   - Full integration

3. **Phase 3**: Integration (Future)
   - Connect to real API
   - Replace home with home2
   - Add real-time updates

4. **Phase 4**: Enhancement (Future)
   - Add more states as needed
   - Refine transitions
   - Add animations

## Testing Strategy

### Component Library Testing
```bash
# Navigate to demo page
http://localhost:3000/upload-status-demo

# Verify all states render correctly
# Test interactions (buttons, links)
# Review with design team
```

### Integration Testing
```bash
# Navigate to home2
http://localhost:3000/home2

# Upload a file
# Watch state transitions
# Test all action buttons
# Verify error handling
```

## Next Steps

1. **Connect to Real API**
   - Replace simulated delays with actual API calls
   - Handle real upload progress
   - Process actual invoice data

2. **Add Real-time Updates**
   - WebSocket or polling for status updates
   - Server-sent events for progress
   - Background processing updates

3. **Enhance UX**
   - Add animations between states
   - Improve loading indicators
   - Add success celebrations

4. **Production Deployment**
   - A/B test home vs home2
   - Gather user feedback
   - Gradual rollout

## Resources

- **Component Documentation**: `src/components/application/upload-status/COMPONENT_ARCHITECTURE.md`
- **Demo Page**: `/upload-status-demo`
- **Implementation**: `/home2`
- **Fixtures**: `src/components/application/upload-status/fixtures.ts`







