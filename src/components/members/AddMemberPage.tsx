import { useState } from 'react';
import { UserPlus, ArrowLeft, AlertCircle, Loader2, X, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { createMemberAccount } from '../../lib/supabase/members';
import type { ActiveSection } from '../Sidebar';

interface AddMemberPageProps {
  onNavigate: (section: ActiveSection) => void;
}

type SaveState = 'idle' | 'saving' | 'success' | 'error';

export default function AddMemberPage({ onNavigate }: AddMemberPageProps) {
  const { activeOrg } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrg) return;

    if (!fullName.trim()) { setErrorMsg('Full name is required.'); setSaveState('error'); return; }
    if (!email.trim()) { setErrorMsg('Email is required.'); setSaveState('error'); return; }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); setSaveState('error'); return; }

    setSaveState('saving');
    setErrorMsg('');

    try {
      await createMemberAccount(activeOrg.id, fullName.trim(), email.trim(), password);
      setSaveState('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSaveState('error');
    }
  }

  function handleReset() {
    setFullName('');
    setEmail('');
    setPassword('');
    setSaveState('idle');
    setErrorMsg('');
  }

  return (
    <div className="animate-fade-in max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => onNavigate('organization')}
          className="w-8 h-8 rounded-xl bg-ds-surface2 border border-ds-border flex items-center justify-center hover:bg-ds-hover transition-colors"
        >
          <ArrowLeft size={15} className="text-ds-text2" />
        </button>
        <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center shadow-accent-glow">
          <UserPlus size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-ds-text font-bold text-xl tracking-tight">Add Member</h1>
          <p className="text-ds-muted text-sm mt-0.5">Create a supplier account for your organization</p>
        </div>
      </div>

      {/* Success state */}
      {saveState === 'success' && (
        <div className="card p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-ds-text font-semibold text-base mb-1">Account created</h2>
          <p className="text-ds-muted text-sm mb-1">
            <span className="text-ds-text2 font-medium">{fullName}</span> can now log in with their email and password.
          </p>
          <p className="text-ds-muted text-xs mb-6">{email}</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleReset}>
              Add another
            </Button>
            <Button variant="primary" onClick={() => onNavigate('organization')}>
              Back to Organization
            </Button>
          </div>
        </div>
      )}

      {saveState !== 'success' && (
        <>
          {/* Error banner */}
          {saveState === 'error' && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-red-400 text-sm flex-1">{errorMsg}</p>
              <button type="button" onClick={() => setSaveState('idle')} className="text-red-400/50 hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="card p-6 space-y-5">
              <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest">Account Details</h2>

              <div>
                <Label htmlFor="member-name">Full Name <span className="text-red-400">*</span></Label>
                <Input
                  id="member-name"
                  placeholder="e.g. John Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={saveState === 'saving'}
                />
              </div>

              <div>
                <Label htmlFor="member-email">Email Address <span className="text-red-400">*</span></Label>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="supplier@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={saveState === 'saving'}
                />
              </div>

              <div>
                <Label htmlFor="member-password">Password <span className="text-red-400">*</span></Label>
                <div className="relative">
                  <Input
                    id="member-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    disabled={saveState === 'saving'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-muted hover:text-ds-text2 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </section>

            {/* Role info — read-only for now */}
            <section className="card p-6">
              <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-4">Role</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ds-text text-sm font-medium">Supplier</p>
                  <p className="text-ds-muted text-xs mt-0.5">Can access supplier-facing features for this organization</p>
                </div>
                <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Supplier
                </span>
              </div>
            </section>

            <div className="flex items-center justify-end gap-3 pb-8">
              <Button type="button" variant="secondary" onClick={() => onNavigate('organization')} disabled={saveState === 'saving'}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saveState === 'saving'}>
                {saveState === 'saving' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
