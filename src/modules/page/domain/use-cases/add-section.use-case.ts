
import { AddPageSectionDto } from '@app/modules/page/application/dtos';
import { Section } from '@app/modules/page/domain/entities';
import { AppError, BaseUseCase, UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { AddPageSectionValidationSchema } from '../../infrastructure';
import { IPageRepository } from '../repositories';

export class AddPageSectionUseCase extends BaseUseCase<AddPageSectionDto, Section, AuthContext> {
    constructor(private readonly pageRepository: IPageRepository) {
        super();
    }

    async beforeExecute(input: AddPageSectionDto): Promise<void> {
        AddPageSectionValidationSchema.parse(input)
        const exists = await this.pageRepository.findSection(input.slug).catch(_ => { })
        if (exists) {
            throw AppError.conflict(`Section with slug "${input.slug}" already exists`)
        }
    }

    async execute(input: AddPageSectionDto, _context?: AuthContext): Promise<UsecaseResult<Section>> {
        const section = await this.pageRepository.addSection(input);
        return {
            success: true,
            message: 'Section Added successfully.',
            status: 201,
            data: section
        };
    }
}