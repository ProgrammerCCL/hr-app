-- =============================================================================
--  HRMS - Unified Migration Script (Consolidated V1 - V9)
--  Description: Run this in Supabase SQL Editor to update or setup the database.
--  This script is idempotent (safe to run multiple times).
-- =============================================================================

-- 0. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  first_name text NOT NULL DEFAULT '',
  last_name text DEFAULT '',
  role text DEFAULT 'employee',
  avatar_url text,
  department text,
  position text,
  manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  phone text,
  start_date date,
  is_active boolean DEFAULT true,
  base_salary numeric DEFAULT 0,
  bank_name text,
  bank_account text,
  tax_id text,
  social_security_id text,
  employee_code text UNIQUE,
  shift_id uuid, -- FK added later
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Ensure all columns exist (if table was created with fewer columns earlier)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS base_salary numeric DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tax_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_security_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employee_code text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shift_id uuid;

-- 2. WORK SHIFTS
CREATE TABLE IF NOT EXISTS public.work_shifts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_overnight boolean DEFAULT false,
  late_threshold_minutes integer DEFAULT 15,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add FK from profiles to work_shifts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_profiles_shift') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_shift FOREIGN KEY (shift_id) REFERENCES public.work_shifts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  manager_id uuid REFERENCES public.profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 4. COMPANY SETTINGS
CREATE TABLE IF NOT EXISTS public.company_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- 5. LEAVE TYPES
CREATE TABLE IF NOT EXISTS public.leave_types (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  quota_per_year integer DEFAULT 0,
  is_paid boolean DEFAULT true,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  min_days_advance integer DEFAULT 0,
  max_days_backdated integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.leave_types ADD COLUMN IF NOT EXISTS min_days_advance integer DEFAULT 0;
ALTER TABLE public.leave_types ADD COLUMN IF NOT EXISTS max_days_backdated integer DEFAULT 0;

-- 6. ATTENDANCE LOGS
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  timestamp timestamptz DEFAULT now() NOT NULL,
  type text CHECK (type IN ('check_in', 'check_out', 'site_in', 'site_out')),
  location_lat double precision,
  location_lng double precision,
  location_name text,
  photo_url text,
  device_info text,
  status text DEFAULT 'ontime',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 7. LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  leave_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  approver_id uuid REFERENCES public.profiles(id),
  current_step integer DEFAULT 1,
  approval_chain_id uuid,
  total_steps integer DEFAULT 1,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS current_step integer DEFAULT 1;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS approval_chain_id uuid;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS total_steps integer DEFAULT 1;
ALTER TABLE public.leave_requests ALTER COLUMN leave_type TYPE text USING leave_type::text;

-- 8. LEAVE APPROVALS
CREATE TABLE IF NOT EXISTS public.leave_approvals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  leave_request_id uuid REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  approver_id uuid REFERENCES public.profiles(id),
  approver_role text,
  status text DEFAULT 'pending',
  comment text,
  acted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text,
  is_read boolean DEFAULT false,
  related_id uuid,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

-- 10. SITE VISITS
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
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- 11. PAYROLL RECORDS
CREATE TABLE IF NOT EXISTS public.payroll_records (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  base_salary numeric DEFAULT 0,
  working_days integer DEFAULT 0,
  actual_days integer DEFAULT 0,
  late_count integer DEFAULT 0,
  absent_days integer DEFAULT 0,
  leave_days numeric DEFAULT 0,
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
  status text DEFAULT 'draft',
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- 12. KPI CRITERIA
CREATE TABLE IF NOT EXISTS public.kpi_criteria (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  weight numeric DEFAULT 0,
  category text DEFAULT 'attendance',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Ensure name is unique even if table exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'kpi_criteria_name_key') THEN
    ALTER TABLE public.kpi_criteria ADD CONSTRAINT kpi_criteria_name_key UNIQUE (name);
  END IF;
END $$;

-- 13. KPI EVALUATIONS
CREATE TABLE IF NOT EXISTS public.kpi_evaluations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}',
  total_score numeric DEFAULT 0,
  grade text,
  evaluator_id uuid REFERENCES public.profiles(id),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- 14. APPROVAL CHAINS
CREATE TABLE IF NOT EXISTS public.approval_chains (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  chain_type text NOT NULL DEFAULT 'leave',
  steps jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_chains ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES (Consolidated & Case-Insensitive)
-- ============================================================

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin', 'hr'))
);

-- DEPARTMENTS
DROP POLICY IF EXISTS "dept_select" ON departments;
CREATE POLICY "dept_select" ON departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "dept_insert" ON departments;
CREATE POLICY "dept_insert" ON departments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin','hr'))
);

DROP POLICY IF EXISTS "dept_update" ON departments;
CREATE POLICY "dept_update" ON departments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin','hr'))
);

DROP POLICY IF EXISTS "dept_delete" ON departments;
CREATE POLICY "dept_delete" ON departments FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin','hr'))
);

-- ATTENDANCE_LOGS
DROP POLICY IF EXISTS "attendance_select" ON attendance_logs;
CREATE POLICY "attendance_select" ON attendance_logs FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin', 'hr', 'manager'))
);

DROP POLICY IF EXISTS "attendance_insert" ON attendance_logs;
CREATE POLICY "attendance_insert" ON attendance_logs FOR INSERT WITH CHECK (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin','hr'))
);

DROP POLICY IF EXISTS "attendance_update" ON attendance_logs;
CREATE POLICY "attendance_update" ON attendance_logs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin','hr'))
);

-- LEAVE_REQUESTS
DROP POLICY IF EXISTS "leave_select" ON leave_requests;
CREATE POLICY "leave_select" ON leave_requests FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin', 'hr', 'manager'))
);

DROP POLICY IF EXISTS "leave_insert" ON leave_requests;
CREATE POLICY "leave_insert" ON leave_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "leave_update" ON leave_requests;
CREATE POLICY "leave_update" ON leave_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin', 'hr', 'manager'))
);

-- COMPANY_SETTINGS
DROP POLICY IF EXISTS "settings_select" ON company_settings;
CREATE POLICY "settings_select" ON company_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "settings_manage" ON company_settings;
CREATE POLICY "settings_manage" ON company_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) = 'admin')
);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "notif_select" ON notifications;
CREATE POLICY "notif_select" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_insert" ON notifications;
CREATE POLICY "notif_insert" ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "notif_update" ON notifications;
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- LEAVE_TYPES
DROP POLICY IF EXISTS "leave_types_select" ON leave_types;
CREATE POLICY "leave_types_select" ON leave_types FOR SELECT USING (true);

-- WORK_SHIFTS
DROP POLICY IF EXISTS "shifts_select" ON work_shifts;
CREATE POLICY "shifts_select" ON work_shifts FOR SELECT USING (true);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'employee')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INITIAL DATA
-- ============================================================

-- Company Settings
INSERT INTO public.company_settings (key, value) VALUES
  ('company_name', 'My Company'),
  ('work_start_time', '08:30'),
  ('work_end_time', '17:30'),
  ('annual_leave_quota', '6'),
  ('sick_leave_quota', '30'),
  ('personal_leave_quota', '3'),
  ('late_threshold_minutes', '15'),
  ('late_deduction_per_time', '50'),
  ('ot_rate_multiplier', '1.5'),
  ('social_security_rate', '5'),
  ('social_security_max', '750')
ON CONFLICT (key) DO NOTHING;

-- Leave Types (Full Configuration)
INSERT INTO public.leave_types (name, label, quota_per_year, is_paid, min_days_advance, max_days_backdated, sort_order) VALUES
  ('sick', 'ลาป่วย', 30, true, 0, 30, 1),
  ('personal', 'ลากิจ', 3, true, 3, 0, 2),
  ('unpaid_personal', 'ลากิจไม่รับค่าจ้าง', 999, false, 3, 0, 3),
  ('annual', 'ลาพักร้อน', 6, true, 3, 0, 4),
  ('ordination', 'ลาบวช', 30, true, 30, 0, 5),
  ('maternity', 'ลาคลอดบุตร', 30, true, 30, 0, 6),
  ('funeral_parents', 'ลาชาปณกิจ พ่อ แม่', 7, true, 0, 30, 7),
  ('funeral_relatives', 'ลาชาปณกิจ ญาติพี่น้อง', 3, true, 0, 30, 8),
  ('holiday_swap', 'ลาสลับวันหยุดแทนที่ทำงานในวันหยุด', 999, true, 1, 0, 9),
  ('sterilization', 'ลาทำหมัน', 7, true, 1, 0, 10)
ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  quota_per_year = EXCLUDED.quota_per_year,
  is_paid = EXCLUDED.is_paid,
  min_days_advance = EXCLUDED.min_days_advance,
  max_days_backdated = EXCLUDED.max_days_backdated,
  sort_order = EXCLUDED.sort_order;

-- Work Shifts
INSERT INTO public.work_shifts (name, label, start_time, end_time, is_overnight, late_threshold_minutes, sort_order) VALUES
  ('morning',   'กะเช้า (08:30-17:30)',     '08:30', '17:30', false, 15, 1),
  ('afternoon', 'กะบ่าย (11:00-20:00)',      '11:00', '20:00', false, 15, 2),
  ('evening',   'กะค่ำ (14:00-00:00)',       '14:00', '00:00', true,  15, 3),
  ('night',     'กะดึก (22:00-07:00)',       '22:00', '07:00', true,  15, 4)
ON CONFLICT (name) DO NOTHING;

-- Departments
INSERT INTO public.departments (name, description, is_active) VALUES
  ('Accounting & Finance', 'แผนกบัญชีและการเงิน', true),
  ('HR', 'แผนกทรัพยากรบุคคล', true),
  ('IT', 'แผนกเทคโนโลยีสารสนเทศ', true),
  ('Messenger', 'แผนกรับส่งเอกสาร', true),
  ('Sales', 'แผนกขาย', true),
  ('Service', 'แผนกบริการลูกค้า', true),
  ('Support / Telesales', 'แผนกสนับสนุนและขายทางโทรศัพท์', true),
  ('การเงิน', 'ฝ่ายการเงินและบัญชี', true),
  ('การตลาด', 'ฝ่ายการตลาดและประชาสัมพันธ์', true),
  ('บริหาร', 'ฝ่ายบริหารและจัดการองค์กร', true),
  ('ปฏิบัติการ', 'ฝ่ายปฏิบัติการและโลจิสติกส์', true)
ON CONFLICT (name) DO NOTHING;

-- KPI Criteria
INSERT INTO public.kpi_criteria (name, description, weight, category) VALUES
  ('Attendance Rate', 'เปอร์เซ็นต์การมาทำงาน', 30, 'attendance'),
  ('Punctuality', 'ความตรงต่อเวลา (ไม่มาสาย)', 25, 'punctuality'),
  ('Leave Usage', 'การใช้วันลาอย่างเหมาะสม', 20, 'leave'),
  ('Site Visit Activity', 'ความขยันออกพบลูกค้า', 25, 'custom')
ON CONFLICT (name) DO NOTHING;

-- Final normalization
UPDATE profiles SET role = lower(role) WHERE role IS NOT NULL AND role != lower(role);
UPDATE profiles SET role = 'employee' WHERE role IS NULL;

SELECT 'Migration Consolidated V1-V9 completed successfully!' AS status;
