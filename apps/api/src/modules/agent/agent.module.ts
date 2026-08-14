import { Module } from "@nestjs/common";

import { BookingModule } from "../booking/booking.module";
import { CustomerModule } from "../customer/customer.module";
import { NotificationModule } from "../notification/notification.module";
import { AgentController } from "./controllers/agent.controller";
import { AgentMapper } from "./mappers/agent.mapper";
import { AgentRepository } from "./repositories/agent.repository";
import { AgentService } from "./services/agent.service";
import { AgentModuleValidator } from "./validators/agent.validator";

@Module({
  imports: [BookingModule, CustomerModule, NotificationModule],
  controllers: [AgentController],
  providers: [AgentService, AgentRepository, AgentModuleValidator, AgentMapper],
  exports: [AgentService],
})
export class AgentModule {}
