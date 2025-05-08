
import { Section } from '@app/modules/page/domain/entities';
import { BaseUseCase, ParamIdValidationSchema, UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { IPageRepository } from '../repositories';
import z from 'zod';

export class DeleteBlockContentUseCase extends BaseUseCase<{ sectionId: string, key: string }, Section, AuthContext> {
    constructor(private readonly pageRepository: IPageRepository) {
        super();
    }

    async beforeExecute(input: { sectionId: string, key: string }): Promise<void> {
        z.string({
            message: "Invalid key"
        }).parse(input.key)
        ParamIdValidationSchema.parse(input.sectionId)
    }

    async execute(input: { sectionId: string, key: string }, _context?: AuthContext): Promise<UsecaseResult<Section>> {
        const prev = await this.pageRepository.findSection(input.sectionId)

        if (prev.blocks[input.key]) {
            delete prev.blocks[input.key]
        }
        const section = await this.pageRepository.updateSection(input.sectionId, { blocks: prev.blocks });
        return {
            success: true,
            message: 'Block deleted successfully.',
            status: 201,
            data: section
        };
    }
}