# Worktree v4 - Project Context for Claude

## Project Overview
Worktree v4 is a high-performance web platform that bridges campus involvement with career readiness for undergraduate students. The platform focuses on skill-driven opportunity discovery, organization management, and career capital verification.

## Technical Stack
- **Frontend**: Next.js 14 with App Router (React 18)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Hosting**: Vercel (Frontend) + Supabase Cloud (Backend)
- **Mobile**: React Native (shared codebase)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand + React Query
- **Testing**: Vitest + Playwright

## Performance Targets
- First Contentful Paint: < 1.2s
- Time to Interactive: < 2.5s
- Cumulative Layout Shift: < 0.1
- JavaScript bundle: < 200KB gzipped
- Database query response: < 100ms (p95)

## Key Optimizations Implemented

### Database Performance
- Comprehensive indexing strategy for all foreign keys and frequent queries
- Full-text search using PostgreSQL tsvector with GIN indexes
- Materialized views for analytics and complex aggregations
- Vector similarity search for AI-powered recommendations
- Row Level Security (RLS) for efficient permission checking
- Connection pooling via Supabase

### Frontend Performance
- Server-side rendering for SEO-critical pages
- Static generation for marketing pages
- Incremental Static Regeneration (ISR) for dynamic content
- Image optimization with next/image
- Route-based code splitting
- Optimistic UI updates
- React Server Components for reduced client bundle
- Edge middleware for authentication

### Real-time Features
- Debounced presence updates (50ms throttle)
- Activity feed aggregation
- WebSocket connection management with exponential backoff
- Efficient subscription management

### Caching Strategy
- Browser cache: Static assets (1 year)
- CDN cache: ISR pages with stale-while-revalidate
- Application cache: React Query with smart invalidation
- Database cache: Materialized views (5-minute refresh)

## Development Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint

# Database migrations
npm run db:migrate

# Generate types from database
npm run db:types
```

## Project Structure
```
/worktree-v4
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes (minimal, mostly Supabase)
│   └── layout.tsx         # Root layout with providers
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (buttons, cards, etc.)
│   └── features/         # Feature-specific components
├── lib/                   # Utility functions and configurations
│   ├── supabase/         # Supabase client and utilities
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper functions
├── public/               # Static assets
├── styles/               # Global styles and Tailwind config
├── types/                # TypeScript type definitions
└── supabase/             # Database migrations and functions
    ├── migrations/       # SQL migration files
    └── functions/        # Edge functions
```

## Key Features

### For Students
- Skill-based opportunity discovery
- One-click applications with profile
- Visual skill progression dashboard
- Portfolio builder with verified experiences
- Peer mentorship connections

### For Organization Leaders
- Member skill directory
- Project and task management
- Automated progress tracking
- Event templates and playbooks
- Annual impact reporting

### For Administrators
- Real-time engagement analytics
- Demographic insights
- At-risk student identification
- Accreditation report generation
- ROI tracking

## Security Considerations
- All API calls go through Supabase RLS policies
- JWT-based authentication with secure httpOnly cookies
- CSRF protection on all mutations
- Input sanitization for XSS prevention
- Rate limiting on API endpoints
- FERPA compliance for student data

## Deployment Strategy
- Feature branches deployed to Vercel preview URLs
- Main branch auto-deploys to production
- Database migrations run via GitHub Actions
- Environment variables managed in Vercel/Supabase dashboards
- Monitoring via Vercel Analytics and Supabase Dashboard

## Performance Monitoring
- Web Vitals tracking with Vercel Analytics
- Custom performance marks for key user journeys
- Database query performance via pg_stat_statements
- Error tracking with Sentry integration
- Real User Monitoring (RUM) for actual performance data

## Contact & Support
- Technical issues: Create GitHub issue
- Architecture decisions: See ADR folder in docs/
- Performance concerns: Check monitoring dashboards first
- Security issues: Email security@worktree.edu

## Database Schema Summary

### Core Tables
- **profiles**: User profiles linked to auth.users(id)
- **organizations**: Student orgs with unique slugs
- **organization_members**: Junction table (org_id, user_id, role)
- **skills**: Master skill list with categories
- **member_skills**: User skills (normalized, source tracking)
- **internal_projects**: Org projects
- **contributions**: Tasks (includes subtasks as JSONB)
- **task_assignees**: Multiple assignees per task
- **task_required_skills**: Required/preferred skills per task

### Key Relationships
- Users → Organizations (many-to-many via organization_members)
- Organizations → Projects (one-to-many)
- Organizations → Teams (one-to-many via organization_teams)
- Projects → Tasks/Contributions (one-to-many)
- Projects → Teams (many-to-one, optional assignment)
- Tasks → Assignees (many-to-many via task_assignees)
- Users → Skills (many-to-many via member_skills)
- Tasks → Required Skills (many-to-many via task_required_skills)
- Teams → Members (many-to-many via team_members)

### Important Implementation Notes
- All IDs are UUIDs (gen_random_uuid())
- All timestamps use timestamptz
- Subtasks stored as JSONB array in contributions.subtasks
- Skills normalized via member_skills (not arrays in profiles)
- contributions.contributor_id is LEGACY - use task_assignees
- Missing universities table (referenced by profiles.university_id)

### Teams/Cabinets Tables (Added July 2025)
- **organization_teams**: Teams within organizations (id, name, description, org_id)
- **team_members**: Junction table for team membership (team_id, user_id, role)
- **Project Enhancement Fields**: team_id, lead_id, priority, due_date, labels[]
- **Task Status Tracking**: status column in contributions (todo, in_progress, done)

## Recent Feature Updates (June 28, 2025)

### Navigation System
- **Top Navigation Bar**: Centered main navigation with Discover, Organizations, Portfolio
- **Context Sidebar**: Dynamic sidebar that changes based on current page context
- **Persistent Layout**: Combined TopNavBar and ContextSidebar in PersistentLayout wrapper

### Discover Page Enhancements
- **For You Page**: Curated experience showing only top 4 matches (50%+ match score)
- **All Projects Page**: Full browsing with search, filters, and infinite scroll
- **Sprout Empty State**: Friendly mascot guidance when no good matches found
- **Ambient Orbs**: Subtle background animation replacing particle effects

### Project Cards Optimization
- **Larger project titles** (text-xl, font-bold)
- **Skills reorganization**:
  - "Skills Needed": Shows required skills (green for matched, gray for missing)
  - "Skill Growth Opportunities": Placeholder for AI-generated skill suggestions
- **Commitment levels**: Low/Medium/High/Intensive instead of hours
- **Clickable org names**: Links to organization profile page

### Organization Profile Page
- **Route**: `/dashboard/org/[slug]/profile`
- **Features**:
  - Header with logo, name, verification badge, and 5 stat cards
  - Stats are clickable: Members links to member page, others switch tabs
  - Changed "Open Positions" to "Get Involved" (more appropriate for student orgs)
  - Added "Skills Developed" stat showing unique skills count
  - Three tabs: About (mission/values), Projects (opportunities), Contact
  - Admin edit button (visible to org admins only)
  - Ready for future public viewing at `/org/[slug]`
- **About Tab Layout**: 
  - 2-column grid on desktop for better space utilization
  - Left column: Mission, What We Do, Skills You'll Gain
  - Right column: Leadership Team, Recent Activity
  - Full width: Values section
- **Real Data Integration**:
  - Leadership Team: Shows actual org leaders with profile links
  - Skills You'll Gain: Aggregated from all project skills
  - Recent Activity: Shows completed tasks or fallback messages
- **Integration**: Org names on project cards link to profiles

### Database Considerations
- Public projects use `internal_projects` table with `is_public=true`
- Organization profiles pull from existing `organizations` table
- Leadership roles: president, vice_president, treasurer, secretary, admin
- Consider adding fields: mission, values, social_links, founded_date

## Task Management System (July 2025)

### Comprehensive Task & Subtask Management
- **Full Kanban Implementation**: Drag-and-drop task boards with real-time updates
- **Task Hierarchy**: Projects → Tasks (contributions) → Subtasks (JSONB)
- **Multiple Assignees**: Tasks support multiple team members via task_assignees
- **Skill Requirements**: Define required/preferred skills per task
- **Progress Tracking**: Visual progress indicators and completion states

### Key Components
- **TaskKanbanBoard**: Main kanban board for task management
- **DroppableTaskColumn**: Drag-and-drop enabled columns (To Do, In Progress, Done)
- **SortableTaskCard**: Individual task cards with inline editing
- **Task Detail Modal**: Full task editing with description, assignees, skills

### Database Structure
- **contributions**: Main tasks table (includes subtasks as JSONB array)
- **task_assignees**: Junction table for multiple assignees per task
- **task_required_skills**: Required and preferred skills per task
- **Subtask Schema**: `{id, title, completed, assignee_id}[]` stored in JSONB

### Organization Profile Edit Mode (June 28, 2025 - Part 2)
- **EditOrganizationModal Component**: Full-featured modal for editing organization details
  - Basic Info: name, description, category
  - About: mission, what we do, values (dynamic list)
  - Contact: email, website, location, meeting schedule, join process
  - Social Media: dynamic links with platform selection
- **Database Migration**: Added new fields to organizations table
  - mission, what_we_do, values[], email, location
  - social_links (JSONB array), meeting_schedule, join_process
  - achievement and image_url added to internal_projects
- **Form Features**:
  - react-hook-form for form management
  - Real-time validation with error messages
  - Dynamic fields for values and social links
  - Success/error notifications
  - Auto-close on successful save
- **Security**: RLS policies ensure only org admins can edit
- **UI Updates**: 
  - Edit button opens modal when clicked by admin
  - OrganizationProfileWrapper handles data refresh
  - Social media links now display from database with proper icons

## Projects Hub Major Redesign (June 30, 2025)

### Linear-Inspired UI Implementation
- **Complete Frontend Redesign**: Rebuilt Projects page UI inspired by Linear.app
- **Dense List View**: Default view with all critical information visible at a glance
- **Board View**: Alternative kanban-style view for visual project management
- **Grid View**: Card-based grid layout for visual browsing
- **Sliding Detail Pane**: 600px fixed-width panel that doesn't navigate away
- **Real-time Updates**: WebSocket subscriptions for project and task changes

### Enhanced Components & Views
- **ProjectBoardViewDnD**: Drag-and-drop enabled board view
- **ProjectListViewEnhanced**: Advanced list view with inline editing
- **ProjectListViewGrid**: Grid layout with project cards
- **DroppableColumn**: Kanban columns that accept dragged items
- **SortableProjectCard**: Draggable project cards
- **CelebrationAnimation**: Confetti animation for task completion
- **CardLightTrace**: Visual effects for card interactions
- **QuickActionButtons**: Contextual actions for projects
- **SmartInsightsBar**: AI-powered project insights and suggestions

### Enhanced Project List Features
- **Customizable Columns**: 
  - DisplayMenu component with View Options and Columns tabs
  - 42 available columns organized in 7 categories
  - Default columns: name, lead, team, progress, skill_gaps, due_date, status
  - Persistent column preferences using localStorage
- **Interactive Empty States**: Icon-only placeholders for missing data
  - Lead: UserPlus icon in dashed circle
  - Team: Plus icon in dashed square
  - Priority: Flag icon
  - Due Date: CalendarPlus icon
  - All clickable to add/edit data inline
- **Column Alignment**: 
  - Project name: left-aligned
  - All other columns: right-aligned
  - Consistent alignment between headers and content

### Inline Editing Components
- **InlineStatusEditor**: Quick status changes without leaving the list
- **InlinePriorityEditor**: Priority selection with color-coded badges
- **InlineDateEditor**: Date picker with smart formatting (Today, Tomorrow, X days)
- **InlineLeadEditor**: Member selection dropdown with search and avatars

### Teams/Cabinets System
- **Database Migration 018**: Added organization_teams and team_members tables
- **Project Enhancements**: Added team_id, lead_id, priority, due_date, labels
- **RLS Policies**: Team visibility for org members, management for admins/leads

### Performance & UX Improvements
- **Fixed Positioning**: Detail pane uses fixed positioning to prevent layout shift
- **Memoized Components**: ProjectRow component uses React.memo for performance
- **Virtual Scrolling Ready**: Structure supports future virtual list implementation
- **Keyboard Shortcuts**: Extensive shortcuts for power users (⌘K search, arrow navigation)
- **Bulk Actions**: Checkbox selection with bulk operations bar

### Visual Risk Indicators
- **Overdue Projects**: Red background tint with pulsing alert icon
- **Skill Gaps**: Yellow lightbulb icon with count
- **Smart Sorting**: Overdue projects automatically prioritized to top

### Empty State Design
- **Beautiful Animation**: Floating rocket and plus icons
- **Role-Based Messaging**: Different messages for admins vs members
- **Helpful Tips**: Three tip cards for admins on getting started

### Next Steps for Future Development
- Column drag-to-reorder functionality
- Column width adjustment and persistence
- Inline team editor component
- Advanced filtering UI
- Saved view presets
- Export functionality

## UI Component Library

### Core UI Components
- **DatePicker**: Custom date picker with smart formatting (Today, Tomorrow, X days)
- **PriorityIcon**: Priority visualization with color-coded icons
- **ImageCropper**: Avatar and image editing with crop functionality
- **VirtualList**: Performance-optimized list rendering for large datasets
- **RealtimeIndicator**: Shows real-time connection status
- **EmptyProjectsState**: Beautiful empty states with contextual guidance

### Project Management Components
- **InlineStatusEditor**: Quick status changes without leaving context
- **InlinePriorityEditor**: Priority selection with visual feedback
- **InlineDateEditor**: Date editing with calendar picker
- **InlineLeadEditor**: Member selection with avatars and search
- **InlineNameEditor**: In-place project name editing
- **InlineProgressEditor**: Visual progress bar editor
- **DisplayMenu**: Column and view customization interface
- **CreateProjectModalLinear**: Linear-inspired project creation

### Profile System Enhancements (July 2025)

### Enhanced User Profiles
- **Extended Profile Fields**: Cover photos, taglines, bio, social links
- **Avatar System**: Custom avatar upload with image cropping
- **Username Generation**: Automatic username population (migration 013)
- **Profile Completeness**: Tracking and visual indicators

### Database Migrations
- **Migration 013**: Populate usernames for existing users
- **Migration 014**: Add extended profile fields
- **Migration 015**: Create avatars storage bucket
- **Migration 016**: Performance indexes for profile queries
- **Migration 017**: Add cover_photo_url and tagline fields
- **Migration 018**: Additional profile customization fields

## Recent Feature Updates (July 2025)

### Project Detail Pages
- **Full Project Management**: Complete project pages at `/dashboard/org/[slug]/projects/[projectId]`
- **Task Kanban Board**: Drag-and-drop task management with real-time updates
- **Integrated Views**: Switch between Overview, Tasks, Team, and Analytics tabs
- **Real-time Collaboration**: Live presence indicators and activity feeds

### Enhanced Drag-and-Drop
- **Project Kanban**: Drag projects between status columns
- **Task Management**: Drag tasks between To Do, In Progress, and Done
- **Optimistic Updates**: Instant UI feedback with rollback on errors
- **Touch Support**: Mobile-friendly drag interactions

### Performance Enhancements
- **Virtual Scrolling**: Implemented for large lists (100+ items)
- **Memoized Components**: React.memo for list items
- **Debounced Search**: 300ms debounce on search inputs
- **Lazy Loading**: Components loaded on-demand

### Additional UI Polish
- **Celebration Animations**: Confetti on task/project completion
- **Card Light Traces**: Visual effects on hover/interaction
- **Smart Insights Bar**: AI-powered suggestions (placeholder for future ML)
- **Empty States**: Context-aware empty state components

### Kanban Implementation Plan
- Detailed implementation strategy documented in `KANBAN_IMPLEMENTATION_PLAN.md`
- Covers architecture decisions, component structure, and state management
- Includes performance considerations and future extensibility

## Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

### File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the gemini command:

#### Examples:

**Single file analysis:**
```bash
gemini -p "@src/main.py Explain this file's purpose and structure"
```

**Multiple files:**
```bash
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"
```

**Entire directory:**
```bash
gemini -p "@src/ Summarize the architecture of this codebase"
```

**Multiple directories:**
```bash
gemini -p "@src/ @tests/ Analyze test coverage for the source code"
```

**Current directory and subdirectories:**
```bash
gemini -p "@./ Give me an overview of this entire project"

# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"
```

### Implementation Verification Examples

**Check if a feature is implemented:**
```bash
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"
```

**Verify authentication implementation:**
```bash
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"
```

**Check for specific patterns:**
```bash
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"
```

**Verify error handling:**
```bash
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"
```

**Check for rate limiting:**
```bash
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"
```

**Verify caching strategy:**
```bash
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"
```

**Check for specific security measures:**
```bash
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"
```

**Verify test coverage for features:**
```bash
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"
```

### Multi-Modal Processing for UI Design

**Analyze and replicate UI designs from images:**
```bash
# Include an image with the prompt
gemini -p "@/path/to/ui-design.png Create a React component that exactly replicates this UI design using Tailwind CSS"

# Compare existing implementation with design
gemini -p "@/path/to/ui-design.png @components/Dashboard.tsx How closely does this component match the design? What needs to be changed?"

# Generate complete UI implementation from mockup
gemini -p "@/path/to/figma-export.png @styles/globals.css Generate the complete implementation for this UI using our existing design system"
```

### When to Use Gemini CLI

Use `gemini -p` when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase
- Processing images of UI designs to create exact replicas in code
- Comparing visual designs with existing implementations
- Need multi-modal analysis (combining text and images)

### Important Notes

- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results
- For UI replication, provide high-quality images and specify the exact framework/library requirements
- When using multi-modal processing, Gemini can analyze images and generate code simultaneously

### Integration with Claude Code

Claude will automatically use Gemini CLI when:
1. The task requires analyzing files that would exceed the current context window
2. You need to search across an entire codebase for specific patterns
3. Multi-modal processing is required (e.g., replicating UI from images)
4. You explicitly request large-scale codebase analysis

To explicitly request Gemini analysis, you can ask Claude to "use Gemini to analyze..." or mention that you need to check something across the entire codebase.