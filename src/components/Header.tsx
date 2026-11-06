import React from 'react';
import { 
  CalendarDays, 
  WalletCards, 
  Calculator, 
  ClipboardList, 
  Settings, 
  Clock, 
  Users, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Employee } from '../types';
import { formatINR } from '../utils/salaryCalculator';

interface HeaderProps {
  currentTab: 'attendance' | 'advance_bonus' | 'salary' | 'work_log';
  setCurrentTab: (tab: 'attendance' | 'advance_bonus' | 'salary' | 'work_log') => void;
  employee: Employee;
  employees: Employee[];
  onSelectEmployee: (id: string) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  employee,
  employees,
  onSelectEmployee,
  onOpenSettings,
}) => {
  // Check if current time is within shift 9:30 AM to 5:30 PM
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const shiftStartMinutes = 9 * 60 + 30; // 09:30
  const shiftEndMinutes = 17 * 60 + 30;  // 17:30
  const isShiftActive = currentMinutes >= shiftStartMinutes && currentMinutes <= shiftEndMinutes;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top micro rule reassurance bar */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-xs py-1.5 px-4 text-emerald-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Active Rules:</span>
            <span className="bg-emerald-900/60 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-400/30">
              Sunday = Paid Off
            </span>
            <span className="bg-emerald-900/60 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-400/30">
              Employer Holiday = Paid Off
            </span>
            <span className="bg-rose-900/60 px-2 py-0.5 rounded text-[11px] font-semibold border border-rose-400/30 text-rose-200">
              Self Leave = Salary Cut
            </span>
            <span className="bg-amber-900/60 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-400/30 text-amber-200">
              Late (9:30+) / Early Exit = Minute Cut
            </span>
            <span className="bg-emerald-900/60 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-400/30 text-emerald-200">
              Staying Late = No Deduction
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span>Shift: <strong className="text-white">9:30 AM – 5:30 PM</strong></span>
            {isShiftActive ? (
              <span className="bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px] animate-pulse">
                • Shift Active
              </span>
            ) : (
              <span className="text-emerald-200 text-[10px]">
                (Off Duty)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Employee quick info */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl">
                S
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    Staff Attendance & Payroll
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ₹8,000 / Month
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400">
                  Exact Minute Punch, Advance/Bonus Ledger, Auto Salary Slip & 9:30-5:30 Work Log
                </p>
              </div>
            </div>

            {/* Mobile Settings Button */}
            <div className="sm:hidden">
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Employee Selector & Settings */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl p-1.5 pl-3">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex flex-col pr-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Employee</span>
                <select
                  value={employee.id}
                  onChange={(e) => onSelectEmployee(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">
                      {emp.name} ({formatINR(emp.baseSalary)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="h-7 w-px bg-slate-700" />

              <div className="px-2 text-right">
                <div className="text-[10px] text-slate-400">Base Salary</div>
                <div className="text-xs font-bold text-emerald-400">{formatINR(employee.baseSalary)}</div>
              </div>
            </div>

            <button
              onClick={onOpenSettings}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>Settings & Rules</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="mt-4 flex overflow-x-auto no-scrollbar gap-2 pb-1 border-t border-slate-800/80 pt-3">
          <button
            onClick={() => setCurrentTab('attendance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              currentTab === 'attendance'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>1. Attendance & Timing</span>
          </button>

          <button
            onClick={() => setCurrentTab('advance_bonus')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              currentTab === 'advance_bonus'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <WalletCards className="w-4 h-4" />
            <span>2. Advance & Bonus</span>
          </button>

          <button
            onClick={() => setCurrentTab('salary')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              currentTab === 'salary'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>3. Auto Salary Slip & Calculation</span>
          </button>

          <button
            onClick={() => setCurrentTab('work_log')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all relative ${
              currentTab === 'work_log'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>4. Work Activity Log</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
              currentTab === 'work_log' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/20 text-amber-300'
            }`}>
              9:30-5:30
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};
