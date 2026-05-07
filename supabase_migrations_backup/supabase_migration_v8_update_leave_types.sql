-- HRMS Migration V8: Update Leave Types
-- This script updates the leave types and their quotas as requested.

INSERT INTO public.leave_types (name, label, quota_per_year, is_paid, sort_order) VALUES
  ('sick', 'ลาป่วย', 30, true, 1),
  ('personal', 'ลากิจ', 3, true, 2),
  ('unpaid_personal', 'ลากิจไม่รับค่าจ้าง', 999, false, 3),
  ('annual', 'ลาพักร้อน', 6, true, 4),
  ('ordination', 'ลาบวช', 30, true, 5),
  ('maternity', 'ลาคลอดบุตร', 30, true, 6),
  ('funeral_parents', 'ลาชาปณกิจ พ่อ แม่', 7, true, 7),
  ('funeral_relatives', 'ลาชาปณกิจ ญาติพี่น้อง', 3, true, 8),
  ('holiday_swap', 'ลาสลับวันหยุดแทนที่ทำงานในวันหยุด', 999, true, 9),
  ('sterilization', 'ลาทำหมัน', 7, true, 10)
ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  quota_per_year = EXCLUDED.quota_per_year,
  is_paid = EXCLUDED.is_paid,
  sort_order = EXCLUDED.sort_order;
