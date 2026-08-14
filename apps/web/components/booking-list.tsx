"use client";

import Link from "next/link";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  type DataTableColumn,
} from "@vnbus/ui";

import { bookings } from "../lib/mock-data";
import { useBookingStore } from "../lib/booking-store";

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
        <Link className="font-medium text-blue-700 dark:text-blue-300" href={booking.detailsHref}>
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

export function BookingList(): React.JSX.Element {
  const history = useBookingStore((state) => state.history);
  const rows: BookingRow[] = [
    ...history.map((booking) => ({
      reference: booking.bookingReference,
      route: `${booking.trip.sourceCity} to ${booking.trip.destinationCity}`,
      date: booking.trip.departureTime.slice(0, 10),
      status: booking.status,
      amount: `INR ${booking.fare.grandTotal.amount.toLocaleString("en-IN")}`,
      detailsHref: `/booking-history/${booking.bookingId}`,
    })),
    ...bookings.map((booking) => ({
      ...booking,
      status: booking.status,
    })),
  ];

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
          emptyDescription="Recent platform bookings will appear here."
        />
      </CardContent>
    </Card>
  );
}
