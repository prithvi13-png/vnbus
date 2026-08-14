import { Module } from "@nestjs/common";

import { AuditController } from "./controllers/audit.controller";
import { AuditRepository } from "./repositories/audit.repository";
import { AuditService } from "./services/audit.service";
import { AuditModuleValidator } from "./validators/audit.validator";

@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditRepository, AuditModuleValidator],
  exports: [AuditService],
})
export class AuditModule {}
