# Quick Fix Guide - Complete Remaining Import Updates

## Option 1: Run the Automated Script (RECOMMENDED)

The fastest way to fix all remaining imports:

```bash
cd /Users/byronwade/zugzology.com

# Run the Node.js version
node fix-imports.js

# OR run the Python version
python3 fix_imports.py
```

This will automatically fix ~130+ remaining files.

## Option 2: Manual Fix with Find/Replace

If the scripts don't work, use your editor's find/replace across the `src/` directory:

### Find and Replace Patterns:

1. **Utils import**:
   - Find: `from "@/lib/utils"`
   - Replace: `from "@/lib/lib/utils"`

2. **Config imports**:
   - Find: `from "@/lib/config/`
   - Replace: `from "@/lib/lib/config/`

3. **API imports**:
   - Find: `from "@/lib/api/`
   - Replace: `from "@/lib/lib/api/`

4. **Actions imports**:
   - Find: `from "@/lib/actions/`
   - Replace: `from "@/lib/lib/actions/`

5. **SEO imports**:
   - Find: `from "@/lib/seo/`
   - Replace: `from "@/lib/lib/seo/`

6. **Shopify import**:
   - Find: `from "@/lib/shopify"`
   - Replace: `from "@/lib/lib/shopify"`

7. **Constants import**:
   - Find: `from "@/lib/constants"`
   - Replace: `from "@/lib/lib/constants"`

8. **Fonts import**:
   - Find: `from "@/lib/fonts"`
   - Replace: `from "@/lib/lib/fonts"`

9. **Server imports**:
   - Find: `from "@/lib/server/`
   - Replace: `from "@/lib/lib/server/`

10. **Utils path imports**:
    - Find: `from "@/lib/utils/`
    - Replace: `from "@/lib/lib/utils/`

11. **Trustoo import**:
    - Find: `from "@/lib/trustoo"`
    - Replace: `from "@/lib/lib/trustoo"`

12. **Auth imports**:
    - Find: `from "@/lib/auth/`
    - Replace: `from "@/lib/lib/auth/`

### Important: Do NOT Replace These:
- `from "@/components/*"` - Already correct!
- `from "@/hooks/*"` - Already correct!
- `from "@/app/*"` - Already correct!
- Imports that already have `@/lib/lib/` - Already fixed!

## Option 3: VS Code Multi-Cursor

1. Open VS Code
2. Press `Cmd+Shift+F` (Mac) or `Ctrl+Shift+F` (Windows)
3. Enable Regex mode (click `.*` button)
4. Search for: `from ["']@/lib/(utils|config|api|actions|seo|shopify|constants|fonts|server|auth)["/']`
5. Click "Replace All" button
6. Use: `from "@/lib/lib/$1"`

## Verification Steps

After running fixes:

```bash
# 1. Check for remaining old imports
grep -r 'from "@/lib/utils"' src/
grep -r 'from "@/lib/config' src/
grep -r 'from "@/lib/api' src/

# 2. Verify new imports are correct
grep -r 'from "@/lib/lib/utils"' src/ | head -5

# 3. Run build to check for errors
npm run build

# 4. If build succeeds, run type check
npm run type-check  # or tsc --noEmit
```

## Priority File List

If doing manual fixes, prioritize these high-impact files first:

### Molecules (21 files):
```
src/components/molecules/alert-dialog.tsx
src/components/molecules/dialog.tsx
src/components/molecules/form.tsx
src/components/molecules/select.tsx
src/components/molecules/tabs.tsx
# ... and 16 others listed in IMPORT_FIX_SUMMARY.md
```

### Providers (10 files):
```
src/components/providers/cart-provider.tsx
src/components/providers/auth-provider.tsx
src/components/providers/session-provider.tsx
src/components/providers/search-provider.tsx
# ... and others
```

### Key Feature Files:
```
src/components/features/products/product-card.tsx
src/components/features/products/variant-selector.tsx
src/components/organisms/navigation/header.tsx
src/components/organisms/navigation/enhanced-navigation.tsx
```

## Common Errors After Import Fixes

### Error: "Cannot find module '@/lib/utils'"
- Cause: Import not updated
- Fix: Change to `@/lib/lib/utils`

### Error: "Module has no exported member 'X'"
- Cause: Incorrect import path
- Fix: Verify the file exists at the new path

### Error: "Cannot find module '@/components/ui/scroll-area'"
- Cause: Missing UI barrel export
- Fix: Already fixed! Just rebuild.

## Files That Are Already Correct ✅

These files were already fixed:
- `/src/app/layout.tsx`
- `/src/app/dynamic-layout.tsx`
- `/src/app/providers.tsx`
- All 13 files in `/src/components/atoms/`
- All 37 barrel exports in `/src/components/ui/`

## Next Commands to Run

```bash
# After fixing imports, run these:
npm run build                    # Build the project
npm run lint                     # Check for linting errors
npm run type-check              # TypeScript type checking
npm run dev                     # Start dev server and test
```

## Troubleshooting

**Q: Script says "Error" but no details**
- A: Try running with explicit path: `node /Users/byronwade/zugzology.com/fix-imports.js`

**Q: Build still fails after running script**
- A: Check the specific error message
- Common: Some imports might be in different format (single vs double quotes)
- Solution: Run grep to find any remaining old imports

**Q: Components still can't find UI elements**
- A: The UI barrel exports are created
- Make sure imports use `@/components/ui/*` not `@/components/atoms/*`

**Q: Type errors after import fixes**
- A: This is expected if the imported modules have type changes
- Fix: Update the usage to match the new types

## Quick Success Test

After running fixes, test with:
```bash
npm run build 2>&1 | grep "error TS"
```

If output is empty, all imports are likely fixed!

## Need Help?

Check these files for reference:
- `IMPORT_FIX_SUMMARY.md` - Detailed status of all fixes
- `fix-imports.js` - Node.js automation script
- `fix_imports.py` - Python automation script
