-- =============================================
-- HRMS Migration V3: Leave Types + Employee Code
-- =============================================

-- 1. Add employee_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employee_code text UNIQUE;

-- 2. Leave Types table (เพิ่ม/ลบประเภทลาได้)
CREATE TABLE IF NOT EXISTS public.leave_types (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE, -- e.g. 'sick', 'annual', 'personal', 'maternity'
  label text NOT NULL, -- display name e.g. 'ลาป่วย', 'ลาพักร้อน'
  quota_per_year integer DEFAULT 0,
  is_paid boolean DEFAULT true,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "lt_select" ON leave_types FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "lt_insert" ON leave_types FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "lt_update" ON leave_types FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "lt_delete" ON leave_types FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Insert default leave types
INSERT INTO public.leave_types (name, label, quota_per_year, is_paid, sort_order) VALUES
  ('sick', 'ลาป่วย', 30, true, 1),
  ('annual', 'ลาพักร้อน', 6, true, 2),
  ('personal', 'ลากิจ', 3, true, 3),
  ('maternity', 'ลาคลอด', 98, true, 4),
  ('ordination', 'ลาบวช', 15, false, 5)
ON CONFLICT (name) DO NOTHING;

-- 3. Update leave_requests to support any leave type
ALTER TABLE public.leave_requests ALTER COLUMN leave_type TYPE text;
