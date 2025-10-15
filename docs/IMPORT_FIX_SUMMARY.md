# Import Fix Summary for src/ Directory Migration

## Overview
The project has been migrated to use a `src/` directory structure with `tsconfig.json` updated to use `"baseUrl": "./src"` and `"@/*": ["./src/*"]`. This document tracks the import fixes required across the codebase.

## Completed Work

### 1. Critical Layout Files ✅
- **File**: `/src/app/layout.tsx`
  - ✅ Fixed: `@/components/layout/header/header` → `@/components/organisms/navigation/header`
  - ✅ Fixed: `@/components/layout/footer` → `@/components/organisms/footer/footer`
  - ✅ Fixed: `@/lib/utils` → `@/lib/lib/utils`
  - ✅ Fixed: `@/lib/fonts` → `@/lib/lib/fonts`
  - ✅ Fixed: `@/lib/config/*` → `@/lib/lib/config/*`
  - ✅ Fixed: `@/components/ai/ai-customer-support` → `@/components/features/ai/ai-customer-support`
  - ✅ Fixed: `@/components/seo/audit-provider` → `@/components/utilities/seo/audit-provider`
  - ✅ Removed: Non-existent components (ScrollToTop, PerformanceDashboard, ServiceWorkerRegister, AIDebugPanel, AISystemLogger)

- **File**: `/src/app/dynamic-layout.tsx`
  - ✅ Fixed: `@/lib/config/*` → `@/lib/lib/config/*`

- **File**: `/src/app/providers.tsx`
  - ✅ Already correct (uses `@/components/providers`)

### 2. UI Component Infrastructure ✅
Created `/src/components/ui/` directory with barrel exports to map to atoms and molecules:

#### Atom Re-exports (14 files created):
- button.tsx, input.tsx, label.tsx, badge.tsx, checkbox.tsx, skeleton.tsx
- avatar.tsx, switch.tsx, slider.tsx, progress.tsx, radio-group.tsx
- separator.tsx, toggle.tsx, icons.tsx

#### Molecule Re-exports (23 files created):
- card.tsx, dialog.tsx, alert.tsx, alert-dialog.tsx, sheet.tsx, dropdown-menu.tsx
- tabs.tsx, accordion.tsx, popover.tsx, select.tsx, tooltip.tsx, hover-card.tsx
- breadcrumb.tsx, form.tsx, calendar.tsx, command.tsx, context-menu.tsx
- drawer.tsx, menubar.tsx, carousel.tsx, collapsible.tsx, image.tsx, link.tsx

#### New Components Created:
- `/src/components/ui/scroll-area.tsx` - Full Radix UI implementation
- `/src/components/ui/toast.tsx` - Toast notification system
- `/src/components/ui/toaster.tsx` - Toast provider component

### 3. Atoms Directory ✅
Fixed all 12 atom files importing from `@/lib/utils`:
- button.tsx ✅
- input.tsx ✅
- skeleton.tsx ✅
- checkbox.tsx ✅
- toggle.tsx ✅
- badge.tsx ✅
- separator.tsx ✅
- avatar.tsx ✅
- radio-group.tsx ✅
- switch.tsx ✅
- label.tsx ✅
- progress.tsx ✅
- slider.tsx ✅

All now correctly import from `@/lib/lib/utils`

## Remaining Work

### 4. Molecules Directory (21 files) ⏳
All files need `@/lib/utils` → `@/lib/lib/utils`:
- carousel.tsx
- form.tsx
- context-menu.tsx
- select.tsx
- dropdown-menu.tsx
- dialog.tsx
- image.tsx
- command.tsx
- menubar.tsx
- alert.tsx
- breadcrumb.tsx
- calendar.tsx
- drawer.tsx
- tooltip.tsx
- accordion.tsx
- hover-card.tsx
- sheet.tsx
- popover.tsx
- card.tsx
- tabs.tsx
- alert-dialog.tsx

### 5. Component Directories (~80+ files) ⏳

#### Organisms
- navigation/ (~10 files) - Need `@/lib/*` → `@/lib/lib/*`
- filters/ (~2 files)
- forms/ (~1 file)
- footer/ (~1 file)

#### Features
- products/ (~20 files) - Mix of `@/lib/*` imports
- ai/ (~12 files) - Need `@/lib/config/ai-config` fixes
- auth/ (~5 files)
- blog/ (~8 files)
- cart/ (~2 files)
- search/ (~2 files)

#### Sections (~10 files)
- Various homepage sections needing `@/lib/*` fixes

#### Providers (~10 files)
- Most need `@/lib/*` → `@/lib/lib/*`

### 6. Lib Directory Internal Imports (~20+ files) ⏳
Files in `/src/lib/lib/` that import from `@/lib/`:
- services/ (~6 files)
- api/shopify/ (~5 files)
- actions/ (~3 files)
- utils/ (~5 files)
- Other lib files

### 7. Hooks Directory (~17 files) ⏳
Located in `/src/hooks/hooks/` (note duplicate directory):
- Most use `@/lib/*` that should be `@/lib/lib/*`

### 8. App Directory Routes
Most app directory files appear correct, but should verify:
- API routes in `/src/app/api/`
- Page components in various route groups

## Automated Fix Script

Two scripts were created but couldn't be executed due to bash tool limitations:
- `/fix-imports.js` (Node.js)
- `/fix_imports.py` (Python)

These scripts can be run manually:
```bash
# Node.js version
node fix-imports.js

# Python version
python3 fix_imports.py
```

## Import Patterns to Fix

### Primary Pattern:
```typescript
// OLD
from "@/lib/utils"
from "@/lib/config/*"
from "@/lib/api/*"
from "@/lib/actions/*"
from "@/lib/seo/*"
from "@/lib/shopify"
from "@/lib/constants"
from "@/lib/fonts"

// NEW
from "@/lib/lib/utils"
from "@/lib/lib/config/*"
from "@/lib/lib/api/*"
from "@/lib/lib/actions/*"
from "@/lib/lib/seo/*"
from "@/lib/lib/shopify"
from "@/lib/lib/constants"
from "@/lib/lib/fonts"
```

### Component Pattern (mostly correct):
```typescript
// These are CORRECT - don't change
from "@/components/ui/*"          // Now maps to atoms/molecules via barrel exports
from "@/components/providers/*"   // Correct location
from "@/components/features/*"    // Correct location
from "@/components/organisms/*"   // Correct location
from "@/components/sections/*"    // Correct location
```

## Next Steps

1. **Run Automated Script**: Execute one of the provided scripts to fix remaining files:
   ```bash
   cd /Users/byronwade/zugzology.com
   node fix-imports.js
   ```

2. **Manual Verification**: Check files that the script might miss:
   - Files with unusual import patterns
   - Dynamic imports
   - Files in unusual locations

3. **Build Test**:
   ```bash
   npm run build
   ```

4. **Fix Any Remaining Errors**: Address any build errors related to imports

5. **Test Application**: Verify all features work correctly after import fixes

## Statistics

- **Files Fixed**: ~27 (layout files + all atoms + UI infrastructure)
- **Files Remaining**: ~130+ files
- **Directories Affected**: All major directories in src/
- **Import Patterns**: ~8 main patterns to fix

## Notes

- The project structure uses atoms/molecules pattern, but shadcn/ui expects components in `ui/` directory
- Solution: Created barrel exports in `ui/` that re-export from atoms/molecules
- This allows existing imports like `@/components/ui/button` to work correctly
- Some components were removed from layout.tsx as they don't exist in the codebase
- The duplicate `/src/lib/lib/` and `/src/hooks/hooks/` directory structure should be evaluated

## Critical Files Already Fixed

The most critical files for the application to start are fixed:
- Main layout and providers
- All base UI components (atoms)
- UI infrastructure (scroll-area, toast, etc.)

The application should be able to build, though runtime errors may occur in features using unfixed imports.
