ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'TICKET_GENERATED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'CANCELLATION_REQUESTED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'REFUND_PENDING';

ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'GENERATED';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'DOWNLOADED';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'EMAIL_SENT';

CREATE TYPE "BookingTimelineType" AS ENUM (
  'BOOKING_CREATED',
  'SEAT_RESERVED',
  'PAYMENT_PENDING',
  'PAYMENT_CONFIRMED',
  'TICKET_GENERATED',
  'TICKET_DOWNLOADED',
  'EMAIL_SENT',
  'EMAIL_RETRY_SCHEDULED',
  'JOURNEY_COMPLETED',
  'CANCELLATION_REQUESTED',
  'CANCELLED',
  'REFUND_PENDING',
  'RESCHEDULE_REQUESTED',
  'RESCHEDULED'
);

CREATE TYPE "NotificationType" AS ENUM (
  'BOOKING_UPDATE',
  'CANCELLATION_UPDATE',
  'RESCHEDULE_UPDATE',
  'EMAIL_HISTORY'
);

CREATE TYPE "EmailDeliveryStatus" AS ENUM (
  'QUEUED',
  'SENT',
  'FAILED',
  'RETRY_SCHEDULED'
);

CREATE TYPE "TicketDownloadStatus" AS ENUM (
  'READY',
  'DOWNLOADED',
  'FAILED'
);

ALTER TABLE "bookings"
  ADD COLUMN "cancelled_at" TIMESTAMP(3),
  ADD COLUMN "rescheduled_at" TIMESTAMP(3),
  ADD COLUMN "new_journey_date" DATE;

ALTER TABLE "tickets"
  ADD COLUMN "pnr" VARCHAR(80) NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "journey_date" DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN "bus_number" VARCHAR(40) NOT NULL DEFAULT 'MOCK',
  ADD COLUMN "qr_payload" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "support" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "emailed_at" TIMESTAMP(3),
  ADD COLUMN "downloaded_at" TIMESTAMP(3);

CREATE TABLE "ticket_downloads" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ticket_id" UUID NOT NULL,
  "file_name" VARCHAR(180) NOT NULL,
  "mime_type" VARCHAR(80) NOT NULL DEFAULT 'application/pdf',
  "status" "TicketDownloadStatus" NOT NULL DEFAULT 'DOWNLOADED',
  "downloaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,

  CONSTRAINT "ticket_downloads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "booking_timeline" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "booking_id" UUID NOT NULL,
  "type" "BookingTimelineType" NOT NULL,
  "title" VARCHAR(180) NOT NULL,
  "description" TEXT NOT NULL,
  "tone" VARCHAR(40) NOT NULL DEFAULT 'info',
  "metadata" JSONB,
  "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "booking_timeline_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "notifications"
  ADD COLUMN "type" "NotificationType" NOT NULL DEFAULT 'BOOKING_UPDATE';

CREATE TABLE "email_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "to" VARCHAR(320) NOT NULL,
  "template_key" VARCHAR(120) NOT NULL,
  "subject" VARCHAR(180) NOT NULL,
  "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'QUEUED',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "max_attempts" INTEGER NOT NULL DEFAULT 3,
  "queued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sent_at" TIMESTAMP(3),
  "failed_at" TIMESTAMP(3),
  "next_retry_at" TIMESTAMP(3),
  "error_message" TEXT,
  "metadata" JSONB,

  CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ticket_downloads_ticket_id_downloaded_at_idx" ON "ticket_downloads"("ticket_id", "downloaded_at");
CREATE INDEX "booking_timeline_booking_id_occurred_at_idx" ON "booking_timeline"("booking_id", "occurred_at");
CREATE INDEX "booking_timeline_type_idx" ON "booking_timeline"("type");
CREATE INDEX "tickets_status_idx" ON "tickets"("status");
CREATE INDEX "email_logs_template_key_status_idx" ON "email_logs"("template_key", "status");
CREATE INDEX "email_logs_queued_at_idx" ON "email_logs"("queued_at");

ALTER TABLE "ticket_downloads"
  ADD CONSTRAINT "ticket_downloads_ticket_id_fkey"
  FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "booking_timeline"
  ADD CONSTRAINT "booking_timeline_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
