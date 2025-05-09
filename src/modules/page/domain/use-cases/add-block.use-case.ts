
import { AddContentBlockDto } from '@app/modules/page/application/dtos';
import { ContentBlock, Section } from '@app/modules/page/domain/entities';
import { AppError, BaseUseCase, UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { AddContentBlockValidationSchema } from '../../infrastructure';
import { IPageRepository } from '../repositories';

export class AddBlockContentUseCase extends BaseUseCase<AddContentBlockDto, Section, AuthContext> {
    constructor(private readonly pageRepository: IPageRepository) {
        super();
    }

    async beforeExecute(input: AddContentBlockDto): Promise<void> {
        AddContentBlockValidationSchema.parse(input)
    }

    async execute(input: AddContentBlockDto, _context?: AuthContext): Promise<UsecaseResult<Section>> {
        const prev = await this.pageRepository.findSection(input.sectionId)

        if (prev.blocks[input.key]) {
            throw AppError.conflict(
                `Block with key ${input.key} exists on section ${prev.name}`
            )
        }
        const updatedBlocks: Record<string, ContentBlock> = {
            ...prev.blocks,
            [input.key]: input.block,
        }
        const section = await this.pageRepository.updateSection(input.sectionId, { blocks: updatedBlocks });
        return {
            success: true,
            message: 'Block added successfully.',
            status: 201,
            data: section
        };
    }
}