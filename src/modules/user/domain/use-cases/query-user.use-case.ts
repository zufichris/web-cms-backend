import { User } from '@app/modules/user/domain/entities';
import { BaseUserUseCase } from '@app/modules/user/domain/use-cases/base';
import { AuthContext, QueryParams } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';

export class QueryUserUseCase extends BaseUserUseCase<QueryParams<Array<keyof User>>, User[]> {
    async execute(input: QueryParams<Array<keyof User>>, context?: AuthContext): Promise<UsecaseResult<User[]>> {
        try {
            const result = await this.userRepository.query(input);
            logger.info(`[${this.constructor.name}] Queried Users`, { count: result.items.length, input, context });
            return {
                success: true,
                message: 'Users queried successfully.',
                status: 200,
                data: result.items,
                meta: { total: result.totalCount, filterCount: result.filterCount, page: input.options?.page ?? 1, limit: input.options?.limit ?? 10 }
            };
        } catch (error) {
            logger.error(`[${this.constructor.name}] Failed to query Users`, { error, input, context });
            throw error;
        }
    }
}