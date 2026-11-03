import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../api/supabase';
import { fetchProfile } from '../api/profiles';
import { getErrorMessage } from '../lib/errors';
import type { Profile } from '../types/domain';

export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileError: string | null;
  isManager: boolean;
  isExecutor: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // 1. Следим за сессией
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // 2. Когда известен пользователь, грузим его профиль (там лежит роль)
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setProfileError(null);
      return;
    }
    let cancelled = false;
    setProfileError(null);
    fetchProfile(userId)
      .then((p) => {
        if (cancelled) return;
        if (p) setProfile(p);
        else setProfileError('Для этого пользователя не создан профиль. Обратитесь к администратору.');
      })
      .catch((e) => {
        if (!cancelled) setProfileError(getErrorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(
        error.message.toLowerCase().includes('invalid login')
          ? 'Неверный email или пароль'
          : error.message,
      );
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const currentProfile = profile && profile.id === userId ? profile : null;
    const loading = authLoading || (userId !== null && currentProfile === null && !profileError);
    return {
      user,
      profile: currentProfile,
      loading,
      profileError,
      isManager: currentProfile?.role === 'manager',
      isExecutor: currentProfile?.role === 'executor',
      signIn,
      signOut,
    };
  }, [user, userId, profile, authLoading, profileError, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
