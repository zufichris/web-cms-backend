
import { Model, Document } from 'mongoose';
import { IFomRepository } from '@app/modules/fom/domain/repositories';
import { Fom } from '@app/modules/fom/domain/entities';
import { MongoBaseRepository } from '@app/shared';
import { AppError } from '@app/shared';

export class MongoFomRepository extends MongoBaseRepository<Fom> implements IFomRepository {
    constructor(fomModel: Model<Fom & Document>) {
        super(fomModel);
    }
    
    async findByName(name: string): Promise<Fom> {
        const item = await this.model.findOne({ name });
        if (!item) {
            throw AppError.notFound('Fom not found');
        }
        return item;
    }
}