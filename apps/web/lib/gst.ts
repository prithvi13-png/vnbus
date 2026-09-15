import type { Money } from "@vnbus/types";

/**
 * GST presentation for bus tickets.
 *
 * The API already returns the tax component on every fare, so nothing here
 * recomputes a total — this only splits the amount the backend gave us into
 * the CGST/SGST halves an Indian passenger expects to see on a ticket and
 * invoice. Deriving rather than recalculating means the displayed lines can
 * never drift from the amount actually charged.
 *
 * Air-conditioned stage carriage tickets attract 5% GST, levied as CGST 2.5%
 * + SGST 2.5% on intra-state journeys. Inter-state journeys are strictly
 * IGST 5%; that distinction needs the operator's place-of-supply data, which
 * the mock supplier does not provide, so the split is shown as CGST/SGST for
 * now. Revisit when a real supplier feed lands.
 */
export interface GstBreakdown {
  cgst: Money;
  sgst: Money;
  /** Combined GST as a percentage of base fare, rounded to one decimal. */
  totalRatePercent: number;
  /** Rate applied to each of CGST and SGST. */
  halfRatePercent: number;
}

export function splitGst(taxes: Money, baseFare: Money): GstBreakdown {
  const totalPaise = Math.round(taxes.amount * 100);
  // Give the remainder to SGST so the two halves always re-sum to `taxes`
  // exactly, rather than losing a paisa to rounding.
  const cgstPaise = Math.floor(totalPaise / 2);
  const sgstPaise = totalPaise - cgstPaise;

  const totalRatePercent =
    baseFare.amount > 0 ? Math.round((taxes.amount / baseFare.amount) * 1000) / 10 : 0;

  return {
    cgst: { amount: cgstPaise / 100, currency: taxes.currency },
    sgst: { amount: sgstPaise / 100, currency: taxes.currency },
    totalRatePercent,
    halfRatePercent: Math.round((totalRatePercent / 2) * 10) / 10,
  };
}

export function formatInr(value: Money): string {
  return `₹${value.amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
