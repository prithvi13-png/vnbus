import { IsIn, IsObject, IsOptional, IsString } from "class-validator";
import type { EnqueueJobRequest, PlatformQueueName } from "@vnbus/types";

export const platformQueues: PlatformQueueName[] = [
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

export class EnqueueJobDto implements EnqueueJobRequest {
  @IsIn(platformQueues)
  queue!: PlatformQueueName;

  @IsString()
  jobName!: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
