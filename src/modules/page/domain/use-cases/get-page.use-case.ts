
import { Page } from '@app/modules/page/domain/entities';
import { BaseUseCase, ParamIdValidationSchema } from '@app/shared';
import { AuthContext } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';
import { IPageRepository } from '../repositories';

export class GetPageUseCase extends BaseUseCase<string, Page, AuthContext> {
    constructor(private readonly pageRepository: IPageRepository) {
        super();
    }

    async beforeExecute(id: string): Promise<void> {
        ParamIdValidationSchema.parse(id);
    }

    async execute(id: string, context?: AuthContext): Promise<UsecaseResult<Page>> {
        try {
            const entity = await this.pageRepository.findById(id);
            const page = await this.pageRepository.findBySlug(entity.slug)
            return {
                success: true,
                message: 'Page retrieved successfully.',
                status: 200,
                data: page
            };
        } catch (error) {
            logger.error(this.constructor.name.concat(":Failed"), { error, id, context });
            throw error;
        }
    }
}