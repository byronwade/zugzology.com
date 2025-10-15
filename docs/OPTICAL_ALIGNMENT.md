# Optical Alignment Guide

## Overview

Optical alignment ensures that UI elements **appear** visually centered and balanced to the human eye, even when they're not mathematically perfect. This is crucial for creating professional, polished interfaces.

## Why Optical Alignment Matters

Different shapes have different visual weights and centers of mass:

- **Triangular icons** (arrows, carets) appear left-heavy → shift right by ~2px
- **Circular icons** (circles, clocks) appear high in containers → shift down by ~1px
- **Bottom-heavy icons** (hearts, anchors) appear low → shift up by ~1px
- **Uppercase text** appears larger than lowercase at the same size → reduce by ~4% and increase tracking

## System Architecture

### 1. Tailwind Configuration (`tailwind.config.ts`)

Custom utilities for optical adjustments:

```typescript
// Optical alignment utilities
spacing: {
  'optical-xs': '0.0625rem', // 1px
  'optical-sm': '0.125rem',  // 2px
  'optical-md': '0.1875rem', // 3px
},
translate: {
  'optical-icon-right': '0.125rem',  // 2px right for triangular icons
  'optical-icon-down': '0.0625rem',  // 1px down for circular icons
  'optical-icon-up': '-0.0625rem',   // 1px up for bottom-heavy icons
  'optical-icon-left': '-0.0625rem', // 1px left for heavy-left icons
}
```

### 2. Utility Functions (`src/lib/utils/optical-alignment.ts`)

#### Core Functions

**`getOpticalIconClasses(iconName: string, context: string): string`**
- Returns optical alignment classes for a specific icon
- Context can be: `'button'`, `'inline'`, `'standalone'`, `'nav'`, `'card'`

**`detectIconShape(iconName: string): IconShape`**
- Auto-detects icon shape from name
- Returns: `'triangular'`, `'circular'`, `'bottomHeavy'`, `'leftHeavy'`, `'square'`, or `'star'`

**`getOpticalTextClasses(textType, size): string`**
- Returns classes for text optical alignment
- Reduces uppercase text by 4% and increases tracking

**`getOpticalAlignment(config): string`**
- Comprehensive utility for icon + text combinations
- Handles gap adjustments between icons and text

### 3. Configuration (`src/lib/config/wadesdesign.config.ts`)

Centralized optical alignment settings:

```typescript
OPTICAL_ALIGNMENT = {
  icons: {
    triangular: { translateX: '2px', translateY: '0px' },
    circular: { translateX: '0px', translateY: '1px' },
    bottomHeavy: { translateX: '0px', translateY: '-1px' },
    // ... more shapes
  },
  typography: {
    uppercase: { sizeMultiplier: 0.96, letterSpacing: '0.05em' },
    currency: { sizeMultiplier: 0.875, verticalAlign: '0.125em' },
    // ... more typography settings
  },
  // ... spacing, forms, loaders, navigation, badges, cards
}
```

## Usage Examples

### Basic Icon Alignment

```tsx
import { cn } from "@/lib/utils";
import { getOpticalIconClasses } from "@/lib/utils/optical-alignment";
import { ArrowRight, CheckCircle, Heart } from "lucide-react";

// Triangular icon (arrow) - shifts right
<ArrowRight className={cn("h-4 w-4", getOpticalIconClasses("ArrowRight", "button"))} />

// Circular icon - shifts down
<CheckCircle className={cn("h-4 w-4", getOpticalIconClasses("CheckCircle", "inline"))} />

// Bottom-heavy icon (heart) - shifts up
<Heart className={cn("h-4 w-4", getOpticalIconClasses("Heart", "button"))} />
```

### Icon in Button

```tsx
<Button>
  <ShoppingCart className={cn("h-4 w-4 mr-2", getOpticalIconClasses("ShoppingCart", "button"))} />
  Add to Cart
</Button>
```

### Loading Spinner

```tsx
// Spinners are circular and need optical centering
<Loader2 className={cn("h-4 w-4 animate-spin", "translate-y-optical-icon-down")} />
```

### Icon with Text (Inline)

```tsx
<p className="flex items-center gap-2">
  <Truck className={cn("h-3 w-3", getOpticalIconClasses("Truck", "inline"))} />
  Free Shipping
</p>
```

### Star Rating

```tsx
{[...Array(5)].map((_, i) => (
  <Star
    key={i}
    className={cn(
      "w-4 h-4 text-yellow-400",
      filled && "fill-yellow-400",
      getOpticalIconClasses("Star", "inline")
    )}
  />
))}
```

### Dynamic Icons

```tsx
const iconsData = [
  { Component: CheckCircle, name: 'CheckCircle' },
  { Component: Shield, name: 'Shield' },
  { Component: TrendingUp, name: 'TrendingUp' }
];

{iconsData.map(({ Component, name }) => (
  <Component
    className={cn(
      "h-5 w-5",
      getOpticalIconClasses(name, "inline")
    )}
  />
))}
```

## Icon Shape Reference

### Triangular Icons (Right Shift)
- ArrowRight, ArrowLeft, ArrowUp, ArrowDown
- ChevronRight, ChevronLeft, ChevronUp, ChevronDown
- Play, Forward, CaretRight, CaretLeft

### Circular Icons (Down Shift)
- Circle, CheckCircle, XCircle
- Info, InfoCircle
- Clock, Clock3
- Users, User
- Globe

### Bottom-Heavy Icons (Up Shift)
- Heart, HeartFilled
- Anchor

### Left-Heavy Icons (Right Shift)
- Truck, TruckDelivery
- ShoppingCart, ShoppingBag

### Star Icons (Slight Down Shift)
- Star, StarFilled, StarHalf

### Square/Symmetric Icons (No Adjustment)
- Package, Box, Square
- Shield, ShieldCheck
- Award, BookOpen, Headphones
- RefreshCw, Sprout

## Component Implementation Patterns

### Button Component

```tsx
import { getOpticalIconClasses } from "@/lib/utils/optical-alignment";

export const Button = ({ icon: Icon, iconPosition = "left", children }) => {
  return (
    <button>
      {iconPosition === "left" && Icon && (
        <Icon className={cn("h-4 w-4", getOpticalIconClasses(Icon.name, "button"))} />
      )}
      {children}
      {iconPosition === "right" && Icon && (
        <Icon className={cn("h-4 w-4", getOpticalIconClasses(Icon.name, "button"))} />
      )}
    </button>
  );
};
```

### Product Card

```tsx
// Star ratings
<Star className={cn("w-4 h-4", getOpticalIconClasses("Star", "inline"))} />

// Wishlist heart
<Heart className={cn("h-5 w-5", getOpticalIconClasses("Heart", "button"))} />

// Shipping info
<Truck className={cn("h-3 w-3", getOpticalIconClasses("Truck", "inline"))} />

// Add to cart button
<ShoppingCart className={cn("h-4 w-4 mr-2", getOpticalIconClasses("ShoppingCart", "button"))} />
```

## Typography Optical Alignment

### Uppercase Text

```tsx
// Uppercase text appears ~4% larger, needs reduction
<span className={cn(
  "uppercase",
  "tracking-wider text-[0.96em]" // getOpticalTextClasses("uppercase", "md")
)}>
  Shop Now
</span>
```

### Price Display

```tsx
// Currency symbols should be smaller and raised
<span className="text-base">
  <span className="text-[0.875em] align-[0.125em]">$</span>
  <span>29</span>
  <span className="text-[0.8em] align-[0.0625em]">.99</span>
</span>
```

## Testing Optical Alignment

### Visual QA Checklist

- [ ] Icons appear centered in buttons (not too high/low)
- [ ] Arrow icons don't feel left-heavy
- [ ] Star ratings feel balanced
- [ ] Heart icons don't appear bottom-heavy
- [ ] Loading spinners are visually centered
- [ ] Uppercase text doesn't dominate
- [ ] Price displays have proper hierarchy
- [ ] Icon-text pairs have comfortable spacing

### Browser Testing

Test in multiple browsers and zoom levels:
- Chrome (100%, 110%, 125%, 150%, 175%, 200%)
- Firefox
- Safari
- Mobile devices (iOS Safari, Chrome Android)

## Performance Considerations

### Build-time Optimization

Optical alignment utilities are pure CSS classes, adding minimal bundle size (~0.5KB gzipped).

### Runtime Performance

- Utilities use CSS transforms (GPU-accelerated)
- No JavaScript computation at runtime
- Classes are static and tree-shakeable

## Migration Guide

### Updating Existing Components

1. **Import utilities:**
   ```tsx
   import { cn } from "@/lib/utils";
   import { getOpticalIconClasses } from "@/lib/utils/optical-alignment";
   ```

2. **Identify icons that need adjustment:**
   - Arrows, carets (triangular)
   - Circles, clocks (circular)
   - Hearts (bottom-heavy)
   - Shopping carts, trucks (left-heavy)

3. **Apply optical classes:**
   ```tsx
   // Before
   <ArrowRight className="h-4 w-4" />

   // After
   <ArrowRight className={cn("h-4 w-4", getOpticalIconClasses("ArrowRight", "button"))} />
   ```

4. **Test visually** in the browser

### Batch Updates

Use find-and-replace with regex to update common patterns:

```regex
Find: <ArrowRight className="([^"]*)"
Replace: <ArrowRight className={cn("$1", getOpticalIconClasses("ArrowRight", "button"))}
```

## Common Pitfalls

### ❌ Don't: Apply optical alignment to already-aligned icons

```tsx
// Already perfectly centered SVG - no adjustment needed
<CustomPerfectlyCenteredIcon />
```

### ❌ Don't: Over-adjust icons

```tsx
// Too much adjustment
<ArrowRight className="translate-x-2" /> // 8px is too much!
```

### ✅ Do: Use context-appropriate adjustments

```tsx
// Button context (more prominent)
<Icon className={getOpticalIconClasses(name, "button")} />

// Inline text context (subtle)
<Icon className={getOpticalIconClasses(name, "inline")} />
```

### ✅ Do: Combine with existing classes properly

```tsx
// Correct: Use cn() to merge classes
<Icon className={cn("h-4 w-4 text-blue-500", getOpticalIconClasses(name, "button"))} />
```

## Advanced Patterns

### Custom Icon Shapes

Add new icon shapes to the mapping:

```typescript
// src/lib/utils/optical-alignment.ts
export const ICON_SHAPE_MAP: Record<string, IconShape> = {
  // ... existing icons
  MyCustomIcon: 'triangular',
  AnotherIcon: 'circular',
};
```

### Context-Specific Overrides

```tsx
// Different contexts need different adjustments
const context = isButton ? "button" : isNavItem ? "nav" : "inline";
<Icon className={getOpticalIconClasses(name, context)} />
```

### Conditional Optical Alignment

```tsx
// Only apply on certain screen sizes
<Icon className={cn(
  "h-4 w-4",
  lg && getOpticalIconClasses(name, "button")
)} />
```

## Resources

- [Medium: Optical Alignment in Design](https://medium.com/ringcentral-ux/eyeballing-or-optical-alignment-in-design-4ef5ab2d326f)
- [Figma: Optical Alignment](https://www.figma.com/blog/optical-adjustment/)
- [Refactoring UI: Visual Balance](https://www.refactoringui.com/)

## Maintenance

### Adding New Icons

1. Determine the icon's shape category
2. Add to `ICON_SHAPE_MAP` in `optical-alignment.ts`
3. Test in multiple contexts
4. Document in this guide

### Updating Adjustments

Optical alignment values may need tuning based on:
- Font changes
- Icon library updates
- Design system evolution

Always test visually after adjusting base values.

---

**Last Updated:** 2025-10-13
**Version:** 1.0.0
**Maintained By:** Development Team
