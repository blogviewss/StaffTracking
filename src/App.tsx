import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AttendanceTab } from './components/AttendanceTab';
import { AdvanceBonusTab } from './components/AdvanceBonusTab';
import { SalaryCalculationTab } from './components/SalaryCalculationTab';
import { WorkLogTab } from './components/WorkLogTab';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { SettingsModal } from './components/SettingsModal';
import {
  AttendanceRecord,
  Employee,
  PaymentTransaction,
  WorkTaskLog,
} from './types';
import {
  getStoredEmployees,
  saveStoredEmployees,
  getSelectedEmployeeId,
  setSelectedEmployeeId as persistSelectedEmployeeId,
  getStoredAttendance,
  saveStoredAttendance,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredWorkLogs,
  saveStoredWorkLogs,
} from './utils/storage';
import { calculateMonthlySalary } from './utils/salaryCalculator';

export default function App() {
  // Navigation & Month
  const [currentTab, setCurrentTab] = useState<'attendance' | 'advance_bonus' | 'salary' | 'work_log'>('attendance');
  const [yearMonth, setYearMonth] = useState<string>('2026-11');

  // Stored Data
  const [employees, setEmployees] = useState<Employee[]>(getStoredEmployees);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(getSelectedEmployeeId);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(getStoredAttendance);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(getStoredTransactions);
  const [workLogs, setWorkLogs] = useState<WorkTaskLog[]>(getStoredWorkLogs);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  // Active Employee
  const currentEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  // Sync to local storage
  useEffect(() => {
    saveStoredEmployees(employees);
  }, [employees]);

  useEffect(() => {
    persistSelectedEmployeeId(selectedEmpId);
  }, [selectedEmpId]);

  useEffect(() => {
    saveStoredAttendance(attendance);
  }, [attendance]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredWorkLogs(workLogs);
  }, [workLogs]);

  // Handlers for Attendance
  const handleUpdateAttendance = (record: AttendanceRecord) => {
    setAttendance((prev) => {
      const idx = prev.findIndex((a) => a.id === record.id || (a.employeeId === record.employeeId && a.date === record.date));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [...prev, record];
    });
  };

  const handleBulkAttendance = (records: AttendanceRecord[]) => {
    setAttendance((prev) => {
      const copy = [...prev];
      records.forEach((newRec) => {
        const idx = copy.findIndex((a) => a.id === newRec.id || (a.employeeId === newRec.employeeId && a.date === newRec.date));
        if (idx >= 0) {
          copy[idx] = newRec;
        } else {
          copy.push(newRec);
        }
      });
      return copy;
    });
  };

  // Handlers for Transactions (Advance / Bonus / Payout)
  const handleAddTransaction = (tx: PaymentTransaction) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Handlers for Work Logs
  const handleAddWorkLog = (log: WorkTaskLog) => {
    setWorkLogs((prev) => [log, ...prev]);
  };

  const handleUpdateWorkLog = (log: WorkTaskLog) => {
    setWorkLogs((prev) => prev.map((l) => (l.id === log.id ? log : l)));
  };

  const handleDeleteWorkLog = (id: string) => {
    setWorkLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // Handlers for Employee
  const handleUpdateEmployee = (updated: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees((prev) => [...prev, newEmp]);
    setSelectedEmpId(newEmp.id);
  };

  const handleResetData = () => {
    localStorage.clear();
    setEmployees(getStoredEmployees());
    setSelectedEmpId(getSelectedEmployeeId());
    setAttendance(getStoredAttendance());
    setTransactions(getStoredTransactions());
    setWorkLogs(getStoredWorkLogs());
    alert('Demo data has been reset to defaults! ✅');
  };

  const salaryReport = calculateMonthlySalary(currentEmployee, yearMonth, attendance, transactions);

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 font-sans flex flex-col">
      {/* Header with quick rules, employee switcher, tabs */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        employee={currentEmployee}
        employees={employees}
        onSelectEmployee={(id) => setSelectedEmpId(id)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {currentTab === 'attendance' && (
          <AttendanceTab
            employee={currentEmployee}
            yearMonth={yearMonth}
            setYearMonth={setYearMonth}
            attendanceRecords={attendance}
            onUpdateAttendance={handleUpdateAttendance}
            onBulkUpdate={handleBulkAttendance}
          />
        )}

        {currentTab === 'advance_bonus' && (
          <AdvanceBonusTab
            employee={currentEmployee}
            yearMonth={yearMonth}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {currentTab === 'salary' && (
          <SalaryCalculationTab
            employee={currentEmployee}
            yearMonth={yearMonth}
            attendanceRecords={attendance}
            transactions={transactions}
            onMarkAsPaid={handleAddTransaction}
            onOpenWhatsAppShare={() => setIsWhatsAppOpen(true)}
          />
        )}

        {currentTab === 'work_log' && (
          <WorkLogTab
            employee={currentEmployee}
            workLogs={workLogs}
            onAddWorkLog={handleAddWorkLog}
            onUpdateWorkLog={handleUpdateWorkLog}
            onDeleteWorkLog={handleDeleteWorkLog}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Staff Attendance & Payroll: Sundays (Paid) • Employer Offs (Paid) • Self Leaves (Deducted) • 09:30 AM - 05:30 PM Shift</span>
          </div>
          <div>
            Base Salary: ₹{currentEmployee.baseSalary.toLocaleString('en-IN')}/month • Exact minute timing active • Saved locally
          </div>
        </div>
      </footer>

      {/* WhatsApp Share Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        employee={currentEmployee}
        report={salaryReport}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        employee={currentEmployee}
        employees={employees}
        onUpdateEmployee={handleUpdateEmployee}
        onAddEmployee={handleAddEmployee}
        onResetData={handleResetData}
      />
    </div>
  );
}
