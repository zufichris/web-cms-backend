
import { AddContentBlockDto } from '@app/modules/page/application/dtos';
import { ContentBlock } from '@app/modules/page/domain/entities';
import { BaseUseCase, UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { AddContentBlockValidationSchema } from '../../infrastructure';
import { IPageRepository } from '../repositories';

export class AddBlockContentUseCase extends BaseUseCase<AddContentBlockDto, ContentBlock[], AuthContext> {
    constructor(private readonly pageRepository: IPageRepository) {
        super();
    }

    async beforeExecute(input: AddContentBlockDto): Promise<void> {
        console.log("first", input)
        AddContentBlockValidationSchema.parse(input)
    }

    async execute(input: AddContentBlockDto, _context?: AuthContext): Promise<UsecaseResult<ContentBlock[]>> {
        const section = await this.pageRepository.updateSection(input.sectionId, { blocks: [input.block] });
        return {
            success: true,
            message: 'Blocks added successfully.',
            status: 201,
            data: section.blocks
        };
    }
}