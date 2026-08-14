"use client";

import { create } from "zustand";

interface UiNotification {
  id: string;
  title: string;
  description: string;
  unread: boolean;
}

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  commandOpen: boolean;
  notifications: UiNotification[];
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
  markNotificationsRead: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  mobileNavOpen: false,
  commandOpen: false,
  notifications: [
    {
      id: "n1",
      title: "Ticket issued",
      description: "VNB-00010294 is ready.",
      unread: true,
    },
    {
      id: "n2",
      title: "Password changed",
      description: "Your account password was rotated.",
      unread: true,
    },
    {
      id: "n3",
      title: "Report ready",
      description: "Monthly revenue export is available.",
      unread: false,
    },
  ],
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  markNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        unread: false,
      })),
    })),
}));
