import EmailTemplatesSection from './EmailTemplatesSection';
import OrganizationSection from './OrganizationSection';
import IntegrationsSection from './IntegrationsSection';
import AIConfigSection from './AIConfigSection';
import ProductsSection from './products/ProductsSection';
import AddMemberPage from './members/AddMemberPage';
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
