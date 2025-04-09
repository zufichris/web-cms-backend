
import { UpdateUserDto } from '@app/modules/user/application/dtos';
import { User } from '@app/modules/user/domain/entities';
import { AppError, BaseUseCase } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { logger } from '@app/utils/logger';
import { IUserRepository } from '../repositories';
import { UpdateUserValidationSchemaBody } from '../../infrastructure';

export class UpdateUserUseCase extends BaseUseCase<UpdateUserDto, User, AuthContext> {
    constructor(private readonly userRepository: IUserRepository) {
        super()
    }

    async beforeExecute(input: UpdateUserDto): Promise<void> {
        UpdateUserValidationSchemaBody.parse(input)
    }
    async execute(input: UpdateUserDto, context?: AuthContext): Promise<UsecaseResult<User>> {
        const { id, ...updateData } = input;
        const entity = await this.userRepository.update(id, updateData);
        if (!entity) {
            logger.warn(`[${this.constructor.name}] User not found`, { id, context });
            throw AppError.notFound(`User with id '${id}' not found`);
        }
        logger.info(`[${this.constructor.name}] Updated User`, { id, context });
        return { success: true, message: 'User updated successfully.', status: 200, data: entity };
    }
}