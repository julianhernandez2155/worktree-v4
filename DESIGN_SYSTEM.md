# Worktree v4 Design System Documentation

## Overview
This document captures the current UI/UX patterns used across the Worktree v4 codebase and provides recommendations for maintaining consistency and improving the design system.

## Design Principles
- **Dark Theme First**: The application uses a sophisticated dark theme inspired by Spotify/Discord
- **Glass Morphism**: Extensive use of backdrop blur and semi-transparent surfaces
- **Neon Accents**: Strategic use of bright neon colors for CTAs and important UI elements
- **Micro-interactions**: Smooth transitions and hover states throughout

## Color System

### Core Colors
```css
/* Deep blacks - Primary surfaces */
dark-bg: #0A0A0B       /* Primary background */
dark-surface: #141416  /* Elevated surfaces */
dark-card: #1C1C1F     /* Card backgrounds */
dark-elevated: #242428 /* Further elevated */
dark-border: rgba(255, 255, 255, 0.1)

/* Neon accents */
neon-green: #00FF88    /* Primary CTA, success states */
neon-blue: #00D9FF     /* Secondary accent, info */
neon-coral: #FF6B6B    /* Warning, urgent, error */
neon-purple: #9B59FF   /* Premium, special features */
```

### Semantic Colors
- **Success**: `#00FF88` (neon-green)
- **Warning**: `#FFD93D` (yellow)
- **Error**: `#FF6B6B` (neon-coral)
- **Info**: `#00D9FF` (neon-blue)

### Match Quality Colors
Used for indicating how well opportunities match user skills:
- **Perfect Match**: `#00FF88` (green)
- **Strong Match**: `#00D9FF` (blue)
- **Good Match**: `#FFD93D` (yellow)
- **Stretch Match**: `#FF6B6B` (coral)
- **Reach Match**: `#9B59FF` (purple)

### Current Usage Pattern
✅ **Consistent**: Color tokens are well-defined in Tailwind config
✅ **Consistent**: Semantic colors are used appropriately
⚠️ **Inconsistent**: Some components use hard-coded color values instead of tokens

### Recommendations
1. Create a color palette component showcasing all colors
2. Add more granular color steps (50-900) for better flexibility
3. Ensure all components use color tokens from Tailwind config

## Typography System

### Font Families
- **Sans**: Inter, system-ui, -apple-system, sans-serif
- **Display**: Clash Display, Inter, system-ui, sans-serif (for headings)

### Type Scale
Current usage patterns found:
- `text-xs`: 0.75rem (12px) - Badges, small labels
- `text-sm`: 0.875rem (14px) - Secondary text, hints
- `text-base`: 1rem (16px) - Body text
- `text-lg`: 1.125rem (18px) - Subtitles
- `text-xl`: 1.25rem (20px) - Card titles
- `text-2xl`: 1.5rem (24px) - Section headings
- `text-3xl`: 1.875rem (30px) - Page titles
- `text-4xl`: 2.25rem (36px) - Hero text
- `text-5xl`: 3rem (48px) - Large displays

### Font Weights
- `font-normal`: 400 - Body text
- `font-medium`: 500 - Emphasis
- `font-semibold`: 600 - Headings, buttons
- `font-bold`: 700 - Strong emphasis

### Current Usage Pattern
✅ **Consistent**: Font families are well-defined
✅ **Consistent**: Type scale is mostly consistent
⚠️ **Inconsistent**: Some components mix font weights arbitrarily

### Recommendations
1. Create typography documentation with examples
2. Standardize heading hierarchy (h1-h6 mappings)
3. Create text style presets for common patterns

## Spacing System

### Padding Patterns
Most common padding values found:
- `p-2`: 0.5rem (8px) - Tight spacing
- `p-3`: 0.75rem (12px) - Compact elements
- `p-4`: 1rem (16px) - Default spacing
- `p-5`: 1.25rem (20px) - Medium cards
- `p-6`: 1.5rem (24px) - Large cards
- `p-8`: 2rem (32px) - Section padding

### Margin/Gap Patterns
- `gap-1`: 0.25rem (4px) - Inline elements
- `gap-2`: 0.5rem (8px) - Tight groups
- `gap-3`: 0.75rem (12px) - Default spacing
- `gap-4`: 1rem (16px) - Card sections
- `gap-6`: 1.5rem (24px) - Major sections
- `space-y-4`: Vertical spacing in forms

### Current Usage Pattern
✅ **Consistent**: Card component has standardized size variants (sm: p-4, md: p-5, lg: p-6)
✅ **Consistent**: Forms use consistent spacing (space-y-2 for field groups)
⚠️ **Inconsistent**: Some components use arbitrary spacing values

### Recommendations
1. Define spacing scale presets (xs, sm, md, lg, xl)
2. Create spacing utility classes for common patterns
3. Document spacing guidelines for different contexts

## Component Patterns

### Buttons

#### NeonButton Component
Primary button component with consistent styling:
```tsx
Variants: primary | secondary | ghost | danger
Sizes: sm (px-4 py-2) | md (px-6 py-3) | lg (px-8 py-4)
States: default, hover, active, disabled, loading
```

#### Current Usage Pattern
✅ **Consistent**: NeonButton is used throughout the app
✅ **Consistent**: Button sizes are standardized
✅ **Consistent**: Loading states with spinner
⚠️ **Inconsistent**: Some places still use raw button elements

#### Recommendations
1. Replace all raw button elements with NeonButton
2. Add icon-only button variant
3. Create button group component

### Cards

#### Card Component System
Well-structured compound component:
- `Card`: Base container with variants and sizes
- `CardHeader`: Title area with optional avatar/icon
- `CardTitle`: Consistent heading styles
- `CardBody`: Content area with vertical spacing
- `CardFooter`: Actions area with border

#### Current Usage Pattern
✅ **Consistent**: Card components are widely adopted
✅ **Consistent**: Glass morphism effects applied consistently
✅ **Consistent**: Hover states and animations

#### Recommendations
1. Continue using Card compound components
2. Add more card layout presets
3. Document card usage patterns

### Forms

#### FormField Components
Three main variants:
- `FormField`: Input fields with consistent styling
- `FormTextarea`: Textarea with same styling patterns
- `FormSelect`: Select dropdown with custom styling

Features:
- Label with required indicator
- Error states with icons
- Helper text/hints
- Consistent focus states (neon-green ring)
- Icon support

#### Current Usage Pattern
✅ **Consistent**: Form components have unified styling
✅ **Consistent**: Error handling patterns
✅ **Consistent**: Focus states with neon-green
⚠️ **Inconsistent**: Some forms don't use these components

#### Recommendations
1. Add FormCheckbox and FormRadio components
2. Create form layout utilities
3. Add form validation message animations

### Loading States

#### LoadingSpinner
Simple, consistent spinner with size variants:
- sm: 4x4 with 2px border
- md: 8x8 with 3px border
- lg: 12x12 with 4px border

#### Skeleton Component
Sophisticated skeleton with:
- Variants: text, circular, rectangular
- Animations: pulse, wave (shimmer), none
- Composite patterns: SkeletonCard, SkeletonList

#### Current Usage Pattern
✅ **Consistent**: Loading spinner design
✅ **Consistent**: Skeleton components well-structured
⚠️ **Inconsistent**: Not all loading states use these components

#### Recommendations
1. Create loading state guidelines
2. Add more skeleton presets
3. Implement progressive loading patterns

### Error States

#### ErrorMessage Component
Consistent error display with:
- Red color scheme with transparency
- AlertCircle icon
- Optional retry button
- Consistent padding and borders

#### EmptyState Component
Well-designed empty states with:
- Size variants (sm, md, lg)
- Optional icon
- Title and description
- Action buttons
- Preset states (no-results, no-data, error, etc.)

#### Current Usage Pattern
✅ **Consistent**: Error and empty state components
✅ **Consistent**: Color usage for error states
✅ **Consistent**: Icon usage

#### Recommendations
1. Use EmptyState for all empty data scenarios
2. Add error boundary component
3. Create inline error variants

## Animation & Transitions

### Transition Durations
- `duration-200`: Default for most transitions
- `duration-300`: Page/modal transitions
- `duration-500`: Fade in/out effects

### Animation Patterns
```css
/* Defined in Tailwind config */
fade-in, fade-out: Opacity transitions
slide-in, slide-out: Horizontal slides
scale-in: Scale + opacity
glow-pulse: Pulsing glow effect
float: Subtle floating animation
shimmer: Loading skeleton effect
```

### Framer Motion Usage
- GlassCard uses motion.div with opacity/y animations
- NeonButton uses whileHover and whileTap
- Smooth spring animations (stiffness: 400, damping: 17)

### Current Usage Pattern
✅ **Consistent**: Transition durations
✅ **Consistent**: Hover state transitions
✅ **Consistent**: Framer Motion spring settings
⚠️ **Inconsistent**: Some components use CSS animations, others use Framer Motion

### Recommendations
1. Standardize on Framer Motion for complex animations
2. Use CSS transitions for simple hover states
3. Create animation presets/variants
4. Add page transition animations

## Glass Morphism Effects

### Implementation
Three glass variants defined in globals.css:
```css
.glass: backdrop-blur-xl bg-dark-card/70 border border-dark-border
.glass-surface: backdrop-blur-xl bg-dark-surface/70 border border-dark-border
.glass-elevated: backdrop-blur-xl bg-dark-elevated/70 border border-dark-border
```

### Current Usage Pattern
✅ **Consistent**: Glass effects well-implemented
✅ **Consistent**: Backdrop blur values
✅ **Consistent**: Border colors

### Recommendations
1. Continue using glass variants
2. Consider performance impact on lower-end devices
3. Add glass intensity variants

## Shadow System

### Box Shadows
```css
glow-sm: 0 0 10px rgba(0, 255, 136, 0.3)
glow: 0 0 20px rgba(0, 255, 136, 0.4)
glow-lg: 0 0 30px rgba(0, 255, 136, 0.5)
glow-blue: 0 0 20px rgba(0, 217, 255, 0.4)
glow-purple: 0 0 20px rgba(155, 89, 255, 0.4)
dark: 0 2px 8px rgba(0, 0, 0, 0.3)
dark-lg: 0 8px 32px rgba(0, 0, 0, 0.4)
```

### Current Usage Pattern
✅ **Consistent**: Glow effects for neon elements
✅ **Consistent**: Dark shadows for depth
✅ **Consistent**: Shadow naming convention

## Accessibility Considerations

### Current State
✅ Color contrast meets WCAG AA for most text
✅ Focus states are visible with neon-green rings
✅ Interactive elements have hover states
⚠️ Some components missing ARIA labels
⚠️ Keyboard navigation could be improved

### Recommendations
1. Add skip navigation links
2. Ensure all interactive elements are keyboard accessible
3. Add ARIA labels to icon-only buttons
4. Test with screen readers
5. Add reduced motion preferences

## Component Library Recommendations

### High Priority
1. **Design Tokens File**: Create a centralized design tokens file
2. **Component Documentation**: Add Storybook or similar for component docs
3. **Style Guide**: Create visual style guide with do's and don'ts
4. **Component Audit**: Replace inconsistent implementations

### Medium Priority
1. **Animation Library**: Create reusable animation variants
2. **Layout Components**: Add consistent layout containers
3. **Theme Variants**: Prepare for light theme support
4. **Icon System**: Standardize icon usage and sizes

### Low Priority
1. **Design System Package**: Consider extracting to separate package
2. **Figma Integration**: Sync design tokens with Figma
3. **Visual Regression Tests**: Add screenshot testing
4. **Performance Monitoring**: Track animation performance

## Conclusion

The Worktree v4 design system shows strong consistency in many areas, particularly in:
- Color token definition
- Glass morphism implementation
- Core component patterns (Card, Button, Form)
- Animation approach

Areas for improvement:
- Enforcing token usage over hard-coded values
- Standardizing spacing patterns
- Completing component coverage
- Improving accessibility

The foundation is solid, and with the recommendations above, the design system can become even more robust and maintainable.