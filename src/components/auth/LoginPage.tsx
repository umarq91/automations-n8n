import { useState } from 'react';
import { Eye, EyeOff, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import { signInWithEmail, resetPassword } from '../../lib/supabase/auth';

type View = 'login' | 'forgot';

export default function LoginPage() {
  const [view,         setView]         = useState<View>('login');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err?.message ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess('Check your email for a reset link.');
    } catch (err: any) {
      setError(err?.message ?? 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const switchView = (next: View) => {
    setView(next);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen flex bg-ds-bg">

      {/* ── Left panel — image ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden">
        {/* Photo */}
        <img
          src="/login.jpg"
          alt="Automn"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient overlays — dark vignette top + bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />

        {/* Logo — top left */}
        <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 rounded-lg bg-ds-accent flex items-center justify-center shadow-accent-glow">
            <Zap size={15} className="text-white" />
          </div>
          <span className="text-white font-bold text-[15px] tracking-tight drop-shadow">Automn</span>
        </div>

        {/* Tagline — bottom left */}
        <div className="absolute bottom-10 left-8 right-8 z-10">
          <p className="text-white text-[22px] font-semibold leading-snug drop-shadow-lg">
            Automate smarter.<br />Grow faster.
          </p>
          <p className="text-white/55 text-sm mt-2 drop-shadow">
            AI-powered e-commerce automation suite by Automn
          </p>
        </div>
      </div>

      {/* ── Right panel — form ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo (hidden on desktop since left panel shows it) */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-ds-accent flex items-center justify-center shadow-accent-glow">
              <Zap size={15} className="text-white" />
            </div>
            <span className="text-ds-text font-bold text-[15px] tracking-tight">Automn</span>
          </div>

          {view === 'login' ? (
            <>
              {/* Heading */}
              <div className="mb-8">
                <h1 className="text-[28px] font-bold text-ds-text tracking-tight">Welcome back</h1>
                <p className="text-ds-muted text-sm mt-1.5">Sign in to your workspace to continue</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ds-text2 tracking-wide">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 lg:py-4 rounded-xl bg-ds-surface2 border border-ds-border text-sm lg:text-base text-ds-text placeholder:text-ds-muted focus:outline-none focus:ring-2 focus:ring-ds-accent/30 focus:border-ds-accent/50 transition"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-ds-text2 tracking-wide">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchView('forgot')}
                      className="text-xs text-ds-accent hover:text-ds-accentHover transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 lg:py-4 pr-11 rounded-xl bg-ds-surface2 border border-ds-border text-sm lg:text-base text-ds-text placeholder:text-ds-muted focus:outline-none focus:ring-2 focus:ring-ds-accent/30 focus:border-ds-accent/50 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ds-muted hover:text-ds-text2 transition"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 lg:py-4 mt-2 rounded-xl bg-ds-accent hover:bg-ds-accentHover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors shadow-accent-glow flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    <>Sign in <ArrowRight size={15} /></>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-ds-muted mt-8">
                Access is by invitation only.{' '}
                <span className="text-ds-text2">Contact your organization admin.</span>
              </p>
            </>
          ) : (
            <>
              {/* Heading */}
              <div className="mb-8">
                <h1 className="text-[28px] font-bold text-ds-text tracking-tight">Reset password</h1>
                <p className="text-ds-muted text-sm mt-1.5">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <form onSubmit={handleForgot} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                    {success}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ds-text2 tracking-wide">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 lg:py-4 rounded-xl bg-ds-surface2 border border-ds-border text-sm lg:text-base text-ds-text placeholder:text-ds-muted focus:outline-none focus:ring-2 focus:ring-ds-accent/30 focus:border-ds-accent/50 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !!success}
                  className="w-full py-3 lg:py-4 rounded-xl bg-ds-accent hover:bg-ds-accentHover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors shadow-accent-glow flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    'Send reset link'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="w-full py-3 rounded-xl text-sm text-ds-text2 hover:text-ds-text transition"
                >
                  ← Back to sign in
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
