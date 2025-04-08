import { AppError } from "@app/shared/application/app.error";
import { ValidatedRequestSchema } from "@app/shared/application/dtos/request";
import { logger } from "@app/utils";
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function requestValidator() {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      const validated = ValidatedRequestSchema.parse({
        params: req.params,
        body: req.body,
        query: req.query,
        headers: req.headers,
      });
      req.validated = validated
      validateRequestSecurity(req)
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw AppError.validationError(
          error.errors.map((e) => e.message).join(","),
        );
      } else {
        throw AppError.internal();
      }
    }
  };
}

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
