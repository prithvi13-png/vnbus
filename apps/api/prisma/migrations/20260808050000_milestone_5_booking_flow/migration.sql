ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'SEAT_HELD';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

CREATE TYPE "SeatInventoryStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'LADIES', 'RESERVED', 'BLOCKED');
CREATE TYPE "SeatDeck" AS ENUM ('LOWER', 'UPPER');
CREATE TYPE "SeatKind" AS ENUM ('SEATER', 'SLEEPER', 'SEMI_SLEEPER');
CREATE TYPE "ReservationStatus" AS ENUM ('DRAFT', 'SEAT_HELD', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

ALTER TABLE "bookings"
  ADD COLUMN "boarding_point_id" VARCHAR(120),
  ADD COLUMN "boarding_point_name" VARCHAR(180),
  ADD COLUMN "dropping_point_id" VARCHAR(120),
  ADD COLUMN "dropping_point_name" VARCHAR(180);

ALTER TABLE "passengers"
  ADD COLUMN "first_name" VARCHAR(80),
  ADD COLUMN "last_name" VARCHAR(80),
  ADD COLUMN "phone" VARCHAR(20),
  ADD COLUMN "email" VARCHAR(320),
  ADD COLUMN "emergency_contact" VARCHAR(20);

CREATE TABLE "seat_layouts" (
  "id" UUID NOT NULL,
  "supplier_code" VARCHAR(40) NOT NULL,
  "trip_id" VARCHAR(120) NOT NULL,
  "journey_date" DATE NOT NULL,
  "operator_name" VARCHAR(180) NOT NULL,
  "bus_type" VARCHAR(80) NOT NULL,
  "vehicle_layout" VARCHAR(80) NOT NULL,
  "axle_type" VARCHAR(40) NOT NULL,
  "max_selectable" INTEGER NOT NULL DEFAULT 6,
  "hold_seconds" INTEGER NOT NULL DEFAULT 600,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "seat_layouts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seats" (
  "id" UUID NOT NULL,
  "layout_id" UUID NOT NULL,
  "seat_number" VARCHAR(20) NOT NULL,
  "deck" "SeatDeck" NOT NULL,
  "row" INTEGER NOT NULL,
  "column" INTEGER NOT NULL,
  "kind" "SeatKind" NOT NULL,
  "status" "SeatInventoryStatus" NOT NULL DEFAULT 'AVAILABLE',
  "fare_amount" DECIMAL(12,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
  "is_window" BOOLEAN NOT NULL DEFAULT false,
  "is_emergency_exit" BOOLEAN NOT NULL DEFAULT false,
  "has_extra_legroom" BOOLEAN NOT NULL DEFAULT false,
  "gender_restriction" VARCHAR(20),
  CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reservations" (
  "id" UUID NOT NULL,
  "booking_id" UUID,
  "supplier_code" VARCHAR(40) NOT NULL,
  "trip_id" VARCHAR(120) NOT NULL,
  "journey_date" DATE NOT NULL,
  "seat_numbers" JSONB NOT NULL,
  "status" "ReservationStatus" NOT NULL DEFAULT 'SEAT_HELD',
  "expires_at" TIMESTAMP(3) NOT NULL,
  "released_at" TIMESTAMP(3),
  "confirmed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reservation_logs" (
  "id" UUID NOT NULL,
  "reservation_id" UUID NOT NULL,
  "action" VARCHAR(80) NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reservation_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "seat_layouts_supplier_code_trip_id_journey_date_key"
  ON "seat_layouts"("supplier_code", "trip_id", "journey_date");
CREATE INDEX "seat_layouts_trip_id_journey_date_idx" ON "seat_layouts"("trip_id", "journey_date");
CREATE UNIQUE INDEX "seats_layout_id_seat_number_key" ON "seats"("layout_id", "seat_number");
CREATE INDEX "seats_status_idx" ON "seats"("status");
CREATE INDEX "reservations_trip_id_journey_date_status_idx" ON "reservations"("trip_id", "journey_date", "status");
CREATE INDEX "reservations_expires_at_idx" ON "reservations"("expires_at");
CREATE INDEX "reservation_logs_reservation_id_created_at_idx" ON "reservation_logs"("reservation_id", "created_at");

ALTER TABLE "seats"
  ADD CONSTRAINT "seats_layout_id_fkey"
  FOREIGN KEY ("layout_id") REFERENCES "seat_layouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reservations"
  ADD CONSTRAINT "reservations_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reservation_logs"
  ADD CONSTRAINT "reservation_logs_reservation_id_fkey"
  FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
