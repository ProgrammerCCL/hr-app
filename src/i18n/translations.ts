// ===== HRMS i18n Translations =====
// Supported: th (Thai), en (English)

export type Lang = 'th' | 'en';

export const langLabels: Record<Lang, string> = {
    th: '🇹🇭 ไทย',
    en: '🇬🇧 EN',
};

type TranslationKeys = {
    // Common
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    create: string;
    close: string;
    search: string;
    export_csv: string;
    export: string;
    confirm: string;
    success: string;
    error: string;
    back: string;
    signOut: string;
    signIn: string;
    print: string;
    company: string;
    persons: string;
    for: string;
    forMonth: string;
    warning: string;
    ok: string;
    all: string;
    // Login
    welcomeBack: string;
    createAccount: string;
    joinWorkspace: string;
    signInToAccount: string;
    email: string;
    password: string;
    employeeCode: string;
    rememberMe: string;
    forgotPassword: string;
    noAccount: string;
    hasAccount: string;
    createOne: string;
    registerSuccess: string;
    loginSubTitle: string;
    loginPromoteTitle: string;
    loginPromoteDesc: string;
    loginFeature1Title: string;
    loginFeature1Desc: string;
    loginFeature2Title: string;
    loginFeature2Desc: string;
    loginFeature3Title: string;
    loginFeature3Desc: string;
    loginByEmail: string;
    loginByEmployeeCode: string;
    usernameOrCode: string;
    enterUsername: string;
    enterCode: string;
    enterPassword: string;
    rememberLogin: string;
    // Employee Dashboard
    hello: string;
    currentStatus: string;
    working: string;
    notCheckedIn: string;
    today: string;
    checkIn: string;
    checkOut: string;
    siteCheckIn: string;
    siteCheckOut: string;
    inTime: string;
    outTime: string;
    workingHrs: string;
    leave: string;
    siteVisit: string;
    payslip: string;
    recentActivity: string;
    noActivityToday: string;
    cameraVerification: string;
    checkInVerify: string;
    checkOutVerify: string;
    siteArrival: string;
    siteDeparture: string;
    takeSelfie: string;
    enterSiteName: string;
    // Profile
    profile: string;
    employeeId: string;
    role: string;
    leaveBalance: string;
    daysRemaining: string;
    changePassword: string;
    newPassword: string;
    confirmPassword: string;
    passwordMinLength: string;
    passwordNotMatch: string;
    passwordMatch: string;
    saving: string;
    saveNewPassword: string;
    changePasswordSuccess: string;
    gpsLocation: string;
    clientSiteName: string;
    locationalNote: string;
    waiting: string;
    egApple: string;
    egHeadOffice: string;
    leaveSubmittedSuccess: string;
    leaveTypeLabel: string;
    dateLabel: string;
    amountLabel: string;
    daysLabel: string;
    attachedLabel: string;
    totalLeaveTime: string;
    pleaseFillAll: string;
    invalidDateRange: string;
    hourLabel: string;
    minuteLabel: string;
    firstName: string;
    lastName: string;
    emailLabel: string;
    phoneLabel: string;
    hireDate: string;
    tenure: string;
    years: string;
    months: string;
    socialSecurityId: string;
    personalInfo: string;
    employmentInfo: string;
    financialInfo: string;
    profileUpdateSuccess: string;
    errorUpdatingProfile: string;
    // Nav
    home: string;
    history: string;
    requests: string;
    me: string;
    adminPanel: string;
    // Admin Dashboard
    overview: string;
    employees: string;
    departments: string;
    attendance: string;
    attendanceManage: string;
    leaves: string;
    monthlyReport: string;
    payroll: string;
    payslipAdmin: string;
    taxDoc: string;
    kpi: string;
    executive: string;
    settings: string;
    // Admin Nav Groups
    navMain: string;
    navTime: string;
    navFinance: string;
    navPerformance: string;
    navSettings: string;
    // Admin Overview
    totalEmployees: string;
    evaluatingKPI: string;
    kpiSuccess: string;
    evaluating: string;
    evaluateKPI: string;
    totalScore: string;
    grade: string;
    evaluateKpiStartHint: string;
    leaveUsage: string;
    calculateSalary: string;
    calculating: string;
    salaryCalculated: string;
    confirmAll: string;
    grossBase: string;
    idHeader: string;
    nameHeader: string;
    deptHeader: string;
    roleHeader: string;
    statusHeader: string;
    manageHeader: string;
    roleAdmin: string;
    roleManager: string;
    roleHR: string;
    roleEmployee: string;
    allRoles: string;
    statusActive: string;
    statusInactive: string;
    searchPlaceholder: string;
    netBase: string;
    totalDistanceTeam: string;
    km: string;
    processed: string;
    presentHeader: string;
    lateHeader: string;
    absentHeader: string;
    lateDeductionHeader: string;
    absentDeductionHeader: string;
    ssHeader: string;
    taxHeader: string;
    netPayHeader: string;
    noPayrollDataHint: string;
    calculatingFor: string;
    confirmAllSalaries: string;
    presentToday: string;
    onLeaveToday: string;
    pendingApproval: string;
    recentAttendance: string;
    viewAll: string;
    pendingLeaves: string;
    approve: string;
    reject: string;
    noData: string;
    noPendingLeaves: string;
    payslipTitle: string;
    viewSlip: string;
    noPayslipsHint: string;
    generatedByHrms: string;
    income: string;
    deduction: string;
    ssTitle: string;
    withholdingTaxTitle: string;
    netIncome: string;
    item: string;
    bank: string;
    otTitle: string;
    taxDocFullTitle: string;
    taxDocSubTitle: string;
    taxYear: string;
    payer: string;
    payee: string;
    taxPayerId: string;
    notSpecified: string;
    totalYearly: string;
    payerSignature: string;
    selectEmployeeHint: string;
    noSalaryDataYear: string;
    creating: string;
    createDoc: string;
    taxDocSelectHint: string;
    incomeHeader: string;
    present_today_count: string;
    total_records_count: string;
    individual_distance: string;
    leaves_pending_approval: string;
    all_departments_title: string;
    nav_home: string;
    manager_level_1: string;
    baht: string;
    details: string;
    checkInPhoto: string;
    checkOutPhoto: string;
    siteLog: string;
    attendanceLog: string;
    openMap: string;
    noPhotoIn: string;
    noPhotoOut: string;
    tapToClose: string;
    success_status: string;
    waiting_out_status: string;
    // Employees
    searchEmployees: string;
    addEmployee: string;
    editEmployee: string;
    position: string;
    department: string;
    shift: string;
    salary: string;
    status: string;
    employeeType: string;
    fullTime: string;
    daily: string;
    probation: string;
    resigned: string;
    active: string;
    inactive: string;
    manage: string;
    // Add Employee
    addNewEmployee: string;
    bankName: string;
    bankAccount: string;
    taxId: string;
    // Departments
    addDepartment: string;
    deptName: string;
    deptDesc: string;
    editDepartment: string;
    saveDeptSuccess: string;
    noDepartments: string;
    // Attendance
    date: string;
    time: string;
    type: string;
    location: string;
    photo: string;
    viewPhoto: string;
    // Leaves
    allLeaves: string;
    pending: string;
    leaveType: string;
    reason: string;
    noLeaves: string;
    // Settings
    companyInfo: string;
    companyName: string;
    workHours: string;
    workStart: string;
    workEnd: string;
    lateThreshold: string;
    workShifts: string;
    addNewShift: string;
    shiftKey: string;
    shiftLabel: string;
    startTime: string;
    endTime: string;
    lateMinutes: string;
    overnightShift: string;
    addShift: string;
    leaveTypes: string;
    addNewLeaveType: string;
    leaveKey: string;
    leaveLabel: string;
    quotaPerYear: string;
    paidLeave: string;
    finance: string;
    lateDeduction: string;
    otMultiplier: string;
    socialSecurityRate: string;
    socialSecurityMax: string;
    saveSettings: string;
    savingSettings: string;
    // Leave Request Page
    submitLeave: string;
    startDate: string;
    endDate: string;
    totalDays: string;
    submitRequest: string;
    submitting: string;
    leaveHistory: string;
    newRequest: string;
    approved: string;
    rejected: string;
    // Theme
    darkMode: string;
    lightMode: string;
    // Notifications
    notifications: string;
    readAll: string;
    noNotifications: string;
    myDashboard: string;
    // Common Table Headers
    name: string;
    shiftHeader: string;
    salaryHeader: string;
    fullDay: string;
    halfDay: string;
    hourly: string;
    morning: string;
    afternoon: string;
    reasonPlaceholder: string;
    attachmentHint: string;
    attachments: string;
    clickToUpload: string;
    days: string;
    remaining: string;
    cancelRequest: string;
    cancelled: string;
    pendingManager: string;
    pendingHR: string;
    viewAttachment: string;
    usedQuota: string;
    remainingAfter: string;
    quotaExceeded: string;
    outOfQuota: string;
    used: string;
    leaveDate: string;
    am: string;
    pm: string;
    employee: string;
    fileSizeError: string;
    newLeaveRequestTitle: string;
    submitted: string;
    to: string;
    waitingForYourApproval: string;
    waitingForHR: string;
    attachmentBadge: string;
    justNow: string;
    hoursAgo: string;
    daysAgo: string;
    pendingManagerStatus: string;
    pendingHRStatus: string;
    docNo: string;
    submittedAt: string;
    // Attendance Types
    check_in: string;
    check_out: string;
    site_in: string;
    site_out: string;
    // Leave Types mapped from DB Keys
    sick: string;
    personal: string;
    unpaid_personal: string;
    annual: string;
    ordination: string;
    maternity: string;
    military: string;
    marriage: string;
    funeral_parents: string;
    funeral_relatives: string;
    holiday_swap: string;
    sterilization: string;
    distance: string;
    site: string;
    companyCalendar: string;
    comingSoon: string;
    requestLeave: string;
    loadingData: string;
    pleaseWaitPreparingData: string;
    minLength6: string;
    mustAtLeast6: string;
    typeAgain: string;
    attendanceSuccess: string;
    attendanceFailed: string;
    changePasswordSuccessAlert: string;
    errorUpdatingPassword: string;
    attendanceHistory: string;
    noHistoryFound: string;
    latitude: string;
    longitude: string;
    distPrevPoint: string;
    summary: string;
    records: string;
    downloaded: string;
    jan: string; feb: string; mar: string; apr: string; may: string; jun: string;
    jul: string; aug: string; sep: string; oct: string; nov: string; dec: string;
    month: string;
    loadData: string;
    workingDaysTotal: string;
    lateDaysTotal: string;
    leaveDaysTotal: string;
    absentDaysTotal: string;
    workingDays: string;
    presentDays: string;
    lateDays: string;
    leaveDays: string;
    absentDays: string;
    attendanceRate: string;
    absent: string;
    selectEmployeeAndTime: string;
    deleteConfirm: string;
    dateHeader: string;
    timeHeader: string;
    employeeCodeHeader: string;
    fullNameHeader: string;
    forgotCheckOut: string;
    clickToAddCheckOut: string;
    everyone: string;
    addRecord: string;
    noDataToday: string;
    addAttendanceRecord: string;
    dateTime: string;
    select: string;
    fullname: string;
    avgOnTime: string;
    lateTotal: string;
    absentTotal: string;
    topLate: string;
    topOnTime: string;
    minutes: string;
    hours: string;
    avgWorkHoursShort: string;
    onTime: string;
    onTimePercent: string;
    publicHoliday: string;
    allHolidays: string;
};

const translations: Record<Lang, TranslationKeys> = {
    th: {
        loading: 'กำลังโหลด...',
        save: 'บันทึก',
        cancel: 'ยกเลิก',
        delete: 'ลบ',
        edit: 'แก้ไข',
        add: 'เพิ่ม',
        create: 'สร้าง',
        close: 'ปิด',
        search: 'ค้นหา',
        export_csv: 'ดาวน์โหลด CSV',
        export: 'ส่งออก',
        confirm: 'ยืนยัน',
        success: 'สำเร็จ',
        error: 'ข้อผิดพลาด',
        back: 'กลับ',
        signOut: 'ออกจากระบบ',
        signIn: 'เข้าสู่ระบบ',
        print: 'พิมพ์',
        company: 'บริษัท',
        persons: 'คน',
        for: 'สำหรับ',
        forMonth: 'ประจำเดือน',
        warning: 'แจ้งเตือน',
        ok: 'ตกลง',
        all: 'ทั้งหมด',
        welcomeBack: 'ยินดีต้อนรับ',
        createAccount: 'สร้างบัญชี',
        joinWorkspace: 'เข้าร่วมระบบบริษัท',
        signInToAccount: 'เข้าสู่ระบบบัญชีของคุณ',
        email: 'อีเมล',
        password: 'รหัสผ่าน',
        employeeCode: 'รหัสพนักงาน',
        rememberMe: 'จดจำฉัน',
        forgotPassword: 'ลืมรหัสผ่าน?',
        noAccount: 'ยังไม่มีบัญชี?',
        hasAccount: 'มีบัญชีแล้ว?',
        createOne: 'สร้างบัญชี',
        registerSuccess: 'ลงทะเบียนสำเร็จ! สามารถเข้าสู่ระบบได้แล้ว',
        loginSubTitle: 'ระบบใบลาออนไลน์ - BUGpairoj Group',
        loginPromoteTitle: 'จัดการใบลา ง่าย รวดเร็ว ทุกที่ทุกเวลา',
        loginPromoteDesc: 'ระบบใบลาออนไลน์สำหรับองค์กรยุคใหม่ ส่งใบลา อนุมัติ และติดตามสถานะได้แบบเรียลไทม์ พร้อมแจ้งเตือนผ่าน LINE / Email / Telegram',
        loginFeature1Title: 'อนุมัติ Workflow ครบ',
        loginFeature1Desc: 'ส่ง → อนุมัติ/ปฏิเสธ ในขั้นตอนเดียว',
        loginFeature2Title: 'แจ้งเตือนหลายช่องทาง',
        loginFeature2Desc: 'อัพเดทสถานะผ่าน LINE และ Email ทันที',
        loginFeature3Title: 'รายงานสรุปแม่นยำ',
        loginFeature3Desc: 'ดูสรุปวันลา + Export PDF/Excel',
        loginByEmail: 'อีเมล',
        loginByEmployeeCode: 'รหัสพนักงาน',
        usernameOrCode: 'ชื่อผู้ใช้งาน / รหัสพนักงาน',
        enterUsername: 'กรอกชื่อผู้ใช้งาน',
        enterCode: 'กรอกรหัสพนักงาน',
        enterPassword: 'กรอกรหัสผ่าน',
        rememberLogin: 'จดจำการเข้าสู่ระบบ',
        hello: 'สวัสดี',
        currentStatus: 'สถานะปัจจุบัน',
        working: 'กำลังทำงาน',
        notCheckedIn: 'ยังไม่ลงเวลา',
        today: 'วันนี้',
        checkIn: 'ลงเวลาเข้า',
        checkOut: 'ลงเวลาออก',
        siteCheckIn: 'เช็คอินหน้างาน',
        siteCheckOut: 'เช็คเอาท์หน้างาน',
        inTime: 'เวลาเข้า',
        outTime: 'เวลาออก',
        workingHrs: 'ชั่วโมงทำงาน',
        leave: 'ลา',
        siteVisit: 'เยี่ยมลูกค้า',
        payslip: 'สลิปเงินเดือน',
        recentActivity: 'กิจกรรมล่าสุด',
        noActivityToday: 'ยังไม่มีกิจกรรมวันนี้',
        cameraVerification: 'ยืนยันด้วยกล้อง',
        checkInVerify: 'ยืนยันเข้างาน',
        checkOutVerify: 'ยืนยันออกงาน',
        siteArrival: 'ถึงหน้างาน',
        siteDeparture: 'ออกจากหน้างาน',
        takeSelfie: 'ถ่ายเซลฟี่เพื่อยืนยันตำแหน่ง',
        enterSiteName: 'กรอกชื่อสถานที่แล้วถ่ายเซลฟี่',
        profile: 'โปรไฟล์',
        employeeId: 'รหัสพนักงาน',
        role: 'ตำแหน่ง',
        leaveBalance: 'วันลาคงเหลือ',
        daysRemaining: 'วันคงเหลือ',
        gpsLocation: 'พิกัด GPS',
        clientSiteName: 'ชื่อลูกค้า / สถานที่',
        locationalNote: 'บันทึกสถานที่',
        waiting: 'กำลังรอ...',
        egApple: 'เช่น บริษัท แอปเปิ้ล จำกัด',
        egHeadOffice: 'เช่น สำนักงานใหญ่',
        leaveSubmittedSuccess: 'ส่งใบลาสำเร็จ!',
        leaveTypeLabel: 'ประเภท:',
        dateLabel: 'วันที่:',
        amountLabel: 'จำนวน:',
        daysLabel: 'วัน',
        attachedLabel: 'แนบเอกสารแล้ว',
        totalLeaveTime: 'รวมเวลาที่ลา:',
        pleaseFillAll: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        invalidDateRange: 'ช่วงวันที่ไม่ถูกต้อง',
        hourLabel: 'ชั่วโมง',
        minuteLabel: 'นาที',
        firstName: 'ชื่อ',
        lastName: 'นามสกุล',
        emailLabel: 'อีเมล',
        phoneLabel: 'เบอร์โทร',
        hireDate: 'วันที่เริ่มงาน',
        tenure: 'อายุงาน',
        years: 'ปี',
        months: 'เดือน',
        socialSecurityId: 'เลขประกันสังคม',
        personalInfo: 'ข้อมูลส่วนตัว',
        employmentInfo: 'ข้อมูลการจ้างงาน',
        financialInfo: 'ข้อมูลการเงินและภาษี',
        profileUpdateSuccess: 'บันทึกข้อมูลส่วนตัวสำเร็จ! 🎉',
        errorUpdatingProfile: 'ไม่สามารถบันทึกข้อมูลได้:',
        changePassword: 'เปลี่ยนรหัสผ่าน',
        newPassword: 'รหัสผ่านใหม่',
        confirmPassword: 'ยืนยันรหัสผ่านใหม่',
        passwordMinLength: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัว',
        passwordNotMatch: 'รหัสผ่านไม่ตรงกัน',
        passwordMatch: 'รหัสผ่านตรงกัน',
        saving: 'กำลังบันทึก...',
        saveNewPassword: 'บันทึกรหัสผ่านใหม่',
        changePasswordSuccess: 'เปลี่ยนรหัสผ่านสำเร็จ! 🎉',
        home: 'หน้าแรก',
        history: 'ประวัติ',
        requests: 'คำขอ',
        me: 'ฉัน',
        adminPanel: 'แอดมิน',
        overview: 'ภาพรวม',
        employees: 'พนักงาน',
        departments: 'แผนก',
        attendance: 'การเข้างาน',
        attendanceManage: 'จัดการเวลา',
        leaves: 'ใบลา',
        monthlyReport: 'สรุปรายเดือน',
        payroll: 'คำนวณเงินเดือน',
        payslipAdmin: 'สลิปเงินเดือน',
        taxDoc: 'เอกสารภาษี',
        kpi: 'ประเมิน KPI',
        executive: 'รายงานผู้บริหาร',
        settings: 'ตั้งค่าระบบ',
        navMain: 'หลัก',
        navTime: 'เวลา',
        navFinance: 'การเงิน',
        navPerformance: 'ผลงาน',
        navSettings: 'ตั้งค่า',
        totalEmployees: 'พนักงานทั้งหมด',
        evaluatingKPI: 'ประเมิน KPI เดือน',
        kpiSuccess: 'ประเมิน KPI เสร็จสิ้น!',
        evaluating: 'กำลังประเมิน...',
        evaluateKPI: 'ประเมิน KPI',
        totalScore: 'คะแนนรวม',
        grade: 'เกรด',
        evaluateKpiStartHint: 'กดปุ่ม "ประเมิน KPI" เพื่อเริ่มต้น',
        leaveUsage: 'การลา',
        calculateSalary: 'คำนวณเงินเดือน',
        calculating: 'กำลังคำนวณ...',
        salaryCalculated: 'คำนวณเงินเดือนเสร็จสิ้น!',
        confirmAll: 'ยืนยันทั้งหมด',
        grossBase: 'เงินเดือนพื้นฐาน',
        idHeader: 'รหัส',
        nameHeader: 'ชื่อ-นามสกุล',
        deptHeader: 'แผนก',
        roleHeader: 'บทบาท',
        statusHeader: 'สถานะ',
        manageHeader: 'จัดการ',
        name: 'ชื่อ',
        shiftHeader: 'กะ',
        salaryHeader: 'เงินเดือน',
        roleAdmin: 'ผู้ดูแลระบบ',
        roleManager: 'หัวหน้า / ผู้จัดการ',
        roleHR: 'HR / ผู้จัดการ',
        roleEmployee: 'พนักงาน',
        allRoles: 'ทุกบทบาท',
        statusActive: 'ใช้งาน',
        statusInactive: 'ปิดใช้งาน',
        searchPlaceholder: 'ค้นหา ชื่อ / รหัส / อีเมล',
        netBase: 'จ่ายสุทธิ (Net)',
        presentHeader: 'มา',
        lateHeader: 'สาย',
        absentHeader: 'ขาด',
        lateDeductionHeader: 'หักสาย',
        absentDeductionHeader: 'หักขาด',
        ssHeader: 'ปกส.',
        taxHeader: 'ภาษี',
        netPayHeader: 'สุทธิ',
        noPayrollDataHint: 'ยังไม่มีข้อมูล — กดปุ่ม "คำนวณเงินเดือน" เพื่อเริ่มต้น',
        calculatingFor: 'คำนวณเงินเดือนเดือน',
        confirmAllSalaries: 'ยืนยันเงินเดือนทั้งหมด?',
        presentToday: 'มาทำงานวันนี้',
        onLeaveToday: 'ลาวันนี้',
        pendingApproval: 'รออนุมัติ',
        recentAttendance: 'การเข้างานล่าสุด',
        viewAll: 'ดูทั้งหมด',
        pendingLeaves: 'ใบลารออนุมัติ',
        approve: 'อนุมัติ',
        reject: 'ปฏิเสธ',
        noData: 'ไม่มีข้อมูล',
        noPendingLeaves: 'ไม่มีใบลารออนุมัติ',
        payslipTitle: 'ใบสลิปเงินเดือน',
        viewSlip: 'ดูสลิป',
        noPayslipsHint: 'ยังไม่มีสลิปเงินเดือนที่ยืนยันแล้ว — ไปหน้า Payroll เพื่อคำนวณและยืนยันก่อน',
        generatedByHrms: 'เอกสารนี้ออกโดยระบบ HRMS อัตโนมัติ',
        income: 'รายรับ',
        deduction: 'รายหัก',
        ssTitle: 'ประกันสังคม',
        withholdingTaxTitle: 'ภาษีหัก ณ ที่จ่าย',
        netIncome: 'เงินเดือนสุทธิ',
        item: 'รายการ',
        bank: 'ธนาคาร',
        otTitle: 'ค่าล่วงเวลา (OT)',
        taxDocFullTitle: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย',
        taxDocSubTitle: 'ตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร',
        taxYear: 'ปีภาษี',
        payer: 'ผู้จ่ายเงินได้',
        payee: 'ผู้มีเงินได้',
        taxPayerId: 'เลขประจำตัวผู้เสียภาษี',
        notSpecified: 'ยังไม่ระบุ',
        totalYearly: 'รวมทั้งปี',
        payerSignature: 'ผู้จ่ายเงิน (ลงชื่อ)',
        selectEmployeeHint: 'กรุณาเลือกพนักงาน',
        noSalaryDataYear: 'ไม่พบข้อมูลเงินเดือนของปีนี้',
        creating: 'กำลังสร้าง...',
        createDoc: 'สร้างเอกสาร',
        taxDocSelectHint: 'เลือกพนักงานแล้วกด "สร้างเอกสาร" เพื่อออกใบ ภ.ง.ด.1',
        incomeHeader: 'เงินได้',
        present_today_count: 'พนักงานที่มาวันนี้',
        total_records_count: 'บันทึกทั้งหมด',
        individual_distance: 'ระยะทางรายบุคคล',
        leaves_pending_approval: 'ใบลารออนุมัติ',
        all_departments_title: 'แผนกทั้งหมด',
        nav_home: 'หน้าหลัก',
        manager_level_1: 'หัวหน้างาน (ผู้อนุมัติขั้น 1)',
        baht: 'บาท',
        details: 'รายละเอียด',
        checkInPhoto: 'ภาพเข้า',
        checkOutPhoto: 'ภาพออก',
        siteLog: 'บันทึกไซต์งาน',
        attendanceLog: 'บันทึกเวลาทำงาน',
        openMap: 'เปิดแผนที่',
        noPhotoIn: 'ไม่มีภาพบันทึกเข้า',
        noPhotoOut: 'ไม่มีภาพบันทึกออก',
        tapToClose: 'แตะที่ไหนก็ได้เพื่อปิด',
        success_status: 'สำเร็จ',
        waiting_out_status: 'รอบันทึกออก',
        searchEmployees: 'ค้นหาพนักงาน...',
        addEmployee: 'เพิ่มพนักงาน',
        editEmployee: 'แก้ไขพนักงาน',
        position: 'ตำแหน่ง',
        department: 'แผนก',
        shift: 'กะ',
        salary: 'เงินเดือน',
        status: 'สถานะ',
        employeeType: 'ประเภทพนักงาน',
        fullTime: 'พนักงานประจำ',
        daily: 'รายวัน',
        probation: 'ทดลองงาน',
        resigned: 'ลาออก',
        active: 'ใช้งาน',
        inactive: 'ปิดใช้งาน',
        manage: 'จัดการ',
        addNewEmployee: 'เพิ่มพนักงานใหม่',
        bankName: 'ธนาคาร',
        bankAccount: 'เลขบัญชี',
        taxId: 'เลขประจำตัวผู้เสียภาษี',
        addDepartment: 'เพิ่มแผนก',
        deptName: 'ชื่อแผนก',
        deptDesc: 'คำอธิบาย',
        editDepartment: 'แก้ไขแผนก',
        saveDeptSuccess: 'บันทึกแผนกสำเร็จ!',
        noDepartments: 'ยังไม่มีแผนก',
        date: 'วันที่',
        time: 'เวลา',
        type: 'ประเภท',
        location: 'สถานที่',
        photo: 'รูปภาพ',
        viewPhoto: 'ดูรูป',
        allLeaves: 'ทั้งหมด',
        pending: 'รออนุมัติ',
        leaveType: 'ประเภทลา',
        reason: 'เหตุผล',
        noLeaves: 'ไม่มีใบลา',
        companyInfo: 'ข้อมูลบริษัท',
        companyName: 'ชื่อบริษัท',
        workHours: 'เวลาทำงาน',
        workStart: 'เวลาเข้างาน',
        workEnd: 'เวลาเลิกงาน',
        lateThreshold: 'เกณฑ์สาย (นาที)',
        workShifts: 'กะการทำงาน',
        addNewShift: 'เพิ่มกะใหม่',
        shiftKey: 'Key (อังกฤษ)',
        shiftLabel: 'ชื่อแสดง',
        startTime: 'เริ่ม',
        endTime: 'เลิก',
        lateMinutes: 'สาย (นาที)',
        overnightShift: 'กะข้ามคืน',
        addShift: 'เพิ่มกะ',
        leaveTypes: 'ประเภทการลา',
        addNewLeaveType: 'เพิ่มประเภทลาใหม่',
        leaveKey: 'Key (อังกฤษ)',
        leaveLabel: 'ชื่อแสดง (ไทย)',
        quotaPerYear: 'โควตา วัน/ปี',
        paidLeave: 'ลาได้เงิน',
        finance: 'การเงิน',
        lateDeduction: 'หักสาย (บาท/ครั้ง)',
        otMultiplier: 'OT Multiplier',
        socialSecurityRate: 'ประกันสังคม (%)',
        socialSecurityMax: 'ปกส. สูงสุด (บาท)',
        saveSettings: 'บันทึกการตั้งค่า',
        savingSettings: 'กำลังบันทึก...',
        submitLeave: 'ยื่นใบลา',
        startDate: 'วันเริ่ม',
        endDate: 'วันสิ้นสุด',
        totalDays: 'จำนวนวัน',
        submitRequest: 'ยื่นใบลา',
        submitting: 'กำลังส่ง...',
        leaveHistory: 'ประวัติการลา',
        newRequest: 'ยื่นใบลาใหม่',
        approved: 'อนุมัติแล้ว',
        rejected: 'ปฏิเสธ',
        darkMode: 'โหมดมืด',
        lightMode: 'โหมดสว่าง',
        notifications: 'การแจ้งเตือน',
        readAll: 'อ่านทั้งหมด',
        noNotifications: 'ไม่มีการแจ้งเตือน',
        myDashboard: 'ลงเวลา/ลาหยุด',
        fullDay: 'เต็มวัน',
        halfDay: 'ครึ่งวัน',
        hourly: 'รายชั่วโมง',
        morning: 'ช่วงเช้า (AM)',
        afternoon: 'ช่วงบ่าย (PM)',
        totalDistanceTeam: 'ระยะทางรวมทีม',
        km: 'กม.',
        processed: 'ดำเนินการแล้ว',
        reasonPlaceholder: 'กรุณาระบุเหตุผลการลา...',
        attachmentHint: 'แนบเอกสาร',
        attachments: 'ใบรับรองแพทย์, รูปภาพ, เอกสาร - สูงสุด 5MB',
        clickToUpload: 'คลิกเพื่อเลือกไฟล์',
        days: 'วัน',
        remaining: 'คงเหลือ',
        cancelRequest: 'ยกเลิก',
        cancelled: 'ยกเลิก',
        pendingManager: 'รอหน.อนุมัติ',
        pendingHR: 'รอ HR อนุมัติ',
        viewAttachment: 'ดูเอกสารแนบ',
        usedQuota: 'โควตาที่ใช้ไป',
        remainingAfter: 'หลังยื่นจะเหลือ',
        quotaExceeded: 'เกินโควต้า!',
        outOfQuota: 'หมดแล้ว',
        used: 'ใช้ไป',
        leaveDate: 'วันที่ลา',
        am: 'ช่วงเช้า (AM)',
        pm: 'ช่วงบ่าย (PM)',
        employee: 'พนักงาน',
        fileSizeError: 'ไฟล์ใหญ่เกิน 5MB กรุณาเลือกไฟล์ที่เล็กกว่า',
        newLeaveRequestTitle: 'ใบลาใหม่',
        submitted: 'ยื่น',
        to: 'ถึง',
        waitingForYourApproval: 'รอการอนุมัติขั้น 1 จากคุณ',
        waitingForHR: 'รอพิจารณา',
        attachmentBadge: 'แนบเอกสาร',
        justNow: 'เมื่อครู่',
        hoursAgo: 'ชั่วโมงที่แล้ว',
        daysAgo: 'วันที่แล้ว',
        pendingManagerStatus: 'รอหัวหน้าอนุมัติ',
        pendingHRStatus: 'รอ HR อนุมัติ',
        docNo: 'เลขที่:',
        submittedAt: 'ยื่นเมื่อ:',
        check_in: 'เข้างาน',
        check_out: 'ออกงาน',
        site_in: 'เข้าไซต์',
        site_out: 'ออกไซต์',
        sick: 'ลาป่วย',
        personal: 'ลากิจ',
        unpaid_personal: 'ลากิจไม่รับค่าจ้าง',
        annual: 'ลาพักร้อน',
        ordination: 'ลาอุปสมบท',
        maternity: 'ลาคลอดบุตร',
        military: 'ลาเกณฑ์ทหาร',
        marriage: 'ลาแต่งงาน',
        funeral_parents: 'ลาชาปณกิจ พ่อ แม่',
        funeral_relatives: 'ลาชาปณกิจญาติ',
        holiday_swap: 'ลาสลับวันหยุด',
        sterilization: 'ลาทำหมัน',
        distance: 'ระยะทาง',
        site: 'ไซต์',
        companyCalendar: 'ปฏิทินบริษัท',
        comingSoon: 'เร็วๆ นี้',
        requestLeave: 'ขอลาหยุด',
        loadingData: 'กำลังโหลดข้อมูล...',
        pleaseWaitPreparingData: 'กรุณารอสักครู่ ระบบกำลังจัดเตรียมข้อมูลของคุณ',
        minLength6: 'อย่างน้อย 6 ตัวอักษร',
        mustAtLeast6: 'ต้องมีอย่างน้อย 6 ตัว',
        typeAgain: 'พิมพ์รหัสผ่านอีกครั้ง',
        attendanceSuccess: 'บันทึกเวลาสำเร็จ!',
        attendanceFailed: 'ไม่สามารถบันทึกเวลาได้:',
        changePasswordSuccessAlert: 'เปลี่ยนรหัสผ่านสำเร็จ!',
        errorUpdatingPassword: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน:',
        attendanceHistory: 'ประวัติลงเวลา',
        noHistoryFound: 'ไม่พบประวัติ',
        latitude: 'ละติจูด',
        longitude: 'ลองจิจูด',
        distPrevPoint: 'ระยะทางจากจุดก่อนหน้า (กม.)',
        summary: 'รวม',
        records: 'รายการ',
        downloaded: 'ดาวน์โหลดแล้ว',
        jan: 'ม.ค.', feb: 'ก.พ.', mar: 'มี.ค.', apr: 'เม.ย.', may: 'พ.ค.', jun: 'มิ.ย.',
        jul: 'ก.ค.', aug: 'ส.ค.', sep: 'ก.ย.', oct: 'ต.ค.', nov: 'พ.ย.', dec: 'ธ.ค.',
        month: 'เดือน',
        loadData: 'โหลดข้อมูล',
        workingDaysTotal: 'วันทำงาน (รวม)',
        lateDaysTotal: 'มาสาย (รวม)',
        leaveDaysTotal: 'ลา (รวม)',
        absentDaysTotal: 'ขาดงาน (รวม)',
        workingDays: 'วันทำงาน',
        presentDays: 'มาทำงาน',
        lateDays: 'สาย',
        leaveDays: 'ลา',
        absentDays: 'ขาด',
        attendanceRate: '% มาทำงาน',
        absent: 'ขาดงาน',
        selectEmployeeAndTime: 'กรุณาเลือกพนักงานและเวลา',
        deleteConfirm: 'ลบบันทึกนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
        dateHeader: 'วันที่',
        timeHeader: 'เวลา',
        employeeCodeHeader: 'รหัสพนักงาน',
        fullNameHeader: 'ชื่อ-สกุล',
        forgotCheckOut: 'พนักงานลืม Check Out',
        clickToAddCheckOut: 'กดเพื่อเพิ่ม Check Out',
        everyone: 'ทุกคน',
        addRecord: 'เพิ่มบันทึก',
        noDataToday: 'ไม่มีข้อมูลวันนี้',
        addAttendanceRecord: 'เพิ่มบันทึกเวลา',
        dateTime: 'วันเวลา',
        select: 'เลือก',
        fullname: 'ชื่อ-สกุล',
        avgOnTime: 'ตรงเวลาเฉลี่ย',
        lateTotal: 'มาสาย (ครั้ง)',
        absentTotal: 'ขาดงาน (วัน)',
        topLate: 'สายบ่อย Top 5',
        topOnTime: 'ตรงเวลา Top 5',
        minutes: 'นาที',
        hours: 'ชม.',
        avgWorkHoursShort: 'ชม.เฉลี่ย',
        onTime: 'ตรงเวลา',
        onTimePercent: 'ตรงเวลา %',
        publicHoliday: 'วันหยุดนักขัตฤกษ์',
        allHolidays: 'วันหยุดประจำปี ทั้งหมด',
    },
    en: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        create: 'Create',
        close: 'Close',
        search: 'Search',
        export_csv: 'Download CSV',
        export: 'Export',
        confirm: 'Confirm',
        success: 'Success',
        error: 'Error',
        back: 'Back',
        signOut: 'Sign Out',
        signIn: 'Sign In',
        print: 'Print',
        company: 'Company',
        persons: 'persons',
        for: 'For',
        forMonth: 'for',
        warning: 'Warning',
        ok: 'OK',
        all: 'All',
        welcomeBack: 'Welcome Back',
        createAccount: 'Create Account',
        joinWorkspace: 'Join your company workspace',
        signInToAccount: 'Sign in to your account',
        email: 'Email',
        password: 'Password',
        employeeCode: 'Employee Code',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        createOne: 'Create one',
        registerSuccess: 'Registration successful! You can now sign in.',
        loginSubTitle: 'Online Leave System - BUGpairoj Group',
        loginPromoteTitle: 'Manage Leaves Easily, Anywhere, Anytime',
        loginPromoteDesc: 'Modern online leave system for businesses. Submit, approve, and track status in real-time with notifications via LINE / Email / Telegram.',
        loginFeature1Title: 'Complete Approval Workflow',
        loginFeature1Desc: 'Submit → Approve/Reject in one step',
        loginFeature2Title: 'Multi-channel Notifications',
        loginFeature2Desc: 'Instant status updates via LINE and Email',
        loginFeature3Title: 'Accurate Summary Reports',
        loginFeature3Desc: 'View leave summaries + Export PDF/Excel',
        loginByEmail: 'Email',
        loginByEmployeeCode: 'Employee Code',
        usernameOrCode: 'Username / Employee Code',
        enterUsername: 'Enter username',
        enterCode: 'Enter employee code',
        enterPassword: 'Enter password',
        rememberLogin: 'Remember me',
        hello: 'Hello',
        currentStatus: 'Current Status',
        working: 'Working • On Site',
        notCheckedIn: 'Not Checked In',
        today: 'Today',
        checkIn: 'CHECK IN',
        checkOut: 'CHECK OUT',
        siteCheckIn: 'Site Check-In',
        siteCheckOut: 'Site Check-Out',
        inTime: 'In Time',
        outTime: 'Out Time',
        workingHrs: 'Working Hrs',
        leave: 'Leave',
        siteVisit: 'Site Visit',
        payslip: 'Payslip',
        recentActivity: 'Recent Activity',
        noActivityToday: 'No activity today yet.',
        cameraVerification: 'Camera Verification',
        checkInVerify: 'Check In Verification',
        checkOutVerify: 'Check Out Verification',
        siteArrival: 'Site Arrival',
        siteDeparture: 'Site Departure',
        takeSelfie: 'Take a selfie to verify your location',
        enterSiteName: 'Enter site name and take a selfie',
        profile: 'Profile',
        employeeId: 'Employee ID',
        role: 'Role',
        leaveBalance: 'Leave Balance',
        daysRemaining: 'days remaining',
        changePassword: 'Change Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm New Password',
        passwordMinLength: 'Password must be at least 6 characters',
        passwordNotMatch: 'Passwords do not match',
        passwordMatch: 'Passwords match',
        saving: 'Saving...',
        saveNewPassword: 'Save New Password',
        changePasswordSuccess: 'Password changed successfully! 🎉',
        gpsLocation: 'GPS Location',
        clientSiteName: 'Client / Site Name',
        locationalNote: 'Locational Note',
        waiting: 'Waiting...',
        egApple: 'e.g., Apple Inc.',
        egHeadOffice: 'e.g., Head Office',
        leaveSubmittedSuccess: 'Leave requested successfully!',
        leaveTypeLabel: 'Type:',
        dateLabel: 'Date:',
        amountLabel: 'Amount:',
        daysLabel: 'Days',
        attachedLabel: 'Document attached',
        totalLeaveTime: 'Total leave time:',
        pleaseFillAll: 'Please fill in all required fields',
        invalidDateRange: 'Invalid date range',
        hourLabel: 'hr',
        minuteLabel: 'min',
        firstName: 'First Name',
        lastName: 'Last Name',
        emailLabel: 'Email',
        phoneLabel: 'Phone',
        hireDate: 'Hire Date',
        tenure: 'Tenure',
        years: 'years',
        months: 'months',
        socialSecurityId: 'Social Security ID',
        personalInfo: 'Personal Information',
        employmentInfo: 'Employment Information',
        financialInfo: 'Financial & Tax Information',
        profileUpdateSuccess: 'Profile updated successfully! 🎉',
        errorUpdatingProfile: 'Error updating profile:',
        home: 'Home',
        history: 'History',
        requests: 'Requests',
        me: 'Me',
        adminPanel: 'Admin Panel',
        overview: 'Overview',
        employees: 'Employees',
        departments: 'Departments',
        attendance: 'Attendance',
        attendanceManage: 'Manage Time',
        leaves: 'Leave Requests',
        monthlyReport: 'Monthly Report',
        payroll: 'Payroll',
        payslipAdmin: 'Payslips',
        taxDoc: 'Tax Documents',
        kpi: 'KPI Evaluation',
        executive: 'Executive Report',
        settings: 'Settings',
        navMain: 'Main',
        navTime: 'Time',
        navFinance: 'Finance',
        navPerformance: 'Performance',
        navSettings: 'Settings',
        totalEmployees: 'Total Employees',
        evaluatingKPI: 'Evaluate KPI for',
        kpiSuccess: 'KPI Evaluation completed!',
        evaluating: 'Evaluating...',
        evaluateKPI: 'Evaluate KPI',
        totalScore: 'Total Score',
        grade: 'Grade',
        evaluateKpiStartHint: 'Click "Evaluate KPI" to start',
        leaveUsage: 'Leave',
        calculateSalary: 'Calculate Salary',
        calculating: 'Calculating...',
        salaryCalculated: 'Salary calculated successfully!',
        confirmAll: 'Confirm All',
        grossBase: 'Gross Base Salary',
        idHeader: 'ID',
        nameHeader: 'NAME',
        deptHeader: 'DEPT',
        roleHeader: 'ROLE',
        statusHeader: 'STATUS',
        manageHeader: 'MANAGE',
        name: 'Name',
        shiftHeader: 'Shift',
        salaryHeader: 'Salary',
        roleAdmin: 'Admin',
        roleManager: 'Manager',
        roleHR: 'HR',
        roleEmployee: 'Employee',
        allRoles: 'All Roles',
        statusActive: 'Active',
        statusInactive: 'Inactive',
        searchPlaceholder: 'Search Name / Code / Email',
        netBase: 'Net Total',
        presentHeader: 'Pre.',
        lateHeader: 'Late',
        absentHeader: 'Abs.',
        lateDeductionHeader: 'Late Ded.',
        absentDeductionHeader: 'Abs. Ded.',
        ssHeader: 'S.S.',
        taxHeader: 'Tax',
        netPayHeader: 'Net',
        noPayrollDataHint: 'No data yet - Click "Calculate Salary" to start',
        calculatingFor: 'Calculate salary for',
        confirmAllSalaries: 'Confirm all salaries?',
        presentToday: 'Present Today',
        onLeaveToday: 'On Leave',
        pendingApproval: 'Pending',
        recentAttendance: 'Recent Attendance',
        viewAll: 'View All',
        pendingLeaves: 'Pending Leave Requests',
        approve: 'Approve',
        reject: 'Reject',
        noData: 'No data',
        noPendingLeaves: 'No pending leave requests',
        payslipTitle: 'Payslip',
        viewSlip: 'View Slip',
        noPayslipsHint: 'No confirmed payslips - Go to Payroll to calculate and confirm first',
        generatedByHrms: 'This document is generated by HRMS',
        income: 'Earnings',
        deduction: 'Deductions',
        ssTitle: 'Social Security',
        withholdingTaxTitle: 'Withholding Tax',
        netIncome: 'Net Income',
        item: 'Item',
        bank: 'Bank',
        otTitle: 'Overtime (OT)',
        taxDocFullTitle: 'Withholding Tax Certificate',
        taxDocSubTitle: 'According to Section 50 bis of the Revenue Code',
        taxYear: 'Tax Year',
        payer: 'Payer',
        payee: 'Payee',
        taxPayerId: 'Tax ID',
        notSpecified: 'Not Specified',
        totalYearly: 'Total Yearly',
        payerSignature: 'Payer (Signature)',
        selectEmployeeHint: 'Please select an employee',
        noSalaryDataYear: 'No salary data found for this year',
        creating: 'Creating...',
        createDoc: 'Create Document',
        taxDocSelectHint: 'Select an employee and click "Create Document" for Tax Form',
        incomeHeader: 'Income',
        present_today_count: 'Present Today',
        total_records_count: 'Total Records',
        individual_distance: 'Individual Distance',
        leaves_pending_approval: 'Leaves Pending Approval',
        all_departments_title: 'All Departments',
        nav_home: 'Home',
        manager_level_1: 'Manager (Level 1 Approver)',
        baht: 'Baht',
        details: 'Details',
        checkInPhoto: 'Check-In Photo',
        checkOutPhoto: 'Check-Out Photo',
        siteLog: 'Site Visit Log',
        attendanceLog: 'Attendance Log',
        openMap: 'Open Map',
        noPhotoIn: 'No check-in photo',
        noPhotoOut: 'No check-out photo',
        tapToClose: 'Tap anywhere to close',
        success_status: 'Success',
        waiting_out_status: 'Waiting Out',
        searchEmployees: 'Search employees...',
        addEmployee: 'Add Employee',
        editEmployee: 'Edit Employee',
        position: 'Position',
        department: 'Department',
        shift: 'Shift',
        salary: 'Salary',
        status: 'Status',
        employeeType: 'Employee Type',
        fullTime: 'Full-time',
        daily: 'Daily',
        probation: 'Probation',
        resigned: 'Resigned',
        active: 'Active',
        inactive: 'Inactive',
        manage: 'Manage',
        addNewEmployee: 'Add New Employee',
        bankName: 'Bank Name',
        bankAccount: 'Bank Account',
        taxId: 'Tax ID',
        addDepartment: 'Add Department',
        deptName: 'Department Name',
        deptDesc: 'Description',
        editDepartment: 'Edit Department',
        saveDeptSuccess: 'Department saved successfully!',
        noDepartments: 'No departments yet',
        date: 'Date',
        time: 'Time',
        type: 'Type',
        location: 'Location',
        photo: 'Photo',
        viewPhoto: 'View Photo',
        allLeaves: 'All',
        pending: 'Pending',
        leaveType: 'Leave Type',
        reason: 'Reason',
        noLeaves: 'No leave requests',
        companyInfo: 'Company Info',
        companyName: 'Company Name',
        workHours: 'Work Hours',
        workStart: 'Work Start',
        workEnd: 'Work End',
        lateThreshold: 'Late Threshold (min)',
        workShifts: 'Work Shifts',
        addNewShift: 'Add New Shift',
        shiftKey: 'Key (English)',
        shiftLabel: 'Display Name',
        startTime: 'Start',
        endTime: 'End',
        lateMinutes: 'Late (min)',
        overnightShift: 'Overnight Shift',
        addShift: 'Add Shift',
        leaveTypes: 'Leave Types',
        addNewLeaveType: 'Add New Leave Type',
        leaveKey: 'Key (English)',
        leaveLabel: 'Display Name',
        quotaPerYear: 'Quota days/year',
        paidLeave: 'Paid Leave',
        finance: 'Finance',
        lateDeduction: 'Late Deduction (/time)',
        otMultiplier: 'OT Multiplier',
        socialSecurityRate: 'Social Security (%)',
        socialSecurityMax: 'SS Max',
        saveSettings: 'Save Settings',
        savingSettings: 'Saving...',
        submitLeave: 'Submit Leave',
        startDate: 'Start Date',
        endDate: 'End Date',
        totalDays: 'Total Days',
        submitRequest: 'Submit Request',
        submitting: 'Submitting...',
        leaveHistory: 'Leave History',
        newRequest: 'New Request',
        approved: 'Approved',
        rejected: 'Rejected',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        notifications: 'Notifications',
        readAll: 'Read All',
        noNotifications: 'No notifications',
        myDashboard: 'Time & Leave',
        fullDay: 'Full Day',
        halfDay: 'Half Day',
        hourly: 'Hourly',
        morning: 'Morning (AM)',
        afternoon: 'Afternoon (PM)',
        totalDistanceTeam: 'Team Distance',
        km: 'km',
        processed: 'Processed',
        reasonPlaceholder: 'Please specify reason...',
        attachmentHint: 'Attachment',
        attachments: "Medical certificate, images, documents - Max 5MB",
        clickToUpload: 'Click to upload file',
        days: 'days',
        remaining: 'remaining',
        cancelRequest: 'Cancel',
        cancelled: 'Cancelled',
        pendingManager: 'Waiting Manager',
        pendingHR: 'Waiting HR',
        viewAttachment: 'View Attachment',
        usedQuota: 'Used Quota',
        remainingAfter: 'Remaining After',
        quotaExceeded: 'Quota Exceeded!',
        outOfQuota: 'is out of quota',
        used: 'Used',
        leaveDate: 'Leave Date',
        am: 'Morning (AM)',
        pm: 'Afternoon (PM)',
        employee: 'Employee',
        fileSizeError: 'File is too large (max 5MB). Please select a smaller file.',
        newLeaveRequestTitle: 'New Leave Request',
        submitted: 'submitted',
        to: 'to',
        waitingForYourApproval: 'waiting for your stage 1 approval',
        waitingForHR: 'waiting for HR/Admin',
        attachmentBadge: 'Attachment',
        justNow: 'Just now',
        hoursAgo: 'hours ago',
        daysAgo: 'days ago',
        pendingManagerStatus: 'Waiting Manager',
        pendingHRStatus: 'Waiting HR',
        docNo: 'Doc No:',
        submittedAt: 'Submitted at:',
        check_in: 'Check In',
        check_out: 'Check Out',
        site_in: 'Site In',
        site_out: 'Site Out',
        sick: 'Sick Leave',
        personal: 'Personal Leave',
        unpaid_personal: 'Unpaid Personal Leave',
        annual: 'Annual Leave',
        ordination: 'Ordination Leave',
        maternity: 'Maternity Leave',
        military: 'Military Leave',
        marriage: 'Marriage Leave',
        funeral_parents: 'Funeral (Parents)',
        funeral_relatives: 'Funeral (Relatives)',
        holiday_swap: 'Holiday Swap',
        sterilization: 'Sterilization',
        distance: 'Distance',
        site: 'Site',
        companyCalendar: 'Company Calendar',
        comingSoon: 'Coming Soon',
        requestLeave: 'Request Leave',
        loadingData: 'Loading Data...',
        pleaseWaitPreparingData: 'Please wait, preparing your system',
        minLength6: 'At least 6 characters',
        mustAtLeast6: 'Must be at least 6 characters',
        typeAgain: 'Type password again',
        attendanceSuccess: 'Attendance submitted successfully!',
        attendanceFailed: 'Failed to submit attendance:',
        changePasswordSuccessAlert: 'Password changed successfully!',
        errorUpdatingPassword: 'Error updating password:',
        attendanceHistory: 'Attendance History',
        noHistoryFound: 'No history found.',
        latitude: 'Latitude',
        longitude: 'Longitude',
        distPrevPoint: 'Dist from Prev (km)',
        summary: 'Total',
        records: 'records',
        downloaded: 'Downloaded',
        jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun',
        jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec',
        month: 'Month',
        loadData: 'Load Data',
        workingDaysTotal: 'Working Days (Total)',
        lateDaysTotal: 'Late (Total)',
        leaveDaysTotal: 'Leave (Total)',
        absentDaysTotal: 'Absent (Total)',
        workingDays: 'Working Days',
        presentDays: 'Present',
        lateDays: 'Late',
        leaveDays: 'Leave',
        absentDays: 'Absent',
        attendanceRate: 'Attendance %',
        absent: 'Absent',
        selectEmployeeAndTime: 'Please select employee and time',
        deleteConfirm: 'Delete this record? This action cannot be undone',
        dateHeader: 'Date',
        timeHeader: 'Time',
        employeeCodeHeader: 'Emp Code',
        fullNameHeader: 'Full Name',
        forgotCheckOut: 'Forgot to Check Out',
        clickToAddCheckOut: 'Click to add Check Out',
        everyone: 'Everyone',
        addRecord: 'Add Record',
        noDataToday: 'No data today',
        addAttendanceRecord: 'Add Attendance Record',
        dateTime: 'Date & Time',
        select: 'Select',
        fullname: 'Full Name',
        avgOnTime: 'Avg On-Time',
        lateTotal: 'Total Late',
        absentTotal: 'Total Absent',
        topLate: 'Most Late (Top 5)',
        topOnTime: 'Most On-Time (Top 5)',
        minutes: 'mins',
        hours: 'hours',
        avgWorkHoursShort: 'Avg Hrs',
        onTime: 'On Time',
        onTimePercent: 'On Time %',
        publicHoliday: 'Public Holiday',
        allHolidays: 'Annual Holidays List',
    },
};

export default translations;
