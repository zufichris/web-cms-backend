
import { BaseUseCase, ParamIdValidationSchema } from '@app/shared';
import { AuthContext } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { IPageRepository } from '../repositories';

export class DeletePageUseCase extends BaseUseCase<string, boolean, AuthContext> {
    constructor(private readonly pageRepository: IPageRepository) {
        super();
    }

    async beforeExecute(id: string, _context?: AuthContext): Promise<void> {
        ParamIdValidationSchema.parse(id);
        await this.pageRepository.findById(id);
    }

    async execute(id: string, _context?: AuthContext): Promise<UsecaseResult<boolean>> {
        await this.pageRepository.delete(id);
        return {
            success: true,
            message: 'Page deleted successfully.',
            status: 200,
            data: true
        };
    }
}