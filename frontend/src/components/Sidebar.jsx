import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Plus, 
  BarChart3, 
  Target, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { LogoSvg, PiggyBankSvg } from './GraphicSvgs';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Add Transaction', path: '/transactions/new', icon: Plus },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Budget', path: '/budget', icon: Target },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#141b34] text-white flex flex-col justify-between p-5 select-none shrink-0 transition-all duration-300">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <LogoSvg className="w-10 h-10 drop-shadow-md" />
          <div className="leading-tight">
            <h1 className="text-xl font-bold tracking-tight text-white">Expense</h1>
            <h2 className="text-xl font-semibold tracking-tight text-[#818cf8]">Tracker</h2>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#5051f9] text-white shadow-lg shadow-[#5051f9]/30 font-semibold translate-x-1'
                      : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.06]'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          {/* Logout Action (FR-1.7, FR-3.3) */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm text-[#94a3b8] hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer text-left"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Bottom Promo / Piggy Card */}
      <div className="bg-[#1b2346] rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden border border-white/5 shadow-inner mt-6">
        <div className="relative mb-1">
          <PiggyBankSvg className="w-20 h-18 drop-shadow-lg" />
        </div>
        <h3 className="text-white font-semibold text-sm leading-snug">
          Save More,
        </h3>
        <p className="text-[#e2e8f0] font-semibold text-sm relative inline-block">
          Spend Wisely!
          <svg className="w-24 h-2 absolute -bottom-1 left-1/2 -translate-x-1/2" viewBox="0 0 100 8" fill="none">
            <path d="M5 4C30 7 70 7 95 3" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </p>
      </div>
    </aside>
  );
}
