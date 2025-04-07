import { logger } from "@app/utils";
import { ErrorResponse } from "./dtos/response";
import { env } from "@app/config/env";

export class AppError extends Error {
  public readonly error: ErrorResponse;
  constructor(
    message: string,
    statusCode: number = 500,
    options: {
      code?: string;
      isOperational?: boolean;
      cause?: Error;
      details?: string;
      instance?: string;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.error = {
      error: {
        type: options.code,
        timestamp: new Date().toISOString(),
        code: options.code,
        detail:
          options.details ??
          `https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${statusCode}`,
        instance: options.instance,
        stack: env.in_prod ? undefined : this.stack,
      },
      message: message,
      status: statusCode,
    };
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    logger.error(this.toString(), { error: this });
  }

  toString() {
    return `${this.name} [${this.error.error.code || "NO_CODE"}] (${this.error.status}): ${this.message}`;
  }

  static notFound(message: string, code = "RESOURCE_NOT_FOUND") {
    return new AppError(message, 404, { code });
  }

  static badRequest(message: string, code = "BAD_REQUEST") {
    return new AppError(message, 400, { code });
  }

  static unauthorized(message: string, code = "UNAUTHORIZED") {
    return new AppError(message, 401, { code });
  }

  static forbidden(message: string, code = "FORBIDDEN") {
    return new AppError(message, 403, { code });
  }

  static conflict(message: string, code = "CONFLICT") {
    return new AppError(message, 409, { code });
  }

  static validationError(message: string, code = "VALIDATION_ERROR") {
    return new AppError(message, 422, { code });
  }

  static internal(
    message?: string,
    options: { code?: string; cause?: Error } = { code: "INTERNAL_ERROR" },
  ) {
    return new AppError(message ?? "An Unexpected Error Occured", 500, {
      code: options.code,
      isOperational: false,
      cause: options.cause,
    });
  }
}
