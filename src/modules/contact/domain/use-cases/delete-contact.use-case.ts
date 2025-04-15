
import { BaseUseCase, ParamIdValidationSchema } from '@app/shared';
import { AuthContext } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { IContactRepository } from '../repositories';

export class DeleteContactUseCase extends BaseUseCase<string, boolean, AuthContext> {
    constructor(private readonly contactRepository: IContactRepository) {
        super();
    }
    
    async beforeExecute(id: string, context?: AuthContext): Promise<void> {
        ParamIdValidationSchema.parse(id);
        await this.contactRepository.findById(id);
    }
    
    async execute(id: string, context?: AuthContext): Promise<UsecaseResult<boolean>> {
        await this.contactRepository.delete(id);
        return { 
            success: true, 
            message: 'Contact deleted successfully.', 
            status: 200, 
            data: true 
        };
    }
}