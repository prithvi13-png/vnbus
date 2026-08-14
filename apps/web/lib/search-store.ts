"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SearchFormValues } from "./search-schema";

interface SearchState {
  lastSearch: SearchFormValues;
  recentSearches: SearchFormValues[];
  favoriteRoutes: Array<{ sourceCity: string; destinationCity: string }>;
  setLastSearch: (value: SearchFormValues) => void;
  addRecentSearch: (value: SearchFormValues) => void;
  toggleFavoriteRoute: (route: { sourceCity: string; destinationCity: string }) => void;
}

const defaultSearch: SearchFormValues = {
  sourceCity: "Bangalore",
  destinationCity: "Hyderabad",
  journeyDate: new Date().toISOString().slice(0, 10),
  passengerCount: 1,
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      lastSearch: defaultSearch,
      recentSearches: [],
      favoriteRoutes: [
        { sourceCity: "Bangalore", destinationCity: "Hyderabad" },
        { sourceCity: "Chennai", destinationCity: "Coimbatore" },
      ],
      setLastSearch: (value) => set({ lastSearch: value }),
      addRecentSearch: (value) =>
        set((state) => {
          const key = toRouteKey(value);
          const next = [
            value,
            ...state.recentSearches.filter((search) => toRouteKey(search) !== key),
          ].slice(0, 5);

          return { lastSearch: value, recentSearches: next };
        }),
      toggleFavoriteRoute: (route) =>
        set((state) => {
          const key = `${route.sourceCity.toLowerCase()}-${route.destinationCity.toLowerCase()}`;
          const exists = state.favoriteRoutes.some(
            (favorite) =>
              `${favorite.sourceCity.toLowerCase()}-${favorite.destinationCity.toLowerCase()}` ===
              key,
          );

          return {
            favoriteRoutes: exists
              ? state.favoriteRoutes.filter(
                  (favorite) =>
                    `${favorite.sourceCity.toLowerCase()}-${favorite.destinationCity.toLowerCase()}` !==
                    key,
                )
              : [route, ...state.favoriteRoutes].slice(0, 8),
          };
        }),
    }),
    {
      name: "vnbus-search",
      partialize: (state) => ({
        favoriteRoutes: state.favoriteRoutes,
        lastSearch: state.lastSearch,
        recentSearches: state.recentSearches,
      }),
    },
  ),
);

function toRouteKey(search: SearchFormValues): string {
  return `${search.sourceCity.toLowerCase()}-${search.destinationCity.toLowerCase()}-${search.journeyDate}`;
}
