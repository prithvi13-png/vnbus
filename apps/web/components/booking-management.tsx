"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bell, CheckCircle2, Download, Search, Ticket } from "lucide-react";
import type { BookingRecord } from "@vnbus/types";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
  StatusChip,
} from "@vnbus/ui";

import { getBookingHistory, listNotifications, markNotificationRead } from "../lib/api-client";
import { useInvoiceStore } from "../lib/invoice-store";
import { InvoiceDownloadButton } from "./invoice-download-button";

type HistoryFilter = "all" | "upcoming" | "past" | "cancelled";

export function BookingHistoryCenter({
  filter = "all",
}: {
  filter?: HistoryFilter;
}): React.JSX.Element {
  const query = useQuery({ queryKey: ["booking-history"], queryFn: getBookingHistory });
  const history = query.data?.bookings ?? [];
  const bookings = filterBookings(history, filter);
  const stats = getBookingStats(history);

  if (query.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (query.isError) {
    return (
      <EmptyState
        title="Bookings could not be loaded"
        description={query.error instanceof Error ? query.error.message : "Try again shortly."}
        actionLabel="Retry"
        onAction={() => void query.refetch()}
      />
    );
  }

  return (
    <div className="grid gap-5">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming Trips" value={`${stats.upcoming}`} />
        <StatCard label="Past Trips" value={`${stats.past}`} />
        <StatCard label="Cancelled Trips" value={`${stats.cancelled}`} />
        <StatCard label="Total Spend" value={`INR ${stats.total.toLocaleString("en-IN")}`} />
      </section>
      <div className="flex flex-wrap gap-2" aria-label="Booking history filters">
        {(
          [
            ["All", "/booking-history"],
            ["Upcoming", "/upcoming-trips"],
            ["Past", "/past-trips"],
            ["Cancelled", "/cancelled-trips"],
          ] satisfies Array<[string, string]>
        ).map(([label, href]) => (
          <Button key={href} asChild variant="outline" size="sm">
            <Link href={href}>{label}</Link>
          </Button>
        ))}
      </div>
      {bookings.length ? (
        <section className="grid gap-3">
          {bookings.map((booking) => (
            <BookingHistoryCard key={booking.bookingId} booking={booking} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="No bookings in this view"
          description="Bookings will appear here after confirmation."
          actionLabel="Search buses"
          onAction={() => {
            window.location.href = "/search";
          }}
        />
      )}
    </div>
  );
}

/** One entry per booking the operator has issued a ticket for. */
export function TicketListCenter(): React.JSX.Element {
  const query = useQuery({ queryKey: ["booking-history"], queryFn: getBookingHistory });
  const ticketed = (query.data?.bookings ?? []).filter(
    (booking) =>
      ["CONFIRMED", "TICKET_GENERATED"].includes(booking.status) && Boolean(booking.ticketNumber),
  );

  if (query.isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!ticketed.length) {
    return (
      <EmptyState
        title="No issued tickets"
        description="Confirmed bookings generate tickets automatically."
        actionLabel="Search buses"
        onAction={() => {
          window.location.href = "/search";
        }}
      />
    );
  }

  return (
    <section className="grid gap-3">
      {ticketed.map((booking) => (
        <Card key={booking.bookingId}>
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base">{booking.ticketNumber}</CardTitle>
                <StatusChip tone="success">PNR {booking.pnr ?? "pending"}</StatusChip>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {booking.trip.sourceCity} to {booking.trip.destinationCity} ·{" "}
                {booking.selectedSeats.join(", ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/ticket?bookingId=${booking.bookingId}`}>
                  <Ticket className="h-4 w-4" aria-hidden="true" />
                  View
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/download-ticket?bookingId=${booking.bookingId}`}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function InvoiceListCenter(): React.JSX.Element {
  const invoices = useInvoiceStore((state) => state.invoices);

  if (!invoices.length) {
    return (
      <EmptyState
        title="No invoices yet"
        description="Confirmed bookings generate uploaded invoices automatically."
        actionLabel="Search buses"
        onAction={() => {
          window.location.href = "/search";
        }}
      />
    );
  }

  return (
    <section className="grid gap-3">
      {invoices.map((invoice) => (
        <Card key={invoice.invoiceId}>
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base">{invoice.invoiceNumber}</CardTitle>
                <StatusChip tone={invoice.status === "DOWNLOADED" ? "info" : "success"}>
                  {invoice.status}
                </StatusChip>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {invoice.route} · {invoice.bookingReference}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{invoice.storagePath}</p>
            </div>
            <InvoiceDownloadButton invoice={invoice} />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function NotificationCenter(): React.JSX.Element {
  const query = useQuery({ queryKey: ["notifications"], queryFn: listNotifications });
  const notifications = query.data ?? [];

  async function read(notificationId: string): Promise<void> {
    await markNotificationRead(notificationId);
    await query.refetch();
  }

  if (query.isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!notifications.length) {
    return (
      <EmptyState
        title="No notifications"
        description="Booking updates, cancellation updates, and email history will appear here."
        actionLabel="View bookings"
        onAction={() => {
          window.location.href = "/booking-history";
        }}
      />
    );
  }

  return (
    <section className="grid gap-3">
      {notifications.map((notification) => (
        <Card key={notification.id}>
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-200">
                <Bell className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-gray-950 dark:text-gray-50">
                    {notification.title}
                  </h2>
                  <Badge variant={notification.readStatus === "UNREAD" ? "warning" : "neutral"}>
                    {notification.readStatus}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{notification.body}</p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTime(notification.createdAt)} ·{" "}
                  {notification.type.replaceAll("_", " ")}
                </p>
              </div>
            </div>
            {notification.readStatus === "UNREAD" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void read(notification.id)}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Mark Read
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function BookingHistoryCard({ booking }: { booking: BookingRecord }): React.JSX.Element {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="text-base font-semibold text-gold-600 dark:text-gold-200"
              href={`/booking-history/${booking.bookingId}`}
            >
              {booking.bookingReference}
            </Link>
            <StatusChip tone={statusToneForBooking(booking.status)}>
              {booking.status.replaceAll("_", " ")}
            </StatusChip>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {booking.trip.sourceCity} to {booking.trip.destinationCity} ·{" "}
            {formatDate(booking.trip.departureTime)}
          </p>
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-[420px]">
          <MiniMetric label="Seats" value={booking.selectedSeats.join(", ")} />
          <MiniMetric
            label="Amount"
            value={`INR ${booking.fare.grandTotal.amount.toLocaleString("en-IN")}`}
          />
          <div className="flex items-end">
            <div className="grid w-full gap-2">
              <Button asChild size="sm" className="w-full">
                <Link href={`/booking-history/${booking.bookingId}`}>
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Details
                </Link>
              </Button>
              <InvoiceDownloadButton booking={booking} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-md border border-gray-200 p-3 dark:border-gray-800">
      <p className="text-xs uppercase tracking-normal text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 font-medium text-gray-950 dark:text-gray-50">{value}</p>
    </div>
  );
}

function filterBookings(bookings: BookingRecord[], filter: HistoryFilter): BookingRecord[] {
  const now = Date.now();

  return bookings.filter((booking) => {
    if (filter === "upcoming") {
      return (
        Date.parse(booking.trip.departureTime) >= now &&
        !["CANCELLED", "EXPIRED", "FAILED"].includes(booking.status)
      );
    }
    if (filter === "past") {
      return Date.parse(booking.trip.departureTime) < now;
    }
    if (filter === "cancelled") {
      return ["CANCELLATION_REQUESTED", "CANCELLED", "REFUND_PENDING"].includes(booking.status);
    }

    return true;
  });
}

function getBookingStats(bookings: BookingRecord[]): {
  upcoming: number;
  past: number;
  cancelled: number;
  total: number;
} {
  return {
    upcoming: filterBookings(bookings, "upcoming").length,
    past: filterBookings(bookings, "past").length,
    cancelled: filterBookings(bookings, "cancelled").length,
    // What was actually sold; failed and cancelled bookings cost nothing.
    total: bookings
      .filter((booking) => ["CONFIRMED", "TICKET_GENERATED"].includes(booking.status))
      .reduce((sum, booking) => sum + booking.fare.grandTotal.amount, 0),
  };
}

function statusToneForBooking(
  status: BookingRecord["status"],
): "neutral" | "success" | "warning" | "danger" | "info" {
  if (status === "CONFIRMED" || status === "TICKET_GENERATED") {
    return "success";
  }
  if (status === "PENDING_PAYMENT" || status === "SEAT_HELD" || status === "REFUND_PENDING") {
    return "warning";
  }
  if (status === "CANCELLED" || status === "FAILED" || status === "EXPIRED") {
    return "danger";
  }
  if (status === "RESCHEDULED" || status === "CANCELLATION_REQUESTED") {
    return "info";
  }

  return "neutral";
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}
