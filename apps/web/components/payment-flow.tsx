"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard, Landmark, Loader2, Lock, Smartphone, Wallet } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  cn,
} from "@vnbus/ui";

import { confirmBooking } from "../lib/api-client";
import { useBookingStore } from "../lib/booking-store";
import { formatInr, splitGst } from "../lib/gst";

type PaymentMethodId = "UPI" | "CARD" | "NETBANKING" | "WALLET";

interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "UPI", label: "UPI", hint: "GPay, PhonePe, Paytm, any UPI app", icon: Smartphone },
  { id: "CARD", label: "Card", hint: "Credit or debit card", icon: CreditCard },
  { id: "NETBANKING", label: "Net Banking", hint: "All major Indian banks", icon: Landmark },
  { id: "WALLET", label: "Wallet", hint: "Paytm, Amazon Pay, Mobikwik", icon: Wallet },
];

/**
 * Mock checkout. No gateway is wired up yet — the Razorpay and Cashfree
 * adapters on the API still report themselves as unconfigured — so this
 * screen simulates the payment leg and then calls the real confirm endpoint
 * with a clearly-marked mock reference. The test-mode banner is deliberate:
 * nothing here should ever look like it took a real payment.
 */
export function PaymentFlow(): React.JSX.Element {
  const router = useRouter();
  const layout = useBookingStore((state) => state.layout);
  const booking = useBookingStore((state) => state.booking);
  const hold = useBookingStore((state) => state.hold);
  const selectedSeats = useBookingStore((state) => state.selectedSeats);
  const passengers = useBookingStore((state) => state.passengers);
  const setConfirmation = useBookingStore((state) => state.setConfirmation);

  const [method, setMethod] = React.useState<PaymentMethodId>("UPI");
  const [simulateFailure, setSimulateFailure] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fare = booking?.fare ?? hold?.fare;

  if (!booking || !fare) {
    return (
      <EmptyState
        title="No booking to pay for"
        description="Your booking session expired or has not been created yet. Please review your trip again."
        actionLabel="Back to review"
        onAction={() => router.push("/booking-review")}
      />
    );
  }

  const gst = splitGst(fare.taxes, fare.baseFare);

  async function pay(): Promise<void> {
    if (!booking) {
      return;
    }

    setProcessing(true);
    setError(null);

    // Stand-in for the redirect/checkout round trip a real gateway would add.
    await new Promise((resolve) => setTimeout(resolve, 1400));

    if (simulateFailure) {
      setProcessing(false);
      router.push("/booking-failed");

      return;
    }

    try {
      const confirmation = await confirmBooking({
        bookingId: booking.bookingId,
        paymentReference: `MOCK-${method}-${Date.now()}`,
      });
      setConfirmation(confirmation);
      router.push(`/booking-confirmation?bookingId=${confirmation.booking.bookingId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Payment could not be completed");
      setProcessing(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-gray-50">
            Payment
          </h1>
          <Badge variant="warning">Test mode</Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {layout
            ? `${layout.sourceCity} to ${layout.destinationCity} · ${layout.journeyDate}`
            : null}
        </p>
      </div>

      <Alert variant="warning">
        <AlertTitle>No money will be charged</AlertTitle>
        <AlertDescription>
          A payment gateway has not been connected yet. This screen simulates the payment step so
          the rest of the booking flow can be used end to end. Your booking is still created and a
          ticket is still issued.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-5">
          {error ? (
            <Alert variant="danger">
              <AlertTitle>Payment failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Choose a payment method</CardTitle>
              <CardDescription>All options are simulated while test mode is on.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="grid gap-3 sm:grid-cols-2"
                role="radiogroup"
                aria-label="Payment method"
              >
                {PAYMENT_METHODS.map((option) => {
                  const Icon = option.icon;
                  const selected = method === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setMethod(option.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors duration-150",
                        selected
                          ? "border-site-primary bg-site-primary-light dark:border-brand-500 dark:bg-brand-900"
                          : "border-gold-100 bg-white hover:border-site-primary/50 dark:border-brand-900 dark:bg-brand-950",
                      )}
                    >
                      <Icon
                        className={cn(
                          "mt-0.5 size-5 shrink-0",
                          selected ? "text-site-primary dark:text-brand-200" : "text-gray-500",
                        )}
                        aria-hidden
                      />
                      <span className="grid gap-0.5">
                        <span className="text-sm font-semibold text-gray-950 dark:text-gray-50">
                          {option.label}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {option.hint}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trip summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <SummaryTile label="Operator" value={layout?.operatorName ?? booking.supplierCode} />
              <SummaryTile
                label="Seats"
                value={selectedSeats.join(", ") || booking.selectedSeats.join(", ")}
              />
              <SummaryTile
                label="Passengers"
                value={`${passengers.length || booking.passengers.length}`}
              />
              <SummaryTile label="Booking reference" value={booking.bookingReference} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test controls</CardTitle>
              <CardDescription>
                Only visible while the gateway is mocked, so the failure path can be exercised.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(event) => setSimulateFailure(event.target.checked)}
                  className="size-4 rounded border-gray-300 text-site-primary focus:ring-site-primary"
                />
                Simulate a failed payment
              </label>
            </CardContent>
          </Card>
        </section>

        <aside className="grid h-fit gap-4 lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle>Fare breakdown</CardTitle>
              <CardDescription>Inclusive of GST</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <FareRow label="Base fare" value={formatInr(fare.baseFare)} />
              <FareRow label={`CGST @ ${gst.halfRatePercent}%`} value={formatInr(gst.cgst)} />
              <FareRow label={`SGST @ ${gst.halfRatePercent}%`} value={formatInr(gst.sgst)} />
              {fare.convenienceFee.amount > 0 ? (
                <FareRow label="Convenience fee" value={formatInr(fare.convenienceFee)} />
              ) : null}
              {fare.discount.amount > 0 ? (
                <FareRow label="Discount" value={`- ${formatInr(fare.discount)}`} />
              ) : null}
              <div className="mt-2 flex items-center justify-between border-t border-gold-100 pt-3 text-base font-semibold text-gray-950 dark:border-brand-900 dark:text-gray-50">
                <span>Amount payable</span>
                <span>{formatInr(fare.grandTotal)}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                GST is charged at {gst.totalRatePercent}% on air-conditioned services. Tax invoice
                is issued after the booking is confirmed.
              </p>
            </CardContent>
          </Card>

          <Button className="w-full" disabled={processing} onClick={() => void pay()} size="lg">
            {processing ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Processing
              </>
            ) : (
              <>
                <Banknote className="size-4" aria-hidden />
                Pay {formatInr(fare.grandTotal)}
              </>
            )}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Lock className="size-3.5" aria-hidden />
            Simulated secure checkout
          </p>
        </aside>
      </div>
    </div>
  );
}

function FareRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
      <span>{label}</span>
      <span className="font-medium text-gray-950 dark:text-gray-50">{value}</span>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-md border border-gold-100 bg-white p-3 dark:border-brand-900 dark:bg-brand-950">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-950 dark:text-gray-50">{value}</p>
    </div>
  );
}
