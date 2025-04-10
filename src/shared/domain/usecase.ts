import { ZodError } from "zod";
import {
  AppError,
  ErrorResponse,
  ResponseDefault,
  ResponsePaginated,
} from "../application";
import { logger } from "@app/utils";

export type UsecaseResult<T> =
  | ResponseDefault<T>
  | ResponsePaginated<T>
  | ErrorResponse;

interface IBaseUseCase<
  TInput = unknown,
  TOutput = unknown,
  TContext = void,
> {
  beforeExecute?(input?: TInput, context?: TContext): void | Promise<void>;
  execute(input: TInput, context?: TContext): Promise<UsecaseResult<TOutput>>;
  afterExecute?(
    result?: UsecaseResult<TOutput>,
    input?: TInput,
    context?: TContext,
  ): Promise<void>;
}

export abstract class BaseUseCase<
  TInput = unknown,
  TOutput = unknown,
  TContext = void,
> implements IBaseUseCase<TInput, TOutput, TContext> {
  constructor() { }
  async beforeExecute(input?: TInput, context?: TContext): Promise<void> {
    logger.info(`Preparing ${this.constructor.name}`, {
      input,
      context
    })
  }
  abstract execute(input: TInput, context?: TContext): Promise<UsecaseResult<TOutput>>;
  async afterExecute?(
    _result?: UsecaseResult<TOutput>,
    _input?: TInput,
    _context?: TContext,
  ): Promise<void> {
    logger.info(`[${this.constructor.name}] Result Summary`, {
      success: _result?.success,
      message: _result?.message
    })
  }

  protected handleError(error: unknown) {
    logger.error(`[${this.constructor.name}] Failed`, { error });
    if (error instanceof ZodError) {
      const message = error.errors.map(e => `${e.path}:${e.message}`).join(",")
      return AppError.validationError(message)
    } else if (error instanceof AppError) {
      return error
    }
    return AppError.internal()
  }

  public async run(input: TInput, context: TContext): Promise<UsecaseResult<TOutput>> {
    let result: UsecaseResult<TOutput>;
    try {
      if (this.beforeExecute) await this.beforeExecute(input, context);
      result = await this.execute(input, context);
      if (this.afterExecute) await this.afterExecute(result, input, context);
      return result;
    } catch (error) {
      const result = this.handleError(error)
      if (this.afterExecute) await this.afterExecute(result.error, input, context);
      return result.error
    }
  }
}
