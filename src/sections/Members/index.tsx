import { useState } from 'react';
import {
  UserPlus, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2,
  Truck, ShieldCheck, Package, BarChart3, Lock, Check,
} from 'lucide-react';
import ErrorBanner from '../../components/shared/ErrorBanner';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { MemberModel } from '../../models/MemberModel';
import type { ActiveSection } from '../../components/layout/Sidebar';

interface MembersSectionProps {
  onNavigate: (section: ActiveSection) => void;
}

type SaveState = 'idle' | 'saving' | 'success' | 'error';

const SUPPLIER_PERMISSIONS = [
  { icon: Package,    label: 'View assigned products',         allowed: true  },
  { icon: Truck,      label: 'Access supplier-facing portal',  allowed: true  },
  { icon: BarChart3,  label: 'View product performance data',  allowed: true  },
  { icon: ShieldCheck,label: 'Manage organization settings',   allowed: false },
  { icon: Lock,       label: 'Invite or remove members',       allowed: false },
];

export default function MembersSection({ onNavigate }: MembersSectionProps) {
  const { activeOrg } = useAuth();
  const [fullName, setFullName]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveState, setSaveState]     = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrg) return;
    if (!fullName.trim()) { setErrorMsg('Full name is required.'); setSaveState('error'); return; }
    if (!email.trim())    { setErrorMsg('Email is required.');     setSaveState('error'); return; }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); setSaveState('error'); return; }
    setSaveState('saving');
    setErrorMsg('');
    try {
      await MemberModel.createAccount(activeOrg.id, fullName.trim(), email.trim(), password);
      setSaveState('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSaveState('error');
    }
  }

  function handleReset() {
    setFullName(''); setEmail(''); setPassword('');
    setSaveState('idle'); setErrorMsg('');
  }

  if (saveState === 'success') {
    return (
      <div className="animate-fade-in min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-emerald-400" />
          </div>
          <h2 className="text-ds-text font-bold text-2xl mb-2">Account created</h2>
          <p className="text-ds-text2 text-sm mb-1">
            <span className="font-semibold">{fullName}</span> can now log in with their credentials.
          </p>
          <p className="text-ds-muted text-xs mb-8">{email}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="secondary" onClick={handleReset}>Add another member</Button>
            <Button variant="primary" onClick={() => onNavigate('organization')}>Back to Organization</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => onNavigate('organization')}
          className="w-9 h-9 rounded-xl bg-ds-surface2 border border-ds-border flex items-center justify-center hover:bg-ds-hover transition-colors shrink-0"
        >
          <ArrowLeft size={15} className="text-ds-text2" />
        </button>
        <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center shadow-accent-glow shrink-0">
          <UserPlus size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-ds-text font-bold text-xl tracking-tight">Add Member</h1>
          <p className="text-ds-muted text-sm mt-0.5">Create a supplier account for your organization</p>
        </div>
      </div>

      {saveState === 'error' && (
        <div className="mb-6">
          <ErrorBanner message={errorMsg} onDismiss={() => setSaveState('idle')} />
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ── Left: form ── */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          <div className="card p-6 space-y-5">
            <div>
              <p className="text-[10px] font-semibold text-ds-muted uppercase tracking-widest mb-4">Account Details</p>
              <div className="space-y-4">
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
                  <p className="text-ds-muted text-[11px] mt-1.5">At least 6 characters. Share credentials securely.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Role card */}
          <div className="card p-6">
            <p className="text-[10px] font-semibold text-ds-muted uppercase tracking-widest mb-4">Role Assignment</p>
            <div className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Truck size={18} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ds-text text-sm font-semibold">Supplier</p>
                <p className="text-ds-muted text-xs mt-0.5">Limited access — supplier-facing features only</p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                Supplier
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onNavigate('organization')}
              disabled={saveState === 'saving'}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saveState === 'saving'}>
              {saveState === 'saving'
                ? <><Loader2 size={14} className="animate-spin" /> Creating…</>
                : <><UserPlus size={14} /> Create Account</>
              }
            </Button>
          </div>
        </form>

        {/* ── Right: info panel ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Permissions */}
          <div className="card p-6">
            <p className="text-[10px] font-semibold text-ds-muted uppercase tracking-widest mb-4">Supplier Permissions</p>
            <div className="space-y-3">
              {SUPPLIER_PERMISSIONS.map(({ icon: Icon, label, allowed }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    allowed ? 'bg-emerald-500/10' : 'bg-ds-surface2'
                  }`}>
                    <Icon size={13} className={allowed ? 'text-emerald-400' : 'text-ds-muted'} />
                  </div>
                  <span className={`text-xs flex-1 ${allowed ? 'text-ds-text2' : 'text-ds-muted line-through'}`}>
                    {label}
                  </span>
                  {allowed
                    ? <Check size={13} className="text-emerald-400 shrink-0" />
                    : <Lock size={11} className="text-ds-muted shrink-0" />
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="card p-5 bg-ds-accent/[0.03] border-ds-accent/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-ds-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={15} className="text-ds-accent" />
              </div>
              <div>
                <p className="text-ds-text text-xs font-semibold mb-1">Security tip</p>
                <p className="text-ds-muted text-xs leading-relaxed">
                  Use a strong, unique password. Suppliers log in with these credentials directly — share them securely and avoid email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
