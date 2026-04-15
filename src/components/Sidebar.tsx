import { LayoutDashboard, Mail, Settings, Zap, ChevronRight, Building2, Plug, type LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export type ActiveSection = 'overview' | 'email' | 'organization' | 'integrations' | 'settings';

interface SidebarProps {
  activeSection: ActiveSection;
  onNavigate: (section: ActiveSection) => void;
}

const navItems: { id: ActiveSection; label: string; icon: LucideIcon }[] = [
  { id: 'overview',      label: 'Overview',       icon: LayoutDashboard },
  { id: 'email',         label: 'Email Templates', icon: Mail },
  { id: 'integrations',  label: 'Integrations',   icon: Plug },
  { id: 'organization',  label: 'Organization',    icon: Building2 },
  { id: 'settings',      label: 'Settings',        icon: Settings },
];

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const { user } = useAuth();

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
            <p className="text-ds-text font-bold text-sm leading-tight tracking-tight">AgentFlow</p>
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
        {/* System status pill */}
        <div className="bg-ds-surface2 rounded-xl px-3.5 py-3 border border-ds-borderSoft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-ds-muted text-[11px] font-medium">System Status</span>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-ds-muted">Emails today</span>
              <span className="text-ds-text2 font-medium">1,284</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-ds-muted">Delivery rate</span>
              <span className="text-emerald-400 font-medium">98.1%</span>
            </div>
          </div>
        </div>

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
