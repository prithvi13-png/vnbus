import type { Money, TicketRecord } from "@vnbus/types";

/**
 * Renders the confirmation email's ticket. The booking-confirmation template is
 * just {{ticketHtml}}/{{ticketText}}, so everything a traveller needs at the
 * boarding point is built here rather than squeezed into a template string.
 *
 * Layout is table-based with inline styles on purpose: Gmail, Outlook and most
 * mobile clients strip <style> blocks and do not support flex or grid.
 */

const BRAND = "#0B6E4F";
const GOLD = "#D4AF37";
const INK = "#1C2723";
const MUTED = "#5C6B64";
const BORDER = "#E3E9E6";

/** Indian GST on AC bus tickets is 5%, shown to the passenger as CGST 2.5% + SGST 2.5%. */
function splitGst(taxes: Money): { cgst: number; sgst: number } {
  const totalPaise = Math.round(taxes.amount * 100);
  const cgstPaise = Math.floor(totalPaise / 2);

  // The remainder goes to SGST so the two halves always re-sum to the total.
  return { cgst: cgstPaise / 100, sgst: (totalPaise - cgstPaise) / 100 };
}

function rupees(money: Money): string {
  return `₹${money.amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function amount(value: number): string {
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Passenger names and point addresses are user/supplier data — never interpolate them raw. */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }

  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatTime(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }

  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function duration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:${MUTED};font-size:13px;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;color:${INK};font-size:13px;font-weight:600;text-align:right;">${escapeHtml(value)}</td>
  </tr>`;
}

function fareRow(label: string, value: string, bold = false): string {
  const weight = bold ? "700" : "400";
  const color = bold ? INK : MUTED;

  return `<tr>
    <td style="padding:6px 0;color:${color};font-size:13px;font-weight:${weight};">${escapeHtml(label)}</td>
    <td style="padding:6px 0;color:${INK};font-size:13px;font-weight:${weight};text-align:right;">${value}</td>
  </tr>`;
}

export interface TicketEmail {
  subject: string;
  ticketHtml: string;
  ticketText: string;
}

export function buildTicketEmail(ticket: TicketRecord, supportEmail: string): TicketEmail {
  const { cgst, sgst } = splitGst(ticket.fare.taxes);
  const passengerRows = ticket.passengers
    .map(
      (passenger) => `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid ${BORDER};font-size:13px;color:${INK};">${escapeHtml(
          `${passenger.firstName} ${passenger.lastName}`.trim(),
        )}</td>
        <td style="padding:10px 8px;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};">${passenger.age} / ${escapeHtml(
          passenger.gender.charAt(0),
        )}</td>
        <td style="padding:10px 8px;border-bottom:1px solid ${BORDER};font-size:13px;color:${INK};font-weight:600;text-align:right;">${escapeHtml(
          passenger.seatNumber,
        )}</td>
      </tr>`,
    )
    .join("");

  const discountRow =
    ticket.fare.discount.amount > 0 ? fareRow("Discount", `- ${rupees(ticket.fare.discount)}`) : "";
  const convenienceRow =
    ticket.fare.convenienceFee.amount > 0
      ? fareRow("Convenience fee", rupees(ticket.fare.convenienceFee))
      : "";

  const ticketHtml = `
<div style="background:#F4F7F5;padding:24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
    <tr>
      <td style="background:${BRAND};padding:20px 24px;">
        <div style="color:#FFFFFF;font-size:18px;font-weight:700;letter-spacing:-0.2px;">Vriddhi Nexus</div>
        <div style="color:rgba(255,255,255,0.75);font-size:12px;margin-top:2px;">Bus Ticket &amp; Booking Confirmation</div>
      </td>
    </tr>

    <tr>
      <td style="padding:24px 24px 8px 24px;">
        <div style="display:inline-block;background:#E8F3EE;color:${BRAND};font-size:12px;font-weight:700;padding:5px 10px;border-radius:999px;">BOOKING CONFIRMED</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:16px;">
          <tr>
            <td style="font-size:12px;color:${MUTED};">PNR</td>
            <td style="font-size:12px;color:${MUTED};text-align:right;">Ticket No.</td>
          </tr>
          <tr>
            <td style="font-size:20px;font-weight:700;color:${INK};letter-spacing:0.5px;">${escapeHtml(ticket.pnr)}</td>
            <td style="font-size:20px;font-weight:700;color:${INK};text-align:right;letter-spacing:0.5px;">${escapeHtml(ticket.ticketNumber)}</td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:16px 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F9FBFA;border:1px solid ${BORDER};border-radius:10px;">
          <tr>
            <td style="padding:16px;">
              <div style="font-size:17px;font-weight:700;color:${INK};">${escapeHtml(ticket.route)}</div>
              <div style="font-size:13px;color:${MUTED};margin-top:4px;">${escapeHtml(formatDate(ticket.journeyDate))} &middot; ${escapeHtml(duration(ticket.durationMinutes))}</div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:12px;">
                <tr>
                  <td style="font-size:12px;color:${MUTED};">Departure</td>
                  <td style="font-size:12px;color:${MUTED};text-align:right;">Arrival</td>
                </tr>
                <tr>
                  <td style="font-size:15px;font-weight:700;color:${BRAND};">${escapeHtml(formatTime(ticket.departureTime))}</td>
                  <td style="font-size:15px;font-weight:700;color:${BRAND};text-align:right;">${escapeHtml(formatTime(ticket.arrivalTime))}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:8px 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${detailRow("Operator", ticket.operatorName)}
          ${detailRow("Bus type", ticket.busType)}
          ${detailRow("Bus number", ticket.busNumber)}
          ${detailRow("Seats", ticket.seatNumbers.join(", "))}
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:16px 24px 8px 24px;">
        <div style="font-size:13px;font-weight:700;color:${INK};margin-bottom:8px;">Boarding &amp; Dropping</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${BORDER};border-radius:10px;">
          <tr>
            <td style="padding:12px 14px;border-bottom:1px solid ${BORDER};">
              <div style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.4px;">Board at &middot; ${escapeHtml(formatTime(ticket.boardingPoint.time))}</div>
              <div style="font-size:14px;font-weight:600;color:${INK};margin-top:3px;">${escapeHtml(ticket.boardingPoint.name)}</div>
              <div style="font-size:12px;color:${MUTED};margin-top:2px;">${escapeHtml(ticket.boardingPoint.address)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 14px;">
              <div style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.4px;">Drop at &middot; ${escapeHtml(formatTime(ticket.droppingPoint.time))}</div>
              <div style="font-size:14px;font-weight:600;color:${INK};margin-top:3px;">${escapeHtml(ticket.droppingPoint.name)}</div>
              <div style="font-size:12px;color:${MUTED};margin-top:2px;">${escapeHtml(ticket.droppingPoint.address)}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:16px 24px 8px 24px;">
        <div style="font-size:13px;font-weight:700;color:${INK};margin-bottom:8px;">Passengers</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:0 8px 8px 8px;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.4px;">Name</td>
            <td style="padding:0 8px 8px 8px;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.4px;">Age / Sex</td>
            <td style="padding:0 8px 8px 8px;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.4px;text-align:right;">Seat</td>
          </tr>
          ${passengerRows}
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:16px 24px;">
        <div style="font-size:13px;font-weight:700;color:${INK};margin-bottom:8px;">Fare Breakdown</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F9FBFA;border:1px solid ${BORDER};border-radius:10px;padding:4px 14px;">
          <tr><td style="padding:4px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${fareRow("Base fare", rupees(ticket.fare.baseFare))}
              ${fareRow("CGST @ 2.5%", amount(cgst))}
              ${fareRow("SGST @ 2.5%", amount(sgst))}
              ${convenienceRow}
              ${discountRow}
              <tr><td colspan="2" style="border-top:1px solid ${BORDER};padding-top:6px;"></td></tr>
              ${fareRow("Total paid", rupees(ticket.fare.grandTotal), true)}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:8px 24px 20px 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FFFBEB;border:1px solid ${GOLD};border-radius:10px;">
          <tr>
            <td style="padding:12px 14px;font-size:12px;color:${INK};line-height:1.6;">
              <strong>Before you travel</strong><br />
              &bull; Carry this ticket and a valid government photo ID.<br />
              &bull; Reach the boarding point at least 15 minutes early.<br />
              &bull; The operator may refuse boarding if the ID does not match the ticket.
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="background:#F9FBFA;border-top:1px solid ${BORDER};padding:16px 24px;text-align:center;">
        <div style="font-size:12px;color:${MUTED};">
          Need help? Write to
          <a href="mailto:${escapeHtml(supportEmail)}" style="color:${BRAND};font-weight:600;text-decoration:none;">${escapeHtml(supportEmail)}</a>
          and quote your PNR.
        </div>
        <div style="font-size:11px;color:${MUTED};margin-top:6px;">Vriddhi Nexus Private Limited &middot; Booked on ${escapeHtml(formatDate(ticket.bookingDate))}</div>
      </td>
    </tr>
  </table>
</div>`.trim();

  const ticketText = [
    `BOOKING CONFIRMED — Vriddhi Nexus`,
    ``,
    `PNR: ${ticket.pnr}`,
    `Ticket No: ${ticket.ticketNumber}`,
    ``,
    `${ticket.route}`,
    `${formatDate(ticket.journeyDate)} · ${duration(ticket.durationMinutes)}`,
    `Departure: ${formatTime(ticket.departureTime)}    Arrival: ${formatTime(ticket.arrivalTime)}`,
    ``,
    `Operator: ${ticket.operatorName}`,
    `Bus type: ${ticket.busType}`,
    `Bus number: ${ticket.busNumber}`,
    `Seats: ${ticket.seatNumbers.join(", ")}`,
    ``,
    `Board at ${formatTime(ticket.boardingPoint.time)} — ${ticket.boardingPoint.name}`,
    `  ${ticket.boardingPoint.address}`,
    `Drop at ${formatTime(ticket.droppingPoint.time)} — ${ticket.droppingPoint.name}`,
    `  ${ticket.droppingPoint.address}`,
    ``,
    `Passengers:`,
    ...ticket.passengers.map(
      (p) =>
        `  ${`${p.firstName} ${p.lastName}`.trim()} (${p.age}/${p.gender.charAt(0)}) — seat ${p.seatNumber}`,
    ),
    ``,
    `Fare:`,
    `  Base fare      ${rupees(ticket.fare.baseFare)}`,
    `  CGST @ 2.5%    ${amount(cgst)}`,
    `  SGST @ 2.5%    ${amount(sgst)}`,
    ...(ticket.fare.convenienceFee.amount > 0
      ? [`  Convenience    ${rupees(ticket.fare.convenienceFee)}`]
      : []),
    ...(ticket.fare.discount.amount > 0
      ? [`  Discount     - ${rupees(ticket.fare.discount)}`]
      : []),
    `  Total paid     ${rupees(ticket.fare.grandTotal)}`,
    ``,
    `Before you travel:`,
    `  - Carry this ticket and a valid government photo ID.`,
    `  - Reach the boarding point at least 15 minutes early.`,
    `  - The operator may refuse boarding if the ID does not match the ticket.`,
    ``,
    `Need help? Write to ${supportEmail} and quote your PNR.`,
    `Vriddhi Nexus Private Limited · Booked on ${formatDate(ticket.bookingDate)}`,
  ].join("\n");

  return {
    subject: `Ticket confirmed: ${ticket.route} on ${formatDate(ticket.journeyDate)} (PNR ${ticket.pnr})`,
    ticketHtml,
    ticketText,
  };
}
