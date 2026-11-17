import React, { useState } from 'react';
import { Calendar, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { AvatarSvg } from './GraphicSvgs';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ selectedMonth = 'July 2025', onMonthChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const months = [
    'July 2025',
    'June 2025',
    'May 2025',
    'April 2025',
    'March 2025',
    'February 2025',
    'January 2025',
  ];

  const firstName = user?.first_name || 'Yuvan';

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Greeting (FR-2.1) */}
      <div>
        <h1 className="text-2xl sm:text-[28px] font-bold text-[#111827] flex items-center gap-2">
          Hello, {firstName}! <span className="text-2xl">👋</span>
        </h1>
        <p className="text-[#64748b] text-sm font-normal mt-0.5">
          Here's your expense overview for this month.
        </p>
      </div>

      {/* Right Controls: Month Selector & User Avatar (FR-2.2) */}
      <div className="flex items-center gap-3.5 relative">
        {/* Month Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMonthMenu(!showMonthMenu)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{selectedMonth}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showMonthMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
              {months.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    if (onMonthChange) onMonthChange(m);
                    setShowMonthMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-medium transition cursor-pointer ${
                    m === selectedMonth ? 'bg-[#5051f9]/10 text-[#5051f9] font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Avatar with dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="focus:outline-none cursor-pointer rounded-full p-0.5 hover:ring-2 hover:ring-[#5051f9]/40 transition"
          >
            <AvatarSvg className="w-10 h-10 ring-2 ring-white shadow-sm" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                <p className="text-sm font-bold text-slate-800 truncate">{firstName} {user?.last_name || ''}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'yuvan@example.com'}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings
              </button>
              <button
                onClick={async () => {
                  setShowUserMenu(false);
                  await logout();
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-2 text-xs sm:text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
