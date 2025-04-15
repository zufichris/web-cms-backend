
import { Contact } from '@app/modules/contact/domain/entities';
import { BaseUseCase, ParamIdValidationSchema } from '@app/shared';
import { AuthContext } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';
import { IContactRepository } from '../repositories';

export class GetContactUseCase extends BaseUseCase<string, Contact, AuthContext> {
    constructor(private readonly contactRepository: IContactRepository) {
        super();
    }
    
    async beforeExecute(id: string): Promise<void> {
        ParamIdValidationSchema.parse(id);
    }
    
    async execute(id: string, context?: AuthContext): Promise<UsecaseResult<Contact>> {
        try {
            const entity = await this.contactRepository.findById(id);
            return { 
                success: true, 
                message: 'Contact retrieved successfully.', 
                status: 200, 
                data: entity 
            };
        } catch (error) {
            logger.error(this.constructor.name.concat(":Failed"), { error, id, context });
            throw error;
        }
    }
}