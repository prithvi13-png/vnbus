import type { TicketRecord } from "@vnbus/types";

import { buildTicketEmail } from "./ticket-email";

function ticketWith(overrides: Partial<TicketRecord> = {}): TicketRecord {
  return {
    ticketId: "TKT-1",
    bookingId: "BKG-1",
    bookingReference: "VNB-4F2A91",
    ticketNumber: "VNT-8C31D0",
    status: "ACTIVE",
    pnr: "PNR7QK2M9XA",
    journeyDate: "2026-10-02T21:30:00+05:30",
    operatorName: "Orange Travels",
    busType: "AC Sleeper (2+1)",
    busNumber: "TS09UB4412",
    route: "Hyderabad to Bengaluru",
    departureTime: "2026-10-02T21:30:00+05:30",
    arrivalTime: "2026-10-03T06:15:00+05:30",
    durationMinutes: 525,
    passengers: [
      {
        seatNumber: "L3",
        firstName: "Aarav",
        lastName: "Sharma",
        age: 29,
        gender: "MALE",
        phone: "+919876500011",
        email: "aarav@example.com",
      },
    ],
    seatNumbers: ["L3"],
    boardingPoint: {
      id: "bp1",
      name: "Miyapur Metro",
      city: "Hyderabad",
      address: "Near Pillar 234",
      time: "2026-10-02T21:30:00+05:30",
      landmark: "Metro",
      latitude: 0,
      longitude: 0,
    },
    droppingPoint: {
      id: "dp1",
      name: "Madiwala",
      city: "Bengaluru",
      address: "Hosur Road",
      time: "2026-10-03T06:15:00+05:30",
      landmark: "Check Post",
      latitude: 0,
      longitude: 0,
    },
    fare: {
      baseFare: { amount: 2400, currency: "INR" },
      taxes: { amount: 120.01, currency: "INR" },
      discount: { amount: 0, currency: "INR" },
      convenienceFee: { amount: 0, currency: "INR" },
      grandTotal: { amount: 2520.01, currency: "INR" },
    },
    bookingDate: "2026-09-23T11:05:00+05:30",
    bookingStatus: "TICKET_GENERATED",
    qrCode: { format: "PNG", data: "x" },
    ...overrides,
  } as TicketRecord;
}

describe("buildTicketEmail", () => {
  it("puts the PNR in the subject so the inbox list is scannable", () => {
    const { subject } = buildTicketEmail(ticketWith(), "info@vriddhinexus.com");

    expect(subject).toContain("PNR7QK2M9XA");
    expect(subject).toContain("Hyderabad to Bengaluru");
  });

  it("splits GST into halves that re-sum to the tax charged", () => {
    // An odd paise total must not vanish into rounding: 120.01 -> 60.00 + 60.01.
    const { ticketText } = buildTicketEmail(ticketWith(), "info@vriddhinexus.com");

    expect(ticketText).toContain("CGST @ 2.5%    ₹60.00");
    expect(ticketText).toContain("SGST @ 2.5%    ₹60.01");
  });

  it("carries everything a passenger needs at the boarding point", () => {
    const { ticketText, ticketHtml } = buildTicketEmail(ticketWith(), "info@vriddhinexus.com");

    for (const expected of [
      "PNR7QK2M9XA",
      "VNT-8C31D0",
      "Orange Travels",
      "TS09UB4412",
      "L3",
      "Miyapur Metro",
      "Madiwala",
      "Aarav Sharma",
    ]) {
      expect(ticketText).toContain(expected);
      expect(ticketHtml).toContain(expected);
    }
  });

  it("escapes passenger names rather than trusting them as markup", () => {
    const { ticketHtml } = buildTicketEmail(
      ticketWith({
        passengers: [
          {
            seatNumber: "L3",
            firstName: "<script>alert(1)</script>",
            lastName: "Sharma",
            age: 29,
            gender: "MALE",
            phone: "+919876500011",
            email: "aarav@example.com",
          },
        ],
      }),
      "info@vriddhinexus.com",
    );

    expect(ticketHtml).not.toContain("<script>");
    expect(ticketHtml).toContain("&lt;script&gt;");
  });

  it("omits the discount and convenience rows when there is nothing to show", () => {
    const { ticketHtml } = buildTicketEmail(ticketWith(), "info@vriddhinexus.com");

    expect(ticketHtml).not.toContain("Discount");
    expect(ticketHtml).not.toContain("Convenience fee");
  });
});
