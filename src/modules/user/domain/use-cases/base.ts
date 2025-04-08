
import { IUserRepository } from '@app/modules/user/domain/repositories';
import { AppError, IBaseUseCase } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { logger } from '@app/utils/logger';

export abstract class BaseUserUseCase<TInput, TOutput> implements IBaseUseCase<TInput, TOutput, AuthContext> {
    constructor(protected readonly userRepository: IUserRepository) { }

    async beforeExecute(input: TInput, context?: AuthContext): Promise<void> {
        logger.debug(`[${this.constructor.name}] Before execute`, { input, context });
    }

    abstract execute(input: TInput, context?: AuthContext): Promise<UsecaseResult<TOutput>>;

    async afterExecute(result: UsecaseResult<TOutput>, _: TInput, context?: AuthContext): Promise<void> {
        const logPayload = { resultSummary: { success: result.success, status: result.status }, context };
        if (result.success) {
            logger.debug(`[${this.constructor.name}] After execute (Success)`, logPayload);
        } else {
            logger.warn(`[${this.constructor.name}] After execute (Failure)`, { ...logPayload, error: result.message });
        }
    }

    async run(input: TInput, context?: AuthContext): Promise<UsecaseResult<TOutput>> {
        let result: UsecaseResult<TOutput>;
        try {
            await this.beforeExecute(input, context);
            result = await this.execute(input, context);
            await this.afterExecute(result, input, context);
            return result;
        } catch (error: unknown) {
            logger.error(`[${this.constructor.name}] Unhandled error`, { error, input, context });
            if (error instanceof AppError) {
                result = error.error
            } else {
                const internalError = AppError.internal();
                result = internalError.error
            }
            await this.afterExecute(result, input, context);
            return result;
        }
    }
}