import type { Metadata } from "next";

import { BookingHistoryCenter } from "../../components/booking-management";
import { DashboardShell } from "../../components/dashboard-shell";
import { PageHeader } from "../../components/page-header";

export const metadata: Metadata = {
  title: "Cancelled Trips",
};

export default function CancelledTripsPage(): React.JSX.Element {
  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Bookings"
        title="Cancelled Trips"
        description="Bookings you have cancelled, and where each refund stands."
        actionHref="/search"
        actionLabel="Search buses"
      />
      <BookingHistoryCenter filter="cancelled" />
    </DashboardShell>
  );
}
