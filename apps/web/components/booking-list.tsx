"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  type DataTableColumn,
} from "@vnbus/ui";

import { getBookingHistory } from "../lib/api-client";

const statusVariant = {
  CONFIRMED: "success",
  TICKET_GENERATED: "success",
  PENDING_PAYMENT: "warning",
  CANCELLATION_REQUESTED: "warning",
  CANCELLED: "danger",
  REFUND_PENDING: "warning",
  EXPIRED: "danger",
  FAILED: "danger",
  DRAFT: "neutral",
  SEAT_HELD: "warning",
  RESCHEDULED: "default",
} as const;

type BookingRow = Record<string, unknown> & {
  reference: string;
  route: string;
  date: string;
  status: keyof typeof statusVariant;
  amount: string;
  detailsHref?: string;
};

const columns: DataTableColumn<BookingRow>[] = [
  {
    id: "reference",
    header: "Reference",
    sortable: true,
    cell: (booking) =>
      booking.detailsHref ? (
        <Link className="font-medium text-gold-600 dark:text-gold-200" href={booking.detailsHref}>
          {booking.reference}
        </Link>
      ) : (
        booking.reference
      ),
  },
  { id: "route", header: "Route", sortable: true },
  { id: "date", header: "Date", sortable: true, hideOnMobile: true },
  {
    id: "status",
    header: "Status",
    sortable: true,
    cell: (booking) => (
      <Badge variant={statusVariant[booking.status]}>{booking.status.replace("_", " ")}</Badge>
    ),
  },
  { id: "amount", header: "Amount", sortable: true, align: "right" },
];

/** The signed-in user's bookings, newest first. */
export function BookingList(): React.JSX.Element {
  const query = useQuery({ queryKey: ["booking-history"], queryFn: getBookingHistory });
  const rows: BookingRow[] = (query.data?.bookings ?? []).map((booking) => ({
    reference: booking.bookingReference,
    route: `${booking.trip.sourceCity} to ${booking.trip.destinationCity}`,
    date: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
      new Date(booking.trip.departureTime),
    ),
    status: booking.status,
    amount: `INR ${booking.fare.grandTotal.amount.toLocaleString("en-IN")}`,
    detailsHref: `/booking-history/${booking.bookingId}`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={rows}
          rowId={(booking) => booking.reference}
          pageSize={5}
          emptyTitle="No bookings"
          emptyDescription="Your bookings will appear here."
        />
      </CardContent>
    </Card>
  );
}
