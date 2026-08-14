import type { Metadata } from "next";
import { PublicLayout } from "@vnbus/ui";

import { BookingHistoryDetailFlow } from "../../../components/booking-flow";
import { SiteFooter } from "../../../components/site-footer";
import { SiteHeader } from "../../../components/site-header";

export const metadata: Metadata = {
  title: "Booking Details",
};

export default function BookingHistoryDetailPage(): React.JSX.Element {
  return (
    <PublicLayout>
      <SiteHeader />
      <main className="bg-gray-50 dark:bg-gray-950">
        <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <BookingHistoryDetailFlow />
        </section>
      </main>
      <SiteFooter />
    </PublicLayout>
  );
}
