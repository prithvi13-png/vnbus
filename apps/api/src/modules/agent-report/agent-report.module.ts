import { Module } from "@nestjs/common";

import { BookingModule } from "../booking/booking.module";
import { CustomerModule } from "../customer/customer.module";
import { AgentReportController } from "./controllers/agent-report.controller";
import { AgentReportMapper } from "./mappers/agent-report.mapper";
import { AgentReportRepository } from "./repositories/agent-report.repository";
import { AgentReportService } from "./services/agent-report.service";
import { AgentReportValidator } from "./validators/agent-report.validator";

@Module({
  imports: [BookingModule, CustomerModule],
  controllers: [AgentReportController],
  providers: [AgentReportService, AgentReportRepository, AgentReportValidator, AgentReportMapper],
  exports: [AgentReportService],
})
export class AgentReportModule {}
