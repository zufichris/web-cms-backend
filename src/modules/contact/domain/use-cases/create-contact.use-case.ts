
import { CreateContactDto } from '@app/modules/contact/application/dtos';
import { Contact } from '@app/modules/contact/domain/entities';
import { BaseUseCase, UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { logger } from '@app/utils';
import { CreateContactValidationSchema } from '../../infrastructure';
import { IContactRepository } from '../repositories';

export class CreateContactUseCase extends BaseUseCase<CreateContactDto, Contact, AuthContext> {
    constructor(private readonly contactRepository: IContactRepository) {
        super();
    }
    
    async beforeExecute(input: CreateContactDto): Promise<void> {
        CreateContactValidationSchema.parse(input);
    }
    
    async execute(input: CreateContactDto, context?: AuthContext): Promise<UsecaseResult<Contact>> {
        const entity = await this.contactRepository.create(input);
        return { 
            success: true, 
            message: 'Contact created successfully.', 
            status: 201, 
            data: entity 
        };
    }
}