import { HttpException } from "@nestjs/common";

/**
 * An HttpException whose message was written for the person using the app.
 * The exception filter normally replaces every 5xx message with "Internal
 * server error" so internals never leak; this marks the few 5xx answers —
 * "the bus operator is not responding" — that a traveller needs to read.
 */
export class PublicHttpException extends HttpException {}
