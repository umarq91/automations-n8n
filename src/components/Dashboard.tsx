import EmailTemplatesSection from './EmailTemplatesSection';
import OrganizationSection from './OrganizationSection';
import IntegrationsSection from './IntegrationsSection';
import AIConfigSection from './AIConfigSection';
import ProductsSection from './products/ProductsSection';
import type { ActiveSection } from './Sidebar';

interface DashboardProps {
  activeSection: ActiveSection;
  editingProductId: string | null;
  onNavigate: (section: ActiveSection, productId?: string) => void;
}

function Dashboard({ activeSection, editingProductId, onNavigate }: DashboardProps) {
  return (
    <div>
      {activeSection === 'email'              && <EmailTemplatesSection />}
      {activeSection === 'ai-config'          && <AIConfigSection />}
      {activeSection === 'organization'       && <OrganizationSection />}
      {activeSection === 'integrations'       && <IntegrationsSection />}
      {activeSection === 'products-list'      && <ProductsSection subSection="list" onNavigate={onNavigate} />}
      {activeSection === 'products-add-item'  && <ProductsSection subSection="add-item" onNavigate={onNavigate} />}
      {activeSection === 'products-edit-item' && (
        <ProductsSection subSection="edit-item" editingProductId={editingProductId ?? undefined} onNavigate={onNavigate} />
      )}
    </div>
  );
}

export default Dashboard;
