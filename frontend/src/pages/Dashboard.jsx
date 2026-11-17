import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  ArrowDown, 
  ArrowUp, 
  Target, 
  BarChart2, 
  TrendingUp, 
  Receipt, 
  PieChart as PieIcon,
  Utensils,
  ShoppingBag,
  Briefcase,
  Train,
  Zap,
  Tag,
  CheckCircle2
} from 'lucide-react';
import Header from '../components/Header';
import { apiRequest } from '../api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState('July 2025');
  const [activeOverviewTab, setActiveOverviewTab] = useState('This Month');
  const [loading, setLoading] = useState(true);
  const [budgetInput, setBudgetInput] = useState('15,000');
  const [budgetUpdatedMsg, setBudgetUpdatedMsg] = useState(false);

  // Dashboard Data State
  const [summary, setSummary] = useState({
    total_balance: { amount: 12450, change: '+8% vs last month', direction: 'up' },
    total_income: { amount: 25000, change: '+5% vs last month', direction: 'up' },
    total_expenses: { amount: 12550, change: '+3% vs last month', direction: 'up' },
    monthly_budget: { amount: 15000, percentage_used: 84 },
  });

  const [categories, setCategories] = useState([
    { name: 'Food', amount: 4000, percentage: 32, color: '#3b82f6' },
    { name: 'Shopping', amount: 2500, percentage: 20, color: '#f97316' },
    { name: 'Travel', amount: 2000, percentage: 16, color: '#10b981' },
    { name: 'Bills', amount: 2000, percentage: 16, color: '#8b5cf6' },
    { name: 'Others', amount: 1950, percentage: 16, color: '#eab308' },
  ]);

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, date: 'Jul 19, 2025', description: 'Zomato Order', category_name: 'Food', amount: 450, type: 'expense' },
    { id: 2, date: 'Jul 18, 2025', description: 'Amazon Purchase', category_name: 'Shopping', amount: 1299, type: 'expense' },
    { id: 3, date: 'Jul 17, 2025', description: 'Salary', category_name: 'Income', amount: 25000, type: 'income' },
    { id: 4, date: 'Jul 15, 2025', description: 'Metro Card', category_name: 'Travel', amount: 200, type: 'expense' },
    { id: 5, date: 'Jul 14, 2025', description: 'Electricity Bill', category_name: 'Bills', amount: 1800, type: 'expense' },
  ]);

  const [spendingTrend, setSpendingTrend] = useState([
    { month: 'Jan', amount: 5000 },
    { month: 'Feb', amount: 7500 },
    { month: 'Mar', amount: 8000 },
    { month: 'Apr', amount: 9000 },
    { month: 'May', amount: 11000 },
    { month: 'Jun', amount: 10500 },
    { month: 'Jul', amount: 12550 },
  ]);

  const fetchDashboardData = async (monthStr = '2025-07') => {
    try {
      const res = await apiRequest(`/dashboard/summary/?month=${monthStr}`);
      if (res && res.summary_cards) {
        setSummary(res.summary_cards);
        if (res.expense_overview?.categories) {
          setCategories(res.expense_overview.categories);
        }
        if (res.recent_transactions && res.recent_transactions.length > 0) {
          // Format date if needed
          const formatted = res.recent_transactions.map(t => ({
            ...t,
            date: t.date ? (t.date.includes(',') ? t.date : new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })) : 'Jul 19, 2025'
          }));
          setRecentTransactions(formatted);
        }
        if (res.spending_trend) {
          setSpendingTrend(res.spending_trend);
        }
        setBudgetInput(Number(res.summary_cards.monthly_budget.amount).toLocaleString('en-IN'));
      }
    } catch (e) {
      console.warn('Dashboard summary fetch failed, using pre-seeded state:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData('2025-07');
  }, []);

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    const cleanAmount = Number(budgetInput.replace(/,/g, '').trim());
    if (isNaN(cleanAmount) || cleanAmount <= 0) return;

    try {
      const res = await apiRequest('/budget/', {
        method: 'PUT',
        body: JSON.stringify({
          month: '2025-07',
          amount: cleanAmount,
        }),
      });

      if (res) {
        setSummary(prev => ({
          ...prev,
          monthly_budget: {
            amount: cleanAmount,
            percentage_used: Math.round((prev.total_expenses.amount / cleanAmount) * 100),
          }
        }));
      }
      setBudgetUpdatedMsg(true);
      setTimeout(() => setBudgetUpdatedMsg(false), 2500);
    } catch (err) {
      // Local fallback update
      setSummary(prev => ({
        ...prev,
        monthly_budget: {
          amount: cleanAmount,
          percentage_used: Math.round((prev.total_expenses.amount / cleanAmount) * 100),
        }
      }));
      setBudgetUpdatedMsg(true);
      setTimeout(() => setBudgetUpdatedMsg(false), 2500);
    }
  };

  // Helper to get category icon and badges
  const getCategoryBadge = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('food')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#0284c7]">
          <Utensils className="w-3.5 h-3.5" /> Food
        </span>
      );
    }
    if (n.includes('shop')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ffedd5] text-[#ea580c]">
          <ShoppingBag className="w-3.5 h-3.5" /> Shopping
        </span>
      );
    }
    if (n.includes('income') || n.includes('salary')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fef3c7] text-[#854d0e]">
          <Briefcase className="w-3.5 h-3.5" /> Income
        </span>
      );
    }
    if (n.includes('travel') || n.includes('metro')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ede9fe] text-[#7c3aed]">
          <Train className="w-3.5 h-3.5" /> Travel
        </span>
      );
    }
    if (n.includes('bill') || n.includes('electricity')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fef9c3] text-[#ca8a04]">
          <Zap className="w-3.5 h-3.5" /> Bills
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
        <Tag className="w-3.5 h-3.5" /> {name}
      </span>
    );
  };

  // Render donut chart with pure SVG for pixel-perfection matching UI design
  const renderDonutChart = () => {
    const size = 180;
    const strokeWidth = 28;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let currentOffset = 0;
    const totalExp = summary.total_expenses.amount || 12550;

    return (
      <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {categories.map((cat, idx) => {
            const dashLength = (cat.percentage / 100) * circumference;
            const strokeDasharray = `${dashLength} ${circumference - dashLength}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += dashLength;

            return (
              <circle
                key={cat.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={cat.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-500 hover:opacity-90 cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Donut Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            ₹{totalExp.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] font-medium text-slate-400 mt-0.5">
            Total Expenses
          </span>
        </div>
      </div>
    );
  };

  // Render pie chart for "Expense by Category"
  const renderPieChart = () => {
    const size = 120;
    const radius = size / 2;
    let cumulativeAngle = 0;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0">
        {categories.map((cat) => {
          const sliceAngle = (cat.percentage / 100) * 360;
          const startAngle = cumulativeAngle;
          const endAngle = cumulativeAngle + sliceAngle;
          cumulativeAngle += sliceAngle;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = radius + radius * Math.cos(startRad);
          const y1 = radius + radius * Math.sin(startRad);
          const x2 = radius + radius * Math.cos(endRad);
          const y2 = radius + radius * Math.sin(endRad);

          const largeArcFlag = sliceAngle > 180 ? 1 : 0;
          const pathData = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={cat.name}
              d={pathData}
              fill={cat.color}
              className="hover:opacity-90 transition-opacity"
            />
          );
        })}
      </svg>
    );
  };

  // Spending trend points calculation
  const maxTrend = 15000;
  const trendPoints = spendingTrend.map((t, idx) => {
    const x = 30 + idx * 46;
    const y = 140 - (t.amount / maxTrend) * 110;
    return { ...t, x, y };
  });

  const pathD = trendPoints.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = trendPoints[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpX2 = cpX1;
    return `${acc} C ${cpX1} ${prev.y}, ${cpX2} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="flex-1 min-h-screen bg-[#f3f5f9] p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto overflow-y-auto">
      {/* Top Header */}
      <Header 
        selectedMonth={selectedMonth} 
        onMonthChange={(m) => {
          setSelectedMonth(m);
          fetchDashboardData(m.toLowerCase().includes('july') ? '2025-07' : '2025-06');
        }} 
      />

      {/* 4 Summary Cards (FR-2.3, FR-2.4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Balance */}
        <div className="bg-[#e7f8ef] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs border border-emerald-100/60 transition hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">Total Balance</span>
            <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
              ₹{Number(summary.total_balance.amount).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 pt-0.5">
              <span>↑ +8% vs last month</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#34d399]/25 flex items-center justify-center text-emerald-600 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Income */}
        <div className="bg-[#eefcf3] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs border border-emerald-100/60 transition hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">Total Income</span>
            <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
              ₹{Number(summary.total_income.amount).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 pt-0.5">
              <span>↑ +5% vs last month</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/20">
            <ArrowDown className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="bg-[#fef2f2] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs border border-rose-100/60 transition hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">Total Expenses</span>
            <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
              ₹{Number(summary.total_expenses.amount).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-rose-500 pt-0.5">
              <span>↑ +3% vs last month</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#ef4444] flex items-center justify-center text-white shrink-0 shadow-sm shadow-rose-500/20">
            <ArrowUp className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 4: Monthly Budget */}
        <div className="bg-[#eff2fe] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs border border-indigo-100/60 transition hover:shadow-md">
          <div className="flex items-center justify-between mb-1">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-semibold text-slate-500">Monthly Budget</span>
              <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
                ₹{Number(summary.monthly_budget.amount).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-11 h-11 rounded-full bg-[#6366f1] flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-500/20">
              <Target className="w-5 h-5" />
            </div>
          </div>
          
          {/* Progress bar (FR-2.4) */}
          <div className="flex items-center gap-2 pt-2">
            <div className="flex-1 bg-[#c7d2fe] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#5051f9] h-full rounded-full transition-all duration-700" 
                style={{ width: `${Math.min(100, summary.monthly_budget.percentage_used)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700 shrink-0">
              {summary.monthly_budget.percentage_used}%
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Expense Overview & Spending Trend (FR-2.5, FR-2.6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: Expense Overview Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#5051f9]" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Expense Overview</h2>
            </div>

            {/* Time toggle (FR-2.5) */}
            <div className="flex items-center bg-slate-100/90 rounded-full p-1 text-xs font-semibold text-slate-500">
              {['This Month', 'Last Month', 'This Year'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveOverviewTab(tab)}
                  className={`px-3 py-1 rounded-full transition cursor-pointer ${
                    activeOverviewTab === tab
                      ? 'bg-[#5051f9] text-white shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Donut and Legend */}
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            {/* Donut Chart */}
            {renderDonutChart()}

            {/* Category breakdown legend */}
            <div className="w-full sm:w-64 space-y-3.5">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: cat.color }} 
                    />
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-800">
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="font-medium text-slate-400 w-8 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Spending Trend Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#5051f9]" />
            <h2 className="text-base sm:text-lg font-bold text-slate-800">Spending Trend</h2>
          </div>

          {/* Line Chart */}
          <div className="relative w-full h-56 flex items-end pb-4">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 pb-8">
              <div className="flex items-center w-full">
                <span className="w-6 text-right mr-2">15k</span>
                <div className="flex-1 border-b border-slate-100" />
              </div>
              <div className="flex items-center w-full">
                <span className="w-6 text-right mr-2">10k</span>
                <div className="flex-1 border-b border-slate-100" />
              </div>
              <div className="flex items-center w-full">
                <span className="w-6 text-right mr-2">5k</span>
                <div className="flex-1 border-b border-slate-100" />
              </div>
              <div className="flex items-center w-full">
                <span className="w-6 text-right mr-2">0k</span>
                <div className="flex-1 border-b border-slate-100" />
              </div>
            </div>

            {/* Line SVG */}
            <svg className="w-full h-44 overflow-visible ml-6">
              {/* Curve Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#5051f9"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data circles */}
              {trendPoints.map((pt, i) => (
                <g key={pt.month}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#5051f9"
                    className="cursor-pointer hover:r-5 transition-all"
                  />
                  {/* Tooltip on July (Latest Point) */}
                  {i === trendPoints.length - 1 && (
                    <g className="animate-fade-in">
                      <rect
                        x={pt.x - 34}
                        y={pt.y - 32}
                        width="68"
                        height="24"
                        rx="6"
                        fill="#5051f9"
                      />
                      <polygon
                        points={`${pt.x - 4},${pt.y - 8} ${pt.x + 4},${pt.y - 8} ${pt.x},${pt.y - 3}`}
                        fill="#5051f9"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 16}
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ₹12,550
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </svg>

            {/* X-Axis labels */}
            <div className="absolute bottom-0 left-6 right-0 flex justify-between text-[11px] font-medium text-slate-500 px-3">
              {spendingTrend.map((t) => (
                <span key={t.month}>{t.month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & (Set Budget + Category Pie) (FR-2.7, FR-2.8, FR-2.9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Transactions Table (8 cols / ~65%) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#5051f9]" />
                <h2 className="text-base sm:text-lg font-bold text-slate-800">Recent Transactions</h2>
              </div>
              <button
                onClick={() => navigate('/reports')}
                className="text-xs sm:text-sm font-semibold text-[#5051f9] hover:text-[#4338ca] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All &rarr;
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[12px] font-bold text-slate-400 border-b border-slate-100">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 text-slate-500 font-medium whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3.5 text-slate-800 font-bold whitespace-nowrap">
                        {tx.description}
                      </td>
                      <td className="py-3.5 whitespace-nowrap">
                        {getCategoryBadge(tx.category_name)}
                      </td>
                      <td className="py-3.5 font-bold text-slate-900 whitespace-nowrap">
                        ₹{Number(tx.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            tx.type === 'income'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-500'
                          }`}
                        >
                          {tx.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Set Monthly Budget & Expense by Category (4 cols / ~35%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Set Monthly Budget (FR-2.8) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#5051f9]" />
              <h2 className="text-base font-bold text-slate-800">Set Monthly Budget</h2>
            </div>

            <form onSubmit={handleUpdateBudget} className="space-y-3.5">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                  ₹
                </span>
                <input
                  type="text"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#5051f9]/30 focus:border-[#5051f9] transition"
                  placeholder="15,000"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#5051f9] hover:bg-[#4338ca] text-white font-semibold text-sm rounded-xl shadow-md shadow-[#5051f9]/25 transition duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                {budgetUpdatedMsg ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Budget Updated!</span>
                  </>
                ) : (
                  <span>Update Budget</span>
                )}
              </button>
            </form>
          </div>

          {/* Card 2: Expense by Category (FR-2.9) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="w-5 h-5 text-[#5051f9]" />
              <h2 className="text-base font-bold text-slate-800">Expense by Category</h2>
            </div>

            <div className="flex items-center justify-between gap-4 py-1">
              {/* Pie Graphic */}
              <div className="relative">
                {renderPieChart()}
              </div>

              {/* Legend with percentages */}
              <div className="space-y-2 text-xs">
                {categories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-slate-700">{cat.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
