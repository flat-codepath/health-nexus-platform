import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Tenant } from '@/types';

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isAuthenticated: boolean;
  activeBranchId: string | null;
  login: (user: User, tenant: Tenant, token: string) => void;
  logout: () => void;
  setActiveBranch: (branchId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      token: null,
      isAuthenticated: false,
      activeBranchId: null,
      login: (user, tenant, token) =>
        set({
          user,
          tenant,
          token,
          isAuthenticated: true,
          activeBranchId: user.branch_id || null,
        }),
      logout: () =>
        set({
          user: null,
          tenant: null,
          token: null,
          isAuthenticated: false,
          activeBranchId: null,
        }),
      setActiveBranch: (branchId) => set({ activeBranchId: branchId }),
    }),
    { name: 'hms-auth' }
  )
);
