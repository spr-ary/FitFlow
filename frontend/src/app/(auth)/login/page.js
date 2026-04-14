'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f1f8] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-6xl rounded-[2rem] bg-white/80 shadow-[0_20px_60px_rgba(214,181,214,0.35)] border border-white overflow-hidden backdrop-blur-sm">
        <div className="grid lg:grid-cols-[1fr_1.05fr]">
          {/* Left panel */}
          <div className="hidden lg:flex p-4">
            <div className="relative w-full rounded-[1.8rem] overflow-hidden bg-gradient-to-br from-pink-200 via-purple-200 to-pink-100 min-h-[640px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_transparent_22%),radial-gradient(circle_at_30%_55%,_rgba(244,114,182,0.38),_transparent_35%),radial-gradient(circle_at_75%_30%,_rgba(196,181,253,0.75),_transparent_30%),radial-gradient(circle_at_20%_85%,_rgba(251,207,232,0.85),_transparent_28%)]" />

              <div className="relative h-full flex flex-col justify-between p-10">
                <div>
                  <div className="text-white/90 text-8xl leading-none font-light">*</div>
                </div>

                <div className="max-w-sm">
                  <p className="text-white/80 text-sm mb-4">FitFlow</p>
                  <h1 className="text-white text-4xl font-semibold leading-tight">
                    Gym membership and class management system
                  </h1>
                  <p className="mt-5 text-white/80 text-sm leading-6">
                    Manage memberships, schedule classes, track attendance, and keep everything flowing smoothly in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <div className="text-fuchsia-400 text-6xl leading-none mb-1">*</div>
                <h2 className="text-4xl font-semibold text-gray-900 tracking-tight">
                  Welcome back
                </h2>
                <p className="mt-3 text-gray-500 text-sm leading-6">
                  Sign in to access your classes, bookings, and gym dashboard.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-pink-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@fitflow.com"
                    className="w-full rounded-2xl border border-[#e7dce8] bg-white px-4 py-3.5 text-sm text-gray-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-[#e7dce8] bg-white px-4 py-3.5 text-sm text-gray-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-pink-300 via-fuchsia-300 to-purple-300 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(236,72,153,0.25)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Get Started'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-7">
                <div className="h-px flex-1 bg-[#e8dee8]" />
                <div className="h-px flex-1 bg-[#e8dee8]" />
              </div>

              <p className="mt-8 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-fuchsia-500 hover:text-fuchsia-600"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}