export interface ModuleCapability {
  name: string;
  description: string;
}

export interface ModuleSummary {
  module: string;
  boundedContext: string;
  status: "READY_FOR_INTEGRATION";
  capabilities: ModuleCapability[];
}
