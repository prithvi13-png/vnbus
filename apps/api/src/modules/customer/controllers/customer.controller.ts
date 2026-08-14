import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type {
  AgentCustomerDetailsResponse,
  AgentCustomerListResponse,
  AgentCustomerRecord,
} from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import {
  AgentCustomerListQueryDto,
  CreateAgentCustomerDto,
  UpdateAgentCustomerDto,
} from "../dto/agent-customer.dto";
import { CustomerSummaryDto } from "../dto/customer-summary.dto";
import { CustomerService } from "../services/customer.service";

@ApiTags("Customer")
@ApiBearerAuth()
@Controller()
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @Public()
  @Get("customer/health")
  getHealth(): CustomerSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("customer/capabilities")
  getCapabilities(): CustomerSummaryDto {
    return this.service.getSummary();
  }

  @Public()
  @Get("agent/customers")
  @ApiOkResponse({ description: "Agent-managed customer list with search and pagination" })
  listAgentCustomers(@Query() query: AgentCustomerListQueryDto): AgentCustomerListResponse {
    return this.service.listCustomers(query);
  }

  @Public()
  @Get("agent/customers/:id")
  @ApiOkResponse({ description: "Agent-managed customer profile with booking history" })
  getAgentCustomer(@Param("id") id: string): AgentCustomerDetailsResponse {
    return this.service.getCustomerDetails(id);
  }

  @Public()
  @Post("agent/customers")
  @ApiOkResponse({ description: "Create agent-managed customer" })
  createAgentCustomer(@Body() dto: CreateAgentCustomerDto): AgentCustomerRecord {
    return this.service.createCustomer(dto);
  }

  @Public()
  @Patch("agent/customers/:id")
  @ApiOkResponse({ description: "Update agent-managed customer" })
  updateAgentCustomer(
    @Param("id") id: string,
    @Body() dto: UpdateAgentCustomerDto,
  ): AgentCustomerRecord {
    return this.service.updateCustomer(id, dto);
  }

  @Public()
  @Delete("agent/customers/:id")
  @ApiOkResponse({ description: "Delete agent-managed customer" })
  deleteAgentCustomer(@Param("id") id: string): { customerId: string; deleted: boolean } {
    return this.service.deleteCustomer(id);
  }
}
