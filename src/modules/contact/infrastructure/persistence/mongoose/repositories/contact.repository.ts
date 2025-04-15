
import { Model, Document } from 'mongoose';
import { IContactRepository } from '@app/modules/contact/domain/repositories';
import { Contact } from '@app/modules/contact/domain/entities';
import { MongoBaseRepository } from '@app/shared';
import { AppError } from '@app/shared';

export class MongoContactRepository extends MongoBaseRepository<Contact> implements IContactRepository {
    constructor(contactModel: Model<Contact & Document>) {
        super(contactModel);
    }
    
    async findByName(name: string): Promise<Contact> {
        const item = await this.model.findOne({ name });
        if (!item) {
            throw AppError.notFound('Contact not found');
        }
        return item;
    }
}