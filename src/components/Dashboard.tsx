import EmailTemplatesSection from './EmailTemplatesSection';
import OrganizationSection from './OrganizationSection';
import IntegrationsSection from './IntegrationsSection';
import AIConfigSection from './AIConfigSection';
import ProductsSection from './products/ProductsSection';
import AddMemberPage from './members/AddMemberPage';
import type { ActiveSection } from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { canAccess } from '../lib/rbac';
import { ShieldX } from 'lucide-react';

interface DashboardProps {
  activeSection: ActiveSection;
  editingProductId: string | null;
  onNavigate: (section: ActiveSection, productId?: string) => void;
}

function Dashboard({ activeSection, editingProductId, onNavigate }: DashboardProps) {
  const { activeOrg } = useAuth();

  if (!canAccess(activeOrg?.role, activeSection)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-14 h-14 rounded-2xl bg-ds-surface2 border border-ds-border flex items-center justify-center mb-4">
          <ShieldX size={24} className="text-ds-muted" />
        </div>
        <p className="text-ds-text2 text-sm font-medium">Access denied</p>
        <p className="text-ds-muted text-xs mt-1">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      {activeSection === 'email'              && <EmailTemplatesSection />}
      {activeSection === 'ai-config'          && <AIConfigSection />}
      {activeSection === 'organization'       && <OrganizationSection onNavigate={onNavigate} />}
      {activeSection === 'integrations'       && <IntegrationsSection />}
      {activeSection === 'products-list'      && <ProductsSection subSection="list" onNavigate={onNavigate} />}
      {activeSection === 'products-add-item'  && <ProductsSection subSection="add-item" onNavigate={onNavigate} />}
      {activeSection === 'products-edit-item' && (
        <ProductsSection subSection="edit-item" editingProductId={editingProductId ?? undefined} onNavigate={onNavigate} />
      )}
      {activeSection === 'members-add' && (
        <div className="p-8 max-w-5xl mx-auto">
          <AddMemberPage onNavigate={onNavigate} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
