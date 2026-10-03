"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  CalendarClock,
  ClipboardList,
  Headphones,
  MapPin,
  ReceiptText,
  RotateCcw,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FadeIn,
  SlideUp,
  StatisticCard,
  Timeline,
  type StatisticCardProps,
} from "@vnbus/ui";

import { getBookingHistory, listNotifications } from "../lib/api-client";
import { useAuthStore } from "../lib/auth-store";
import { useSearchStore } from "../lib/search-store";
import { BookingList } from "./booking-list";
import { PageHeader } from "./page-header";
import { SearchPanel } from "./search-panel";

const customerFeatureLinks: Array<{
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}> = [
  {
    title: "Tickets",
    description: "Tickets the operators have issued for your bookings.",
    href: "/customer/tickets",
    icon: Ticket,
  },
  {
    title: "Invoices",
    description: "Tax invoices for your bookings.",
    href: "/customer/invoices",
    icon: ReceiptText,
  },
  {
    title: "Cancellations",
    description: "Bookings you have cancelled and their refund status.",
    href: "/cancelled-trips",
    icon: RotateCcw,
  },
  {
    title: "Support",
    description: "Contact us about a ticket, refund, or boarding point.",
    href: "/customer/support",
    icon: Headphones,
  },
];

export function CustomerDashboard(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const favoriteRoutes = useSearchStore((state) => state.favoriteRoutes);
  const history = useQuery({ queryKey: ["booking-history"], queryFn: getBookingHistory });
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: listNotifications });
  const bookings = history.data?.bookings ?? [];
  const upcomingTrips = bookings.filter(
    (booking) =>
      Date.parse(booking.trip.departureTime) >= Date.now() &&
      ["CONFIRMED", "TICKET_GENERATED"].includes(booking.status),
  );
  const unread = (notifications.data ?? []).filter(
    (notification) => notification.readStatus === "UNREAD",
  );
  const metrics: StatisticCardProps[] = [
    {
      label: "Upcoming trips",
      value: String(upcomingTrips.length),
      change: upcomingTrips[0]?.bookingReference ?? "None booked",
      icon: CalendarClock,
    },
    {
      label: "Bookings",
      value: String(bookings.length),
      change: "All time",
      icon: ClipboardList,
    },
    {
      label: "Saved routes",
      value: String(favoriteRoutes.length),
      change: "On this device",
      icon: MapPin,
    },
    {
      label: "Notifications",
      value: String(notifications.data?.length ?? 0),
      change: `${unread.length} unread`,
      icon: Bell,
    },
  ];

  return (
    <FadeIn>
      <PageHeader
        eyebrow="Customer"
        title="Customer Dashboard"
        description={
          user
            ? `Welcome back, ${user.firstName}. Your trips, bookings, and messages.`
            : "Your trips, bookings, and messages."
        }
        actionHref="/search"
        actionLabel="Search buses"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <SlideUp key={metric.label} transition={{ delay: index * 0.03, duration: 0.22 }}>
            <StatisticCard {...metric} />
          </SlideUp>
        ))}
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {customerFeatureLinks.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-lg border border-gold-100 bg-white/95 p-4 shadow-panel transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-premium dark:border-brand-800 dark:bg-brand-950/80"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-100 bg-gold-50 text-gold-700 transition-colors group-hover:bg-gold-500 group-hover:text-brand-950 dark:border-brand-800 dark:bg-gold-500/10 dark:text-gold-100">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-brand-950 dark:text-white">
                {link.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {link.description}
              </p>
            </Link>
          );
        })}
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid content-start gap-3">
          <h2 className="text-lg font-semibold text-brand-950 dark:text-white">Quick Search</h2>
          <SearchPanel compact />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Trips</CardTitle>
            <CardDescription>Confirmed journeys that have not departed yet.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTrips.length ? (
              <Timeline
                items={upcomingTrips.slice(0, 4).map((booking) => ({
                  id: booking.bookingId,
                  title: `${booking.trip.sourceCity} to ${booking.trip.destinationCity}`,
                  description: `${booking.trip.operatorName} · ${booking.trip.busType} · departs ${formatTime(
                    booking.trip.departureTime,
                  )}`,
                  timestamp: formatDate(booking.trip.departureTime),
                  tone: "success" as const,
                }))}
              />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No upcoming trips.</p>
            )}
          </CardContent>
        </Card>
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <BookingList />
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Updates about your bookings.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {(notifications.data ?? []).length ? (
              (notifications.data ?? []).slice(0, 4).map((notification) => (
                <div
                  key={notification.id}
                  className="flex gap-3 rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800"
                >
                  <Bell
                    className="mt-0.5 h-4 w-4 text-gold-600 dark:text-gold-200"
                    aria-hidden="true"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{notification.body}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No notifications yet.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </FadeIn>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}
