import type { Metadata } from "next";

import { BookingHistoryCenter } from "../../components/booking-management";
import { DashboardShell } from "../../components/dashboard-shell";
import { PageHeader } from "../../components/page-header";

export const metadata: Metadata = {
  title: "Past Trips",
};

export default function PastTripsPage(): React.JSX.Element {
  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Bookings"
        title="Past Trips"
        description="Completed journey records retained in customer booking history."
        actionHref="/search"
        actionLabel="Search buses"
      />
      <BookingHistoryCenter filter="past" />
    </DashboardShell>
  );
}
