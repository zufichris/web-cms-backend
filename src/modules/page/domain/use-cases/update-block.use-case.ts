
import { UpdateContentBlockDto } from '@app/modules/page/application/dtos';
import { ContentBlock, Section } from '@app/modules/page/domain/entities';
import { AppError, BaseUseCase, UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { UpdateContentBlockValidationSchema } from '../../infrastructure';
import { IPageRepository } from '../repositories';
import { logger } from '@app/utils';

export class UpdateBlockContentUseCase extends BaseUseCase<UpdateContentBlockDto, Section, AuthContext> {
    constructor(private readonly pageRepository: IPageRepository) {
        super();
    }

    async beforeExecute(input: UpdateContentBlockDto): Promise<void> {
        logger.debug("before", input)
        UpdateContentBlockValidationSchema.parse(input)
        logger.debug("Passed", input)
    }

    async execute(input: UpdateContentBlockDto, _context?: AuthContext): Promise<UsecaseResult<Section>> {
        const prev = await this.pageRepository.findSection(input.sectionId)

        if (!prev.blocks[input.key]) {
            throw AppError.conflict(
                `Block with key ${input.key} does not exists on section ${prev.name}`
            )
        }
        const updatedBlocks: Record<string, ContentBlock> = {
            ...prev.blocks,
            [input.key]: { ...prev.blocks[input.key], ...input.block },
        }
        const section = await this.pageRepository.updateSection(input.sectionId, { blocks: updatedBlocks });
        return {
            success: true,
            message: 'Block Updated successfully.',
            status: 201,
            data: section
        };
    }
}