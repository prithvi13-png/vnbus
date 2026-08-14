import type { Metadata } from "next";

import { BookingHistoryCenter } from "../../components/booking-management";
import { DashboardShell } from "../../components/dashboard-shell";
import { PageHeader } from "../../components/page-header";

export const metadata: Metadata = {
  title: "Upcoming Trips",
};

export default function UpcomingTripsPage(): React.JSX.Element {
  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Bookings"
        title="Upcoming Trips"
        description="Future journeys with generated tickets, boarding points, and booking details."
        actionHref="/search"
        actionLabel="Search buses"
      />
      <BookingHistoryCenter filter="upcoming" />
    </DashboardShell>
  );
}
