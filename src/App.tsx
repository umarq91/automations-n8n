import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import { LogOut, Menu } from "lucide-react";
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
    signOut,
    loading,
  } = useAuth();
  const [activeSection, setActiveSection] =
    useState<ActiveSection>(readSectionFromUrl);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

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
                <NotificationBell />

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="w-7 h-7 rounded-full gradient-indigo flex items-center justify-center text-[11px] font-bold text-white select-none shadow-accent-glow hover:opacity-80 transition-opacity"
                  >
                    {initials}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-ds-surface2 border border-ds-border rounded-xl shadow-card overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-ds-borderSoft">
                        <p className="text-ds-text text-xs font-semibold truncate">{user?.full_name ?? 'My Account'}</p>
                        <p className="text-ds-muted text-[11px] truncate mt-0.5">{user?.email ?? ''}</p>
                      </div>
                      <button
                        onClick={() => { setProfileOpen(false); signOut(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-ds-text2 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <LogOut size={13} />
                        Sign out
                      </button>
                    </div>
                  )}
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
