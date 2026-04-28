import { useState, useEffect } from 'react';
import { Mail, Zap, ChevronRight, Building2, Plug, Bot, AlertTriangle, Package, PackagePlus, CreditCard, Activity, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { canAccess } from '../../lib/rbac';

export type ActiveSection = 'overview' | 'email' | 'organization' | 'integrations' | 'ai-config' | 'products-list' | 'products-add-item' | 'products-edit-item' | 'members-add' | 'credits' | 'logs';

interface SidebarProps {
  activeSection: ActiveSection;
  onNavigate: (section: ActiveSection) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems: { id: ActiveSection; label: string; icon: LucideIcon }[] = [
  { id: 'organization', label: 'Organization',      icon: Building2  },
  { id: 'email',        label: 'Email Templates',   icon: Mail       },
  { id: 'ai-config',   label: 'AI Settings',        icon: Bot        },
  { id: 'integrations', label: 'Integrations',      icon: Plug       },
  { id: 'credits',      label: 'Credits',            icon: CreditCard },
  { id: 'logs',         label: 'Logs & Monitoring',  icon: Activity   },
];

const MAINTENANCE_MESSAGE = 'We are currently performing scheduled maintenance. Some features may be unavailable.';

const productSubItems: { id: ActiveSection; label: string; icon: LucideIcon }[] = [
  { id: 'products-list',     label: 'Products',     icon: Package     },
  { id: 'products-add-item', label: 'List Product', icon: PackagePlus },
];

export default function Sidebar({ activeSection, onNavigate, isOpen = false, onClose }: SidebarProps) {
  const { user, activeOrg } = useAuth();
  const role = activeOrg?.role;
  const isProductsActive = activeSection.startsWith('products-');
  const [productsOpen, setProductsOpen] = useState(isProductsActive);

  useEffect(() => {
    if (isProductsActive) setProductsOpen(true);
  }, [isProductsActive]);

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '??';

  const visibleNavItems = navItems.filter((item) => canAccess(role, item.id));
  const visibleProductSubItems = productSubItems.filter((item) => canAccess(role, item.id));
  const showProductsGroup = visibleProductSubItems.length > 0;

  function handleNavigate(section: ActiveSection) {
    onNavigate(section);
    onClose?.();
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen w-60 bg-[#0D1117] border-r border-ds-borderSoft flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
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
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`sidebar-nav-item w-full ${isActive ? 'active' : 'inactive'}`}
              >
                <Icon size={16} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight size={13} className="text-ds-accent opacity-70" />}
              </button>
            );
          })}

          {showProductsGroup && (
            <>
              <button
                onClick={() => setProductsOpen((o) => !o)}
                className={`sidebar-nav-item w-full ${isProductsActive ? 'active' : 'inactive'}`}
              >
                <Package size={16} />
                <span className="flex-1 text-left">Products</span>
                <ChevronRight
                  size={13}
                  className={`text-ds-muted transition-transform duration-200 ${productsOpen ? 'rotate-90' : ''}`}
                />
              </button>
              {productsOpen && (
                <div className="ml-3 pl-3 border-l border-ds-borderSoft space-y-0.5 mt-0.5">
                  {visibleProductSubItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={`sidebar-nav-item w-full text-[13px] ${isActive ? 'active' : 'inactive'}`}
                      >
                        <Icon size={14} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {isActive && <ChevronRight size={12} className="text-ds-accent opacity-70" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 border-t border-ds-borderSoft space-y-3">
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
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />Suspended
                    </span>
                  ) : activeOrg.status === 'inactive' ? (
                    <span className="flex items-center gap-1.5 text-[11px] text-ds-muted font-medium">
                      <span className="w-1.5 h-1.5 bg-ds-muted rounded-full" />Inactive
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Active
                    </span>
                  )}
                </div>
              </div>
            )
          )}

          <button
            onClick={() => canAccess(role, 'organization') && handleNavigate('organization')}
            className={`flex items-center gap-3 w-full px-1 transition-opacity text-left ${canAccess(role, 'organization') ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
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
    </>
  );
}
