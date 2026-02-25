// ===== HRMS i18n Translations =====
// Supported: th (Thai), en (English), ja (Japanese)

export type Lang = 'th' | 'en' | 'ja';

export const langLabels: Record<Lang, string> = {
    th: '🇹🇭 ไทย',
    en: '🇬🇧 EN',
    ja: '🇯🇵 日本語',
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
    netBase: string;
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
    idHeader: string;
    roleHeader: string;
    deptHeader: string;
    shiftHeader: string;
    salaryHeader: string;
    statusHeader: string;
    manageHeader: string;
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
        grossBase: 'เงินเดือนรวม (Gross)',
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
        name: 'ชื่อ',
        idHeader: 'รหัส',
        roleHeader: 'บทบาท',
        deptHeader: 'แผนก',
        shiftHeader: 'กะ',
        salaryHeader: 'เงินเดือน',
        statusHeader: 'สถานะ',
        manageHeader: 'จัดการ',
        fullDay: 'เต็มวัน',
        halfDay: 'ครึ่งวัน',
        hourly: 'รายชั่วโมง',
        morning: 'ช่วงเช้า (AM)',
        afternoon: 'ช่วงบ่าย (PM)',
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
        grossBase: 'Gross Total',
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
        name: 'Name',
        idHeader: 'ID',
        roleHeader: 'Role',
        deptHeader: 'Dept',
        shiftHeader: 'Shift',
        salaryHeader: 'Salary',
        statusHeader: 'Status',
        manageHeader: 'Manage',
        fullDay: 'Full Day',
        halfDay: 'Half Day',
        hourly: 'Hourly',
        morning: 'Morning (AM)',
        afternoon: 'Afternoon (PM)',
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
    ja: {
        loading: '読み込み中...',
        save: '保存',
        cancel: 'キャンセル',
        delete: '削除',
        edit: '編集',
        add: '追加',
        create: '作成',
        close: '閉じる',
        search: '検索',
        export_csv: 'CSV出力',
        confirm: '確認',
        success: '成功',
        error: 'エラー',
        back: '戻る',
        signOut: 'ログアウト',
        signIn: 'ログイン',
        print: '印刷',
        company: '会社',
        persons: '人',
        for: '：',
        forMonth: '：',
        welcomeBack: 'おかえりなさい',
        createAccount: 'アカウント作成',
        joinWorkspace: '会社のワークスペースに参加',
        signInToAccount: 'アカウントにログイン',
        email: 'メール',
        password: 'パスワード',
        employeeCode: '社員コード',
        rememberMe: '記憶する',
        forgotPassword: 'パスワードを忘れた？',
        noAccount: 'アカウントがない？',
        hasAccount: 'アカウントをお持ちですか？',
        createOne: '新規作成',
        registerSuccess: '登録成功！ログインできます。',
        hello: 'こんにちは',
        currentStatus: '現在のステータス',
        working: '勤務中',
        notCheckedIn: '未出勤',
        today: '今日',
        checkIn: '出勤',
        checkOut: '退勤',
        gpsLocation: 'GPS位置',
        clientSiteName: 'クライアント / サイト名',
        locationalNote: '場所のメモ',
        waiting: '待機中...',
        egApple: '例: Apple Inc.',
        egHeadOffice: '例: 本社',
        leaveSubmittedSuccess: '休暇申請が完了しました！',
        leaveTypeLabel: 'タイプ:',
        dateLabel: '日付:',
        amountLabel: '日数:',
        daysLabel: '日',
        attachedLabel: '添付書類あり',
        totalLeaveTime: '合計休暇時間:',
        hourLabel: '時間',
        minuteLabel: '分',
        firstName: '名',
        lastName: '氏',
        emailLabel: 'メール',
        phoneLabel: '電話番号',
        hireDate: '入社日',
        tenure: '勤続年数',
        years: '年',
        months: 'ヶ月',
        socialSecurityId: '社会保険番号',
        personalInfo: '個人情報',
        employmentInfo: '雇用情報',
        financialInfo: '財務・税務情報',
        profileUpdateSuccess: 'プロフィールを更新しました。 🎉',
        errorUpdatingProfile: 'プロフィールの更新に失敗しました:',
        siteCheckIn: '現場チェックイン',
        siteCheckOut: '現場チェックアウト',
        inTime: '出勤時刻',
        outTime: '退勤時刻',
        workingHrs: '勤務時間',
        leave: '休暇',
        siteVisit: '現場訪問',
        payslip: '給与明細',
        recentActivity: '最近の活動',
        noActivityToday: '今日の活動はまだありません',
        cameraVerification: 'カメラ認証',
        checkInVerify: '出勤確認',
        checkOutVerify: '退勤確認',
        siteArrival: '現場到着',
        siteDeparture: '現場出発',
        takeSelfie: '自撮りで位置を確認',
        enterSiteName: '現場名を入力して自撮り',
        profile: 'プロフィール',
        employeeId: '社員ID',
        role: '役職',
        leaveBalance: '残り休暇',
        daysRemaining: '日残り',
        changePassword: 'パスワード変更',
        newPassword: '新しいパスワード',
        confirmPassword: '新しいパスワード確認',
        passwordMinLength: 'パスワードは6文字以上必要です',
        passwordNotMatch: 'パスワードが一致しません',
        passwordMatch: 'パスワードが一致',
        saving: '保存中...',
        saveNewPassword: '新しいパスワードを保存',
        changePasswordSuccess: 'パスワード変更成功！🎉',
        home: 'ホーム',
        history: '履歴',
        requests: '申請',
        me: '自分',
        adminPanel: '管理画面',
        overview: '概要',
        employees: '社員',
        departments: '部門',
        attendance: '出勤管理',
        attendanceManage: '時間管理',
        leaves: '休暇申請',
        monthlyReport: '月次レポート',
        payroll: '給与計算',
        payslipAdmin: '給与明細',
        taxDoc: '税務書類',
        kpi: 'KPI評価',
        executive: 'エグゼクティブレポート',
        settings: '設定',
        navMain: 'メイン',
        navTime: '時間',
        navFinance: '財務',
        navPerformance: '業績',
        navSettings: '設定',
        totalEmployees: '全社員',
        evaluatingKPI: 'KPI評価を実行しますか：',
        kpiSuccess: 'KPI評価が完了しました！',
        evaluating: '評価中...',
        evaluateKPI: 'KPI評価',
        totalScore: '合計スコア',
        grade: 'ランク',
        evaluateKpiStartHint: '「KPI評価」ボタンをクリックして開始',
        leaveUsage: '休暇',
        calculateSalary: '給与計算',
        calculating: '計算中...',
        salaryCalculated: '給与計算が完了しました！',
        confirmAll: '一括確定',
        grossBase: '総支給額',
        netBase: '手取合計',
        presentHeader: '出勤',
        lateHeader: '遅刻',
        absentHeader: '欠勤',
        lateDeductionHeader: '遅刻控除',
        absentDeductionHeader: '欠勤控除',
        ssHeader: '社保',
        taxHeader: '税金',
        netPayHeader: '手取',
        noPayrollDataHint: 'データなし - 「給与計算」ボタンをクリックして開始',
        calculatingFor: '給与計算を実行しますか：',
        confirmAllSalaries: 'すべての給与を確定しますか？',
        presentToday: '出勤中',
        onLeaveToday: '休暇中',
        pendingApproval: '承認待ち',
        recentAttendance: '最近の出勤',
        viewAll: 'すべて表示',
        pendingLeaves: '承認待ちの休暇',
        approve: '承認',
        reject: '却下',
        noData: 'データなし',
        noPendingLeaves: '承認待ちの休暇申請はありません',
        payslipTitle: '給与明細',
        viewSlip: '明細を表示',
        noPayslipsHint: '確定された給与明細がありません - 給与計算で計算と確定を行ってください',
        generatedByHrms: 'このドキュメントはHRMSシステムによって自動生成されました',
        income: '支給',
        deduction: '控除',
        ssTitle: '社会保険',
        withholdingTaxTitle: '源泉徴収税',
        netIncome: '差引支給額',
        item: '項目',
        bank: '銀行',
        otTitle: '時間外手当 (OT)',
        taxDocFullTitle: '源泉徴収証明書',
        taxDocSubTitle: '歳入法第50条の2に基づく',
        taxYear: '課税年度',
        payer: '支払者',
        payee: '受領者',
        taxPayerId: '納税者番号',
        notSpecified: '未指定',
        totalYearly: '年間合計',
        payerSignature: '支払者 (署名)',
        selectEmployeeHint: '社員を選択してください',
        noSalaryDataYear: '該当年度の給与データが見つかりません',
        creating: '作成中...',
        createDoc: '書類作成',
        taxDocSelectHint: '社員を選択し「書類作成」をクリックして源泉徴収票を発行してください',
        incomeHeader: '源泉徴収',
        searchEmployees: '社員を検索...',
        addEmployee: '社員追加',
        editEmployee: '社員編集',
        position: '職位',
        department: '部門',
        shift: 'シフト',
        salary: '給与',
        status: 'ステータス',
        employeeType: '雇用形態',
        fullTime: '正社員',
        daily: '日給',
        probation: '試用期間',
        resigned: '退職',
        active: '有効',
        inactive: '無効',
        manage: '管理',
        addNewEmployee: '新しい社員を追加',
        bankName: '銀行名',
        bankAccount: '口座番号',
        taxId: '納税者番号',
        addDepartment: '部門追加',
        deptName: '部門名',
        deptDesc: '説明',
        editDepartment: '部門編集',
        saveDeptSuccess: '部門を保存しました！',
        noDepartments: '部門がまだありません',
        date: '日付',
        time: '時刻',
        type: 'タイプ',
        location: '場所',
        photo: '写真',
        viewPhoto: '写真を見る',
        allLeaves: 'すべて',
        pending: '保留中',
        leaveType: '休暇タイプ',
        reason: '理由',
        noLeaves: '休暇申請なし',
        companyInfo: '会社情報',
        companyName: '会社名',
        workHours: '勤務時間',
        workStart: '始業',
        workEnd: '終業',
        lateThreshold: '遅刻基準（分）',
        workShifts: '勤務シフト',
        addNewShift: '新しいシフトを追加',
        shiftKey: 'Key（英語）',
        shiftLabel: '表示名',
        startTime: '開始',
        endTime: '終了',
        lateMinutes: '遅刻（分）',
        overnightShift: '夜勤シフト',
        addShift: 'シフト追加',
        leaveTypes: '休暇タイプ',
        addNewLeaveType: '新しい休暇タイプを追加',
        leaveKey: 'Key（英語）',
        leaveLabel: '表示名',
        quotaPerYear: '年間日数',
        paidLeave: '有給休暇',
        finance: '財務',
        lateDeduction: '遅刻控除（/回）',
        otMultiplier: 'OT倍率',
        socialSecurityRate: '社会保険（%）',
        socialSecurityMax: '社会保険上限',
        saveSettings: '設定を保存',
        savingSettings: '保存中...',
        submitLeave: '休暇申請',
        startDate: '開始日',
        endDate: '終了日',
        totalDays: '合計日数',
        submitRequest: '申請する',
        submitting: '送信中...',
        leaveHistory: '休暇履歴',
        newRequest: '新規申請',
        approved: '承認済み',
        rejected: '却下',
        darkMode: 'ダークモード',
        lightMode: 'ライトモード',
        notifications: '通知',
        readAll: 'すべて既読',
        noNotifications: '通知なし',
        myDashboard: '勤怠/休暇',
        name: '氏名',
        idHeader: 'ID',
        roleHeader: '役割',
        deptHeader: '部門',
        shiftHeader: 'シフト',
        salaryHeader: '給与',
        statusHeader: 'ステータス',
        manageHeader: '管理',
        fullDay: '全日',
        halfDay: '半日休暇',
        hourly: '時間単位',
        morning: '午前 (AM)',
        afternoon: '午後 (PM)',
        reasonPlaceholder: '理由を入力してください...',
        attachmentHint: '添付書類',
        attachments: '診断書、写真、書類 - 最大 5MB',
        clickToUpload: 'クリックしてアップロード',
        days: '日',
        remaining: '残り',
        cancelRequest: 'キャンセル',
        cancelled: 'キャンセル済み',
        pendingManager: '上司承認待ち',
        pendingHR: 'HR承認待ち',
        viewAttachment: '添付を表示',
        usedQuota: '使用済みクォータ',
        remainingAfter: '申請後の残り',
        quotaExceeded: 'クォータ超過！',
        outOfQuota: 'が不足しています',
        used: '使用済み',
        leaveDate: '休暇日',
        am: '午前 (AM)',
        pm: '午後 (PM)',
        employee: '従業員',
        fileSizeError: 'ファイルが大きすぎます (最大5MB)。より小さなファイルを選択してください。',
        newLeaveRequestTitle: '新しい休暇申請',
        submitted: 'を申請しました',
        to: 'から',
        waitingForYourApproval: 'あなたの承認待ちです',
        waitingForHR: 'HR/管理者の承認待ち',
        attachmentBadge: '添付あり',
        check_in: '出勤',
        check_out: '退勤',
        site_in: '現場到着',
        site_out: '現場出発',
        sick: '病欠',
        personal: '慶弔・特別休暇',
        unpaid_personal: '無給休暇',
        annual: '有給休暇',
        ordination: '出家休暇',
        maternity: '産前産後休暇',
        military: '兵役休暇',
        marriage: '結婚休暇',
        funeral_parents: '忌引（父母）',
        funeral_relatives: '忌引（親族）',
        holiday_swap: '休日振替',
        sterilization: '避妊手術休暇',
        distance: '距離',
        site: '現場',
        companyCalendar: '会社カレンダー',
        comingSoon: '近日公開予定',
        requestLeave: '休暇申請',
        loadingData: 'データを読み込み中...',
        pleaseWaitPreparingData: '少々お待ちください。データを準備しています',
        minLength6: '6文字以上',
        mustAtLeast6: '6文字以上入力してください',
        typeAgain: 'もう一度入力してください',
        attendanceSuccess: '打刻が完了しました！',
        attendanceFailed: '打刻中にエラーが発生しました:',
        changePasswordSuccessAlert: 'パスワードが正常に変更されました！',
        errorUpdatingPassword: 'パスワード変更中にエラーが発生しました:',
        attendanceHistory: '打刻履歴',
        noHistoryFound: '履歴が見つかりません。',
        latitude: '緯度',
        longitude: '経度',
        distPrevPoint: '前の地点からの距離 (km)',
        summary: '合計',
        records: '件',
        downloaded: 'ダウンロード完了',
        jan: '1月', feb: '2月', mar: '3月', apr: '4月', may: '5月', jun: '6月',
        jul: '7月', aug: '8月', sep: '9月', oct: '10月', nov: '11月', dec: '12月',
        month: '月',
        loadData: 'データを読み込む',
        workingDaysTotal: '勤務日数 (合計)',
        lateDaysTotal: '遅刻日数 (合計)',
        leaveDaysTotal: '休暇日数 (合計)',
        absentDaysTotal: '欠勤日数 (合計)',
        workingDays: '勤務日数',
        presentDays: '出勤',
        lateDays: '遅刻',
        leaveDays: '休暇',
        absentDays: '欠勤',
        attendanceRate: '出勤率',
        absent: '欠勤',
        selectEmployeeAndTime: '社員と時間を選択してください',
        deleteConfirm: 'この記録を削除しますか？この操作は取り消せません',
        dateHeader: '日付',
        timeHeader: '時間',
        employeeCodeHeader: '社員コード',
        fullNameHeader: '氏名',
        forgotCheckOut: '退勤忘れ',
        clickToAddCheckOut: 'クリックして退勤を追加',
        everyone: '全員',
        addRecord: '記録追加',
        noDataToday: '本日のデータはありません',
        addAttendanceRecord: '勤怠記録の追加',
        dateTime: '日時',
        select: '選択',
        fullname: '氏名',
        avgOnTime: '平均オンタイム',
        lateTotal: '遅刻総数',
        absentTotal: '欠勤総数',
        topLate: '遅刻 Top 5',
        topOnTime: 'オンタイム Top 5',
        minutes: '分',
        hours: '時間',
        avgWorkHoursShort: '平均時間',
        onTime: '定時',
        onTimePercent: '定時率 %',
        publicHoliday: '祝日',
        allHolidays: '年間祝日一覧',
    },
};

export default translations;
