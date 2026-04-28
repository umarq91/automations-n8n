import { TrendingUp, Mail, ShoppingCart, ArrowUpRight, Activity, Clock, CheckCircle, AlertTriangle, Package, RefreshCw, Users } from 'lucide-react';
import type { ActiveSection } from '../../components/layout/Sidebar';

interface OverviewSectionProps {
  onNavigate: (section: ActiveSection) => void;
}

const stats = [
  {
    label: 'Emails Sent Today',
    value: '1,284',
    change: '+8.3%',
    positive: true,
    icon: Mail,
    gradient: 'gradient-indigo',
    sub: '98.1% delivery rate',
  },
  {
    label: 'Orders Processed',
    value: '486',
    change: '+23.1%',
    positive: true,
    icon: ShoppingCart,
    gradient: 'gradient-emerald',
    sub: 'Today vs. yesterday',
  },
  {
    label: 'Open Rate',
    value: '42.6%',
    change: '+3.2%',
    positive: true,
    icon: TrendingUp,
    gradient: 'gradient-amber',
    sub: 'Last 30-day campaign avg',
  },
  {
    label: 'Active Members',
    value: '8',
    change: '2 invited',
    positive: false,
    icon: Users,
    gradient: 'gradient-violet',
    sub: 'Across all workspaces',
  },
];

const recentActivity = [
  { icon: Mail,          color: 'bg-ds-accent/10 text-ds-accent',       label: 'Order confirmation sent',           meta: 'alice@techcorp.com',              time: '2m ago'  },
  { icon: CheckCircle,   color: 'bg-emerald-500/10 text-emerald-400',    label: 'Refund processed successfully',     meta: 'bob@startupxyz.com — $129.00',    time: '11m ago' },
  { icon: AlertTriangle, color: 'bg-amber-500/10 text-amber-400',        label: 'Payment failed — follow-up queued', meta: 'david@oldcorp.com',               time: '34m ago' },
  { icon: Package,       color: 'bg-blue-500/10 text-blue-400',          label: 'Shipment dispatched',               meta: 'Order #4471 — FedEx',             time: '1h ago'  },
  { icon: Users,         color: 'bg-violet-500/10 text-violet-400',      label: 'New member joined workspace',       meta: 'maria@fashionco.com',             time: '1h ago'  },
  { icon: RefreshCw,     color: 'bg-ds-hover text-ds-text2',             label: 'Return request received',           meta: 'carol@smallbiz.com — Order #4398',time: '2h ago'  },
];

const emailStats = [
  { label: 'Welcome Series',       sent: 3420,  open: 61.2, status: 'live' },
  { label: 'Abandoned Cart',       sent: 1184,  open: 48.7, status: 'live' },
  { label: 'Post-Purchase Follow', sent: 892,   open: 55.1, status: 'live' },
  { label: 'Win-Back Campaign',    sent: 0,     open: 0,    status: 'draft' },
];

export default function OverviewSection({ onNavigate }: OverviewSectionProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ds-text">Dashboard Overview</h1>
        <p className="text-ds-muted text-sm mt-1">April 15, 2026 — All systems operational</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon size={17} className="text-white" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  stat.positive ? 'chip-up' : 'chip-warn'
                }`}>
                  {stat.positive && <TrendingUp size={10} />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-ds-text mb-0.5">{stat.value}</p>
              <p className="text-sm font-medium text-ds-text2 mb-0.5">{stat.label}</p>
              <p className="text-xs text-ds-muted">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-ds-borderSoft flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-ds-muted" />
              <h2 className="font-semibold text-ds-text text-sm">Recent Activity</h2>
            </div>
            <span className="text-xs text-ds-muted">Live feed</span>
          </div>
          <div className="divide-y divide-ds-borderSoft">
            {recentActivity.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-ds-hover/40 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${item.color}`}>
                    <Icon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ds-text">{item.label}</p>
                    <p className="text-xs text-ds-muted mt-0.5 truncate">{item.meta}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-ds-muted flex-shrink-0 mt-0.5">
                    <Clock size={10} />
                    {item.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-ds-borderSoft flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-ds-muted" />
              <h2 className="font-semibold text-ds-text text-sm">Campaigns</h2>
            </div>
            <button
              onClick={() => onNavigate('email')}
              className="text-xs text-ds-accent hover:text-ds-accentHover font-medium flex items-center gap-0.5 transition-colors"
            >
              Manage <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="px-5 py-2 space-y-0.5">
            {emailStats.map((c) => (
              <div key={c.label} className="flex items-center gap-3 py-3 border-b border-ds-borderSoft last:border-0">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.status === 'live' ? 'bg-emerald-400' : 'bg-ds-muted'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ds-text2 truncate">{c.label}</p>
                  {c.status === 'live' ? (
                    <p className="text-xs text-ds-muted">{c.sent.toLocaleString()} sent · {c.open}% open</p>
                  ) : (
                    <p className="text-xs text-ds-muted">Draft</p>
                  )}
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  c.status === 'live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-ds-hover text-ds-muted'
                }`}>
                  {c.status === 'live' ? 'Live' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-ds-text2 text-xs uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'New Template',  icon: Mail,         section: 'email'         as ActiveSection, color: 'bg-ds-accent/10 text-ds-accent hover:bg-ds-accent/20' },
            { label: 'Organization',  icon: Users,        section: 'organization'  as ActiveSection, color: 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20' },
            { label: 'Settings',      icon: Activity,     section: 'settings'      as ActiveSection, color: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => onNavigate(action.section)}
                className={`flex flex-col items-center gap-2.5 p-5 rounded-xl transition-colors ${action.color}`}
              >
                <Icon size={19} />
                <span className="text-xs font-semibold">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
