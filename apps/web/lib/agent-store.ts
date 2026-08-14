"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AgentBookingListQuery,
  AgentCustomerListQuery,
  AgentCustomerRecord,
  BusSearchRequest,
} from "@vnbus/types";

interface AgentState {
  customerFilters: AgentCustomerListQuery;
  bookingFilters: AgentBookingListQuery;
  recentCustomers: AgentCustomerRecord[];
  recentSearches: BusSearchRequest[];
  setCustomerFilters: (filters: AgentCustomerListQuery) => void;
  setBookingFilters: (filters: AgentBookingListQuery) => void;
  addRecentCustomer: (customer: AgentCustomerRecord) => void;
  addRecentSearch: (search: BusSearchRequest) => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      customerFilters: {},
      bookingFilters: {},
      recentCustomers: [],
      recentSearches: [],
      setCustomerFilters: (filters) => set({ customerFilters: filters }),
      setBookingFilters: (filters) => set({ bookingFilters: filters }),
      addRecentCustomer: (customer) =>
        set((state) => ({
          recentCustomers: [
            customer,
            ...state.recentCustomers.filter((item) => item.customerId !== customer.customerId),
          ].slice(0, 8),
        })),
      addRecentSearch: (search) =>
        set((state) => ({
          recentSearches: [
            search,
            ...state.recentSearches.filter(
              (item) =>
                `${item.sourceCity}|${item.destinationCity}|${item.journeyDate}` !==
                `${search.sourceCity}|${search.destinationCity}|${search.journeyDate}`,
            ),
          ].slice(0, 8),
        })),
    }),
    {
      name: "vnbus-agent-portal",
    },
  ),
);
