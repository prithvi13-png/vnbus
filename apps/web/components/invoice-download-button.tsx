"use client";

import * as React from "react";
import { ReceiptText } from "lucide-react";
import type { BookingRecord } from "@vnbus/types";
import { Button } from "@vnbus/ui";

import { downloadInvoiceDocument, type InvoiceRecord, useInvoiceStore } from "../lib/invoice-store";

export function InvoiceDownloadButton({
  booking,
  invoice,
  size = "sm",
  variant = "outline",
}: {
  booking?: BookingRecord | null;
  invoice?: InvoiceRecord | null;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
}): React.JSX.Element | null {
  const ensureInvoiceForBooking = useInvoiceStore((state) => state.ensureInvoiceForBooking);
  const markInvoiceDownloaded = useInvoiceStore((state) => state.markInvoiceDownloaded);
  const storedInvoice = useInvoiceStore((state) =>
    booking ? state.invoices.find((item) => item.bookingId === booking.bookingId) : null,
  );
  const [downloading, setDownloading] = React.useState(false);
  const activeInvoice = invoice ?? storedInvoice ?? null;

  if (!booking && !activeInvoice) {
    return null;
  }

  function download(): void {
    const currentInvoice =
      activeInvoice ??
      (booking ? ensureInvoiceForBooking(booking, "CUSTOMER_BOOKING", "Customer workspace") : null);

    if (!currentInvoice) {
      return;
    }

    setDownloading(true);
    downloadInvoiceDocument(currentInvoice);
    markInvoiceDownloaded(currentInvoice.invoiceId);
    window.setTimeout(() => setDownloading(false), 250);
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={download} disabled={downloading}>
      <ReceiptText className="h-4 w-4" aria-hidden="true" />
      {downloading ? "Preparing Invoice" : "Download Invoice"}
    </Button>
  );
}
