import { Injectable } from "@nestjs/common";
import type { EnqueueJobRequest, PlatformQueueName, QueueDashboardResponse } from "@vnbus/types";

@Injectable()
export class QueueSystemRepository {
  private readonly queues = new Map<PlatformQueueName, QueueDashboardResponse["queues"][number]>(
    seedQueues().map((queue) => [queue.queue, queue]),
  );

  getDashboard(): QueueDashboardResponse {
    return {
      driver: "BULLMQ",
      redis: "HEALTHY",
      queues: [...this.queues.values()],
      retryStrategy: {
        attempts: 5,
        backoff: "EXPONENTIAL",
        deadLetterQueue: "DEAD_LETTER_QUEUE",
      },
    };
  }

  enqueue(input: EnqueueJobRequest): QueueDashboardResponse {
    const queue = this.queues.get(input.queue);
    this.queues.set(input.queue, {
      ...(queue ?? queueStatus(input.queue, 0, 0, 0, 0, 0, 0, 0, "HEALTHY")),
      waiting: (queue?.waiting ?? 0) + 1,
      status: "HEALTHY",
    });

    return this.getDashboard();
  }
}

function seedQueues(): QueueDashboardResponse["queues"] {
  return [
    queueStatus("EMAIL_QUEUE", 28, 2, 1240, 3, 7, 7, 1, "DEGRADED"),
    queueStatus("NOTIFICATION_QUEUE", 41, 1, 3920, 4, 9, 9, 2, "DEGRADED"),
    queueStatus("PDF_QUEUE", 6, 1, 430, 1, 2, 2, 0, "HEALTHY"),
    queueStatus("ANALYTICS_QUEUE", 4, 1, 96, 0, 1, 1, 0, "HEALTHY"),
    queueStatus("AI_QUEUE", 8, 0, 212, 0, 3, 3, 0, "HEALTHY"),
    queueStatus("RESERVATION_CLEANUP_QUEUE", 5, 0, 318, 0, 2, 2, 0, "HEALTHY"),
    queueStatus("SUPPLIER_REQUEST_QUEUE", 11, 1, 862, 2, 4, 4, 1, "DEGRADED"),
    queueStatus("PAYMENT_EVENT_QUEUE", 3, 0, 284, 0, 1, 1, 0, "HEALTHY"),
    queueStatus("SCHEDULER_QUEUE", 12, 1, 620, 0, 4, 4, 0, "HEALTHY"),
    queueStatus("DEAD_LETTER_QUEUE", 0, 0, 3, 0, 0, 0, 3, "DEGRADED"),
  ];
}

function queueStatus(
  queue: PlatformQueueName,
  waiting: number,
  active: number,
  completed: number,
  failed: number,
  delayed: number,
  retryScheduled: number,
  deadLettered: number,
  status: QueueDashboardResponse["queues"][number]["status"],
): QueueDashboardResponse["queues"][number] {
  return {
    queue,
    waiting,
    active,
    completed,
    failed,
    delayed,
    retryScheduled,
    deadLettered,
    status,
  };
}
