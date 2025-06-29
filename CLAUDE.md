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
- Projects → Tasks/Contributions (one-to-many)
- Tasks → Assignees (many-to-many via task_assignees)
- Users → Skills (many-to-many via member_skills)
- Tasks → Required Skills (many-to-many via task_required_skills)

### Important Implementation Notes
- All IDs are UUIDs (gen_random_uuid())
- All timestamps use timestamptz
- Subtasks stored as JSONB array in contributions.subtasks
- Skills normalized via member_skills (not arrays in profiles)
- contributions.contributor_id is LEGACY - use task_assignees
- Missing universities table (referenced by profiles.university_id)