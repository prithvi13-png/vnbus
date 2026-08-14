import {
  AbhiBusAdapter,
  BCIAdapter,
  CustomApiAdapter,
  MockSupplierAdapter,
  RedBusAdapter,
  SupplierNotConfiguredError,
  TBOAdapter,
  type SupplierAdapter,
} from "@vnbus/supplier-sdk";

describe("SupplierAdapter contract", () => {
  const adapters: SupplierAdapter[] = [
    new MockSupplierAdapter(),
    new BCIAdapter(),
    new RedBusAdapter(),
    new AbhiBusAdapter(),
    new TBOAdapter(),
    new CustomApiAdapter(),
  ];
  const requiredMethods: Array<keyof SupplierAdapter> = [
    "searchTrips",
    "getTripDetails",
    "getSeatLayout",
    "holdSeats",
    "releaseSeats",
    "confirmBooking",
    "getBookingStatus",
    "cancelBooking",
    "rescheduleBooking",
    "getTicket",
    "trackBus",
    "getCancellationPolicy",
    "getBoardingPoints",
    "getDroppingPoints",
    "healthCheck",
  ];

  it("registers every required supplier adapter method", () => {
    for (const adapter of adapters) {
      for (const method of requiredMethods) {
        expect(typeof adapter[method]).toBe("function");
      }
    }
  });

  it("keeps mock supplier fully active", async () => {
    const adapter = new MockSupplierAdapter();
    const journeyDate = tomorrowIsoDate();
    const search = await adapter.searchTrips({
      sourceCity: "Bangalore",
      destinationCity: "Hyderabad",
      journeyDate,
      passengerCount: 1,
    });

    expect(search.success).toBe(true);
    expect(search.trips.length).toBeGreaterThan(0);

    const layout = await adapter.getSeatLayout({
      supplierCode: "MOCK",
      tripId: search.trips[0]?.tripId ?? "mock-route-001-1",
      journeyDate,
    });
    const seat = layout.decks
      .flatMap((deck) => deck.seats)
      .find((item) => item.status === "AVAILABLE");

    expect(seat).toBeDefined();

    const hold = await adapter.holdSeats({
      supplierCode: "MOCK",
      tripId: layout.tripId,
      journeyDate,
      seatNumbers: [seat?.seatNumber ?? "1A"],
    });

    expect(hold.status).toBe("SEAT_HELD");
    await expect(adapter.healthCheck()).resolves.toMatchObject({ status: "AVAILABLE" });
  });

  it("reports real supplier adapters as not configured without live calls", async () => {
    const liveAdapters = adapters.filter((adapter) => adapter.code !== "MOCK");

    for (const adapter of liveAdapters) {
      await expect(adapter.healthCheck()).resolves.toMatchObject({
        status: "UNAVAILABLE",
        message: "Not configured. No live connection attempted.",
      });
      await expect(
        adapter.searchTrips({
          sourceCity: "Bangalore",
          destinationCity: "Hyderabad",
          journeyDate: tomorrowIsoDate(),
          passengerCount: 1,
        }),
      ).rejects.toBeInstanceOf(SupplierNotConfiguredError);
    }
  });
});

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);

  return date.toISOString().slice(0, 10);
}
