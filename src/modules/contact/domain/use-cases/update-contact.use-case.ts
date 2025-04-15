
import { UpdateContactDto } from '@app/modules/contact/application/dtos';
import { Contact } from '@app/modules/contact/domain/entities';
import { BaseUseCase } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { logger } from '@app/utils/logger';
import { IContactRepository } from '../repositories';
import { UpdateContactValidationSchemaBody } from '../../infrastructure';

export class UpdateContactUseCase extends BaseUseCase<UpdateContactDto, Contact, AuthContext> {
    constructor(private readonly contactRepository: IContactRepository) {
        super();
    }

    async beforeExecute(input: UpdateContactDto, context: AuthContext): Promise<void> {
        UpdateContactValidationSchemaBody.parse(input);
        await this.contactRepository.findById(input.id);
    }
    
    async execute(input: UpdateContactDto, context?: AuthContext): Promise<UsecaseResult<Contact>> {
        const { id, ...updateData } = input;
        const entity = await this.contactRepository.update(id, updateData);
        return { 
            success: true, 
            message: 'Contact updated successfully.', 
            status: 200, 
            data: entity 
        };
    }
}