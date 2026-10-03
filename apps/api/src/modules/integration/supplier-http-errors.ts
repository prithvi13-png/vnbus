import { BadRequestException, ConflictException, HttpStatus, Logger } from "@nestjs/common";
import { SrdvApiError, SupplierIntegrationError } from "@vnbus/supplier-sdk";

import { PublicHttpException } from "../../shared/errors/public-http.exception";

const logger = new Logger("SupplierHttpErrors");

const SUPPLIER_DOWN_MESSAGE =
  "The bus operator's booking system is not responding. Please try again in a few minutes.";

/**
 * Turns a supplier failure into the HTTP answer a traveller can act on.
 *
 *  - a request the supplier refused as invalid  -> 400, with the reason
 *  - a seat or booking the supplier turned down -> 409, with the reason
 *  - the supplier unreachable, misconfigured, or
 *    not supporting the operation               -> 503, with a fixed message
 *
 * The 503 never carries the supplier's own text: it can name hosts, status
 * codes or credential problems that are ours to fix, not the traveller's.
 * Anything that is not a supplier error passes through untouched.
 */
export function toSupplierHttpException(error: unknown): unknown {
  if (error instanceof SrdvApiError) {
    // -1 is the client's marker for a transport failure; 2008/2009 are SRDV
    // rejecting our token or IP. Neither is something the traveller caused.
    if (error.errorCode === -1 || error.errorCode === 2008 || error.errorCode === 2009) {
      return supplierDown(error);
    }

    return new ConflictException(error.message);
  }

  if (!(error instanceof SupplierIntegrationError)) {
    return error;
  }

  switch (error.code) {
    case "SUPPLIER_VALIDATION":
      return new BadRequestException(error.message);
    case "SUPPLIER_SEAT_UNAVAILABLE":
    case "SUPPLIER_BOOKING_FAILED":
      return new ConflictException(error.message);
    default:
      return supplierDown(error);
  }
}

function supplierDown(error: Error): PublicHttpException {
  logger.error(JSON.stringify({ event: "supplier.request.failed", message: error.message }));

  return new PublicHttpException(SUPPLIER_DOWN_MESSAGE, HttpStatus.SERVICE_UNAVAILABLE);
}
