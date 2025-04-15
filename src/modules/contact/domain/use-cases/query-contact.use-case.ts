
import { Contact } from '@app/modules/contact/domain/entities';
import { AuthContext, BaseUseCase, QueryParams } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';
import { IContactRepository } from '../repositories';

export class QueryContactUseCase extends BaseUseCase<QueryParams, Contact[], AuthContext> {
    constructor(private readonly contactRepository: IContactRepository) {
        super();
    }
    
    async execute(input: QueryParams, context?: AuthContext): Promise<UsecaseResult<Contact[]>> {
        const result = await this.contactRepository.query(input);
        return {
            success: true,
            message: 'Contact queried successfully.',
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