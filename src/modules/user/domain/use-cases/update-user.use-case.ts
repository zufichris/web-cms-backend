
import { UpdateUserDto } from '@app/modules/user/application/dtos';
import { User } from '@app/modules/user/domain/entities';
import { BaseUserUseCase } from '@app/modules/user/domain/use-cases/base';
import { AppError } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { logger } from '@app/utils/logger';

export class UpdateUserUseCase extends BaseUserUseCase<UpdateUserDto, User> {
    async execute(input: UpdateUserDto, context?: AuthContext): Promise<UsecaseResult<User>> {
        try {
            const { id, ...updateData } = input;
            const entity = await this.userRepository.update(id, updateData);
            if (!entity) {
                logger.warn(`[${this.constructor.name}] User not found`, { id, context });
                throw AppError.notFound(`User with id '${id}' not found`);
            }
            logger.info(`[${this.constructor.name}] Updated User`, { id, context });
            return { success: true, message: 'User updated successfully.', status: 200, data: entity };
        } catch (error) {
            logger.error(`[${this.constructor.name}] Failed to update User`, { error, input, context });
            throw error;
        }
    }
}