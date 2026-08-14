import type { Metadata } from "next";

import { TicketListCenter } from "../../../components/booking-management";
import { DashboardShell } from "../../../components/dashboard-shell";
import { PageHeader } from "../../../components/page-header";

export const metadata: Metadata = {
  title: "Customer Tickets",
};

export default function CustomerTicketsPage(): React.JSX.Element {
  return (
    <DashboardShell area="customer">
      <PageHeader
        eyebrow="Customer"
        title="Tickets"
        description="Issued tickets with QR verification, PDF download, and email history."
        actionHref="/booking-history"
        actionLabel="Bookings"
      />
      <TicketListCenter />
    </DashboardShell>
  );
}
