import type { Metadata } from "next";

import { InvoiceListCenter } from "../../../components/booking-management";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Customer Invoices",
};

export default function CustomerInvoicesPage(): React.JSX.Element {
  return (
    <DashboardShell area="customer">
      <InvoiceListCenter />
    </DashboardShell>
  );
}
