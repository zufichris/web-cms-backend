
import { Page } from '@app/modules/page/domain/entities';
import { AuthContext, BaseUseCase, QueryParams } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';
import { IPageRepository } from '../repositories';

export class QueryPageUseCase extends BaseUseCase<QueryParams, Page[], AuthContext> {
    constructor(private readonly pageRepository: IPageRepository) {
        super();
    }
    
    async execute(input: QueryParams, context?: AuthContext): Promise<UsecaseResult<Page[]>> {
        const result = await this.pageRepository.query(input);
        return {
            success: true,
            message: 'Page queried successfully.',
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
        };
    }
}