import { useEffect, useState } from "react";
import { Search, LogOut, ChevronDown, Building2 } from "lucide-react";
import Dashboard from "./components/Dashboard";
import Sidebar, { type ActiveSection } from "./components/Sidebar";
import LoginPage from "./components/auth/LoginPage";
import { useAuth } from "./contexts/AuthContext";

const VALID_SECTIONS: ActiveSection[] = [
  "overview",
  "email",
  "ai-config",
  "organization",
  "integrations",
];

function readSectionFromUrl(): ActiveSection {
  const params = new URLSearchParams(window.location.search);
  // Shopify OAuth callback — always land on integrations
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
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);

  // Write ?tab= into the URL whenever the active section changes
  const navigate = (section: ActiveSection) => {
    setActiveSection(section);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", section);
    window.history.pushState({}, "", url.toString());
  };

  // Seed the URL on first load if there's no ?tab= yet
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("tab")) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", activeSection);
      window.history.replaceState({}, "", url.toString());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep activeSection in sync with browser back / forward
  useEffect(() => {
    const onPop = () => setActiveSection(readSectionFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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
      <Sidebar activeSection={activeSection} onNavigate={navigate} />

      <div className="pl-60">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-ds-borderSoft bg-ds-bg/80 backdrop-blur-md">
          <div className="px-6 py-3.5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-sm font-semibold text-ds-text">Automn</h1>
                <p className="text-[11px] text-ds-muted mt-0.5">
                  E-commerce automation · templates · workflows
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Org switcher */}
                {organizations.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setOrgMenuOpen((v) => !v)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ds-surface border border-ds-border hover:bg-ds-hover transition text-xs text-ds-text2"
                    >
                      <Building2 size={13} className="text-ds-muted" />
                      <span className="max-w-[110px] truncate font-medium">
                        {activeOrg?.name ?? "No org"}
                      </span>
                      <ChevronDown size={12} className="text-ds-muted" />
                    </button>

                    {orgMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-ds-surface2 border border-ds-border rounded-xl shadow-card overflow-hidden z-50">
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
                            <span className="truncate font-medium">
                              {org.name}
                            </span>
                            <span className="text-ds-muted capitalize shrink-0">
                              {org.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Search */}
                <div className="hidden md:block relative w-[220px]">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ds-muted"
                  />
                  <input
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-ds-surface border border-ds-border text-xs text-ds-text2 placeholder:text-ds-muted focus:outline-none focus:ring-2 focus:ring-ds-accent/30 focus:border-ds-accent/50 transition"
                    placeholder="Search templates, workflows…"
                  />
                </div>

                {/* Avatar + sign out */}
                <div className="flex items-center gap-2">
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
        <main className="px-6 py-7 min-h-[calc(100vh-57px)]">
          <div className="max-w-7xl mx-auto">
            <Dashboard activeSection={activeSection} onNavigate={navigate} />
          </div>
        </main>
      </div>

      {orgMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOrgMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
