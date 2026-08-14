import type { Metadata } from "next";

import { NotificationCenter } from "../../../components/booking-management";
import { DashboardShell } from "../../../components/dashboard-shell";
import { PageHeader } from "../../../components/page-header";

export const metadata: Metadata = {
  title: "Customer Notifications",
};

export default function CustomerNotificationsPage(): React.JSX.Element {
  return (
    <DashboardShell area="customer">
      <PageHeader
        eyebrow="Customer"
        title="Notification Center"
        description="Unread and read customer booking updates, cancellation updates, reschedule updates, and email history."
        actionHref="/booking-history"
        actionLabel="Bookings"
      />
      <NotificationCenter />
    </DashboardShell>
  );
}
