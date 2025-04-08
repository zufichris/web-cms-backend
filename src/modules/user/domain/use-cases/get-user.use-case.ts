
import { User } from '@app/modules/user/domain/entities';
import { BaseUserUseCase } from '@app/modules/user/domain/use-cases/base';
import { AppError } from '@app/shared';
import { AuthContext } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';

export class GetUserUseCase extends BaseUserUseCase<string, User> {
    async execute(id: string, context?: AuthContext): Promise<UsecaseResult<User>> {
        try {
            const entity = await this.userRepository.findById(id);
            if (!entity) {
                logger.warn(`[${this.constructor.name}] User not found`, { id, context });
                throw AppError.notFound(`User with id '${id}' not found`);
            }
            logger.info(`[${this.constructor.name}] Retrieved User`, { id, context });
            return { success: true, message: 'User retrieved successfully.', status: 200, data: entity };
        } catch (error) {
            logger.error(`[${this.constructor.name}] Failed to get User`, { error, id, context });
            throw error;
        }
    }
}