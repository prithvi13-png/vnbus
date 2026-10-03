import { FakePrisma } from "../../../shared/tests/fake-prisma";
import { TimelineRepository } from "../repositories/timeline.repository";
import { TimelineService } from "../services/timeline.service";
import { TimelineModuleValidator } from "../validators/timeline.validator";

function createService(): TimelineService {
  return new TimelineService(
    new TimelineRepository(new FakePrisma().asPrismaService()),
    new TimelineModuleValidator(),
  );
}

describe("TimelineService", () => {
  it("returns module readiness and capabilities", () => {
    const summary = createService().getSummary();

    expect(summary.module).toBe("timeline");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("records booking lifecycle events in chronological order", async () => {
    const service = createService();
    await service.append({
      bookingId: "booking-1",
      type: "TICKET_GENERATED",
      title: "Ticket generated",
      description: "Ticket issued.",
      occurredAt: "2026-08-08T10:00:00.000Z",
    });
    await service.append({
      bookingId: "booking-1",
      type: "SEAT_RESERVED",
      title: "Seats reserved",
      description: "Seats held by the operator.",
      occurredAt: "2026-08-08T09:00:00.000Z",
    });
    await service.append({
      bookingId: "booking-2",
      type: "SEAT_RESERVED",
      title: "Seats reserved",
      description: "Another booking.",
    });

    const events = await service.listForBookings(["booking-1"]);

    expect(events.map((event) => event.type)).toEqual(["SEAT_RESERVED", "TICKET_GENERATED"]);
  });
});
