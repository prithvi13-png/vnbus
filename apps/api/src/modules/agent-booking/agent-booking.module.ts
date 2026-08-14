import { Module } from "@nestjs/common";

import { AgentModule } from "../agent/agent.module";
import { BookingModule } from "../booking/booking.module";
import { CustomerModule } from "../customer/customer.module";
import { TicketModule } from "../ticket/ticket.module";
import { AgentBookingController } from "./controllers/agent-booking.controller";
import { AgentBookingMapper } from "./mappers/agent-booking.mapper";
import { AgentBookingRepository } from "./repositories/agent-booking.repository";
import { AgentBookingService } from "./services/agent-booking.service";
import { AgentBookingValidator } from "./validators/agent-booking.validator";

@Module({
  imports: [AgentModule, BookingModule, CustomerModule, TicketModule],
  controllers: [AgentBookingController],
  providers: [
    AgentBookingService,
    AgentBookingRepository,
    AgentBookingValidator,
    AgentBookingMapper,
  ],
  exports: [AgentBookingService],
})
export class AgentBookingModule {}
