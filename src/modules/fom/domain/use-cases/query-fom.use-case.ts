
import { Fom } from '@app/modules/fom/domain/entities';
import { AuthContext, BaseUseCase, QueryParams } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';
import { IFomRepository } from '../repositories';

export class QueryFomUseCase extends BaseUseCase<QueryParams, Fom[], AuthContext> {
    constructor(private readonly fomRepository: IFomRepository) {
        super();
    }
    
    async execute(input: QueryParams, context?: AuthContext): Promise<UsecaseResult<Fom[]>> {
        const result = await this.fomRepository.query(input);
        return {
            success: true,
            message: 'Fom queried successfully.',
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