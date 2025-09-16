-- Add elective group columns to existing time_table_entries table
ALTER TABLE "time_table_entries" 
ADD COLUMN IF NOT EXISTS "elective_group_name" text,
ADD COLUMN IF NOT EXISTS "subject_ids" text,
ADD COLUMN IF NOT EXISTS "teacher_ids" text;
