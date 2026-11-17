import React from 'react';

export function LogoSvg({ className = "w-9 h-9" }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background card / wallet base */}
      <rect x="2" y="6" width="34" height="28" rx="8" fill="#5c67f2" />
      <rect x="4" y="8" width="32" height="26" rx="7" fill="url(#walletGradient)" />
      {/* Wallet fold */}
      <path d="M4 14H36" stroke="#93a5ff" strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Card peaking out */}
      <rect x="8" y="3" width="22" height="10" rx="3" fill="#a5b4fc" fillOpacity="0.8" />
      {/* Wallet flap with clasp */}
      <path d="M22 17H36V29H22C19.7909 29 18 27.2091 18 25V21C18 18.7909 19.7909 17 22 17Z" fill="#3f4db8" />
      <circle cx="26" cy="23" r="2.5" fill="#f8fafc" />
      <circle cx="26" cy="23" r="1" fill="#6366f1" />
      <defs>
        <linearGradient id="walletGradient" x1="4" y1="8" x2="36" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PiggyBankSvg({ className = "w-20 h-20" }) {
  return (
    <svg className={className} viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gold coin with sparkle */}
      <g className="animate-bounce" style={{ animationDuration: '2.5s' }}>
        <ellipse cx="58" cy="18" rx="9" ry="11" fill="#f59e0b" />
        <ellipse cx="58" cy="18" rx="7" ry="9" fill="#fbbf24" />
        <text x="55" y="22" fontSize="9" fontWeight="bold" fill="#b45309">₹</text>
      </g>

      {/* Piggy Body */}
      <ellipse cx="48" cy="54" rx="30" ry="24" fill="url(#piggyGrad)" />
      
      {/* Coin slot */}
      <ellipse cx="52" cy="33" rx="7" ry="2" fill="#d946ef" opacity="0.6" />

      {/* Piggy Ears */}
      <path d="M28 36C26 26 34 24 38 31" fill="#f472b6" stroke="#fb7185" strokeWidth="1.5" />
      <path d="M24 40C20 32 26 30 30 36" fill="#ec4899" opacity="0.5" />

      {/* Piggy Snout */}
      <ellipse cx="22" cy="54" rx="7.5" ry="9.5" fill="#fda4af" stroke="#f43f5e" strokeWidth="1" />
      <circle cx="20" cy="52" r="1.5" fill="#be123c" />
      <circle cx="20" cy="56" r="1.5" fill="#be123c" />

      {/* Piggy Eye */}
      <ellipse cx="36" cy="46" rx="3.5" ry="3.5" fill="#1e1b4b" />
      <circle cx="35" cy="45" r="1" fill="#ffffff" />

      {/* Rosy Cheek */}
      <ellipse cx="33" cy="55" rx="4" ry="2.5" fill="#f43f5e" opacity="0.3" />

      {/* Piggy Legs */}
      <rect x="30" y="70" width="7" height="9" rx="3.5" fill="#f472b6" />
      <rect x="54" y="70" width="7" height="9" rx="3.5" fill="#f472b6" />
      <rect x="25" y="67" width="6" height="8" rx="3" fill="#ec4899" opacity="0.7" />
      <rect x="63" y="67" width="6" height="8" rx="3" fill="#ec4899" opacity="0.7" />

      {/* Tail curl */}
      <path d="M78 52C82 50 85 53 82 56C80 58 79 57 80 55" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" />

      <defs>
        <linearGradient id="piggyGrad" x1="22" y1="32" x2="74" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbcfe8" />
          <stop offset="0.6" stopColor="#f472b6" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AvatarSvg({ className = "w-10 h-10" }) {
  return (
    <div className={`relative rounded-full overflow-hidden bg-[#1e293b] ring-2 ring-white shadow-sm flex items-center justify-center ${className}`}>
      {/* Anime style boy avatar */}
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background */}
        <circle cx="32" cy="32" r="32" fill="#cbd5e1" />
        {/* Torso/jacket */}
        <path d="M12 64C12 50 20 46 32 46C44 46 52 50 52 64" fill="#0f172a" />
        <path d="M26 46L32 54L38 46" fill="#e2e8f0" />
        {/* Neck */}
        <rect x="28" y="38" width="8" height="10" fill="#fed7aa" />
        {/* Face */}
        <ellipse cx="32" cy="32" rx="13" ry="14" fill="#ffedd5" />
        {/* Eyes */}
        <ellipse cx="27" cy="32" rx="2.5" ry="3.5" fill="#0f172a" />
        <ellipse cx="37" cy="32" rx="2.5" ry="3.5" fill="#0f172a" />
        <circle cx="28" cy="31" r="1" fill="#ffffff" />
        <circle cx="38" cy="31" r="1" fill="#ffffff" />
        {/* Smile */}
        <path d="M30 38C31 39 33 39 34 38" stroke="#ea580c" strokeWidth="1" strokeLinecap="round" />
        {/* Anime Hair (black/dark messy cut) */}
        <path d="M18 30C16 20 23 12 32 12C41 12 48 20 46 30C44 26 42 22 39 21C36 24 35 27 34 29C32 24 29 21 27 21C25 24 22 26 18 30Z" fill="#1e1b4b" />
        <path d="M21 27L24 33L26 27L29 34L32 26L35 34L38 27L42 32L45 28" fill="#1e1b4b" />
      </svg>
    </div>
  );
}
