import { logger } from "@app/utils";
import z from "zod";
import { NextFunction, Request, Response } from "express";

type ErrorResponse = {
    success: false;
    description?: string
};

type SuccessResponse<TData> = {
    success: true;
    data: TData;
};

export type ResponseData<TData> = (ErrorResponse | SuccessResponse<TData>) & {
    message: string
    status: number
};

export type ResponseDataPaginated<T> = ResponseData<T[]> & {
    limit: number;
    page: number;
    total: number;
    filterCount: number;
    sortField?: string;
    sortDirection?: string;
};

export type QueryFilter<T> = {
    options?: {
        limit?: number,
        page?: number
    }
    filters?: T,
    projection?: keyof T
}


export const BaseEntitySchema = z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export interface IBaseUseCase<TInput = unknown, TOutPut = unknown, TContext = void> {
    beforeExecute(input?: TInput, context?: TContext): Promise<void>
    execute(input: TInput, context?: TContext): Promise<TOutPut>
    afterExecute(input?: TInput, context?: TContext): Promise<void>
}
export interface IBaseRepository<Entity> {
    create(data: Entity): Promise<Entity>;
    findOne(filter: Partial<Entity>): Promise<Entity | null>;
    findMany(filter: Partial<Entity>, options?: QueryFilter<Partial<Entity>>): Promise<Entity[]>;
    update(id: string, data: Partial<Entity>): Promise<Entity | null>;
    delete(id: string): Promise<boolean>;
}

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly timestamp: string;
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
        this.timestamp = new Date().toISOString();

        logger.error(`${this.name}: ${message}`, { status: this.statusCode });
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    static notFound(message: string): AppError {
        return new AppError(message, 404);
    }

    static badRequest(message: string): AppError {
        return new AppError(message, 400);
    }

    static unauthorized(message: string): AppError {
        return new AppError(message, 401);
    }

    static forbidden(message: string): AppError {
        return new AppError(message, 403);
    }

    static internalServerError(message: string): AppError {
        return new AppError(message, 500);
    }

    static conflict(message: string): AppError {
        return new AppError(message, 409);
    }

    static validationError(message: string): AppError {
        return new AppError(message, 422);
    }
}

export function ApiHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            next(error);
        }
    }
}