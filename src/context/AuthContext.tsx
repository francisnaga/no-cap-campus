import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/game.ts';
import { api } from '../lib/api.ts';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: { nickname?: string; avatarKey?: string; department?: string; level?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nocap_user_session_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initAuth = async () => {
    try {
      setLoading(true);
      const savedUserId = localStorage.getItem(LOCAL_STORAGE_KEY) || undefined;
      const res = await api.authGuest({ userId: savedUserId });
      setUser(res.user);
      localStorage.setItem(LOCAL_STORAGE_KEY, res.user.userId);
    } catch (err: any) {
      console.error('Failed to init guest auth:', err);
      setError(err.message || 'Auth initialization error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const updateProfile = async (data: { nickname?: string; avatarKey?: string; department?: string; level?: string }) => {
    if (!user) return;
    try {
      const res = await api.updateProfile({
        userId: user.userId,
        ...data,
      });
      setUser(res.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await api.getProfile(user.userId);
      setUser(res.user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
