-- =============================================
-- HRMS Migration V4: Work Shifts (กะการทำงาน)
-- =============================================

-- 1. Create work_shifts table
CREATE TABLE IF NOT EXISTS public.work_shifts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,        -- e.g. 'morning', 'afternoon', 'night', 'overnight'
  label text NOT NULL,               -- e.g. 'กะเช้า', 'กะบ่าย', 'กะดึก'
  start_time time NOT NULL,          -- e.g. '08:30'
  end_time time NOT NULL,            -- e.g. '17:30'
  is_overnight boolean DEFAULT false,-- true if shift crosses midnight (e.g. 22:00-07:00)
  late_threshold_minutes integer DEFAULT 15,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.work_shifts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "ws_select" ON work_shifts FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "ws_insert" ON work_shifts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "ws_update" ON work_shifts FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "ws_delete" ON work_shifts FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Add shift_id to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shift_id uuid REFERENCES public.work_shifts(id);

-- 3. Insert default shifts
INSERT INTO public.work_shifts (name, label, start_time, end_time, is_overnight, late_threshold_minutes, sort_order) VALUES
  ('morning',   'กะเช้า (08:30-17:30)',     '08:30', '17:30', false, 15, 1),
  ('afternoon', 'กะบ่าย (11:00-20:00)',      '11:00', '20:00', false, 15, 2),
  ('evening',   'กะค่ำ (14:00-00:00)',       '14:00', '00:00', true,  15, 3),
  ('night',     'กะดึก (22:00-07:00)',       '22:00', '07:00', true,  15, 4)
ON CONFLICT (name) DO NOTHING;
