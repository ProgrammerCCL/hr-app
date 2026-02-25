-- =============================================
-- HRMS Migration V7: Fix Profiles SELECT Policy
-- =============================================
-- ปัญหา: user ไม่สามารถอ่าน profile ตัวเองได้ เพราะ SELECT policy หายไป
-- ผลกระทบ: ปุ่ม Admin Panel ไม่แสดง, ชื่อแสดงเป็น "Team", role เป็น null
-- แก้ไข: เพิ่ม SELECT policy กลับ + ตรวจสอบ trigger สร้าง profile อัตโนมัติ

-- ========== STEP 1: Fix SELECT policy on profiles ==========
-- Drop all existing SELECT policies on profiles first
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_own_select" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Recreate: Allow everyone to SELECT profiles (needed for role checks in other RLS policies too)
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);

-- ========== STEP 2: Ensure INSERT policy exists ==========
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ========== STEP 3: Ensure UPDATE policies exist ==========
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admin update any (case-insensitive)
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin', 'hr'))
);

-- ========== STEP 4: Ensure trigger creates profile on signup ==========
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
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== STEP 5: Fix existing users who may not have a profile ==========
-- Insert profile for any auth.users that don't have one yet
INSERT INTO public.profiles (id, email, first_name, role)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data->>'first_name', split_part(u.email, '@', 1)),
  'employee'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- ========== STEP 6: Set first user as admin if no admin exists ==========
-- (Only if there are no admins at all)
UPDATE profiles 
SET role = 'admin'
WHERE id = (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM profiles WHERE lower(role) = 'admin');

-- ========== STEP 7: Normalize all roles to lowercase ==========
UPDATE profiles SET role = lower(role) WHERE role IS NOT NULL AND role != lower(role);

-- ========== STEP 8: Set default role for null roles ==========
UPDATE profiles SET role = 'employee' WHERE role IS NULL;

-- ========== VERIFY ==========
SELECT id, email, first_name, role, is_active FROM profiles ORDER BY created_at;

SELECT 'Migration V7 completed - Profiles SELECT policy fixed!' AS status;
