import { User } from '@app/modules/user/domain/entities';
import { AuthContext, BaseUseCase, QueryParams, ResponsePaginated } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';
import { IUserRepository } from '../repositories';

export class QueryUserUseCase extends BaseUseCase<QueryParams, User[], AuthContext> {
    constructor(private readonly userRepository: IUserRepository) {
        super()
    }
    async execute(input: QueryParams, context?: AuthContext): Promise<UsecaseResult<User[]>> {
        const result = await this.userRepository.query(input);
        logger.info(`[${this.constructor.name}] Queried Users`, { count: result.items.length, input, context });
        return {
            success: true,
            message: 'Users queried successfully.',
            status: 200,
            data: result.items,
            meta: {
                totalCount: result.totalCount,
                filterCount: result.filterCount,
                page: input.options?.page ?? 1,
                limit: input.options?.limit ?? 10,
                sort_by: input.options?.sortField ?? "createdAt",
                sort_dir: (input.options?.sortDir ?? -1) > 0 ? "asc" : "desc"
            }
        }as ResponsePaginated<User>
    }
}