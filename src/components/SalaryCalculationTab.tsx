import React, { useState } from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  Printer, 
  ShieldCheck, 
  Clock, 
  Check, 
  Copy, 
  Send
} from 'lucide-react';
import { AttendanceRecord, Employee, PaymentTransaction } from '../types';
import { calculateMonthlySalary, formatINR } from '../utils/salaryCalculator';

interface SalaryCalculationTabProps {
  employee: Employee;
  yearMonth: string;
  attendanceRecords: AttendanceRecord[];
  transactions: PaymentTransaction[];
  onMarkAsPaid: (payoutTx: PaymentTransaction) => void;
  onOpenWhatsAppShare: () => void;
}

export const SalaryCalculationTab: React.FC<SalaryCalculationTabProps> = ({
  employee,
  yearMonth,
  attendanceRecords,
  transactions,
  onMarkAsPaid,
  onOpenWhatsAppShare,
}) => {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMode, setPayoutMode] = useState<'cash' | 'upi' | 'bank_transfer'>('cash');
  const [payoutNote, setPayoutNote] = useState('');
  const [copiedSlip, setCopiedSlip] = useState(false);

  const report = calculateMonthlySalary(employee, yearMonth, attendanceRecords, transactions);

  const [y, m] = yearMonth.split('-').map(Number);
  const monthNameEn = new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const handleConfirmPayout = () => {
    const newTx: PaymentTransaction = {
      id: `payout_${Date.now()}`,
      employeeId: employee.id,
      date: new Date().toISOString().split('T')[0],
      type: 'payout',
      amount: report.netPayableSalary,
      paymentMode: payoutMode,
      reason: `Final salary payout for ${monthNameEn} (${payoutNote || 'Full settlement'})`,
      createdAt: new Date().toISOString(),
    };
    onMarkAsPaid(newTx);
    setShowPayoutModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const copyQuickSummary = () => {
    const text = `📋 Salary Slip - ${monthNameEn}\n👤 Employee: ${employee.name}\n💰 Base Salary: ${formatINR(report.baseSalary)}\n⏰ Shift: 09:30 AM - 05:30 PM\n\n📅 Attendance Breakdown:\n- Present: ${report.presentDays} days\n- Sunday Off (Paid): ${report.sundaysCount} days (₹0 cut)\n- Employer Off (Paid): ${report.employerOffCount} days (₹0 cut)\n- Employee Self Leave: ${report.selfLeaveCount} days (-${formatINR(report.selfLeaveCount * report.dailyRate)})\n- Half Day: ${report.halfDaysCount} days (-${formatINR(report.halfDaysCount * report.halfDayRate)})\n- Timing Shortfall (Late/Early): ${report.totalShortfallMinutes} mins (-${formatINR(report.timeShortfallDeduction)})\n\n💵 Payroll Calculation:\n- Leave Deduction: -${formatINR(report.leaveDeduction)}\n- Timing Shortfall Deduction: -${formatINR(report.timeShortfallDeduction)}\n- Advance Taken: -${formatINR(report.totalAdvanceTaken)}\n- Bonus Earned: +${formatINR(report.totalBonusEarned)}\n--------------------\n👉 Net In-Hand Salary: ${formatINR(report.netPayableSalary)}\nStatus: ${report.isPaid ? 'PAID ✅' : 'Payment Pending'}`;

    navigator.clipboard.writeText(text);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Auto-calculation notification */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5" /> 100% Automated Salary Calculation
              </span>
              {report.isPaid && (
                <span className="bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PAID (Payment Settled)
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {monthNameEn} Net In-Hand Salary
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Automated salary calculated from attendance, paid Sundays, employer holidays (₹0 cut), self leaves (unpaid), exact minute timings, advance deductions, and bonuses.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl shrink-0 text-left md:text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Net Payable Salary
            </div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1">
              {formatINR(report.netPayableSalary)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {report.isPaid ? `Settled on ${report.paidDate || 'recently'}` : 'Ready for disbursement'}
            </div>
          </div>
        </div>

        {/* Quick Action buttons */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenWhatsAppShare}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send on WhatsApp</span>
            </button>

            <button
              onClick={copyQuickSummary}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              {copiedSlip ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSlip ? 'Copied!' : 'Copy Slip'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>

          {!report.isPaid ? (
            <button
              onClick={() => setShowPayoutModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Salary as Paid</span>
            </button>
          ) : (
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>This month is paid in full</span>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown: Detailed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Step-by-Step Mathematical Transparency */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Detailed Calculation Breakdown (Formula Steps)</span>
              <span className="text-xs font-normal text-slate-500">
                Month: {report.totalDaysInMonth} Days (Rate: {formatINR(report.dailyRate)}/day)
              </span>
            </h3>

            {/* Step 1: Base Salary */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-900">1. Agreed Base Monthly Salary</div>
                <div className="text-[11px] text-slate-500">
                  Fixed Shift: 09:30 AM to 05:30 PM (includes Sunday paid offs)
                </div>
              </div>
              <span className="text-base font-extrabold text-slate-900">
                {formatINR(report.baseSalary)}
              </span>
            </div>

            {/* Step 2: Paid leaves reassurance (Zero cut) */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    2. Paid Offs (Sundays & Employer Holidays - ₹0 Cut)
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    Sundays: <strong>{report.sundaysCount} days</strong> | Employer Closures: <strong>{report.employerOffCount} days</strong>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                  ₹0 Cut (No Deduction)
                </span>
              </div>
              <p className="text-[11px] text-emerald-900/80 italic border-t border-emerald-200/60 pt-1.5">
                • Rule active: When store/office is closed by employer or on Sundays, full daily salary is paid with zero deduction.
              </p>
            </div>

            {/* Step 3: Self Leave deduction */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
              <div>
                <div className="text-xs font-bold text-rose-950">
                  3. Employee Self Leave (Unpaid Absence Deduction)
                </div>
                <div className="text-[11px] text-rose-800">
                  Self leaves taken: <strong>{report.selfLeaveCount} days</strong> ({formatINR(report.dailyRate)}/day)
                  {report.halfDaysCount > 0 && ` + Half days: ${report.halfDaysCount} days`}
                </div>
              </div>
              <span className="text-base font-extrabold text-rose-700">
                -{formatINR(report.leaveDeduction)}
              </span>
            </div>

            {/* Step 4: Timing Shortfall deduction (Late arrival & Early exit) */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/80 border border-amber-300">
              <div>
                <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>4. Exact Minute Timing Deduction (Late Arrival & Early Exit)</span>
                </div>
                <div className="text-[11px] text-amber-900 mt-0.5">
                  • Arrival after 9:30 AM: <strong>{report.totalLateMinutes} mins</strong> ({report.lateDaysCount} days)<br />
                  • Departure before 5:30 PM: <strong>{report.totalEarlyMinutes} mins</strong> ({report.earlyExitDaysCount} days)<br />
                  (Rate: ~{formatINR(report.hourlyRate)}/hr • Staying past 5:30 PM incurs ₹0 deduction)
                </div>
              </div>
              <span className="text-base font-extrabold text-amber-900">
                {report.timeShortfallDeduction > 0 ? `-${formatINR(report.timeShortfallDeduction)}` : '₹0 (Full shift completed ✅)'}
              </span>
            </div>

            {/* Step 5: Advance Deduction */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  5. Advance Payments Taken (Deduction)
                </div>
                <div className="text-[11px] text-slate-600">
                  Cash or online advance funds drawn prior to payroll
                </div>
              </div>
              <span className="text-base font-extrabold text-slate-800">
                {report.totalAdvanceTaken > 0 ? `-${formatINR(report.totalAdvanceTaken)}` : '₹0'}
              </span>
            </div>

            {/* Step 6: Bonus Added */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-teal-50/70 border border-teal-200">
              <div>
                <div className="text-xs font-bold text-teal-950">
                  6. Bonuses & Performance Incentives (Added)
                </div>
                <div className="text-[11px] text-teal-800">
                  Festival bonus, extra rewards, or performance incentives
                </div>
              </div>
              <span className="text-base font-extrabold text-teal-700">
                {report.totalBonusEarned > 0 ? `+${formatINR(report.totalBonusEarned)}` : '₹0'}
              </span>
            </div>

            {/* Total Math summary bar */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Final In-Hand Payable Amount</div>
                <div className="text-xs text-slate-300 font-mono">
                  {formatINR(report.baseSalary)} - {formatINR(report.leaveDeduction)} - {formatINR(report.timeShortfallDeduction)} - {formatINR(report.totalAdvanceTaken)} + {formatINR(report.totalBonusEarned)}
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-400">
                = {formatINR(report.netPayableSalary)}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Printable Realistic Salary Slip */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-4 print:border-none print:shadow-none">
            <div className="text-center pb-3 border-b-2 border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Pay Slip / Salary Statement
              </span>
              <h4 className="text-base font-black text-slate-900 mt-0.5">
                {employee.name}
              </h4>
              <p className="text-xs text-slate-600">{employee.role}</p>
              <div className="inline-block mt-1 bg-slate-100 text-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded">
                Month: {monthNameEn} ({yearMonth})
              </div>
            </div>

            {/* Slip metadata */}
            <div className="text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-semibold text-slate-900">{employee.phone || '9876543210'}</span>
              </div>
              <div className="flex justify-between">
                <span>Shift Hours:</span>
                <span className="font-semibold text-slate-900">09:30 AM – 05:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Rate:</span>
                <span className="font-semibold text-slate-900">{formatINR(report.dailyRate)} / day</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Days:</span>
                <span className="font-bold text-emerald-700">{report.paidDaysCount} Days Payable</span>
              </div>
            </div>

            {/* Line items table */}
            <div className="border-t border-b border-slate-200 py-2 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-800">
                <span>Base Salary</span>
                <span className="font-bold">{formatINR(report.baseSalary)}</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>Leave Deduction ({report.selfLeaveCount} days)</span>
                <span className="font-bold">-{formatINR(report.leaveDeduction)}</span>
              </div>
              {report.timeShortfallDeduction > 0 && (
                <div className="flex justify-between text-amber-800">
                  <span>Timing Shortfall ({report.totalShortfallMinutes} mins)</span>
                  <span className="font-bold">-{formatINR(report.timeShortfallDeduction)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700">
                <span>Advance Deducted</span>
                <span className="font-bold">-{formatINR(report.totalAdvanceTaken)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Bonus Added</span>
                <span className="font-bold">+{formatINR(report.totalBonusEarned)}</span>
              </div>
            </div>

            {/* Net Amount Highlight */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-center">
              <div className="text-[11px] font-bold text-emerald-900 uppercase">
                Net Payable Salary
              </div>
              <div className="text-2xl font-black text-emerald-950 mt-0.5">
                {formatINR(report.netPayableSalary)}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                {report.isPaid ? 'PAID IN FULL ✅' : 'PAYMENT DUE'}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center leading-tight">
              Computer-generated pay slip • No signature required • Staff Attendance & Payroll
            </div>
          </div>
        </div>
      </div>

      {/* Mark As Paid Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Confirm Salary Payout
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Settle Salary for {monthNameEn}
                </h3>
              </div>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <span className="text-xs text-emerald-800 font-medium">Total Payable Amount:</span>
              <div className="text-3xl font-black text-emerald-950 mt-1">
                {formatINR(report.netPayableSalary)}
              </div>
              <span className="text-xs text-slate-500">Employee: {employee.name}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Payment Mode:
                </label>
                <select
                  value={payoutMode}
                  onChange={(e) => setPayoutMode(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Receipt Note / Reference (Optional):
                </label>
                <input
                  type="text"
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  placeholder="e.g. Handed cash in person, UPI UTR..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayout}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                Confirm Payment Recorded
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
