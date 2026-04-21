import { useEffect, useRef, useState } from 'react';
import {
  Building2, Crown, Users, Calendar, Hash, Sparkles,
  Shield, UserCheck, Clock, Mail, AlertCircle, Loader2,
  Pencil, Check, X, UserPlus, Truck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MemberModel } from '../../models/MemberModel';
import { UserModel } from '../../models/UserModel';
import type { OrganizationMemberWithUser, MemberRole } from '../../lib/supabase/types';
import type { ActiveSection } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/button';
import { formatDate } from '../../lib/utils';
import EmptyState from '../../components/shared/EmptyState';

const PLAN_STYLES: Record<string, { label: string; className: string }> = {
  free:       { label: 'Free',       className: 'bg-ds-hover text-ds-text2' },
  pro:        { label: 'Pro',        className: 'bg-ds-accent/10 text-ds-accent' },
  enterprise: { label: 'Enterprise', className: 'bg-violet-500/10 text-violet-400' },
};

const ROLE_STYLES: Record<MemberRole, { label: string; icon: typeof Crown; className: string }> = {
  owner:    { label: 'Owner',    icon: Crown,     className: 'bg-amber-500/10 text-amber-400' },
  admin:    { label: 'Admin',    icon: Shield,    className: 'bg-ds-accent/10 text-ds-accent' },
  member:   { label: 'Member',   icon: UserCheck, className: 'bg-ds-hover text-ds-text2' },
  supplier: { label: 'Supplier', icon: Truck,     className: 'bg-emerald-500/10 text-emerald-400' },
};

const STATUS_STYLES: Record<string, { dot: string; label: string; text: string }> = {
  active:   { dot: 'bg-emerald-400', label: 'Active',   text: 'text-emerald-400' },
  invited:  { dot: 'bg-amber-400',   label: 'Invited',  text: 'text-amber-400'   },
  disabled: { dot: 'bg-ds-muted',    label: 'Disabled', text: 'text-ds-muted'    },
};

function Avatar({ name, email, size = 'md' }: { name?: string | null; email?: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : email?.slice(0, 2).toUpperCase() ?? '??';
  const sizeClass = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' }[size];
  return (
    <div className={`${sizeClass} rounded-full gradient-indigo flex items-center justify-center font-bold text-white flex-shrink-0 select-none shadow-accent-glow`}>
      {initials}
    </div>
  );
}

interface OrganizationSectionProps {
  onNavigate: (section: ActiveSection) => void;
}

export default function OrganizationSection({ onNavigate }: OrganizationSectionProps) {
  const { user, activeOrg, refreshUser } = useAuth();
  const [members, setMembers] = useState<OrganizationMemberWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const canEdit = activeOrg?.role === 'owner' || activeOrg?.role === 'admin';

  function startEditName() {
    setNameValue(user?.full_name ?? '');
    setNameError(null);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }

  function cancelEditName() {
    setEditingName(false);
    setNameError(null);
  }

  async function saveName() {
    if (!user) return;
    const trimmed = nameValue.trim();
    if (!trimmed) { setNameError('Name cannot be empty.'); return; }
    if (trimmed === user.full_name) { setEditingName(false); return; }
    setNameSaving(true);
    setNameError(null);
    try {
      await UserModel.update(user.id, { full_name: trimmed });
      await refreshUser();
      if (activeOrg) fetchMembers(activeOrg.id);
      setEditingName(false);
    } catch (err: any) {
      setNameError(err?.message ?? 'Failed to save name.');
    } finally {
      setNameSaving(false);
    }
  }

  function fetchMembers(orgId: string) {
    setLoading(true);
    setError(null);
    MemberModel.getAll(orgId)
      .then(setMembers)
      .catch(err => setError(err?.message ?? 'Failed to load members.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!activeOrg) return;
    fetchMembers(activeOrg.id);
  }, [activeOrg?.id]);

  if (!activeOrg) {
    return <EmptyState icon={<Building2 size={24} className="text-ds-muted" />} title="No organization found" description="You're not a member of any workspace yet." />;
  }

  const plan = PLAN_STYLES[activeOrg.plan] ?? PLAN_STYLES.free;
  const activeCount = members.filter(m => m.status === 'active').length;
  const invitedCount = members.filter(m => m.status === 'invited').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ds-text">Organization</h1>
        <p className="text-ds-muted text-sm mt-1">Manage your workspace, members, and billing.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-indigo flex items-center justify-center flex-shrink-0 shadow-accent-glow">
              <Building2 size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-ds-text">{activeOrg.name}</h2>
                <span className={`badge ${plan.className}`}>
                  <Sparkles size={10} className="mr-1" />{plan.label}
                </span>
                <span className={`badge ${activeOrg.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-ds-hover text-ds-muted'}`}>
                  {activeOrg.status === 'active' ? 'Active' : activeOrg.status}
                </span>
              </div>
              <p className="text-ds-muted text-sm mt-0.5 font-mono">/{activeOrg.slug}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-ds-surface2 rounded-xl p-3.5 border border-ds-borderSoft">
              <div className="flex items-center gap-1.5 text-ds-muted text-xs mb-2"><Hash size={11} /> Org ID</div>
              <p className="text-ds-text2 text-[11px] font-mono break-all leading-relaxed">{activeOrg.id}</p>
            </div>
            <div className="bg-ds-surface2 rounded-xl p-3.5 border border-ds-borderSoft">
              <div className="flex items-center gap-1.5 text-ds-muted text-xs mb-2"><Users size={11} /> Members</div>
              <p className="text-ds-text text-xl font-bold leading-tight">{members.length}</p>
              {invitedCount > 0 && <p className="text-amber-400 text-xs mt-1">{invitedCount} pending</p>}
            </div>
            <div className="bg-ds-surface2 rounded-xl p-3.5 border border-ds-borderSoft">
              <div className="flex items-center gap-1.5 text-ds-muted text-xs mb-2"><Calendar size={11} /> Created</div>
              <p className="text-ds-text2 text-xs font-medium">{formatDate(activeOrg.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6 flex flex-col">
          <p className="text-[10px] font-semibold text-ds-muted uppercase tracking-widest mb-4">Signed in as</p>
          <div className="flex items-center gap-3 mb-5">
            <Avatar name={user?.full_name} email={user?.email} size="lg" />
            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={nameInputRef}
                      value={nameValue}
                      onChange={e => setNameValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelEditName(); }}
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-sm font-semibold bg-ds-surface2 border border-ds-border rounded-lg text-ds-text placeholder-ds-muted focus:outline-none focus:ring-2 focus:ring-ds-accent/30 focus:border-ds-accent/60 transition"
                      placeholder="Your full name"
                      disabled={nameSaving}
                    />
                    <button onClick={saveName} disabled={nameSaving} className="p-1.5 rounded-lg bg-ds-accent hover:bg-ds-accentHover disabled:opacity-50 transition text-white">
                      {nameSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    </button>
                    <button onClick={cancelEditName} disabled={nameSaving} className="p-1.5 rounded-lg bg-ds-hover hover:bg-ds-border disabled:opacity-50 transition text-ds-text2">
                      <X size={13} />
                    </button>
                  </div>
                  {nameError && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle size={11} /> {nameError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group">
                  <p className="font-bold text-ds-text text-base leading-tight truncate">
                    {user?.full_name ?? 'No name set'}
                  </p>
                  {canEdit && (
                    <button onClick={startEditName} className="opacity-0 group-hover:opacity-100 transition p-1 rounded-md hover:bg-ds-hover text-ds-muted hover:text-ds-text2">
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
              )}
              <p className="text-ds-muted text-xs mt-0.5 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3 mt-auto pt-4 border-t border-ds-borderSoft">
            <div className="flex items-center justify-between">
              <span className="text-ds-muted text-xs">Role</span>
              {(() => {
                const R = ROLE_STYLES[activeOrg.role] ?? ROLE_STYLES.member;
                return (
                  <span className={`badge ${R.className}`}>
                    <R.icon size={11} className="mr-1" />{R.label}
                  </span>
                );
              })()}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ds-muted text-xs">Member since</span>
              <span className="text-ds-text2 text-xs font-medium">{formatDate(activeOrg.created_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ds-muted text-xs">Status</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-ds-borderSoft flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Users size={15} className="text-ds-muted" />
            <h2 className="font-semibold text-ds-text text-sm">Members</h2>
            <span className="px-2 py-0.5 bg-ds-hover text-ds-muted text-xs rounded-full font-medium">{members.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs text-ds-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> {activeCount} active
              </span>
              {invitedCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> {invitedCount} invited
                </span>
              )}
            </div>
            {canEdit && (
              <Button variant="primary" size="sm" onClick={() => onNavigate('members-add')}>
                <UserPlus size={13} /> Add Member
              </Button>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-ds-muted">
            <Loader2 size={17} className="animate-spin" />
            <span className="text-sm">Loading members…</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 mx-6 my-5 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
            <AlertCircle size={15} className="shrink-0" />{error}
          </div>
        )}
        {!loading && !error && members.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={28} className="text-ds-border mb-3" />
            <p className="text-ds-muted text-sm">No members yet.</p>
          </div>
        )}
        {!loading && !error && members.length > 0 && (
          <div>
            <div className="hidden sm:grid grid-cols-12 px-6 py-3 text-[10px] font-semibold text-ds-muted uppercase tracking-widest border-b border-ds-borderSoft bg-ds-surface2/40">
              <div className="col-span-5">Member</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Joined</div>
            </div>
            <div className="divide-y divide-ds-borderSoft">
              {members.map(member => {
                const role = ROLE_STYLES[member.role] ?? ROLE_STYLES.member;
                const RoleIcon = role.icon;
                const status = STATUS_STYLES[member.status] ?? STATUS_STYLES.active;
                const isMe = member.user_id === user?.id;
                return (
                  <div
                    key={member.id}
                    className={`grid grid-cols-12 items-center px-6 py-4 transition-colors ${
                      isMe ? 'bg-ds-accent/5 hover:bg-ds-accent/8' : 'hover:bg-ds-hover/50'
                    }`}
                  >
                    <div className="col-span-12 sm:col-span-5 flex items-center gap-3 mb-2 sm:mb-0">
                      <Avatar name={member.user?.full_name} email={member.user?.email} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-ds-text truncate">{member.user?.full_name ?? 'Unnamed'}</p>
                          {isMe && (
                            <span className="text-[10px] bg-ds-accent/10 text-ds-accent px-1.5 py-0.5 rounded font-semibold leading-none">you</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-ds-muted mt-0.5">
                          <Mail size={10} />
                          <span className="truncate">{member.user?.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <span className={`badge ${role.className}`}>
                        <RoleIcon size={11} className="mr-1" />{role.label}
                      </span>
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${status.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />{status.label}
                      </span>
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-right">
                      <div className="flex items-center justify-end gap-1 text-xs text-ds-muted">
                        <Clock size={10} />{formatDate(member.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
