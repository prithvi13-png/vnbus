import { Module } from "@nestjs/common";

import { RoleController } from "./controllers/role.controller";
import { RoleRepository } from "./repositories/role.repository";
import { RoleService } from "./services/role.service";
import { RoleValidator } from "./validators/role.validator";

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, RoleValidator],
  exports: [RoleService, RoleRepository],
})
export class RoleModule {}
