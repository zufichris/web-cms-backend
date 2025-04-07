import {
  ApiResponse,
  ApiResponseTypes,
} from "@app/shared/application/dtos/response";
import { NextFunction, Request, Response } from "express";

export const responseExtenderMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.json_structured = function (
    response: ApiResponse<unknown, any>,
  ): Response {
    return res.status(response.status).json(response);
  };
  res.error = function (
    error: ApiResponse<void, ApiResponseTypes.Error>,
  ): Response {
    return res.status(error.status).json(error);
  };
  next();
};
