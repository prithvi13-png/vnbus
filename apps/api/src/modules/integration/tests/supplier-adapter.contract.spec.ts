import {
  AbhiBusAdapter,
  BCIAdapter,
  CustomApiAdapter,
  RedBusAdapter,
  SrdvBusAdapter,
  SupplierNotConfiguredError,
  TBOAdapter,
  type SupplierAdapter,
} from "@vnbus/supplier-sdk";

const placeholderAdapters: SupplierAdapter[] = [
  new BCIAdapter(),
  new RedBusAdapter(),
  new AbhiBusAdapter(),
  new TBOAdapter(),
  new CustomApiAdapter(),
];

const srdv = new SrdvBusAdapter(
  {
    credentials: {
      baseUrl: "https://srdv.test/bus",
      apiToken: "token",
      clientId: "",
      userName: "",
      password: "",
      endUserIp: "",
    },
    fetchImpl: () => Promise.reject(new Error("No network in tests")),
  },
  new Map(),
);

describe("SupplierAdapter contract", () => {
  const requiredMethods: Array<keyof SupplierAdapter> = [
    "searchTrips",
    "getTripDetails",
    "getSeatLayout",
    "holdSeats",
    "releaseSeats",
    "blockSeats",
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
    for (const adapter of [...placeholderAdapters, srdv]) {
      for (const method of requiredMethods) {
        expect(typeof adapter[method]).toBe("function");
      }
    }
  });

  it("reports unbuilt supplier adapters as not configured without live calls", async () => {
    for (const adapter of placeholderAdapters) {
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

  it("refuses a city SRDV has no code for rather than guessing", async () => {
    const result = await srdv.searchTrips({
      sourceCity: "Nowhere",
      destinationCity: "Elsewhere",
      journeyDate: tomorrowIsoDate(),
      passengerCount: 1,
    });

    expect(result.success).toBe(false);
    expect(result.trips).toEqual([]);
  });
});

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);

  return date.toISOString().slice(0, 10);
}
