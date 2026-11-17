import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Search, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet,
  Receipt,
  Trash2
} from 'lucide-react';
import Header from '../components/Header';
import { apiRequest } from '../api/client';

export default function Reports() {
  const [fromDate, setFromDate] = useState('2025-07-01');
  const [toDate, setToDate] = useState('2025-07-31');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [reportData, setReportData] = useState({
    total_income: 25000,
    total_expense: 12550,
    net_savings: 12450,
    transaction_count: 13,
    category_breakdown: [
      { category: 'Food', amount: 4000 },
      { category: 'Shopping', amount: 2500 },
      { category: 'Travel', amount: 2000 },
      { category: 'Bills', amount: 2000 },
      { category: 'Others', amount: 2050 },
    ],
    transactions: [
      { id: 1, date: 'Jul 19, 2025', description: 'Zomato Order', category_name: 'Food', amount: 450, type: 'expense' },
      { id: 2, date: 'Jul 18, 2025', description: 'Amazon Purchase', category_name: 'Shopping', amount: 1299, type: 'expense' },
      { id: 3, date: 'Jul 17, 2025', description: 'Salary', category_name: 'Income', amount: 25000, type: 'income' },
      { id: 4, date: 'Jul 15, 2025', description: 'Metro Card', category_name: 'Travel', amount: 200, type: 'expense' },
      { id: 5, date: 'Jul 14, 2025', description: 'Electricity Bill', category_name: 'Bills', amount: 1800, type: 'expense' },
      { id: 6, date: 'Jul 10, 2025', description: 'Weekly Grocery Store', category_name: 'Food', amount: 2350, type: 'expense' },
      { id: 7, date: 'Jul 08, 2025', description: 'Apparel & Sneakers', category_name: 'Shopping', amount: 1201, type: 'expense' },
      { id: 8, date: 'Jul 06, 2025', description: 'Tech Books & Journal', category_name: 'Others', amount: 1200, type: 'expense' },
      { id: 9, date: 'Jul 05, 2025', description: 'Team Dinner Outing', category_name: 'Food', amount: 1200, type: 'expense' },
      { id: 10, date: 'Jul 04, 2025', description: 'Airport Cab Ride', category_name: 'Travel', amount: 950, type: 'expense' },
      { id: 11, date: 'Jul 02, 2025', description: 'Mobile Data Recharge', category_name: 'Bills', amount: 200, type: 'expense' },
      { id: 12, date: 'Jul 01, 2025', description: 'Express Train Ticket', category_name: 'Travel', amount: 850, type: 'expense' },
    ]
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const query = `/reports/?from=${fromDate}&to=${toDate}&category=${category}&type=${type}`;
      const res = await apiRequest(query);
      if (res && res.transactions) {
        setReportData(res);
      }
    } catch (e) {
      console.warn('Reports fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [fromDate, toDate, category, type]);

  // Export to CSV functionality (FR-3.3)
  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount (INR)', 'Type'];
    const rows = filteredTransactions.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category_name,
      t.amount,
      t.type.toUpperCase()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expense_Report_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = (reportData.transactions || []).filter(tx => {
    const matchesSearch = !search || 
      tx.description.toLowerCase().includes(search.toLowerCase()) || 
      (tx.category_name && tx.category_name.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="flex-1 min-h-screen bg-[#f3f5f9] p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto overflow-y-auto">
      <Header />

      {/* Page Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#5051f9]" />
            Expense Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track spending breakdown, trends, and export records
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5051f9] hover:bg-[#4338ca] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-[#5051f9]/25 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Income</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              ₹{Number(reportData.total_income).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Expenses</span>
            <div className="text-2xl font-extrabold text-rose-500 mt-1">
              ₹{Number(reportData.total_expense).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Net Savings</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              ₹{Number(reportData.net_savings).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-[#5051f9] flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" /> Filter Options
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5051f9]/30"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5051f9]/30"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5051f9]/30 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Shopping">Shopping</option>
              <option value="Travel">Travel</option>
              <option value="Bills">Bills</option>
              <option value="Others">Others</option>
              <option value="Income">Income</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5051f9]/30 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Expense">Expense Only</option>
              <option value="Income">Income Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visual Category Breakdown Bar Chart */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm mb-6">
        <h2 className="text-base font-bold text-slate-800 mb-4">Category Spending Comparison</h2>
        <div className="space-y-3">
          {reportData.category_breakdown.map((item) => {
            const maxAmt = Math.max(...reportData.category_breakdown.map(i => i.amount), 1);
            const pct = Math.round((item.amount / maxAmt) * 100);
            return (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-slate-700">{item.category}</span>
                  <span className="text-slate-900 font-bold">₹{item.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5051f9] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Records Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#5051f9]" />
            <h2 className="text-base font-bold text-slate-800">
              Transactions ({filteredTransactions.length})
            </h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5051f9]/30"
            />
          </div>
        </div>

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
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 text-slate-500 font-medium whitespace-nowrap">{tx.date}</td>
                  <td className="py-3 text-slate-800 font-bold whitespace-nowrap">{tx.description}</td>
                  <td className="py-3 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {tx.category_name}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-900 whitespace-nowrap">
                    ₹{Number(tx.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 whitespace-nowrap">
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
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 text-sm">
                    No transactions found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
