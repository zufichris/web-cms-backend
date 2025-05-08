
import { CreatePageDto } from '@app/modules/page/application/dtos';
import { Page } from '@app/modules/page/domain/entities';
import { AppError, BaseUseCase, UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { CreatePageValidationSchema } from '../../infrastructure';
import { IPageRepository } from '../repositories';

export class CreatePageUseCase extends BaseUseCase<CreatePageDto, Page, AuthContext> {
    constructor(private readonly pageRepository: IPageRepository) {
        super();
    }

    async beforeExecute(input: CreatePageDto): Promise<void> {
        CreatePageValidationSchema.parse(input)
        const exists = await this.pageRepository.findOne({ filters: { slug: input.slug } }).catch(_ => { })
        if (exists) {
            throw AppError.conflict(`Page with slug "${input.slug}" already exists`)
        }
    }

    async execute(input: CreatePageDto, _context?: AuthContext): Promise<UsecaseResult<Page>> {
        const page = await this.pageRepository.create(input as unknown as Page);
        return {
            success: true,
            message: 'Page created successfully.',
            status: 201,
            data: page
        };
    }
}