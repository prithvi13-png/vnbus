import type { Request } from "express";

import type { JwtPrincipal } from "./jwt-principal.interface";

export interface AuthenticatedRequest extends Request {
  user?: JwtPrincipal;
}
