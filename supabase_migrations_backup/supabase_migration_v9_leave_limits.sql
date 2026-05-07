-- HRMS Migration V9: Add Advance and Backdated limits to Leave Types
ALTER TABLE public.leave_types 
ADD COLUMN IF NOT EXISTS min_days_advance integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_days_backdated integer DEFAULT 0;

-- Optional: Update default limits for common types
UPDATE public.leave_types SET min_days_advance = 3 WHERE name = 'annual';
UPDATE public.leave_types SET min_days_advance = 3 WHERE name = 'personal';
UPDATE public.leave_types SET max_days_backdated = 2 WHERE name = 'sick';
