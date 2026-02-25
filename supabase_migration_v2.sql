-- =============================================
-- HRMS Full Migration V2
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add new columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS base_salary numeric DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tax_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_security_id text;

-- 2. Departments
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  manager_id uuid REFERENCES public.profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "dept_select" ON departments FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "dept_insert" ON departments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "dept_update" ON departments FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "dept_delete" ON departments FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Company Settings
CREATE TABLE IF NOT EXISTS public.company_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "settings_select" ON company_settings FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "settings_upsert" ON company_settings FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "settings_update" ON company_settings FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO public.company_settings (key, value) VALUES
  ('company_name', 'My Company'),
  ('work_start_time', '08:30'),
  ('work_end_time', '17:30'),
  ('annual_leave_quota', '6'),
  ('sick_leave_quota', '30'),
  ('personal_leave_quota', '3'),
  ('late_threshold_minutes', '15'),
  ('late_deduction_per_time', '50'),
  ('absent_deduction_per_day', '0'),
  ('ot_rate_multiplier', '1.5'),
  ('social_security_rate', '5'),
  ('social_security_max', '750')
ON CONFLICT (key) DO NOTHING;

-- 4. Site Visits (ออกพบลูกค้า)
CREATE TABLE IF NOT EXISTS public.site_visits (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  customer_name text NOT NULL,
  location_name text,
  location_lat double precision,
  location_lng double precision,
  check_in_time timestamptz NOT NULL DEFAULT now(),
  check_out_time timestamptz,
  check_in_photo text,
  check_out_photo text,
  notes text,
  status text DEFAULT 'active', -- 'active', 'completed'
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "sv_user_select" ON site_visits FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "sv_admin_select" ON site_visits FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr','manager'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "sv_insert" ON site_visits FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "sv_update" ON site_visits FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Approval Chains (กำหนดลำดับการอนุมัติ)
CREATE TABLE IF NOT EXISTS public.approval_chains (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL, -- e.g. 'Leave Approval'
  chain_type text NOT NULL DEFAULT 'leave', -- 'leave'
  steps jsonb NOT NULL DEFAULT '[]', 
  -- Example: [{"step":1,"role":"manager","label":"หัวหน้างาน"},{"step":2,"role":"hr","label":"HR"}]
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.approval_chains ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "ac_select" ON approval_chains FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "ac_manage" ON approval_chains FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Insert default approval chain
INSERT INTO public.approval_chains (name, chain_type, steps) VALUES
  ('Default Leave Approval', 'leave', '[{"step":1,"role":"manager","label":"Manager"},{"step":2,"role":"hr","label":"HR"}]')
ON CONFLICT DO NOTHING;

-- 6. Leave Approvals (แต่ละขั้นตอนการอนุมัติ)
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS current_step integer DEFAULT 1;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS approval_chain_id uuid;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS total_steps integer DEFAULT 1;

CREATE TABLE IF NOT EXISTS public.leave_approvals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  leave_request_id uuid REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  approver_id uuid REFERENCES public.profiles(id),
  approver_role text,
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  comment text,
  acted_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.leave_approvals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "la_select" ON leave_approvals FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "la_insert" ON leave_approvals FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr','manager'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "la_update" ON leave_approvals FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr','manager'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. Notifications (แจ้งเตือน)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info', -- 'info', 'leave', 'approval', 'payroll'
  is_read boolean DEFAULT false,
  link text, -- optional link to navigate
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "notif_select" ON notifications FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "notif_insert" ON notifications FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8. Payroll Records (บันทึกเงินเดือนรายเดือน)
CREATE TABLE IF NOT EXISTS public.payroll_records (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  month integer NOT NULL, -- 1-12
  year integer NOT NULL,
  base_salary numeric DEFAULT 0,
  working_days integer DEFAULT 0,
  actual_days integer DEFAULT 0,
  late_count integer DEFAULT 0,
  absent_days integer DEFAULT 0,
  leave_days integer DEFAULT 0,
  ot_hours numeric DEFAULT 0,
  ot_amount numeric DEFAULT 0,
  late_deduction numeric DEFAULT 0,
  absent_deduction numeric DEFAULT 0,
  social_security numeric DEFAULT 0,
  withholding_tax numeric DEFAULT 0,
  other_deductions numeric DEFAULT 0,
  other_additions numeric DEFAULT 0,
  gross_pay numeric DEFAULT 0,
  net_pay numeric DEFAULT 0,
  status text DEFAULT 'draft', -- 'draft', 'confirmed', 'paid'
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month, year)
);
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "pr_user_select" ON payroll_records FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "pr_admin_select" ON payroll_records FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "pr_admin_insert" ON payroll_records FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "pr_admin_update" ON payroll_records FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "pr_admin_delete" ON payroll_records FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 9. KPI Criteria (เกณฑ์ประเมิน)
CREATE TABLE IF NOT EXISTS public.kpi_criteria (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  weight numeric DEFAULT 0, -- percentage weight
  category text DEFAULT 'attendance', -- 'attendance', 'punctuality', 'leave', 'custom'
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.kpi_criteria ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "kpi_c_select" ON kpi_criteria FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "kpi_c_manage" ON kpi_criteria FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Insert default KPI criteria
INSERT INTO public.kpi_criteria (name, description, weight, category) VALUES
  ('Attendance Rate', 'เปอร์เซ็นต์การมาทำงาน', 30, 'attendance'),
  ('Punctuality', 'ความตรงต่อเวลา (ไม่มาสาย)', 25, 'punctuality'),
  ('Leave Usage', 'การใช้วันลาอย่างเหมาะสม', 20, 'leave'),
  ('Site Visit Activity', 'ความขยันออกพบลูกค้า', 25, 'custom')
ON CONFLICT DO NOTHING;

-- 10. KPI Evaluations (ผลประเมินรายคน)
CREATE TABLE IF NOT EXISTS public.kpi_evaluations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}',
  -- Example: {"attendance_rate": 95, "punctuality": 90, "leave_usage": 100, "site_visits": 80}
  total_score numeric DEFAULT 0,
  grade text, -- 'A', 'B', 'C', 'D', 'F'
  evaluator_id uuid REFERENCES public.profiles(id),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month, year)
);
ALTER TABLE public.kpi_evaluations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "kpi_e_user" ON kpi_evaluations FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "kpi_e_admin" ON kpi_evaluations FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr','manager'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "kpi_e_manage" ON kpi_evaluations FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr','manager'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 11. Admin policies for existing tables (if not exists)
DO $$ BEGIN CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "admin_select_attendance" ON attendance_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr','manager'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "admin_select_leaves" ON leave_requests FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr','manager'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "admin_update_leaves" ON leave_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','hr','manager'))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
