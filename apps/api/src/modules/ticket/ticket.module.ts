import { Module } from "@nestjs/common";

import { EmailModule } from "../../shared/email/email.module";
import { BookingModule } from "../booking/booking.module";
import { NotificationModule } from "../notification/notification.module";
import { TimelineModule } from "../timeline/timeline.module";
import { TicketController } from "./controllers/ticket.controller";
import { TicketMapper } from "./mappers/ticket.mapper";
import { TicketRepository } from "./repositories/ticket.repository";
import { TicketService } from "./services/ticket.service";
import { TicketModuleValidator } from "./validators/ticket.validator";

@Module({
  imports: [BookingModule, EmailModule, TimelineModule, NotificationModule],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, TicketModuleValidator, TicketMapper],
  exports: [TicketService],
})
export class TicketModule {}
