import React, { useState } from 'react';
import { 
  Plus, 
  Wallet, 
  Gift, 
  Trash2, 
  Calendar, 
  IndianRupee, 
  FileText, 
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Tag,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Employee, PaymentTransaction } from '../types';
import { formatINR } from '../utils/salaryCalculator';

interface AdvanceBonusTabProps {
  employee: Employee;
  yearMonth: string;
  transactions: PaymentTransaction[];
  onAddTransaction: (tx: PaymentTransaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const AdvanceBonusTab: React.FC<AdvanceBonusTabProps> = ({
  employee,
  yearMonth,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'advance' | 'bonus'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'advance' | 'bonus'>('advance');

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(todayStr);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'bank_transfer'>('cash');
  const [reason, setReason] = useState<string>('');

  // Filter transactions for current employee and month
  const empTx = transactions.filter(
    (t) => t.employeeId === employee.id && t.date.startsWith(yearMonth)
  );

  const totalAdvance = empTx
    .filter((t) => t.type === 'advance')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBonus = empTx
    .filter((t) => t.type === 'bonus')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAdjustment = totalBonus - totalAdvance;

  const filteredTx = empTx.filter((t) => {
    if (filterType === 'all') return t.type === 'advance' || t.type === 'bonus';
    return t.type === filterType;
  });

  const handleOpenModal = (type: 'advance' | 'bonus') => {
    setModalType(type);
    setAmount('');
    setDate(todayStr);
    setPaymentMode('cash');
    setReason(
      type === 'advance'
        ? 'Advance for household expenses'
        : 'Performance / festive bonus'
    );
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const newTx: PaymentTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      employeeId: employee.id,
      date,
      type: modalType,
      amount: numAmount,
      paymentMode,
      reason: reason || (modalType === 'advance' ? 'Advance Payment' : 'Bonus Reward'),
      createdAt: new Date().toISOString(),
    };

    onAddTransaction(newTx);
    setIsModalOpen(false);
  };

  const presetAmounts = [200, 500, 1000, 1500, 2000, 3000];

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Advance card */}
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200/90 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Total Advance Taken
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-950">
              {formatINR(totalAdvance)}
            </span>
          </div>
          <p className="mt-1 text-xs text-rose-700">
            This amount will be <strong>deducted</strong> from monthly salary payout
          </p>
          <button
            onClick={() => handleOpenModal('advance')}
            className="mt-3.5 w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Advance Payment</span>
          </button>
        </div>

        {/* Bonus card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Total Bonus Earned
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
              {formatINR(totalBonus)}
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-700">
            This amount will be <strong>added</strong> to monthly salary payout
          </p>
          <button
            onClick={() => handleOpenModal('bonus')}
            className="mt-3.5 w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Bonus / Incentive</span>
          </button>
        </div>

        {/* Net adjustment effect */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Net Adjustment on Salary
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black">
              {netAdjustment >= 0 ? (
                <span className="text-emerald-400">+{formatINR(netAdjustment)}</span>
              ) : (
                <span className="text-rose-400">{formatINR(netAdjustment)}</span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-300">
              (Total Bonus {formatINR(totalBonus)} - Advance {formatINR(totalAdvance)})
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Base Salary: {formatINR(employee.baseSalary)}</span>
            <span className="text-emerald-300 font-semibold">Auto-Adjustment Active</span>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
        {/* Table header and filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Advance & Bonus Ledger History</span>
            </h3>
            <p className="text-xs text-slate-500">
              Employee: {employee.name} • Month: {yearMonth}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({empTx.length})
              </button>
              <button
                onClick={() => setFilterType('advance')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'advance' ? 'bg-rose-100 text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Advance Only
              </button>
              <button
                onClick={() => setFilterType('bonus')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'bonus' ? 'bg-emerald-100 text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bonus Only
              </button>
            </div>
          </div>
        </div>

        {/* Transactions list */}
        {filteredTx.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No transactions recorded for this month</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              If you provided cash or UPI advance or granted a bonus, use the buttons above to record it.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4">
                      {tx.type === 'advance' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                          <span>Advance (Deduction)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Gift className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Bonus (Added)</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-extrabold ${tx.type === 'advance' ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {tx.type === 'advance' ? '-' : '+'}{formatINR(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium uppercase text-[11px]">
                        {tx.paymentMode === 'cash' ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                        {tx.paymentMode === 'cash' ? 'Cash' : tx.paymentMode === 'upi' ? 'UPI (PhonePe/GPay)' : 'Bank Transfer'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {tx.reason}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete this ${tx.type === 'advance' ? 'advance' : 'bonus'} (${formatINR(tx.amount)}) record?`)) {
                            onDeleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${modalType === 'advance' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {modalType === 'advance' ? '💸 Record Advance Payment' : '🎁 Add Bonus / Incentive'}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {employee.name}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setModalType('advance');
                    setReason('Advance for household expenses');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    modalType === 'advance' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Advance (Deducted)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalType('bonus');
                    setReason('Performance bonus');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    modalType === 'bonus' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bonus (Added)
                </button>
              </div>

              {/* Amount input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Amount in INR (₹):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 1000"
                    min="1"
                    required
                    className="w-full pl-8 pr-3 py-2 text-base font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {/* Quick preset pills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt.toString())}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Payment Date:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Payment Mode:
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI (PhonePe / Google Pay / Paytm)</option>
                  <option value="bank_transfer">Bank Transfer (NEFT / IMPS)</option>
                </select>
              </div>

              {/* Reason / Note */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason / Description:
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Medical emergency advance, festive reward..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
                    modalType === 'advance' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
