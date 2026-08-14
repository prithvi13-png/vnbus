import type { Metadata } from "next";

import { BookingList } from "../../../components/booking-list";
import { DashboardShell } from "../../../components/dashboard-shell";
import { PageHeader } from "../../../components/page-header";

export const metadata: Metadata = {
  title: "Customer Bookings",
};

export default function CustomerBookingsPage(): React.JSX.Element {
  return (
    <DashboardShell area="customer">
      <PageHeader
        eyebrow="Customer"
        title="Bookings"
        description="Upcoming and historical bookings for the signed-in traveller."
        actionHref="/search"
        actionLabel="Search buses"
      />
      <BookingList />
    </DashboardShell>
  );
}
