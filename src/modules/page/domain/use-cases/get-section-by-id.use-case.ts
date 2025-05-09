import { Section } from '@app/modules/page/domain/entities';
import { BaseUseCase, ParamIdValidationSchema, UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { IPageRepository } from '../repositories';

export class GetPageSectionByIdUseCase extends BaseUseCase<{ pageId: string, sectionId: string }, Section, AuthContext> {
    constructor(private readonly pageRepository: IPageRepository) {
        super();
    }

    async beforeExecute(input: { pageId: string, sectionId: string }): Promise<void> {
        ParamIdValidationSchema.parse(input.sectionId)
    }

    async execute(input: { pageId: string, sectionId: string }, _context?: AuthContext): Promise<UsecaseResult<Section>> {
        const section = await this.pageRepository.findSection(input.sectionId);
        return {
            success: true,
            message: 'Section Retrieved successfully.',
            status: 201,
            data: section
        };
    }
}