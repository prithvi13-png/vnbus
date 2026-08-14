import type { Metadata } from "next";
import { PublicLayout } from "@vnbus/ui";

import { SeatSelectionFlow } from "../../components/booking-flow";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

export const metadata: Metadata = {
  title: "Seat Selection",
  description: "Select seats, boarding point, and dropping point for a mock bus booking.",
};

export default function SeatLayoutPage(): React.JSX.Element {
  return (
    <PublicLayout>
      <SiteHeader />
      <main className="bg-gray-50 dark:bg-gray-950">
        <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-normal text-gold-600 dark:text-gold-200">
              Seat Selection
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-gray-950 dark:text-gray-50">
              Choose seats and points
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              Select available seats, boarding point, and dropping point before starting the hold
              timer.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <SeatSelectionFlow />
        </section>
      </main>
      <SiteFooter />
    </PublicLayout>
  );
}
