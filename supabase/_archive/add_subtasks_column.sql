-- Simple migration to add subtasks column
-- Run this in Supabase SQL editor

ALTER TABLE contributions 
  ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb;