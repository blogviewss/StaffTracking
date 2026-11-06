export type AttendanceStatus =
  | 'P'              // Present (पूरा दिन) - Full Pay
  | 'HD'             // Half Day (आधा दिन) - 50% Pay cut
  | 'SUN'            // Sunday (रविवार) - Paid Off, No cut
  | 'EMPLOYER_OFF'   // Owner Holiday (मालिक की छुट्टी / दुकान बंद) - Paid Off, No cut
  | 'SELF_LEAVE'     // Employee Self Leave (कर्मचारी की खुद की छुट्टी) - Salary cut!
  | 'UNMARKED';      // Not yet marked

export interface Employee {
  id: string;
  name: string;
  phone: string;
  role: string;
  baseSalary: number; // e.g. 8000
  startTime: string;  // "09:30"
  endTime: string;    // "17:30"
  joinDate: string;
  notes?: string;
  calcBasis: 'calendar_days' | 'fixed_30' | 'working_days_26';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  punchIn?: string;  // e.g. "09:30 AM" or "09:30"
  punchOut?: string; // e.g. "05:30 PM" or "17:30"
  lateMinutes?: number;
  earlyDepartureMinutes?: number;
  timeDeduction?: number;
  note?: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  type: 'advance' | 'bonus' | 'payout' | 'deduction_penalty';
  amount: number;
  paymentMode: 'cash' | 'upi' | 'bank_transfer';
  reason: string;
  referenceNo?: string;
  createdAt: string;
}

export interface WorkTaskLog {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "09:30 AM - 11:30 AM"
  taskDescription: string;
  status: 'completed' | 'in_progress' | 'pending';
  category?: 'cleaning_setup' | 'customer_sales' | 'inventory_packing' | 'billing' | 'outside_work' | 'other';
  submittedAt: string;
  verifiedByEmployer: boolean;
  employerNote?: string;
}

export interface MonthlySalaryReport {
  month: string; // YYYY-MM
  employee: Employee;
  totalDaysInMonth: number;
  dailyRate: number;
  halfDayRate: number;
  hourlyRate: number;
  minuteRate: number;
  
  presentDays: number;
  sundaysCount: number;
  employerOffCount: number;
  selfLeaveCount: number;
  halfDaysCount: number;
  unmarkedCount: number;
  
  // Timing analysis
  lateDaysCount: number;
  totalLateMinutes: number;
  earlyExitDaysCount: number;
  totalEarlyMinutes: number;
  totalShortfallMinutes: number;
  timeShortfallDeduction: number;

  paidDaysCount: number; // present + sundays + employerOff + (halfDays * 0.5)
  
  baseSalary: number;
  leaveDeduction: number;
  totalAdvanceTaken: number;
  totalBonusEarned: number;
  otherDeductions: number;
  
  netPayableSalary: number;
  isPaid: boolean;
  paidDate?: string;
}
