-- =============================================================================
--  HRMS - Supabase Setup Script
--  วันที่สร้าง: 2026-02-27
--  คำอธิบาย: รัน SQL นี้ใน Supabase SQL Editor เพื่อสร้างโครงสร้างฐานข้อมูลทั้งหมด
--  วิธีใช้: ไปที่ Supabase Dashboard > SQL Editor > วาง SQL นี้แล้วกด "Run"
-- =============================================================================

-- ============================================================
-- SECTION 1: ENABLE EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";


-- ============================================================
-- SECTION 2: TABLE - profiles
-- (สร้างต่อจาก auth.users ที่ Supabase สร้างไว้แล้ว)
-- ============================================================
create table if not exists public.profiles (
    id              uuid references auth.users(id) on delete cascade primary key,
    email           text,
    first_name      text not null default '',
    last_name       text,
    role            text not null default 'employee'
                    check (role in ('employee','manager','hr','admin')),
    avatar_url      text,
    department      text,
    position        text,
    manager_id      uuid references public.profiles(id) on delete set null,
    phone           text,
    start_date      date,
    is_active       boolean not null default true,
    base_salary     numeric(12,2) default 0,
    bank_name       text,
    bank_account    text,
    tax_id          text,
    social_security_id text,
    employee_code   text unique,
    employee_type   text default 'full-time'
                    check (employee_type in ('full-time','daily','probation','resigned')),
    shift_id        uuid,   -- FK set below after work_shifts is created
    created_at      timestamptz not null default now()
);

comment on table public.profiles is 'ข้อมูลพนักงาน/ผู้ใช้งานทั้งหมด';

-- ============================================================
-- SECTION 3: TABLE - work_shifts (กะทำงาน)
-- ============================================================
create table if not exists public.work_shifts (
    id                      uuid primary key default uuid_generate_v4(),
    name                    text not null unique,
    label                   text not null,
    start_time              time not null default '08:30',
    end_time                time not null default '17:30',
    is_overnight            boolean not null default false,
    late_threshold_minutes  integer not null default 15,
    is_active               boolean not null default true,
    sort_order              integer not null default 0,
    created_at              timestamptz not null default now()
);

comment on table public.work_shifts is 'กะการทำงานของบริษัท';

-- Add FK from profiles to work_shifts (ทำหลังจากสร้าง work_shifts แล้ว)
alter table public.profiles drop constraint if exists fk_profiles_shift;
alter table public.profiles
    add constraint fk_profiles_shift
    foreign key (shift_id) references public.work_shifts(id) on delete set null
    not valid;   -- not valid = ไม่ validate rows เก่า, ปลอดภัยสำหรับ existing data

-- ============================================================
-- SECTION 4: TABLE - departments (แผนก)
-- ============================================================
create table if not exists public.departments (
    id          uuid primary key default uuid_generate_v4(),
    name        text not null unique,
    description text,
    manager_id  uuid references public.profiles(id) on delete set null,
    is_active   boolean not null default true,
    created_at  timestamptz not null default now()
);

comment on table public.departments is 'แผนกงานทั้งหมด';

-- ============================================================
-- SECTION 5: TABLE - company_settings (การตั้งค่าบริษัท)
-- รูปแบบ key-value store
-- ============================================================
create table if not exists public.company_settings (
    key         text primary key,
    value       text not null default '',
    updated_at  timestamptz not null default now()
);

comment on table public.company_settings is 'การตั้งค่าระบบ HR ในรูปแบบ key-value';

-- ============================================================
-- SECTION 6: TABLE - leave_types (ประเภทการลา)
-- ============================================================
create table if not exists public.leave_types (
    id                  uuid primary key default uuid_generate_v4(),
    name                text not null unique,
    label               text not null,
    quota_per_year      integer not null default 0,
    is_paid             boolean not null default true,
    is_active           boolean not null default true,
    sort_order          integer not null default 0,
    advance_days        integer default 0,     -- ต้องยื่นล่วงหน้ากี่วัน
    allow_retroactive   boolean default false, -- ย้อนหลังได้หรือไม่
    -- Aliases เพื่อ backward-compat กับ code เก่า
    min_days_advance    integer generated always as (advance_days) stored,
    created_at          timestamptz not null default now()
);

comment on table public.leave_types is 'ประเภทการลาและโควต้าต่อปี';

-- ============================================================
-- SECTION 7: TABLE - attendance_logs (บันทึกเวลาทำงาน)
-- ============================================================
create table if not exists public.attendance_logs (
    id              uuid primary key default uuid_generate_v4(),
    user_id         uuid not null references public.profiles(id) on delete cascade,
    timestamp       timestamptz not null default now(),
    type            text not null
                    check (type in ('check_in','check_out','site_in','site_out')),
    location_lat    double precision,
    location_lng    double precision,
    location_name   text,
    photo_url       text,
    device_info     text,
    status          text not null default 'ontime'
                    check (status in ('ontime','late','absent')),
    created_at      timestamptz not null default now()
);

create index if not exists idx_attendance_user_timestamp
    on public.attendance_logs(user_id, timestamp);
create index if not exists idx_attendance_timestamp
    on public.attendance_logs(timestamp);

comment on table public.attendance_logs is 'บันทึกเวลาเข้า-ออกงานและเยี่ยมลูกค้า';

-- ============================================================
-- SECTION 8: TABLE - leave_requests (ใบลาหยุด)
-- ============================================================
create table if not exists public.leave_requests (
    id                  uuid primary key default uuid_generate_v4(),
    user_id             uuid not null references public.profiles(id) on delete cascade,
    leave_type          text not null,
    start_date          date not null,
    end_date            date not null,
    total_days          numeric(5,1),
    reason              text not null default '',
    attachment_url      text,
    status              text not null default 'pending'
                        check (status in ('pending','pending_manager','approved','rejected','cancelled')),
    approver_id         uuid references public.profiles(id) on delete set null,
    manager_approver_id uuid references public.profiles(id) on delete set null,
    current_step        integer default 1,
    total_steps         integer default 2,
    approval_chain_id   uuid,
    created_at          timestamptz not null default now()
);

create index if not exists idx_leave_user_id
    on public.leave_requests(user_id);
create index if not exists idx_leave_status
    on public.leave_requests(status);
create index if not exists idx_leave_dates
    on public.leave_requests(start_date, end_date);

-- FK ชี้ไปที่ leave_types.name (denormalized by design เพราะ app ใช้ name string)
comment on table public.leave_requests is 'ใบลาหยุดพนักงาน';

-- ============================================================
-- SECTION 9: TABLE - leave_approvals (ขั้นตอนการอนุมัติ)
-- ============================================================
create table if not exists public.leave_approvals (
    id                  uuid primary key default uuid_generate_v4(),
    leave_request_id    uuid not null references public.leave_requests(id) on delete cascade,
    step_number         integer not null,
    approver_id         uuid references public.profiles(id) on delete set null,
    approver_role       text not null default '',
    status              text not null default 'pending'
                        check (status in ('pending','approved','rejected')),
    comment             text,
    acted_at            timestamptz,
    created_at          timestamptz not null default now()
);

comment on table public.leave_approvals is 'รายละเอียดขั้นตอนการอนุมัติใบลาแต่ละขั้น';

-- ============================================================
-- SECTION 10: TABLE - notifications (การแจ้งเตือน)
-- ============================================================
create table if not exists public.notifications (
    id          uuid primary key default uuid_generate_v4(),
    user_id     uuid not null references public.profiles(id) on delete cascade,
    type        text not null default 'info',
    title       text not null,
    message     text,
    is_read     boolean not null default false,
    related_id  uuid,               -- อ้างอิงถึง leave_request id หรืออื่นๆ
    created_by  uuid references public.profiles(id) on delete set null,
    created_at  timestamptz not null default now()
);

create index if not exists idx_notifications_user_unread
    on public.notifications(user_id, is_read);

comment on table public.notifications is 'การแจ้งเตือนภายในระบบ';

-- ============================================================
-- SECTION 11: TABLE - site_visits (การเยี่ยมลูกค้า)
-- ============================================================
create table if not exists public.site_visits (
    id              uuid primary key default uuid_generate_v4(),
    user_id         uuid not null references public.profiles(id) on delete cascade,
    customer_name   text not null,
    location_name   text,
    location_lat    double precision,
    location_lng    double precision,
    check_in_time   timestamptz not null default now(),
    check_out_time  timestamptz,
    check_in_photo  text,
    check_out_photo text,
    notes           text,
    status          text not null default 'active'
                    check (status in ('active','completed')),
    created_at      timestamptz not null default now()
);

create index if not exists idx_site_visits_user_id
    on public.site_visits(user_id);

comment on table public.site_visits is 'บันทึกการเยี่ยมลูกค้าของพนักงาน';

-- ============================================================
-- SECTION 12: TABLE - payroll_records (สลิปเงินเดือน)
-- ============================================================
create table if not exists public.payroll_records (
    id                  uuid primary key default uuid_generate_v4(),
    user_id             uuid not null references public.profiles(id) on delete cascade,
    month               integer not null check (month between 1 and 12),
    year                integer not null,
    base_salary         numeric(12,2) not null default 0,
    working_days        integer not null default 0,
    actual_days         integer not null default 0,
    late_count          integer not null default 0,
    absent_days         integer not null default 0,
    leave_days          numeric(5,1) not null default 0,
    ot_hours            numeric(6,2) not null default 0,
    ot_amount           numeric(12,2) not null default 0,
    late_deduction      numeric(12,2) not null default 0,
    absent_deduction    numeric(12,2) not null default 0,
    social_security     numeric(12,2) not null default 0,
    withholding_tax     numeric(12,2) not null default 0,
    other_deductions    numeric(12,2) not null default 0,
    other_additions     numeric(12,2) not null default 0,
    gross_pay           numeric(12,2) not null default 0,
    net_pay             numeric(12,2) not null default 0,
    status              text not null default 'draft'
                        check (status in ('draft','confirmed','paid')),
    notes               text,
    created_at          timestamptz not null default now(),
    unique(user_id, month, year)
);

create index if not exists idx_payroll_user_period
    on public.payroll_records(user_id, year, month);

comment on table public.payroll_records is 'บันทึกการคำนวณเงินเดือนและสลิปเงินเดือน';

-- ============================================================
-- SECTION 13: TABLE - kpi_criteria (เกณฑ์ KPI)
-- ============================================================
create table if not exists public.kpi_criteria (
    id          uuid primary key default uuid_generate_v4(),
    name        text not null,
    description text,
    weight      numeric(5,2) not null default 0,
    category    text not null default 'custom'
                check (category in ('attendance','punctuality','leave','custom')),
    is_active   boolean not null default true,
    created_at  timestamptz not null default now()
);

comment on table public.kpi_criteria is 'เกณฑ์การประเมิน KPI';

-- ============================================================
-- SECTION 14: TABLE - kpi_evaluations (ผลการประเมิน KPI)
-- ============================================================
create table if not exists public.kpi_evaluations (
    id              uuid primary key default uuid_generate_v4(),
    user_id         uuid not null references public.profiles(id) on delete cascade,
    month           integer not null check (month between 1 and 12),
    year            integer not null,
    scores          jsonb not null default '{}',
    total_score     numeric(6,2) not null default 0,
    grade           text not null default '-',
    evaluator_id    uuid references public.profiles(id) on delete set null,
    comment         text,
    created_at      timestamptz not null default now(),
    unique(user_id, month, year)
);

comment on table public.kpi_evaluations is 'ผลการประเมิน KPI รายเดือน';

-- ============================================================
-- SECTION 15: TABLE - company_holidays (วันหยุดบริษัท/นักขัตฤกษ์)
-- ============================================================
create table if not exists public.company_holidays (
    id          uuid primary key default uuid_generate_v4(),
    date        date not null unique,
    name        text not null,
    is_active   boolean not null default true,
    created_at  timestamptz not null default now()
);

comment on table public.company_holidays is 'วันหยุดนักขัตฤกษ์และวันหยุดพิเศษของบริษัท';

-- ============================================================
-- SECTION 16: TRIGGER - สร้าง profile อัตโนมัติเมื่อสมัครสมาชิก
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        employee_code
    ) values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'last_name', ''),
        coalesce(new.raw_user_meta_data->>'role', 'employee'),
        coalesce(new.raw_user_meta_data->>'employee_code', null)
    )
    on conflict (id) do update set
        email       = excluded.email,
        first_name  = coalesce(excluded.first_name, profiles.first_name),
        last_name   = coalesce(excluded.last_name, profiles.last_name);

    return new;
end;
$$;

-- ลบ trigger เก่าก่อน (ถ้ามี) แล้วสร้างใหม่
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ============================================================
-- SECTION 17: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- เปิด RLS ทุกตาราง
alter table public.profiles          enable row level security;
alter table public.work_shifts       enable row level security;
alter table public.departments       enable row level security;
alter table public.company_settings  enable row level security;
alter table public.leave_types       enable row level security;
alter table public.attendance_logs   enable row level security;
alter table public.leave_requests    enable row level security;
alter table public.leave_approvals   enable row level security;
alter table public.notifications     enable row level security;
alter table public.site_visits       enable row level security;
alter table public.payroll_records   enable row level security;
alter table public.kpi_criteria      enable row level security;
alter table public.kpi_evaluations   enable row level security;
alter table public.company_holidays  enable row level security;

-- ----- Helper function: ตรวจสอบ role ของ current user -----
create or replace function public.get_my_role()
returns text
language sql stable
security definer
as $$
    select role from public.profiles where id = auth.uid()
$$;

-- ============================================================
-- POLICIES: profiles
-- ============================================================
-- ทุกคน (รวมถึง anon) อ่านข้อมูล profile ได้ (สำหรับ Login ด้วยรหัสพนักงาน)
drop policy if exists "profiles: read all" on public.profiles;
create policy "profiles: read all"
    on public.profiles for select
    using (true);

-- พนักงานแก้ไขตัวเองได้
drop policy if exists "profiles: self update" on public.profiles;
create policy "profiles: self update"
    on public.profiles for update
    using (auth.uid() = id);

-- admin/hr แก้ไขทุก profile ได้
drop policy if exists "profiles: admin update all" on public.profiles;
create policy "profiles: admin update all"
    on public.profiles for update
    using (public.get_my_role() in ('admin', 'hr'));

-- admin/hr ลบ profile ได้
drop policy if exists "profiles: admin delete" on public.profiles;
create policy "profiles: admin delete"
    on public.profiles for delete
    using (public.get_my_role() in ('admin', 'hr'));

-- Trigger insert (ไม่ต้องมี insert policy เพราะ trigger ใช้ security definer)

-- ============================================================
-- POLICIES: work_shifts
-- ============================================================
drop policy if exists "work_shifts: read all" on public.work_shifts;
create policy "work_shifts: read all"
    on public.work_shifts for select
    using (auth.role() = 'authenticated');

drop policy if exists "work_shifts: admin manage" on public.work_shifts;
create policy "work_shifts: admin manage"
    on public.work_shifts for all
    using (public.get_my_role() in ('admin', 'hr'));

-- ============================================================
-- POLICIES: departments
-- ============================================================
drop policy if exists "departments: read all" on public.departments;
create policy "departments: read all"
    on public.departments for select
    using (auth.role() = 'authenticated');

drop policy if exists "departments: admin manage" on public.departments;
create policy "departments: admin manage"
    on public.departments for all
    using (public.get_my_role() in ('admin', 'hr'));

-- ============================================================
-- POLICIES: company_settings
-- ============================================================
drop policy if exists "company_settings: read all" on public.company_settings;
create policy "company_settings: read all"
    on public.company_settings for select
    using (auth.role() = 'authenticated');

drop policy if exists "company_settings: admin manage" on public.company_settings;
create policy "company_settings: admin manage"
    on public.company_settings for all
    using (public.get_my_role() in ('admin', 'hr'));

-- ============================================================
-- POLICIES: leave_types
-- ============================================================
drop policy if exists "leave_types: read all" on public.leave_types;
create policy "leave_types: read all"
    on public.leave_types for select
    using (auth.role() = 'authenticated');

drop policy if exists "leave_types: admin manage" on public.leave_types;
create policy "leave_types: admin manage"
    on public.leave_types for all
    using (public.get_my_role() in ('admin', 'hr'));

-- ============================================================
-- POLICIES: attendance_logs
-- ============================================================
drop policy if exists "attendance_logs: own or admin" on public.attendance_logs;
create policy "attendance_logs: own or admin"
    on public.attendance_logs for select
    using (
        user_id = auth.uid()
        or public.get_my_role() in ('admin', 'hr', 'manager')
    );

drop policy if exists "attendance_logs: insert own" on public.attendance_logs;
create policy "attendance_logs: insert own"
    on public.attendance_logs for insert
    with check (user_id = auth.uid());

drop policy if exists "attendance_logs: admin manage" on public.attendance_logs;
create policy "attendance_logs: admin manage"
    on public.attendance_logs for all
    using (public.get_my_role() in ('admin', 'hr'));

-- ============================================================
-- POLICIES: leave_requests
-- ============================================================
drop policy if exists "leave_requests: own or manager" on public.leave_requests;
create policy "leave_requests: own or manager"
    on public.leave_requests for select
    using (
        user_id = auth.uid()
        or approver_id = auth.uid()
        or public.get_my_role() in ('admin', 'hr', 'manager')
    );

drop policy if exists "leave_requests: insert own" on public.leave_requests;
create policy "leave_requests: insert own"
    on public.leave_requests for insert
    with check (user_id = auth.uid());

drop policy if exists "leave_requests: update approver or admin" on public.leave_requests;
create policy "leave_requests: update approver or admin"
    on public.leave_requests for update
    using (
        approver_id = auth.uid()
        or public.get_my_role() in ('admin', 'hr', 'manager')
    );

drop policy if exists "leave_requests: cancel own" on public.leave_requests;
create policy "leave_requests: cancel own"
    on public.leave_requests for update
    using (user_id = auth.uid() and status in ('pending', 'pending_manager'));

drop policy if exists "leave_requests: admin delete" on public.leave_requests;
create policy "leave_requests: admin delete"
    on public.leave_requests for delete
    using (public.get_my_role() in ('admin', 'hr'));

-- ============================================================
-- POLICIES: leave_approvals
-- ============================================================
drop policy if exists "leave_approvals: read" on public.leave_approvals;
create policy "leave_approvals: read"
    on public.leave_approvals for select
    using (
        approver_id = auth.uid()
        or public.get_my_role() in ('admin', 'hr', 'manager')
    );

drop policy if exists "leave_approvals: admin manage" on public.leave_approvals;
create policy "leave_approvals: admin manage"
    on public.leave_approvals for all
    using (public.get_my_role() in ('admin', 'hr', 'manager'));

-- ============================================================
-- POLICIES: notifications
-- ============================================================
drop policy if exists "notifications: own" on public.notifications;
create policy "notifications: own"
    on public.notifications for select
    using (user_id = auth.uid());

drop policy if exists "notifications: insert" on public.notifications;
create policy "notifications: insert"
    on public.notifications for insert
    with check (auth.role() = 'authenticated');

drop policy if exists "notifications: update own" on public.notifications;
create policy "notifications: update own"
    on public.notifications for update
    using (user_id = auth.uid());

drop policy if exists "notifications: admin delete" on public.notifications;
create policy "notifications: admin delete"
    on public.notifications for delete
    using (user_id = auth.uid() or public.get_my_role() in ('admin', 'hr'));

-- ============================================================
-- POLICIES: site_visits
-- ============================================================
drop policy if exists "site_visits: own or admin" on public.site_visits;
create policy "site_visits: own or admin"
    on public.site_visits for select
    using (
        user_id = auth.uid()
        or public.get_my_role() in ('admin', 'hr', 'manager')
    );

drop policy if exists "site_visits: insert own" on public.site_visits;
create policy "site_visits: insert own"
    on public.site_visits for insert
    with check (user_id = auth.uid());

drop policy if exists "site_visits: update own or admin" on public.site_visits;
create policy "site_visits: update own or admin"
    on public.site_visits for update
    using (user_id = auth.uid() or public.get_my_role() in ('admin', 'hr'));

-- ============================================================
-- POLICIES: payroll_records
-- ============================================================
drop policy if exists "payroll_records: own or admin" on public.payroll_records;
create policy "payroll_records: own or admin"
    on public.payroll_records for select
    using (
        user_id = auth.uid()
        or public.get_my_role() in ('admin', 'hr')
    );

drop policy if exists "payroll_records: admin manage" on public.payroll_records;
create policy "payroll_records: admin manage"
    on public.payroll_records for all
    using (public.get_my_role() in ('admin', 'hr'));

-- ============================================================
-- POLICIES: kpi_criteria
-- ============================================================
drop policy if exists "kpi_criteria: read all" on public.kpi_criteria;
create policy "kpi_criteria: read all"
    on public.kpi_criteria for select
    using (auth.role() = 'authenticated');

drop policy if exists "kpi_criteria: admin manage" on public.kpi_criteria;
create policy "kpi_criteria: admin manage"
    on public.kpi_criteria for all
    using (public.get_my_role() in ('admin', 'hr'));

-- ============================================================
-- POLICIES: kpi_evaluations
-- ============================================================
drop policy if exists "kpi_evaluations: own or admin" on public.kpi_evaluations;
create policy "kpi_evaluations: own or admin"
    on public.kpi_evaluations for select
    using (
        user_id = auth.uid()
        or public.get_my_role() in ('admin', 'hr', 'manager')
    );

drop policy if exists "kpi_evaluations: admin manage" on public.kpi_evaluations;
create policy "kpi_evaluations: admin manage"
    on public.kpi_evaluations for all
    using (public.get_my_role() in ('admin', 'hr'));

-- ============================================================
-- POLICIES: company_holidays
-- ============================================================
drop policy if exists "company_holidays: read all" on public.company_holidays;
create policy "company_holidays: read all"
    on public.company_holidays for select
    using (auth.role() = 'authenticated');

drop policy if exists "company_holidays: admin manage" on public.company_holidays;
create policy "company_holidays: admin manage"
    on public.company_holidays for all
    using (public.get_my_role() in ('admin', 'hr'));


-- ============================================================
-- SECTION 18: Supabase Storage - leave-attachments bucket
-- (ต้องสร้าง Bucket ใน Supabase Dashboard > Storage ด้วยตนเอง
--  ชื่อ: leave-attachments | Public: true)
-- Script นี้สร้าง policy สำหรับ bucket ที่สร้างแล้วเท่านั้น
-- ============================================================
-- (Storage policies ไม่สามารถสร้างผ่าน SQL editor ได้โดยตรง
--  ต้องทำผ่าน Supabase Dashboard > Storage > Policies)
-- วิธีตั้ง Storage Policy:
--   Bucket: leave-attachments
--   - SELECT (read): authenticated users
--   - INSERT: authenticated users (with check: bucket_id = 'leave-attachments')


-- ============================================================
-- SECTION 19: INITIAL DATA - company_settings
-- ============================================================
insert into public.company_settings (key, value) values
    ('company_name',            'บริษัท ของฉัน จำกัด'),
    ('work_start_time',         '08:30'),
    ('work_end_time',           '17:30'),
    ('annual_leave_quota',      '6'),
    ('sick_leave_quota',        '30'),
    ('personal_leave_quota',    '3'),
    ('late_threshold_minutes',  '15'),
    ('late_deduction_per_time', '50'),
    ('absent_deduction_per_day','0'),
    ('ot_rate_multiplier',      '1.5'),
    ('social_security_rate',    '5'),
    ('social_security_max',     '750')
on conflict (key) do nothing;

-- ============================================================
-- SECTION 20: INITIAL DATA - work_shifts (กะทำงานเริ่มต้น)
-- ============================================================
insert into public.work_shifts (name, label, start_time, end_time, is_overnight, late_threshold_minutes, sort_order) values
    ('morning',  'กะเช้า (08:30 - 17:30)',  '08:30', '17:30', false, 15, 1),
    ('afternoon','กะบ่าย (13:00 - 22:00)', '13:00', '22:00', false, 15, 2),
    ('night',    'กะดึก (22:00 - 07:00)',   '22:00', '07:00', true,  15, 3)
on conflict (name) do nothing;

-- ============================================================
-- SECTION 21: INITIAL DATA - leave_types (ประเภทลาเริ่มต้น)
-- ============================================================
insert into public.leave_types (name, label, quota_per_year, is_paid, advance_days, allow_retroactive, sort_order) values
    ('annual',   'ลาพักร้อน',    6,  true,  3, false, 1),
    ('sick',     'ลาป่วย',       30, true,  0, true,  2),
    ('personal', 'ลากิจ',        3,  true,  1, false, 3),
    ('maternity','ลาคลอด',       90, true,  0, false, 4),
    ('ordain',   'ลาบวช',        15, true,  7, false, 5),
    ('unpaid',   'ลาไม่รับค่าจ้าง', 0, false, 1, false, 6)
on conflict (name) do nothing;

-- ============================================================
-- SECTION 22: INITIAL DATA - departments (แผนกเริ่มต้น)
-- ============================================================
insert into public.departments (name, description, is_active) values
    ('บริหาร',        'ฝ่ายบริหารและจัดการองค์กร',         true),
    ('HR',            'ทรัพยากรบุคคลและพัฒนาองค์กร',         true),
    ('การเงิน',       'ฝ่ายการเงินและบัญชี',                 true),
    ('การตลาด',       'ฝ่ายการตลาดและประชาสัมพันธ์',         true),
    ('ปฏิบัติการ',   'ฝ่ายปฏิบัติการและโลจิสติกส์',          true),
    ('IT',            'ฝ่ายเทคโนโลยีสารสนเทศ',               true)
on conflict (name) do nothing;

-- ============================================================
-- SECTION 23: INITIAL DATA - kpi_criteria (เกณฑ์ KPI เริ่มต้น)
-- ============================================================
insert into public.kpi_criteria (name, description, weight, category) values
    ('การมาทำงาน',     'วัดจากจำนวนวันที่มาทำงานจริง',                    30, 'attendance'),
    ('ความตรงต่อเวลา', 'วัดจากจำนวนครั้งที่มาสาย',                        25, 'punctuality'),
    ('การลาหยุด',      'วัดจากจำนวนวันลาที่เหมาะสม',                      20, 'leave'),
    ('ผลงาน',          'ประเมินโดยหัวหน้างานและผลการทำงาน (custom)',       25, 'custom')
on conflict do nothing;

-- ============================================================
-- SECTION 24: GRANT PERMISSIONS (สำหรับ anon และ authenticated roles)
-- ============================================================
grant usage on schema public to anon, authenticated;

grant select on public.profiles          to anon, authenticated;
grant select on public.work_shifts       to anon, authenticated;
grant select on public.departments       to anon, authenticated;
grant select on public.company_settings  to anon, authenticated;
grant select on public.leave_types       to anon, authenticated;
grant select on public.company_holidays  to anon, authenticated;
grant select on public.kpi_criteria      to anon, authenticated;

grant all on public.attendance_logs  to authenticated;
grant all on public.leave_requests   to authenticated;
grant all on public.leave_approvals  to authenticated;
grant all on public.notifications    to authenticated;
grant all on public.site_visits      to authenticated;
grant all on public.payroll_records  to authenticated;
grant all on public.kpi_evaluations  to authenticated;
grant all on public.profiles         to authenticated;


-- ============================================================
-- ✅ DONE! ตรวจสอบว่ารันสำเร็จโดยดูที่ Table Editor ใน Supabase
-- ตารางที่ต้องมีทั้งหมด:
--   ✓ profiles
--   ✓ work_shifts
--   ✓ departments
--   ✓ company_settings
--   ✓ leave_types
--   ✓ attendance_logs
--   ✓ leave_requests
--   ✓ leave_approvals
--   ✓ notifications
--   ✓ site_visits
--   ✓ payroll_records
--   ✓ kpi_criteria
--   ✓ kpi_evaluations
--   ✓ company_holidays
-- ============================================================
