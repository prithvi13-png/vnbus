import { Injectable } from "@nestjs/common";
import type { EnqueueJobRequest, PlatformQueueName, QueueDashboardResponse } from "@vnbus/types";

@Injectable()
export class QueueSystemRepository {
  private readonly queues = new Map<PlatformQueueName, QueueDashboardResponse["queues"][number]>(
    emptyQueues().map((queue) => [queue.queue, queue]),
  );

  getDashboard(): QueueDashboardResponse {
    return {
      driver: "BULLMQ",
      redis: process.env.REDIS_URL?.trim() ? "HEALTHY" : "DISABLED",
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

/**
 * Every platform queue, all empty. No job is processed through BullMQ yet, so
 * nothing is counted and each queue reports DISABLED rather than healthy.
 */
function emptyQueues(): QueueDashboardResponse["queues"] {
  const names: PlatformQueueName[] = [
    "EMAIL_QUEUE",
    "NOTIFICATION_QUEUE",
    "PDF_QUEUE",
    "ANALYTICS_QUEUE",
    "AI_QUEUE",
    "RESERVATION_CLEANUP_QUEUE",
    "SUPPLIER_REQUEST_QUEUE",
    "PAYMENT_EVENT_QUEUE",
    "SCHEDULER_QUEUE",
    "DEAD_LETTER_QUEUE",
  ];

  return names.map((name) => queueStatus(name, 0, 0, 0, 0, 0, 0, 0, "DISABLED"));
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
