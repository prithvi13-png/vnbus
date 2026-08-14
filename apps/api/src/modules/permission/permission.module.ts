import { Module } from "@nestjs/common";

import { PermissionController } from "./controllers/permission.controller";
import { PermissionRepository } from "./repositories/permission.repository";
import { PermissionService } from "./services/permission.service";
import { PermissionValidator } from "./validators/permission.validator";

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository, PermissionValidator],
  exports: [PermissionService],
})
export class PermissionModule {}
