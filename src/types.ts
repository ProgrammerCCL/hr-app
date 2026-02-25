
export interface Profile {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'employee' | 'hr' | 'manager' | 'admin';
    avatar_url?: string;
    department?: string;
    position?: string;
    manager_id?: string;
    phone?: string;
    start_date?: string;
    is_active?: boolean;
    base_salary?: number;
    bank_name?: string;
    bank_account?: string;
    tax_id?: string;
    social_security_id?: string;
    employee_code?: string;
    employee_type?: 'full-time' | 'daily' | 'probation' | 'resigned' | string;
    shift_id?: string;
    created_at?: string;
    work_shifts?: WorkShift;
}

export interface AttendanceLog {
    id: string;
    user_id: string;
    timestamp: string;
    type: 'check_in' | 'check_out' | 'site_in' | 'site_out';
    location_lat?: number;
    location_lng?: number;
    location_name?: string;
    photo_url?: string;
    device_info?: string;
    status: 'ontime' | 'late' | 'absent';
    created_at?: string;
    profiles?: { first_name: string; last_name: string; avatar_url?: string };
}

export interface LeaveRequest {
    id: string;
    user_id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days?: number;
    reason: string;
    attachment_url?: string;
    status: 'pending' | 'pending_manager' | 'approved' | 'rejected' | 'cancelled';
    approver_id?: string;
    current_step?: number;
    total_steps?: number;
    approval_chain_id?: string;
    created_at: string;
    profiles?: { first_name: string; last_name: string; avatar_url?: string };
    requester?: { first_name: string; last_name: string; avatar_url?: string };
    approver?: { first_name: string; last_name: string };
    leave_approvals?: LeaveApproval[];
}

export interface LeaveApproval {
    id: string;
    leave_request_id: string;
    step_number: number;
    approver_id?: string;
    approver_role: string;
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
    acted_at?: string;
    created_at: string;
    profiles?: { first_name: string; last_name: string };
}

export interface Department {
    id: string;
    name: string;
    description?: string;
    manager_id?: string;
    is_active: boolean;
    created_at?: string;
}

export interface CompanySettings {
    company_name: string;
    work_start_time: string;
    work_end_time: string;
    annual_leave_quota: string;
    sick_leave_quota: string;
    personal_leave_quota: string;
    late_threshold_minutes: string;
    late_deduction_per_time: string;
    absent_deduction_per_day: string;
    ot_rate_multiplier: string;
    social_security_rate: string;
    social_security_max: string;
    [key: string]: string;
}

export interface SiteVisit {
    id: string;
    user_id: string;
    customer_name: string;
    location_name?: string;
    location_lat?: number;
    location_lng?: number;
    check_in_time: string;
    check_out_time?: string;
    check_in_photo?: string;
    check_out_photo?: string;
    notes?: string;
    status: 'active' | 'completed';
    created_at: string;
    profiles?: { first_name: string; last_name: string; avatar_url?: string };
}

export interface ApprovalChain {
    id: string;
    name: string;
    chain_type: string;
    steps: ApprovalStep[];
    is_active: boolean;
    created_at: string;
}

export interface ApprovalStep {
    step: number;
    role: string;
    label: string;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'leave' | 'approval' | 'payroll';
    is_read: boolean;
    link?: string;
    created_at: string;
}

export interface PayrollRecord {
    id: string;
    user_id: string;
    month: number;
    year: number;
    base_salary: number;
    working_days: number;
    actual_days: number;
    late_count: number;
    absent_days: number;
    leave_days: number;
    ot_hours: number;
    ot_amount: number;
    late_deduction: number;
    absent_deduction: number;
    social_security: number;
    withholding_tax: number;
    other_deductions: number;
    other_additions: number;
    gross_pay: number;
    net_pay: number;
    status: 'draft' | 'confirmed' | 'paid';
    notes?: string;
    created_at: string;
    profiles?: { first_name: string; last_name: string; department?: string; position?: string; bank_name?: string; bank_account?: string };
}

export interface KPICriteria {
    id: string;
    name: string;
    description?: string;
    weight: number;
    category: 'attendance' | 'punctuality' | 'leave' | 'custom';
    is_active: boolean;
    created_at: string;
}

export interface KPIEvaluation {
    id: string;
    user_id: string;
    month: number;
    year: number;
    scores: Record<string, number>;
    total_score: number;
    grade: string;
    evaluator_id?: string;
    comment?: string;
    created_at: string;
    profiles?: { first_name: string; last_name: string; department?: string; position?: string };
}

export interface LeaveType {
    id: string;
    name: string;
    label: string;
    quota_per_year: number;
    is_paid: boolean;
    is_active: boolean;
    sort_order: number;
    min_days_advance?: number;
    max_days_backdated?: number;
    advance_days?: number;
    allow_retroactive?: boolean;
    created_at: string;
}

export interface WorkShift {
    id: string;
    name: string;
    label: string;
    start_time: string;
    end_time: string;
    is_overnight: boolean;
    late_threshold_minutes: number;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

export interface AppNotification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message?: string;
    is_read: boolean;
    related_id?: string;
    created_by?: string;
    created_at: string;
}

