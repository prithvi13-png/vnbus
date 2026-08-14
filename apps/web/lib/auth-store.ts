"use client";

import { create } from "zustand";
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
  sessionExpired: boolean;
  setSession: (response: AuthResponse) => void;
  updateUser: (user: AuthUser) => void;
  clearSession: () => void;
  markSessionExpired: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  sessionExpired: false,
  setSession: (response) =>
    set({
      accessToken: response.accessToken,
      user: response.user,
      sessionExpired: false,
    }),
  updateUser: (user) => set({ user }),
  clearSession: () => set({ accessToken: null, user: null, sessionExpired: false }),
  markSessionExpired: () => set({ accessToken: null, sessionExpired: true }),
}));
