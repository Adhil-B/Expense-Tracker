'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res.ok) {
      router.replace('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  }

  function handleGuest() {
    localStorage.setItem('guestMode', 'true');
    router.replace('/dashboard');
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setSignUpError('');
    setSignUpLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
    });
    setSignUpLoading(false);
    if (error) {
      setSignUpError(error.message);
    } else {
      // Optionally, auto-login after sign up
      const res = await signIn('credentials', {
        email: signUpEmail,
        password: signUpPassword,
        redirect: false,
      });
      if (res.ok) {
        router.replace('/dashboard');
      } else {
        setError('Account created, but failed to log in. Please try logging in.');
        setShowSignUp(false);
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-sky-100 to-purple-200 dark:from-[#101322] dark:via-[#181B2A] dark:to-[#23263A] transition-colors duration-500">
      <Card className="w-full max-w-sm mx-auto glass-card p-8 relative shadow-2xl border-0">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-lg mb-3">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-2.21 0-4.21-.9-5.66-2.34C7.1 15.21 9.1 14.31 12 14.31s4.9.9 5.66 2.35C16.21 19.1 14.21 20 12 20Zm0-16c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3Z" fill="#6366f1"/></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to your account</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-white/10 px-3 py-2 text-black dark:text-white focus:ring-2 focus:ring-indigo-400 outline-none transition"
              placeholder="demo@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-white/10 px-3 py-2 text-black dark:text-white focus:ring-2 focus:ring-indigo-400 outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}
          <Button type="submit" variant="primary" className="w-full mt-2 text-base py-2 rounded-xl shadow-md bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-bold hover:from-indigo-600 hover:to-pink-600 transition">Login</Button>
        </form>
        <Button type="button" variant="secondary" className="w-full mt-4 text-base py-2 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-white/40 dark:bg-white/5 text-indigo-700 dark:text-indigo-200 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900 transition" onClick={handleGuest}>
          Continue as Guest
        </Button>
        <Button type="button" variant="secondary" className="w-full mt-2 text-base py-2 rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-white/40 dark:bg-white/5 text-purple-700 dark:text-purple-200 font-semibold hover:bg-purple-50 dark:hover:bg-purple-900 transition" onClick={() => setShowSignUp(true)}>
          Sign Up
        </Button>
        <div className="mt-6 text-xs text-gray-500 text-center">
          <div>Demo: <span className="font-semibold">demo@example.com</span> / <span className="font-semibold">password123</span></div>
        </div>
      </Card>
      {/* Sign Up Modal */}
      {showSignUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#181B2A] rounded-2xl shadow-2xl p-8 w-full max-w-sm relative glass-card border-0">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl" onClick={() => setShowSignUp(false)}>&times;</button>
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-lg mb-2">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-2.21 0-4.21-.9-5.66-2.34C7.1 15.21 9.1 14.31 12 14.31s4.9.9 5.66 2.35C16.21 19.1 14.21 20 12 20Zm0-16c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3Z" fill="#a78bfa"/></svg>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">Create Account</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sign up to get started</p>
            </div>
            <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={e => setSignUpEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-white/10 px-3 py-2 text-black dark:text-white focus:ring-2 focus:ring-indigo-400 outline-none transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={signUpPassword}
                  onChange={e => setSignUpPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-white/10 px-3 py-2 text-black dark:text-white focus:ring-2 focus:ring-indigo-400 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              {signUpError && <div className="text-red-500 text-sm text-center font-medium">{signUpError}</div>}
              <Button type="submit" variant="primary" className="w-full mt-2 text-base py-2 rounded-xl shadow-md bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-bold hover:from-indigo-600 hover:to-pink-600 transition" disabled={signUpLoading}>
                {signUpLoading ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 