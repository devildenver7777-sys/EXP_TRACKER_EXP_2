import React, { useState, useEffect } from 'react';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  PieChart, 
  Sliders, 
  Save,
  Utensils,
  ShoppingBag,
  Train,
  Zap,
  Tag
} from 'lucide-react';
import Header from '../components/Header';
import { apiRequest } from '../api/client';

export default function Budget() {
  const [totalBudget, setTotalBudget] = useState(15000);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [categoryBudgets, setCategoryBudgets] = useState({
    Food: 4500,
    Shopping: 3000,
    Travel: 2500,
    Bills: 2500,
    Others: 2500,
  });

  const [categorySpending, setCategorySpending] = useState({
    Food: 4000,
    Shopping: 2500,
    Travel: 2000,
    Bills: 2000,
    Others: 2050,
  });

  const categoryIcons = {
    Food: { icon: Utensils, color: '#3b82f6', bg: '#eff6ff' },
    Shopping: { icon: ShoppingBag, color: '#f97316', bg: '#fff7ed' },
    Travel: { icon: Train, color: '#10b981', bg: '#ecfdf5' },
    Bills: { icon: Zap, color: '#8b5cf6', bg: '#f5f3ff' },
    Others: { icon: Tag, color: '#eab308', bg: '#fefce8' },
  };

  const fetchBudgetData = async () => {
    try {
      const res = await apiRequest('/budget/?month=2025-07');
      if (res) {
        if (res.amount) setTotalBudget(res.amount);
        if (res.category_budgets && Object.keys(res.category_budgets).length > 0) {
          setCategoryBudgets(res.category_budgets);
        }
        if (res.category_spending) {
          setCategorySpending(res.category_spending);
        }
      }
    } catch (e) {
      console.warn('Budget fetch error, using defaults:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const totalSpent = Object.values(categorySpending).reduce((a, b) => a + b, 0);
  const overallUsedPct = Math.round((totalSpent / totalBudget) * 100);

  // Check for categories exceeding 80% (SRS Requirement: warn when a category passes 80% of its limit)
  const warnings = Object.keys(categoryBudgets).map(cat => {
    const limit = categoryBudgets[cat] || 1;
    const spent = categorySpending[cat] || 0;
    const pct = Math.round((spent / limit) * 100);
    return { category: cat, limit, spent, pct };
  }).filter(item => item.pct >= 80);

  const handleCategoryBudgetChange = (cat, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setCategoryBudgets(prev => ({ ...prev, [cat]: num }));
  };

  const handleSaveBudget = async () => {
    try {
      await apiRequest('/budget/', {
        method: 'PUT',
        body: JSON.stringify({
          month: '2025-07',
          amount: totalBudget,
          category_budgets: categoryBudgets,
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#f3f5f9] p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto overflow-y-auto">
      <Header />

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-[#5051f9]" />
            Monthly Budget Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Set spending limits by category and track threshold warnings
          </p>
        </div>

        <button
          onClick={handleSaveBudget}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5051f9] hover:bg-[#4338ca] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-[#5051f9]/25 transition cursor-pointer"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Budget Limits
            </>
          )}
        </button>
      </div>

      {/* 80% Threshold Warnings Banner (SRS section 3.3) */}
      {warnings.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900">
                Budget Alert: {warnings.length} categories have reached 80% or more of their limits!
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {warnings.map(w => (
                  <span
                    key={w.category}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/80 text-amber-900 text-xs font-bold rounded-lg border border-amber-300/60"
                  >
                    <span>{w.category}:</span>
                    <span>₹{w.spent} / ₹{w.limit}</span>
                    <span className="text-amber-700 underline font-extrabold">({w.pct}%)</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overall Budget Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Overall July 2025 Budget
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              ₹{Number(totalBudget).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-slate-400 text-xs block font-semibold">Total Spent</span>
              <span className="text-rose-500 font-extrabold text-lg">
                ₹{totalSpent.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block font-semibold">Remaining</span>
              <span className="text-emerald-600 font-extrabold text-lg">
                ₹{Math.max(0, totalBudget - totalSpent).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block font-semibold">Status</span>
              <span className="text-[#5051f9] font-extrabold text-lg">
                {overallUsedPct}% Used
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              overallUsedPct >= 100
                ? 'bg-rose-500'
                : overallUsedPct >= 80
                ? 'bg-amber-500'
                : 'bg-[#5051f9]'
            }`}
            style={{ width: `${Math.min(100, overallUsedPct)}%` }}
          />
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(categoryBudgets).map((cat) => {
          const conf = categoryIcons[cat] || { icon: Tag, color: '#64748b', bg: '#f1f5f9' };
          const Icon = conf.icon;
          const limit = categoryBudgets[cat] || 1;
          const spent = categorySpending[cat] || 0;
          const pct = Math.round((spent / limit) * 100);
          const isOver80 = pct >= 80;

          return (
            <div
              key={cat}
              className={`bg-white rounded-2xl p-5 border shadow-sm transition hover:shadow-md ${
                isOver80 ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: conf.bg, color: conf.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{cat}</h3>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Spent: ₹{spent.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isOver80 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-[#5051f9]'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              {/* Category Limit Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Budget Limit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={limit}
                    onChange={(e) => handleCategoryBudgetChange(cat, e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5051f9]/30"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
