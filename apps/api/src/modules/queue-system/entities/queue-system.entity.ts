import type { QueueDashboardResponse, QueueStatusRecord } from "@vnbus/types";

export class QueueStatusEntity implements QueueStatusRecord {
  constructor(private readonly record: QueueStatusRecord) {}

  get queue(): QueueStatusRecord["queue"] {
    return this.record.queue;
  }

  get waiting(): number {
    return this.record.waiting;
  }

  get active(): number {
    return this.record.active;
  }

  get completed(): number {
    return this.record.completed;
  }

  get failed(): number {
    return this.record.failed;
  }

  get delayed(): number {
    return this.record.delayed;
  }

  get retryScheduled(): number {
    return this.record.retryScheduled;
  }

  get deadLettered(): number {
    return this.record.deadLettered;
  }

  get status(): QueueStatusRecord["status"] {
    return this.record.status;
  }
}

export class QueueDashboardEntity implements QueueDashboardResponse {
  constructor(private readonly record: QueueDashboardResponse) {}

  get driver(): QueueDashboardResponse["driver"] {
    return this.record.driver;
  }

  get redis(): QueueDashboardResponse["redis"] {
    return this.record.redis;
  }

  get queues(): QueueDashboardResponse["queues"] {
    return this.record.queues;
  }

  get retryStrategy(): QueueDashboardResponse["retryStrategy"] {
    return this.record.retryStrategy;
  }
}
