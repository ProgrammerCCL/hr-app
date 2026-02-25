-- =============================================
-- HRMS Migration V5: Notifications
-- =============================================

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,  -- who receives
  type text NOT NULL DEFAULT 'info',                  -- 'leave_request', 'leave_approved', 'leave_rejected', 'attendance', 'info'
  title text NOT NULL,
  message text,
  is_read boolean DEFAULT false,
  related_id uuid,                                    -- optional link to leave_request or attendance_log
  created_by uuid REFERENCES auth.users(id),          -- who created (nullable)
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
DO $$ BEGIN CREATE POLICY "notif_own_select" ON notifications FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- Admin/HR can insert notifications for anyone
DO $$ BEGIN CREATE POLICY "notif_insert" ON notifications FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- Users can update (mark read) their own
DO $$ BEGIN CREATE POLICY "notif_own_update" ON notifications FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
