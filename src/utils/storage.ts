import { AttendanceRecord, Employee, PaymentTransaction, WorkTaskLog } from '../types';

const STORAGE_KEYS = {
  EMPLOYEES: 'karmachari_employees_v4',
  SELECTED_EMP_ID: 'karmachari_selected_emp_id_v4',
  ATTENDANCE: 'karmachari_attendance_v4',
  TRANSACTIONS: 'karmachari_transactions_v4',
  WORK_LOGS: 'karmachari_work_logs_v4',
};

const DEFAULT_EMPLOYEE: Employee = {
  id: 'emp_01',
  name: 'Suman Verma (Staff)',
  phone: '9876543210',
  role: 'Store / Office Assistant',
  baseSalary: 8000,
  startTime: '09:30',
  endTime: '17:30',
  joinDate: '2026-01-01',
  notes: 'Shift: 09:30 AM to 05:30 PM | Sunday Off',
  calcBasis: 'calendar_days',
};

// Seed realistic data for Nov 2026 with exact minute-by-minute examples
const DEFAULT_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att_1',
    employeeId: 'emp_01',
    date: '2026-11-01',
    status: 'SUN',
    note: 'Weekly Sunday Off (Paid - No Deduction)',
    updatedAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'att_2',
    employeeId: 'emp_01',
    date: '2026-11-02',
    status: 'P',
    punchIn: '09:27 AM',
    punchOut: '05:42 PM',
    lateMinutes: 0,
    earlyDepartureMinutes: 0,
    timeDeduction: 0,
    note: 'Arrived at 9:27 AM (3m early) + Left at 5:42 PM (12m extra stay) - No Deduction ✅',
    updatedAt: '2026-11-02T17:45:00Z',
  },
  {
    id: 'att_3',
    employeeId: 'emp_01',
    date: '2026-11-03',
    status: 'EMPLOYER_OFF',
    note: 'Employer Holiday (Store closed by owner) - Paid Holiday ✅',
    updatedAt: '2026-11-03T09:00:00Z',
  },
  {
    id: 'att_4',
    employeeId: 'emp_01',
    date: '2026-11-04',
    status: 'SELF_LEAVE',
    note: 'Employee Unpaid Leave (Sick leave taken) - 1 Day Salary Cut ❌',
    updatedAt: '2026-11-04T09:30:00Z',
  },
  {
    id: 'att_5',
    employeeId: 'emp_01',
    date: '2026-11-05',
    status: 'P',
    punchIn: '09:35 AM',
    punchOut: '05:18 PM',
    lateMinutes: 5,
    earlyDepartureMinutes: 12,
    timeDeduction: 9.44,
    note: 'Arrived at 9:35 AM (5m late) + Left at 5:18 PM (12m early) - Total 17m Shortfall (-₹9.44) ❌',
    updatedAt: '2026-11-05T17:20:00Z',
  },
];

const DEFAULT_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx_1',
    employeeId: 'emp_01',
    date: '2026-11-02',
    type: 'advance',
    amount: 1500,
    paymentMode: 'cash',
    reason: 'Household & medicine cash advance',
    createdAt: '2026-11-02T11:00:00Z',
  },
  {
    id: 'tx_2',
    employeeId: 'emp_01',
    date: '2026-11-03',
    type: 'bonus',
    amount: 500,
    paymentMode: 'upi',
    reason: 'Performance & festive bonus reward',
    createdAt: '2026-11-03T18:00:00Z',
  },
];

const DEFAULT_WORK_LOGS: WorkTaskLog[] = [
  {
    id: 'wlog_1',
    employeeId: 'emp_01',
    date: '2026-11-05',
    timeSlot: '09:30 AM - 11:30 AM',
    taskDescription: 'Opened store shutter, swept and cleaned counters. Unpacked new shipments and arranged shelf display.',
    status: 'completed',
    category: 'cleaning_setup',
    submittedAt: '2026-11-05T11:32:00',
    verifiedByEmployer: true,
    employerNote: 'Great job, opening setup completed on time.',
  },
  {
    id: 'wlog_2',
    employeeId: 'emp_01',
    date: '2026-11-05',
    timeSlot: '11:30 AM - 01:30 PM',
    taskDescription: 'Attended to 6 walk-in customers, packed 4 online courier orders with shipping slips.',
    status: 'completed',
    category: 'customer_sales',
    submittedAt: '2026-11-05T13:30:00',
    verifiedByEmployer: true,
  },
  {
    id: 'wlog_3',
    employeeId: 'emp_01',
    date: '2026-11-05',
    timeSlot: '01:30 PM - 02:30 PM',
    taskDescription: 'Lunch break and personal rest.',
    status: 'completed',
    category: 'other',
    submittedAt: '2026-11-05T14:30:00',
    verifiedByEmployer: true,
  },
  {
    id: 'wlog_4',
    employeeId: 'emp_01',
    date: '2026-11-05',
    timeSlot: '02:30 PM - 04:00 PM',
    taskDescription: 'Audited warehouse cartons, drafted low-stock list for restock ordering.',
    status: 'completed',
    category: 'inventory_packing',
    submittedAt: '2026-11-05T16:05:00',
    verifiedByEmployer: false,
  },
  {
    id: 'wlog_5',
    employeeId: 'emp_01',
    date: '2026-11-05',
    timeSlot: '04:00 PM - 05:30 PM',
    taskDescription: 'Attended evening customers, reconciled daily cash register, and prepped next day dispatch list.',
    status: 'in_progress',
    category: 'billing',
    submittedAt: '2026-11-05T16:10:00',
    verifiedByEmployer: false,
  },
];

export function getStoredEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify([DEFAULT_EMPLOYEE]));
      return [DEFAULT_EMPLOYEE];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_EMPLOYEE];
  } catch {
    return [DEFAULT_EMPLOYEE];
  }
}

export function saveStoredEmployees(employees: Employee[]): void {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
}

export function getSelectedEmployeeId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SELECTED_EMP_ID);
    return raw || DEFAULT_EMPLOYEE.id;
  } catch {
    return DEFAULT_EMPLOYEE.id;
  }
}

export function setSelectedEmployeeId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.SELECTED_EMP_ID, id);
}

export function getStoredAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(DEFAULT_ATTENDANCE));
      return DEFAULT_ATTENDANCE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ATTENDANCE;
  }
}

export function saveStoredAttendance(records: AttendanceRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
}

export function getStoredTransactions(): PaymentTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
      return DEFAULT_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TRANSACTIONS;
  }
}

export function saveStoredTransactions(transactions: PaymentTransaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function getStoredWorkLogs(): WorkTaskLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORK_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WORK_LOGS, JSON.stringify(DEFAULT_WORK_LOGS));
      return DEFAULT_WORK_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WORK_LOGS;
  }
}

export function saveStoredWorkLogs(logs: WorkTaskLog[]): void {
  localStorage.setItem(STORAGE_KEYS.WORK_LOGS, JSON.stringify(logs));
}
