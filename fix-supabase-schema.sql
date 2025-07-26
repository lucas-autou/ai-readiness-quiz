-- Fix Supabase schema to ensure ai_report column exists
-- Run this directly in Supabase SQL Editor

-- First, let's see the current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quiz_responses';

-- Add ai_report column if it doesn't exist
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS ai_report TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quiz_responses' 
ORDER BY ordinal_position;

-- Show a sample of the data to confirm structure
SELECT id, email, company, job_title, score, 
       CASE WHEN ai_report IS NULL THEN 'NULL' 
            ELSE 'HAS_CONTENT' END as ai_report_status
FROM quiz_responses 
ORDER BY created_at DESC 
LIMIT 5;