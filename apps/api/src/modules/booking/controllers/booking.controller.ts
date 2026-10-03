import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type {
  BookingConfirmationResponse,
  BookingHistoryResponse,
  BookingRecord,
  BookingTimelineEvent,
  CancelBookingResponse,
} from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../../shared/security/interfaces/authenticated-request.interface";
import { requirePrincipal } from "../../../shared/security/require-user";
import { BookingSummaryDto } from "../dto/booking-summary.dto";
import { CancelBookingDto, CreateBookingDto } from "../dto/booking-workflow.dto";
import { BookingService } from "../services/booking.service";

@ApiTags("Booking")
@ApiBearerAuth()
@Controller()
export class BookingController {
  constructor(private readonly service: BookingService) {}

  // Health is the only public route here. Everything else is the signed-in
  // user's own bookings: real tickets with passenger names and phone numbers.
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
  @ApiOkResponse({ description: "The signed-in user's bookings" })
  listBookings(@Req() request: AuthenticatedRequest): Promise<BookingRecord[]> {
    return this.service.listBookings(requirePrincipal(request));
  }

  @Get("bookings/history")
  @ApiOkResponse({ description: "Booking history with lifecycle timeline" })
  getHistory(@Req() request: AuthenticatedRequest): Promise<BookingHistoryResponse> {
    return this.service.getHistory(requirePrincipal(request));
  }

  @Get("bookings/upcoming")
  @ApiOkResponse({ description: "Upcoming trips" })
  listUpcoming(@Req() request: AuthenticatedRequest): Promise<BookingRecord[]> {
    return this.service.listUpcoming(requirePrincipal(request));
  }

  @Get("bookings/past")
  @ApiOkResponse({ description: "Past trips" })
  listPast(@Req() request: AuthenticatedRequest): Promise<BookingRecord[]> {
    return this.service.listPast(requirePrincipal(request));
  }

  @Get("bookings/cancelled")
  @ApiOkResponse({ description: "Cancelled trips" })
  listCancelled(@Req() request: AuthenticatedRequest): Promise<BookingRecord[]> {
    return this.service.listCancelled(requirePrincipal(request));
  }

  @Get("bookings/:id")
  @ApiOkResponse({ description: "Booking details" })
  getBooking(
    @Param("id") id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<BookingRecord> {
    return this.service.getBookingForUser(id, requirePrincipal(request));
  }

  @Get("bookings/:id/timeline")
  @ApiOkResponse({ description: "Booking lifecycle timeline" })
  getTimeline(
    @Param("id") id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<BookingTimelineEvent[]> {
    return this.service.getTimeline(id, requirePrincipal(request));
  }

  @Post("bookings/create")
  @ApiOkResponse({ description: "Book the selected seats with the supplier and issue the ticket" })
  createBooking(
    @Body() dto: CreateBookingDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<BookingConfirmationResponse> {
    return this.service.createBooking(dto, requirePrincipal(request));
  }

  @Post("bookings/cancel")
  @ApiOkResponse({ description: "Ask the supplier to cancel the booking" })
  cancelBooking(
    @Body() dto: CancelBookingDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<CancelBookingResponse> {
    return this.service.cancelBooking(dto, requirePrincipal(request));
  }
}
