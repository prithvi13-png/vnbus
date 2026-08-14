import { Injectable } from "@nestjs/common";
import type { BackgroundJobRecord, SchedulerDashboardResponse } from "@vnbus/types";

@Injectable()
export class SchedulerRepository {
  private readonly jobs = new Map<string, BackgroundJobRecord>(
    seedJobs().map((job) => [job.jobId, job]),
  );

  getDashboard(): SchedulerDashboardResponse {
    const jobs = [...this.jobs.values()];

    return {
      jobs,
      schedulerQueue: {
        queue: "SCHEDULER_QUEUE",
        waiting: jobs.filter((job) => job.status === "SCHEDULED").length,
        active: jobs.filter((job) => job.status === "RUNNING").length,
        completed: jobs.filter((job) => job.status === "COMPLETED").length,
        failed: jobs.filter((job) => job.status === "FAILED").length,
        delayed: 4,
        retryScheduled: 2,
        deadLettered: 0,
        status: "HEALTHY",
      },
    };
  }

  find(jobId: string): BackgroundJobRecord | null {
    return this.jobs.get(jobId) ?? null;
  }

  markCompleted(jobId: string): BackgroundJobRecord | null {
    const job = this.find(jobId);

    if (!job) {
      return null;
    }

    const completed: BackgroundJobRecord = {
      ...job,
      status: "COMPLETED",
      lastRunAt: new Date().toISOString(),
    };
    this.jobs.set(jobId, completed);

    return completed;
  }
}

function seedJobs(): BackgroundJobRecord[] {
  return [
    job("JOB-SEAT-EXPIRE", "Expired Seat Cleanup", "SCHEDULER_QUEUE", "EVERY_5_MINUTES"),
    job("JOB-RESERVATION-CLEANUP", "Reservation Cleanup", "SCHEDULER_QUEUE", "HOURLY"),
    job("JOB-EMAIL-RETRY", "Email Retry", "EMAIL_QUEUE", "EVERY_5_MINUTES"),
    job("JOB-NOTIFICATION-RETRY", "Notification Retry", "NOTIFICATION_QUEUE", "EVERY_5_MINUTES"),
    job("JOB-ANALYTICS-SNAPSHOT", "Analytics Snapshot", "ANALYTICS_QUEUE", "DAILY"),
    job(
      "JOB-SUPPLIER-REQUEST-RETRY",
      "Supplier Request Retry",
      "SUPPLIER_REQUEST_QUEUE",
      "EVERY_5_MINUTES",
    ),
    job("JOB-PAYMENT-EVENT-RETRY", "Payment Event Retry", "PAYMENT_EVENT_QUEUE", "EVERY_5_MINUTES"),
    job("JOB-DAILY-REPORT", "Daily Reports", "ANALYTICS_QUEUE", "DAILY"),
    job("JOB-WEEKLY-REPORT", "Weekly Reports", "ANALYTICS_QUEUE", "WEEKLY"),
    job("JOB-MONTHLY-REPORT", "Monthly Reports", "ANALYTICS_QUEUE", "MONTHLY"),
  ];
}

function job(
  jobId: string,
  name: string,
  queue: BackgroundJobRecord["queue"],
  schedule: BackgroundJobRecord["schedule"],
): BackgroundJobRecord {
  return {
    jobId,
    name,
    queue,
    schedule,
    status: "SCHEDULED",
    lastRunAt: null,
    nextRunAt: "2026-08-09T00:00:00.000Z",
    description: `${name} is scheduled through the BullMQ-backed scheduler queue.`,
  };
}
