"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BoardingDroppingPoint,
  BookingConfirmationResponse,
  BookingPassengerInput,
  BookingRecord,
  BookingTimelineEvent,
  NotificationRecord,
  SeatHoldResponse,
  SeatLayoutDetails,
  TicketDownloadStatus,
  TicketRecord,
} from "@vnbus/types";

interface BookingState {
  layout: SeatLayoutDetails | null;
  selectedSeats: string[];
  boardingPoint: BoardingDroppingPoint | null;
  droppingPoint: BoardingDroppingPoint | null;
  hold: SeatHoldResponse | null;
  passengers: BookingPassengerInput[];
  booking: BookingRecord | null;
  ticket: TicketRecord | null;
  history: BookingRecord[];
  tickets: TicketRecord[];
  timeline: BookingTimelineEvent[];
  notifications: NotificationRecord[];
  downloadStatus: Record<string, TicketDownloadStatus>;
  setLayout: (layout: SeatLayoutDetails) => void;
  toggleSeat: (seatNumber: string, maxSeats: number) => void;
  clearSelection: () => void;
  setBoardingPoint: (point: BoardingDroppingPoint) => void;
  setDroppingPoint: (point: BoardingDroppingPoint) => void;
  setHold: (hold: SeatHoldResponse) => void;
  clearHold: () => void;
  setPassengers: (passengers: BookingPassengerInput[]) => void;
  setBooking: (booking: BookingRecord) => void;
  upsertBooking: (booking: BookingRecord) => void;
  setTicket: (ticket: TicketRecord) => void;
  setConfirmation: (confirmation: BookingConfirmationResponse) => void;
  setTimeline: (events: BookingTimelineEvent[]) => void;
  addTimeline: (events: BookingTimelineEvent[]) => void;
  setNotifications: (notifications: NotificationRecord[]) => void;
  addNotification: (notification: NotificationRecord) => void;
  markNotificationRead: (notificationId: string) => void;
  recordTicketDownload: (ticketId: string, status: TicketDownloadStatus) => void;
  resetFlow: () => void;
}

const emptyFlow = {
  layout: null,
  selectedSeats: [],
  boardingPoint: null,
  droppingPoint: null,
  hold: null,
  passengers: [],
  booking: null,
  ticket: null,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...emptyFlow,
      history: [],
      tickets: [],
      timeline: [],
      notifications: [],
      downloadStatus: {},
      setLayout: (layout) =>
        set((state) => ({
          layout,
          boardingPoint: state.boardingPoint ?? layout.boardingPoints[0] ?? null,
          droppingPoint: state.droppingPoint ?? layout.droppingPoints[0] ?? null,
        })),
      toggleSeat: (seatNumber, maxSeats) =>
        set((state) => {
          const selected = state.selectedSeats.includes(seatNumber)
            ? state.selectedSeats.filter((seat) => seat !== seatNumber)
            : [...state.selectedSeats, seatNumber].slice(0, maxSeats);

          return {
            selectedSeats: selected,
            hold: null,
            booking: null,
            ticket: null,
          };
        }),
      clearSelection: () => set({ selectedSeats: [], hold: null, booking: null, ticket: null }),
      setBoardingPoint: (point) => set({ boardingPoint: point }),
      setDroppingPoint: (point) => set({ droppingPoint: point }),
      setHold: (hold) => set({ hold }),
      clearHold: () => set({ hold: null, booking: null, ticket: null }),
      setPassengers: (passengers) => set({ passengers }),
      setBooking: (booking) => set({ booking }),
      upsertBooking: (booking) =>
        set((state) => ({
          booking: state.booking?.bookingId === booking.bookingId ? booking : state.booking,
          history: upsertById(state.history, booking, (item) => item.bookingId).slice(0, 25),
        })),
      setTicket: (ticket) =>
        set((state) => ({
          ticket,
          tickets: upsertById(state.tickets, ticket, (item) => item.ticketId).slice(0, 25),
        })),
      setConfirmation: (confirmation) =>
        set((state) => ({
          booking: confirmation.booking,
          ticket: confirmation.ticket,
          hold: null,
          history: upsertById(
            state.history,
            confirmation.booking,
            (booking) => booking.bookingId,
          ).slice(0, 25),
          tickets: upsertById(
            state.tickets,
            confirmation.ticket,
            (ticket) => ticket.ticketId,
          ).slice(0, 25),
          timeline: mergeTimeline(state.timeline, [
            createStoreTimelineEvent(
              confirmation.booking.bookingId,
              "PAYMENT_CONFIRMED",
              "Payment confirmed",
              "Mock payment accepted.",
              confirmation.booking.confirmedAt ?? confirmation.ticket.issuedAt,
              "success",
            ),
            createStoreTimelineEvent(
              confirmation.booking.bookingId,
              "TICKET_GENERATED",
              "Ticket generated",
              `Ticket ${confirmation.ticket.ticketNumber} is ready.`,
              confirmation.ticket.issuedAt,
              "success",
            ),
            createStoreTimelineEvent(
              confirmation.booking.bookingId,
              "EMAIL_SENT",
              "Email sent",
              "Booking confirmation email recorded by the mock queue.",
              confirmation.ticket.issuedAt,
              "info",
            ),
          ]),
          notifications: upsertById(
            state.notifications,
            createStoreNotification(
              "BOOKING_UPDATE",
              "Ticket generated",
              `Ticket ${confirmation.ticket.ticketNumber} is ready for ${confirmation.booking.bookingReference}.`,
              confirmation.booking.bookingId,
            ),
            (notification) => notification.id,
          ),
        })),
      setTimeline: (events) => set({ timeline: events }),
      addTimeline: (events) =>
        set((state) => ({
          timeline: [...state.timeline, ...events]
            .filter(
              (event, index, list) => list.findIndex((item) => item.id === event.id) === index,
            )
            .sort((left, right) => Date.parse(left.occurredAt) - Date.parse(right.occurredAt)),
        })),
      setNotifications: (notifications) => set({ notifications }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: upsertById(state.notifications, notification, (item) => item.id),
        })),
      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  readStatus: "READ",
                  readAt: new Date().toISOString(),
                }
              : notification,
          ),
        })),
      recordTicketDownload: (ticketId, status) =>
        set((state) => ({
          downloadStatus: {
            ...state.downloadStatus,
            [ticketId]: status,
          },
        })),
      resetFlow: () => set(emptyFlow),
    }),
    {
      name: "vnbus-booking-flow",
      partialize: (state) => ({
        layout: state.layout,
        selectedSeats: state.selectedSeats,
        boardingPoint: state.boardingPoint,
        droppingPoint: state.droppingPoint,
        hold: state.hold,
        passengers: state.passengers,
        booking: state.booking,
        ticket: state.ticket,
        history: state.history,
        tickets: state.tickets,
        timeline: state.timeline,
        notifications: state.notifications,
        downloadStatus: state.downloadStatus,
      }),
    },
  ),
);

function upsertById<T>(items: T[], next: T, getId: (item: T) => string): T[] {
  return [next, ...items.filter((item) => getId(item) !== getId(next))];
}

function mergeTimeline(
  current: BookingTimelineEvent[],
  next: BookingTimelineEvent[],
): BookingTimelineEvent[] {
  return [...current, ...next]
    .filter((event, index, list) => list.findIndex((item) => item.id === event.id) === index)
    .sort((left, right) => Date.parse(left.occurredAt) - Date.parse(right.occurredAt));
}

function createStoreTimelineEvent(
  bookingId: string,
  type: BookingTimelineEvent["type"],
  title: string,
  description: string,
  occurredAt: string,
  tone: BookingTimelineEvent["tone"],
): BookingTimelineEvent {
  return {
    id: createStoreId("TL", `${bookingId}|${type}|${occurredAt}`),
    bookingId,
    type,
    title,
    description,
    occurredAt,
    tone,
  };
}

function createStoreNotification(
  type: NotificationRecord["type"],
  title: string,
  body: string,
  bookingId: string,
): NotificationRecord {
  const createdAt = new Date().toISOString();

  return {
    id: createStoreId("NTF", `${type}|${title}|${bookingId}`),
    type,
    readStatus: "UNREAD",
    title,
    body,
    bookingId,
    createdAt,
    readAt: null,
  };
}

function createStoreId(prefix: string, value: string): string {
  const hash = [...value].reduce(
    (current, char) => (current * 31 + char.charCodeAt(0)) >>> 0,
    2166136261,
  );

  return `${prefix}-${hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8)}`;
}
