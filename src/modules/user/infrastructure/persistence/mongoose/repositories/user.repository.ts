
import { Model, Document } from 'mongoose';
import { IUserRepository } from '@app/modules/user/domain/repositories';
import { User } from '@app/modules/user/domain/entities';
import { MongoBaseRepository } from '@app/shared';
import { AppError } from '@app/shared';

export class MongooseUserRepository extends MongoBaseRepository<User> implements IUserRepository {
    constructor(model: Model<User & Document>) {
        super(model);
    }
    async findByName(name: string): Promise<User> {
        const user = await this.model.findOne({ name });
        if (!user) {
            throw AppError.notFound('User not found');
        }
        return user;
    }
    async findByEmail(email: string): Promise<User> {
        const user = await this.model.findOne({ email });
        if (!user) {
            throw AppError.notFound('User not found');
        }
        return user;
    }
}