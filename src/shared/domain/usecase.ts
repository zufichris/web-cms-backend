import {
  ErrorResponse,
  ResponseDefault,
  ResponsePaginated,
} from "../application";

export type UsecaseResult<T> =
  | ResponseDefault<T>
  | ResponsePaginated<T>
  | ErrorResponse;

export interface IBaseUseCase<
  TInput = unknown,
  TOutput = unknown,
  TContext = void,
> {
  beforeExecute?(input?: TInput, context?: TContext): Promise<void>;
  execute(input: TInput, context?: TContext): Promise<UsecaseResult<TOutput>>;
  afterExecute?(
    result?: UsecaseResult<TOutput>,
    input?: TInput,
    context?: TContext,
  ): Promise<void>;
}
