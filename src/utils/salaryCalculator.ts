import { AttendanceRecord, Employee, MonthlySalaryReport, PaymentTransaction } from '../types';

/**
 * Get total days in a given YYYY-MM
 */
export function getDaysInMonth(yearMonth: string): number {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12
  return new Date(year, month, 0).getDate();
}

/**
 * Get all dates (YYYY-MM-DD) for a given month
 */
export function getDatesForMonth(yearMonth: string): string[] {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const totalDays = new Date(year, month, 0).getDate();
  const dates: string[] = [];

  for (let day = 1; day <= totalDays; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    dates.push(`${yearStr}-${monthStr}-${dayStr}`);
  }
  return dates;
}

/**
 * Check if a date string YYYY-MM-DD is Sunday
 */
export function isSunday(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getDay() === 0;
}

/**
 * Parse time string like "09:30", "9:30 AM", "05:30 PM", "17:30" to minutes from midnight (0-1439)
 */
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const trimmed = timeStr.trim();
  if (!trimmed) return null;

  // Match formats: "09:30", "9:30 AM", "05:30 PM", "17:30"
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const meridiem = ampmMatch[3]?.toUpperCase();

    if (meridiem === 'PM' && hours < 12) {
      hours += 12;
    } else if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Convert minutes from midnight to readable 12-hour format e.g. 570 -> "09:30 AM"
 */
export function formatMinutesToTime(totalMins: number): string {
  const normalized = Math.max(0, Math.min(1439, totalMins));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Convert any time string (e.g. "09:27 AM", "9:35", "17:18") to 24-hour "HH:MM" for <input type="time">
 */
export function timeTo24h(timeStr?: string): string {
  if (!timeStr) return '';
  const totalMins = parseTimeToMinutes(timeStr);
  if (totalMins === null) return '';
  const hours = Math.floor(totalMins / 60);
  const minutes = totalMins % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Convert 24-hour "HH:MM" to 12-hour "hh:mm AM/PM"
 */
export function timeTo12h(timeStr?: string): string {
  if (!timeStr) return '';
  const totalMins = parseTimeToMinutes(timeStr);
  if (totalMins === null) return timeStr;
  return formatMinutesToTime(totalMins);
}

/**
 * Calculate day timing differences according to exact user rules:
 * - Expected shift: e.g. 9:30 AM to 5:30 PM
 * - Arrival:
 *   - If <= 9:30 AM (e.g. 9:15 AM): lateMinutes = 0 ("9:15 aayi to koi cutting ni")
 *   - If > 9:30 AM (e.g. 10:00 AM): lateMinutes = 30 ("agr 10 bje aayi to slry cut honi chahiye")
 * - Departure:
 *   - If < 5:30 PM (e.g. 5:00 PM): earlyMinutes = 30 ("phle jaa rhi h to b cut ho jaye")
 *   - If >= 5:30 PM (e.g. 5:30 PM or 6:00 PM): earlyMinutes = 0 ("agr late jaye to cut na ho..")
 */
export function calculateDayTimingDiff(
  punchInStr?: string,
  punchOutStr?: string,
  expectedStartStr: string = '09:30',
  expectedEndStr: string = '17:30'
) {
  const inMins = parseTimeToMinutes(punchInStr);
  const outMins = parseTimeToMinutes(punchOutStr);

  const startMins = parseTimeToMinutes(expectedStartStr) ?? (9 * 60 + 30); // 570 (09:30)
  const endMins = parseTimeToMinutes(expectedEndStr) ?? (17 * 60 + 30);    // 1050 (17:30)

  let lateMinutes = 0;
  let earlyMinutes = 0;
  let extraStayMinutes = 0;

  if (inMins !== null) {
    if (inMins > startMins) {
      // Arrived late
      lateMinutes = inMins - startMins;
    }
  }

  if (outMins !== null) {
    if (outMins < endMins) {
      // Left early
      earlyMinutes = endMins - outMins;
    } else if (outMins > endMins) {
      // Stayed extra / left late -> No cut!
      extraStayMinutes = outMins - endMins;
    }
  }

  const totalShortfallMinutes = lateMinutes + earlyMinutes;

  return {
    inMins,
    outMins,
    startMins,
    endMins,
    lateMinutes,
    earlyMinutes,
    extraStayMinutes,
    totalShortfallMinutes,
    isLate: lateMinutes > 0,
    isEarlyDeparture: earlyMinutes > 0,
    isStayedExtra: extraStayMinutes > 0,
  };
}

/**
 * Calculate the exact monthly salary breakdown according to user rules:
 * 1. Base Salary = ₹8,000 (or employee.baseSalary)
 * 2. Sunday = Paid (No deduction)
 * 3. Employer Leave (Malik ki chutti) = Paid (No deduction)
 * 4. Employee Self Leave (Khud ki chutti) = Deducted
 * 5. Half day = 50% deducted
 * 6. TIMING SHORTFALL:
 *    - Late arrival (after 9:30 AM) = Deducted proportionately
 *    - Early departure (before 5:30 PM) = Deducted proportionately
 *    - Overtime / Late departure (after 5:30 PM) = NO DEDUCTION!
 * 7. Advance = Deducted from net
 * 8. Bonus = Added to net
 */
export function calculateMonthlySalary(
  employee: Employee,
  yearMonth: string, // "2026-11"
  attendanceRecords: AttendanceRecord[],
  transactions: PaymentTransaction[]
): MonthlySalaryReport {
  const totalDaysInMonth = getDaysInMonth(yearMonth);
  const monthDates = getDatesForMonth(yearMonth);

  // Determine calculation divisor
  let divisor = totalDaysInMonth;
  if (employee.calcBasis === 'fixed_30') {
    divisor = 30;
  } else if (employee.calcBasis === 'working_days_26') {
    divisor = 26;
  }

  const dailyRate = Math.round((employee.baseSalary / divisor) * 100) / 100;
  const halfDayRate = Math.round((dailyRate / 2) * 100) / 100;

  // 8-hour shift = 480 minutes
  const hourlyRate = Math.round((dailyRate / 8) * 100) / 100;
  const minuteRate = dailyRate / 480;

  // Filter attendance for this employee & month
  const empAttendance = attendanceRecords.filter(
    (a) => a.employeeId === employee.id && a.date.startsWith(yearMonth)
  );
  const attendanceMap = new Map(empAttendance.map((a) => [a.date, a]));

  let presentDays = 0;
  let sundaysCount = 0;
  let employerOffCount = 0;
  let selfLeaveCount = 0;
  let halfDaysCount = 0;
  let unmarkedCount = 0;

  let totalLateMinutes = 0;
  let totalEarlyMinutes = 0;
  let lateDaysCount = 0;
  let earlyExitDaysCount = 0;

  for (const dateStr of monthDates) {
    const isSun = isSunday(dateStr);
    const record = attendanceMap.get(dateStr);
    const markedStatus = record?.status;

    if (markedStatus === 'P') {
      presentDays++;
      // Check timing shortfall for present days
      if (record?.punchIn || record?.punchOut) {
        const diff = calculateDayTimingDiff(
          record.punchIn,
          record.punchOut,
          employee.startTime || '09:30',
          employee.endTime || '17:30'
        );
        if (diff.lateMinutes > 0) {
          lateDaysCount++;
          totalLateMinutes += diff.lateMinutes;
        }
        if (diff.earlyMinutes > 0) {
          earlyExitDaysCount++;
          totalEarlyMinutes += diff.earlyMinutes;
        }
      }
    } else if (markedStatus === 'HD') {
      halfDaysCount++;
    } else if (markedStatus === 'EMPLOYER_OFF') {
      employerOffCount++;
    } else if (markedStatus === 'SELF_LEAVE') {
      selfLeaveCount++;
    } else if (markedStatus === 'SUN') {
      sundaysCount++;
    } else {
      // Not explicitly marked
      if (isSun) {
        // By default, Sundays are Sunday Off
        sundaysCount++;
      } else {
        unmarkedCount++;
      }
    }
  }

  // Deductions:
  // 1. Leave Deduction (Self Leaves + Half Days)
  const leaveDeduction = Math.round(
    (selfLeaveCount * dailyRate) + (halfDaysCount * halfDayRate)
  );

  // 2. Timing Shortfall Deduction (Late arrival + Early departure minutes)
  const totalShortfallMinutes = totalLateMinutes + totalEarlyMinutes;
  const timeShortfallDeduction = Math.round(totalShortfallMinutes * minuteRate);

  // Transactions for this month & employee
  const empTx = transactions.filter(
    (t) => t.employeeId === employee.id && t.date.startsWith(yearMonth)
  );

  const totalAdvanceTaken = empTx
    .filter((t) => t.type === 'advance')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBonusEarned = empTx
    .filter((t) => t.type === 'bonus')
    .reduce((sum, t) => sum + t.amount, 0);

  const otherDeductions = empTx
    .filter((t) => t.type === 'deduction_penalty')
    .reduce((sum, t) => sum + t.amount, 0);

  const isPaid = empTx.some((t) => t.type === 'payout');
  const payoutRecord = empTx.find((t) => t.type === 'payout');

  // Net payable = Base - Leave Cut - Timing Shortfall Cut + Bonus - Advance - Other Deductions
  const netPayableSalary = Math.max(
    0,
    Math.round(
      employee.baseSalary -
      leaveDeduction -
      timeShortfallDeduction +
      totalBonusEarned -
      totalAdvanceTaken -
      otherDeductions
    )
  );

  const paidDaysCount = presentDays + sundaysCount + employerOffCount + (halfDaysCount * 0.5);

  return {
    month: yearMonth,
    employee,
    totalDaysInMonth,
    dailyRate,
    halfDayRate,
    hourlyRate,
    minuteRate,
    presentDays,
    sundaysCount,
    employerOffCount,
    selfLeaveCount,
    halfDaysCount,
    unmarkedCount,
    lateDaysCount,
    totalLateMinutes,
    earlyExitDaysCount,
    totalEarlyMinutes,
    totalShortfallMinutes,
    timeShortfallDeduction,
    paidDaysCount,
    baseSalary: employee.baseSalary,
    leaveDeduction,
    totalAdvanceTaken,
    totalBonusEarned,
    otherDeductions,
    netPayableSalary,
    isPaid,
    paidDate: payoutRecord?.date,
  };
}

export function formatINR(amount: number, forceDecimals?: boolean): string {
  const hasPaise = amount % 1 !== 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: forceDecimals || (hasPaise && Math.abs(amount) < 1000) ? 2 : 0,
    maximumFractionDigits: forceDecimals || hasPaise ? 2 : 0,
  }).format(amount);
}
