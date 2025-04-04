import { ApiHandler, AppError, ResponseData } from "@app/shared"
import { Request, Response } from "express"
import { logger } from "@app/utils"

export const notfoundHandler = ApiHandler((req: Request, res: Response) => {
    const error = AppError.notFound(`Resource Notfound ${req.url}`);
    logger.error(error.message, error.statusCode)
    const response: ResponseData<undefined> = {
        success: false,
        message: error.message,
        status: error.statusCode,
        description: "We could not find the resource you are looking for",
    }
    res.status(response.status).json(response)
    return Promise.resolve();
})

export const errorHandler = (err: Error, _: Request, res: Response) => {
    logger.error(err.message, err);
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const response: ResponseData<undefined> = {
        status: statusCode,
        message: err.message,
        success: false,
        description: `An Error Occurred with status code ${statusCode}`,
    }
    res.status(statusCode).json(response);
    return Promise.resolve();
}