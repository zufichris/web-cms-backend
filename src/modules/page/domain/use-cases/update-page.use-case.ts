
import { UpdatePageDto } from '@app/modules/page/application/dtos';
import { Page } from '@app/modules/page/domain/entities';
import { BaseUseCase } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { logger } from '@app/utils/logger';
import { IPageRepository } from '../repositories';
import { UpdatePageValidationSchemaBody } from '../../infrastructure';

export class UpdatePageUseCase extends BaseUseCase<UpdatePageDto, Page, AuthContext> {
    constructor(private readonly pageRepository: IPageRepository) {
        super();
    }

    async beforeExecute(input: UpdatePageDto, context: AuthContext): Promise<void> {
        UpdatePageValidationSchemaBody.parse(input);
        await this.pageRepository.findById(input.id);
    }

    async execute(input: UpdatePageDto, context?: AuthContext): Promise<UsecaseResult<Page>> {
        const { id, ...updateData } = input;
        if (input.sections) {
            delete input.sections
        }
        const entity = await this.pageRepository.update(id, { ...updateData, sections: [] });
        return {
            success: true,
            message: 'Page updated successfully.',
            status: 200,
            data: entity
        };
    }
}