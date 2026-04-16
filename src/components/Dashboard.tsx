import EmailTemplatesSection from './EmailTemplatesSection';
import OrganizationSection from './OrganizationSection';
import IntegrationsSection from './IntegrationsSection';
import AIConfigSection from './AIConfigSection';
import type { ActiveSection } from './Sidebar';

interface DashboardProps {
  activeSection: ActiveSection;
  onNavigate: (section: ActiveSection) => void;
}

function Dashboard({ activeSection, onNavigate: _onNavigate }: DashboardProps) {
  return (
    <div>
      {activeSection === 'email'         && <EmailTemplatesSection />}
      {activeSection === 'ai-config'     && <AIConfigSection />}
      {activeSection === 'organization'  && <OrganizationSection />}
      {activeSection === 'integrations'  && <IntegrationsSection />}
    </div>
  );
}

export default Dashboard;
