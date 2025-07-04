'use client';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
];

function getDefaultCurrency() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('currency');
    if (saved) return saved;
    if (navigator.language.startsWith('en-IN') || navigator.language.startsWith('hi-IN')) return 'INR';
  }
  return 'USD';
}

function AuthButton() {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session ? (
    <div className="flex items-center gap-2">
      {session.user?.image && <img src={session.user.image} alt="avatar" className="w-7 h-7 rounded-full border" />}
      <span className="text-sm font-medium">{session.user?.name || session.user?.email}</span>
      <button onClick={() => signOut()} className="ml-2 px-3 py-1 rounded-xl bg-gray-200 dark:bg-gray-800 text-xs font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition">Logout</button>
    </div>
  ) : (
    <button onClick={() => signIn()} className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition">Login</button>
  );
}

export default function RootLayout({ children }) {
  const [mode, setMode] = useState('light');
  const [currency, setCurrency] = useState(getDefaultCurrency());
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setMode('dark');
      document.documentElement.classList.add('dark');
    } else {
      setMode('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);
  function toggleMode() {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newMode);
  }
  const currencyObj = CURRENCY_OPTIONS.find(c => c.code === currency) || CURRENCY_OPTIONS[0];
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F5F7FA] dark:bg-[#101322] text-black dark:text-white min-h-screen`}>
        <SessionProvider>
          {/* Premium Navbar */}
          <nav className="w-full z-50 sticky top-0 bg-white/70 dark:bg-[#181B2A]/80 backdrop-blur-md shadow-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 sm:px-8 h-16">
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-700 bg-clip-text text-transparent select-none drop-shadow-sm" style={{letterSpacing: '-0.01em'}}>Expense Tracker</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Currency Selector */}
              <div className="relative">
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="appearance-none pl-9 pr-6 py-2 rounded-full bg-white/80 dark:bg-[#23263A] border border-gray-200 dark:border-gray-700 shadow-md text-sm font-semibold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none transition cursor-pointer hover:bg-indigo-50 dark:hover:bg-[#181B2A]"
                  style={{ minWidth: 110 }}
                >
                  {CURRENCY_OPTIONS.map(opt => (
                    <option key={opt.code} value={opt.code}>{opt.label}</option>
                  ))}
                </select>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none select-none">
                  {currencyObj.symbol === '$' ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><text x="2" y="16" fontSize="16" fill="#6366f1">$</text></svg>
                  ) : currencyObj.symbol === '₹' ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><text x="2" y="16" fontSize="16" fill="#6366f1">₹</text></svg>
                  ) : null}
                </span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
              <AuthButton />
            </div>
          </nav>
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 flex flex-col min-h-screen items-center justify-center pt-4">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
