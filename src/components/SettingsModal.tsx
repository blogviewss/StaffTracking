import React, { useState } from 'react';
import { 
  Settings, 
  Clock, 
  Plus, 
  Save, 
  RotateCcw
} from 'lucide-react';
import { Employee } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  employees: Employee[];
  onUpdateEmployee: (emp: Employee) => void;
  onAddEmployee: (emp: Employee) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  employee,
  employees,
  onUpdateEmployee,
  onAddEmployee,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'add'>('edit');

  // Edit current employee state
  const [name, setName] = useState(employee.name);
  const [phone, setPhone] = useState(employee.phone);
  const [role, setRole] = useState(employee.role);
  const [baseSalary, setBaseSalary] = useState(employee.baseSalary.toString());
  const [startTime, setStartTime] = useState(employee.startTime || '09:30');
  const [endTime, setEndTime] = useState(employee.endTime || '17:30');
  const [calcBasis, setCalcBasis] = useState<Employee['calcBasis']>(employee.calcBasis || 'calendar_days');

  // Add new employee state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('Staff / Helper');
  const [newSalary, setNewSalary] = useState('8000');

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Employee = {
      ...employee,
      name,
      phone,
      role,
      baseSalary: parseFloat(baseSalary) || 8000,
      startTime,
      endTime,
      calcBasis,
    };
    onUpdateEmployee(updated);
    alert('Employee details and payroll rules saved successfully! ✅');
    onClose();
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      role: newRole.trim(),
      baseSalary: parseFloat(newSalary) || 8000,
      startTime: '09:30',
      endTime: '17:30',
      joinDate: new Date().toISOString().split('T')[0],
      calcBasis: 'calendar_days',
    };

    onAddEmployee(newEmp);
    setNewName('');
    setNewPhone('');
    setActiveTab('edit');
    alert('New employee added successfully! ✅');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Employee & Payroll Settings
              </h3>
              <p className="text-xs text-slate-500">
                Configure salary rate, shift schedule (09:30 AM - 05:30 PM), and payroll rules
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

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Current Employee Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'add' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            + Add New Employee
          </button>
        </div>

        {activeTab === 'edit' ? (
          <form onSubmit={handleSaveCurrent} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Employee Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Agreed Monthly Salary (₹):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    required
                    className="w-full pl-7 pr-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Role / Designation:
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Timing: 9:30 to 5:30 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                Working Shift Timing:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">Shift Start Time:</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">Shift End Time:</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                (Standard default is 09:30 AM to 05:30 PM)
              </p>
            </div>

            {/* Salary Calculation Basis */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Daily Salary Calculation Basis (Daily Rate Basis):
              </label>
              <select
                value={calcBasis}
                onChange={(e) => setCalcBasis(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="calendar_days">
                  Calendar Days (Total month days - e.g. 30 days = ₹8,000 / 30 = ₹266.67/day) [Recommended]
                </option>
                <option value="fixed_30">
                  Fixed 30 Days (Every month 30 days = ₹8,000 / 30 = ₹266.67/day)
                </option>
                <option value="working_days_26">
                  26 Working Days (Excluding Sundays = ₹8,000 / 26 = ₹307.69/day)
                </option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mobile Number (for WhatsApp Pay Slips):
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to reset all data back to the default demo state?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Add New Employee Form */
          <form onSubmit={handleAddNew} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                New Employee Name:
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. John Doe"
                required
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Monthly Salary (₹):
                </label>
                <input
                  type="number"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  placeholder="8000"
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Role / Designation:
                </label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Store Helper / Sales"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mobile Number:
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
