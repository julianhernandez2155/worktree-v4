# Card Component System

A comprehensive, reusable card component system that standardizes card patterns throughout the Worktree v4 codebase.

## Overview

The Card component system provides a flexible, composable approach to building consistent card-based UIs. It includes:

- Base Card component with variants and states
- Composable sub-components (Header, Body, Footer, etc.)
- Common UI patterns (metadata, skills, badges, avatars)
- TypeScript types for common data structures
- Responsive and accessible by default

## Installation

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
  CardFooter,
  Metadata,
  MetadataGroup,
  SkillTag,
  SkillsGroup,
  Badge,
  Avatar
} from '@/components/ui/Card';
```

## Basic Usage

### Simple Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Project Name</CardTitle>
    <CardSubtitle>Organization Name</CardSubtitle>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
</Card>
```

### Card with Icon and Action

```tsx
<Card variant="clickable" onClick={handleClick}>
  <CardHeader
    icon={Building}
    action={<Badge variant="success">Active</Badge>}
  >
    <CardTitle>Tech Club</CardTitle>
  </CardHeader>
</Card>
```

### Card with Metadata

```tsx
<Card>
  <CardBody>
    <MetadataGroup>
      <Metadata icon={Calendar}>Due July 15</Metadata>
      <Metadata icon={Clock}>10h/week</Metadata>
      <Metadata icon={MapPin}>Remote</Metadata>
      <Metadata icon={Users}>5 members</Metadata>
    </MetadataGroup>
  </CardBody>
</Card>
```

## Component API

### Card

The main container component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'default' \| 'clickable' \| 'selected' \| 'warning' \| 'error' \| 'success'` | `'default'` | Visual variant |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding size |
| animated | `boolean` | `true` | Enable enter animation |
| hover | `boolean` | `true` | Enable hover effects |
| glow | `'green' \| 'blue' \| 'purple' \| 'none'` | `'none'` | Glow effect color |
| glassVariant | `'default' \| 'surface' \| 'elevated'` | `'default'` | Glass effect variant |

### CardHeader

Container for card header content with optional icon/avatar and action.

| Prop | Type | Description |
|------|------|-------------|
| avatar | `ReactNode` | Avatar component |
| icon | `LucideIcon` | Icon component |
| iconClassName | `string` | Icon styling |
| action | `ReactNode` | Action element (button, badge, etc.) |

### Skills Components

```tsx
<SkillsGroup label="Required Skills" maxVisible={4} totalCount={10}>
  <SkillTag variant="matched">React</SkillTag>
  <SkillTag variant="required">Node.js</SkillTag>
  <SkillTag>TypeScript</SkillTag>
</SkillsGroup>
```

### Avatar

```tsx
<Avatar
  src="/path/to/image.jpg"
  fallback="JD"
  size="md"
  status="online"
/>
```

## Common Patterns

### Project Card

```tsx
function ProjectCard({ project }: { project: Project }) {
  return (
    <Card variant="clickable" onClick={() => navigate(`/project/${project.id}`)}>
      <CardHeader
        icon={Building}
        action={
          project.match_score >= 70 && (
            <Badge variant="success">{project.match_score}% match</Badge>
          )
        }
      >
        <CardSubtitle>{project.organization.name}</CardSubtitle>
        <CardTitle size="lg">{project.name}</CardTitle>
      </CardHeader>

      <CardBody>
        <MetadataGroup>
          <Metadata icon={Calendar}>Apply by {formatDate(project.deadline)}</Metadata>
          <Metadata icon={Clock}>{project.commitment_hours}h/week</Metadata>
        </MetadataGroup>

        <SkillsGroup label="Skills Needed">
          {project.required_skills.map(skill => (
            <SkillTag
              key={skill}
              variant={project.matched_skills.includes(skill) ? 'matched' : 'required'}
            >
              {skill}
            </SkillTag>
          ))}
        </SkillsGroup>
      </CardBody>

      <CardFooter>
        <button>Save</button>
        <button>Apply</button>
      </CardFooter>
    </Card>
  );
}
```

### Member Card (List View)

```tsx
function MemberListCard({ member }: { member: Member }) {
  return (
    <Card variant="clickable" size="sm">
      <div className="flex items-center gap-4">
        <Avatar
          src={member.user.avatar_url}
          fallback={getInitials(member.user.full_name)}
          status="online"
        />
        
        <div className="flex-1">
          <CardTitle>{member.user.full_name}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="info" size="xs">{member.role}</Badge>
            <span className="text-sm text-gray-400">{member.user.major}</span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </Card>
  );
}
```

## Styling

The Card system uses Tailwind CSS classes and follows the established design system:

- Dark theme with glass morphism effects
- Neon accent colors (green, blue, purple, coral)
- Consistent spacing and typography
- Smooth transitions and hover states

## Accessibility

- Proper semantic HTML structure
- Keyboard navigation support for interactive cards
- ARIA attributes where needed
- Focus indicators for interactive elements
- Color contrast compliant with WCAG standards

## Migration Guide

To migrate existing card implementations:

1. Import the Card components
2. Replace the outer container with `<Card>`
3. Use `CardHeader`, `CardBody`, `CardFooter` for structure
4. Replace custom metadata sections with `Metadata` components
5. Use `SkillTag` and `SkillsGroup` for skills display
6. Replace custom badges with the `Badge` component

Example migration:

```tsx
// Before
<GlassCard className="cursor-pointer p-5">
  <div className="flex items-start gap-3 mb-4">
    <Building className="w-5 h-5" />
    <div>
      <h3 className="font-semibold">{title}</h3>
    </div>
  </div>
</GlassCard>

// After
<Card variant="clickable">
  <CardHeader icon={Building}>
    <CardTitle>{title}</CardTitle>
  </CardHeader>
</Card>
```

## Best Practices

1. **Use semantic variants**: Choose the appropriate variant (`clickable`, `warning`, etc.) based on the card's purpose
2. **Compose, don't override**: Use the provided sub-components rather than custom implementations
3. **Consistent sizing**: Use the size prop rather than custom padding
4. **Accessible interactions**: Ensure all interactive elements have proper labels and keyboard support
5. **Performance**: Use `animated={false}` for large lists of cards

## Examples

See `Card.examples.tsx` for comprehensive examples of:
- Project cards
- Member cards (grid and list views)
- Role succession cards
- Task cards
- Stats cards
- And more...