"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BoardingDroppingPoint,
  BookingConfirmationResponse,
  BookingPassengerInput,
  BookingRecord,
  SeatLayoutDetails,
  TicketRecord,
} from "@vnbus/types";

import { useInvoiceStore } from "./invoice-store";

/**
 * The booking in progress: the bus, the chosen seats and points, and the
 * passengers, kept across page loads until the booking is made. Bookings,
 * tickets, timelines and notifications themselves are always read from the
 * API, never kept here.
 */
interface BookingState {
  layout: SeatLayoutDetails | null;
  selectedSeats: string[];
  boardingPoint: BoardingDroppingPoint | null;
  droppingPoint: BoardingDroppingPoint | null;
  passengers: BookingPassengerInput[];
  booking: BookingRecord | null;
  ticket: TicketRecord | null;
  setLayout: (layout: SeatLayoutDetails) => void;
  toggleSeat: (seatNumber: string, maxSeats: number) => void;
  clearSelection: () => void;
  setBoardingPoint: (point: BoardingDroppingPoint) => void;
  setDroppingPoint: (point: BoardingDroppingPoint) => void;
  setPassengers: (passengers: BookingPassengerInput[]) => void;
  setConfirmation: (confirmation: BookingConfirmationResponse) => void;
  resetFlow: () => void;
}

const emptyFlow = {
  layout: null,
  selectedSeats: [],
  boardingPoint: null,
  droppingPoint: null,
  passengers: [],
  booking: null,
  ticket: null,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...emptyFlow,
      setLayout: (layout) =>
        set((state) => {
          // A different bus starts a fresh selection: seats and points from the
          // last one are not on this one.
          if (state.layout?.tripId !== layout.tripId) {
            return {
              layout,
              selectedSeats: [],
              passengers: [],
              boardingPoint: layout.boardingPoints[0] ?? null,
              droppingPoint: layout.droppingPoints[0] ?? null,
              booking: null,
              ticket: null,
            };
          }

          return {
            layout,
            boardingPoint: state.boardingPoint ?? layout.boardingPoints[0] ?? null,
            droppingPoint: state.droppingPoint ?? layout.droppingPoints[0] ?? null,
          };
        }),
      toggleSeat: (seatNumber, maxSeats) =>
        set((state) => {
          const selected = state.selectedSeats.includes(seatNumber)
            ? state.selectedSeats.filter((seat) => seat !== seatNumber)
            : [...state.selectedSeats, seatNumber].slice(0, maxSeats);

          return { selectedSeats: selected, booking: null, ticket: null };
        }),
      clearSelection: () => set({ selectedSeats: [], booking: null, ticket: null }),
      setBoardingPoint: (point) => set({ boardingPoint: point }),
      setDroppingPoint: (point) => set({ droppingPoint: point }),
      setPassengers: (passengers) => set({ passengers }),
      setConfirmation: (confirmation) => {
        useInvoiceStore
          .getState()
          .ensureInvoiceForBooking(confirmation.booking, "CUSTOMER_BOOKING", "Booking flow");
        set({
          booking: confirmation.booking,
          ticket: confirmation.ticket,
          selectedSeats: [],
          passengers: [],
        });
      },
      resetFlow: () => set(emptyFlow),
    }),
    {
      name: "vnbus-booking-flow",
      partialize: (state) => ({
        layout: state.layout,
        selectedSeats: state.selectedSeats,
        boardingPoint: state.boardingPoint,
        droppingPoint: state.droppingPoint,
        passengers: state.passengers,
        booking: state.booking,
        ticket: state.ticket,
      }),
    },
  ),
);
