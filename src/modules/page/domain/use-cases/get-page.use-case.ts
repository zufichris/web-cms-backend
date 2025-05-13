
import { Page } from '@app/modules/page/domain/entities';
import { AppError, BaseUseCase, ParamIdValidationSchema } from '@app/shared';
import { AuthContext } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';
import { IPageRepository } from '../repositories';
import z from 'zod';

export class GetPageUseCase extends BaseUseCase<{ pageId?: string, slug?: string }, Page, AuthContext> {
    constructor(private readonly pageRepository: IPageRepository) {
        super();
    }

    async beforeExecute(input: { pageId?: string, slug?: string }): Promise<void> {
        if (!input.pageId && !input.slug) {
            throw AppError.validationError("Page ID or slug is required")
        }
        if (input.pageId)
            ParamIdValidationSchema.parse(input.pageId)
        else
            z.string({
                message: "Invalid Page Slug"
            }).parse(input.slug)
    }

    async execute(input: { pageId: string, slug: string }, context?: AuthContext): Promise<UsecaseResult<Page>> {
        try {
            let entity: Page
            if (input.pageId) {
                entity = await this.pageRepository.findById(input.pageId);
            } else {
                entity = await this.pageRepository.findBySlug(input.slug)
            }
            return {
                success: true,
                message: 'Page retrieved successfully.',
                status: 200,
                data: entity
            };
        } catch (error) {
            logger.error(this.constructor.name.concat(":Failed"), { error, input, context });
            throw error;
        }
    }
}