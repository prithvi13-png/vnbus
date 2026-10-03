"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPinned, ShieldCheck } from "lucide-react";
import type { AdminBookingListResponse } from "@vnbus/types";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Input,
  Skeleton,
  StatusChip,
  Textarea,
  type DataTableColumn,
} from "@vnbus/ui";

import { apiClient } from "../lib/api-client";
import { company } from "../lib/legal-content";

/*
 * Customer and admin pages for features that are not live yet. Each one says
 * so plainly instead of showing sample rows, and points at what does exist.
 */

export function PublicTrackingCenter(): React.JSX.Element {
  return (
    <section className="mx-auto grid max-w-3xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <NotYetAvailable
        icon={MapPinned}
        eyebrow="Tracking"
        title="Live bus tracking is coming soon"
        description="Bus operators do not share live locations with us yet. Your ticket has your boarding point, its address, and the departure time."
        actionHref="/booking-history"
        actionLabel="View my bookings"
      />
    </section>
  );
}

export function CustomerTrackingCenter(): React.JSX.Element {
  return (
    <FeatureLayout eyebrow="Tracking" title="Trip Tracking" description="Where your bus is.">
      <NotYetAvailable
        icon={MapPinned}
        eyebrow="Coming soon"
        title="Live bus tracking is coming soon"
        description="Bus operators do not share live locations with us yet. Your ticket has your boarding point, its address, and the departure time."
        actionHref="/upcoming-trips"
        actionLabel="View upcoming trips"
      />
    </FeatureLayout>
  );
}

export function CustomerRewardsCenter(): React.JSX.Element {
  return (
    <FeatureLayout eyebrow="Rewards" title="Wallet & Rewards" description="Credits and rewards.">
      <NotYetAvailable
        icon={ShieldCheck}
        eyebrow="Coming soon"
        title="There is no rewards programme yet"
        description="Wallet credits and rewards are not offered at the moment. Fares are charged as the operator prices them."
        actionHref="/search"
        actionLabel="Search buses"
      />
    </FeatureLayout>
  );
}

export function CustomerTravellersCenter(): React.JSX.Element {
  return (
    <FeatureLayout
      eyebrow="Travellers"
      title="Saved Travellers"
      description="People you book for often."
    >
      <NotYetAvailable
        icon={ShieldCheck}
        eyebrow="Coming soon"
        title="Saved travellers are not available yet"
        description="Enter each traveller's details when you book. They appear on that booking and its ticket."
        actionHref="/search"
        actionLabel="Search buses"
      />
    </FeatureLayout>
  );
}

/** Support by email, the channel that is staffed. */
export function CustomerSupportCenter(): React.JSX.Element {
  const [reference, setReference] = React.useState("");
  const [issue, setIssue] = React.useState("");
  const [message, setMessage] = React.useState("");
  const subject = [reference.trim(), issue.trim()].filter(Boolean).join(" — ") || "Support request";
  const mailto = `mailto:${company.supportEmail}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(message)}`;

  return (
    <FeatureLayout
      eyebrow="Support"
      title="Help and Support"
      description="Questions about a ticket, refund, invoice, or boarding point."
    >
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Write to us</CardTitle>
            <CardDescription>
              This opens your email app with the details filled in. Include your booking reference
              or PNR so we can find your booking.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Booking reference or PNR">
              <Input value={reference} onChange={(event) => setReference(event.target.value)} />
            </Field>
            <Field label="Issue">
              <Input
                placeholder="Ticket, invoice, refund, boarding point..."
                value={issue}
                onChange={(event) => setIssue(event.target.value)}
              />
            </Field>
            <Field label="Message">
              <Textarea value={message} onChange={(event) => setMessage(event.target.value)} />
            </Field>
            <Button asChild className="w-fit">
              <a href={mailto}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email support
              </a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <ContactRow label="Support email" value={company.supportEmail} />
            <ContactRow label="Grievance officer" value={company.grievanceOfficer.name} />
            <ContactRow label="Grievance email" value={company.grievanceOfficer.email} />
            <ContactRow label="Grievance phone" value={company.grievanceOfficer.phone} />
            <ContactRow label="Address" value={company.address} />
          </CardContent>
        </Card>
      </section>
    </FeatureLayout>
  );
}

export function AdminSupportOperations(): React.JSX.Element {
  return (
    <FeatureLayout
      eyebrow="Support"
      title="Support Operations"
      description="How support requests reach the team."
    >
      <NotYetAvailable
        icon={Mail}
        eyebrow="By email"
        title="No helpdesk is connected"
        description={`Support requests arrive by email at ${company.supportEmail}. They are not tracked in the admin portal yet.`}
        actionHref="/admin/bookings"
        actionLabel="Find a booking"
      />
    </FeatureLayout>
  );
}

type RefundRow = Record<string, unknown> & {
  id: string;
  reference: string;
  pnr: string;
  customer: string;
  route: string;
  amount: string;
  status: string;
  requestedAt: string;
};

const refundColumns: DataTableColumn<RefundRow>[] = [
  { id: "reference", header: "Booking", sortable: true },
  { id: "pnr", header: "PNR", sortable: true },
  { id: "customer", header: "Customer", sortable: true },
  { id: "route", header: "Route", hideOnMobile: true },
  { id: "amount", header: "Ticket value", align: "right" },
  {
    id: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <StatusChip tone="warning">{row.status.replaceAll("_", " ")}</StatusChip>,
  },
  { id: "requestedAt", header: "Requested", sortable: true, hideOnMobile: true },
];

/** Bookings whose cancellation is with the operator, so a refund is due. */
export function AdminRefundOperations(): React.JSX.Element {
  const query = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => apiClient<AdminBookingListResponse>("/admin/bookings?page=1&pageSize=100"),
  });
  const rows = (query.data?.bookings ?? [])
    .filter((record) =>
      ["CANCELLATION_REQUESTED", "CANCELLED", "REFUND_PENDING"].includes(record.booking.status),
    )
    .map((record): RefundRow => ({
      id: record.booking.bookingId,
      reference: record.booking.bookingReference,
      pnr: record.booking.pnr ?? "",
      customer: record.customerName,
      route: `${record.booking.trip.sourceCity} to ${record.booking.trip.destinationCity}`,
      amount: `INR ${record.booking.fare.grandTotal.amount.toLocaleString("en-IN")}`,
      status: record.booking.status,
      requestedAt: record.booking.cancelledAt
        ? new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
            timeZone: "Asia/Kolkata",
          }).format(new Date(record.booking.cancelledAt))
        : "",
    }));

  return (
    <FeatureLayout
      eyebrow="Refunds"
      title="Refund Operations"
      description="Cancelled bookings. The operator settles each cancellation; refunds follow its policy."
    >
      <Card>
        <CardContent className="p-4">
          {query.isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <DataTable
              columns={refundColumns}
              data={rows}
              rowId={(row) => row.id}
              pageSize={10}
              selectable={false}
              exportable
              exportFileName="admin-refunds"
              emptyTitle="No cancellations"
              emptyDescription="Cancelled bookings appear here."
            />
          )}
        </CardContent>
      </Card>
    </FeatureLayout>
  );
}

export function AdminTrustOperations(): React.JSX.Element {
  return (
    <FeatureLayout
      eyebrow="Trust"
      title="Trust Signals"
      description="Ratings and reviews of operators."
    >
      <NotYetAvailable
        icon={ShieldCheck}
        eyebrow="Not collected"
        title="No ratings or reviews yet"
        description="The bus supplier reports no operator ratings, and travellers cannot leave reviews yet, so there is nothing to moderate."
        actionHref="/admin/bookings"
        actionLabel="View bookings"
      />
    </FeatureLayout>
  );
}

function FeatureLayout({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}): React.JSX.Element {
  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-lg border border-gold-100 bg-white/95 p-5 shadow-panel dark:border-brand-800 dark:bg-brand-950/80 sm:p-6">
        <Badge variant="default">{eyebrow}</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal text-brand-950 dark:text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </section>
      {children}
    </div>
  );
}

function NotYetAvailable({
  actionHref,
  actionLabel,
  description,
  eyebrow,
  icon: Icon,
  title,
}: {
  actionHref: string;
  actionLabel: string;
  description: string;
  eyebrow: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  title: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-100">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <Badge variant="neutral" className="w-max">
          {eyebrow}
        </Badge>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ContactRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <p className="text-xs uppercase tracking-normal text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-gray-950 dark:text-gray-50">{value}</p>
    </div>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}): React.JSX.Element {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-gray-800 dark:text-gray-200">
      {label}
      {children}
    </label>
  );
}
