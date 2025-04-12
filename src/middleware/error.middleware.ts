import { NextFunction, Request, Response } from "express";
import { logger } from "../utils";
import { AppError } from "@app/shared/application/app.error";
import { ApiHandler } from "@app/shared/infrastructure/http/api-handler";
import { ZodError } from "zod";

export const notFoundMiddleware = ApiHandler((req, _, next) => {
  const error = AppError.notFound(
    `Resource not found: ${req.method} ${req.originalUrl}`,
  );
  next(error);
});

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  let error: AppError;
  if (err instanceof ZodError) {
    error = AppError.validationError(`validation error: ${err.errors.map(e => `${e.path} ${e.message}`).join()}`)
  } else if (err instanceof AppError) {
    error = err
  } else {
    error = AppError.internal()
  }
  logger.error(error.error?.message || error.message, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    error: error.error || error,
    originalError: err
  });

  res.status(error.error?.status).json(error.error);
};
