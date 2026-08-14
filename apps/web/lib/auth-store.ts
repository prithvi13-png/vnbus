"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@vnbus/types";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: UserRole;
  roles: UserRole[];
  permissions: string[];
  status: string;
  emailVerified: boolean;
  forcePasswordChange: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  hasHydrated: boolean;
  sessionExpired: boolean;
  setSession: (response: AuthResponse) => void;
  updateUser: (user: AuthUser) => void;
  clearSession: () => void;
  markSessionExpired: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      hasHydrated: false,
      sessionExpired: false,
      setSession: (response) =>
        set({
          accessToken: response.accessToken,
          user: response.user,
          sessionExpired: false,
        }),
      updateUser: (user) => set({ user }),
      clearSession: () => set({ accessToken: null, user: null, sessionExpired: false }),
      markSessionExpired: () => set({ accessToken: null, user: null, sessionExpired: true }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "vnbus-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      skipHydration: true,
    },
  ),
);
