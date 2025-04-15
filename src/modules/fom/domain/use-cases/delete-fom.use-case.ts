
import { BaseUseCase, ParamIdValidationSchema } from '@app/shared';
import { AuthContext } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { IFomRepository } from '../repositories';

export class DeleteFomUseCase extends BaseUseCase<string, boolean, AuthContext> {
    constructor(private readonly fomRepository: IFomRepository) {
        super();
    }
    
    async beforeExecute(id: string, context?: AuthContext): Promise<void> {
        ParamIdValidationSchema.parse(id);
        await this.fomRepository.findById(id);
    }
    
    async execute(id: string, context?: AuthContext): Promise<UsecaseResult<boolean>> {
        await this.fomRepository.delete(id);
        return { 
            success: true, 
            message: 'Fom deleted successfully.', 
            status: 200, 
            data: true 
        };
    }
}