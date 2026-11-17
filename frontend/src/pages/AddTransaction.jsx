import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  ArrowLeft, 
  Check, 
  Utensils, 
  ShoppingBag, 
  Briefcase, 
  Train, 
  Zap, 
  Tag, 
  Calendar as CalendarIcon,
  IndianRupee,
  FileText
} from 'lucide-react';
import Header from '../components/Header';
import { apiRequest } from '../api/client';

export default function AddTransaction() {
  const navigate = useNavigate();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { name: 'Food', icon: Utensils, color: '#3b82f6', bg: '#e0f2fe' },
    { name: 'Shopping', icon: ShoppingBag, color: '#f97316', bg: '#ffedd5' },
    { name: 'Travel', icon: Train, color: '#7c3aed', bg: '#ede9fe' },
    { name: 'Bills', icon: Zap, color: '#ca8a04', bg: '#fef9c3' },
    { name: 'Others', icon: Tag, color: '#64748b', bg: '#f1f5f9' },
    { name: 'Income', icon: Briefcase, color: '#16a34a', bg: '#dcfce7' },
  ];

  const presets = [
    { label: '🍕 Zomato Dinner', desc: 'Zomato Order', cat: 'Food', amt: '450', t: 'expense' },
    { label: '📦 Amazon Order', desc: 'Amazon Purchase', cat: 'Shopping', amt: '1299', t: 'expense' },
    { label: '🚇 Metro Recharge', desc: 'Metro Card', cat: 'Travel', amt: '200', t: 'expense' },
    { label: '💡 Power Bill', desc: 'Electricity Bill', cat: 'Bills', amt: '1800', t: 'expense' },
    { label: '💼 Monthly Salary', desc: 'Monthly Salary', cat: 'Income', amt: '25000', t: 'income' },
  ];

  const handlePreset = (p) => {
    setDescription(p.desc);
    setCategory(p.cat);
    setAmount(p.amt);
    setType(p.t);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmt = parseFloat(amount);
    if (!amount || isNaN(numAmt) || numAmt <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/transactions/', {
        method: 'POST',
        body: JSON.stringify({
          type,
          category_name: type === 'income' ? 'Income' : category,
          amount: numAmt,
          description: description.trim(),
          date,
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#f3f5f9] p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto overflow-y-auto">
      <Header />

      <div className="max-w-3xl mx-auto">
        {/* Back and Title */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Add New Transaction</h1>
            <p className="text-xs sm:text-sm text-slate-500">Record a new expense or income entry</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm mb-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            Quick Fill Presets
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePreset(p)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-[#5051f9]/10 hover:text-[#5051f9] hover:border-[#5051f9]/30 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              Transaction saved successfully! Redirecting to Dashboard...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selector (Income vs Expense) */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    if (category === 'Income') setCategory('Food');
                  }}
                  className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer border ${
                    type === 'expense'
                      ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCategory('Income');
                  }}
                  className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer border ${
                    type === 'income'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Income
                </button>
              </div>
            </div>

            {/* Amount Field (₹) */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5051f9]/40 focus:border-[#5051f9] transition"
                  required
                />
              </div>
            </div>

            {/* Category Selector */}
            {type === 'expense' && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.filter(c => c.name !== 'Income').map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setCategory(cat.name)}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 font-semibold text-xs sm:text-sm transition cursor-pointer ${
                          isSelected
                            ? 'border-[#5051f9] bg-[#5051f9]/10 text-[#5051f9] shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: cat.bg, color: cat.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description & Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Description *
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Zomato Order, Metro Card"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5051f9]/30 focus:border-[#5051f9] transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Date *
                </label>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5051f9]/30 focus:border-[#5051f9] transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Preview of Table Row
              </span>
              <div className="flex items-center justify-between text-xs sm:text-sm bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-slate-500 font-medium">{date || 'Today'}</span>
                <span className="font-bold text-slate-800">{description || 'Description'}</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#0284c7]">
                  {type === 'income' ? 'Income' : category}
                </span>
                <span className="font-extrabold text-slate-900">
                  ₹{amount ? Number(amount).toLocaleString('en-IN') : '0.00'}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                  }`}
                >
                  {type === 'income' ? 'Income' : 'Expense'}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-[#5051f9] hover:bg-[#4338ca] text-white font-bold text-sm rounded-xl shadow-md shadow-[#5051f9]/30 transition duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Saving Transaction...' : 'Save Transaction'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
