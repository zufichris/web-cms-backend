import { IBaseRepository } from '@app/shared';
import { User } from '@app/modules/user/domain/entities';

export interface IUserRepository extends IBaseRepository<User> {
    findByName(name: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
}