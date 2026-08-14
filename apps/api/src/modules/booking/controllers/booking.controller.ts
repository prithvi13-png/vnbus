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

  @Public()
  @Get("bookings")
  @ApiOkResponse({ description: "Mock booking history" })
  listBookings(): BookingRecord[] {
    return this.service.listBookings();
  }

  @Public()
  @Get("bookings/history")
  @ApiOkResponse({ description: "Full booking history with lifecycle timeline" })
  getHistory(): BookingHistoryResponse {
    return this.service.getHistory();
  }

  @Public()
  @Get("bookings/upcoming")
  @ApiOkResponse({ description: "Upcoming customer trips" })
  listUpcoming(): BookingRecord[] {
    return this.service.listUpcoming();
  }

  @Public()
  @Get("bookings/past")
  @ApiOkResponse({ description: "Past customer trips" })
  listPast(): BookingRecord[] {
    return this.service.listPast();
  }

  @Public()
  @Get("bookings/cancelled")
  @ApiOkResponse({ description: "Cancelled customer trips" })
  listCancelled(): BookingRecord[] {
    return this.service.listCancelled();
  }

  @Public()
  @Get("bookings/:id")
  @ApiOkResponse({ description: "Mock booking details" })
  getBooking(@Param("id") id: string): BookingRecord {
    const booking = this.service.getBooking(id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  }

  @Public()
  @Post("bookings/create")
  @ApiOkResponse({ description: "Create pending-payment booking from held seats" })
  createBooking(@Body() dto: CreateBookingDto): Promise<BookingRecord> {
    return this.service.createBooking(dto);
  }

  @Public()
  @Post("bookings/confirm")
  @ApiOkResponse({ description: "Confirm mock booking and generate ticket" })
  confirmBooking(@Body() dto: ConfirmBookingDto): Promise<BookingConfirmationResponse> {
    return this.service.confirmBooking(dto);
  }

  @Public()
  @Post("bookings/cancel")
  @ApiOkResponse({ description: "Mock booking cancellation" })
  cancelBooking(@Body() dto: CancelBookingDto): Promise<CancelBookingResponse> {
    return this.service.cancelBooking(dto);
  }

  @Public()
  @Post("bookings/reschedule")
  @ApiOkResponse({ description: "Mock booking reschedule architecture flow" })
  rescheduleBooking(@Body() dto: RescheduleBookingDto): Promise<RescheduleBookingResponse> {
    return this.service.rescheduleBooking(dto);
  }
}
