import type { Metadata } from "next";

import { BookingHistoryCenter } from "../../components/booking-management";
import { DashboardShell } from "../../components/dashboard-shell";
import { PageHeader } from "../../components/page-header";

export const metadata: Metadata = {
  title: "Booking History",
};

export default function BookingHistoryPage(): React.JSX.Element {
  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Bookings"
        title="Booking History"
        description="Customer and agent booking records with status, route, date, and fare visibility."
        actionHref="/search"
        actionLabel="New search"
      />
      <BookingHistoryCenter />
    </DashboardShell>
  );
}
