# Worktree UI Aesthetic - Core Design Language

## Overall Visual Identity

### Design Philosophy
"Premium Dark with Playful Intelligence" - Combines the sophistication of Linear/Notion with the engagement of Duolingo. Think of it as Spotify's dark elegance meets Discord's friendly community vibe, with AI elements inspired by Arc Browser's proactive assistance.

### Reference Apps & Inspiration
- **Linear**: Clean geometric shapes, subtle gradients, professional dark theme
- **Spotify**: Rich blacks, vibrant accent colors, content-first design
- **Discord**: Friendly dark UI, chat-first interface, community feel
- **Duolingo**: Gamification elements, encouraging mascot, progress celebration
- **Arc Browser**: AI-driven features with personality, proactive suggestions
- **BeReal**: Authentic, time-based urgency, "do it now" mentality

## Color System

### Base Palette
```css
/* Deep blacks like Spotify/Discord */
--primary-bg: #0A0A0B;      /* Deeper than Discord's #2B2D31 */
--secondary-bg: #141416;    /* Similar to Linear's elevated surfaces */
--surface-1: #1C1C1F;       /* Card backgrounds like Notion's dark theme */
--surface-2: #242428;       /* Elevated surfaces like Figma's panels */

/* Neon accents inspired by Vercel/Linear */
--spring-green: #00FF88;    /* Primary - brighter than Spotify's green */
--electric-blue: #00D9FF;   /* Like Linear's blue accent */
--warm-coral: #FF6B6B;      /* Urgent/warning like Todoist's priority */
--deep-purple: #9B59FF;     /* Premium like Discord Nitro */
```

### Color Application
- **Backgrounds**: Deep blacks with subtle blue/purple undertones (like GitHub dark mode)
- **Cards**: Slight elevation with 5% lighter background (like Notion blocks)
- **CTAs**: Vibrant spring green with glow effect (like Duolingo's "Continue" button)
- **Interactive**: Electric blue hovers (like Linear's selection states)

## Typography

### Font Strategy
Similar to Vercel and Linear - clean, modern, geometric
```css
/* Primary: Inter like GitHub/Linear */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Display: Clash Display for personality like Figma's marketing */
font-family: 'Clash Display', 'Inter', sans-serif;
```

### Type Scale
Following Tailwind's default scale (1.250 ratio):
- **12px**: Small labels (like Slack's timestamps)
- **14px**: Body text (like Notion's default)
- **16px**: Interface text (like Linear's UI)
- **20px**: Headings (like Discord's channel names)
- **24px+**: Page titles (like Spotify's playlist names)

## Visual Effects

### Glass Morphism
Inspired by macOS Big Sur and Windows 11:
```css
/* Like Apple Music's now playing bar */
backdrop-filter: blur(20px);
background: rgba(28, 28, 31, 0.7);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Shadows & Depth
- Subtle shadows like Figma: `0 2px 8px rgba(0, 0, 0, 0.3)`
- Glow effects like Discord's online status: `0 0 20px rgba(0, 255, 136, 0.4)`
- No harsh shadows - everything floats gently like Linear

### Gradients
Taking cues from Stripe and Vercel:
- Subtle background gradients (5-10% opacity)
- Vibrant gradients on CTAs and progress bars
- Radial gradients for emphasis (like Vercel's hero sections)

## Component Patterns

### Cards
Reference: Linear's task cards + Notion's blocks
- Rounded corners (8-12px) like Spotify
- Subtle borders like GitHub's dark theme
- Hover states that slightly elevate (like Trello)
- Glass effect on important cards

### Buttons
Reference: Duolingo's engaging CTAs
- Full-width primary buttons (mobile-first like TikTok)
- 48px height for easy tapping
- Spring green with subtle glow
- Micro-animations on press (scale 0.95)

### Navigation
Reference: Instagram/TikTok bottom nav
- 88px height bottom bar
- Frosted glass effect like iOS
- Active tab scales up (like Twitter)
- Icons + labels (unlike Instagram's icon-only)

### Progress Indicators
Reference: Duolingo's progress bars + LinkedIn's skill meters
- Gradient fills (current level in green)
- Smooth animations
- Percentage labels
- Celebratory effects on completion

## Animations & Transitions

### Motion Principles
Following Framer's animation guidelines:
- Spring animations for natural feel (like iOS)
- 200-300ms duration for most transitions
- Ease-out for entries (like Material Design)
- 60fps target (like native apps)

### Specific Animations
- **Page transitions**: Slide from right (like iOS navigation)
- **Card appearances**: Stagger fade-in (like Pinterest)
- **Loading states**: Skeleton screens (like Facebook)
- **Celebrations**: Confetti particles (like Duolingo streaks)

## Information Density

### Mobile-First Approach
Like TikTok and BeReal:
- One primary action per screen
- Generous whitespace
- Large touch targets
- Swipe gestures for navigation

### Progressive Disclosure
Like Linear and Notion:
- Start simple, reveal complexity
- Expandable sections
- Contextual options
- Hidden power features

## Mood & Atmosphere

### Overall Feel
- **Professional** like Linear/Notion (this is serious career building)
- **Friendly** like Discord (peer-to-peer community)
- **Encouraging** like Duolingo (celebrate every win)
- **Focused** like Forest app (time-based productivity)
- **Premium** like Spotify/Arc (users feel they're using something special)

### Emotional Design
- Dark theme reduces anxiety (like Discord's comfort)
- Neon accents create energy (like gaming interfaces)
- Rounded corners feel approachable (like Spotify)
- Smooth animations feel polished (like Apple)

## Anti-Patterns to Avoid

### What We're NOT
- Not corporate like LinkedIn (too stiff)
- Not cluttered like Jira (too complex)
- Not flat like Microsoft Teams (too boring)
- Not aggressive like Robinhood (too pushy)
- Not childish like some edtech (still professional)

## Summary for Replication

To replicate Worktree's aesthetic, imagine:
- Spotify's premium dark interface
- With Linear's clean geometric components
- Discord's friendly community feel
- Duolingo's encouraging gamification
- Arc Browser's intelligent assistance
- BeReal's time-based urgency

The result is a premium, dark-themed productivity app that feels both professional and approachable, with AI woven naturally throughout rather than bolted on. Every interaction should feel smooth, purposeful, and rewarding.