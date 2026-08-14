import { Module } from "@nestjs/common";

import { BookingModule } from "../booking/booking.module";
import { TicketModule } from "../ticket/ticket.module";
import { AdminController } from "./controllers/admin.controller";
import { AdminRepository } from "./repositories/admin.repository";
import { AdminService } from "./services/admin.service";
import { AdminModuleValidator } from "./validators/admin.validator";

@Module({
  imports: [BookingModule, TicketModule],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, AdminModuleValidator],
  exports: [AdminService],
})
export class AdminModule {}
