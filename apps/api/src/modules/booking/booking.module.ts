import { Module } from "@nestjs/common";

import { EmailModule } from "../../shared/email/email.module";
import { NotificationModule } from "../notification/notification.module";
import { SeatModule } from "../seat/seat.module";
import { TimelineModule } from "../timeline/timeline.module";
import { BookingController } from "./controllers/booking.controller";
import { BookingRepository } from "./repositories/booking.repository";
import { BookingService } from "./services/booking.service";
import { BookingModuleValidator } from "./validators/booking.validator";

@Module({
  imports: [SeatModule, EmailModule, TimelineModule, NotificationModule],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository, BookingModuleValidator],
  exports: [BookingService],
})
export class BookingModule {}
