import React, { useState } from 'react';
import { Copy, Check, Send, MessageSquare } from 'lucide-react';
import { Employee, MonthlySalaryReport } from '../types';
import { formatINR } from '../utils/salaryCalculator';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  report: MonthlySalaryReport;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  employee,
  report,
}) => {
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState(employee.phone || '');

  if (!isOpen) return null;

  const [y, m] = report.month.split('-').map(Number);
  const monthNameEn = new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Generate clean, professional English WhatsApp message
  const whatsappMessage = `*📜 Monthly Salary Statement - ${monthNameEn}*
---------------------------------------
👤 *Employee:* ${employee.name}
💼 *Role:* ${employee.role}
⏰ *Shift:* 09:30 AM to 05:30 PM
💰 *Base Salary:* ${formatINR(report.baseSalary)}
---------------------------------------
*📅 Attendance & Leaves Summary:*
✅ *Present Days:* ${report.presentDays} days
🏖️ *Sunday Paid Offs:* ${report.sundaysCount} days (₹0 deduction)
🏢 *Employer Paid Offs:* ${report.employerOffCount} days (₹0 deduction)
🔴 *Employee Self Leaves:* ${report.selfLeaveCount} days (-${formatINR(report.selfLeaveCount * report.dailyRate)})
🟡 *Half Days:* ${report.halfDaysCount} days (-${formatINR(report.halfDaysCount * report.halfDayRate)})
${report.timeShortfallDeduction > 0 ? `⏰ *Timing Shortfall (Late/Early):* ${report.totalShortfallMinutes} mins (-${formatINR(report.timeShortfallDeduction)})\n` : `⏰ *Shift Timings:* Full shift completed (₹0 deduction)\n`}---------------------------------------
*💵 Payroll & Deductions Summary:*
• Base Salary: ${formatINR(report.baseSalary)}
• Leave Deduction: -${formatINR(report.leaveDeduction)}
• Timing Shortfall Deduction: -${formatINR(report.timeShortfallDeduction)}
• Advance Deducted: -${formatINR(report.totalAdvanceTaken)}
• Bonus / Incentive: +${formatINR(report.totalBonusEarned)}
---------------------------------------
*👉 Net In-Hand Salary:* *${formatINR(report.netPayableSalary)}*
*Status:* ${report.isPaid ? 'PAID IN FULL ✅' : 'PAYMENT PENDING ⏳'}
---------------------------------------
_Note: Sundays and employer closures are fully paid with zero deduction. No deduction applies for early arrival or staying late past 5:30 PM._`;

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(whatsappMessage);
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=91${cleanPhone.slice(-10)}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Send Salary Slip on WhatsApp
              </h3>
              <p className="text-xs text-slate-500">
                Send a complete, transparent salary statement to {employee.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Optional phone number */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Employee Mobile Number (10 digits):
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-2 rounded-xl border border-slate-200">
              +91
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Message Preview */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            WhatsApp Message Preview:
          </label>
          <pre className="text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto">
            {whatsappMessage}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Message'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Send on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
