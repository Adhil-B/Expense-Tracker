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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F5F7FA] dark:bg-[#101322] text-black dark:text-white min-h-screen`}>
        <SessionProvider>
          <div className="fixed top-4 right-4 z-50 flex gap-4 items-center">
            <AuthButton />
            <button
              aria-label="Toggle dark mode"
              onClick={toggleMode}
              className="rounded-full p-2 bg-white dark:bg-card-dark shadow-soft border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
            >
              {mode === 'dark' ? (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M17.75 15.5A6.75 6.75 0 0 1 8.5 6.25c0-.41.04-.81.1-1.2a.75.75 0 0 0-1.04-.82A9 9 0 1 0 19.77 17.44a.75.75 0 0 0-.82-1.04c-.39.06-.79.1-1.2.1Z" fill="#f59e42"/></svg>
              ) : (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#6366f1"/><path stroke="#6366f1" strokeWidth="2" strokeLinecap="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07 6.07-1.42-1.42M6.34 6.34 4.93 4.93m12.14 0-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>
              )}
            </button>
          </div>
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 flex flex-col min-h-screen items-center justify-center">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
