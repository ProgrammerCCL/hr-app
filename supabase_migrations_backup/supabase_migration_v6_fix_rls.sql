-- =============================================
-- HRMS Migration V6: Fix RLS Policies (case-insensitive role check)
-- =============================================
-- ปัญหา: RLS policy ตรวจ role = 'admin' แต่ในฐานข้อมูลอาจเก็บเป็น 'Admin'
-- แก้ไข: ใช้ lower(role) ให้รองรับทั้งตัวเล็กตัวใหญ่

-- ========== DEPARTMENTS ==========
-- Drop existing policies
DROP POLICY IF EXISTS "dept_select" ON departments;
DROP POLICY IF EXISTS "dept_insert" ON departments;
DROP POLICY IF EXISTS "dept_update" ON departments;
DROP POLICY IF EXISTS "dept_delete" ON departments;
DROP POLICY IF EXISTS "Everyone can view departments" ON departments;
DROP POLICY IF EXISTS "Admins can manage departments" ON departments;

-- Recreate with case-insensitive role check
CREATE POLICY "dept_select" ON departments FOR SELECT USING (true);
CREATE POLICY "dept_insert" ON departments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin','hr'))
);
CREATE POLICY "dept_update" ON departments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin','hr'))
);
CREATE POLICY "dept_delete" ON departments FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin','hr'))
);

-- ========== PROFILES (admin update any) ==========
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin', 'hr'))
);

-- ========== ATTENDANCE_LOGS ==========
DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance_logs;
CREATE POLICY "Admins can view all attendance" ON attendance_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin', 'hr', 'manager'))
);

-- Allow admin/hr to insert attendance for anyone (for attendance management page)
DROP POLICY IF EXISTS "Admins can insert attendance" ON attendance_logs;
CREATE POLICY "Admins can insert attendance" ON attendance_logs FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin','hr'))
);

-- Allow admin/hr to update attendance
DROP POLICY IF EXISTS "Admins can update attendance" ON attendance_logs;
CREATE POLICY "Admins can update attendance" ON attendance_logs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin','hr'))
);

-- Allow admin/hr to delete attendance
DROP POLICY IF EXISTS "Admins can delete attendance" ON attendance_logs;
CREATE POLICY "Admins can delete attendance" ON attendance_logs FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin','hr'))
);

-- ========== LEAVE_REQUESTS ==========
DROP POLICY IF EXISTS "Admins can view all requests" ON leave_requests;
CREATE POLICY "Admins can view all requests" ON leave_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin', 'hr', 'manager'))
);

DROP POLICY IF EXISTS "Admins can update requests" ON leave_requests;
CREATE POLICY "Admins can update requests" ON leave_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin', 'hr', 'manager'))
);

-- ========== COMPANY_SETTINGS ==========
DROP POLICY IF EXISTS "Admins can manage settings" ON company_settings;
CREATE POLICY "Admins can manage settings" ON company_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND lower(role) IN ('admin'))
);

-- ========== NOTIFICATIONS ==========
DROP POLICY IF EXISTS "notif_own_select" ON notifications;
DROP POLICY IF EXISTS "notif_insert" ON notifications;
DROP POLICY IF EXISTS "notif_own_update" ON notifications;

CREATE POLICY "notif_own_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notif_own_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ========== Also normalize existing roles to lowercase ==========
UPDATE profiles SET role = lower(role) WHERE role != lower(role);

SELECT 'Migration V6 completed - RLS policies fixed for case-insensitive role checking' AS status;
