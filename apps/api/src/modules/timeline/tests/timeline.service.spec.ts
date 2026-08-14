import { TimelineRepository } from "../repositories/timeline.repository";
import { TimelineService } from "../services/timeline.service";
import { TimelineModuleValidator } from "../validators/timeline.validator";

describe("TimelineService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new TimelineService(new TimelineRepository(), new TimelineModuleValidator());
    const summary = service.getSummary();

    expect(summary.module).toBe("timeline");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("records booking lifecycle events in chronological order", () => {
    const service = new TimelineService(new TimelineRepository(), new TimelineModuleValidator());
    service.append({
      bookingId: "BKG-1",
      type: "TICKET_GENERATED",
      title: "Ticket generated",
      description: "Internal ticket record created.",
      occurredAt: "2026-08-08T10:00:00.000Z",
    });
    service.append({
      bookingId: "BKG-1",
      type: "BOOKING_CREATED",
      title: "Booking created",
      description: "Booking created from held seats.",
      occurredAt: "2026-08-08T09:00:00.000Z",
    });

    expect(service.listForBooking("BKG-1").map((event) => event.type)).toEqual([
      "BOOKING_CREATED",
      "TICKET_GENERATED",
    ]);
  });
});
