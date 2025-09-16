-- Migration to add elective group columns to time_table_entries table
-- Run this SQL script to update the existing database schema

ALTER TABLE time_table_entries 
ADD COLUMN IF NOT EXISTS elective_group_name TEXT,
ADD COLUMN IF NOT EXISTS subject_ids TEXT,
ADD COLUMN IF NOT EXISTS teacher_ids TEXT;

-- Update existing entries to have null values for the new columns
UPDATE time_table_entries 
SET elective_group_name = NULL, 
    subject_ids = NULL, 
    teacher_ids = NULL 
WHERE elective_group_name IS NULL;
