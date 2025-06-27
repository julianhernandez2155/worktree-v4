# Worktree v4

A premium dark-themed platform bridging campus involvement with career readiness. Built with Next.js, TypeScript, and Supabase.

![Worktree Preview](preview.png)

## 🌟 Features

- **Premium Dark UI**: Spotify/Discord-inspired design with glass morphism effects
- **AI-Powered Matching**: Smart opportunity recommendations based on skills and interests
- **Skill Categorization**: LeetCode-style difficulty levels (Beginner → Expert)
- **Real-time Collaboration**: Live updates and activity tracking
- **Verified Achievements**: Track real progress and build your portfolio

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **AI**: OpenAI API for embeddings and matching
- **Deployment**: Vercel

## 🎨 Design System

- **Colors**: Deep blacks with neon accents (#00FF88, #00D9FF)
- **Components**: Glass morphism cards, glowing buttons, difficulty badges
- **Animations**: Smooth transitions and micro-interactions

## 🛠️ Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/worktree-v4.git
   cd worktree-v4
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase and OpenAI credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   OPENAI_API_KEY=your-openai-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000**

## 📁 Project Structure

```
worktree-v4/
├── app/                    # Next.js app directory
├── components/            
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configurations
├── public/                # Static assets
├── supabase/             
│   └── migrations/        # Database migrations
└── docs/                  # Documentation
```

## 🔑 Key Components

- `GlassCard` - Frosted glass effect cards
- `NeonButton` - Glowing call-to-action buttons
- `DifficultyBadge` - Skill level indicators
- `MatchQualityIndicator` - Visual match scoring

## 🚧 Development Status

- [x] Design system and UI components
- [x] Dark theme with glass morphism
- [ ] Supabase integration
- [ ] Authentication flow
- [ ] User profiles and skills
- [ ] Organization management
- [ ] AI-powered matching
- [ ] Real-time features

## 📄 License

Private - All rights reserved

---

Built with 💚 by Julian