import { Mail, Settings, Zap, ChevronRight, Building2, Plug, AlertTriangle, type LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export type ActiveSection = 'overview' | 'email' | 'organization' | 'integrations' | 'settings';

interface SidebarProps {
  activeSection: ActiveSection;
  onNavigate: (section: ActiveSection) => void;
}

const navItems: { id: ActiveSection; label: string; icon: LucideIcon }[] = [
  { id: 'email',         label: 'Email Templates', icon: Mail },
  { id: 'integrations',  label: 'Integrations',   icon: Plug },
  { id: 'organization',  label: 'Organization',    icon: Building2 },
  { id: 'settings',      label: 'Settings',        icon: Settings },
];

const MAINTENANCE_MESSAGE = 'We are currently performing scheduled maintenance. Some features may be unavailable.';

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const { user, activeOrg } = useAuth();

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0D1117] border-r border-ds-borderSoft flex flex-col z-50">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-ds-borderSoft">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-indigo flex items-center justify-center flex-shrink-0 shadow-accent-glow">
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <p className="text-ds-text font-bold text-sm leading-tight tracking-tight">Automn</p>
            <p className="text-ds-muted text-[11px] mt-0.5">E-commerce AI Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-ds-muted text-[10px] font-semibold uppercase tracking-widest px-2 mb-3">Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`sidebar-nav-item w-full ${isActive ? 'active' : 'inactive'}`}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight size={13} className="text-ds-accent opacity-70" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-ds-borderSoft space-y-3">
        {/* Org status pill */}
        {activeOrg && (
          activeOrg.is_under_maintenance ? (
            <div className="bg-amber-500/10 rounded-xl px-3.5 py-3 border border-amber-500/20">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                <span className="text-amber-400 text-[11px] font-semibold">Under Maintenance</span>
              </div>
              <p className="text-amber-400/70 text-[10px] leading-relaxed">{MAINTENANCE_MESSAGE}</p>
            </div>
          ) : (
            <div className="bg-ds-surface2 rounded-xl px-3.5 py-3 border border-ds-borderSoft">
              <div className="flex items-center justify-between">
                <span className="text-ds-muted text-[11px] font-medium">System Status</span>
                {activeOrg.status === 'suspended' ? (
                  <span className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    Suspended
                  </span>
                ) : activeOrg.status === 'inactive' ? (
                  <span className="flex items-center gap-1.5 text-[11px] text-ds-muted font-medium">
                    <span className="w-1.5 h-1.5 bg-ds-muted rounded-full" />
                    Inactive
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Active
                  </span>
                )}
              </div>
            </div>
          )
        )}

        {/* User */}
        <button
          onClick={() => onNavigate('organization')}
          className="flex items-center gap-3 w-full px-1 hover:opacity-80 transition-opacity text-left"
        >
          <div className="w-8 h-8 gradient-indigo rounded-full flex items-center justify-center flex-shrink-0 shadow-accent-glow">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ds-text text-xs font-medium truncate">{user?.full_name ?? 'My Account'}</p>
            <p className="text-ds-muted text-[11px] truncate">{user?.email ?? ''}</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
