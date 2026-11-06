import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Hourglass, 
  Calendar, 
  ThumbsUp, 
  Trash2, 
  FileText
} from 'lucide-react';
import { Employee, WorkTaskLog } from '../types';

interface WorkLogTabProps {
  employee: Employee;
  workLogs: WorkTaskLog[];
  onAddWorkLog: (log: WorkTaskLog) => void;
  onUpdateWorkLog: (log: WorkTaskLog) => void;
  onDeleteWorkLog: (id: string) => void;
}

const PRESET_TIME_SLOTS = [
  '09:30 AM - 11:30 AM (Morning Shift 1)',
  '11:30 AM - 01:30 PM (Midday Shift 2)',
  '01:30 PM - 02:30 PM (Lunch / Break)',
  '02:30 PM - 04:00 PM (Afternoon Shift 3)',
  '04:00 PM - 05:30 PM (Evening Closing)',
];

const QUICK_TASK_CHIPS = [
  'Opened store, cleaned counters & organized stock displays',
  'Packed customer orders and prepared courier parcels',
  'Unloaded incoming shipment & restocked inventory shelves',
  'Attended retail customers and managed counter sales',
  'Audited warehouse / inventory register',
  'Reconciled daily cash register and closing duties',
  'Ran essential market or banking errands',
];

export const WorkLogTab: React.FC<WorkLogTabProps> = ({
  employee,
  workLogs,
  onAddWorkLog,
  onUpdateWorkLog,
  onDeleteWorkLog,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [selectedSlot, setSelectedSlot] = useState<string>(PRESET_TIME_SLOTS[0]);
  const [taskDesc, setTaskDesc] = useState<string>('');
  const [taskStatus, setTaskStatus] = useState<'completed' | 'in_progress' | 'pending'>('completed');

  // Logs for selected date and employee
  const currentDayLogs = workLogs.filter(
    (log) => log.employeeId === employee.id && log.date === selectedDate
  );

  const completedCount = currentDayLogs.filter((l) => l.status === 'completed').length;
  const inProgressCount = currentDayLogs.filter((l) => l.status === 'in_progress').length;

  const handleOpenAdd = (slotPreset?: string) => {
    setSelectedSlot(slotPreset || PRESET_TIME_SLOTS[0]);
    setTaskDesc('');
    setTaskStatus('completed');
    setIsAddModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDesc.trim()) {
      alert('Please enter a task description.');
      return;
    }

    const newLog: WorkTaskLog = {
      id: `wlog_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      employeeId: employee.id,
      date: selectedDate,
      timeSlot: selectedSlot,
      taskDescription: taskDesc.trim(),
      status: taskStatus,
      submittedAt: new Date().toISOString(),
      verifiedByEmployer: false,
    };

    onAddWorkLog(newLog);
    setIsAddModalOpen(false);
  };

  const toggleVerify = (log: WorkTaskLog) => {
    const updated = {
      ...log,
      verifiedByEmployer: !log.verifiedByEmployer,
      employerNote: !log.verifiedByEmployer ? 'Task checked and approved by employer ✅' : undefined,
    };
    onUpdateWorkLog(updated);
  };

  const toggleStatus = (log: WorkTaskLog) => {
    const nextStatus = log.status === 'completed' ? 'in_progress' : 'completed';
    onUpdateWorkLog({
      ...log,
      status: nextStatus,
    });
  };

  return (
    <div className="space-y-6">
      {/* Strict Isolation Notice requested by user */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                🔒 Daily Work Activity Log (Work Submission Hub)
              </span>
              <span className="text-xs font-bold text-amber-800">
                (Strictly Isolated from Salary)
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              Shift Hours: 09:30 AM to 05:30 PM (1-2 Hourly Progress Submissions)
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-0.5">
              As per your workflow: <strong>This tab records the tasks completed during the shift.</strong> It does not affect salary calculations or deductions. The employee updates completed work here every 1 to 2 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Date selector and Day Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <div>
              <label className="text-[11px] font-bold text-slate-500 block uppercase">
                Select Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm font-bold text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            {selectedDate === todayStr && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                Today
              </span>
            )}
          </div>

          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Submit Work Task</span>
          </button>
        </div>

        {/* Shift timeline progress pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
            <span className="text-[11px] text-slate-500 block">Total Tasks Logged</span>
            <span className="text-xl font-bold text-slate-900">{currentDayLogs.length}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
            <span className="text-[11px] text-emerald-800 block">Completed</span>
            <span className="text-xl font-bold text-emerald-900">{completedCount}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
            <span className="text-[11px] text-amber-800 block">In Progress</span>
            <span className="text-xl font-bold text-amber-900">{inProgressCount}</span>
          </div>
          <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-xl">
            <span className="text-[11px] text-sky-800 block">Verified by Employer</span>
            <span className="text-xl font-bold text-sky-900">
              {currentDayLogs.filter((l) => l.verifiedByEmployer).length}
            </span>
          </div>
        </div>
      </div>

      {/* Suggested 1-2 Hourly Time Slots (Click to fill) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>1-2 Hourly Shift Slots (09:30 AM to 05:30 PM) — Click to log task:</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {PRESET_TIME_SLOTS.map((slot) => {
            const hasTaskForSlot = currentDayLogs.some((l) => l.timeSlot === slot);
            return (
              <button
                key={slot}
                onClick={() => handleOpenAdd(slot)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  hasTaskForSlot
                    ? 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/70'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500">Slot</span>
                  {hasTaskForSlot ? (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 rounded">Logged ✅</span>
                  ) : (
                    <span className="text-[10px] text-slate-400">+ Add</span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1 truncate">
                  {slot}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Work Task Logs Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Daily Task Log ({selectedDate})</span>
          </h3>
          <span className="text-xs text-slate-500">
            Employee: {employee.name}
          </span>
        </div>

        {currentDayLogs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">
              No tasks submitted for this date yet
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              The employee can log tasks completed every 1-2 hours during their 09:30 AM to 05:30 PM shift.
            </p>
            <button
              onClick={() => handleOpenAdd()}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Submit First Task</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentDayLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-xl border transition-all ${
                  log.status === 'completed'
                    ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    : 'bg-amber-50/40 border-amber-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-slate-200/80 text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        {log.timeSlot}
                      </span>

                      <button
                        onClick={() => toggleStatus(log)}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                          log.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                        title="Click to toggle status"
                      >
                        {log.status === 'completed' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Task Completed</span>
                          </>
                        ) : (
                          <>
                            <Hourglass className="w-3.5 h-3.5 text-amber-600" />
                            <span>In Progress</span>
                          </>
                        )}
                      </button>

                      {log.verifiedByEmployer && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-sky-100 text-sky-900 border border-sky-300">
                          <ThumbsUp className="w-3 h-3 text-sky-600" />
                          <span>Verified by Employer ✅</span>
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-slate-900 pt-1 leading-relaxed whitespace-pre-line">
                      {log.taskDescription}
                    </p>

                    {log.employerNote && (
                      <p className="text-xs text-sky-800 font-semibold italic bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/70 inline-block mt-1">
                        💬 Employer Note: {log.employerNote}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => toggleVerify(log)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                        log.verifiedByEmployer
                          ? 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Verify task as employer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{log.verifiedByEmployer ? 'Verified' : 'Verify'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this work log record?')) {
                          onDeleteWorkLog(log.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Submit Work Progress (09:30 AM - 05:30 PM)
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {employee.name} • {selectedDate}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              {/* Time slot selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Time Slot:
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {PRESET_TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="Custom Time">Custom Time</option>
                </select>
              </div>

              {/* Quick suggestions */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Quick Suggestion Chips (Click to insert):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                  {QUICK_TASK_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTaskDesc((prev) => prev ? `${prev}, ${chip}` : chip)}
                      className="text-[11px] text-slate-700 hover:bg-emerald-100 hover:text-emerald-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md transition-colors"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Task Description (What was accomplished):
                </label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="e.g. Packed 10 parcels, attended walk-in customers, organized display shelves..."
                  rows={4}
                  required
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Task Status */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Task Status:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTaskStatus('completed')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      taskStatus === 'completed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Completed ✅
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskStatus('in_progress')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      taskStatus === 'in_progress'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    In Progress ⏳
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Submit Work Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
