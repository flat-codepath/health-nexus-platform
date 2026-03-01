import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Tenant } from '@/types';

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  activeBranchId: string | null;
  login: (tokens: { access: string; refresh: string }) => void;
  setUser: (user: User, tenant: Tenant | null) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  setActiveBranch: (branchId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      activeBranchId: null,
      login: (tokens) =>
        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          isAuthenticated: true,
        }),
      setUser: (user, tenant) =>
        set({
          user,
          tenant,
          activeBranchId: user.branch_id || null,
        }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () =>
        set({
          user: null,
          tenant: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          activeBranchId: null,
        }),
      setActiveBranch: (branchId) => set({ activeBranchId: branchId }),
    }),
    { name: 'hms-auth' }
  )
);
