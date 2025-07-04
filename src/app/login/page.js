'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] dark:bg-[#101322]">
      <Card className="w-full max-w-sm mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-black dark:text-white"
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
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-black dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" variant="primary" className="w-full mt-2">Login</Button>
        </form>
        <Button type="button" variant="secondary" className="w-full mt-4" onClick={handleGuest}>
          Continue as Guest
        </Button>
        <div className="mt-4 text-xs text-gray-500 text-center">
          <div>Demo: demo@example.com / password123</div>
        </div>
      </Card>
    </div>
  );
} 