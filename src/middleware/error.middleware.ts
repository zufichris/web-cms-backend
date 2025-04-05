import { Request, Response, NextFunction } from "express";
import { logger } from "../utils";
import { ResponseData } from "@app/shared/types/response";

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = AppError.notFound(`Resource not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (!(error instanceof AppError)) {
    error = AppError.internal("An unexpected error occurred", {
      isOperational: false,
      cause: error,
    });
  }

  const appError = error as AppError;
  const problemDetails = appError.toProblemDetails(req);

  logger.error(appError.toString(), {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.id,
    ...problemDetails,
  });

  const response: ResponseData = {
    success: false,
    error: problemDetails,
  };

  res.status(appError.statusCode).json(response);
};