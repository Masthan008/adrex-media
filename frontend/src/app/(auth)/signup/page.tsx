'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAuthStore(s => s.setUser);

  const [form, setForm] = useState({
    agencyName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  // Password strength indicator
  const passStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data.error)
          ? data.error.map((e: any) => e.message).join(', ')
          : data.error || 'Signup failed. Please try again.';
        setError(msg);
        return;
      }

      if (data.token) localStorage.setItem('drex_token', data.token);

      setUser(data.user);
      setSuccess(true);

      // Brief success flash before redirect
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (err) {
      setError('Cannot connect to server. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background py-12">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="z-10 w-full max-w-lg p-8 glassmorphism rounded-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 mb-4">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create Workspace</h1>
          <p className="text-muted-foreground text-sm">Set up your agency on DREX MEDIA OS</p>
        </div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2.5 mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
          >
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Success Banner */}
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2.5 mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm"
          >
            <CheckCircle size={16} className="shrink-0" />
            Account created! Redirecting to dashboard...
          </motion.div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Agency Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="agency-name">Agency Name</label>
            <input
              id="agency-name"
              type="text"
              value={form.agencyName}
              onChange={set('agencyName')}
              required
              minLength={2}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="e.g. Drex Media Group"
            />
          </div>

          {/* First / Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="first-name">First Name</label>
              <input
                id="first-name"
                type="text"
                value={form.firstName}
                onChange={set('firstName')}
                required
                minLength={2}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="last-name">Last Name</label>
              <input
                id="last-name"
                type="text"
                value={form.lastName}
                onChange={set('lastName')}
                required
                minLength={2}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="signup-email">Work Email</label>
            <input
              id="signup-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              autoComplete="email"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="john@agency.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="signup-password">Password</label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {/* Strength meter */}
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        passStrength >= i ? strengthColor[passStrength] : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Password strength: <span className="font-medium text-foreground">{strengthLabel[passStrength]}</span>
                </p>
              </div>
            )}
          </div>

          <button
            id="signup-submit"
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <><Loader2 size={17} className="animate-spin" /> Creating account...</>
            ) : success ? (
              <><CheckCircle size={17} /> Account created!</>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-7">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
