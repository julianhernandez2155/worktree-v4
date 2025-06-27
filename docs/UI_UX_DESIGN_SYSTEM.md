# Worktree v4 - UI/UX Design System

## Table of Contents
1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Component Library](#component-library)
5. [Layout System](#layout-system)
6. [Interaction Patterns](#interaction-patterns)
7. [Accessibility Guidelines](#accessibility-guidelines)
8. [Motion Design](#motion-design)

## Design Principles

### 1. **Clarity First**
Every interface element should have a clear purpose. Remove visual noise and focus on what helps users accomplish their goals.

### 2. **Progressive Disclosure**
Show only what's necessary at each step. Advanced features should be discoverable but not overwhelming.

### 3. **Consistent & Predictable**
Similar actions should look and behave similarly throughout the app. Users should never have to relearn patterns.

### 4. **Accessible by Default**
Design for all users from the start. WCAG 2.1 AA compliance is our baseline, not an afterthought.

### 5. **Performance as Design**
Fast interactions are good UX. Every design decision should consider its impact on performance.

## Color System

### Brand Colors
```css
:root {
  /* Primary - Professional blue with energy */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93bbfd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;

  /* Secondary - Growth green */
  --secondary-50: #f0fdf4;
  --secondary-100: #dcfce7;
  --secondary-200: #bbf7d0;
  --secondary-300: #86efac;
  --secondary-400: #4ade80;
  --secondary-500: #22c55e;
  --secondary-600: #16a34a;
  --secondary-700: #15803d;
  --secondary-800: #166534;
  --secondary-900: #14532d;

  /* Accent - Energetic orange */
  --accent-50: #fff7ed;
  --accent-100: #ffedd5;
  --accent-200: #fed7aa;
  --accent-300: #fdba74;
  --accent-400: #fb923c;
  --accent-500: #f97316;
  --accent-600: #ea580c;
  --accent-700: #c2410c;
  --accent-800: #9a3412;
  --accent-900: #7c2d12;
}
```

### Semantic Colors
```css
:root {
  /* Status Colors */
  --success: var(--secondary-500);
  --warning: var(--accent-500);
  --error: #ef4444;
  --info: var(--primary-500);

  /* Neutral Colors */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Dark Mode */
  --dark-bg: #0f172a;
  --dark-surface: #1e293b;
  --dark-border: #334155;
}
```

## Typography

### Font Stack
```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, 'Courier New', monospace;
}
```

### Type Scale
```css
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-5xl { font-size: 3rem; line-height: 1; }
```

## Component Library

### 1. **Atoms**

#### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Usage
<Button variant="primary" size="md" leftIcon={<PlusIcon />}>
  Create Project
</Button>
```

#### Input Component
```typescript
interface InputProps {
  type: 'text' | 'email' | 'password' | 'search';
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
}

// Usage
<Input
  type="email"
  label="University Email"
  helper="Use your .edu email address"
  required
/>
```

### 2. **Molecules**

#### SkillTag Component
```typescript
interface SkillTagProps {
  skill: Skill;
  size?: 'sm' | 'md';
  removable?: boolean;
  endorsed?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

// Visual Design
// - Rounded corners (radius-full)
// - Skill category determines color
// - Endorsement badge shows verification
// - Hover state shows tooltip with details
```

#### SearchBar Component
```typescript
interface SearchBarProps {
  placeholder?: string;
  filters?: Filter[];
  onSearch: (query: string, filters: Filter[]) => void;
  suggestions?: boolean;
  recentSearches?: string[];
}

// Features
// - Instant search with debouncing
// - Filter chips below search input
// - Recent searches dropdown
// - Keyboard navigation support
```

### 3. **Organisms**

#### ProjectCard Component
```typescript
interface ProjectCardProps {
  project: Project;
  variant: 'compact' | 'expanded';
  showOrganization?: boolean;
  showSkills?: boolean;
  onApply?: () => void;
}

// Card Structure
// - Header: Project name, status badge
// - Organization info with avatar
// - Description (truncated in compact)
// - Required skills as tags
// - Footer: Apply button, member count
```

#### DashboardStats Component
```typescript
interface DashboardStatsProps {
  stats: {
    label: string;
    value: number;
    change?: number;
    trend?: 'up' | 'down';
    icon?: React.ReactNode;
  }[];
}

// Visual Design
// - Grid layout (responsive columns)
// - Large number display
// - Trend indicator with color
// - Subtle animation on value change
```

### 4. **Templates**

#### Dashboard Layout
```typescript
interface DashboardLayoutProps {
  sidebar: {
    navigation: NavItem[];
    user: User;
    organization?: Organization;
  };
  header: {
    title: string;
    actions?: React.ReactNode;
    breadcrumbs?: Breadcrumb[];
  };
  children: React.ReactNode;
}

// Layout Structure
// - Fixed sidebar (collapsible on mobile)
// - Sticky header with actions
// - Main content area with padding
// - Responsive breakpoints
```

## Layout System

### Grid System
```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) { .container { max-width: 640px; } }
@media (min-width: 768px) { .container { max-width: 768px; } }
@media (min-width: 1024px) { .container { max-width: 1024px; } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }
```

### Spacing Scale
```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
}
```

## Interaction Patterns

### 1. **Loading States**
```typescript
// Skeleton Loading
<SkeletonLoader>
  <SkeletonLine width="60%" />
  <SkeletonLine width="100%" />
  <SkeletonLine width="80%" />
</SkeletonLoader>

// Progressive Loading
// 1. Show skeleton
// 2. Fade in content
// 3. Enable interactions
```

### 2. **Empty States**
```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Examples
// - No projects: "Create your first project"
// - No search results: "Try different keywords"
// - No skills: "Add skills to your profile"
```

### 3. **Error Handling**
```typescript
interface ErrorBoundaryProps {
  fallback: React.ComponentType<{ error: Error }>;
  onError?: (error: Error) => void;
}

// User-Friendly Error Messages
const errorMessages = {
  network: "Check your connection and try again",
  permission: "You don't have access to this resource",
  notFound: "We couldn't find what you're looking for",
  server: "Something went wrong on our end"
};
```

## Accessibility Guidelines

### 1. **Keyboard Navigation**
- All interactive elements accessible via keyboard
- Visible focus indicators (2px outline)
- Logical tab order
- Skip links for main content

### 2. **Screen Reader Support**
- Semantic HTML elements
- ARIA labels for icons
- Live regions for dynamic updates
- Alt text for all images

### 3. **Color Contrast**
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Don't rely on color alone
- Test with color blindness simulators

### 4. **Responsive Design**
- Touch targets minimum 44x44px
- Readable without horizontal scroll
- Zoom up to 200% without loss
- Orientation support

## Motion Design

### 1. **Micro-Interactions**
```css
/* Button hover */
.button {
  transition: all 0.2s ease;
}
.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Card entrance */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 2. **Page Transitions**
```typescript
// Framer Motion config
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

const transition = {
  type: "spring",
  stiffness: 260,
  damping: 20
};
```

### 3. **Skeleton Loading**
```css
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
```

## Component Usage Examples

### Student Dashboard
```tsx
<DashboardLayout>
  <DashboardStats stats={studentStats} />
  
  <Section title="Recommended Projects">
    <Grid cols={3}>
      {projects.map(project => (
        <ProjectCard 
          key={project.id}
          project={project}
          variant="compact"
        />
      ))}
    </Grid>
  </Section>
  
  <Section title="Your Skills">
    <SkillMatrix skills={userSkills} />
  </Section>
</DashboardLayout>
```

### Organization Management
```tsx
<OrgLayout organization={org}>
  <Tabs>
    <TabList>
      <Tab>Overview</Tab>
      <Tab>Members</Tab>
      <Tab>Projects</Tab>
      <Tab>Analytics</Tab>
    </TabList>
    
    <TabPanels>
      <TabPanel>
        <OrgOverview data={orgData} />
      </TabPanel>
      {/* Other panels */}
    </TabPanels>
  </Tabs>
</OrgLayout>
```

This design system provides a comprehensive foundation for building a consistent, accessible, and delightful user experience across the Worktree platform.