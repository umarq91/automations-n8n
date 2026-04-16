import EmailTemplatesSection from './EmailTemplatesSection';
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
      {activeSection === 'email'         && <EmailTemplatesSection />}
      {activeSection === 'organization'  && <OrganizationSection />}
      {activeSection === 'integrations'  && <IntegrationsSection />}

      {activeSection === 'settings' && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-ds-text">Settings</h1>
            <p className="text-ds-text2 text-sm mt-1">Manage your workspace preferences and configuration.</p>
          </div>

          <div className="card p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-indigo flex items-center justify-center shadow-accent-glow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" opacity=".2"/><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <p className="text-ds-text font-semibold text-base">Coming Soon</p>
            </div>
            <span className="badge bg-ds-accent/10 text-ds-accent border border-ds-accent/20 text-xs px-3 py-1 rounded-full">In Development</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
