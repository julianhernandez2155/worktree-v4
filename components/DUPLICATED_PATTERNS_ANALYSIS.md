# Duplicated UI Patterns Analysis

## Summary
After analyzing 92 component files in the components directory, I've identified significant code duplication across multiple UI patterns that appear in 3+ places and should be extracted into reusable components.

## 1. Modal Patterns (Found in 11+ components)

### Common Modal Structure
- **Files**: ProjectApplicationModal, AddTaskModal, EditOrganizationModal, CreateProjectModal, AssignTaskModal, MakePublicModal, ApplicationReviewModal, TaskDetailModal, ProjectDetailModal
- **Duplicated Pattern**:
```tsx
// Fixed backdrop with centered modal
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <GlassCard className="max-w-[size] w-full max-h-[90vh] overflow-hidden">
    {/* Header with title and close button */}
    <div className="p-6 border-b border-dark-border">
      <div className="flex items-start justify-between">
        <h2 className="text-2xl font-bold text-white">Title</h2>
        <button onClick={onClose} className="p-2 hover:bg-dark-card rounded-lg">
          <X className="h-5 w-5 text-dark-muted" />
        </button>
      </div>
    </div>
    {/* Scrollable content */}
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-[header+footer])]">
      {content}
    </div>
    {/* Footer with action buttons */}
    <div className="p-6 border-t border-dark-border">
      <div className="flex gap-3">
        <button>Cancel</button>
        <button>Confirm</button>
      </div>
    </div>
  </GlassCard>
</div>
```

### Loading State in Modals
- **Files**: ProjectApplicationModal, EditOrganizationModal, multiple others
- **Pattern**: Full-screen loading spinner while data loads

## 2. Form Input Patterns (Found in 30+ components)

### Text Input Field
- **Duplicated in**: AuthForm, EditOrganizationModal, AddTaskModal, CreateProjectModal, ProjectApplicationModal, etc.
- **Pattern**:
```tsx
<input
  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg 
           text-white placeholder-dark-muted focus:outline-none focus:border-neon-green/50 
           transition-colors"
/>
```

### Textarea Field
- **Duplicated in**: Multiple modal forms
- **Pattern**: Same styling as input but with `resize-none` class

### Icon-prefixed Input
- **Duplicated in**: EditOrganizationModal, AddTaskModal, ProjectApplicationModal
- **Pattern**:
```tsx
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
  <input className="w-full pl-10 pr-4 py-2 ..." />
</div>
```

## 3. Card Components (Found in 8+ components)

### Project/Task Card Structure
- **Files**: ProjectCard, ProjectDiscoverCard, TaskCard (in MyTasksView), MemberCard, RoleCard
- **Common Elements**:
  - GlassCard wrapper with hover effects
  - Header with avatar/icon + title
  - Metadata section with icon + text pairs
  - Skills/tags section
  - Action buttons at bottom

### Card Hover States
- **Pattern**: `hover:border-[color] hover:shadow-lg transition-all`

## 4. Skill Badge Patterns (Found in 20+ components)

### Basic Skill Badge
- **Most common pattern**:
```tsx
<span className="px-2.5 py-1 rounded-md text-xs font-medium bg-dark-bg text-dark-text border border-dark-border">
  {skill}
</span>
```

### Matched/Active Skill Badge
- **Pattern with state**:
```tsx
<span className={cn(
  "px-2.5 py-1 rounded-md text-xs font-medium",
  isMatched 
    ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
    : "bg-dark-bg text-dark-text border border-dark-border"
)}>
```

### Skills List with Overflow
- **Pattern**: Show first 3-4 skills + "+X more" indicator

## 5. Empty States (Found in 7+ components)

### Common Empty State Pattern
- **Files**: ForYouPage, AllProjectsPage, MemberDirectory, ProjectsView
- **Elements**:
  - Centered container
  - Icon (often grayed out)
  - Title text
  - Description text
  - Optional action button

## 6. Loading States (Found in 36+ components)

### Inline Loading
- **Pattern**: LoadingSpinner component used consistently
- **Full-page loading**: Centered spinner with optional backdrop

### Skeleton Loading
- **Files**: DiscoverFeed, ProjectList, LoadingSkeleton component
- **Pattern**: Animated placeholder shapes

## 7. Icon + Text Patterns (Found in 52+ components)

### Metadata Display
- **Very common pattern**:
```tsx
<div className="flex items-center gap-2 text-dark-muted">
  <Icon className="h-4 w-4" />
  <span>{text}</span>
</div>
```

### Clickable Icon + Text
- **Pattern**: Same as above but wrapped in button/link

## 8. Date Formatting (Found in 17+ components)

### Relative Time Display
- **Files**: MemberCard, OrganizationProfile, others
- **Duplicated logic**: Converting dates to "X days/months/years ago"

### Deadline Formatting
- **Files**: ProjectCard, ProjectDetail, TaskDetailModal
- **Logic**: Format with color coding based on urgency

## 9. Button Patterns

### Primary Action Button
- **Using NeonButton consistently but with repeated wrapper patterns**

### Secondary/Ghost Button
- **Pattern**:
```tsx
<button className="px-4 py-2 text-dark-muted hover:text-white border border-dark-border 
                  hover:bg-dark-bg rounded-lg transition-colors">
```

### Icon Button
- **Pattern**: Square button with single icon, hover states

## 10. Form Validation & Error States

### Error Message Display
- **Pattern**:
```tsx
<p className="mt-1 text-sm text-red-400">{error.message}</p>
```

### Success Message Banner
- **Pattern**: Green-tinted banner with icon

## Recommendations for Extraction

### Priority 1 - Most Impact
1. **Modal** - Base modal component with header/body/footer slots
2. **FormInput** - Text input with label, error, icon support
3. **SkillBadge** - Skill display with matched/unmatched states
4. **Card** - Base card with common hover states
5. **IconText** - Icon + text display component

### Priority 2 - High Value
6. **EmptyState** - Configurable empty state component
7. **DateDisplay** - Relative/absolute date formatting
8. **Button** - Consistent secondary button styles
9. **FormField** - Complete form field with label/input/error
10. **LoadingState** - Page/section loading states

### Priority 3 - Nice to Have
11. **Avatar** - User/org avatar with fallback
12. **StatusBadge** - Generic status/role badges
13. **MetadataList** - List of icon + text items
14. **ActionMenu** - Dropdown menu pattern
15. **Toast/Alert** - Notification banners

## Code Duplication Statistics
- Modal backdrop/structure: ~11 instances
- Form input styling: ~30+ instances
- Skill badge pattern: ~20+ instances
- Icon + text pattern: ~50+ instances
- Card hover effects: ~8+ instances
- Empty state structure: ~7+ instances
- Date formatting logic: ~17+ instances
- Loading states: ~36+ instances

## Estimated Impact
Extracting these patterns could reduce the codebase by approximately 15-20% and significantly improve maintainability. The most impactful extractions would be Modal, FormInput, and SkillBadge components as they appear most frequently with the most code duplication.