# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New project"
3. Enter project details:
   - Name: `worktree-v4`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
4. Click "Create new project" and wait for setup

## 2. Enable Required Extensions

Once your project is created:

1. Go to SQL Editor in your Supabase dashboard
2. Run this command to enable pgvector:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## 3. Run Database Migrations

1. In the SQL Editor, open and run each migration file in order:
   - `/supabase/migrations/001_optimized_schema.sql`
   - `/supabase/migrations/002_complete_schema.sql`

## 4. Configure Environment Variables

1. Go to Settings > API in your Supabase dashboard
2. Copy these values:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

3. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Add your Supabase credentials to `.env.local`

## 5. Set Up Authentication

1. Go to Authentication > Providers in Supabase
2. Enable Email provider (enabled by default)
3. Optional: Enable social providers (Google, GitHub, etc.)

### Configure Auth Settings:
- Go to Authentication > URL Configuration
- Add your URLs:
  - Site URL: `http://localhost:3000` (development)
  - Redirect URLs: `http://localhost:3000/auth/callback`

## 6. Set Up Storage Buckets (Optional)

For user avatars and resumes:

1. Go to Storage in Supabase dashboard
2. Create buckets:
   - `avatars` (public)
   - `resumes` (private)

3. Set policies:

```sql
-- Avatars bucket (public read, authenticated write)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Resumes bucket (private)
CREATE POLICY "Users can access own resumes"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 7. Test Your Setup

Run the development server:
```bash
npm run dev
```

Your Supabase integration should now be ready!

## Common Issues

### pgvector Extension Not Available
- Make sure you're using a Supabase project (not local)
- The extension should be pre-installed on Supabase

### Authentication Redirect Issues
- Ensure your redirect URLs match exactly
- Check that your site URL is correct
- For production, update these URLs accordingly

### Database Migration Errors
- Run migrations in order
- Check for any existing tables/types before running
- Use the SQL editor's error messages to debug

## Next Steps

1. Set up OpenAI API key for embeddings
2. Test authentication flow
3. Create initial skills data
4. Build user onboarding