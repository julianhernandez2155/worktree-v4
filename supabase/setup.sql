-- Run this in your Supabase SQL Editor to set up the database

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. IMPORTANT: Run the migration files first!
-- After enabling extensions, run these files in order:
-- - /supabase/migrations/001_optimized_schema.sql
-- - /supabase/migrations/002_complete_schema.sql
-- Then come back and run the rest of this script

-- 3. Create storage buckets for avatars and resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Set up storage policies
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own resumes"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own resumes"
ON storage.objects FOR UPDATE
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Insert initial skills (run this AFTER the migration files)
-- This assumes the skills table has been created by the migrations
INSERT INTO skills (name, category) VALUES
  ('JavaScript', 'Programming'),
  ('TypeScript', 'Programming'),
  ('Python', 'Programming'),
  ('React', 'Framework'),
  ('Next.js', 'Framework'),
  ('Node.js', 'Framework'),
  ('PostgreSQL', 'Database'),
  ('Machine Learning', 'Technology'),
  ('Data Analysis', 'Skill'),
  ('Project Management', 'Skill'),
  ('UI/UX Design', 'Skill'),
  ('Public Speaking', 'Soft Skill'),
  ('Leadership', 'Soft Skill'),
  ('Team Collaboration', 'Soft Skill')
ON CONFLICT (name) DO NOTHING;