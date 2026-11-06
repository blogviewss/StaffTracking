import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Coffee, 
  Building2, 
  Clock, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  List, 
  Grid3X3, 
  LogIn, 
  LogOut, 
  Save, 
  Check, 
  ShieldCheck,
  HelpCircle,
  Sliders
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, Employee } from '../types';
import { 
  calculateMonthlySalary, 
  formatINR, 
  getDatesForMonth, 
  isSunday, 
  calculateDayTimingDiff,
  timeTo24h,
  timeTo12h,
  formatMinutesToTime 
} from '../utils/salaryCalculator';

interface AttendanceTabProps {
  employee: Employee;
  yearMonth: string; // "2026-11"
  setYearMonth: (ym: string) => void;
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onBulkUpdate: (records: AttendanceRecord[]) => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  employee,
  yearMonth,
  setYearMonth,
  attendanceRecords,
  onUpdateAttendance,
  onBulkUpdate,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const todayStr = new Date().toISOString().split('T')[0];

  // Selected date for custom timing editor
  const [activeDate, setActiveDate] = useState<string>(todayStr);

  // Time inputs in 24h format "HH:MM" for <input type="time">
  const [customIn24, setCustomIn24] = useState<string>('09:30');
  const [customOut24, setCustomOut24] = useState<string>('17:30');
  const [activeStatus, setActiveStatus] = useState<AttendanceStatus>('P');
  const [activeNote, setActiveNote] = useState<string>('');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Modal edit state for day click
  const [selectedDayToEdit, setSelectedDayToEdit] = useState<string | null>(null);
  const [modalIn24, setModalIn24] = useState<string>('09:30');
  const [modalOut24, setModalOut24] = useState<string>('17:30');
  const [modalNote, setModalNote] = useState<string>('');

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = yearMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newYm = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setYearMonth(newYm);
  };

  const handleNextMonth = () => {
    const [y, m] = yearMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newYm = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setYearMonth(newYm);
  };

  const monthDates = getDatesForMonth(yearMonth);
  const salaryReport = calculateMonthlySalary(employee, yearMonth, attendanceRecords, []);

  // Map of date -> attendance record
  const recordMap = new Map<string, AttendanceRecord>();
  attendanceRecords
    .filter((a) => a.employeeId === employee.id && a.date.startsWith(yearMonth))
    .forEach((a) => recordMap.set(a.date, a));

  const getRecordForDate = (dateStr: string): { status: AttendanceStatus; record?: AttendanceRecord } => {
    const existing = recordMap.get(dateStr);
    if (existing) {
      return { status: existing.status, record: existing };
    }
    if (isSunday(dateStr)) {
      return { status: 'SUN' };
    }
    return { status: 'UNMARKED' };
  };

  // Sync inputs when activeDate changes
  useEffect(() => {
    const { status, record } = getRecordForDate(activeDate);
    setActiveStatus(status === 'UNMARKED' ? 'P' : status);
    setCustomIn24(record?.punchIn ? timeTo24h(record.punchIn) : '09:30');
    setCustomOut24(record?.punchOut ? timeTo24h(record.punchOut) : '17:30');
    setActiveNote(record?.note || '');
  }, [activeDate, attendanceRecords]);

  // Current real-time HH:MM in 24h
  const getNow24h = (): string => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  // Live calculation of current inputs in Custom Timing card
  const liveDiff = calculateDayTimingDiff(
    customIn24,
    customOut24,
    employee.startTime || '09:30',
    employee.endTime || '17:30'
  );
  const liveDeduction = activeStatus === 'P'
    ? Math.round(liveDiff.totalShortfallMinutes * salaryReport.minuteRate * 100) / 100
    : 0;

  // Save timing from main custom timing card
  const handleSaveCustomTiming = (e: React.FormEvent) => {
    e.preventDefault();
    const punchIn12 = timeTo12h(customIn24);
    const punchOut12 = timeTo12h(customOut24);

    const timingDiff = calculateDayTimingDiff(
      punchIn12,
      punchOut12,
      employee.startTime || '09:30',
      employee.endTime || '17:30'
    );
    const deduction = activeStatus === 'P'
      ? Math.round(timingDiff.totalShortfallMinutes * salaryReport.minuteRate * 100) / 100
      : 0;

    const existing = recordMap.get(activeDate);
    const newRecord: AttendanceRecord = {
      id: existing ? existing.id : `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      employeeId: employee.id,
      date: activeDate,
      status: activeStatus,
      punchIn: activeStatus === 'P' || activeStatus === 'HD' ? punchIn12 : undefined,
      punchOut: activeStatus === 'P' || activeStatus === 'HD' ? punchOut12 : undefined,
      lateMinutes: timingDiff.lateMinutes,
      earlyDepartureMinutes: timingDiff.earlyMinutes,
      timeDeduction: deduction,
      note: activeNote || (timingDiff.isLate ? `${timingDiff.lateMinutes} मिनट लेट आई` : timingDiff.isEarlyDeparture ? `${timingDiff.earlyMinutes} मिनट पहले गई` : 'समय पर'),
      updatedAt: new Date().toISOString(),
    };

    onUpdateAttendance(newRecord);
    setSavedSuccessMsg(`तारीख ${activeDate} की टाइमिंग (${punchIn12} से ${punchOut12}) सफलतापूर्वक सेव हो गई!`);
    setTimeout(() => setSavedSuccessMsg(null), 3500);
  };

  // Open modal for clicked day
  const handleOpenDayModal = (dateStr: string) => {
    setSelectedDayToEdit(dateStr);
    const { status, record } = getRecordForDate(dateStr);
    setModalIn24(record?.punchIn ? timeTo24h(record.punchIn) : '09:30');
    setModalOut24(record?.punchOut ? timeTo24h(record.punchOut) : '17:30');
    setModalNote(record?.note || '');
  };

  // Save from day modal
  const handleSaveModal = (status: AttendanceStatus) => {
    if (!selectedDayToEdit) return;
    const punchIn12 = timeTo12h(modalIn24);
    const punchOut12 = timeTo12h(modalOut24);

    const timingDiff = calculateDayTimingDiff(
      punchIn12,
      punchOut12,
      employee.startTime || '09:30',
      employee.endTime || '17:30'
    );
    const deduction = status === 'P'
      ? Math.round(timingDiff.totalShortfallMinutes * salaryReport.minuteRate * 100) / 100
      : 0;

    const existing = recordMap.get(selectedDayToEdit);
    const newRecord: AttendanceRecord = {
      id: existing ? existing.id : `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      employeeId: employee.id,
      date: selectedDayToEdit,
      status,
      punchIn: status === 'P' || status === 'HD' ? punchIn12 : undefined,
      punchOut: status === 'P' || status === 'HD' ? punchOut12 : undefined,
      lateMinutes: timingDiff.lateMinutes,
      earlyDepartureMinutes: timingDiff.earlyMinutes,
      timeDeduction: deduction,
      note: modalNote,
      updatedAt: new Date().toISOString(),
    };

    onUpdateAttendance(newRecord);
    setSelectedDayToEdit(null);
  };

  // Status badge presentation
  const renderStatusBadge = (status: AttendanceStatus, size: 'sm' | 'md' = 'md') => {
    switch (status) {
      case 'P':
        return (
          <span className={`inline-flex items-center gap-1 font-bold rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Present (P)</span>
          </span>
        );
      case 'HD':
        return (
          <span className={`inline-flex items-center gap-1 font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-300 ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Half Day</span>
          </span>
        );
      case 'SUN':
        return (
          <span className={`inline-flex items-center gap-1 font-bold rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-300 ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
            <Coffee className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sunday (Paid)</span>
          </span>
        );
      case 'EMPLOYER_OFF':
        return (
          <span className={`inline-flex items-center gap-1 font-bold rounded-lg bg-sky-100 text-sky-900 border border-sky-300 ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
            <Building2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Employer Off (Paid)</span>
          </span>
        );
      case 'SELF_LEAVE':
        return (
          <span className={`inline-flex items-center gap-1 font-bold rounded-lg bg-rose-100 text-rose-800 border border-rose-300 ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Self Leave (Cut)</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-lg bg-slate-100 text-slate-500 border border-slate-200 ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
            <span>Unmarked</span>
          </span>
        );
    }
  };

  // Format month title in English
  const [curY, curM] = yearMonth.split('-').map(Number);
  const monthNameEn = new Date(curY, curM - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* 🎯 CORE FEATURE: Custom Exact Time-Setter with Minute-by-Minute Calculation */}
      <div className="bg-white rounded-2xl border-2 border-emerald-500/50 shadow-md p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" /> Exact Minute Timing & Punch
              </span>
              <span className="text-xs font-semibold text-slate-600">
                (Shift: 09:30 AM to 05:30 PM • Rate: ~₹{salaryReport.minuteRate.toFixed(3)}/min)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              Custom Arrival & Departure Time Entry
            </h2>
            <p className="text-xs text-slate-600">
              E.g. Arrived at <strong>09:27</strong> (₹0 cut / on-time), <strong>09:35</strong> (5m late → ₹2.78 cut), Left at <strong>17:18</strong> (12m early → ₹6.67 cut), <strong>17:42</strong> (stayed extra → ₹0 cut).
            </p>
          </div>

          {/* Date Picker for editing any day */}
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl shrink-0">
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Select Date:
            </label>
            <input
              type="date"
              value={activeDate}
              onChange={(e) => setActiveDate(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Custom Exact Time Form */}
        <form onSubmit={handleSaveCustomTiming} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Punch In Time */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>1. Exact Arrival Time (Punch In):</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCustomIn24(getNow24h())}
                  className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded transition-colors"
                  title="Fill current live time"
                >
                  ⏰ Current Live Time
                </button>
              </div>

              {/* Exact Minute Time Picker */}
              <input
                type="time"
                step="60"
                value={customIn24}
                onChange={(e) => setCustomIn24(e.target.value)}
                required
                className="w-full text-lg font-mono font-bold text-slate-900 bg-white border border-emerald-300 rounded-xl px-3 py-2 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              {/* Live arrival explanation */}
              <div className="text-xs font-semibold pt-1">
                {liveDiff.isLate ? (
                  <span className="text-rose-700 bg-rose-100/90 border border-rose-200 px-2 py-1 rounded-lg block">
                    ⚠️ {timeTo12h(customIn24)} → <strong>{liveDiff.lateMinutes} mins late</strong> (Salary Deducted ❌)
                  </span>
                ) : (
                  <span className="text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2 py-1 rounded-lg block">
                    ✅ {timeTo12h(customIn24)} → On-time / Early (<strong>₹0 Deduction</strong>)
                  </span>
                )}
              </div>
            </div>

            {/* 2. Punch Out Time */}
            <div className="bg-sky-50/50 border border-sky-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                  <LogOut className="w-4 h-4 text-sky-600" />
                  <span>2. Exact Departure Time (Punch Out):</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCustomOut24(getNow24h())}
                  className="text-[10px] bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold px-2 py-0.5 rounded transition-colors"
                  title="Fill current live time"
                >
                  ⏰ Current Live Time
                </button>
              </div>

              {/* Exact Minute Time Picker */}
              <input
                type="time"
                step="60"
                value={customOut24}
                onChange={(e) => setCustomOut24(e.target.value)}
                required
                className="w-full text-lg font-mono font-bold text-slate-900 bg-white border border-sky-300 rounded-xl px-3 py-2 shadow-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />

              {/* Live departure explanation */}
              <div className="text-xs font-semibold pt-1">
                {liveDiff.isEarlyDeparture ? (
                  <span className="text-rose-700 bg-rose-100/90 border border-rose-200 px-2 py-1 rounded-lg block">
                    ⚠️ {timeTo12h(customOut24)} → <strong>{liveDiff.earlyMinutes} mins early exit</strong> (Salary Deducted ❌)
                  </span>
                ) : liveDiff.isStayedExtra ? (
                  <span className="text-indigo-800 bg-indigo-100/90 border border-indigo-200 px-2 py-1 rounded-lg block">
                    🌟 {timeTo12h(customOut24)} → <strong>{liveDiff.extraStayMinutes} mins stayed extra</strong> (₹0 Deduction ✅)
                  </span>
                ) : (
                  <span className="text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2 py-1 rounded-lg block">
                    ✅ {timeTo12h(customOut24)} → Shift complete (<strong>₹0 Deduction</strong>)
                  </span>
                )}
              </div>
            </div>

            {/* 3. Live Minute-by-Minute Calculation Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Date: {activeDate}</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono text-[11px]">
                    1 min = ~₹0.56
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Late Arrival:</span>
                    <span className={liveDiff.lateMinutes > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {liveDiff.lateMinutes} mins {liveDiff.lateMinutes > 0 && `(-${formatINR(liveDiff.lateMinutes * salaryReport.minuteRate)})`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Early Exit:</span>
                    <span className={liveDiff.earlyMinutes > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {liveDiff.earlyMinutes} mins {liveDiff.earlyMinutes > 0 && `(-${formatINR(liveDiff.earlyMinutes * salaryReport.minuteRate)})`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Stayed Extra:</span>
                    <span className="text-indigo-300 font-semibold">
                      +{liveDiff.extraStayMinutes} mins (₹0 Cut)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-baseline justify-between">
                <span className="text-xs text-slate-300 font-medium">Timing Deduction:</span>
                <span className={`text-xl font-black ${liveDeduction > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {liveDeduction > 0 ? `-${formatINR(liveDeduction)}` : '₹0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick note input & Save Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <input
              type="text"
              value={activeNote}
              onChange={(e) => setActiveNote(e.target.value)}
              placeholder="Note (e.g. Arrived 9:27 AM, stayed till 5:42 PM for dispatch...)"
              className="w-full sm:flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Timing & Attendance</span>
            </button>
          </div>

          {savedSuccessMsg && (
            <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>{savedSuccessMsg}</span>
            </div>
          )}
        </form>
      </div>

      {/* Month Navigation & Stat Cards */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 capitalize">
                {monthNameEn}
              </h3>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Calendar View</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>
          </div>
        </div>

        {/* 7 Quick Metric Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Days</span>
            <div className="text-xl font-bold text-slate-900">{salaryReport.totalDaysInMonth}</div>
            <span className="text-[10px] text-slate-500">{formatINR(salaryReport.dailyRate)}/day</span>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-emerald-800 block">🟢 Present</span>
            <div className="text-xl font-bold text-emerald-900">{salaryReport.presentDays} Days</div>
            <span className="text-[10px] text-emerald-700 font-medium">100% Salary</span>
          </div>

          <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-indigo-800 block">🏖️ Sunday Off</span>
            <div className="text-xl font-bold text-indigo-900">{salaryReport.sundaysCount} Days</div>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-1 rounded">
              Paid (₹0 Cut)
            </span>
          </div>

          <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-sky-800 block">🏢 Employer Off</span>
            <div className="text-xl font-bold text-sky-900">{salaryReport.employerOffCount} Days</div>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-1 rounded">
              Paid (₹0 Cut)
            </span>
          </div>

          <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-rose-800 block">🔴 Self Leave</span>
            <div className="text-xl font-bold text-rose-900">{salaryReport.selfLeaveCount} Days</div>
            <span className="text-[10px] text-rose-700 font-bold">
              -{formatINR(salaryReport.selfLeaveCount * salaryReport.dailyRate)}
            </span>
          </div>

          {/* Timing shortfall card with exact minute count */}
          <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-amber-900 block flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-700" />
              <span>⏰ Timing Shortfall</span>
            </span>
            <div className="text-lg font-bold text-amber-950 mt-0.5">
              {salaryReport.totalShortfallMinutes} mins
            </div>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1 rounded">
              {salaryReport.timeShortfallDeduction > 0 ? `-${formatINR(salaryReport.timeShortfallDeduction)}` : '₹0 Cut'}
            </span>
          </div>

          {/* Half day card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-slate-600 block">🟡 Half Day</span>
            <div className="text-xl font-bold text-slate-800">{salaryReport.halfDaysCount} Days</div>
            <span className="text-[10px] text-slate-500 font-semibold">
              -{formatINR(salaryReport.halfDaysCount * salaryReport.halfDayRate)}
            </span>
          </div>
        </div>
      </div>

      {/* Main View: Calendar or Table */}
      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-xs font-bold text-slate-500">
            <div className="text-rose-600 bg-rose-50 py-1.5 rounded-lg">Sun</div>
            <div className="py-1.5">Mon</div>
            <div className="py-1.5">Tue</div>
            <div className="py-1.5">Wed</div>
            <div className="py-1.5">Thu</div>
            <div className="py-1.5">Fri</div>
            <div className="py-1.5">Sat</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Blank offset tiles */}
            {(() => {
              const firstDayOfWeek = new Date(curY, curM - 1, 1).getDay(); // 0 is Sun
              const blanks = [];
              for (let i = 0; i < firstDayOfWeek; i++) {
                blanks.push(<div key={`blank_${i}`} className="min-h-[90px] sm:min-h-[115px] bg-slate-50/50 rounded-xl border border-dashed border-slate-200/60" />);
              }
              return blanks;
            })()}

            {monthDates.map((dateStr) => {
              const dayNum = parseInt(dateStr.split('-')[2], 10);
              const isSun = isSunday(dateStr);
              const isToday = dateStr === todayStr;
              const isSelectedActive = dateStr === activeDate;
              const { status, record } = getRecordForDate(dateStr);

              // Timing difference for this day
              const diff = record?.punchIn || record?.punchOut
                ? calculateDayTimingDiff(record.punchIn, record.punchOut, employee.startTime, employee.endTime)
                : null;
              const dayCut = diff ? Math.round(diff.totalShortfallMinutes * salaryReport.minuteRate * 100) / 100 : 0;

              // Tile background styling based on status
              let tileBg = 'bg-white border-slate-200 hover:border-slate-300';
              if (status === 'P') tileBg = 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-400';
              else if (status === 'HD') tileBg = 'bg-amber-50/50 border-amber-300 hover:border-amber-400';
              else if (status === 'EMPLOYER_OFF') tileBg = 'bg-sky-50/60 border-sky-300 hover:border-sky-400';
              else if (status === 'SELF_LEAVE') tileBg = 'bg-rose-50/60 border-rose-300 hover:border-rose-400';
              else if (status === 'SUN') tileBg = 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-300';

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setActiveDate(dateStr);
                    handleOpenDayModal(dateStr);
                  }}
                  className={`min-h-[90px] sm:min-h-[115px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group shadow-2xs ${tileBg} ${
                    isSelectedActive ? 'ring-2 ring-emerald-600 shadow-md' : isToday ? 'ring-2 ring-emerald-400/80' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-emerald-600 text-white'
                          : isSun
                          ? 'text-rose-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Small timing indicator */}
                    {diff && diff.totalShortfallMinutes > 0 && status === 'P' && (
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-1 rounded">
                        -{diff.totalShortfallMinutes}m (-{formatINR(dayCut)})
                      </span>
                    )}
                    {diff && diff.isStayedExtra && status === 'P' && (
                      <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-1 rounded">
                        +{diff.extraStayMinutes}m
                      </span>
                    )}
                  </div>

                  {/* Status chip */}
                  <div className="my-0.5">
                    {renderStatusBadge(status, 'sm')}
                  </div>

                  {/* Punch time details */}
                  <div className="text-[10px] text-slate-600 space-y-0.5">
                    {record?.punchIn ? (
                      <div className="truncate font-semibold text-slate-700">
                        ⏱️ {record.punchIn} – {record.punchOut || '...'}
                      </div>
                    ) : (
                      <span className="text-slate-400 group-hover:text-emerald-700 text-[10px]">
                        Set time
                      </span>
                    )}

                    {record?.note && (
                      <div className="text-slate-500 italic truncate text-[9px]">
                        📝 {record.note}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Punch In (09:30)</th>
                  <th className="py-3 px-4">Punch Out (05:30)</th>
                  <th className="py-3 px-4">Exact Timing Cut</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthDates.map((dateStr) => {
                  const isSun = isSunday(dateStr);
                  const dt = new Date(dateStr);
                  const dayName = dt.toLocaleDateString('en-US', { weekday: 'short' });
                  const { status, record } = getRecordForDate(dateStr);

                  const diff = record?.punchIn || record?.punchOut
                    ? calculateDayTimingDiff(record.punchIn, record.punchOut, employee.startTime, employee.endTime)
                    : null;
                  const dayTimeCut = diff ? Math.round(diff.totalShortfallMinutes * salaryReport.minuteRate * 100) / 100 : 0;

                  return (
                    <tr
                      key={dateStr}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        dateStr === activeDate ? 'bg-emerald-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {dateStr} {dateStr === todayStr && <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded ml-1 font-bold">Today</span>}
                      </td>
                      <td className={`py-2.5 px-4 font-medium ${isSun ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                        {dayName}
                      </td>
                      <td className="py-2.5 px-4">
                        {renderStatusBadge(status, 'sm')}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {record?.punchIn ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                            diff && diff.lateMinutes > 0 ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-emerald-50 text-emerald-800 font-semibold'
                          }`}>
                            {record.punchIn}
                            {diff && diff.lateMinutes > 0 && <span className="text-[10px]">({diff.lateMinutes}m late)</span>}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {record?.punchOut ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                            diff && diff.earlyMinutes > 0 ? 'bg-rose-100 text-rose-800 font-bold' : diff && diff.isStayedExtra ? 'bg-indigo-50 text-indigo-800 font-semibold' : 'bg-slate-100 text-slate-800 font-semibold'
                          }`}>
                            {record.punchOut}
                            {diff && diff.earlyMinutes > 0 && <span className="text-[10px]">({diff.earlyMinutes}m early)</span>}
                            {diff && diff.isStayedExtra && <span className="text-[10px]">(+{diff.extraStayMinutes}m extra)</span>}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-medium">
                        {status === 'P' && dayTimeCut > 0 ? (
                          <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-xs">
                            -{formatINR(dayTimeCut)} ({diff?.totalShortfallMinutes}m short)
                          </span>
                        ) : status === 'P' ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-xs">
                            ₹0.00 (Full time)
                          </span>
                        ) : status === 'SELF_LEAVE' ? (
                          <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-xs">
                            -{formatINR(salaryReport.dailyRate)} (Absent)
                          </span>
                        ) : (
                          <span className="text-slate-400">₹0 Cut</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-500 max-w-[180px] truncate">
                        {record?.note || '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setActiveDate(dateStr);
                            handleOpenDayModal(dateStr);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          Edit Time
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Day Modal with Minute Time Pickers */}
      {selectedDayToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Set Exact Time & Attendance Status
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Date: {selectedDayToEdit} ({new Date(selectedDayToEdit).toLocaleDateString('en-US', { weekday: 'long' })})
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayToEdit(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Exact Time Pickers in Modal */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Arrival & Departure Times:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Punch In Time (Shift 09:30 AM):
                  </label>
                  <input
                    type="time"
                    step="60"
                    value={modalIn24}
                    onChange={(e) => setModalIn24(e.target.value)}
                    className="w-full text-base font-mono font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <span className="text-[11px] text-slate-500 font-medium block mt-1">
                    Selected: {timeTo12h(modalIn24)}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Punch Out Time (Shift 05:30 PM):
                  </label>
                  <input
                    type="time"
                    step="60"
                    value={modalOut24}
                    onChange={(e) => setModalOut24(e.target.value)}
                    className="w-full text-base font-mono font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <span className="text-[11px] text-slate-500 font-medium block mt-1">
                    Selected: {timeTo12h(modalOut24)}
                  </span>
                </div>
              </div>

              {/* Dynamic live preview of deduction for modal */}
              {(() => {
                const diff = calculateDayTimingDiff(timeTo12h(modalIn24), timeTo12h(modalOut24), employee.startTime, employee.endTime);
                const cut = Math.round(diff.totalShortfallMinutes * salaryReport.minuteRate * 100) / 100;
                return (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-700">Exact Minute Shortfall:</span>
                      {cut > 0 ? (
                        <span className="text-rose-700">-{formatINR(cut)} ({diff.totalShortfallMinutes} mins short)</span>
                      ) : (
                        <span className="text-emerald-700">₹0.00 Deduction (Shift Complete ✅)</span>
                      )}
                    </div>
                    {diff.extraStayMinutes > 0 && (
                      <div className="text-[11px] text-indigo-700 font-medium mt-0.5">
                        • Stayed {diff.extraStayMinutes} mins extra (Rule: No deduction for staying late)
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Status Selection Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Select Attendance Type:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveModal('P')}
                  className="flex items-start gap-2.5 p-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-left transition-all cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-emerald-950">🟢 Present (P)</div>
                    <div className="text-[11px] text-emerald-800">Salary calculated per exact minute worked</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveModal('EMPLOYER_OFF')}
                  className="flex items-start gap-2.5 p-3 rounded-xl border-2 border-sky-300 bg-sky-50 hover:bg-sky-100 text-left transition-all cursor-pointer"
                >
                  <Building2 className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-sky-950">🏢 Employer Off (Paid)</div>
                    <div className="text-[11px] text-sky-800">Store closed by owner • <strong>₹0 Deduction!</strong></div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveModal('SUN')}
                  className="flex items-start gap-2.5 p-3 rounded-xl border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-left transition-all cursor-pointer"
                >
                  <Coffee className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-indigo-950">🏖️ Sunday Off (Paid)</div>
                    <div className="text-[11px] text-indigo-800">Weekly holiday • <strong>₹0 Deduction!</strong></div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveModal('HD')}
                  className="flex items-start gap-2.5 p-3 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 text-left transition-all cursor-pointer"
                >
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-amber-950">🟡 Half Day</div>
                    <div className="text-[11px] text-amber-800">50% salary deducted (-{formatINR(salaryReport.halfDayRate)})</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveModal('SELF_LEAVE')}
                  className="col-span-1 sm:col-span-2 flex items-start gap-2.5 p-3 rounded-xl border-2 border-rose-300 bg-rose-50 hover:bg-rose-100 text-left transition-all cursor-pointer"
                >
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-rose-950">🔴 Self Leave (Absent)</div>
                    <div className="text-[11px] text-rose-800">Employee absent on own initiative • <strong>1 full day cut (-{formatINR(salaryReport.dailyRate)})</strong></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Note / Reason (Optional):
              </label>
              <input
                type="text"
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                placeholder="e.g. Arrived at 09:27 AM, stayed late till 05:42 PM..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDayToEdit(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
