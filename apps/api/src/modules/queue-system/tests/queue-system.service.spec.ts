import { QueueSystemRepository } from "../repositories/queue-system.repository";
import { QueueSystemService } from "../services/queue-system.service";
import { QueueSystemValidator } from "../validators/queue-system.validator";

describe("QueueSystemService", () => {
  it("returns BullMQ queue status and enqueues jobs", () => {
    const service = new QueueSystemService(new QueueSystemRepository(), new QueueSystemValidator());
    const queued = service.enqueue({
      queue: "AI_QUEUE",
      jobName: "recommendations.generate",
    });

    expect(queued.driver).toBe("BULLMQ");
    expect(queued.retryStrategy.deadLetterQueue).toBe("DEAD_LETTER_QUEUE");
    expect(queued.queues.find((queue) => queue.queue === "AI_QUEUE")?.waiting).toBeGreaterThan(8);
  });
});
