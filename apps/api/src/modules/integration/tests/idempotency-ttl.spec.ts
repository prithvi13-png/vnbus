import { IdempotencyService } from "../services/idempotency.service";

describe("IdempotencyService TTL", () => {
  it("replays a cached response only while it is still within its TTL", async () => {
    const service = new IdempotencyService();
    const holdWindowMs = 10 * 60 * 1000;

    const first = await service.runWithKey(
      "seat-hold",
      "MOCK:trip-1:2026-10-02:1A,1B",
      { seats: ["1A", "1B"] },
      () => Promise.resolve({ reservationId: "RES-FIRST" }),
      holdWindowMs,
    );
    expect(first).toEqual({ reservationId: "RES-FIRST" });

    // Within the window the same seats must not produce a second hold.
    const replayed = await service.runWithKey(
      "seat-hold",
      "MOCK:trip-1:2026-10-02:1A,1B",
      { seats: ["1A", "1B"] },
      () => Promise.resolve({ reservationId: "RES-SECOND" }),
      holdWindowMs,
    );
    expect(replayed).toEqual({ reservationId: "RES-FIRST" });

    // Once the hold has lapsed the traveller must be able to take a fresh one;
    // replaying the dead reservation is what made those seats unbookable.
    jest.spyOn(Date, "now").mockReturnValue(Date.now() + holdWindowMs + 1000);
    const afterExpiry = await service.runWithKey(
      "seat-hold",
      "MOCK:trip-1:2026-10-02:1A,1B",
      { seats: ["1A", "1B"] },
      () => Promise.resolve({ reservationId: "RES-THIRD" }),
      holdWindowMs,
    );
    expect(afterExpiry).toEqual({ reservationId: "RES-THIRD" });

    jest.restoreAllMocks();
  });
});
