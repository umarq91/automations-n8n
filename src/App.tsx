import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { LogOut, ChevronDown, Building2, Menu } from "lucide-react";
import Dashboard from "./Dashboard";
import Sidebar, { type ActiveSection } from "./components/layout/Sidebar";
import LoginPage from "./components/auth/LoginPage";
import { useAuth } from "./contexts/AuthContext";
import { canAccess, getDefaultSection } from "./lib/rbac";
import NotificationBell from "./components/shared/NotificationBell";

const VALID_SECTIONS: ActiveSection[] = [
  "overview",
  "email",
  "ai-config",
  "organization",
  "integrations",
  "products-list",
  "products-add-item",
  "products-edit-item",
  "members-add",
  "logs",
];

function readSectionFromUrl(): ActiveSection {
  const params = new URLSearchParams(window.location.search);
  if (params.get("shopify_connected") || params.get("shopify_error"))
    return "integrations";
  const tab = params.get("tab") as ActiveSection;
  return VALID_SECTIONS.includes(tab) ? tab : "organization";
}

function App() {
  const {
    session,
    user,
    activeOrg,
    organizations,
    setActiveOrg,
    signOut,
    loading,
  } = useAuth();
  const [activeSection, setActiveSection] =
    useState<ActiveSection>(readSectionFromUrl);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = activeOrg?.role;

  const navigate = (section: ActiveSection, productId?: string) => {
    const target = canAccess(role, section) ? section : getDefaultSection(role);
    setActiveSection(target);
    if (productId !== undefined) setEditingProductId(productId);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", target);
    window.history.pushState({}, "", url.toString());
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (!role) return;
    if (!canAccess(role, activeSection)) {
      const fallback = getDefaultSection(role);
      setActiveSection(fallback);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", fallback);
      window.history.replaceState({}, "", url.toString());
    }
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("tab")) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", activeSection);
      window.history.replaceState({}, "", url.toString());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', sidebarOpen);
    return () => document.body.classList.remove('overflow-hidden');
  }, [sidebarOpen]);

  useEffect(() => {
    const onPop = () => {
      const section = readSectionFromUrl();
      const target = canAccess(role, section) ? section : getDefaultSection(role);
      setActiveSection(target);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ds-bg flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-ds-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() ?? "??");

  return (
    <div className="min-h-screen bg-ds-bg text-ds-text">
      <Sidebar
        activeSection={activeSection}
        onNavigate={navigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-60">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-ds-borderSoft bg-ds-bg/80 backdrop-blur-md">
          <div className="px-4 sm:px-6 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Hamburger — mobile only */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-ds-surface border border-ds-border hover:bg-ds-hover transition text-ds-muted hover:text-ds-text2"
                  aria-label="Open menu"
                >
                  <Menu size={16} />
                </button>
                <div className="hidden sm:block">
                  <h1 className="text-sm font-semibold text-ds-text">Automn</h1>
                  <p className="text-[11px] text-ds-muted mt-0.5 hidden md:block">
                    E-commerce automation · templates · workflows
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Org switcher */}
                {organizations.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setOrgMenuOpen((v) => !v)}
                      className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-ds-surface border border-ds-border hover:bg-ds-hover transition text-xs text-ds-text2"
                    >
                      <Building2 size={13} className="text-ds-muted shrink-0" />
                      <span className="hidden sm:inline max-w-[110px] truncate font-medium">
                        {activeOrg?.name ?? "No org"}
                      </span>
                      <ChevronDown size={12} className="text-ds-muted shrink-0" />
                    </button>

                    {orgMenuOpen && (
                      <div className="fixed top-[57px] left-2 right-2 z-50 bg-ds-surface2 border border-ds-border rounded-xl shadow-card overflow-hidden sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-52 sm:max-w-[calc(100vw-1rem)]">
                        {organizations.map((org) => (
                          <button
                            key={org.id}
                            onClick={() => {
                              setActiveOrg(org);
                              setOrgMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs transition flex items-center justify-between gap-2 ${
                              org.id === activeOrg?.id
                                ? "bg-ds-accent/10 text-ds-accent"
                                : "text-ds-text2 hover:bg-ds-hover"
                            }`}
                          >
                            <span className="truncate font-medium">{org.name}</span>
                            <span className="text-ds-muted capitalize shrink-0">{org.role}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <NotificationBell />

                {/* Avatar + sign out */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-7 h-7 rounded-full gradient-indigo flex items-center justify-center text-[11px] font-bold text-white select-none shadow-accent-glow">
                    {initials}
                  </div>
                  <button
                    onClick={signOut}
                    title="Sign out"
                    className="p-2 rounded-xl bg-ds-surface border border-ds-border hover:bg-red-500/10 hover:border-red-500/20 transition group"
                  >
                    <LogOut
                      size={14}
                      className="text-ds-muted group-hover:text-red-400 transition-colors"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="px-4 sm:px-6 py-5 sm:py-7 min-h-[calc(100vh-57px)]">
          <div className="max-w-7xl mx-auto">
            <Dashboard activeSection={activeSection} editingProductId={editingProductId} onNavigate={navigate} />
          </div>
        </main>
      </div>

      {orgMenuOpen && (
        <div
          className="fixed inset-0 z-40 sm:bg-transparent bg-black/30"
          onClick={() => setOrgMenuOpen(false)}
        />
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#111823', border: '1px solid #263244', color: '#E6EDF3' },
        }}
      />
    </div>
  );
}

export default App;
