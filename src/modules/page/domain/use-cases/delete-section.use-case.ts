
import { BaseUseCase, ParamIdValidationSchema, UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { IPageRepository } from '../repositories';

export class DeletePageSectionUseCase extends BaseUseCase<{ sectionId: string }, boolean, AuthContext> {
    constructor(private readonly pageRepository: IPageRepository) {
        super();
    }

    async beforeExecute(input: { sectionId: string }): Promise<void> {
        ParamIdValidationSchema.parse(input.sectionId)
    }

    async execute(input: { sectionId: string }, _context?: AuthContext): Promise<UsecaseResult<boolean>> {
        const deleted: boolean = await this.pageRepository.deleteSection(input.sectionId);
        return {
            success: true,
            message: 'Section Added successfully.',
            status: 201,
            data: deleted
        };
    }
}