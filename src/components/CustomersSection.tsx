import { useState } from 'react';
import { Plus, Trash2, Search, ChevronDown, Mail, Edit3, MoreVertical, UserPlus, X, Check, Star, ShoppingCart, TrendingUp } from 'lucide-react';
import SendEmailModal from './SendEmailModal';

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'active' | 'inactive' | 'at-risk';
  joinDate: string;
  tier: 'basic' | 'pro' | 'enterprise';
  totalSpend: number;
  orders: number;
  businessType: string;
  avatar: string;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@techcorp.com',
    company: 'TechCorp Inc',
    status: 'active',
    joinDate: '2024-01-15',
    tier: 'enterprise',
    totalSpend: 48920,
    orders: 127,
    businessType: 'Electronics Retailer',
    avatar: 'AJ',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@startupxyz.com',
    company: 'StartupXYZ',
    status: 'active',
    joinDate: '2024-02-20',
    tier: 'pro',
    totalSpend: 12480,
    orders: 43,
    businessType: 'Dropshipper',
    avatar: 'BS',
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@smallbiz.com',
    company: 'Small Business Co',
    status: 'active',
    joinDate: '2024-03-10',
    tier: 'basic',
    totalSpend: 3210,
    orders: 18,
    businessType: 'Boutique Owner',
    avatar: 'CD',
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@oldcorp.com',
    company: 'Old Corporation',
    status: 'at-risk',
    joinDate: '2023-06-05',
    tier: 'basic',
    totalSpend: 980,
    orders: 7,
    businessType: 'Reseller',
    avatar: 'DW',
  },
  {
    id: '5',
    name: 'Maria Santos',
    email: 'maria@fashionco.com',
    company: 'FashionCo',
    status: 'active',
    joinDate: '2024-04-01',
    tier: 'pro',
    totalSpend: 22100,
    orders: 89,
    businessType: 'Fashion Marketplace',
    avatar: 'MS',
  },
  {
    id: '6',
    name: 'James Park',
    email: 'james@luxegoods.io',
    company: 'LuxeGoods',
    status: 'active',
    joinDate: '2023-11-12',
    tier: 'enterprise',
    totalSpend: 91200,
    orders: 204,
    businessType: 'Luxury Goods Retailer',
    avatar: 'JP',
  },
  {
    id: '7',
    name: 'Emma Thompson',
    email: 'emma@subboxco.com',
    company: 'SubBox Co',
    status: 'inactive',
    joinDate: '2023-08-30',
    tier: 'pro',
    totalSpend: 6700,
    orders: 24,
    businessType: 'Subscription Box',
    avatar: 'ET',
  },
  {
    id: '8',
    name: 'Raj Patel',
    email: 'raj@wholesale247.com',
    company: 'Wholesale 247',
    status: 'active',
    joinDate: '2024-01-03',
    tier: 'enterprise',
    totalSpend: 134500,
    orders: 312,
    businessType: 'B2B Wholesale',
    avatar: 'RP',
  },
];

const TIER_STYLES: Record<string, { badge: string; dot: string }> = {
  enterprise: { badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  pro: { badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  basic: { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-500',
  'at-risk': 'bg-amber-100 text-amber-700',
};

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-pink-500', 'bg-emerald-500',
  'bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500',
];

export default function CustomersSection() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [emailTarget, setEmailTarget] = useState<{ email: string; name: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: '', email: '', company: '', tier: 'basic' as Customer['tier'], businessType: '',
  });

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'All' || c.tier === tierFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomer.name && newCustomer.email && newCustomer.company) {
      const c: Customer = {
        id: String(Date.now()),
        ...newCustomer,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        totalSpend: 0,
        orders: 0,
        avatar: newCustomer.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      };
      setCustomers([c, ...customers]);
      setNewCustomer({ name: '', email: '', company: '', tier: 'basic', businessType: '' });
      setShowAddForm(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDelete = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {customers.length} total · {customers.filter((c) => c.status === 'active').length} active
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            <UserPlus size={16} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-800">New Customer</h3>
            <button onClick={() => setShowAddForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleAdd}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              <div>
                <label className="label">Full Name</label>
                <input type="text" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} className="input" placeholder="Jane Doe" required />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} className="input" placeholder="jane@company.com" required />
              </div>
              <div>
                <label className="label">Company</label>
                <input type="text" value={newCustomer.company} onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })} className="input" placeholder="Company Name" required />
              </div>
              <div>
                <label className="label">Business Type</label>
                <input type="text" value={newCustomer.businessType} onChange={(e) => setNewCustomer({ ...newCustomer, businessType: e.target.value })} className="input" placeholder="e.g. Dropshipper, Retailer" />
              </div>
              <div>
                <label className="label">Tier</label>
                <select value={newCustomer.tier} onChange={(e) => setNewCustomer({ ...newCustomer, tier: e.target.value as Customer['tier'] })} className="input">
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {saved ? <><Check size={15} /> Added!</> : <><Plus size={15} /> Add Customer</>}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="input w-auto">
          <option value="All">All Tiers</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="at-risk">At Risk</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Business Type</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tier</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Orders</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Total Spend</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length > 0 ? (
                filtered.map((customer, idx) => (
                  <>
                    <tr
                      key={customer.id}
                      className={`hover:bg-slate-50/60 transition-colors ${expandedId === customer.id ? 'bg-indigo-50/30' : ''}`}
                    >
                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                            {customer.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{customer.name}</p>
                            <p className="text-xs text-slate-400">{customer.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Business Type */}
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-slate-600 text-xs">{customer.businessType || customer.company}</p>
                      </td>

                      {/* Tier */}
                      <td className="px-5 py-4">
                        <span className={`badge ${TIER_STYLES[customer.tier].badge}`}>
                          {customer.tier === 'enterprise' && <Star size={10} className="mr-1" />}
                          {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)}
                        </span>
                      </td>

                      {/* Orders */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <ShoppingCart size={13} className="text-slate-400" />
                          <span className="font-medium">{customer.orders}</span>
                        </div>
                      </td>

                      {/* Total Spend */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-slate-700 font-semibold">
                          <TrendingUp size={13} className="text-emerald-500" />
                          ${customer.totalSpend.toLocaleString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`badge ${STATUS_STYLES[customer.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${customer.status === 'active' ? 'bg-emerald-500' : customer.status === 'at-risk' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                          {customer.status === 'at-risk' ? 'At Risk' : customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {/* Send Email */}
                          <button
                            onClick={() => setEmailTarget({ email: customer.email, name: customer.name })}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-semibold"
                            title="Send Email"
                          >
                            <Mail size={13} />
                            Email
                          </button>
                          {/* Expand */}
                          <button
                            onClick={() => setExpandedId(expandedId === customer.id ? null : customer.id)}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
                          >
                            <ChevronDown size={15} className={`transition-transform ${expandedId === customer.id ? 'rotate-180' : ''}`} />
                          </button>
                          {/* More */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                              className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
                            >
                              <MoreVertical size={15} />
                            </button>
                            {openMenuId === customer.id && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-fade-in">
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                  <Edit3 size={13} /> Edit Customer
                                </button>
                                <button
                                  onClick={() => handleDelete(customer.id)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-500 hover:bg-rose-50"
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail */}
                    {expandedId === customer.id && (
                      <tr key={`${customer.id}-expanded`}>
                        <td colSpan={7} className="px-5 pb-5 bg-indigo-50/20">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            <div className="bg-white rounded-xl border border-slate-100 p-4">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">AI Agent Config</p>
                              <div className="space-y-2 text-xs text-slate-600">
                                <div className="flex justify-between"><span>Model</span><span className="font-medium text-slate-800">GPT-4 Turbo</span></div>
                                <div className="flex justify-between"><span>Temperature</span><span className="font-medium text-slate-800">0.7</span></div>
                                <div className="flex justify-between"><span>Max Tokens</span><span className="font-medium text-slate-800">2,000</span></div>
                                <div className="flex justify-between"><span>Language</span><span className="font-medium text-slate-800">English</span></div>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-100 p-4">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Workflow Status</p>
                              <div className="space-y-2">
                                {['Order Processing', 'Email Handler', 'Support Agent'].map((wf) => (
                                  <div key={wf} className="flex items-center gap-2 text-xs">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                    <span className="text-slate-600">{wf}</span>
                                    <span className="ml-auto text-emerald-600 font-medium">Active</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-100 p-4">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Account Details</p>
                              <div className="space-y-2 text-xs text-slate-600">
                                <div className="flex justify-between"><span>Joined</span><span className="font-medium text-slate-800">{customer.joinDate}</span></div>
                                <div className="flex justify-between"><span>Company</span><span className="font-medium text-slate-800 truncate max-w-[120px]">{customer.company}</span></div>
                                <div className="flex justify-between"><span>Avg Order</span><span className="font-medium text-slate-800">${customer.orders > 0 ? Math.round(customer.totalSpend / customer.orders).toLocaleString() : 0}</span></div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Search size={32} className="mx-auto mb-3 text-slate-200" />
                    <p className="font-medium text-slate-400">No customers found</p>
                    <p className="text-xs text-slate-300 mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Email Modal */}
      {emailTarget && (
        <SendEmailModal
          toEmail={emailTarget.email}
          toName={emailTarget.name}
          onClose={() => setEmailTarget(null)}
        />
      )}

      {/* Close dropdown on outside click */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}
