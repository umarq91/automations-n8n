import EmailTemplatesSection from './EmailTemplatesSection';
import OverviewSection from './OverviewSection';
import OrganizationSection from './OrganizationSection';
import IntegrationsSection from './IntegrationsSection';
import type { ActiveSection } from './Sidebar';

interface DashboardProps {
  activeSection: ActiveSection;
  onNavigate: (section: ActiveSection) => void;
}

function Dashboard({ activeSection, onNavigate }: DashboardProps) {
  return (
    <div>
      {activeSection === 'overview'      && <OverviewSection onNavigate={onNavigate} />}
      {activeSection === 'email'         && <EmailTemplatesSection />}
      {activeSection === 'organization'  && <OrganizationSection />}
      {activeSection === 'integrations'  && <IntegrationsSection />}

      {activeSection === 'settings' && (
        <div className="card p-8">
          <h1 className="text-xl font-bold text-ds-text">Settings</h1>
          <p className="text-ds-text2 text-sm mt-1.5">Workspace settings, senders, domains, and integrations — coming soon.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
