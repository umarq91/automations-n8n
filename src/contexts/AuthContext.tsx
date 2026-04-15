import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { upsertUserProfile, getUserProfile } from '../lib/supabase/users';
import type { User, OrganizationWithRole } from '../lib/supabase/types';
import { getUserOrganizations } from '../lib/supabase/organizations';

interface AuthState {
  session: Session | null;
  user: User | null;
  organizations: OrganizationWithRole[];
  activeOrg: OrganizationWithRole | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  setActiveOrg: (org: OrganizationWithRole) => void;
  refreshOrganizations: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    organizations: [],
    activeOrg: null,
    loading: true,
  });

  const loadUserData = useCallback(async (session: Session) => {
    const authUser = session.user;

    // Upsert profile — syncs auth.users → public.users on first login
    const profile = await upsertUserProfile({
      id: authUser.id,
      email: authUser.email!,
      full_name: authUser.user_metadata?.full_name ?? null,
      avatar_url: authUser.user_metadata?.avatar_url ?? null,
    });

    const orgs = await getUserOrganizations(authUser.id);

    setState(prev => ({
      ...prev,
      session,
      user: profile,
      organizations: orgs,
      activeOrg: orgs[0] ?? null,
      loading: false,
    }));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserData(session).catch(() => setState(prev => ({ ...prev, loading: false })));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUserData(session).catch(() => setState(prev => ({ ...prev, loading: false })));
      } else {
        setState({ session: null, user: null, organizations: [], activeOrg: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const setActiveOrg = (org: OrganizationWithRole) => {
    setState(prev => ({ ...prev, activeOrg: org }));
  };

  const refreshOrganizations = async () => {
    if (!state.session) return;
    const orgs = await getUserOrganizations(state.session.user.id);
    setState(prev => ({ ...prev, organizations: orgs, activeOrg: orgs[0] ?? null }));
  };

  const refreshUser = async () => {
    if (!state.session) return;
    const profile = await getUserProfile(state.session.user.id);
    if (profile) setState(prev => ({ ...prev, user: profile }));
  };

  return (
    <AuthContext.Provider value={{ ...state, signOut, setActiveOrg, refreshOrganizations, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
