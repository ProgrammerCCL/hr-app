-- 1. Profiles Table (Extending auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  first_name text,
  last_name text,
  department text,
  position text,
  role text default 'employee', -- 'employee', 'hr', 'manager', 'admin'
  avatar_url text,
  start_date date,
  phone text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
-- Allow admin/hr to update any profile
create policy "Admins can update any profile" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'hr'))
);

-- 2. Attendance Logs
create table public.attendance_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  type text check (type in ('check_in', 'check_out', 'site_in', 'site_out')),
  location_lat double precision,
  location_lng double precision,
  location_name text,
  photo_url text,
  device_info text,
  status text default 'ontime', -- 'ontime', 'late', 'absent'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.attendance_logs enable row level security;
create policy "Users can view their own attendance" on attendance_logs for select using (auth.uid() = user_id);
create policy "Admins can view all attendance" on attendance_logs for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'hr', 'manager'))
);
create policy "Users can insert their own attendance" on attendance_logs for insert with check (auth.uid() = user_id);

-- 3. Leave Requests
create table public.leave_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  leave_type text not null, -- 'annual', 'sick', 'personal'
  start_date date not null,
  end_date date not null,
  reason text,
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  approver_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.leave_requests enable row level security;
create policy "Users can view their own requests" on leave_requests for select using (auth.uid() = user_id);
create policy "Admins can view all requests" on leave_requests for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'hr', 'manager'))
);
create policy "Users can create requests" on leave_requests for insert with check (auth.uid() = user_id);
create policy "Admins can update requests" on leave_requests for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'hr', 'manager'))
);

-- 4. Departments Table
create table public.departments (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  manager_id uuid references public.profiles(id),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.departments enable row level security;
create policy "Everyone can view departments" on departments for select using (true);
create policy "Admins can manage departments" on departments for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'hr'))
);

-- 5. Company Settings Table (Key-Value store)
create table public.company_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.company_settings enable row level security;
create policy "Everyone can view settings" on company_settings for select using (true);
create policy "Admins can manage settings" on company_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin'))
);

-- Insert default settings
insert into public.company_settings (key, value) values
  ('company_name', 'My Company'),
  ('work_start_time', '09:00'),
  ('work_end_time', '18:00'),
  ('annual_leave_quota', '15'),
  ('sick_leave_quota', '30'),
  ('personal_leave_quota', '5'),
  ('late_threshold_minutes', '15')
on conflict (key) do nothing;
