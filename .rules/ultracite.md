# Ultracite Code Quality Rules

This project uses Ultracite (Biome) for linting and formatting. Please adhere to these rules when writing code.

## Formatting

- **Indentation**: Use tabs (width: 2)
- **Line Width**: Maximum 120 characters
- **Quotes**: Use double quotes for strings
- **Semicolons**: Always use semicolons
- **Trailing Commas**: Use ES5-style trailing commas
- **Arrow Parentheses**: Always include parentheses around arrow function parameters
- **Bracket Spacing**: Include spaces inside object literal braces

## Import Organization

- Imports are automatically organized and sorted
- Remove unused imports
- Group imports by: React/Next.js → Third-party → Internal (@/) → Relative

## Code Quality

### Complexity
- Keep functions simple and focused (max complexity: 15)
- Break down complex functions into smaller, testable units
- Limit function length (max: 60 lines)

### Naming
- Use descriptive, meaningful names
- Variables and functions: camelCase
- Components and classes: PascalCase
- Constants: UPPER_SNAKE_CASE
- Avoid single-letter names except for iterators

### TypeScript
- Always provide explicit types for function parameters and return values
- Avoid using `any` - use `unknown` if type is truly unknown
- Use type inference where appropriate
- Define interfaces for object shapes
- Use generics for reusable components

### React/Next.js
- Use functional components with hooks
- Server Components by default (no "use client" unless needed)
- Client Components only when using interactivity, hooks, or browser APIs
- Always memoize expensive calculations with useMemo
- Use useCallback for functions passed as props to memoized components
- Destructure props in function parameters

### Best Practices
- No console.log in production code (use console.warn or console.error if needed)
- Handle errors properly with try/catch
- Always provide alt text for images
- Use semantic HTML elements
- Ensure accessibility (WCAG AA compliance)
- No unused variables or parameters
- No empty interfaces or types

## File Structure

```
/src
  /app              # Next.js App Router pages
  /components       # Reusable components
    /ui            # shadcn/ui components
    /features      # Feature-specific components
    /sections      # Page sections
  /lib              # Utilities and helpers
  /hooks            # Custom React hooks
  /types            # TypeScript type definitions
```

## When Writing Code

1. **Always format code** according to Biome rules
2. **Remove unused imports** and variables
3. **Add proper TypeScript types** for all functions and variables
4. **Use meaningful variable names** that describe their purpose
5. **Keep functions small** and focused on a single task
6. **Write accessible HTML** with proper ARIA attributes
7. **Handle errors** gracefully with try/catch blocks
8. **Optimize performance** with React.memo, useMemo, useCallback where appropriate

## Running Linter

```bash
npm run lint           # Check for issues
npm run lint:fix       # Fix issues automatically
```

## Common Issues to Avoid

- ❌ Using `any` type
- ❌ Unused variables or imports
- ❌ console.log statements
- ❌ Missing alt attributes on images
- ❌ Overly complex functions
- ❌ Missing error handling
- ❌ Inconsistent quote styles
- ❌ Missing semicolons
- ❌ Improper import ordering

## Next.js Specific

- Use `next/image` for all images
- Use `next/link` for all internal links
- Use Server Components when possible
- Use "use client" directive only when necessary
- Implement proper loading states and error boundaries
