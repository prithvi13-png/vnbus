import { Body, Controller, Get, NotFoundException, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type {
  BookingConfirmationResponse,
  BookingHistoryResponse,
  BookingRecord,
  CancelBookingResponse,
  RescheduleBookingResponse,
} from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { BookingSummaryDto } from "../dto/booking-summary.dto";
import {
  CancelBookingDto,
  ConfirmBookingDto,
  CreateBookingDto,
  RescheduleBookingDto,
} from "../dto/booking-workflow.dto";
import { BookingService } from "../services/booking.service";

@ApiTags("Booking")
@ApiBearerAuth()
@Controller()
export class BookingController {
  constructor(private readonly service: BookingService) {}

  // Health is the only public route here: booking now requires a signed-in
  // user, so create/confirm and the per-customer listings sit behind the
  // JWT guard rather than opting out of it.
  @Public()
  @Get("booking/health")
  getHealth(): BookingSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("booking/capabilities")
  getCapabilities(): BookingSummaryDto {
    return this.service.getSummary();
  }

  @Get("bookings")
  @ApiOkResponse({ description: "Booking history" })
  listBookings(): BookingRecord[] {
    return this.service.listBookings();
  }

  @Get("bookings/history")
  @ApiOkResponse({ description: "Full booking history with lifecycle timeline" })
  getHistory(): BookingHistoryResponse {
    return this.service.getHistory();
  }

  @Get("bookings/upcoming")
  @ApiOkResponse({ description: "Upcoming customer trips" })
  listUpcoming(): BookingRecord[] {
    return this.service.listUpcoming();
  }

  @Get("bookings/past")
  @ApiOkResponse({ description: "Past customer trips" })
  listPast(): BookingRecord[] {
    return this.service.listPast();
  }

  @Get("bookings/cancelled")
  @ApiOkResponse({ description: "Cancelled customer trips" })
  listCancelled(): BookingRecord[] {
    return this.service.listCancelled();
  }

  @Get("bookings/:id")
  @ApiOkResponse({ description: "Booking details" })
  getBooking(@Param("id") id: string): BookingRecord {
    const booking = this.service.getBooking(id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  }

  @Post("bookings/create")
  @ApiOkResponse({ description: "Create pending-payment booking from held seats" })
  createBooking(@Body() dto: CreateBookingDto): Promise<BookingRecord> {
    return this.service.createBooking(dto);
  }

  @Post("bookings/confirm")
  @ApiOkResponse({ description: "Confirm booking and generate ticket" })
  confirmBooking(@Body() dto: ConfirmBookingDto): Promise<BookingConfirmationResponse> {
    return this.service.confirmBooking(dto);
  }

  @Post("bookings/cancel")
  @ApiOkResponse({ description: "Booking cancellation" })
  cancelBooking(@Body() dto: CancelBookingDto): Promise<CancelBookingResponse> {
    return this.service.cancelBooking(dto);
  }

  @Post("bookings/reschedule")
  @ApiOkResponse({ description: "Booking reschedule flow" })
  rescheduleBooking(@Body() dto: RescheduleBookingDto): Promise<RescheduleBookingResponse> {
    return this.service.rescheduleBooking(dto);
  }
}
