import { Module } from "@nestjs/common";

import { BookingModule } from "../booking/booking.module";
import { BookingHistoryController } from "./controllers/booking-history.controller";
import { BookingHistoryRepository } from "./repositories/booking-history.repository";
import { BookingHistoryService } from "./services/booking-history.service";
import { BookingHistoryModuleValidator } from "./validators/booking-history.validator";

@Module({
  imports: [BookingModule],
  controllers: [BookingHistoryController],
  providers: [BookingHistoryService, BookingHistoryRepository, BookingHistoryModuleValidator],
  exports: [BookingHistoryService],
})
export class BookingHistoryModule {}
