import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { logger } from "../utils";
import { ValidatedRequestSchema } from "@app/shared/validation/request.validation";

export const universalValidator = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.validated = ValidatedRequestSchema.parse({
        params: req.params,
        body: req.body,
        query: req.query,
        headers: req.headers,
      });
      validateRequestSecurity(req);
      next();
    } catch (error) {
      handleValidationError(error, res, next);
    }
  };
};

const validateRequestSecurity = (req: Request) => {
  const securityHeaders = [
    "content-security-policy",
    "x-frame-options",
    "x-content-type-options",
  ];

  securityHeaders.forEach((header) => {
    if (!req.headers[header]) {
      logger.warn(`Missing security header: ${header}`);
    }
  });

  if (req.method !== "GET" && !req.headers["content-type"]) {
    throw new Error("Missing Content-Type header");
  }
};

const handleValidationError = (
  error: unknown,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      status: "error",
      code: "VALIDATION_FAILED",
      issues: error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    });
  } else if (error instanceof Error) {
    res.status(400).json({
      status: "error",
      code: "INVALID_REQUEST",
      message: error.message,
    });
  } else {
    next(error);
  }
};