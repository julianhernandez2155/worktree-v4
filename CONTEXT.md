# Worktree v4 - Development Context

## Current Progress
Building Worktree v4 - A premium dark-themed platform bridging campus involvement with career readiness.

### What We're Building
- Platform similar to LinkedIn but for campus opportunities
- Dark theme inspired by Spotify/Discord/Linear
- AI-enhanced matching and recommendations
- LeetCode-style categorization for opportunities (Beginner/Intermediate/Advanced/Expert)
- Skill progression tracking with verified achievements

### Design System
- **Colors**: Deep blacks (#0A0A0B) with neon accents (#00FF88 green, #00D9FF blue)
- **UI Style**: Glass morphism effects, smooth animations
- **Fonts**: Inter + Clash Display
- **Framework**: Next.js 14, Tailwind CSS, Framer Motion

### Key Features Implemented So Far
1. ✅ Environment variables updated with AI config (.env.example)
2. ✅ Tailwind config with dark theme colors
3. ✅ Glass morphism utilities in globals.css
4. ✅ Core UI components created:
   - GlassCard (with variants and animations)
   - NeonButton (primary, secondary, ghost, danger)
   - DifficultyBadge (LeetCode-style difficulty indicators)
   - MatchQualityIndicator (match scoring visualization)
5. ✅ Homepage showcasing all components
6. ✅ Fixed Next.js config (removed ppr)
7. ✅ Project runs successfully with `npm run dev`

### Component Structure
```
components/ui/
  - GlassCard.tsx (glass morphism cards)
  - NeonButton.tsx (glowing buttons)
  - DifficultyBadge.tsx (skill levels)
  - MatchQualityIndicator.tsx (match scoring)
lib/
  - utils.ts (cn function for className merging)
```

### Next Steps Priority
1. **Supabase Setup**:
   - Create Supabase project
   - Enable pgvector extension
   - Create database schema with categorization types
   - Set up auth

2. **Core Features**:
   - Authentication (login/signup)
   - User profiles with skills
   - Organization management
   - Opportunity posting with difficulty levels
   - AI-powered matching

3. **AI Integration**:
   - OpenAI for embeddings
   - Semantic skill search
   - Smart matching algorithm
   - Personalized recommendations

### Database Schema Plan
- Users (with skill levels)
- Organizations
- Opportunities (with difficulty categorization)
- Skills (with embeddings for AI)
- Applications
- Matches (with quality scores)

### Important Files
- `tailwind.config.ts` - Dark theme configuration
- `app/globals.css` - Glass morphism styles
- `app/page.tsx` - Component showcase
- `.env.example` - Environment variables template

### AI Integration Plan
- Using OpenAI for embeddings and smart matching
- Semantic search for skills
- AI-powered categorization of opportunities
- Personalized recommendations
- Optional AI features (user can disable)

### Database Schema Highlights
- Opportunities with difficulty levels
- Skills with categories and embeddings
- User progression tracking
- Match quality scoring
- Learning paths

### Important Files Created/Modified
- `.env.example` - Added AI configuration
- `tailwind.config.ts` - Dark theme with neon colors
- `docs/UI_AESTHETIC_CORE.md` - Design philosophy
- `CLAUDE.md` - Project context for AI assistance

### Current Todo Status
Working through Phase 1: Foundation & AI Infrastructure